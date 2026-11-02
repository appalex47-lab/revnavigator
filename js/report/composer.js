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
 * Opciones: { profile = 'legacy', depth, exclude = [], include = [] }
 *   depth    id de profundidad del perfil; un bloque cuyo slot pide más profundidad queda fuera («profundidad»). Sin depth no se filtra nada.
 *   exclude  bloques que la persona quitó (siempre ganan).
 *   include  bloques que la persona agregó aunque la profundidad los deje fuera.
 *   edits    ediciones de la persona { 'perfil|bloque': {…} }: las páginas con `needs: 'edits'` (anexo de ediciones) solo entran si hay alguna.
 *
 * Plan (schema deck_plan 1.1.0):
 *   { schema, version, profile, audience, depth,
 *     slides:     [{ order, id, sub?, block, type, title, reason }],
 *     excluded:   [{ block, title, kind: 'sin-datos'|'en-anexo'|'fuera-de-perfil'|'seleccion-persona'|'profundidad', reason }],
 *     annex:      [{ block, sub, title }],                  // las láminas del plan que son anexos
 *     limitations:[{ block, kind, text?, code? }] }          // avisos que el reporte ya trae (no se inventa texto)
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const SCHEMA = 'deck_plan', VERSION = '1.1.0';
  const PROFILES = () => FP.reportProfiles;

  /** ¿Hay ediciones de la persona para este perfil? (las páginas con `needs: 'edits'` solo entran si las hay) */
  const hasEdits = (edits, profileId) => Boolean(edits) && Object.keys(edits).some((k) => k.startsWith(`${profileId}|`) && edits[k] && (edits[k].title || edits[k].note || (edits[k].hyp && edits[k].hyp.length)));

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
    const ex = new Set(o.exclude || []), inc = new Set(o.include || []), slots = profile.slots;
    const depths = (profile.depths || []).map((d) => d.id), dIdx = o.depth === undefined || o.depth === null ? -1 : depths.indexOf(o.depth);
    if (o.depth !== undefined && o.depth !== null && dIdx < 0) throw new Error(`El perfil «${profile.id}» no tiene la profundidad «${o.depth}».`);
    const depthOf = (id) => { const s = slots.find((x) => x.block === id); return s && s.depth ? depths.indexOf(s.depth) : -1; };
    const tooDeep = (id) => dIdx >= 0 && depthOf(id) > dIdx;
    const rank = (id) => { const i = slots.findIndex((s) => s.block === id); return i < 0 ? slots.length : i; };   // lo que el perfil no conoce va al final, en el orden del reporte
    const typeOf = (id) => { const s = slots.find((x) => x.block === id); return s ? s.type : 'analisis'; };
    const excluded = [], candidates = [];

    report.pages.forEach((p, i) => {
      if (p.status !== 'included') excluded.push({ block: p.id, title: p.title, kind: 'sin-datos', reason: p.reason });
      else if (p.needs === 'edits' && !hasEdits(o.edits, profile.id)) excluded.push({ block: p.id, title: p.title, kind: 'sin-datos', reason: 'No hay ediciones de texto ni hipótesis aceptadas en esta presentación.' });
      else if (p.annex) {
        const host = (slots.find((s) => s.block === p.id) || {}).embeddedIn, hostPage = host && report.pages.find((x) => x.id === host);
        excluded.push({ block: p.id, title: p.title, kind: 'en-anexo', reason: hostPage ? `Su contenido va dentro de «${hostPage.title}».` : 'Su contenido va dentro del anexo técnico.' });
      } else if (profile.strict && !slots.some((s) => s.block === p.id)) excluded.push({ block: p.id, title: p.title, kind: 'fuera-de-perfil', reason: `No forma parte del formato «${profile.label}».` });
      else if (ex.has(p.id)) excluded.push({ block: p.id, title: p.title, kind: 'seleccion-persona', reason: 'Fuera de la selección actual; se puede agregar con la casilla.' });
      else if (tooDeep(p.id) && !inc.has(p.id)) excluded.push({ block: p.id, title: p.title, kind: 'profundidad', reason: `Entra desde la profundidad «${(profile.depths.find((d) => d.id === slots.find((x) => x.block === p.id).depth) || {}).label}»; la elegida es «${(profile.depths[dIdx] || {}).label}».` });
      else candidates.push({ p, i, added: tooDeep(p.id) });
    });

    const slides = [], annex = [];
    candidates.sort((a, b) => rank(a.p.id) - rank(b.p.id) || a.i - b.i).forEach(({ p, added }) => {
      if (p.id === 'annex') {
        (profile.annexes || []).forEach((a) => {
          slides.push({ id: 'annex', sub: a.sub, block: 'annex', type: 'anexo', title: a.title, reason: added ? 'Agregada por la persona.' : 'Incluida: el anexo técnico documenta métodos, calidad de datos y omisiones.' });
          annex.push({ block: 'annex', sub: a.sub, title: a.title });
        });
      } else slides.push({ id: p.id, block: p.id, type: typeOf(p.id), title: p.title, reason: added ? 'Agregada por la persona.' : `Incluida: tiene datos y forma parte del perfil «${profile.label}».` });
    });
    slides.forEach((s, i) => { s.order = i + 1; });

    return { schema: SCHEMA, version: VERSION, profile: profile.id, audience: profile.audience, depth: dIdx < 0 ? null : o.depth, slides, excluded, annex, limitations: limitationsOf(report) };
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

  /**
   * Alterna un bloque de la selección de la persona y devuelve la nueva selección { exclude, include } (sin modificar la de entrada):
   *   en el plan → se quita (si lo había agregado contra la profundidad, se retira de include; si no, entra a exclude);
   *   quitado por la persona → se vuelve a poner; fuera por profundidad → se agrega; sin datos o dentro del anexo → no hay nada que alternar.
   */
  function toggle(report, sel, block) {
    const s = { profile: sel && sel.profile, depth: sel && sel.depth, exclude: (sel && sel.exclude ? sel.exclude : []).slice(), include: (sel && sel.include ? sel.include : []).slice(), edits: sel && sel.edits };
    const plan = compose(report, s), out = { exclude: s.exclude, include: s.include };
    const slot = (PROFILES().get(plan.profile).slots || []).find((x) => x.block === block);
    if (slot && slot.required) return out;   // una lámina obligatoria (la portada) no se puede quitar
    if (plan.slides.some((x) => x.block === block)) {
      if (out.include.includes(block)) out.include = out.include.filter((x) => x !== block); else if (!out.exclude.includes(block)) out.exclude.push(block);
      return out;
    }
    const e = plan.excluded.find((x) => x.block === block);
    if (e && e.kind === 'seleccion-persona') out.exclude = out.exclude.filter((x) => x !== block);
    else if (e && e.kind === 'profundidad' && !out.include.includes(block)) out.include.push(block);
    return out;
  }

  FP.reportComposer = { SCHEMA, VERSION, compose, units, toggle, limitationsOf };
})(typeof window !== 'undefined' ? window : globalThis);
