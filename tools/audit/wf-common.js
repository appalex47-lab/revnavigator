/**
 * wf-common.js — Presentación compartida de los wireframes de 3.3 (Z3), 3.4 (Z4) y del prototipo de 3.5. Solo convierte en HTML la SALIDA de las
 * especificaciones ejecutables (z1-lectura-ejecutiva.js, z3-atencion.js, z4-acciones.js); no calcula nada ni decide qué se muestra.
 * Baja fidelidad (escala de grises), sin estilo visual final ni copy final. No es código de la aplicación.
 */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.CCWF = factory(); })(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const CSS = `
:root{--ink:#222;--mu:#666;--line:#bbb;--fill:#f2f2f2;--fill2:#e4e4e4;--mark:#333;--w:#fff}
*{box-sizing:border-box}body{margin:0;padding:24px;background:#d9d9d9;font:13px/1.45 system-ui,Segoe UI,Arial,sans-serif;color:var(--ink)}
h1{font-size:18px;margin:0 0 4px}h2{font-size:15px;margin:26px 0 6px}h3{margin:0}.lede{color:var(--mu);margin:0 0 14px;max-width:1080px}
.tag{display:inline-block;border:1px solid var(--mark);padding:0 7px;font-size:10px;border-radius:9px;background:#fff;letter-spacing:.03em}.tag--prop{background:var(--mark);color:#fff}.tag--exist{background:#fff;border-style:dashed}
.frame{background:var(--w);border:2px solid var(--mark);padding:14px;margin:0 0 18px}.frame h4{margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.04em}
.note{font-size:11.5px;color:var(--mu);border-left:3px solid var(--mark);padding-left:8px;margin:8px 0}
.row{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start}.row>.frame{flex:1 1 auto}
.zw{container-type:inline-size;margin:0 auto}.w-desk{width:100%;max-width:1180px}.w-tab{width:min(720px,100%)}.w-mob{width:min(360px,100%)}
.nw{white-space:nowrap}.lk{font-size:11px;font-weight:700;white-space:nowrap}
/* Z1 (idéntico al wireframe aceptado de 3.2) */
.z1{border:2px solid var(--mark);padding:12px;background:#fff}.z1h{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 8px}
.st{display:inline-block;border:2px solid var(--mark);padding:2px 10px;font-weight:700;font-size:11px;letter-spacing:.04em;text-transform:uppercase}.st--pre{border-style:dashed}.st--nb{background:var(--fill2)}
.cf{display:inline-block;padding:2px 8px;font-size:11px;border:1.5px solid var(--mark);border-radius:10px}.cf--Alta{background:#fff}.cf--Media{background:var(--fill2)}.cf--Baja{background:#c9c9c9;font-weight:700}.cf--Insuficiente{background:var(--mark);color:#fff;font-weight:700}
.pc{font-size:11px;color:var(--mu)}.z1m{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:16px;align-items:start}
.vd{font-size:21px;line-height:1.28;margin:0 0 8px;font-weight:700;overflow-wrap:break-word}.nc{margin:0;font-size:13px;color:#333}
.ec{border:1.5px solid var(--mark);padding:10px;background:var(--fill)}.ec--none{background:#fff;border-style:dashed}.ec__l{font-size:11px;color:var(--mu);text-transform:uppercase;letter-spacing:.04em}.ec__n{font-size:34px;font-weight:800;line-height:1.1;margin:2px 0}.ec__n--long{font-size:28px}.ec__s{font-size:11.5px;color:#444;overflow-wrap:anywhere}
.cd{margin:10px 0 0;border-left:5px solid var(--mark);padding:6px 10px;font-size:12px;background:var(--fill)}.cd--Baja{background:#d6d6d6}.cd--Insuficiente{background:#cfcfcf}
.al{margin:8px 0 0;border:1px solid var(--line);padding:6px 10px;font-size:11.5px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;background:#fafafa}.al b{display:block;font-size:10.5px;text-transform:uppercase;color:var(--mu)}
.z1s{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0 0}
.ce{border:1px dashed var(--line);background:var(--fill);padding:7px 9px;display:flex;flex-direction:column;gap:1px;min-width:0}.ce__l{font-size:10.5px;color:var(--mu);text-transform:uppercase;letter-spacing:.03em}.ce__v{font-size:18px;font-weight:700}.ce__s{font-size:11px;color:#444;overflow-wrap:anywhere}.ce--off{background:#fafafa;color:#aaa;border-style:dotted}.ce--soft{background:#fff}.ce--det{background:#fff;border-style:solid}
.nl{margin:10px 0 0;border:1px solid var(--line);padding:8px 10px;font-size:12px;display:grid;gap:5px}.nl--c{color:var(--mu);font-size:11.5px;background:#fafafa}.nl b{display:inline-block;min-width:118px;font-size:10.5px;text-transform:uppercase;color:var(--mu)}
@container (max-width:1024px){.vd{font-size:19px}.z1m{grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)}.ec__n{font-size:30px}.ec__n--long{font-size:24px}.ce__v{font-size:16px}}
@container (max-width:600px){.z1{padding:10px}.vd{font-size:17px}.z1m{grid-template-columns:1fr}.z1s{grid-template-columns:1fr}.al{grid-template-columns:1fr}.ec__n{font-size:28px}.ec__n--long{font-size:22px}.ce__v{font-size:17px}.z1h{gap:4px}}
/* Z3 y Z4 */
.zb{border:2px solid var(--mark);padding:12px;background:#fff}.zb__h{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px;margin:0 0 8px}.zb__t{font-size:15px;font-weight:800;margin:0}.cd3__ti,.ac__l{margin:0}.zb__c{font-size:12px;color:var(--mu)}
.fl{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px}.fl button{font:inherit;font-size:11.5px;border:1.5px solid var(--mark);background:#fff;padding:3px 10px;border-radius:12px;cursor:pointer}.fl button[aria-pressed=true]{background:var(--mark);color:#fff}
.nt{margin:0 0 8px;border-left:5px solid var(--mark);background:var(--fill);padding:6px 10px;font-size:12px}
.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.cd3{border:1.5px solid var(--mark);padding:10px;background:#fff;display:flex;flex-direction:column;gap:6px;min-width:0}
.cd3--riesgo{border-style:solid;border-left-width:7px}.cd3--oportunidad{border-style:dashed}.cd3--hallazgo{border-width:1.5px}
.cd3__top{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:11px}.cls{font-weight:800;border:1.5px solid var(--mark);padding:1px 8px;border-radius:10px;font-size:11px}
.sv{font-size:10.5px;text-transform:uppercase;letter-spacing:.03em;color:var(--mu)}.sv--critica{color:#000;font-weight:800}
.cd3__ti{font-size:14px;font-weight:700;line-height:1.3;overflow-wrap:break-word}.cd3__de{font-size:12px;color:#333}
.imp{border:1px solid var(--line);background:var(--fill);padding:6px 8px;font-size:11.5px}.imp b{display:block;font-size:10.5px;text-transform:uppercase;color:var(--mu);font-weight:600}.imp .big{font-size:17px;font-weight:800;display:block}.imp--no{background:#fff;border-style:dotted;color:var(--mu)}
.imp2{font-size:11px;color:#444}.cert{font-size:11px;color:#333}.tg{font-size:10.5px;border:1px dashed var(--mark);padding:1px 6px;display:inline-block;margin:0 4px 0 0}
details.ev{font-size:11.5px;border-top:1px solid var(--line);padding-top:4px}details.ev summary{cursor:pointer;font-weight:700;font-size:11.5px;min-height:28px;padding:6px 0;display:list-item}
.all{margin:8px 0 0}.all>summary{cursor:pointer;font-weight:700;font-size:12px;border:1.5px solid var(--mark);padding:5px 10px;display:inline-block;background:#fff}.all .cards{margin-top:8px}
.wh{font-size:11.5px;color:var(--mu);margin:8px 0 0}.dp{margin:8px 0 0;border:1px solid var(--line);padding:6px 10px;background:#fafafa;font-size:12px}.dp b{font-size:10.5px;text-transform:uppercase;color:var(--mu)}
.em{border:1px dashed var(--mark);padding:12px;text-align:center;color:#444;background:#fafafa}
.tot{margin:8px 0 0;border-top:1px solid var(--line);padding-top:6px;font-size:11.5px;color:#333}
.ac{border:1.5px solid var(--mark);padding:10px;background:#fff;display:flex;flex-direction:column;gap:6px;min-width:0}.ac__k{font-size:10.5px;text-transform:uppercase;letter-spacing:.04em;font-weight:800;border:1.5px solid var(--mark);padding:1px 8px;border-radius:10px;align-self:flex-start}
.ac__l{font-size:14px;font-weight:700;line-height:1.3}.ac__w{font-size:12px;color:#333}.ac__m{font-size:11.5px;border-left:3px solid var(--mark);padding-left:8px;color:#333}.ac__go{font:inherit;font-size:12px;font-weight:700;border:2px solid var(--mark);background:#fff;padding:4px 12px;cursor:pointer;align-self:flex-start}
@container (max-width:1024px){.cards{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container (max-width:600px){.cards{grid-template-columns:1fr}}
`;
  /* ===== Z1 (a partir de la salida de z1-lectura-ejecutiva.js; ids 'd' = data-wf, 'm' = data-wf-m) ===== */
  function z1html(Z1, o, width, ids, opts) {
    opts = opts || {}; const A = (k) => (ids === 'd' ? ` data-wf="z1-${k}"` : ids === 'm' ? ` data-wf-m="z1-${k}"` : '');
    const e = o.economic, rel = o.reliability, p = e.primary, N = Z1.NAMES, c = e.contribution;
    const chips = `<div class="z1h"><span class="${o.state.shown ? (o.state.id === 'sin_base' ? 'st st--nb' : 'st') : 'st st--pre'}"${A('estado')}>${esc(o.state.shown ? o.state.label : 'Lectura preliminar')}${o.state.shown && rel.level === 'Media' ? ' · con avisos' : ''}</span><span class="cf cf--${rel.level}"${A('confiabilidad')}>${esc(N.confiabilidad[rel.level][0])}</span><span class="pc"${A('periodo')}>Sep 2026 · día 22 de 30 · ${esc(o.comparability.label)}</span></div>`;
    const verdict = `<h3 class="vd"${A('veredicto')}>${esc(o.verdict.text)}</h3><p class="nc"${A('narr-corta')}>${esc(o.narrative.short)} <span class="lk">Ver contexto ▸</span></p>`;
    const sub = []; if (p && p.kind === 'brecha') sub.push(`Venta observada <span class="nw">${esc(e.observed.display)}</span>`, `Meta acumulada <span class="nw">${esc(e.plan.display)}</span>`, `Cumplimiento <span class="nw">${esc(e.compliance.display)}</span>${e.compliance.preliminary ? ' · preliminar' : ''}`); else if (p) sub.push('Sin brecha ni cumplimiento: no hay una comparación válida y confiable contra el plan');
    const eco = p ? `<div class="ec"${A('economico')}><div class="ec__l">${esc(p.label)}${p.preliminary ? ' · preliminar' : ''}</div><div class="ec__n${p.display.length > 9 ? ' ec__n--long' : ''}"><span class="nw">${esc(p.display)}</span></div><div class="ec__s">${sub.join('<br>')}<br>Base: ${esc(p.base)}</div></div>` : `<div class="ec ec--none"${A('economico')}><div class="ec__l">Venta observada</div><div class="ec__n"><span class="nw">—</span></div><div class="ec__s">${esc(e.observed.reason || 'Sin venta observada válida')}: no se muestra ningún importe, y el cero no sustituye a la falta de información</div></div>`;
    const cond = o.show.includes('condicion') ? `<div class="cd cd--${rel.level}"${A('condicion')}><b>${rel.level === 'Media' ? 'Motivos de los avisos' : rel.level === 'Baja' ? 'Por qué es preliminar' : 'Qué falta'}</b> — ${esc(rel.reasons.join(' '))}</div>` : '';
    const alc = o.show.includes('alcance') ? `<div class="al"${A('alcance')}><div><b>Se conoce</b> ${esc(o.scope.known.join(' · ') || '—')}</div><div><b>No se puede concluir</b> ${esc(o.scope.notConcluded.join(' · ') || '—')}</div><div><b>Diagnóstico</b> ${esc(o.scope.diagnosisLabel)}</div></div>` : '';
    const cells = [o.show.includes('cierre') && o.forecast ? `<div class="ce"${A('cierre')}><span class="ce__l">Cierre proyectado</span><span class="ce__v nw">${esc(o.forecast.display)}</span><span class="ce__s">${o.forecast.gapPct !== null ? esc(Z1.spct(o.forecast.gapPct)) + ' vs meta · estimación' : 'estimación'}</span></div>` : `<div class="ce ce--off"${A('cierre')}><span class="ce__l">Cierre proyectado</span><span class="ce__s">no se muestra</span></div>`,
      o.show.includes('evolucion') ? `<div class="ce"${A('evolucion')}><span class="ce__l">Evolución vs comparable</span><span class="ce__v nw">${o.comparability.growth ? esc(o.comparability.growth.display) : '—'}</span><span class="ce__s">${o.comparability.growth ? 'vs ' + esc(o.comparability.growth.base) + (o.comparable.sale.visible ? ` · venta comparable <span class="nw">${esc(o.comparable.sale.display)}</span>` : '') : esc(o.comparability.label) + ' · sin porcentaje'}</span></div>` : `<div class="ce ce--off"${A('evolucion')}><span class="ce__l">Evolución vs comparable</span><span class="ce__s">no se muestra</span></div>`,
      o.show.includes('contribucion') ? (c.status === 'disponible' ? `<div class="ce ce--det"${A('contribucion')}><span class="ce__l">Contribución bruta estimada · detalle${c.preliminary ? ' · preliminar' : ''}</span><span class="ce__v nw">${esc(c.display)}</span><span class="ce__s">sobre la brecha vs plan · margen prom. ${esc(c.marginDisplay)} · estimación, no utilidad</span></div>` : `<div class="ce ce--soft"${A('contribucion')}><span class="ce__l">Contribución bruta estimada</span><span class="ce__s">${esc(N.contribucion[c.status][0])} <span class="lk">▸</span></span></div>`) : `<div class="ce ce--off"${A('contribucion')}><span class="ce__l">Contribución bruta estimada</span><span class="ce__s">no se muestra</span></div>`].join('');
    const long = opts.expanded ? `<div class="nl"${A('narr-larga')}><div><b>Hecho observado</b> ${esc(o.narrative.long.hecho)}</div><div><b>Interpretación</b> ${esc(o.narrative.long.interpretacion)}</div><div><b>Limitaciones</b> ${esc(o.narrative.long.limitaciones)}</div><div><b>Implicación</b> ${esc(o.narrative.long.implicacion)}</div></div>` : `<div class="nl nl--c"${A('narr-larga')}>▸ Narrativa ampliada: hecho observado · interpretación · limitaciones · implicación (se abre con «Ver contexto»)</div>`;
    return `<div class="zw w-${width}"><div class="z1">${chips}<div class="z1m"><div class="z1v">${verdict}</div>${eco}</div>${cond}${alc}<div class="z1s">${cells}</div>${long}</div></div>`;
  }
  /* ===== Z3 ===== */
  function impactHtml(c) {
    const i = c.impact;
    if (i.status === 'no_aplica') return `<div class="imp imp--no"><b>Impacto económico</b>No aplica: ${esc(i.reason || 'sin cuantificar')}</div>`;
    if (i.status === 'datos_insuficientes') return `<div class="imp imp--no"><b>Impacto económico</b>Datos insuficientes: ${esc(i.reason)} (no se muestra ningún importe)</div>`;
    const s = i.sales, k = i.contribution;
    const contrib = k.status === 'disponible' ? `<span class="imp2">${esc(k.label)}: <span class="nw">${esc(k.display)}</span> · margen prom. ${esc(k.marginDisplay)} · estimación, no utilidad</span>` : k.label ? `<span class="imp2">${esc(k.label)}</span>` : '';
    return `<div class="imp" data-wf-f="z3-impacto"><b>${esc(s.label)} · ${esc(s.provenanceLabel)}${s.estimate ? ' · estimación' : ''}</b><span class="big nw">${esc(s.display)}</span>${s.assumptions.length ? `<span class="imp2">Supuesto: ${esc(s.assumptions[0])}</span><br>` : ''}${contrib}</div>`;
  }
  function z3card(c, featured) {
    const ev = c.evidence.concat(c.support);
    return `<article class="cd3 cd3--${c.clase}" data-clase="${c.clase}" data-wf-f="z3-tarjeta"${featured ? ' data-destacado="1"' : ''} aria-label="${esc(c.claseLabel)}: ${esc(c.title)}"><div class="cd3__top"><span class="cls" data-wf-f="z3-clase">${c.symbol} ${esc(c.claseLabel)}</span><span class="sv sv--${c.severity.id}">${esc(c.severity.label)}</span>${c.isData ? '<span class="sv">Datos</span>' : ''}<span class="cert">· ${esc(c.certainty.label)} · ${esc(c.certainty.supportLabel)}</span></div>
<h3 class="cd3__ti">${esc(c.title)}</h3><div class="cd3__de">${esc(c.description)}</div>${impactHtml(c)}
${c.tags.map((x) => `<span class="tg">${esc(x)}</span>`).join('')}
<details class="ev"><summary>Evidencia y límites</summary>${ev.map((x) => `<div>${esc(x.classLabel)}: ${esc(x.text)} <i>(${esc(x.source)})</i></div>`).join('')}${c.hypotheses.length ? `<div><b>Hipótesis (aparte, no sostiene la conclusión):</b> ${c.hypotheses.map((h) => esc(h.text) + (h.validation ? ' Cómo validarla: ' + esc(h.validation) : '')).join(' ')}</div>` : ''}${c.limitations.length ? `<div><b>Limitaciones:</b> ${esc(c.limitations.join(' '))}</div>` : ''}<div>Vigencia: ${esc(c.validity.label)} · primera vez ${esc(c.validity.firstSeen)}</div><div>Origen: ${esc(c.lineage.join('; '))}</div></details></article>`;
  }
  function z3html(o, width, opts) {
    opts = opts || {}; const feat = o.cards.filter((c) => o.featured.includes(c.id)), rest = o.cards.filter((c) => !o.featured.includes(c.id));
    const filters = `<div class="fl" role="group" aria-label="Filtrar por clase" data-wf-f="z3-filtros">${o.seeAll.filters.map((f) => `<button type="button" data-filter="${f.id}" aria-pressed="${f.id === 'todos'}">${esc(f.label)} (${f.count})</button>`).join('')}</div>`;
    const tot = Object.entries(o.totals).filter(([, t]) => t.lines.length).map(([cls, t]) => `<div>${esc(({ hallazgo: '◆ Hallazgos', riesgo: '▲ Riesgos', oportunidad: '● Oportunidades' })[cls])}: ${t.lines.map((l) => `${esc(l.label)} (${esc(l.provenanceLabel)}) ${l.overlap ? '<i>no se totaliza: los elementos describen el mismo dinero</i>' : `<b class="nw">${esc(l.display)}</b>${l.isRange ? ' <i>(rango: alternativas que cierran la misma brecha, no se suman)</i>' : ''}`}`).join(' · ')}</div>`).join('');
    const body = o.cards.length ? `${o.notice ? `<div class="nt" data-wf-f="z3-aviso">${esc(o.notice)}</div>` : ''}${opts.noFilters ? '' : filters}<div class="cards" data-wf-f="z3-lista">${feat.map((c) => z3card(c, true)).join('')}</div>${rest.length ? `<details class="all" data-wf-f="z3-ver-todos"><summary>${esc(o.seeAll.label)}</summary><div class="cards">${rest.map((c) => z3card(c, false)).join('')}</div></details>` : ''}${tot ? `<div class="tot" data-wf-f="z3-totales"><b>Totales por clase</b> (no se mezclan clases):${tot}</div>` : ''}`
      : `${o.notice ? `<div class="nt" data-wf-f="z3-aviso">${esc(o.notice)}</div>` : ''}<div class="em" data-wf-f="z3-vacio">${esc(o.empty || 'Sin elementos')}</div>`;
    const wh = o.withheld.note ? `<div class="wh" data-wf-f="z3-retenidos">${esc(o.withheld.note)}</div>` : '';
    const dp = o.dataPanel.visible ? `<div class="dp" data-wf-f="z3-datos"><b>${esc(o.dataPanel.title)}</b> ${o.dataPanel.items.length ? o.dataPanel.items.map((m) => esc(m.label) + (m.view ? ` <span class="lk">Ir a ${esc(m.view)} ▸</span>` : '')).join(' · ') : esc(o.dataPanel.empty)}</div>` : '';
    return `<div class="zw w-${width}"><section class="zb" data-wf-f="z3"><div class="zb__h"><h2 class="zb__t">Qué merece atención</h2><span class="zb__c">${esc(o.header || 'sin elementos')}</span></div>${body}${wh}${dp}</section></div>`;
  }
  /* ===== Z4 ===== */
  function z4card(c) {
    // Compacta: acción, motivo en una línea y destino a la vista; el porqué, la certeza, el respaldo y el importe del elemento citado, un toque abajo («Por qué y respaldo»).
    const det = `${c.why ? `<div>${esc(c.why)}</div>` : ''}${c.cites.map((x) => `<div><b>${esc(x.symbol)} ${esc(x.claseLabel)}:</b> ${esc(x.certaintyLabel)}, ${esc(x.supportLabel.toLowerCase())}${x.impactRef ? `. ${esc(x.impactRef.label)} del elemento: <b class="nw">${esc(x.impactRef.display)}</b> (${esc(x.impactRef.provenanceLabel)})` : ''}</div>`).join('')}<div>Propuesta por: ${esc(c.source)}${c.alsoFrom && c.alsoFrom.length ? '; también ' + esc(c.alsoFrom.join('; ')) : ''}</div>`;
    return `<article class="ac" data-kind="${c.kind}" data-wf-f="z4-tarjeta"><span class="ac__k">${esc(c.kindLabel)}</span><h3 class="ac__l">${esc(c.label)}</h3>
${c.cites.map((x) => `<div class="ac__m" data-wf-f="z4-motivo"><b>Motivada por</b> ${esc(x.symbol)} ${esc(x.claseLabel)}: ${esc(x.title)}</div>`).join('')}
${c.requires.length ? `<div class="ac__m"><b>Dato que falta:</b> ${esc(c.requires.join('; '))}</div>` : ''}${c.tags.map((x) => `<span class="tg">${esc(x)}</span>`).join('')}
<details class="ev" data-wf-f="z4-respaldo"><summary>Por qué y respaldo</summary>${det}</details>
<button type="button" class="ac__go" data-go="${esc(c.destination.view)}" data-wf-f="z4-destino">Ir a: ${esc(c.destination.label)} ▸</button></article>`;
  }
  function z4html(o, width) {
    const feat = o.cards.filter((c) => o.featured.includes(c.id)), rest = o.cards.filter((c) => !o.featured.includes(c.id));
    const filters = `<div class="fl" role="group" aria-label="Filtrar por tipo de acción" data-wf-f="z4-filtros">${o.seeAll.filters.map((f) => `<button type="button" data-filter="${f.id}" aria-pressed="${f.id === 'todas'}">${esc(f.label)} (${f.count})</button>`).join('')}</div>`;
    const body = o.cards.length ? `${o.notice ? `<div class="nt" data-wf-f="z4-aviso">${esc(o.notice)}</div>` : ''}${filters}<div class="cards" data-wf-f="z4-lista">${feat.map(z4card).join('')}</div>${rest.length ? `<details class="all" data-wf-f="z4-ver-todas"><summary>${esc(o.seeAll.label)}</summary><div class="cards">${rest.map(z4card).join('')}</div></details>` : ''}`
      : `${o.notice ? `<div class="nt" data-wf-f="z4-aviso">${esc(o.notice)}</div>` : ''}<div class="em" data-wf-f="z4-vacio"><b>${esc(o.fallback.title)}</b>${o.fallback.items.length ? '<br>' + o.fallback.items.map((m) => esc(m.label) + (m.view ? ` <span class="lk">Ir a ${esc(m.view)} ▸</span>` : '')).join(' · ') : ''}</div>`;
    const hl = o.held.note ? `<div class="wh" data-wf-f="z4-retenidas">${esc(o.held.note)}</div>` : '';
    const leyenda = o.cards.some((c) => c.cites.some((x) => x.impactRef)) ? '<div class="wh" data-wf-f="z4-leyenda">Los importes citados son los de cada elemento de «Qué merece atención»: no son importes de las acciones y no se suman.</div>' : '';
    return `<div class="zw w-${width}"><section class="zb" data-wf-f="z4"><div class="zb__h"><h2 class="zb__t">Qué hago</h2><span class="zb__c">${esc(o.header || 'sin acciones')}</span></div>${body}${leyenda}${hl}</section></div>`;
  }
  return { esc, CSS, z1html, z3html, z3card, z4html, z4card, impactHtml };
});
