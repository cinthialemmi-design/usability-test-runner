"""Exercise the configurable contract without a browser, network or real study."""
import copy
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

VALIDATOR = Path(__file__).with_name('validate_project.py')


def project(domain='rooms'):
    return {
        'schemaVersion': '2', 'studyId': domain, 'studyRevision': '1',
        'prototypeRevision': 'p1', 'locale': 'pt-BR', 'title': 'Exemplo',
        'collectionMode': 'preview', 'environment': 'pilot', 'collectorEndpoint': None,
        'brand': {'bundleId': domain + '-brand-v1', 'source': 'prototype'},
        'prototype': {
            'rootSelector': '#product', 'adapter': 'prototype/adapter.js',
            'screens': [{'screenId': 'start', 'label': 'Início'}, {'screenId': 'done', 'label': 'Fim'}],
            'allowedStateKeys': ['saved'], 'allowedActionIds': ['save'], 'allowedEventFields': ['ok']
        },
        'consent': {'version': 'c1', 'visualCaptureVersion': 'v1', 'controller': None, 'retentionDays': None},
        'variants': [{'variantId': 'layout-a', 'entry': 'prototype/index.html'}],
        'assignment': {'method': 'fixed', 'variantId': 'layout-a'},
        'scenarios': [{'scenarioId': 'clean', 'fixtureKey': 'empty'}],
        'tasks': [{
            'taskId': 'save-task', 'scenario': 'Guarde o item para consultar depois.',
            'entry': {'screenId': 'start', 'scenarioId': 'clean', 'continuity': 'reset'},
            'completionMode': 'participant',
            'successCriterion': {'all': [
                {'event': {'type': 'action', 'actionId': 'save', 'where': {'ok': True}}},
                {'state': {'saved': True}}
            ]},
            'postTaskQuestions': [{'questionId': 'ease', 'type': 'scale', 'min': 1, 'max': 7}],
            'timing': {'excludeScreens': []}
        }],
        'visual': {
            'enabled': True, 'heatmaps': True, 'replay': True,
            'captureSchemaVersion': '1', 'rendererBundleId': domain + '-renderer-v1',
            'privacy': {
                'textPolicy': 'static-allowlist', 'staticTextAllowlist': ['Início', 'Salvar'],
                'maskSelectors': ['[data-user-content]'], 'excludeSelectors': ['[data-research-exclude]']
            },
            'limits': {'maxFrames': 600, 'maxPoints': 3000, 'maxTreeBytes': 8388608}
        }
    }


class ContractTests(unittest.TestCase):
    def run_config(self, config):
        with tempfile.TemporaryDirectory(prefix='usability-contract-') as folder:
            path = Path(folder) / 'study.json'
            path.write_text(json.dumps(config, ensure_ascii=False))
            return subprocess.run([sys.executable, str(VALIDATOR), str(path)], capture_output=True, text=True)

    def assert_invalid(self, mutate, diagnostic):
        config = project()
        mutate(config)
        result = self.run_config(config)
        self.assertEqual(result.returncode, 1, result.stderr + result.stdout)
        self.assertIn(diagnostic, result.stdout)

    def test_two_domains_and_task_counts_use_the_same_contract(self):
        for domain in ['rooms', 'learning']:
            config = project(domain)
            if domain == 'learning':
                second = copy.deepcopy(config['tasks'][0])
                second['taskId'] = 'review'
                second['entry']['continuity'] = 'preserve'
                second['entry']['carryFromTaskId'] = 'save-task'
                second['successCriterion'] = {'manual': True}
                second['manualReview'] = True
                second['moderatorRubric'] = 'Avaliar a explicação do objetivo, sem exigir um caminho único.'
                config['tasks'].append(second)
            result = self.run_config(config)
            self.assertEqual(result.returncode, 0, result.stderr + result.stdout)

    def test_unknown_screen_is_rejected(self):
        self.assert_invalid(lambda c: c['tasks'][0]['entry'].update(screenId='missing'), 'screenId')

    def test_duplicate_task_is_rejected(self):
        self.assert_invalid(lambda c: c['tasks'].append(copy.deepcopy(c['tasks'][0])), 'taskId')

    def test_variant_assignment_must_reference_the_catalog(self):
        self.assert_invalid(lambda c: c['assignment'].update(variantId='other'), 'variantId')

    def test_visual_capture_requires_its_consent_version(self):
        self.assert_invalid(lambda c: c['consent'].pop('visualCaptureVersion'), 'visualCaptureVersion')

    def test_derived_text_cannot_use_capture_all_as_policy(self):
        self.assert_invalid(lambda c: c['visual']['privacy'].update(textPolicy='capture-all'), 'textPolicy')

    def test_visual_limits_are_required_and_positive(self):
        self.assert_invalid(lambda c: c['visual']['limits'].update(maxFrames=0), 'maxFrames')

    def test_unknown_predicate_and_state_key_are_rejected(self):
        self.assert_invalid(lambda c: c['tasks'][0].update(successCriterion={'eval': 'run()'}), 'successCriterion')
        self.assert_invalid(lambda c: c['tasks'][0].update(successCriterion={'state': {'privateText': 'secret'}}), 'allowedStateKeys')

    def test_preserved_state_must_reference_an_earlier_task(self):
        def change(config):
            config['tasks'][0]['entry'].update(continuity='preserve', carryFromTaskId='save-task')
        self.assert_invalid(change, 'carryFromTaskId')

    def test_manual_criterion_requires_explicit_review(self):
        self.assert_invalid(lambda c: c['tasks'][0].update(successCriterion={'manual': True}), 'manualReview')

    def test_connected_mode_requires_real_configuration(self):
        self.assert_invalid(lambda c: c.update(collectionMode='connected'), 'collectorEndpoint')
        config = project()
        config.update(collectionMode='connected', environment='live', collectorEndpoint='/api/study')
        config['consent'].update(controller='Equipe de pesquisa de exemplo', retentionDays=30)
        result = self.run_config(config)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_nonvisual_project_is_supported(self):
        config = project()
        config['visual'] = {'enabled': False, 'heatmaps': False, 'replay': False}
        config['consent'].pop('visualCaptureVersion')
        result = self.run_config(config)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_malformed_json_is_a_diagnostic_not_a_traceback(self):
        with tempfile.TemporaryDirectory(prefix='usability-contract-') as folder:
            path = Path(folder) / 'bad.json'
            path.write_text('{broken')
            result = subprocess.run([sys.executable, str(VALIDATOR), str(path)], capture_output=True, text=True)
            self.assertEqual(result.returncode, 1)
            self.assertNotIn('Traceback', result.stderr)

    def test_invalid_reference_types_produce_diagnostics(self):
        for mutate in [
            lambda c: c['assignment'].update(variantId={}),
            lambda c: c['tasks'][0]['entry'].update(screenId=[]),
            lambda c: c['tasks'][0].update(successCriterion={'event': {'type': 'action', 'actionId': {}}})
        ]:
            config = project()
            mutate(config)
            result = self.run_config(config)
            self.assertEqual(result.returncode, 1)
            self.assertNotIn('Traceback', result.stderr)
            self.assertTrue(result.stdout.strip())

    def test_scenario_requires_a_fixture_reference(self):
        self.assert_invalid(lambda c: c['scenarios'][0].pop('fixtureKey'), 'fixtureKey')

    def test_assignment_cannot_disable_persistence(self):
        self.assert_invalid(lambda c: c['assignment'].update(persistOnResume=False), 'persistOnResume')

    def test_human_review_requires_its_rubric(self):
        def change(config):
            config['tasks'][0].update(successCriterion={'manual': True}, manualReview=True)
        self.assert_invalid(change, 'moderatorRubric')


if __name__ == '__main__':
    unittest.main()
