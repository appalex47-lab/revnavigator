#!/usr/bin/env node
/* Presentation Intelligence · Fase 7 — hipótesis de IA: validación anti-alucinación (js/report/presentationAI.js).  node tools/test-report-ai.js */
const fs = require('fs'), vm = require('vm');
let bad = 0; const t = (n, c, d) => { console.log((c ? '✔ ' : '✘ ') + n + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 400) : '')); if (!c) bad++; };
const ctx = { console, Math, Number, Object, Array, Date, JSON, Intl, String, Map, Set, Error, Promise }; ctx.globalThis = ctx; ctx.window = undefined; vm.createContext(ctx);
['js/config/config.js', 'js/report/reportBuilder.js', 'js/report/presentationAI.js'].forEach((f) => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx));
const FP = ctx.FP, A = FP.presentationAI;
const page = { id: 'riskOpp', title: 'Riesgo y oportunidad', status: 'included', question: '¿Dónde está el riesgo?', conclusion: 'Ecommerce concentra la brecha ($38.3K); WhatsApp la compensa en parte ($46.3K)', kpis: [{ label: 'Brecha', value: -38300, kind: 'moneyC' }], review: ['En Ecommerce: ticket −0.8 % bajo el plan.'], subtract: [{ label: 'Ecommerce', gap: -38300, gapPct: -0.006 }], notes: ['Los montos son venta, no utilidad.'] };
const v = (texts) => A.validate({ hypotheses: texts.map((text) => ({ text })) }, page);

t('Acepta una hipótesis con lenguaje de posibilidad y cifras de la lámina (K, %, formato)', v(['Podría ser que el ticket de Ecommerce, −0.8 %, esté ligado a la brecha de $38.3K; conviene revisar la mezcla de productos.']).ok);
t('Las cifras escritas con formato distinto se reconocen: 38,300 · 38.3K · 0.8 % (las del texto de la lámina)', v(['Es posible que 38,300 y 38.3K sean lo mismo y que el 0.8 % se explique por la mezcla de productos.']).ok);
t('Rechaza una cifra que no está en la lámina (p. ej. 12 %) y dice cuál', (() => { const r = v(['Podría ser que la conversión haya caído 12 % por el cambio de precio.']); return !r.ok && r.hypotheses.length === 0 && r.errors.some((e) => /12/.test(e)); })());
t('Solo valen las cifras que la IA recibió: un valor que solo estaba en el dato crudo de la lámina (0.6 %, la brecha en proporción) se rechaza', !v(['Podría ser que el 0.6 % de brecha se explique por el tráfico.']).ok);
t('Un número «cerca» de uno permitido no pasa por redondeo generoso (0.6 y 1 cuando el texto dice 0.8)', !v(['Podría ser que 0.6 sea relevante.']).ok && !v(['Es posible que 1 caso explique la brecha.']).ok && !v(['Es posible que 39K explique la brecha.']).ok);
t('Rechaza nombrar un canal que la lámina no menciona (App, Llamadas) y acepta los que sí menciona (Ecommerce, WhatsApp)', !v(['Podría ser que App explique la brecha.']).ok && !v(['Una hipótesis a investigar es Llamadas.']).ok && v(['Podría ser que WhatsApp compense lo que resta Ecommerce.']).ok);
t('Rechaza lenguaje causal o de certeza: «la causa es», «esto demuestra», «se debe a», «sin duda», «está garantizado»', ['La causa es el precio y podría corregirse.', 'Esto demuestra que podría haber un problema.', 'Podría ser que se debe a la mezcla.', 'Sin duda es posible que mejore.', 'Podría ser, y está garantizado, que mejore.'].every((s) => !v([s]).ok));
t('Exige lenguaje de posibilidad: una afirmación sin «podría», «es posible», «una hipótesis»… se rechaza', !v(['Ecommerce tiene un problema de tráfico.']).ok && v(['Una hipótesis a investigar es el tráfico de Ecommerce.']).ok);
t('Rechaza menciones de margen, ROI, ROAS o CAC (no hay datos de costos)', ['Podría ser que el margen de Ecommerce baje.', 'Es posible que el ROAS explique la brecha.'].every((s) => !v([s]).ok));
t('Rechaza más de 3 hipótesis, textos de más de 220 caracteres, vacíos y repetidas', !v(['Podría ser A.', 'Podría ser B.', 'Podría ser C.', 'Podría ser D.']).ok && !v(['Podría ser ' + 'x'.repeat(230)]).ok && !v(['  ']).ok && !v(['Podría ser A.', 'podría ser a.']).ok);
t('Rechaza formas inválidas: sin hipótesis, no es objeto, o hypotheses no es lista', [null, {}, { hypotheses: [] }, { hypotheses: 'texto' }, 'x'].every((p) => !A.validate(p, page).ok));
t('Con un error NO devuelve ninguna hipótesis (todo o nada), aunque otra fuera válida', (() => { const r = v(['Podría ser el tráfico de Ecommerce.', 'La causa es el precio y podría corregirse.']); return !r.ok && r.hypotheses.length === 0; })());
t('El payload enviado trae solo texto de la lámina y cifras con etiqueta (sin datos crudos, sin claves)', (() => { const p = A.payloadOf(page), s = JSON.stringify(p); return Object.keys(p).sort().join() === 'cifras,lamina,lectura,notas,pregunta,titular' && s.includes('Brecha:') && !/apiKey|subtract|gapPct/.test(s); })());
t('Las reglas del sistema prohíben cifras nuevas, causas y costos', /No escribas ningún número/.test(A.SYSTEM_RULES) && /Nunca escribas "la causa es"/.test(A.SYSTEM_RULES) && /ROAS/.test(A.SYSTEM_RULES));

/* ---- ask(): cliente simulado ---- */
const fakeClient = (reply) => ({ chatJson: async () => reply, parseJson: (txt) => { try { return { ok: true, value: JSON.parse(txt) }; } catch (e) { return { ok: false, value: null }; } } });
(async () => {
  const run = async (reply) => { FP.cohereClient = fakeClient(reply); return A.ask(page, {}); };
  const ok = await run({ ok: true, status: 'ok', text: JSON.stringify({ hypotheses: [{ text: 'Podría ser que el ticket de Ecommerce influya en la brecha de $38.3K.' }] }) });
  t('ask: respuesta válida → hipótesis listas', ok.ok && ok.status === 'ok' && ok.hypotheses.length === 1);
  const rej = await run({ ok: true, status: 'ok', text: JSON.stringify({ hypotheses: [{ text: 'La causa es el precio.' }] }) });
  t('ask: respuesta que viola las reglas → rechazada y sin hipótesis', !rej.ok && rej.status === 'rejected' && rej.hypotheses.length === 0 && rej.errors.length > 0);
  const inv = await run({ ok: true, status: 'ok', text: 'esto no es json' });
  t('ask: texto que no es JSON → inválido', !inv.ok && inv.status === 'invalid');
  const un = await run({ ok: false, status: 'unavailable', errors: ['Sin key'] });
  t('ask: sin conexión o sin key → no disponible con su motivo', !un.ok && un.status === 'unavailable' && un.errors[0] === 'Sin key');
  const om = await A.ask({ id: 'x', status: 'omitted' }, {});
  t('ask: una lámina sin datos no se envía', !om.ok && om.status === 'unavailable');
  let called = false; FP.cohereClient = { chatJson: async (a) => { called = true; return { ok: false, status: 'x', errors: [] }; }, parseJson: () => ({ ok: false }) }; A.validate({ hypotheses: [] }, page);
  t('validate no llama a la red (la validación es local)', called === false);
  console.log(bad ? `\n${bad} FALLAS` : '\nTODO OK'); process.exit(bad ? 1 : 0);
})();
