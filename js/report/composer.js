/**
 * composer.js — Compositor determinista de presentaciones (Presentation Intelligence · Fase 1).
 *
 * Toma el reporte ya armado por FP.reportBuilder (las páginas con sus cifras, sellos y motivos de omisión) y un perfil (FP.reportProfiles) y devuelve
 * el PLAN de la presentación: qué láminas van, en qué orden, de qué tipo, por qué se incluyó o excluyó cada bloque, qué se manda a anexos y qué
 * limitaciones hay. NO calcula ni escribe cifras, NO modifica el reporte y NO depende de la interfaz.
 *
 * Con el perfil LEGACY reproduce, lámina por lámina, lo que el reporte actual dibujaba (mismas reglas que tenía FP.reportView.units):
 *   - solo páginas «included»; una página con `annex: true` no es lámina propia (su contenido va dentro del anexo técnico);
 *   - las que la persona quitó no entran; el resto se ordena por el orden del perfil y, a igualdad, por el del reporte;
 *   - el bloque «annex» se expande en las láminas A, B y C del perfil.
 *
 * Plan (schema deck_plan 1.0.0):
 *   { schema, version, profile, audience,
 *     slides:     [{ order, id, sub?, block, type, title, reason }],
 *     excluded:   [{ block, title, kind: 'sin-datos'|'en-anexo'|'seleccion-persona', reason }],
 *     annex:      [{ block, sub, title }],                  // las láminas del plan que son anexos
 *     limitations:[{ block, kind, text?, code? }] }          // avisos que el reporte ya trae (no se inventa texto)
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const SCHEMA = 'deck_plan', VERSION = '1.0.0';
  const PROFILES = () => FP.reportProfiles;

  /** Avisos que las páginas ya traen: se listan tal cual; el compositor no redacta ninguno. */
  function limitationsOf(report) {
    const out = [];
    (report.pages || []).filter((p) => p.status === 'included').forEach((p) => {
      if (typeof p.caveat === 'string' && p.caveat.trim()) out.push({ block: p.id, kind: 'advertencia', text: p.caveat });
      if (p.warning) out.push({ block: p.id, kind: 'confiabilidad', code: String(p.warning) });
      if (p.lag && p.lag.last) out.push({ block: p.id, kind: 'rezago', text: `Venta real hasta el ${p.lag.last} · faltan ${p.lag.days} ${p.lag.days === 1 ? 'día' : 'días'} del corte` });
      if (p.scope && p.scope.partial) out.push({ block: p.id, kind: 'periodo-parcial' });
    });
    return out;
  }

  /**
   * @param {object} report  salida de FP.reportBuilder.build
   * @param {object} [opts]  { profile = 'legacy', exclude = [] }  (exclude: ids de bloque que la persona quitó)
   */
  function compose(report, opts) {
    const o = opts || {}, profile = PROFILES().get(o.profile || 'legacy');
    if (!profile) throw new Error(`Perfil de presentación desconocido: «${o.profile}».`);
    if (profile.status !== 'enabled') throw new Error(`El perfil «${profile.id}» todavía no está habilitado.`);
    if (!report || !Array.isArray(report.pages)) throw new Error('El reporte no trae páginas.');
    const ex = new Set(o.exclude || []), slots = profile.slots;
    const rank = (id) => { const i = slots.findIndex((s) => s.block === id); return i < 0 ? slots.length : i; };   // lo que el perfil no conoce va al final, en el orden del reporte
    const typeOf = (id) => { const s = slots.find((x) => x.block === id); return s ? s.type : 'analisis'; };
    const excluded = [], candidates = [];

    report.pages.forEach((p, i) => {
      if (p.status !== 'included') excluded.push({ block: p.id, title: p.title, kind: 'sin-datos', reason: p.reason });
      else if (p.annex) {
        const host = (slots.find((s) => s.block === p.id) || {}).embeddedIn;
        excluded.push({ block: p.id, title: p.title, kind: 'en-anexo', reason: host ? `Su contenido va dentro del bloque «${host}» del perfil.` : 'Su contenido va dentro del anexo técnico.' });
      } else if (ex.has(p.id)) excluded.push({ block: p.id, title: p.title, kind: 'seleccion-persona', reason: 'Quitada por la persona al armar la presentación.' });
      else candidates.push({ p, i });
    });

    const slides = [], annex = [];
    candidates.sort((a, b) => rank(a.p.id) - rank(b.p.id) || a.i - b.i).forEach(({ p }) => {
      if (p.id === 'annex') {
        (profile.annexes || []).forEach((a) => {
          slides.push({ id: 'annex', sub: a.sub, block: 'annex', type: 'anexo', title: a.title, reason: 'Incluida: el anexo técnico documenta métodos, calidad de datos y omisiones.' });
          annex.push({ block: 'annex', sub: a.sub, title: a.title });
        });
      } else slides.push({ id: p.id, block: p.id, type: typeOf(p.id), title: p.title, reason: `Incluida: tiene datos y forma parte del perfil «${profile.label}».` });
    });
    slides.forEach((s, i) => { s.order = i + 1; });

    return { schema: SCHEMA, version: VERSION, profile: profile.id, audience: profile.audience, slides, excluded, annex, limitations: limitationsOf(report) };
  }

  /**
   * Láminas en la forma que FP.reportView ya usa: { id, sub?, title, page, number }. Con el perfil LEGACY es idéntica a la lista que la vista
   * calculaba por su cuenta antes de existir el compositor.
   */
  function units(report, exclude, opts) {
    const plan = compose(report, { ...(opts || {}), exclude });
    const byId = new Map(report.pages.map((p) => [p.id, p]));
    return plan.slides.map((s) => (s.id === 'annex' ? { id: 'annex', sub: s.sub, title: s.title, page: byId.get('annex'), number: s.order } : { id: s.id, title: s.title, page: byId.get(s.id), number: s.order }));
  }

  FP.reportComposer = { SCHEMA, VERSION, compose, units, limitationsOf };
})(typeof window !== 'undefined' ? window : globalThis);
