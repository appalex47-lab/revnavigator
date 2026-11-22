/* Command Center · Fase 4.1 — CONTRATO DE HALLAZGOS: extensión ADITIVA `cc.finding` v1.1 + adaptador desde `attentionEngine`. ESPECIFICACIÓN EJECUTABLE (no es código de la aplicación).
 *
 * No crea un contrato nuevo ni duplica el aceptado en Fase 2 (tools/audit/command-center-contracts.js: validateFinding, dedupKey, mergeFindings, reconcileValidity).
 * Lo EXTIENDE con campos opcionales que la propuesta de 4.1 pide y el contrato aún no tenía, y demuestra que los hallazgos que hoy emite `attentionEngine` se pueden
 * expresar en el contrato SIN cambiar ese motor:
 *   · `kind`: hecho_observado · desviacion · hipotesis · causa_comprobada · oportunidad · riesgo · recomendacion (mapa a type + certainty, sin sustituirlos)
 *   · `causality`: none · hypothesis · demonstrated  (una hipótesis NO es una causa; la IA no eleva una hipótesis a hecho)
 *   · `dataReliability`: nivel y contrato de confiabilidad con el que se emitió  · `recommendation` / `actionRef` (vínculo acción↔hallazgo)  · `detectedAt` / `updatedAt`
 * Reglas nuevas (además de las de Fase 2): `demonstrated` exige evidencia de clase hecho con proves:'cause'; si el linaje incluye una fuente de IA, la causalidad máxima es `hypothesis`;
 * un hallazgo sin impacto cuantificable declara `economicsReason` (nunca un impacto inventado). */
const CC = require('./command-center-contracts.js');
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const KINDS = ['hecho_observado', 'desviacion', 'hipotesis', 'causa_comprobada', 'oportunidad', 'riesgo', 'recomendacion'];
const CAUSALITY = ['none', 'hypothesis', 'demonstrated'];
const AI_FAMILIES = ['ia', 'cohere', 'narrativa_ia'];

function kindOf(f) {
  if (f.type === 'risk') return 'riesgo'; if (f.type === 'opportunity') return 'oportunidad';
  if (f.certainty.level === 'hipotesis' || f.certainty.level === 'senal') return 'hipotesis';
  if (f.causality === 'demonstrated') return 'causa_comprobada';
  if (f.type === 'deviation') return 'desviacion';
  return 'hecho_observado';
}

function validateExtension(f) {
  const e = [], need = (c, m) => { if (!c) e.push(m); };
  if (f.causality !== undefined) need(CAUSALITY.includes(f.causality), `causality debe ser ${CAUSALITY.join(', ')}.`);
  if (f.kind !== undefined) need(KINDS.includes(f.kind), `kind debe ser ${KINDS.join(', ')}.`);
  if (f.causality === 'demonstrated') {
    need(f.evidence.some((x) => x.class === 'hecho' && x.proves === 'cause' && x.source && x.source.module), 'Una causa comprobada exige evidencia de clase «hecho» con proves:\'cause\' y fuente.');
    need(CC.STRENGTH[f.certainty.level] >= CC.STRENGTH.calculo, 'Una causa comprobada no puede tener una certeza menor que «cálculo».');
  }
  if (f.lineage.some((l) => AI_FAMILIES.includes(l.family)) && f.causality === 'demonstrated') e.push('La IA no puede elevar una hipótesis a causa comprobada.');
  if (f.certainty.level === 'hipotesis' || f.certainty.level === 'senal') need(f.causality !== 'demonstrated', 'Una hipótesis o señal no puede declararse causa comprobada.');
  if (f.dataReliability !== undefined) need(f.dataReliability && ['Alta', 'Media', 'Baja', 'Insuficiente'].includes(f.dataReliability.level) && f.dataReliability.contract === 'cc.reliability/1', 'dataReliability debe traer nivel y contrato cc.reliability/1.');
  if (f.actionRef !== undefined && f.actionRef !== null) need(typeof f.actionRef.id === 'string' && f.actionRef.id, 'actionRef debe traer el id de la acción.');
  if (f.economics === null || f.economics === undefined) need(f.economicsReason, 'Sin impacto económico debe indicarse economicsReason (no se inventa un impacto).');
  return e;
}
/** Contrato base de Fase 2 + extensión. */
function validate(f) { const base = CC.validateFinding(f); const ext = base.ok ? validateExtension(f) : []; return { ok: base.ok && !ext.length, errors: [...base.errors, ...ext] }; }

/* ---------- adaptador desde attentionEngine (sin tocarlo) ---------- */
const SEV = { blocking: 'critica', attention: 'importante', warning: 'seguimiento', info: 'seguimiento' };
const SUP = { alto: 'alto', medio: 'medio', bajo: 'bajo' };
const FAMILY = (id) => (/^driver_/.test(id) ? `driver:${CC.familyOf('driver:' + id.slice(7)).split(':')[1] || id.slice(7)}` : id);
/** @param item un elemento de AE.evaluate(...).findings · @param ctx { period:{type,key}, channel, today, dataReliability? } */
function fromAttentionItem(item, ctx) {
  const today = ctx.today || '2026-09-23', sup = SUP[(item.support && item.support.level) || 'medio'] || 'medio', amt = fin(item.amount) ? item.amount : null;
  const kind = item.kind, scope = { level: kind === 'channel' ? 'channel' : 'total', channel: kind === 'channel' ? (item.channel || ctx.channel || 'total') : (ctx.channel || 'total') };
  const base = { schema: 'cc.finding', version: 1, id: `f:attention:${item.id}`, title: item.title, description: item.what, scope, period: { type: ctx.period.type, key: ctx.period.key, comparison: 'plan' },
    severity: SEV[item.severity] || 'seguimiento', limitations: item.missing && item.missing.length ? item.missing.map(String) : [], validity: { status: 'activo', firstSeen: today, lastSeen: today, expiresWhen: 'el dato deja de mostrar la condición o cierra el periodo' },
    lineage: [{ engine: 'attentionEngine', id: item.id, role: 'origin', family: 'atencion' }], detectedAt: today, updatedAt: today };
  const ev = (cls, text, mod, field, nums, extra) => Object.assign({ class: cls, text, source: { module: mod, field }, numbers: (nums || []).filter(fin) }, extra || {});
  let f;
  if (kind === 'gap') f = { ...base, type: 'deviation', indicator: 'revenue', observed: { value: null, unit: 'MXN' }, reference: { value: null, basis: 'plan de los mismos días' }, evidence: [ev('calculo', (item.evidence || [])[0] || item.what, 'forecastEngine', 'toDate.revenue', [amt], { headline: true })],
    rule: { id: 'attention.gap', family: 'gap', version: 1 }, certainty: { level: 'calculo', support: sup, basis: (item.support && item.support.rule) || 'Respaldo del motor de atención.' }, causality: 'none' };
  else if (kind === 'driver') f = { ...base, type: 'deviation', indicator: item.id.replace(/^driver_/, '') === 'cr' ? 'conversionRate' : item.id.replace(/^driver_/, '') === 'traffic' ? 'trafficVolume' : 'aov', observed: { value: null, unit: 'MXN' }, reference: { value: null, basis: 'periodo base de la atribución' },
    evidence: [ev('driver', (item.evidence || [])[0] || item.what, 'attribution', 'contribution', [amt], { headline: true }), ev('hipotesis', item.hypothesis || 'Hipótesis sin confirmar.', 'hypothesisEngine', 'hypotheses', [], { validation: item.nextCheck || 'Comparar el embudo por semana.' })],
    rule: { id: `attention.${item.id}`, family: item.id, version: 1 }, certainty: { level: 'driver', support: sup, basis: 'Atribución matemática secuencial; no es una causa demostrada.' }, causality: 'hypothesis' };
  else if (kind === 'forecast') f = { ...base, type: 'risk', indicator: 'revenue', observed: { value: null, unit: 'MXN' }, reference: { value: null, basis: 'meta del periodo' }, evidence: [ev('estimacion', (item.evidence || [])[0] || item.what, 'forecastEngine', 'forecast', [amt], { headline: true })],
    rule: { id: 'attention.forecast', family: 'forecast', version: 1 }, certainty: { level: 'estimacion', support: sup, basis: 'Proyección con el ritmo observado.' }, causality: 'none', limitations: ['Es una proyección: depende de que el ritmo se mantenga.'] };
  else if (kind === 'channel') f = { ...base, type: 'deviation', indicator: 'revenue', observed: { value: null, unit: 'MXN' }, reference: { value: null, basis: 'plan del canal' }, evidence: [ev('calculo', (item.evidence || [])[0] || item.what, 'pacing', 'channels', [amt], { headline: true })],
    rule: { id: `attention.${item.id}`, family: `channel_${scope.channel}`, version: 1 }, certainty: { level: 'calculo', support: sup, basis: 'Cálculo por canal del motor de pacing.' }, causality: 'none' };
  else if (kind === 'data') f = { ...base, type: 'finding', indicator: 'dataQuality', observed: { value: null, unit: 'estado' }, reference: { value: null, basis: 'contrato de datos' }, evidence: [ev('hecho', (item.evidence || [])[0] || item.what, 'quality', item.id, [], { headline: true })],
    rule: { id: `attention.${item.id}`, family: item.id, version: 1 }, certainty: { level: 'hecho', support: 'alto', basis: 'Regla de calidad de datos.' }, causality: 'none' };
  else f = { ...base, type: 'finding', indicator: 'followup', observed: { value: null, unit: 'estado' }, reference: { value: null, basis: 'plan de acción' }, evidence: [ev('hecho', item.what, 'actionPlan', item.id, [], { headline: true })],
    rule: { id: `attention.${item.id}`, family: 'followup', version: 1 }, certainty: { level: 'hecho', support: 'alto', basis: 'Estado del plan de acción.' }, causality: 'none' };
  // sin impacto económico verificable en 4.1: se declara (nunca se inventa); 4.5 lo conectará con FP.economics
  f.economics = null; f.economicsReason = amt === null ? 'Sin importe cuantificable en el elemento de origen.' : 'El importe del elemento no se convierte en impacto hasta conectar FP.economics (Fase 4.5); no se duplica aquí.';
  if (kind === 'driver' || kind === 'gap') f.economicsReason = kind === 'driver' ? 'La contribución de un driver se presenta como contribución matemática, no como impacto propio (evita doble conteo con la brecha).' : f.economicsReason;
  if (ctx.dataReliability) f.dataReliability = { level: ctx.dataReliability, contract: 'cc.reliability/1' };
  f.recommendation = item.next ? { label: item.next.label, view: item.next.view } : null; f.actionRef = null; f.kind = kindOf(f);
  f.difference = null;
  return f;
}
module.exports = { KINDS, CAUSALITY, validate, validateExtension, fromAttentionItem, kindOf, CC };
