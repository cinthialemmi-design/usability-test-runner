// The portable contract is broader than this first executable reference profile.
// Reject unsupported choices instead of pretending their configuration implements them.
export function assertProfile(c) {
  const need = (ok, message) => { if (!ok) throw Error('Configuração: ' + message); };
  const identifier = x => typeof x === 'string' && /^[a-zA-Z0-9_.:-]{1,100}$/.test(x) && !['__proto__','constructor','prototype'].includes(x);
  need(c.schemaVersion === '2' && c.runtimeProfile === 'starter-1', 'use schemaVersion 2 e runtimeProfile starter-1.');
  need(c.collectionMode === 'connected' && c.collectorEndpoint === '/api', 'este servidor usa coleta conectada em /api.');
  need(['pilot','live'].includes(c.environment), 'environment deve ser pilot ou live.');
  for (const k of ['studyId','studyRevision','prototypeRevision']) need(identifier(c[k]), k + ' inválido.');
  need(typeof c.title === 'string' && c.title.length > 0, 'título obrigatório.');
  need(c.assignment?.method === 'fixed' && c.assignment.persistOnResume === true, 'perfil inicial suporta atribuição fixed persistida.');
  need(c.variants?.length === 1 && c.variants[0].variantId === c.assignment.variantId, 'perfil inicial suporta uma variante.');
  need(/^#[a-zA-Z][\w-]*$/.test(c.prototype?.rootSelector), 'rootSelector precisa ser um #id simples.');
  need(/^[\w/-]+\.mjs$/.test(c.prototype.adapter) && !c.prototype.adapter.includes('..'), 'adaptador local .mjs obrigatório.');
  need(c.prototype.screens?.length > 0 && c.scenarios?.length > 0 && c.tasks?.length > 0, 'telas, cenários e tarefas obrigatórios.');
  const catalog = (values, field) => {
    need(Array.isArray(values) && values.every(v => identifier(v[field])), 'catálogo inválido: ' + field);
    const ids = values.map(v => v[field]); need(new Set(ids).size === ids.length, 'IDs repetidos: ' + field); return new Set(ids);
  };
  catalog(c.variants, 'variantId');
  const screens = catalog(c.prototype.screens, 'screenId'), scenarios = catalog(c.scenarios, 'scenarioId');
  catalog(c.tasks, 'taskId');
  for (const k of ['allowedStateKeys','allowedActionIds','allowedEventFields']) {
    need(Array.isArray(c.prototype[k]) && c.prototype[k].every(identifier), k + ' inválido.');
  }
  need(c.consent?.controller && Number.isInteger(c.consent.retentionDays) && c.consent.retentionDays > 0, 'responsável e retenção obrigatórios.');
  need(identifier(c.consent.version) && identifier(c.consent.visualCaptureVersion), 'versões de consentimento obrigatórias.');
  if (c.environment === 'live') {
    need(c.exampleOnly === false && c.consent.readyForResearch === true, 'revise responsável/aviso e confirme consent.readyForResearch antes de coleta real.');
    need(typeof c.consent.contact === 'string' && c.consent.contact.trim(), 'informe consent.contact na pesquisa real.');
  }
  function criterion(rule, questions) {
    need(rule && Object.keys(rule).length === 1, 'critério exige exatamente um operador.');
    if (rule.all || rule.any) {
      const list = rule.all || rule.any; need(Array.isArray(list) && list.length, 'composição vazia.');
      list.forEach(r => criterion(r, questions));
    } else if (rule.state) {
      need(Object.entries(rule.state).length > 0 && Object.entries(rule.state).every(([k,v]) => c.prototype.allowedStateKeys.includes(k) && typeof v === 'boolean'), 'este perfil admite estados booleanos permitidos.');
    } else if (rule.event) {
      const e = rule.event;
      need(['action','screen_view','state_change'].includes(e.type), 'tipo de evento no critério não suportado.');
      need(!e.screenId || screens.has(e.screenId), 'tela do critério inexistente.');
      need(!e.actionId || c.prototype.allowedActionIds.includes(e.actionId), 'ação do critério inexistente.');
      need(Object.entries(e.where || {}).every(([k,v]) => c.prototype.allowedEventFields.includes(k) && typeof v === 'boolean'), 'where aceita campos booleanos permitidos.');
    } else if (rule.answer) need(questions.some(q => q.questionId === rule.answer.questionId), 'pergunta do critério inexistente.');
    else need(rule.manual === true, 'operador de critério não suportado.');
  }
  c.tasks.forEach((t,i) => {
    need(typeof t.title === 'string' && typeof t.scenario === 'string', 'título e cenário da tarefa obrigatórios.');
    need(t.completionMode === 'participant', 'perfil inicial usa completionMode participant.');
    need(screens.has(t.entry?.screenId) && scenarios.has(t.entry?.scenarioId), 'entrada da tarefa inexistente.');
    need(t.entry.continuity === 'reset' || (t.entry.continuity === 'preserve' && c.tasks.slice(0,i).some(p => p.taskId === t.entry.carryFromTaskId)), 'continuidade inválida.');
    need(!t.manualReview || typeof t.moderatorRubric === 'string', 'avaliação humana exige rubrica.');
    need((t.timing?.excludeScreens || []).every(s => screens.has(s)), 'tela excluída do tempo inexistente.');
    const questions = t.postTaskQuestions || []; catalog(questions, 'questionId');
    questions.forEach(q => {
      need(['scale','text'].includes(q.type) && typeof q.prompt === 'string', 'perfil inicial admite perguntas text e scale.');
      if (q.type === 'scale') need(Number.isInteger(q.min) && Number.isInteger(q.max) && q.max >= q.min && q.max - q.min <= 10, 'escala deve ter até 11 opções inteiras.');
    });
    criterion(t.successCriterion, questions);
    const manual=r=>r.manual===true||(r.all||r.any||[]).some(manual);
    need(!manual(t.successCriterion)||t.manualReview===true, 'critério manual exige manualReview.');
  });
  need(c.visual && typeof c.visual.enabled === 'boolean', 'configuração visual obrigatória.');
  need(!c.visual.heatmaps || c.visual.enabled, 'mapas exigem captura habilitada.');
  need(!c.visual.replay || c.visual.enabled, 'replay exige captura habilitada.');
  const p = c.visual.privacy;
  need(p?.textPolicy === 'static-allowlist', 'política visual deve ser static-allowlist.');
  for (const k of ['staticTextAllowlist','maskSelectors','excludeSelectors','allowedClasses','allowedIds']) need(Array.isArray(p[k]) && p[k].every(x => typeof x === 'string'), 'lista de privacidade ausente: ' + k);
  for (const k of ['maxFrames','maxPoints','maxTreeBytes']) need(Number.isInteger(c.visual.limits?.[k]) && c.visual.limits[k] > 0, 'limite inválido: ' + k);
  need(Array.isArray(c.brand?.stylesheets) && c.brand.stylesheets.length, 'brand.stylesheets obrigatório.');
}

export function participantConfig(config) {
  const publicConfig = structuredClone(config);
  for (const task of publicConfig.tasks) { delete task.successCriterion; delete task.moderatorRubric; }
  delete publicConfig.researchObjective; delete publicConfig.decisionToSupport;
  return publicConfig;
}
