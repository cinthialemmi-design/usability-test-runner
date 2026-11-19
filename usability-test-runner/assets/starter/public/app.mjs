import {runStudy} from './engine.mjs';
try {
  const response = await fetch('/api/config',{cache:'no-store'});
  if (!response.ok) throw Error('Configuração indisponível.');
  const config = await response.json();
  document.title = config.title;
  document.querySelector('#study-title').textContent = config.title;
  document.querySelector('#study-brand').textContent = config.brand.label || config.title;
  document.querySelector('#study-environment').textContent = config.environment === 'pilot' ? 'Piloto · dados fictícios' : 'Pesquisa';
  for (const href of config.brand.stylesheets) {
    if (document.querySelector(`link[href="${href}"]`)) continue;
    await new Promise((resolve,reject) => {
      const link=document.createElement('link');link.rel='stylesheet';link.href=href;
      link.onload=resolve;link.onerror=()=>reject(Error('Estilos do protótipo indisponíveis.'));document.head.append(link);
    });
  }
  const root=document.querySelector('#prototype-mount');root.id=config.prototype.rootSelector.slice(1);
  const {createAdapter}=await import('/'+config.prototype.adapter);
  const adapter=createAdapter(root,{config});adapter.render();adapter.stop();
  await runStudy({config,adapter,root});
} catch (error) {
  document.querySelector('#sync-status').textContent='Não foi possível abrir o estudo: '+error.message;
}
