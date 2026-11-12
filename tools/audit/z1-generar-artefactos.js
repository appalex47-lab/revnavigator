#!/usr/bin/env node
/* Genera, DESDE la especificación ejecutable de Z1 y los 14 escenarios (nada escrito a mano), los artefactos de la Subfase 3.2:
 *   docs/command-center/generated/ESCENARIOS_Z1.json            entradas, salidas esperadas y salidas de la especificación
 *   docs/command-center/FASE_3_2_ESCENARIOS_Z1.md                 detalle de los 14 escenarios (qué se muestra, qué no, veredicto, narrativa, advertencias…)
 *   docs/command-center/wireframes/z1_3_2_wireframe.html          wireframe de Z1: escritorio, tableta, móvil, 14 escenarios y prueba de legibilidad
 * Uso: node tools/audit/z1-generar-artefactos.js */
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '../..'), D = path.join(process.env.CC32_OUT || R, 'docs/command-center');   // CC32_OUT: otra raíz de salida, solo para que el verificador regenere y compare
const Z = require('./z1-lectura-ejecutiva.js'), SC = require('./z1-escenarios.js');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const NAME = { estado: 'Estado', confiabilidad: 'Confiabilidad', periodo: 'Periodo y comparación', veredicto: 'Veredicto', 'narr-corta': 'Narrativa corta', economico: 'Indicador económico principal', condicion: 'Lectura condicionada (motivos)', alcance: 'Alcance: qué se conoce y qué no', cierre: 'Cierre proyectado', evolucion: 'Evolución vs comparable', contribucion: 'Contribución bruta estimada / margen', 'narr-larga': 'Narrativa ampliada (bajo demanda)' };
const WHY_HIDE = { economico: 'no hay venta observada válida que mostrar', cierre: 'el cierre proyectado no se afirma con esta confiabilidad o sin brecha válida', evolucion: 'sin lectura definitiva no se valora la evolución', contribucion: 'sin una brecha válida contra el plan no se estima contribución', condicion: 'confiabilidad alta: no hay motivos que advertir', alcance: 'confiabilidad alta: todo lo que Z1 muestra es concluyente' };
const ALL = [...SC.SCENARIOS, ...SC.ADICIONALES];
const out = ALL.map((s) => { const o = Z.build(s.input); const fails = SC.check(Z, s); return { n: s.n, id: s.id, titulo: s.titulo, origen: s.origen, adicional: SC.ADICIONALES.includes(s), input: s.input, expect: s.expect, salida: o, comparacion: fails.length ? { coincide: false, diferencias: fails } : { coincide: true, diferencias: [] } }; });

/* ---------- JSON ---------- */
fs.writeFileSync(path.join(D, 'generated/ESCENARIOS_Z1.json'), JSON.stringify({ version: 2, subfase: '3.2', nota: 'Generado por tools/audit/z1-generar-artefactos.js desde la especificación ejecutable (tools/audit/z1-lectura-ejecutiva.js) y los escenarios (tools/audit/z1-escenarios.js). No editar a mano.', obligatorios: SC.SCENARIOS.length, adicionales: SC.ADICIONALES.length, nombresVisibles: Z.NAMES, escenarios: out }, null, 1));

/* ---------- Markdown ---------- */
const econTxt = (o) => {
  const e = o.economic, p = e.primary; if (!p) return 'Sin cifra principal (no hay venta observada válida)';
  return `${p.label}: **${p.display}**${p.direction ? ` (${p.direction.replace('_', ' ')})` : ''}${p.preliminary ? ' · rotulada «preliminar»' : ''}; base: ${p.base}${p.kind === 'brecha' ? `; venta observada ${e.observed.display}; meta acumulada ${e.plan.display}; cumplimiento ${e.compliance.display}` : ''}`;
};
const contrib = (o) => { const c = o.economic.contribution; return c.status === 'invalido' ? `«Margen no válido · Revisar» (línea discreta; sin importe ni 0; motivo de la validación del motor: ${c.validation.message})` : c.status === 'no_confirmado' ? '«Margen sin confirmar · Revisar» (línea discreta; sin importe ni 0; hay un 0 % sin evidencia de configuración)' : c.status === 'disponible' ? `Contribución bruta estimada **${c.display}**${c.preliminary ? ' (preliminar)' : ''} solo en el detalle, sobre la brecha contra el plan (margen promedio general ${c.marginDisplay}; estimación, no utilidad ni margen real del canal o producto${c.limitations.length > 1 ? '; ' + c.limitations.slice(1).join(' ') : ''})` : c.status === 'no_configurado' ? '«Margen no configurado · Configurar» (línea discreta; sin importe ni 0)' : c.status === 'desactivado' ? '«Margen desactivado · Configurar» (línea discreta; sin importe)' : `No se muestra (${c.note})`; };
let md = ['# Escenarios de Z1 — Lectura ejecutiva (Subfase 3.2)', '',
  'Generado por `node tools/audit/z1-generar-artefactos.js` desde la especificación ejecutable (`tools/audit/z1-lectura-ejecutiva.js`) y los escenarios (`tools/audit/z1-escenarios.js`): **14 obligatorios** y **16 adicionales** (A1–A16), añadidos solo donde las decisiones D-01 a D-06, la auditoría final o la resolución de los criterios C1 a C5 abren una brecha funcional real. **No editar a mano**: la prueba `tools/test-fase3-2-z1.js` valida que cada escenario produce lo que dictan los contratos de Fase 2 y las decisiones, y el verificador `tools/audit/verificar_consistencia_3_2.py` valida que el documento principal coincide con esta fuente.', '',
  '**Origen de las cifras.** Escenario 2: cumplimiento, brecha y cierre que entregó el motor con los datos de demostración desviados («motor»). Todos los demás: valores **ilustrativos** (diseñados para ejercitar la regla; no provienen de datos reales). Los textos son los que produce la especificación (diseño propuesto), no los de la aplicación actual.', ''];
out.forEach((e) => {
  const o = e.salida;
  md.push(`## Escenario ${e.n} — ${e.titulo}${e.adicional ? ' *(adicional)*' : ''}`, '', `*Origen de las cifras:* ${e.origen}. *Comparación con lo esperado:* ${e.comparacion.coincide ? 'la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones)' : 'DIFIERE — ' + e.comparacion.diferencias.join('; ')}.`, '',
    '| Aspecto | Resultado |', '|---|---|',
    `| **Confiabilidad** | **${Z.NAMES.confiabilidad[o.reliability.level][0]}** (modo «${o.reliability.mode}»)${o.reliability.reasons.length ? ` — motivos visibles en Z1: ${o.reliability.reasons.join(' ')}` : ' — sin motivos que advertir'}${o.reliability.caps.length ? ` (tope de diseño: no puede ser Alta — ${o.reliability.caps.join('; ')})` : ''} |`,
    `| **Orden de evaluación (D-05)** | ${o.evaluation.steps.slice(0, 6).map((x) => `${x.n}. ${x.name}: ${x.outcome}${x.hard ? ' ⛔' : ''}`).join(' → ')} |`,
    `| **Estado ejecutivo** | ${o.state.shown ? `**${o.state.label}**${o.state.qualifiers.length ? ` · calificadores: ${o.state.qualifiers.join(', ')}` : ''}${o.state.definitive ? '' : ' (rotulado «con avisos»)'}` : `No se emite etiqueta de estado (lectura preliminar; el estado interno quedaría en «${Z.STATE_LABEL[o.state.id]}» pero no se afirma)`} |`,
    `| **Veredicto permitido** | Tipo «${o.verdict.kind}»: «${o.verdict.text}» |`,
    `| **Narrativa corta** | «${o.narrative.short}» |`,
    `| **Narrativa ampliada** | **Hecho observado:** ${o.narrative.long.hecho} **Interpretación:** ${o.narrative.long.interpretacion} **Limitaciones:** ${o.narrative.long.limitaciones} **Implicación:** ${o.narrative.long.implicacion} |`,
    `| **Indicador económico** | ${econTxt(o)} |`,
    `| **Cierre · evolución · contribución** | cierre: ${o.show.includes('cierre') && o.forecast ? `${o.forecast.display}${o.forecast.gapPct !== null ? ` (${Z.spct(o.forecast.gapPct)} vs meta)` : ''}` : '—'}; evolución: ${o.show.includes('evolucion') ? (o.comparability.growth ? `${o.comparability.growth.display} vs ${o.comparability.growth.base}${o.comparable.sale.visible ? `; venta comparable ${o.comparable.sale.display}` : ''}` : `«${o.comparability.label}» (sin porcentaje)`) : '—'}; ${contrib(o)} |`,
    `| **Comparación** | ${o.comparability.label}${o.comparability.code === 'valida' ? '' : ' — no permite afirmar crecimiento ni deterioro'} |`,
    `| **Alcance (Se conoce / No se puede concluir)** | Se conoce: ${o.scope.known.join('; ') || '—'}. No se puede concluir: ${o.scope.notConcluded.join('; ') || '—'}. ${o.scope.diagnosisLabel}. |`,
    `| **Clasificación del dato (C1, C2)** | ${({ valido: 'Dato válido', inconsistente: 'Dato inconsistente (pendiente de interpretación)', no_verificable: 'Dato no verificable', no_calculable: 'Dato no calculable' })[o.data.class]}${o.data.issues.length ? ': ' + o.data.issues.map((x) => x.text).join(' ') : ''} · conciliación de ventas: ${({ no_evaluable: 'no evaluable', pendiente: 'pendiente de definición', sin_diferencia_observada: 'sin diferencia observada (no equivale a conciliación validada)' })[o.data.reconciliation.status]} |`,
    `| **Conclusiones por separado (C3)** | venta observada: ${o.conclusions.ventaObservada.replace(/_/g, ' ')} · cumplimiento: ${o.conclusions.cumplimiento.replace(/_/g, ' ')} · evolución: ${o.conclusions.evolucion.replace(/_/g, ' ')} · conversión: ${o.conclusions.conversion.replace(/_/g, ' ')} · contribución: ${o.conclusions.contribucion.replace(/_/g, ' ')} |`,
    `| **Qué se muestra** | ${o.show.map((x) => NAME[x]).join(' · ')} |`,
    `| **Qué no se muestra** | ${o.hide.length ? o.hide.map((x) => `${NAME[x]} (${WHY_HIDE[x]})`).join(' · ') : 'Nada se oculta'} |`,
    `| **Advertencias necesarias** | ${[...o.reliability.reasons, o.economic.contribution.status === 'no_configurado' ? 'Margen no configurado: no se estima contribución.' : null, o.comparability.code !== 'valida' ? `Comparación: ${o.comparability.label}.` : null].filter(Boolean).join(' ') || 'Ninguna'} |`,
    `| **Se deriva a otras zonas** | Z2: ${o.derive.Z2.join('; ')} · Z3: ${o.derive.Z3.join('; ')} · Z4: ${o.derive.Z4.join('; ')} · Z5: ${o.derive.Z5.join('; ')} |`, '');
});
md.push('## Nombres visibles (D-06)', '', 'Los identificadores internos no cambian (son los del contrato de Fase 2). En pantalla solo se usa el nombre visible.', '', '| Familia | Identificador interno | Nombre visible | Explicación para el usuario |', '|---|---|---|---|');
Object.entries(Z.NAMES).forEach(([g, o]) => Object.entries(o).forEach(([k, v]) => md.push(`| ${g} | \`${k}\` | ${v[0]} | ${v[1]} |`)));
fs.writeFileSync(path.join(D, 'FASE_3_2_ESCENARIOS_Z1.md'), md.join('\n').replace(/ /g, ' ').replace(/\n$/, '') + '\n');

/* ---------- Wireframe ---------- */
const money = Z.money;
function z1html(o, width, ids, opts = {}) {
  const A = (k) => (ids === 'd' ? ` data-wf="z1-${k}"` : ids === 'm' ? ` data-wf-m="z1-${k}"` : '');
  const e = o.economic, rel = o.reliability, p = e.primary, N = Z.NAMES;
  const stateTxt = o.state.shown ? o.state.label : 'Lectura preliminar', stateCls = o.state.shown ? (o.state.id === 'sin_base' ? 'st st--nb' : 'st') : 'st st--pre';
  const chips = `<div class="z1h"><span class="${stateCls}"${A('estado')}>${esc(stateTxt)}${o.state.shown && rel.level === 'Media' ? ' · con avisos' : ''}</span><span class="cf cf--${rel.level}"${A('confiabilidad')}>${esc(N.confiabilidad[rel.level][0])}</span><span class="pc"${A('periodo')}>Sep 2026 · día 22 de 30 · ${esc(o.comparability.label)}</span></div>`;
  const verdict = `<h3 class="vd"${A('veredicto')}>${esc(o.verdict.text)}</h3><p class="nc"${A('narr-corta')}>${esc(o.narrative.short)} <span class="lk">Ver contexto ▸</span></p>`;
  const sub = [];
  if (p && p.kind === 'brecha') sub.push(`Venta observada <span class="nw">${esc(e.observed.display)}</span>`, `Meta acumulada <span class="nw">${esc(e.plan.display)}</span>`, `Cumplimiento <span class="nw">${esc(e.compliance.display)}</span>${e.compliance.preliminary ? ' · preliminar' : ''}`);
  else if (p) sub.push('Sin brecha ni cumplimiento: no hay una comparación válida y confiable contra el plan');
  const eco = p ? `<div class="ec"${A('economico')}><div class="ec__l">${esc(p.label)}${p.preliminary ? ' · preliminar' : ''}</div><div class="ec__n${p.display.length > 9 ? ' ec__n--long' : ''}"><span class="nw">${esc(p.display)}</span></div><div class="ec__s">${sub.join('<br>')}<br>Base: ${esc(p.base)}</div></div>` : `<div class="ec ec--none"${A('economico')}><div class="ec__l">Venta observada</div><div class="ec__n"><span class="nw">—</span></div><div class="ec__s">${esc(e.observed.reason || 'Sin venta observada válida')}: no se muestra ningún importe (ni $0)</div></div>`;
  const cond = o.show.includes('condicion') ? `<div class="cd cd--${rel.level}"${A('condicion')}><b>${rel.level === 'Media' ? 'Motivos de los avisos' : rel.level === 'Baja' ? 'Por qué es preliminar' : 'Qué falta'}</b> — ${esc(rel.reasons.join(' '))}</div>` : `<div class="cd cd--none"${A('condicion')}>[anotación del wireframe] Con confiabilidad alta esta banda no aparece</div>`;
  const alc = o.show.includes('alcance') ? `<div class="al"${A('alcance')}><div><b>Se conoce</b> ${esc(o.scope.known.join(' · ') || '—')}</div><div><b>No se puede concluir</b> ${esc(o.scope.notConcluded.join(' · ') || '—')}</div><div><b>Diagnóstico</b> ${esc(o.scope.diagnosisLabel)}</div></div>` : `<div class="al al--none"${A('alcance')}>[anotación del wireframe] Con confiabilidad alta no se muestra el alcance</div>`;
  const c = e.contribution;
  const cells = [
    o.show.includes('cierre') && o.forecast ? `<div class="ce"${A('cierre')}><span class="ce__l">Cierre proyectado</span><span class="ce__v nw">${esc(o.forecast.display)}</span><span class="ce__s">${o.forecast.gapPct !== null ? esc(Z.spct(o.forecast.gapPct)) + ' vs meta · estimación' : 'estimación'}</span></div>` : `<div class="ce ce--off"${A('cierre')}><span class="ce__l">Cierre proyectado</span><span class="ce__s">no se muestra</span></div>`,
    o.show.includes('evolucion') ? `<div class="ce"${A('evolucion')}><span class="ce__l">Evolución vs comparable</span><span class="ce__v nw">${o.comparability.growth ? esc(o.comparability.growth.display) : '—'}</span><span class="ce__s">${o.comparability.growth ? 'vs ' + esc(o.comparability.growth.base) + (o.comparable.sale.visible ? ` · venta comparable <span class="nw">${esc(o.comparable.sale.display)}</span>` : '') : esc(o.comparability.label) + ' · sin porcentaje'}</span></div>` : `<div class="ce ce--off"${A('evolucion')}><span class="ce__l">Evolución vs comparable</span><span class="ce__s">no se muestra</span></div>`,
    o.show.includes('contribucion') ? (c.status === 'disponible' ? `<div class="ce ce--det"${A('contribucion')}><span class="ce__l">Contribución bruta estimada · detalle${c.preliminary ? ' · preliminar' : ''}</span><span class="ce__v nw">${esc(c.display)}</span><span class="ce__s">sobre la brecha vs plan · margen prom. ${c.marginDisplay} · estimación, no utilidad</span></div>` : `<div class="ce ce--soft"${A('contribucion')}><span class="ce__l">Contribución bruta estimada</span><span class="ce__s">${esc(N.contribucion[c.status][0])} <span class="lk">▸</span></span></div>`) : `<div class="ce ce--off"${A('contribucion')}><span class="ce__l">Contribución bruta estimada</span><span class="ce__s">no se muestra</span></div>`].join('');
  const long = opts.expanded ? `<div class="nl"${A('narr-larga')}><div><b>Hecho observado</b> ${esc(o.narrative.long.hecho)}</div><div><b>Interpretación</b> ${esc(o.narrative.long.interpretacion)}</div><div><b>Limitaciones</b> ${esc(o.narrative.long.limitaciones)}</div><div><b>Implicación</b> ${esc(o.narrative.long.implicacion)}</div></div>` : `<div class="nl nl--c"${A('narr-larga')}>▸ Narrativa ampliada: hecho observado · interpretación · limitaciones · implicación (se abre con «Ver contexto»)</div>`;
  return `<div class="zw w-${width}"><div class="z1">${chips}<div class="z1m"><div class="z1v">${verdict}</div>${eco}</div>${cond}${alc}<div class="z1s">${cells}</div>${long}</div></div>`;
}
const S2 = out[1].salida;
const panels = out.map((e) => `<section class="sc${e.adicional ? ' sc--add' : ''}" data-wf="escenario-${String(e.n).padStart(2, '0')}"><div class="sc__h"><span class="sc__n">${e.n}</span><b>${esc(e.titulo)}</b><span class="tag tag--prop">${e.adicional ? 'ADICIONAL · ' : ''}DISEÑO PROPUESTO</span></div>${z1html(e.salida, 'desk', null)}<p class="sc__f">${esc(Z.NAMES.confiabilidad[e.salida.reliability.level][0])} · comparación: ${esc(e.salida.comparability.label)} · cifras: ${e.origen.startsWith('motor') ? 'del motor' : 'ilustrativas'} · diagnóstico: ${esc(e.salida.scope.diagnosisLabel)}</p></section>`).join('');
const stress = { ...SC.SCENARIOS[1].input, period: { ...SC.SCENARIOS[1].input.period, label: 'Del 1 al 22 de septiembre de 2026 (periodo largo de prueba)' }, revenue: { planToDate: 1.8e9, actualToDate: 5.5e8, gap: -1.25e9, compliance: 0.3055, gapPct: -0.6944 }, activity: SC.helpers.ACT(900000, 20000, 5.5e8), forecast: { target: 2.7e9, close: 8.2e8, gapPct: -0.6963 }, comparable: { ...SC.helpers.COMP('ok', -1, -2.3e9, 2.3e9), label: 'el mismo periodo del año anterior (del 1 al 22 de septiembre de 2025)' }, margin: SC.MARGIN };
const OS = Z.build(stress);
const REL4 = out.find((x) => x.n === 6).salida;
const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Wireframe de Z1 · Lectura ejecutiva · Subfase 3.2</title>
<style>
:root{--ink:#222;--mu:#666;--line:#bbb;--fill:#f2f2f2;--fill2:#e4e4e4;--mark:#333;--w:#fff}
*{box-sizing:border-box}body{margin:0;padding:24px;background:#d9d9d9;font:13px/1.45 system-ui,Segoe UI,Arial,sans-serif;color:var(--ink)}
h1{font-size:18px;margin:0 0 4px}h2{font-size:15px;margin:26px 0 6px}.lede{color:var(--mu);margin:0 0 14px;max-width:1080px}
.tag{display:inline-block;border:1px solid var(--mark);padding:0 7px;font-size:10px;border-radius:9px;background:#fff;letter-spacing:.03em}.tag--prop{background:var(--mark);color:#fff}.tag--exist{background:#fff;border-style:dashed}
.frame{background:var(--w);border:2px solid var(--mark);padding:14px;margin:0 0 18px}.frame h4{margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.04em}
.ctx{border:1.5px dashed var(--line);background:#fafafa;padding:5px 8px;font-size:11px;color:var(--mu);margin:0 0 8px}
/* Z1 se adapta al ancho de SU contenedor (consultas de contenedor) con los puntos de corte del diseño: escritorio ≥ 1025 px, tableta 600–1024 px, móvil < 600 px */
.zw{container-type:inline-size;margin:0 auto}.w-desk{width:100%;max-width:1180px}.w-tab{width:min(720px,100%)}.w-mob{width:min(360px,100%)}
.z1{border:2px solid var(--mark);padding:12px;background:#fff}
.z1h{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 8px}
.st{display:inline-block;border:2px solid var(--mark);padding:2px 10px;font-weight:700;font-size:11px;letter-spacing:.04em;text-transform:uppercase}.st--pre{border-style:dashed}.st--nb{background:var(--fill2)}
.cf{display:inline-block;padding:2px 8px;font-size:11px;border:1.5px solid var(--mark);border-radius:10px}.cf--Alta{background:#fff}.cf--Media{background:var(--fill2)}.cf--Baja{background:#c9c9c9;font-weight:700}.cf--Insuficiente{background:var(--mark);color:#fff;font-weight:700}
.pc{font-size:11px;color:var(--mu)}
.z1m{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:16px;align-items:start}
.vd{font-size:21px;line-height:1.28;margin:0 0 8px;font-weight:700;overflow-wrap:break-word}
.nc{margin:0;font-size:13px;color:#333}.lk{font-size:11px;font-weight:700;white-space:nowrap}
.ec{border:1.5px solid var(--mark);padding:10px;background:var(--fill)}.ec--none{background:#fff;border-style:dashed}.ec__l{font-size:11px;color:var(--mu);text-transform:uppercase;letter-spacing:.04em}.ec__n{font-size:34px;font-weight:800;line-height:1.1;margin:2px 0}.ec__n--long{font-size:28px}.ec__s{font-size:11.5px;color:#444;overflow-wrap:anywhere}
.nw{white-space:nowrap}
.cd{margin:10px 0 0;border-left:5px solid var(--mark);padding:6px 10px;font-size:12px;background:var(--fill)}.cd--Baja{background:#d6d6d6}.cd--Insuficiente{background:#cfcfcf}.cd--none{border-left:1px dashed var(--line);background:#fff;color:var(--mu);font-size:11px}
.z1s{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0 0}
@container (max-width:1024px){.vd{font-size:19px}.z1m{grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)}.ec__n{font-size:30px}.ec__n--long{font-size:24px}.ce__v{font-size:16px}}
@container (max-width:600px){.z1{padding:10px}.vd{font-size:17px}.z1m{grid-template-columns:1fr}.z1s{grid-template-columns:1fr}.ec__n{font-size:28px}.ec__n--long{font-size:22px}.ce__v{font-size:17px}.z1h{gap:4px}}
.ce{border:1px dashed var(--line);background:var(--fill);padding:7px 9px;display:flex;flex-direction:column;gap:1px;min-width:0}.ce__l{font-size:10.5px;color:var(--mu);text-transform:uppercase;letter-spacing:.03em}.ce__v{font-size:18px;font-weight:700}.ce__s{font-size:11px;color:#444;overflow-wrap:anywhere}.ce--off{background:#fafafa;color:#aaa;border-style:dotted}.ce--soft{background:#fff}
.nl{margin:10px 0 0;border:1px solid var(--line);padding:8px 10px;font-size:12px;display:grid;gap:5px}.nl--c{color:var(--mu);font-size:11.5px;background:#fafafa}.nl b{display:inline-block;min-width:118px;font-size:10.5px;text-transform:uppercase;color:var(--mu)}
.note{font-size:11.5px;color:var(--mu);border-left:3px solid var(--mark);padding-left:8px;margin:8px 0}
.row{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start}.row>.frame{flex:1 1 auto}
.al{margin:8px 0 0;border:1px solid var(--line);padding:6px 10px;font-size:11.5px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;background:#fafafa}.al b{display:block;font-size:10.5px;text-transform:uppercase;color:var(--mu)}.al--none{display:block;color:var(--mu);border-style:dotted}.ce--det{background:#fff;border-style:solid}.sc--add{border-style:dashed}@container (max-width:600px){.al{grid-template-columns:1fr}}
.grid14{display:grid;grid-template-columns:repeat(auto-fit,minmax(640px,1fr));gap:14px}
.sc{background:#fff;border:1.5px solid var(--line);padding:10px}.sc__h{display:flex;gap:8px;align-items:center;margin:0 0 8px}.sc__n{display:inline-grid;place-items:center;width:22px;height:22px;background:var(--mark);color:#fff;border-radius:50%;font-size:11px;font-weight:700}.sc .tag{margin-left:auto}.sc__f{font-size:11px;color:var(--mu);margin:8px 0 0}
.sc .z1{padding:9px}
.ex{border:2px dashed var(--mark);padding:10px;background:#fff}.ex__img{height:330px;overflow:hidden;border:1px solid var(--line)}.ex__img img{width:100%;display:block}
.hier{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:8px 0}.hier div{border:1.5px solid var(--mark);padding:6px 8px;font-size:11.5px;background:#fff}.hier b{display:block}
@media(max-width:1100px){.hier{grid-template-columns:1fr 1fr}.grid14{grid-template-columns:1fr}}
</style></head><body>
<h1>Z1 · Lectura ejecutiva — wireframe (Subfase 3.2)</h1>
<p class="lede"><span class="tag tag--prop">DISEÑO PROPUESTO</span> Todo lo que aparece con este rótulo es <b>diseño propuesto</b>, de baja fidelidad y generado desde la especificación ejecutable (<code>tools/audit/z1-lectura-ejecutiva.js</code>): no existe en la aplicación. Solo el panel marcado <span class="tag tag--exist">APLICACIÓN EXISTENTE</span> es una captura real. Mantiene la arquitectura aceptada en 3.1 (BC · Z1 · Z2 · Z3 · Z4 · Z5; aquí solo se diseña Z1). Cifras: escenario 2 con valores reales del motor sobre datos de demostración; el resto, ilustrativas. Los nombres de estados, confiabilidades y comparaciones son los visibles de la tabla D-06; no se muestran identificadores internos.</p>

<h2>1 · Jerarquía visual (de mayor a menor protagonismo)</h2>
<div class="hier" data-wf="jerarquia"><div><b>1 · Situación del negocio</b>Estado + veredicto (texto grande)</div><div><b>2 · Magnitud económica</b>Brecha en pesos (único número grande); si no hay brecha válida, la venta observada</div><div><b>3 · Confiabilidad</b>Chip en la cabecera + banda de motivos cuando no es Alta</div><div><b>4 · Contexto y explicación breve</b>Narrativa corta; ampliada bajo demanda</div></div>

<h2>2 · Escritorio, tableta y móvil (escenario 2: desempeño negativo, confiabilidad Alta)</h2>
<div class="frame" data-wf="frame-desktop"><h4>Escritorio ≥ 1025 px <span class="tag tag--prop">DISEÑO PROPUESTO</span></h4><div class="ctx">BC · Barra de contexto (no se diseña aquí) — Canal ▾ · Periodo ▾ · Datos al 22 sep · Confiabilidad global</div>${z1html(S2, 'desk', 'd', { expanded: true })}<p class="note">Cabecera: estado, confiabilidad y periodo en una línea. Cuerpo: veredicto y narrativa corta a la izquierda; a la derecha el único número protagonista. Banda de motivos solo si la confiabilidad no es Alta. Fila secundaria: cierre, evolución y contribución. «Ver contexto» abre las cuatro capas de la narrativa ampliada.</p></div>
<div class="row"><div class="frame" data-wf="frame-tablet"><h4>Tableta 600–1024 px <span class="tag tag--prop">DISEÑO PROPUESTO</span></h4>${z1html(S2, 'tab', null)}<p class="note">Mismo orden. Veredicto y bloque económico siguen en dos columnas; la fila secundaria conserva tres celdas.</p></div>
<div class="frame" data-wf="frame-mobile"><h4>Móvil &lt; 600 px <span class="tag tag--prop">DISEÑO PROPUESTO</span></h4>${z1html(S2, 'mob', 'm')}<p class="note">Una columna: chips → veredicto → <b>brecha</b> → motivos (si no es Alta) → narrativa corta → celdas apiladas. Nunca se ocultan: estado, veredicto, brecha con su signo y base, confiabilidad y sus motivos. Se pliegan: narrativa ampliada y el detalle del periodo.</p></div></div>

<h2>3 · Los 14 escenarios obligatorios y los 16 adicionales (A1–A16)</h2>
<div class="grid14" data-wf="escenarios">${panels}</div>

<h2>4 · Prueba de legibilidad: importes en miles de millones, −100 %, y un periodo y una base de comparación largos, en los tres anchos</h2>
<div data-wf="estres"><div class="frame"><h4>Escritorio ≥ 1025 px <span class="tag tag--prop">DISEÑO PROPUESTO</span></h4>${z1html(OS, 'desk', null)}</div>
<div class="row"><div class="frame"><h4>Tableta 600–1024 px <span class="tag tag--prop">DISEÑO PROPUESTO</span></h4>${z1html(OS, 'tab', null)}</div><div class="frame"><h4>Móvil &lt; 600 px <span class="tag tag--prop">DISEÑO PROPUESTO</span></h4>${z1html(OS, 'mob', null)}</div></div>
<p class="note">Reglas: el importe protagonista y los porcentajes nunca se parten ni se recortan (no se separan de su unidad); si el importe es largo, baja un paso de tamaño (34 → 28 px en escritorio, 30 → 24 en tableta, 28 → 22 en móvil); los textos largos de periodo y comparación se ajustan en varias líneas.</p></div>

<h2>5 · Estados de confiabilidad e información faltante en móvil (emulado) y tableta</h2>
<div class="row" data-wf="estados-movil">${[5, 6, 7].map((n) => `<div class="frame"><h4>Móvil · escenario ${n} <span class="tag tag--prop">DISEÑO PROPUESTO</span></h4>${z1html(out.find((x) => x.n === n).salida, 'mob', null)}</div>`).join('')}</div>
<div class="row" data-wf="estados-tableta">${['A2', 'A1'].map((n) => `<div class="frame"><h4>Tableta · escenario ${n} <span class="tag tag--prop">DISEÑO PROPUESTO</span></h4>${z1html(out.find((x) => x.n === n).salida, 'tab', null)}</div>`).join('')}</div>
<p class="note">Con confiabilidad baja o insuficiente la banda de motivos y el alcance («Se conoce / No se puede concluir») siguen visibles en una sola columna; la venta observada se conserva cuando es válida y nunca se sustituye por $0.</p>

<h2>6 · Lo que hay hoy, para comparar</h2>
<div class="ex" data-wf="aplicacion-existente"><span class="tag tag--exist">APLICACIÓN EXISTENTE</span> <span class="sm">Captura real del primer pantallazo del Home actual (auditoría de 3.1, datos de demostración con Ecommerce −12 %). No es diseño.</span><div class="ex__img"><img src="capturas_auditoria/home_desktop_full.png" alt="Home actual"></div><p class="note">Diferencias que Z1 propone: la confiabilidad ya no está en un plegable cerrado; el veredicto depende de la confiabilidad; hay un solo número protagonista; la narrativa en texto deja de ser un bloque; la comparabilidad se rotula.</p></div>
</body></html>`;
fs.writeFileSync(path.join(D, 'wireframes/z1_3_2_wireframe.html'), html);
console.log('generados: ESCENARIOS_Z1.json (' + out.length + ' escenarios), FASE_3_2_ESCENARIOS_Z1.md, z1_3_2_wireframe.html');
