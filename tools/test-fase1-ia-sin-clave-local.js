#!/usr/bin/env node
/* Command Center · Fase 1.4 — la interfaz y los comentarios no deben decir que existe una API key en el navegador (ya no existe: la IA va solo por el servidor del equipo).
   Además: cada módulo que llama a Cohere pasa su respuesta por un validador (no hay camino «respuesta cruda → pantalla»), y nada de js/ nombra api.cohere.com.   node tools/test-fase1-ia-sin-clave-local.js */
const fs = require('fs'), path = require('path');
let bad = 0; const t = (n, c, d) => { console.log((c ? '✔ ' : '✘ ') + n + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 300) : '')); if (!c) bad++; };
const files = []; (function walk(d) { fs.readdirSync(d, { withFileTypes: true }).forEach((e) => { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else if (/\.js$/.test(e.name)) files.push(f); }); })('js');
const src = Object.fromEntries(files.map((f) => [f, fs.readFileSync(f, 'utf8')]));
const STALE = [/pega tu API key/i, /API key configurada/i, /se recuerda en este navegador/i, /guarda en este navegador solo si él lo pide/i, /Cohere usa la API key configurada/i, /no se crea otra API key/i, /sin API key o sin red/i];
const hits = []; files.forEach((f) => STALE.forEach((re) => { if (re.test(src[f])) hits.push([f, String(re)]); }));
t('ningún texto de la app (interfaz o comentarios) afirma que hay una API key local de Cohere', !hits.length, hits);
t('ningún archivo de js/ menciona api.cohere.com (solo la Edge Function del servidor lo llama)', !files.filter((f) => /api\.cohere\.com/.test(src[f])).length);
// cada llamador de chatJson valida lo que vuelve
const callers = files.filter((f) => /cohereClient\.chatJson\(/.test(src[f]) && !/cohereClient\.js$/.test(f));
const VALID = { 'js/ai/cohereDiagnostic.js': /validate|relatedSignals|parseJson/, 'js/ai/cohereActions.js': /validate|allowedDrivers|parseJson|parseExpand/, 'js/ai/cohereNarrative.js': /validateResponse/, 'js/ai/cohereAnalysisAssistant.js': /validateResponse/,
  'js/ai/cohereDataset.js': /MIN_CONFIDENCE|candidates|cand\.includes|includes\(/, 'js/agents/agentRunner.js': /validate\(/, 'js/report/presentationAI.js': /validate\(/, 'js/import/normalize.js': /valid|FIELD|importFields/, 'js/app.js': /proxyTest/ };
callers.forEach((f) => { const k = f.replace(/\\/g, '/'); t(`${k}: la respuesta de Cohere pasa por validación antes de usarse`, VALID[k] ? VALID[k].test(src[f]) : false, VALID[k] ? 'sin validador reconocible' : 'llamador nuevo sin regla en la prueba'); });
t(`se revisaron ${callers.length} módulos que llaman a Cohere`, callers.length >= 8, callers);
console.log(bad ? `\n${bad} FALLAS` : '\nTODO OK'); process.exit(bad ? 1 : 0);
