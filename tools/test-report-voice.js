#!/usr/bin/env node
/* Voz por formato: titulares de Gerencial y Directivo (js/report/voice.js).  node tools/test-report-voice.js */
const fs = require('fs'), vm = require('vm'), os = require('os'), path = require('path'), cp = require('child_process');
let bad = 0; const t = (n, c, d) => { console.log((c ? '✔ ' : '✘ ') + n + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 500) : '')); if (!c) bad++; };
const ctx = { console, Math, Number, Object, Array, Date, JSON, Intl, String, Map, Set, Error }; ctx.globalThis = ctx; ctx.window = undefined; vm.createContext(ctx);
['js/config/config.js', 'js/report/reportBuilder.js', 'js/report/voice.js'].forEach((f) => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx));
const V = ctx.FP.reportVoice;

/* ---- frases (con las cifras del ejemplo de septiembre) ---- */
const pg = (id, o) => ({ id, title: id, status: 'included', kpis: [], ...o });
const rep = (extra) => ({ pages: [pg('pacing', { kpis: [{ id: 'real', value: 15943683.96, kind: 'moneyC' }, { id: 'plan', value: 15956810, kind: 'moneyC' }, { id: 'compliance', value: 0.9991774, kind: 'pct' }, { id: 'forecast', value: 21761583.96 }] }),
  pg('movers', { minus: [{ type: 'Canal', name: 'Ecommerce', value: -38315.56 }, { type: 'Canal', name: 'App', value: -17662.23 }, { type: 'Factor', name: 'Ticket', value: -74174 }], plus: [{ type: 'Canal', name: 'WhatsApp', value: 46300 }] }),
  pg('drivers', { kpis: [{ id: 'gap', value: -13126.04, kind: 'smoney' }], tables: [{ id: 'drivers', rows: [{ driver: 'Tráfico', contribution: 110172.29 }, { driver: 'Ticket', contribution: -74174.1 }, { driver: 'Conversión', contribution: -49124.2 }] }] })].concat(extra || []) });
const tt = (prof, id, r) => V.title(prof, V.pageOf(r, id), r);
t('Gerencial · Pacing: «Vamos al 99.9 % del plan a la fecha ($15.9M de $16.0M)»', tt('gerencial', 'pacing', rep()) === 'Vamos al 99.9 % del plan a la fecha ($15.9M de $16.0M)', tt('gerencial', 'pacing', rep()));
t('Gerencial · Pacing con el semáforo en la presentación: «…: 3 de 4 canales en meta»', tt('gerencial', 'pacing', rep([pg('channelScorecard', { counts: { ok: 3, watch: 1, alert: 0 } })])) === 'Vamos al 99.9 % del plan a la fecha: 3 de 4 canales en meta');
t('Gerencial · Resumen: estado contra el plan y el canal que más resta', (() => { const r = rep(), p = pg('summary'); r.pages.push(p); return V.title('gerencial', p, r) === 'A la fecha vamos al 99.9 % del plan; Ecommerce es el canal que más resta ($38.3K)'; })());
t('Gerencial · Factores: la brecha y el factor que más pesa (sin decir que «es la causa»)', tt('gerencial', 'drivers', rep()) === 'La brecha es de −$13.1K; el factor que más pesa es tráfico (+$110K)', tt('gerencial', 'drivers', rep()));
t('Gerencial · Quién suma y resta: «Ecommerce resta $38.3K y WhatsApp suma $46.3K» (solo canales, no factores)', tt('gerencial', 'movers', rep()) === 'Ecommerce resta $38.3K y WhatsApp suma $46.3K');
t('Directivo · Pacing: «Vamos a la par del plan (−0.1 %)»; con −3.2 % dice «Vamos 3.2 % por debajo del plan a la fecha»', tt('directivo', 'pacing', rep()) === 'Vamos a la par del plan (−0.1 %)' && (() => { const r = rep(); r.pages[0].kpis.find((k) => k.id === 'compliance').value = 0.968; return tt('directivo', 'pacing', r) === 'Vamos 3.2 % por debajo del plan a la fecha'; })());
t('Directivo · Quién suma y resta: frase corta', tt('directivo', 'movers', rep()) === 'Ecommerce resta $38.3K; WhatsApp suma $46.3K');
t('Con solo canales que restan o solo que suman, lo dice sin inventar al otro lado', (() => { const r = rep(), m = V.pageOf(r, 'movers'); m.plus = []; const a = tt('gerencial', 'movers', r); m.plus = [{ type: 'Canal', name: 'WhatsApp', value: 100 }]; m.minus = []; return /ningún canal suma sobre el plan/.test(a) && /ningún canal resta contra el plan/.test(tt('gerencial', 'movers', r)); })());

/* ---- Operativo ---- */
const cpPage = (rows) => pg('channelPacing', { rows });
const repO = (rows) => rep(rows ? [cpPage(rows)] : []);
const ROWS = [{ label: 'Ecommerce', below: ['ticket', 'conversión'] }, { label: 'App', below: ['ticket'] }, { label: 'WhatsApp', below: [] }];
t('Operativo · Resumen: estado y el canal que más resta con sus indicadores bajo el plan (de «Pacing por canal»)', (() => { const r = repO(ROWS), p = pg('summary'); r.pages.push(p); return V.title('operativo', p, r) === 'A la fecha vamos al 99.9 % del plan; Ecommerce resta $38.3K y su ticket y conversión están bajo el plan'; })());
t('Operativo · Resumen: con un solo indicador usa singular («su ticket está bajo el plan»); sin indicadores o sin la lámina de canales, solo el monto', (() => { const one = repO([{ label: 'Ecommerce', below: ['ticket'] }]), none = repO([{ label: 'Ecommerce', below: [] }]), nocp = rep(); const f = (r) => { const p = pg('summary'); r.pages.push(p); return V.title('operativo', p, r); }; return /y su ticket está bajo el plan$/.test(f(one)) && f(none) === 'A la fecha vamos al 99.9 % del plan; Ecommerce resta $38.3K' && f(nocp) === 'A la fecha vamos al 99.9 % del plan; Ecommerce resta $38.3K'; })());
t('Operativo · Pacing: «Vamos al 99.9 % del plan a la fecha ($15.9M de $16.0M)»', tt('operativo', 'pacing', rep()) === 'Vamos al 99.9 % del plan a la fecha ($15.9M de $16.0M)');
t('Operativo · Factores: la brecha y los factores con su monto, del que más pesa al que menos', tt('operativo', 'drivers', rep()) === 'La brecha es de −$13.1K: tráfico +$110K, ticket −$74.2K y conversión −$49.1K', tt('operativo', 'drivers', rep()));
t('Operativo · Factores: con un solo factor no hay voz (necesita al menos dos): conserva el titular actual', (() => { const r = rep(); r.pages[2].tables[0].rows = r.pages[2].tables[0].rows.slice(0, 1); return tt('operativo', 'drivers', r) === null; })());
t('Operativo · Quién suma y resta: los dos canales que más restan con sus indicadores y el que más suma', tt('operativo', 'movers', repO(ROWS)) === 'Ecommerce resta $38.3K (ticket y conversión bajo el plan); App resta $17.7K (ticket bajo el plan); WhatsApp suma $46.3K', tt('operativo', 'movers', repO(ROWS)));
t('Operativo · Quién suma y resta: sin «Pacing por canal» solo montos; solo canales que suman lo dice', (() => { const a = tt('operativo', 'movers', rep()); const r = rep(), m = V.pageOf(r, 'movers'); m.minus = []; return a === 'Ecommerce resta $38.3K; App resta $17.7K; WhatsApp suma $46.3K' && tt('operativo', 'movers', r) === 'WhatsApp suma $46.3K y ningún canal resta contra el plan'; })());
t('El anexo de reglas lista las reglas de Operativo en audit() (voz o titular actual y qué faltó)', (() => { const r = rep(); r.pages.push(pg('summary')); const a = V.audit('operativo', r); return a.map((x) => x.id).sort().join() === 'drivers,movers,pacing,summary' && a.every((x) => x.source === 'voz'); })());

/* ---- sin dato no hay voz: se conserva el titular del reporte actual ---- */
t('Sin la página de pacing, sin cumplimiento o con un valor inválido: null (la vista usa el titular del reporte actual)', (() => { const a = { pages: [] }, b = rep(), c = rep(); b.pages[0].kpis = b.pages[0].kpis.filter((k) => k.id !== 'compliance'); c.pages[0].kpis.find((k) => k.id === 'compliance').value = NaN; return [a, b, c].every((r) => tt('gerencial', 'pacing', r) === null && tt('directivo', 'pacing', r) === null); })());
t('Los formatos y láminas sin regla (reporte actual, otras láminas) devuelven null', ['legacy'].every((p) => tt(p, 'pacing', rep()) === null) && tt('gerencial', 'trends', rep()) === null && V.title('gerencial', null, rep()) === null && V.title('gerencial', pg('pacing'), null) === null);
t('Nunca lanza con datos raros (null, tipos incorrectos)', (() => { try { const r = rep(); r.pages[1].minus = 'x'; r.pages[1].plus = 7; r.pages[2].tables = null; return [V.title('gerencial', V.pageOf(r, 'movers'), r), V.title('gerencial', V.pageOf(r, 'drivers'), r)].every((x) => x === null); } catch (e) { return false; } })());

/* ---- auditoría visible (el riesgo de caer al titular actual sin avisar) ---- */
t('audit(): por lámina dice si salió con la voz del formato o con el titular actual, y qué faltó', (() => { const r = rep(); r.pages.splice(2, 1); const a = V.audit('gerencial', r); return a.find((x) => x.id === 'pacing').source === 'voz' && a.find((x) => x.id === 'movers').source === 'voz' && !a.some((x) => x.id === 'drivers') && V.audit('legacy', r).length === 0 && (() => { r.pages[0].kpis = []; const b = V.audit('gerencial', r).find((x) => x.id === 'pacing'); return b.source === 'actual' && /pacing/.test(b.missing); })(); })());

/* ---- sobre los 89 reportes reales del armador ---- */
const tmp = path.join(os.tmpdir(), `rb_reports_v_${process.pid}.json`), tmp2 = tmp + '.g';
const r = cp.spawnSync(process.execPath, [path.join(__dirname, 'test-report-builder.js')], { env: { ...process.env, RB_GOLDEN_OUT: tmp2, RB_REPORTS_OUT: tmp }, encoding: 'utf8' });
if (r.status !== 0) { console.log('✘ test-report-builder.js falla por sí mismo'); process.exit(1); }
const reports = JSON.parse(fs.readFileSync(tmp, 'utf8')); fs.unlinkSync(tmp); fs.unlinkSync(tmp2);
const numIn = (s) => [...String(s).replace(/(\d),(\d{3})/g, '$1$2').matchAll(/\d+(?:\.\d+)?/g)].map((m) => parseFloat(m[0]));
const leaves = (v, out = []) => { if (typeof v === 'number' && Number.isFinite(v)) out.push(v); else if (Array.isArray(v)) v.forEach((x) => leaves(x, out)); else if (v && typeof v === 'object') Object.keys(v).forEach((k) => leaves(v[k], out)); return out; };
const allowed = (rep) => { const s = new Set(); leaves(rep.pages.filter((p) => p.status === 'included')).forEach((v) => [v, Math.abs(v), v * 100, Math.abs(v) * 100, v / 1e3, Math.abs(v) / 1e3, v / 1e6, Math.abs(v) / 1e6].forEach((x) => s.add(x))); return [...s]; };
const near = (a, v) => Math.abs(a - v) <= Math.max(0.051, Math.abs(a) * 0.005);
let silent = [], invented = [], causal = [], voz = 0, actual = 0, n = 0;
reports.forEach((rp, i) => ['gerencial', 'directivo', 'operativo'].forEach((prof) => Object.keys(V.RULES[prof]).forEach((id) => {
  const p = V.pageOf(rp, id); if (!p) return; n++;
  const miss = V.RULES[prof][id].needs(rp), s = V.title(prof, p, rp);
  if (miss) { actual++; if (s !== null) silent.push([i, prof, id, 'tiene titular pese a faltar: ' + miss]); return; }
  if (s === null) { silent.push([i, prof, id, 'tiene sus campos y no produjo titular']); return; }
  voz++;
  const al = allowed(rp); numIn(s).forEach((x) => { if (!al.some((a) => near(a, x))) invented.push([i, prof, id, x, s]); });
  if (/la causa|se debe a|esto demuestra|garantiz/i.test(s)) causal.push([i, prof, id, s]);
})));
t(`sobre ${reports.length} reportes reales: ninguna regla cae al titular actual teniendo sus campos (sin caídas silenciosas)`, silent.length === 0, silent.slice(0, 4));
t('todo número de un titular con voz existe en el reporte (nada inventado) y ninguno usa lenguaje causal', invented.length === 0 && causal.length === 0, { invented: invented.slice(0, 3), causal: causal.slice(0, 3) });
t(`la voz se usa en la mayoría de los casos (${voz} con voz, ${actual} sin los campos, de ${n})`, voz > 0 && voz >= actual, { voz, actual, n });
console.log(bad ? `\n${bad} FALLAS` : '\nTODO OK'); process.exit(bad ? 1 : 0);
