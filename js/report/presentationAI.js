/**
 * presentationAI.js — Hipótesis de IA para una lámina (Presentation Intelligence · Fase 7). OPCIONAL y APAGADA por defecto.
 *
 * La IA recibe SOLO el texto ya armado de la lámina (titular, preguntas, lectura, notas, cifras con su etiqueta) y propone hasta 3 hipótesis a investigar.
 * No calcula, no recomienda cifras y no explica causas como hechos. Cada respuesta se valida antes de mostrarse; si falla algo, no se muestra nada:
 *   1. JSON con la forma esperada ({ hypotheses: [{ text }] }), 1 a 3 textos, cada uno de hasta 220 caracteres.
 *   2. Lenguaje de posibilidad obligatorio («podría», «es posible», «una hipótesis a investigar es», «es consistente con»…).
 *   3. Sin lenguaje causal afirmativo («la causa es», «esto demuestra», «se debe a»…).
 *   4. Ninguna cifra que no esté en la lámina (tolera formato: comas, K y M, % y redondeo).
 * Lo que la persona acepta se guarda como texto rotulado «Hipótesis (IA), por validar»; nada sale del navegador sin que la persona lo pida con el botón.
 * Reutiliza FP.cohereClient (misma conexión, mismo registro de transparencia FP.aiAudit).
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const MAX_HYP = 3, MAX_LEN = 220;
  const SYSTEM_RULES = [
    'Eres un analista comercial que propone HIPÓTESIS a investigar sobre una lámina de una presentación, en español de México.',
    'Responde únicamente con un objeto JSON con la forma {"hypotheses":[{"text":"..."}]}, de 1 a 3 hipótesis, cada una de máximo 220 caracteres.',
    'Reglas obligatorias:',
    '1. Usa solo lo que viene en el payload. No inventes cifras, fechas, canales, productos ni causas externas.',
    '2. No escribas ningún número que no esté en el payload; no calcules sumas, diferencias, porcentajes ni proyecciones.',
    '3. Cada hipótesis debe usar lenguaje de posibilidad ("podría", "es posible que", "una hipótesis a investigar es", "es consistente con") y proponer qué revisar.',
    '4. Nunca escribas "la causa es", "esto demuestra" ni "se debe a"; no presentes nada como un hecho confirmado ni como un resultado garantizado.',
    '5. No recomiendes inversiones, márgenes, ROI, ROAS ni CAC: no hay datos de costos.'
  ].join('\n');
  const SCHEMA = { type: 'object', properties: { hypotheses: { type: 'array', maxItems: MAX_HYP, items: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] } } }, required: ['hypotheses'] };
  const FORBIDDEN = [/la causa (es|fue|principal)/i, /esto demuestra/i, /se debe a/i, /caus[oó] (la|el|que)/i, /qued[oó] demostrado/i, /est[aá] garantizado/i, /sin duda/i];
  const POSSIBILITY = /(podr[ií]a|podr[ií]an|es posible|es probable que|una hip[oó]tesis|es consistente con|ser[ií]a consistente|vale la pena (revisar|investigar|verificar)|puede que|conviene (revisar|verificar))/i;
  const FORBIDDEN_BUSINESS = /\b(margen|ROI|ROAS|CAC)\b/i;

  const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
  /** Números escritos en un texto, como números (quita comas de miles; «38.3K» → 38.3 y 38300 se prueban aparte en la tolerancia). */
  function numbersIn(text) {
    const out = [], re = /(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?/g; let m;
    while ((m = re.exec(String(text || '')))) out.push(parseFloat(`${m[1].replace(/,/g, '')}${m[2] ? `.${m[2]}` : ''}`));
    return out;
  }
  /** Cifras que la lámina trae: todas las hojas numéricas de la página y los números escritos en sus textos. */
  function allowedOf(page) {
    const set = [], walk = (v) => {
      if (v === null || v === undefined) return;
      if (typeof v === 'number') { if (Number.isFinite(v)) set.push(v); return; }
      if (typeof v === 'string') { numbersIn(v).forEach((n) => set.push(n)); return; }
      if (Array.isArray(v)) { v.forEach(walk); return; }
      if (typeof v === 'object') Object.keys(v).forEach((k) => { if (k !== 'tags') walk(v[k]); });
    };
    walk(page);
    const vals = new Set();
    set.forEach((v) => { [v, Math.abs(v), v * 100, Math.abs(v) * 100, v / 1e3, v / 1e6, Math.abs(v) / 1e3, Math.abs(v) / 1e6].forEach((x) => vals.add(x)); });
    return [...vals];
  }
  const near = (a, v) => Math.abs(a - v) < 0.051 || Math.abs(Math.round(a) - v) < 0.5 || Math.abs(a - v) / Math.max(Math.abs(a), 1) < 0.005;
  const numberAllowed = (n, allowed) => allowed.some((a) => near(a, n));

  /** Lo que se envía: títulos y textos de la lámina y cifras con su etiqueta; nada más. */
  function payloadOf(page) {
    const F = FP.reportBuilder && FP.reportBuilder.fmt;
    const kpis = (page.kpis || []).filter((k) => k && (isNum(k.value) || typeof k.value === 'string')).map((k) => `${k.label}: ${isNum(k.value) && F ? F(k.kind || 'num2', k.value) : k.value}`);
    return { lamina: page.title, pregunta: page.question || null, titular: page.conclusion || page.headline || null, cifras: kpis, lectura: [].concat(page.review || [], page.caution || [], page.warning || []).filter((x) => typeof x === 'string'), notas: (page.notes || []).filter((x) => typeof x === 'string') };
  }

  /** @returns { ok, hypotheses, errors } — nunca lanza. */
  function validate(parsed, page) {
    const errors = [];
    const list = parsed && Array.isArray(parsed.hypotheses) ? parsed.hypotheses : null;
    if (!list || !list.length) return { ok: false, hypotheses: [], errors: ['La respuesta no trae hipótesis.'] };
    if (list.length > MAX_HYP) errors.push(`Trae más de ${MAX_HYP} hipótesis.`);
    const allowed = allowedOf(page), seen = new Set(), out = [];
    list.forEach((h, i) => {
      const text = h && typeof h.text === 'string' ? h.text.replace(/\s+/g, ' ').trim() : '';
      if (!text) { errors.push(`La hipótesis ${i + 1} está vacía.`); return; }
      if (text.length > MAX_LEN) errors.push(`La hipótesis ${i + 1} pasa de ${MAX_LEN} caracteres.`);
      if (!POSSIBILITY.test(text)) errors.push(`La hipótesis ${i + 1} no usa lenguaje de posibilidad.`);
      if (FORBIDDEN.some((re) => re.test(text))) errors.push(`La hipótesis ${i + 1} usa lenguaje causal o de certeza no permitido.`);
      if (FORBIDDEN_BUSINESS.test(text)) errors.push(`La hipótesis ${i + 1} menciona margen, ROI, ROAS o CAC, que no se calculan.`);
      const bad = numbersIn(text).filter((n) => !numberAllowed(n, allowed));
      if (bad.length) errors.push(`La hipótesis ${i + 1} cita cifras que no están en la lámina: ${[...new Set(bad)].slice(0, 3).join(', ')}.`);
      const k = text.toLowerCase(); if (seen.has(k)) { errors.push(`La hipótesis ${i + 1} está repetida.`); return; } seen.add(k);
      out.push(text);
    });
    return { ok: errors.length === 0, hypotheses: errors.length ? [] : out, errors };
  }

  /** Pide hipótesis. Solo se llama desde el botón de la persona. @returns Promise<{ ok, status, hypotheses, errors }> */
  async function ask(page, opts) {
    const o = opts || {};
    if (!page || page.status !== 'included') return { ok: false, status: 'unavailable', hypotheses: [], errors: ['La lámina no tiene datos.'] };
    const r = await FP.cohereClient.chatJson({ audit: { purpose: 'Hipótesis de presentación' }, system: SYSTEM_RULES, schema: SCHEMA, apiKey: o.apiKey, model: o.model, fetchImpl: o.fetchImpl,
      user: `Propón hipótesis a investigar sobre esta lámina, usando solo esta información ya calculada:\n${JSON.stringify(payloadOf(page))}` });
    if (!r.ok) return { ok: false, status: r.status, hypotheses: [], errors: r.errors || ['No se pudo consultar la IA.'] };
    const p = FP.cohereClient.parseJson(r.text);
    if (!p.ok) return { ok: false, status: 'invalid', hypotheses: [], errors: ['La respuesta no es JSON válido.'] };
    const v = validate(p.value, page);
    return { ok: v.ok, status: v.ok ? 'ok' : 'rejected', hypotheses: v.hypotheses, errors: v.errors };
  }

  FP.presentationAI = { MAX_HYP, MAX_LEN, SYSTEM_RULES, SCHEMA, numbersIn, allowedOf, payloadOf, validate, ask };
})(typeof window !== 'undefined' ? window : globalThis);
