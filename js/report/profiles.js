/**
 * profiles.js — Perfiles de presentación (Presentation Intelligence · Fase 1).
 *
 * Un perfil describe, de forma DECLARATIVA, qué bloques de contenido (las páginas que arma FP.reportBuilder) puede llevar una presentación,
 * en qué orden y con qué tipo de lámina. No calcula nada ni contiene texto de negocio: el compositor (FP.reportComposer) lo lee.
 *
 * Hoy solo existe el perfil LEGACY (el reporte actual, tal cual). Las audiencias nuevas (operativo, gerencial, directivo) se registrarán
 * con FP.reportProfiles.register() cuando puedan generar una presentación coherente; un perfil con status «planned» nunca se ofrece ni se compone.
 *
 * Contrato de un perfil (schema report_profile 1.0.0):
 *   { id, label, status: 'enabled'|'planned', audience: string|null, presentationTypes: string[], depths: string[],
 *     slots: [{ block, type: 'portada'|'analisis'|'cierre'|'anexo', embeddedIn?: string }],   // orden de lectura
 *     annexes: [{ sub, title }],                                                                // láminas en que se expande el bloque 'annex'
 *     defaultExclude: string[] }                                                                // bloques apagados al abrir la vista previa
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const SCHEMA = 'report_profile', VERSION = '1.0.0';
  const STATUS = ['enabled', 'planned'], TYPES = ['portada', 'analisis', 'cierre', 'anexo'];

  const deepFreeze = (o) => { if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); Object.values(o).forEach(deepFreeze); } return o; };

  /** Problemas de un perfil (lista vacía = válido). */
  function validate(p) {
    const bad = [], add = (m) => bad.push(m);
    if (!p || typeof p !== 'object') return ['El perfil no es un objeto.'];
    if (typeof p.id !== 'string' || !/^[a-z][a-z0-9_-]*$/.test(p.id)) add('id inválido (minúsculas, números, guion).');
    if (typeof p.label !== 'string' || !p.label.trim()) add('Falta label.');
    if (!STATUS.includes(p.status)) add(`status debe ser ${STATUS.join(' o ')}.`);
    if (!Array.isArray(p.slots) || !p.slots.length) add('slots debe ser una lista no vacía.');
    const blocks = new Set();
    (p.slots || []).forEach((s, i) => {
      if (!s || typeof s.block !== 'string' || !s.block) { add(`slots[${i}] sin block.`); return; }
      if (blocks.has(s.block)) add(`slots[${i}]: el bloque «${s.block}» está repetido.`);
      blocks.add(s.block);
      if (!TYPES.includes(s.type)) add(`slots[${i}] («${s.block}»): type debe ser ${TYPES.join(', ')}.`);
      if (s.embeddedIn !== undefined && !(typeof s.embeddedIn === 'string' && (p.slots || []).some((x) => x.block === s.embeddedIn))) add(`slots[${i}] («${s.block}»): embeddedIn debe ser otro bloque del perfil.`);
    });
    (p.defaultExclude || []).forEach((b) => { if (!blocks.has(b)) add(`defaultExclude: «${b}» no es un bloque del perfil.`); });
    if (p.annexes !== undefined) {
      if (!Array.isArray(p.annexes)) add('annexes debe ser una lista.');
      else p.annexes.forEach((a, i) => { if (!a || !Number.isInteger(a.sub) || typeof a.title !== 'string' || !a.title) add(`annexes[${i}] necesita sub (entero) y title.`); });
      if (Array.isArray(p.annexes) && p.annexes.length && !blocks.has('annex')) add('annexes requiere el bloque «annex» en slots.');
    }
    ['presentationTypes', 'depths'].forEach((k) => { if (p[k] !== undefined && !Array.isArray(p[k])) add(`${k} debe ser una lista.`); });
    return bad;
  }

  /* ---------- LEGACY: el reporte actual, sin cambios ---------- */
  const LEGACY = {
    schema: SCHEMA, version: VERSION, id: 'legacy', status: 'enabled',
    label: 'Reporte actual (compatibilidad)',
    description: 'El reporte ejecutivo que la aplicación genera hoy: mismas páginas, mismo orden, mismos textos.',
    audience: null, presentationTypes: [], depths: [],
    // Orden de lectura de la presentación. «reliability» no es una lámina propia: su contenido va dentro del Anexo B.
    slots: [
      { block: 'cover', type: 'portada' }, { block: 'summary', type: 'analisis' }, { block: 'pacing', type: 'analisis' }, { block: 'drivers', type: 'analisis' },
      { block: 'movers', type: 'analisis' }, { block: 'categories', type: 'analisis' }, { block: 'trends', type: 'analisis' }, { block: 'customers', type: 'analisis' },
      { block: 'traffic', type: 'analisis' }, { block: 'campaigns', type: 'analisis' }, { block: 'seasonality', type: 'analisis' }, { block: 'recovery', type: 'analisis' },
      { block: 'closing', type: 'cierre' }, { block: 'decisions', type: 'cierre' }, { block: 'reliability', type: 'anexo', embeddedIn: 'annex' }, { block: 'annex', type: 'anexo' }
    ],
    annexes: [
      { sub: 1, title: 'Anexo técnico A · Calidad de datos y brechas' },
      { sub: 2, title: 'Anexo técnico B · Métodos, backtest y confiabilidad' },
      { sub: 3, title: 'Anexo técnico C · Definiciones y límites' }
    ],
    defaultExclude: ['reliability', 'seasonality', 'annex']
  };

  const REG = new Map();
  /** Registra un perfil validado y congelado. Lanza si es inválido o si el id ya existe (nada se sobrescribe en silencio). */
  function register(p) {
    const bad = validate(p);
    if (bad.length) throw new Error(`Perfil «${p && p.id}» inválido: ${bad.join(' ')}`);
    if (REG.has(p.id)) throw new Error(`Ya existe un perfil «${p.id}».`);
    REG.set(p.id, deepFreeze(JSON.parse(JSON.stringify({ schema: SCHEMA, version: VERSION, ...p }))));
    return REG.get(p.id);
  }
  const get = (id) => REG.get(id) || null;
  /** Perfiles registrados; por defecto solo los habilitados (un perfil «planned» no se ofrece). */
  const list = (opts) => { const all = opts && opts.enabledOnly === false; return [...REG.values()].filter((p) => all || p.status === 'enabled'); };

  register(LEGACY);

  FP.reportProfiles = { SCHEMA, VERSION, STATUS, TYPES, validate, register, get, list };
})(typeof window !== 'undefined' ? window : globalThis);
