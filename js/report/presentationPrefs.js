/**
 * presentationPrefs.js — Preferencias y ediciones de la presentación que se guardan en este navegador (Presentation Intelligence · Fase 7).
 *
 * Puro: valida y normaliza lo que se lee del almacenamiento y arma lo que se guarda. No toca el reporte, no calcula cifras y no depende de la interfaz.
 *   - Se guarda la elección (audiencia, tipo, profundidad, láminas agregadas/quitadas, etiquetas, nombre en la portada, umbrales) y las ediciones de texto por lámina.
 *   - Lo guardado se valida contra el catálogo vigente: una audiencia o un tipo que ya no está habilitado, una profundidad desconocida o un umbral fuera de rango se
 *     descartan (se avisa cuáles) y rige el valor por defecto. Nunca se inventa un valor para tapar uno inválido.
 *   - Las ediciones son TEXTO de la persona (título y nota) y las hipótesis de IA que ella aceptó; ninguna puede contener ni sustituir una cifra calculada.
 * El almacenamiento (y su limpieza al cerrar sesión) lo maneja la aplicación: la clave `reportPrefs` es local, no viaja a la nube y se borra con los datos del equipo.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const SCHEMA = 'report_prefs', VERSION = 1;
  const LIMITS = Object.freeze({ title: 120, note: 280, hypotheses: 3, hypothesis: 220 });
  const RANGE = Object.freeze({ min: 0.001, max: 0.2 });
  const THRESHOLDS = ['belowPlanPct', 'weakPct', 'okPct', 'alertPct'];

  const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
  /** Texto de la persona: sin caracteres de control, espacios colapsados y con el largo máximo. Vacío → null. */
  function cleanText(v, max) {
    if (typeof v !== 'string') return null;
    const t = v.replace(/[\u0000-\u001F\u007F]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
    return t || null;
  }
  /** Una edición { title?, note?, hyp? } sin lo vacío; null si no queda nada. */
  function sanitizeEdit(e) {
    if (!e || typeof e !== 'object') return null;
    const out = {}, title = cleanText(e.title, LIMITS.title), note = cleanText(e.note, LIMITS.note);
    const hyp = (Array.isArray(e.hyp) ? e.hyp : []).map((h) => cleanText(h, LIMITS.hypothesis)).filter(Boolean).slice(0, LIMITS.hypotheses);
    if (title) out.title = title;
    if (note) out.note = note;
    if (hyp.length) out.hyp = hyp;
    return Object.keys(out).length ? out : null;
  }
  /** Clave de una edición: el perfil y la lámina (el mismo bloque puede tener otro título en otro formato). */
  const editKey = (profileId, unitId) => `${profileId}|${unitId}`;
  /** Láminas que no se editan: la portada y los anexos técnicos. */
  const EDITABLE_NOT = ['cover', 'annex'];

  const strList = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x && x.length <= 40) : null);

  /**
   * Normaliza lo leído del almacenamiento.
   * @returns { value, dropped }  value = { audience, type, depth, include, exclude, options, edits } con solo lo válido; dropped = qué se descartó y por qué.
   */
  function normalize(raw) {
    const dropped = [], value = {};
    const d = raw && typeof raw === 'object' ? raw : null;
    if (!d) return { value, dropped };
    if (d.schema !== SCHEMA || d.version !== VERSION) return { value, dropped: ['Las preferencias guardadas son de otra versión y no se aplicaron.'] };
    const K = FP.reportCatalog;
    const aud = K && typeof d.audience === 'string' ? K.audiences().find((a) => a.id === d.audience && a.enabled) : null;
    if (d.audience !== undefined && !aud) dropped.push(`La audiencia guardada «${d.audience}» ya no está disponible.`);
    if (aud) {
      const ty = typeof d.type === 'string' ? K.types(aud.id).find((x) => x.id === d.type && x.enabled) : null;
      if (!ty) dropped.push(`El tipo guardado «${d.type}» ya no está disponible para esa audiencia.`);
      else {
        value.audience = aud.id; value.type = ty.id;
        const prof = K.resolve(aud.id, ty.id), depths = (prof.depths || []).map((x) => x.id);
        if (d.depth !== undefined && d.depth !== null) { if (depths.includes(d.depth)) value.depth = d.depth; else dropped.push(`La profundidad guardada «${d.depth}» ya no existe en este formato.`); }
        const blocks = new Set(prof.slots.map((s) => s.block)), inc = strList(d.include), exc = strList(d.exclude);
        if (inc) value.include = inc.filter((b) => blocks.has(b));
        if (exc) value.exclude = exc.filter((b) => blocks.has(b));
        if ((inc && inc.length !== value.include.length) || (exc && exc.length !== value.exclude.length)) dropped.push('Se descartaron láminas guardadas que el formato ya no tiene.');
      }
    }
    if (d.options && typeof d.options === 'object') {
      const o = {};
      ['showTags', 'showBusinessName'].forEach((k) => { if (typeof d.options[k] === 'boolean') o[k] = d.options[k]; });
      const th = {};
      THRESHOLDS.forEach((k) => {
        const v = d.options.thresholds ? d.options.thresholds[k] : undefined;
        if (v === null || v === undefined) return;
        if (isNum(v) && v >= RANGE.min && v <= RANGE.max) th[k] = v; else dropped.push(`El umbral guardado «${k}» está fuera de rango y se descartó.`);
      });
      o.thresholds = th; value.options = o;
    }
    if (d.edits && typeof d.edits === 'object') {
      const e = {};
      Object.keys(d.edits).forEach((k) => {
        const [prof, unit] = k.split('|');
        if (!prof || !unit || EDITABLE_NOT.includes(unit) || !FP.reportProfiles.get(prof)) { dropped.push(`Se descartó una edición de lámina que ya no existe («${k}»).`); return; }
        const s = sanitizeEdit(d.edits[k]); if (s) e[k] = s;
      });
      value.edits = e;
    }
    return { value, dropped };
  }

  /** Lo que se guarda de la selección de la presentación (nunca el reporte generado, ni la IA, ni textos pendientes de enviar). */
  function serialize(rp) {
    const o = rp.options || {}, th = {};
    THRESHOLDS.forEach((k) => { const v = o.thresholds ? o.thresholds[k] : null; if (isNum(v)) th[k] = v; });
    const edits = {};
    Object.keys(rp.edits || {}).forEach((k) => { const s = sanitizeEdit(rp.edits[k]); if (s) edits[k] = s; });
    return { schema: SCHEMA, version: VERSION, audience: rp.audience, type: rp.type, depth: rp.depth, include: (rp.include || []).slice(), exclude: (rp.exclude || []).slice(),
      options: { showTags: Boolean(o.showTags), showBusinessName: Boolean(o.showBusinessName), thresholds: th }, edits };
  }

  FP.reportPrefs = { SCHEMA, VERSION, LIMITS, RANGE, THRESHOLDS, cleanText, sanitizeEdit, editKey, EDITABLE_NOT, normalize, serialize };
})(typeof window !== 'undefined' ? window : globalThis);
