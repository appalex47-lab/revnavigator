#!/usr/bin/env node
/* Presentation Intelligence · integridad estructural (riesgos de acoplamiento): orden de carga de los scripts, cobertura de páginas por perfil y choques de clases CSS.  node tools/test-report-integrity.js */
const fs = require('fs'), vm = require('vm');
let bad = 0; const t = (n, c, d) => { console.log((c ? '✔ ' : '✘ ') + n + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 500) : '')); if (!c) bad++; };

/* ---- 1 · orden de carga en index.html ---- */
const html = fs.readFileSync('index.html', 'utf8'), scripts = [...html.matchAll(/<script src="([^"?]+)/g)].map((m) => m[1]), at = (f) => scripts.indexOf(f);
const NEEDS = {
  'js/report/blocks.js': ['js/report/profiles.js'], 'js/report/catalog.js': ['js/report/profiles.js'],
  'js/report/operativo.js': ['js/report/reportBuilder.js', 'js/report/profiles.js', 'js/report/blocks.js'],
  'js/report/oportunidades.js': ['js/report/blocks.js', 'js/report/operativo.js'], 'js/report/gerencial.js': ['js/report/operativo.js', 'js/report/oportunidades.js'],
  'js/report/escenarios.js': ['js/report/blocks.js', 'js/report/operativo.js'], 'js/report/directivo.js': ['js/report/operativo.js', 'js/report/oportunidades.js', 'js/report/gerencial.js', 'js/report/escenarios.js'],
  'js/report/composer.js': ['js/report/profiles.js'], 'js/report/presentationPrefs.js': ['js/report/profiles.js', 'js/report/catalog.js'],
  'js/ui/report-operativo-view.js': ['js/ui/report-view.js', 'js/report/operativo.js'], 'js/ui/report-gerencial-view.js': ['js/ui/report-view.js', 'js/report/gerencial.js'],
  'js/ui/report-oportunidades-view.js': ['js/ui/report-view.js', 'js/report/oportunidades.js'], 'js/ui/report-directivo-view.js': ['js/ui/report-view.js', 'js/report/directivo.js'],
  'js/ui/report-escenarios-view.js': ['js/ui/report-view.js', 'js/report/escenarios.js'], 'js/ui/report-setup-view.js': ['js/report/catalog.js']
};
const missing = Object.keys(NEEDS).concat(...Object.values(NEEDS)).filter((f, i, a) => a.indexOf(f) === i && at(f) < 0);
t('todos los módulos del reporte están en index.html', missing.length === 0, missing);
const wrong = Object.entries(NEEDS).flatMap(([f, deps]) => deps.filter((d) => at(d) >= at(f)).map((d) => `${f} debe cargar después de ${d}`));
t('cada módulo se carga después de aquello de lo que depende (orden de scripts)', wrong.length === 0, wrong);
t('las preferencias y la IA de la presentación se cargan antes de app.js', ['js/report/presentationPrefs.js', 'js/report/presentationAI.js'].every((f) => at(f) >= 0 && at(f) < at('js/app.js')));
t('el reporte se arma sin módulos sueltos: todo js/report/*.js y los js/ui/report-*.js existentes están en index.html', (() => { const files = fs.readdirSync('js/report').map((f) => `js/report/${f}`).concat(fs.readdirSync('js/ui').filter((f) => f.startsWith('report-')).map((f) => `js/ui/${f}`)); return files.filter((f) => at(f) < 0); })().length === 0);

/* ---- 2 · cobertura de páginas por perfil ---- */
const ctx = { console, Math, Number, Object, Array, Date, JSON, Intl, String, Map, Set, Error }; ctx.globalThis = ctx; ctx.window = undefined; vm.createContext(ctx);
['js/config/config.js', 'js/calendar/calendar.js', 'js/forecast/methodAdvisor.js', 'js/report/reportBuilder.js', 'js/report/profiles.js', 'js/report/blocks.js', 'js/report/catalog.js', 'js/report/operativo.js', 'js/report/oportunidades.js', 'js/report/gerencial.js', 'js/report/escenarios.js', 'js/report/directivo.js'].forEach((f) => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx));
const P = ctx.FP.reportProfiles, rb = fs.readFileSync('js/report/reportBuilder.js', 'utf8'), ORDER = (/const ORDER = \[([^\]]+)\]/.exec(rb) || [, ''])[1].match(/'([a-zA-Z]+)'/g).map((x) => x.slice(1, -1));
t('se pudo leer la lista de páginas del armador', ORDER.length >= 15, ORDER);
const slotsOf = (id) => new Set(P.get(id).slots.map((s) => s.block));
t('los perfiles NO estrictos (reporte actual, Operativo, Gerencial) listan TODAS las páginas del armador (si no, una página nueva se añadiría al final sin orden)', ['legacy', 'operativo', 'gerencial'].every((id) => ORDER.every((o) => slotsOf(id).has(o))), ['legacy', 'operativo', 'gerencial'].map((id) => [id, ORDER.filter((o) => !slotsOf(id).has(o))]));
const DIRECTIVO_OUT = ['summary', 'drivers', 'categories', 'trends', 'customers', 'traffic', 'campaigns', 'recovery', 'seasonality', 'closing'];   // decisión explícita: no son del formato Directivo
const dSlots = slotsOf('directivo'), undecided = ORDER.filter((o) => !dSlots.has(o) && !DIRECTIVO_OUT.includes(o));
t('Directivo (estricto): toda página del armador está en sus slots o en la lista explícita de las que NO son del formato (una página nueva obliga a decidir)', undecided.length === 0, undecided);
t('lo que se declara fuera de Directivo no está en sus slots (la lista no se contradice)', DIRECTIVO_OUT.every((o) => !dSlots.has(o)));
t('cada bloque de un slot es una página del armador o un bloque registrado (nada huérfano)', ['operativo', 'gerencial', 'directivo'].every((id) => P.get(id).slots.every((s) => ORDER.includes(s.block) || ctx.FP.reportBlocks.has(s.block))), ['operativo', 'gerencial', 'directivo'].map((id) => P.get(id).slots.filter((s) => !(ORDER.includes(s.block) || ctx.FP.reportBlocks.has(s.block))).map((s) => s.block)));

/* ---- 3 · clases CSS: lo nuevo no pisa lo existente ---- */
const css = fs.readFileSync('css/report.css', 'utf8'), cut = css.indexOf('/* Fase 3'), strip = (c) => c.replace(/\/\*[\s\S]*?\*\//g, '');
const defined = (c) => { const out = new Set(); for (const m of strip(c).matchAll(/([^{}]+)\{/g)) for (const k of m[1].matchAll(/\.(rp-[a-z0-9_-]+)/g)) out.add(k[1]); return out; };
const pre = defined(css.slice(0, cut)), post = defined(css.slice(cut)), both = [...post].filter((c) => pre.has(c)), ALLOWED = ['rp-col-a', 'rp-col-b', 'rp-row'];   // redefinidos a propósito, acotados bajo .rp-op
t('las clases CSS de las Fases 3 a 8 no redefinen clases anteriores (salvo las acotadas a propósito bajo .rp-op)', both.every((c) => ALLOWED.includes(c)), both.filter((c) => !ALLOWED.includes(c)));
t('las redefiniciones permitidas están acotadas bajo .rp-op (no pisan el reporte actual)', ALLOWED.every((c) => [...strip(css.slice(cut)).matchAll(/([^{}]+)\{/g)].filter((m) => new RegExp(`\\.${c}(?![a-z0-9_-])`).test(m[1])).every((m) => /\.rp-op\b/.test(m[1]))));

/* ---- 4 · contraste (WCAG AA, 4.5:1 para texto normal) de los colores de estado sobre los fondos donde se usan ---- */
const tok = {}; for (const m of css.matchAll(/--([a-z]+):\s*(#[0-9A-Fa-f]{6})/g)) tok[m[1]] = m[2];
const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const WHITE = '#FFFFFF';
const PAIRS = [['green', WHITE], ['orange', WHITE], ['red', WHITE], ['blue', WHITE], ['grey', WHITE], ['navy', WHITE],   // semáforo, sellos y texto sobre la lámina
  ['green', tok.amber ? '#FFF4E0' : WHITE], ['orange', '#FFF4E0'], ['red', '#FFF4E0'], ['navy', '#FFF4E0'],           // avisos (fondo ámbar)
  ['navy', tok.sky], ['grey', tok.sky], ['blue', tok.sky]];                                                           // texto sobre fondo claro de las tablas
const low = PAIRS.filter(([f, b]) => ratio(tok[f], b) < 4.5).map(([f, b]) => `${f} (${tok[f]}) sobre ${b}: ${ratio(tok[f], b).toFixed(2)}`);
t('los colores de estado y texto cumplen contraste AA (4.5:1) sobre los fondos donde se usan', low.length === 0, low);
t('el semáforo y sus fichas usan fondo blanco (el ámbar sobre azul claro da 4.49:1, por debajo de AA)', /\.rp-sem-tile \{[^}]*background:#FFFFFF/.test(css) && /\.rp-dir__chips \.rp-sem \{[^}]*background:#FFFFFF/.test(css));

console.log(bad ? `\n${bad} FALLAS` : '\nTODO OK'); process.exit(bad ? 1 : 0);
