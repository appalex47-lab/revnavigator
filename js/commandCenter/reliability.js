/**
 * reliability.js — Contrato transversal de confiabilidad `cc.reliability/1` (Fase 4.1, P-05). Navegador (`FP.reliability`) y Node (`module.exports`).
 *
 * ORIGEN ÚNICO: port de tools/audit/confiabilidad-contrato.js (dimensiones, tipos de dato, matriz de usos, explicación). El NIVEL no se define aquí: viene de la evaluación ACEPTADA
 * de Z1 (D-05), que se pasa como `o1`. tools/test-fase4-1-contratos-js.js compara este módulo con la especificación en 4 000 entradas y compara el texto de las funciones.
 * Fase 4.2: el evaluador de Z1 está portado (js/commandCenter/z1.js); `assess(i)` lo usa si está cargado, o recibe `o1` explícito.
 * ESTADO: preparado para consumo; ningún módulo de la aplicación lo consume todavía (Fase 4.1). Ninguna IA decide la confiabilidad.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  const FP = (root.FP = root.FP || {}); FP.reliability = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';
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

  /**
   * @param {object} i  entrada de Z1 (+ opcionales: dataAgeDays, staleAfterDays, traceable, sample:{n,min}, methodVerifiable)
   * @param {object} o1 evaluación de Z1 ya calculada (salida de Z1.build(i)). Este módulo NO recalcula el nivel: lo recibe del evaluador de Z1 (D-05).
   */
  function assess(i, o1) {
    if (!o1 && typeof root.FP === 'object' && root.FP.z1 && typeof root.FP.z1.build === 'function') o1 = root.FP.z1.build(i);   // Fase 4.2: el evaluador de Z1 vive en js/commandCenter/z1.js
    if (!o1 || !o1.reliability || !o1.completeness) throw new Error('cc.reliability/1 requiere la evaluación de Z1 (o1): el nivel no se recalcula aquí.');
    const d = dimensions(i, o1), u = uses(i, o1);
    const ok = Object.entries(d).filter(([, v]) => v.kind === 'valido').map(([k]) => k);
    const missing = o1.completeness.missing.slice();
    const limits = [...o1.reliability.reasons, ...(o1.completeness.status !== 'verificada' ? [o1.completeness.note] : [])];
    return { contract: 'cc.reliability/1', decidedBy: 'regla determinista', level: o1.reliability.level, mode: o1.reliability.mode, causes: o1.reliability.causes, dimensions: d, uses: u, explain: { ok, missing, limits }, completeness: o1.completeness.status };
  }

  return { contract: 'cc.reliability/1', KINDS, USES, assess, dimensions, uses };
});
