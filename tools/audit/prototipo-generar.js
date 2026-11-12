#!/usr/bin/env node
/* Genera el PROTOTIPO navegable del Home inteligente (Subfase 3.5): BC + Z1 a Z5 integrados, con seis situaciones coherentes, DESDE las especificaciones ejecutables
 * de Z1, Z3 y Z4 (nada de texto ni de cifras escritas a mano). Es un prototipo de baja fidelidad con DATOS SIMULADOS: no es código de la aplicación, no se carga
 * desde index.html y no demuestra que Z1–Z5 funcionen con datos reales de FESA.
 *   docs/command-center/prototipo/home_3_5_prototipo.html  ·  docs/command-center/generated/PROTOTIPO_SITUACIONES.json
 * Uso: node tools/audit/prototipo-generar.js   (CC35_OUT cambia la raíz de salida, solo para que el verificador regenere y compare) */
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '../..'), D = path.join(process.env.CC35_OUT || R, 'docs/command-center');
const Z1 = require('./z1-lectura-ejecutiva.js'), Z3 = require('./z3-atencion.js'), Z4 = require('./z4-acciones.js'), S1 = require('./z1-escenarios.js'), S3 = require('./z3-escenarios.js'), S4 = require('./z4-escenarios.js'), W = require('./wf-common.js');
const esc = W.esc, z1in = (n) => S1.SCENARIOS.find((s) => s.n === n).input, k0 = S3.K(undefined), base7 = S3.base7(undefined), C = S4.C;
const CO = require('./coherencia-zonas.js'), Z5 = require('./z5-conjunto.js');
// Cada situación parte de una lectura de Z1 (escenarios de 3.2); Z3 y Z4 se DERIVAN de esa misma lectura (mismos importes, misma confiabilidad, mismas inconsistencias).
const SIT = [
  { id: 'alta', titulo: 'Confiabilidad alta · el negocio va por debajo del plan', z1: z1in(2) },
  { id: 'media', titulo: 'Confiabilidad media · crece, con avisos de datos', z1: z1in(4) },
  { id: 'baja', titulo: 'Confiabilidad baja · lectura preliminar', z1: z1in(5) },
  { id: 'insuficiente', titulo: 'Confiabilidad insuficiente · falta información', z1: z1in(6) },
  { id: 'sinactividad', titulo: 'Sin actividad · no se puede verificar nada', z1: z1in(7) },
  { id: 'enorden', titulo: 'Todo en orden · sin elementos que destacar', z1: z1in(3) }
].map((s) => {
  const o1 = Z1.build(s.z1), findings = CO.findingsFromZ1(s.z1, o1);
  const missing = findings.filter((f) => /^data_/.test(f.rule.family) && f.severity === 'critica' || f.rule.family === 'data_errores').map((f) => ({ label: f.title, view: 'calidad' }));
  const o3 = Z3.build({ findings, reliability: { level: o1.reliability.level }, missing }), actions = CO.actionsFromZ3(o3), o4 = Z4.build({ attention: o3, actions }), viol = CO.check(o1, o3, o4);
  if (viol.length) throw new Error(`La situación «${s.id}» tiene contradicciones entre capas: ${viol.join(' | ')}`);
  return { ...s, o1, o3, o4 };
});
const sitJson = SIT.map((s) => ({ id: s.id, titulo: s.titulo, z1Level: s.o1.reliability.level, z3Level: s.o3.level, z3Header: s.o3.header, z3Mode: s.o3.mode, z4Header: s.o4.header, z4Mode: s.o4.mode, z4Cards: s.o4.cards.map((c) => c.id), z3Cards: s.o3.cards.map((c) => c.id) }));
fs.mkdirSync(path.join(D, 'prototipo'), { recursive: true });
fs.writeFileSync(path.join(D, 'generated/PROTOTIPO_SITUACIONES.json'), JSON.stringify({ version: 1, subfase: '3.5', nota: 'Generado por tools/audit/prototipo-generar.js. No editar a mano. Datos simulados.', situaciones: sitJson }, null, 1));

/* ---------- Z2 (estructura de 3.1 §5; sin especificación ejecutable propia: usa solo lo que ya producen Z1 y Z3) ---------- */
function z2html(s) {
  const o = s.o1, e = o.economic, drv = s.o3.cards.find((c) => c.family === 'driver:cr'), can = s.o3.cards.find((c) => c.family.startsWith('channel_lag')), lvl = o.reliability.level;
  const p1 = e.primary && e.primary.kind === 'brecha' ? `La venta observada es ${esc(e.observed.display)} contra una meta acumulada de ${esc(e.plan.display)}: una brecha de ${esc(e.primary.display)}${o.comparability.growth ? ` y una evolución de ${esc(o.comparability.growth.display)} contra ${esc(o.comparability.growth.base)}` : `; la evolución no se valora (${esc(o.comparability.label.toLowerCase())})`}.` : e.primary ? `La venta observada es ${esc(e.observed.display)}; no hay una comparación válida y confiable contra el plan.` : 'No hay una venta observada válida que describir en este periodo.';
  const cert = ['<b>Cálculo</b>', '<b>Cálculo</b>', '<b>Cálculo, preliminar</b>', '<b>Hecho</b>'][['Alta', 'Media', 'Baja', 'Insuficiente'].indexOf(lvl)];
  let p2;
  if (lvl === 'Baja' || lvl === 'Insuficiente') p2 = 'Diagnóstico no concluyente: con esta confiabilidad solo se muestra lo observado.';
  else if (o.comparability.code !== 'valida') p2 = `Estado de atribución: ${esc(o.comparability.label)}. No hay puente de drivers ni porcentajes; se muestra la variación observada.`;
  else p2 = drv ? `${esc(drv.title)}. <i>Contribución matemática, no causa.</i>` : 'Sin puente de drivers disponible en esta situación.';
  const p3 = (lvl === 'Alta' || lvl === 'Media') && can ? esc(can.title) + '.' : lvl === 'Alta' || lvl === 'Media' ? 'Ningún canal concentra la brecha en esta situación.' : 'No se valora la concentración por canal con esta confiabilidad.';
  return `<section class="zb" data-wf-f="z2" id="z2" aria-labelledby="z2t"><div class="zb__h"><h2 class="zb__t" id="z2t">Qué ocurrió y por qué</h2><span class="tag tag--exist">Estructura de 3.1 §5 · sin especificación ejecutable propia</span></div>
<ol class="steps"><li data-wf-f="z2-ocurrio"><b>1 · Qué ocurrió</b> (${cert}) — ${p1}</li><li data-wf-f="z2-porque"><b>2 · Por qué</b> — ${p2}</li><li data-wf-f="z2-donde"><b>3 · Dónde se concentra</b> — ${p3}</li></ol>
<details class="ev" data-wf-f="z2-detalle-atribucion"><summary>Detalle metodológico y de atribución</summary><div>Método, orden de factores, contribución de cada factor, estado de atribución y cobertura de días comparados (<code>ATRIBUCION_FUENTE_DE_VERDAD.md</code> §4). En el prototipo no se simulan estos cálculos.</div></details>
<details class="ev"><summary>Hipótesis (aparte; nunca sostiene la conclusión)</summary><div>${drv && drv.hypotheses.length ? esc(drv.hypotheses[0].text) + ' Cómo validarla: ' + esc(drv.hypotheses[0].validation) : 'No hay hipótesis para esta situación.'}</div></details></section>`;
}
function z5html(s) {
  const o1 = s.o1, o3 = s.o3, o4 = s.o4, z5 = Z5.build({ o1, o3, o4 }), viol = Z5.check(z5, { o1, o3, o4 });
  if (viol.length) throw new Error('Z5 viola H-01/H-02 en «' + s.id + '»: ' + viol.join(' | '));   // el generador no emite una Z5 que contradiga la propiedad única ni las referencias
  const li = (t) => `<li>${t}</li>`;
  const crit = z5.critical.length ? `<div class="z5warn" role="note" data-wf-f="z5-advertencias"><b>Antes de interpretar:</b><ul>${z5.critical.map((c) => li(esc(c.text))).join('')}</ul></div>` : '';
  const opps = z5.opportunities.items.length ? `<ul class="z5opp">${z5.opportunities.items.map((x) => `<li data-ref-z3="${esc(x.ref.id)}" data-wf-f="z5-oportunidad"><b>${esc(x.title)}</b> · relevancia ${esc(x.relevance)} · ${esc(x.certainty)} · <a href="#z3">Ver el elemento en Z3 ▸</a>${x.actions.length ? ` · ${x.actions.length} acción(es) en Z4` : ''}</li>`).join('')}</ul>` : '';
  const extra = [`<li><b>Canales:</b> la tabla de cumplimiento por canal (≥ 2 canales) vive aquí al integrarse; no se simula en el prototipo.</li>`,
    `<li><b>Elementos descartados y retenidos:</b> ${[...o3.rejected.map((r) => 'Z3 · ' + r.id + ': ' + r.errors[0]), ...o4.rejected.map((r) => 'Z4 · ' + r.id + ': ' + r.errors[0]), ...(o3.withheld.note ? ['Z3 · ' + o3.withheld.note] : []), ...(o4.held.note ? ['Z4 · ' + o4.held.note] : [])].map(esc).join('; ') || 'ninguno'}.</li>`,
    `<li><b>Método y definiciones:</b> escalera de certeza (hecho, cálculo, contribución matemática, señal, estimación, hipótesis) y reglas de lectura; el Recorrido vive en la ayuda existente (D-04).</li>`];
  const LBL = { cifras: 'Cifras del periodo', fuentes: 'Fuentes', periodos: 'Periodos analizados', calculos: 'Cálculos y referencias', limitaciones: 'Limitaciones', faltante: 'Información faltante', confiabilidad: 'Confiabilidad' };
  return `<section class="zb" data-wf-f="z5" id="z5" aria-labelledby="z5t"><div class="zb__h"><h2 class="zb__t" id="z5t" tabindex="-1">${esc(z5.name)}</h2><span class="tag tag--exist">Aclaración H-02 de D-07 · tres niveles · evidencia secundaria</span></div>
${crit}<h3 class="z5h">Oportunidades</h3><p class="z5p" data-wf-f="z5-oportunidades">${esc(z5.opportunities.note)}</p>${opps}
<h3 class="z5h">Visión de conjunto</h3><ul class="z5ov" data-wf-f="z5-vision">${z5.overview.lines.map((l) => li(esc(l.text))).join('')}</ul>
<details class="ev" data-z5 data-wf-f="z5-evidencia"><summary>Evidencia y detalle</summary><div><ul>${z5.evidence.items.map((x) => li(`<b>${esc(LBL[x.kind] || x.kind)}:</b> ${esc(x.text)}`)).join('')}${extra.join('')}</ul></div></details></section>`;
}
const BCSTYLE = `.ce__l,.sv,.imp b,.dp b,.ac__k,.al b,.nl b,.tag,.ec__l,.ce__s,.tg,.cert{font-size:11px}
.skip{position:absolute;left:-999px;top:0;background:#fff;color:#000;padding:8px 12px;z-index:20;border:2px solid #000}.skip:focus{left:8px;top:8px}.h1{font-size:20px;margin:0}
.qa{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}.qa a,.qa button,.qa .qa__off{font:inherit;font-size:12px;border:1.5px solid var(--mark);background:#fff;color:var(--ink);padding:5px 10px;border-radius:14px;text-decoration:none;cursor:pointer;min-height:28px;display:inline-flex;align-items:center}.qa .qa__off{border-style:dashed;color:#555;cursor:default}.qa a:hover,.qa button:hover{background:var(--fill2)}
.bc{position:sticky;top:0;z-index:5;background:#fff;border:2px solid var(--mark);padding:6px 10px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:12px;margin:0 0 12px}.bc b{font-weight:800}.bc .cf{font-size:11px}
.proto{background:var(--mark);color:#fff;padding:6px 12px;font-size:12px;margin:-24px -24px 14px}.proto b{letter-spacing:.04em}
.sw{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px;align-items:center}.sw span{font-size:11px;color:var(--mu);margin-right:4px}.sw button{font:inherit;font-size:12px;border:1.5px solid var(--mark);background:#fff;padding:5px 12px;border-radius:14px;cursor:pointer}.sw button[aria-pressed=true]{background:var(--mark);color:#fff}
.page{max-width:1180px;margin:0 auto;display:grid;gap:14px}.page>section{min-width:0}[hidden]{display:none!important}.steps{margin:0;padding-left:0;list-style:none;display:grid;gap:6px;font-size:13px}.steps li{padding:4px 0}
.toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:var(--mark);color:#fff;padding:8px 16px;font-size:12px;border-radius:4px;display:none;z-index:9;max-width:90vw}.toast[data-on=true]{display:block}
button:focus-visible,summary:focus-visible,[role=button]:focus-visible,a:focus-visible{outline:3px solid #000;outline-offset:2px}.lk[role=button]{cursor:pointer;text-decoration:underline}.nl[hidden]{display:none}
.z5opp a{display:inline-block;min-height:24px;line-height:24px}.z5opp li{margin:2px 0}.z5h{font-size:13px;margin:10px 0 4px}.z5p,.z5ov,.z5opp{font-size:12px;margin:2px 0}.z5warn{border:2px solid var(--mark);padding:6px 8px;font-size:12px;margin:6px 0}.z5warn ul{margin:2px 0 0;padding-left:18px}.zb__t{margin:0}@media(max-width:700px){.ac__go{align-self:stretch;min-height:36px}body{padding:12px}.proto{margin:-12px -12px 10px}}`;
const uid = (s, html) => html.replace(/ id="(z\d)"/g, (m, z) => ` id="${z}-${s.id}"`).replace(/ aria-labelledby="(z\d)t"/g, (m, z) => ` aria-labelledby="${z}t-${s.id}"`).replace(/ href="#(z\d)"/g, (m, z) => ` href="#${z}-${s.id}"`).replace(/ id="(z\dt)"/g, (m, z) => ` id="${z}-${s.id}"`);
const qa = (s) => { const nop = s.o3.counts.oportunidad || 0; return `<nav class="qa" aria-label="Ir a una respuesta" data-wf-f="respuestas"><a href="#z1-${s.id}">¿Cómo estamos?</a><a href="#z2-${s.id}">¿Qué está sucediendo?</a><a href="#z3-${s.id}">¿Qué merece atención? (${s.o3.counts.total})</a><a href="#z4-${s.id}">¿Qué puedo hacer? (${s.o4.cards.length})</a>${nop ? `<button type="button" data-go-oport="${s.id}">¿Dónde está la oportunidad? (${nop})</button>` : `<span class="qa__off" title="Esta situación no tiene oportunidades que mostrar">¿Dónde está la oportunidad? (0)</span>`}</nav>`; };
const sitHtml = (s) => uid(s, `<div class="sit" data-sit="${s.id}" hidden>${qa(s)}
<section id="z1" aria-labelledby="z1t"><h2 id="z1t" style="font-size:15px;margin:0 0 6px">Lectura ejecutiva</h2>${W.z1html(Z1, s.o1, 'desk', null, { expanded: true })}</section>
${z2html(s)}
<section id="z3" aria-labelledby="z3t">${W.z3html(s.o3, 'desk').replace('<h2 class="zb__t">', '<h2 class="zb__t" id="z3t" tabindex="-1">')}</section>
<section id="z4" aria-labelledby="z4t">${W.z4html(s.o4, 'desk').replace('<h2 class="zb__t">', '<h2 class="zb__t" id="z4t" tabindex="-1">')}</section>
${z5html(s)}</div>`);
const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Prototipo del Home inteligente · Command Center · Subfase 3.5</title><style>${W.CSS}${BCSTYLE}</style></head><body>
<a class="skip" href="#main">Saltar al contenido</a><div class="proto"><b>PROTOTIPO DE BAJA FIDELIDAD · DATOS SIMULADOS.</b> Generado desde las especificaciones ejecutables de Z1, Z3 y Z4. No es código de la aplicación y no demuestra que el diseño funcione con datos reales de FESA. Z2 y Z5 siguen la estructura aceptada en 3.1.</div>
<main class="page" id="main" tabindex="-1">
<h1 class="h1" data-wf-f="h1">Inicio · Command Center</h1>
<div class="sw" role="group" aria-label="Situación simulada (control del prototipo, no forma parte del Home)" data-wf-f="control"><span>Situación simulada:</span>${SIT.map((s, i) => `<button type="button" data-sit-btn="${s.id}" aria-pressed="${i === 0}">${esc(s.titulo.split(' · ')[0])}</button>`).join('')}</div>
${SIT.map((s, i) => `<div class="bc" data-bc="${s.id}" data-wf-f="bc"${i ? ' hidden' : ''} role="region" aria-label="Contexto"><b>Inicio</b><span>Canal: Total ▾</span><span>Periodo: Septiembre 2026 ▾</span><span>Datos al 22 sep</span><span class="cf cf--${s.o1.reliability.level}" data-bc-level="${s.o1.reliability.level}">${esc(Z1.NAMES.confiabilidad[s.o1.reliability.level][0])}${s.o1.reliability.reasons.length ? ' · ' + esc(s.o1.reliability.reasons[0].slice(0, 60)) : ''}</span><span class="lk">Cómo leer ▸</span></div>`).join('')}
${SIT.map((s, i) => sitHtml(s).replace('hidden>', i ? 'hidden>' : '>')).join('')}
</main><div class="toast" role="status" aria-live="polite" id="toast"></div>
<script>
(function(){
  var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  function show(id){
    $$('.sit').forEach(function(e){e.hidden=e.getAttribute('data-sit')!==id});$$('[data-bc]').forEach(function(e){e.hidden=e.getAttribute('data-bc')!==id});
    $$('[data-sit-btn]').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-sit-btn')===id))});
  }
  $$('[data-sit-btn]').forEach(function(b){b.addEventListener('click',function(){show(b.getAttribute('data-sit-btn'))})});
  // En pantallas angostas, el supuesto y la contribución de cada tarjeta pasan a «Evidencia y límites» (la información sigue a un toque; la tarjeta se acorta)
  var mq=window.matchMedia('(max-width:700px)');
  function compact(){$$('.cd3').forEach(function(c){var d=$('details.ev',c),imp=$('.imp',c);if(!d||!imp)return;
    var extra=$$('.imp2',imp);
    if(mq.matches&&extra.length&&!c.__moved){var box=document.createElement('div');box.className='imp-moved';box.setAttribute('data-wf-f','z3-impacto-detalle');var h=document.createElement('b');h.textContent='Supuesto y contribución: ';box.appendChild(h);extra.forEach(function(e){e.style.display='block';box.appendChild(e)});d.insertBefore(box,d.children[1]||null);c.__moved=box}
    else if(!mq.matches&&c.__moved){$$('.imp2',c.__moved).forEach(function(e){e.style.display='';imp.appendChild(e)});c.__moved.remove();c.__moved=null}})}
  if(mq.addEventListener)mq.addEventListener('change',compact);compact();
  show('alta');
  // Z1: «Ver contexto» abre y cierra la narrativa ampliada
  $$('.sit').forEach(function(sit){
    var nl=$('.nl',sit),lk=$('.nc .lk',sit);
    if(nl&&lk){nl.hidden=true;lk.setAttribute('role','button');lk.setAttribute('tabindex','0');lk.setAttribute('aria-expanded','false');
      var t=function(){var open=nl.hidden;nl.hidden=!open;lk.setAttribute('aria-expanded',String(open));lk.textContent=open?'Ocultar contexto ▾':'Ver contexto ▸'};
      lk.addEventListener('click',t);lk.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();t()}})}
    // filtros de Z3 y Z4
    ['z3','z4'].forEach(function(z){
      var box=$('[data-wf-f="'+z+'"]',sit);if(!box)return;
      $$('.fl button',box).forEach(function(b){b.addEventListener('click',function(){
        var f=b.getAttribute('data-filter');$$('.fl button',box).forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});
        $$(z==='z3'?'.cd3':'.ac',box).forEach(function(c){var k=c.getAttribute(z==='z3'?'data-clase':'data-kind');c.hidden=!(f==='todos'||f==='todas'||k===f)});
        var all=$('details.all',box);if(all&&f!=='todos'&&f!=='todas')all.open=true;
      })});
    });
    // «¿Dónde está la oportunidad?»: filtra Z3 por oportunidades y lleva allí
    $$('[data-go-oport]',sit).forEach(function(b){b.addEventListener('click',function(){var id=b.getAttribute('data-go-oport'),f=$('#z3-'+id+' [data-filter=oportunidad]',sit);if(f)f.click();var z=$('#z3-'+id,sit);if(z){z.scrollIntoView({behavior:'auto',block:'start'});var h=$('h2',z);if(h){h.setAttribute('tabindex','-1');h.focus()}}})});
    // Z4: destino
    $$('.ac__go',sit).forEach(function(b){b.addEventListener('click',function(){var t=$('#toast');t.textContent='Prototipo: aquí se abriría «'+b.textContent.replace('Ir a: ','').replace(' ▸','')+'» ('+b.getAttribute('data-go')+')';t.setAttribute('data-on','true');clearTimeout(window.__t);window.__t=setTimeout(function(){t.setAttribute('data-on','false')},2500)})});
  });
})();
</script></body></html>`;
fs.mkdirSync(path.join(D, 'prototipo'), { recursive: true });
fs.writeFileSync(path.join(D, 'prototipo/home_3_5_prototipo.html'), html);
console.log('generados: home_3_5_prototipo.html (' + SIT.length + ' situaciones), PROTOTIPO_SITUACIONES.json');
