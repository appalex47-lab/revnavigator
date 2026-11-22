/* Command Center · Fase 4.1 — CONTRATO TRANSVERSAL DE CONFIABILIDAD `cc.reliability/1` como ESPECIFICACIÓN EJECUTABLE (no es código de la aplicación).
 *
 * No crea una segunda definición de confiabilidad: se apoya en la evaluación ACEPTADA de Z1 (tools/audit/z1-lectura-ejecutiva.js, D-05 incluido) para el NIVEL y le añade:
 *   · dimensiones explícitas (completitud, cobertura, vigencia, consistencia, trazabilidad, comparabilidad, suficiencia de muestra) con tipos de dato
 *     válido · parcial · insuficiente · inconsistente · no_disponible · desactualizado · no_evaluado;
 *   · una matriz de USOS: qué operaciones están permitidas, restringidas o bloqueadas (mostrar métrica, clasificar estado, diagnosticar, recomendar, estimar impacto, concluir);
 *   · una explicación: qué está bien, qué falta, qué limita.
 * Reglas: la confiabilidad NO modifica el dato (solo lo califica); un dato de baja confiabilidad no se vuelve cero; la venta observada válida se muestra aunque no alcance para la brecha;
 * las restricciones dependen del USO; ninguna IA decide la confiabilidad (`decidedBy: 'regla determinista'`). */
const Z1 = require('./z1-lectura-ejecutiva.js');
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const KINDS = ['valido', 'parcial', 'insuficiente', 'inconsistente', 'no_disponible', 'desactualizado', 'no_evaluado'];
const USES = ['show_metric', 'classify_state', 'diagnose', 'recommend', 'estimate_impact', 'executive_conclusion'];

function dimensions(i, o1) {
  const cov = i.reliability && i.reliability.coverage, comp = o1.completeness, d = {};
  d.completeness = { kind: comp.status === 'verificada' ? 'valido' : comp.status === 'incompleta' ? 'parcial' : 'insuficiente', note: comp.note };
  d.coverage = { kind: !fin(cov) ? 'no_disponible' : cov >= 0.9 ? 'valido' : cov >= 0.6 ? 'parcial' : 'insuficiente', value: fin(cov) ? cov : null };
  d.freshness = !fin(i.dataAgeDays) ? { kind: 'no_evaluado', note: 'no se informó la antigüedad del dato' } : fin(i.staleAfterDays) && i.dataAgeDays > i.staleAfterDays ? { kind: 'desactualizado', value: i.dataAgeDays } : { kind: 'valido', value: i.dataAgeDays };
  const inconsistent = (o1.data.issues || []).length > 0 || (o1.data.reconciliation && o1.data.reconciliation.status === 'pendiente');
  d.consistency = { kind: o1.reliability.causes.includes('no_calculable') || inconsistent ? 'inconsistente' : (i.reliability && (i.reliability.dataErrors || i.reliability.support === 'bajo')) ? 'parcial' : 'valido', issues: (o1.data.issues || []).map((x) => x.code) };
  d.traceability = i.traceable === undefined ? { kind: 'no_evaluado', note: 'no se informó la trazabilidad del origen' } : { kind: i.traceable ? 'valido' : 'insuficiente' };
  d.comparability = { kind: o1.comparability.code === 'valida' ? 'valido' : o1.comparability.code === 'sin_actividad' ? 'no_disponible' : 'parcial', code: o1.comparability.code };
  d.sample = i.sample && fin(i.sample.n) && fin(i.sample.min) ? { kind: i.sample.n >= i.sample.min ? 'valido' : 'insuficiente', n: i.sample.n, min: i.sample.min, note: 'criterio aportado por quien llama: no existe un umbral universal (D-03)' } : { kind: 'no_evaluado', note: 'sin criterio de muestra aprobado (D-03)' };
  return d;
}

function uses(i, o1) {
  const lvl = o1.reliability.level, c = o1.conclusions, u = {}, A = (restriction, reasons) => ({ allowed: restriction !== 'bloqueado', restriction, reasons: reasons || [] });
  // mostrar una métrica observada: la venta observada válida se muestra siempre (D-01 de 3.2); solo se bloquea si el propio dato no es utilizable
  u.show_metric = o1.economic.observed.visible ? A('none') : A('bloqueado', [o1.economic.observed.reason || 'la venta observada no es válida']);
  u.classify_state = c.cumplimiento === 'no_concluyente' ? A('bloqueado', ['sin plan, cobertura insuficiente o actividad no verificable: no se emite estado frente al plan']) : c.cumplimiento === 'preliminar' ? A('preliminar', ['lectura preliminar']) : c.cumplimiento === 'con_reservas' ? A('con_reservas') : A('none');
  u.diagnose = lvl === 'Alta' ? A('none') : lvl === 'Media' ? A('con_reservas', ['la lectura va con avisos']) : lvl === 'Baja' ? A('preliminar', ['solo lo observado: sin conclusión de causas']) : A('bloqueado', ['datos insuficientes']);
  u.recommend = lvl === 'Alta' || lvl === 'Media' ? A(lvl === 'Alta' ? 'none' : 'con_reservas') : A('solo_datos', ['solo acciones para completar o corregir datos']);
  const convOk = c.conversion === 'observable' || c.conversion === 'cero_observado';
  u.estimate_impact = (lvl === 'Alta' || lvl === 'Media') && i.methodVerifiable !== false ? A(lvl === 'Alta' ? 'none' : 'con_reservas', convOk ? [] : ['impactos basados en conversión no verificables: no se estiman']) : A('bloqueado', [i.methodVerifiable === false ? 'sin metodología verificable' : 'confiabilidad insuficiente para estimar']);
  u.executive_conclusion = lvl === 'Alta' ? A('none') : lvl === 'Media' ? A('con_reservas') : lvl === 'Baja' ? A('preliminar') : A('bloqueado', ['no es posible emitir una lectura del negocio']);
  return u;
}

/** @param {object} i entrada de Z1 (+ opcionales: dataAgeDays, staleAfterDays, traceable, sample:{n,min}, methodVerifiable) */
function assess(i) {
  const o1 = Z1.build(i), d = dimensions(i, o1), u = uses(i, o1);
  const ok = Object.entries(d).filter(([, v]) => v.kind === 'valido').map(([k]) => k);
  const missing = o1.completeness.missing.slice();
  const limits = [...o1.reliability.reasons, ...(o1.completeness.status !== 'verificada' ? [o1.completeness.note] : [])];
  return { contract: 'cc.reliability/1', decidedBy: 'regla determinista', level: o1.reliability.level, mode: o1.reliability.mode, causes: o1.reliability.causes, dimensions: d, uses: u, explain: { ok, missing, limits }, completeness: o1.completeness.status };
}
module.exports = { KINDS, USES, assess, dimensions, uses };
