"""Validate the portable study configuration; standard library only.

This checks configuration consistency, not the prototype, remote services,
consent adequacy, masking effectiveness or capture implementation.
"""
import json
from pathlib import Path
import re
import sys
from urllib.parse import urlparse

ID = re.compile(r'^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$')


def validate(config):
    errors = []

    def check(ok, path, message):
        if not ok:
            errors.append(f'{path}: {message}')

    def obj(value, path):
        check(isinstance(value, dict), path, 'objeto obrigatório')
        return value if isinstance(value, dict) else {}

    def text(value):
        return isinstance(value, str) and bool(value.strip())

    def registered(value, identities):
        return isinstance(value, str) and value in identities

    def string_list(value, path, nonempty=False):
        ok = isinstance(value, list) and all(text(x) for x in value)
        check(ok and (not nonempty or bool(value)), path, 'lista de textos obrigatória')
        return value if ok else []

    def catalog(value, key, path):
        check(isinstance(value, list) and bool(value), path, 'catálogo não vazio obrigatório')
        result = set()
        for index, item in enumerate(value if isinstance(value, list) else []):
            item = obj(item, f'{path}[{index}]')
            identity = item.get(key)
            valid = isinstance(identity, str) and ID.fullmatch(identity)
            check(valid, f'{path}[{index}].{key}', 'ID estável obrigatório')
            if valid:
                check(identity not in result, f'{path}[{index}].{key}', 'ID duplicado')
                result.add(identity)
        return result

    config = obj(config, 'config')
    check(config.get('schemaVersion') == '2', 'schemaVersion', 'esta versão requer o contrato 2; migre explicitamente')
    for key in ['studyId', 'studyRevision', 'prototypeRevision', 'locale', 'title']:
        check(text(config.get(key)), key, 'texto obrigatório')
    mode = config.get('collectionMode')
    check(mode in ['preview', 'connected', 'manual'], 'collectionMode', 'modo inválido')
    check(config.get('environment') in ['pilot', 'live'], 'environment', 'use pilot ou live')
    brand = obj(config.get('brand'), 'brand')
    check(text(brand.get('bundleId')), 'brand.bundleId', 'bundle versionado obrigatório')
    check(brand.get('source') in ['prototype', 'assets'], 'brand.source', 'use prototype ou assets')
    prototype = obj(config.get('prototype'), 'prototype')
    for key in ['rootSelector', 'adapter']:
        check(text(prototype.get(key)), 'prototype.' + key, 'texto obrigatório')
    screens = catalog(prototype.get('screens'), 'screenId', 'prototype.screens')
    state_keys = set(string_list(prototype.get('allowedStateKeys'), 'prototype.allowedStateKeys'))
    action_ids = set(string_list(prototype.get('allowedActionIds'), 'prototype.allowedActionIds'))
    event_fields = set(string_list(prototype.get('allowedEventFields'), 'prototype.allowedEventFields'))
    variants = catalog(config.get('variants'), 'variantId', 'variants')
    for index, variant in enumerate(config.get('variants', []) if isinstance(config.get('variants'), list) else []):
        if isinstance(variant, dict):
            check(text(variant.get('entry')), f'variants[{index}].entry', 'entrada obrigatória')
    assignment = obj(config.get('assignment'), 'assignment')
    check(assignment.get('method') in ['fixed', 'random', 'balanced'], 'assignment.method', 'método inválido')
    check(assignment.get('persistOnResume', True) is True, 'assignment.persistOnResume', 'atribuição deve persistir na retomada')
    if assignment.get('method') == 'fixed':
        check(registered(assignment.get('variantId'), variants), 'assignment.variantId', 'referência ausente do catálogo')
    scenarios = catalog(config.get('scenarios'), 'scenarioId', 'scenarios')
    for index, scenario in enumerate(config.get('scenarios', []) if isinstance(config.get('scenarios'), list) else []):
        if isinstance(scenario, dict):
            check(text(scenario.get('fixtureKey')), f'scenarios[{index}].fixtureKey', 'referência de preparação obrigatória')
    consent = obj(config.get('consent'), 'consent')
    check(text(consent.get('version')), 'consent.version', 'versão obrigatória')
    if mode == 'connected':
        endpoint = config.get('collectorEndpoint')
        parsed = urlparse(endpoint) if isinstance(endpoint, str) else None
        relative = text(endpoint) and endpoint.startswith('/') and not endpoint.startswith('//')
        https = parsed and parsed.scheme == 'https' and bool(parsed.netloc) and not parsed.username and not parsed.password
        check(bool(relative or https), 'collectorEndpoint', 'use endpoint HTTPS ou caminho da mesma origem')
        check(text(consent.get('controller')), 'consent.controller', 'responsável obrigatório para coleta conectada')
        check(type(consent.get('retentionDays')) is int and consent['retentionDays'] > 0, 'consent.retentionDays', 'prazo positivo obrigatório')
        check(config.get('exampleOnly') is not True, 'exampleOnly', 'exemplo não pode ser coleta conectada')

    tasks = config.get('tasks')
    catalog(tasks, 'taskId', 'tasks')
    earlier = set()

    def predicate(rule, path, questions, completion_mode, depth=0):
        if depth > 8:
            check(False, path, 'critério excede oito níveis')
            return
        if not isinstance(rule, dict) or len(rule) != 1:
            check(False, path, 'use um operador por critério')
            return
        kind, value = next(iter(rule.items()))
        if kind in ['all', 'any']:
            check(isinstance(value, list) and bool(value), path, 'operador requer critérios não vazios')
            for index, child in enumerate(value if isinstance(value, list) else []):
                predicate(child, f'{path}.{kind}[{index}]', questions, completion_mode, depth + 1)
        elif kind == 'event':
            value = obj(value, path + '.event')
            check(value.get('type') in ['screen_view', 'action', 'state_change'], path, 'tipo observável inválido')
            if value.get('type') == 'screen_view':
                check(registered(value.get('screenId'), screens), path + '.screenId', 'tela não cadastrada')
            if value.get('type') == 'action':
                check(registered(value.get('actionId'), action_ids), path + '.actionId', 'ação não cadastrada em allowedActionIds')
            for key, expected in obj(value.get('where', {}), path + '.where').items():
                check(key in event_fields, path + '.where', 'campo não cadastrado em allowedEventFields')
                check(expected is None or type(expected) in [str, bool, int, float], path, 'valor escalar obrigatório')
        elif kind == 'state':
            value = obj(value, path + '.state')
            check(bool(value), path, 'estado esperado obrigatório')
            for key, expected in value.items():
                check(key in state_keys, path + '.state', 'campo não cadastrado em allowedStateKeys')
                check(expected is None or type(expected) in [str, bool, int, float], path, 'valor escalar obrigatório')
        elif kind == 'answer':
            value = obj(value, path + '.answer')
            check(registered(value.get('questionId'), questions), path + '.questionId', 'pergunta não cadastrada')
            check('equals' in value, path + '.equals', 'resposta esperada obrigatória')
            check(completion_mode == 'participant', path, 'critério com resposta requer encerramento pelo participante')
        elif kind == 'manual':
            check(value is True and depth == 0, path, 'manual deve ser critério raiz com valor true')
        else:
            check(False, path, 'operador desconhecido; não executar código da configuração')

    for index, raw in enumerate(tasks if isinstance(tasks, list) else []):
        task = obj(raw, f'tasks[{index}]')
        path = f'tasks[{index}]'
        check(text(task.get('scenario')), path + '.scenario', 'enunciado obrigatório')
        entry = obj(task.get('entry'), path + '.entry')
        check(registered(entry.get('screenId'), screens), path + '.entry.screenId', 'tela não cadastrada')
        check(registered(entry.get('scenarioId'), scenarios), path + '.entry.scenarioId', 'cenário não cadastrado')
        check(entry.get('continuity') in ['reset', 'preserve'], path + '.entry.continuity', 'regra inválida')
        if entry.get('continuity') == 'preserve':
            check(registered(entry.get('carryFromTaskId'), earlier), path + '.entry.carryFromTaskId', 'deve referenciar tarefa anterior')
        completion_mode = task.get('completionMode')
        check(completion_mode in ['observed', 'participant'], path + '.completionMode', 'modo inválido')
        questions = task.get('postTaskQuestions', [])
        question_ids = catalog(questions, 'questionId', path + '.postTaskQuestions') if questions else set()
        for question in questions if isinstance(questions, list) else []:
            if isinstance(question, dict) and question.get('type') == 'scale':
                low, high = question.get('min'), question.get('max')
                check(type(low) is int and type(high) is int and low < high, path + '.postTaskQuestions', 'escala inválida')
        rule = task.get('successCriterion')
        predicate(rule, path + '.successCriterion', question_ids, completion_mode)
        if isinstance(rule, dict) and rule.get('manual') is True:
            check(task.get('manualReview') is True, path + '.manualReview', 'avaliação humana deve ser explícita')
        if task.get('manualReview') is True:
            check(text(task.get('moderatorRubric')), path + '.moderatorRubric', 'rubrica obrigatória para avaliação humana')
        timing = obj(task.get('timing', {}), path + '.timing')
        for screen in string_list(timing.get('excludeScreens', []), path + '.timing.excludeScreens'):
            check(screen in screens, path + '.timing.excludeScreens', 'tela não cadastrada')
        if isinstance(task.get('taskId'), str):
            earlier.add(task['taskId'])

    visual = obj(config.get('visual'), 'visual')
    check(type(visual.get('enabled')) is bool, 'visual.enabled', 'booleano obrigatório')
    for key in ['heatmaps', 'replay']:
        check(type(visual.get(key)) is bool, 'visual.' + key, 'booleano obrigatório')
        check(not visual.get(key) or visual.get('enabled') is True, 'visual.' + key, 'requer captura habilitada')
    if visual.get('enabled') is True:
        for key in ['captureSchemaVersion', 'rendererBundleId']:
            check(text(visual.get(key)), 'visual.' + key, 'versão obrigatória')
        check(text(consent.get('visualCaptureVersion')), 'consent.visualCaptureVersion', 'aceite visual versionado obrigatório')
        privacy = obj(visual.get('privacy'), 'visual.privacy')
        check(privacy.get('textPolicy') == 'static-allowlist', 'visual.privacy.textPolicy', 'use lista de textos estáticos aprovados')
        string_list(privacy.get('staticTextAllowlist'), 'visual.privacy.staticTextAllowlist')
        string_list(privacy.get('maskSelectors'), 'visual.privacy.maskSelectors', True)
        string_list(privacy.get('excludeSelectors'), 'visual.privacy.excludeSelectors', True)
        limits = obj(visual.get('limits'), 'visual.limits')
        for key in ['maxFrames', 'maxPoints', 'maxTreeBytes']:
            check(type(limits.get(key)) is int and limits[key] > 0, 'visual.limits.' + key, 'inteiro positivo obrigatório')
    return errors


def main():
    if len(sys.argv) != 2:
        print('Uso: python3 validate_project.py estudo.config.json')
        return 2
    try:
        path = Path(sys.argv[1])
        if path.stat().st_size > 1048576:
            raise ValueError('arquivo excede 1 MiB')
        config = json.loads(path.read_text(encoding='utf-8'), parse_constant=lambda _: (_ for _ in ()).throw(ValueError('número inválido')))
        errors = validate(config)
    except (OSError, ValueError, RecursionError) as error:
        print('Configuração inválida: não foi possível ler JSON válido (' + type(error).__name__ + ').')
        return 1
    if errors:
        print('\n'.join(errors))
        return 1
    print('Configuração consistente. Protótipo, mascaramento, acesso e serviços ainda exigem verificação de execução.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
