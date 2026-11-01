#!/usr/bin/env node
/* Presentation Intelligence · Fase 1 — compositor (js/report/composer.js) y su EQUIVALENCIA con la lógica anterior de FP.reportView.units.
   Se compara, sobre los 89 reportes de test-report-builder.js y varias selecciones de la persona, la lista de láminas del compositor contra una
   copia CONGELADA del código anterior.   node tools/test-report-composer.js */
const fs = require('fs'), vm = require('vm'), os = require('os'), path = require('path'), cp = require('child_process');
let bad = 0; const t = (n, c, d) => { console.log((c ? '✔ ' : '✘ ') + n + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 360) : '')); if (!c) bad++; };
const throws = (f) => { try { f(); return null; } catch (e) { return e.message; } };
const mk = () => { const ctx = { console, JSON, Object, Array, Map, Set, Number, String, Error, Math }; ctx.globalThis = ctx; ctx.window = undefined; vm.createContext(ctx); ['profiles', 'composer'].forEach((f) => vm.runInContext(fs.readFileSync(`js/report/${f}.js`, 'utf8'), ctx)); return ctx.FP; };
const FP = mk(), C = FP.reportComposer;

/* ---- copia CONGELADA de FP.reportView.units antes del compositor (js/ui/report-view.js, commit 39e507c) ---- */
function legacyUnits(report, exclude) {
  const ex = new Set(exclude || []), out = [];
  const ORDER = ['cover', 'summary', 'pacing', 'drivers', 'movers', 'categories', 'trends', 'customers', 'traffic', 'campaigns', 'seasonality', 'recovery', 'closing', 'decisions', 'reliability', 'annex'], rank = (id) => { const i = ORDER.indexOf(id); return i < 0 ? ORDER.length : i; };
  report.pages.filter((p) => p.status === 'included' && !p.annex && !ex.has(p.id)).map((p, i) => ({ p, i })).sort((a, b) => rank(a.p.id) - rank(b.p.id) || a.i - b.i).map((o) => o.p).forEach((p) => {
    if (p.id === 'annex') [['Anexo técnico A · Calidad de datos y brechas', 1], ['Anexo técnico B · Métodos, backtest y confiabilidad', 2], ['Anexo técnico C · Definiciones y límites', 3]].forEach(([t2, s]) => out.push({ id: 'annex', sub: s, title: t2, page: p }));
    else out.push({ id: p.id, title: p.title, page: p });
  });
  out.forEach((u, i) => { u.number = i + 1; });
  return out;
}
const tmp = path.join(os.tmpdir(), `rb_reports_${process.pid}.json`), tmp2 = tmp + '.g';
const r = cp.spawnSync(process.execPath, [path.join(__dirname, 'test-report-builder.js')], { env: { ...process.env, RB_GOLDEN_OUT: tmp2, RB_REPORTS_OUT: tmp }, encoding: 'utf8' });
if (r.status !== 0) { console.log('✘ test-report-builder.js falla por sí mismo'); process.exit(1); }
const reports = JSON.parse(fs.readFileSync(tmp, 'utf8')); fs.unlinkSync(tmp); fs.unlinkSync(tmp2);
t('se obtuvieron los 89 reportes del armador', reports.length === 89, reports.length);

const allIds = (rep) => rep.pages.map((p) => p.id);
const selections = [['default', () => ['reliability', 'seasonality', 'annex']], ['ninguna', () => []], ['sin pacing', () => ['pacing']], ['sin resumen, cierre y decisiones', () => ['summary', 'closing', 'decisions']],
  ['solo anexo fuera', () => ['annex']], ['todo fuera', (rep) => allIds(rep)], ['ids inexistentes', () => ['zzz', 'nada']], ['undefined', () => undefined]];
const shape = (us) => us.map((u) => [u.id, u.sub === undefined ? null : u.sub, u.title, u.page && u.page.id, u.number, Object.keys(u).sort().join(',')]);
let combos = 0, same = 0, identical = 0;
reports.forEach((rep, n) => selections.forEach(([name, f]) => {
  const ex = f(rep), a = legacyUnits(rep, ex), b = C.units(rep, ex); combos++;
  const sameShape = JSON.stringify(shape(a)) === JSON.stringify(shape(b)), samePages = a.length === b.length && a.every((u, i) => u.page === rep.pages.find((p) => p.id === b[i].page.id));
  if (sameShape && samePages) same++; else if (!identical++) t(`diferencia en reporte #${n} con «${name}»`, false, { antes: shape(a).slice(0, 4), ahora: shape(b).slice(0, 4) });
}));
t(`EQUIVALENCIA: ${combos} combinaciones (89 reportes × ${selections.length} selecciones) con las mismas láminas, orden, títulos, subanexos, numeración y forma`, same === combos, { same, combos });
t('las láminas apuntan a la MISMA página del reporte (no a una copia)', reports.every((rep) => C.units(rep, []).every((u) => rep.pages.includes(u.page))));

/* ---- el plan: razones, exclusiones y avisos ---- */
let planOk = 0, anyLimit = 0, bySlide = 0, noMutate = true;
reports.forEach((rep) => {
  const before = JSON.stringify(rep), ex = ['seasonality', 'annex'], plan = C.compose(rep, { exclude: ex });
  if (JSON.stringify(rep) !== before) noMutate = false;
  const inSlides = new Set(plan.slides.map((s) => s.block)), inEx = new Map(plan.excluded.map((e) => [e.block, e]));
  const everyPageOnce = rep.pages.every((p) => (inSlides.has(p.id) ? 1 : 0) + (inEx.has(p.id) ? 1 : 0) === 1);
  const orders = plan.slides.every((s, i) => s.order === i + 1 && s.reason && s.title && ['portada', 'analisis', 'cierre', 'anexo'].includes(s.type));
  const kinds = plan.excluded.every((e) => ['sin-datos', 'en-anexo', 'seleccion-persona'].includes(e.kind) && e.reason);
  const omitted = rep.pages.filter((p) => p.status === 'omitted').every((p) => inEx.get(p.id) && inEx.get(p.id).kind === 'sin-datos' && inEx.get(p.id).reason === p.reason);
  const userKind = rep.pages.filter((p) => p.status === 'included' && !p.annex && ex.includes(p.id)).every((p) => inEx.get(p.id) && inEx.get(p.id).kind === 'seleccion-persona');
  if (everyPageOnce && orders && kinds && omitted && userKind && plan.schema === 'deck_plan' && plan.profile === 'legacy') planOk++;
  if (plan.limitations.length) anyLimit++;
  if (plan.annex.every((a) => plan.slides.some((s) => s.block === 'annex' && s.sub === a.sub))) bySlide++;
});
t('el plan: cada página aparece UNA vez (lámina o exclusión), con orden, tipo, razón y motivos exactos de omisión (89 reportes)', planOk === reports.length, planOk);
t('el compositor no modifica el reporte', noMutate);
t('el plan lista como anexos solo láminas que existen', bySlide === reports.length);
t('hay reportes con limitaciones declaradas y se listan sin inventar texto', anyLimit > 0, anyLimit);

/* ---- comportamiento declarativo ---- */
const mini = (ids) => ({ pages: ids.map((id) => ({ id, title: 'T-' + id, status: 'included', kpis: [], tables: [], charts: [], notes: [], sources: ['x'] })) });
const rep = mini(['zz', 'summary', 'cover', 'yy']);
t('un bloque que el perfil no conoce va al final, en el orden del reporte', JSON.stringify(C.compose(rep).slides.map((s) => s.block)) === JSON.stringify(['cover', 'summary', 'zz', 'yy']), C.compose(rep).slides.map((s) => s.block));
FP.reportProfiles.register({ id: 'invertido', label: 'Invertido (prueba)', status: 'enabled', audience: 'prueba', slots: [{ block: 'yy', type: 'cierre' }, { block: 'cover', type: 'portada' }, { block: 'summary', type: 'analisis' }, { block: 'zz', type: 'analisis' }] });
t('con otro perfil el orden y el tipo salen DEL PERFIL (no del código)', (() => { const p = C.compose(rep, { profile: 'invertido' }); return JSON.stringify(p.slides.map((s) => s.block)) === JSON.stringify(['yy', 'cover', 'summary', 'zz']) && p.slides[0].type === 'cierre' && p.audience === 'prueba'; })());
FP.reportProfiles.register({ id: 'futuro', label: 'Futuro', status: 'planned', slots: [{ block: 'cover', type: 'portada' }] });
t('un perfil «planned» no se puede componer', /todavía no está habilitado/.test(throws(() => C.compose(rep, { profile: 'futuro' })) || ''));
t('un perfil desconocido lanza un error claro (no cae en LEGACY en silencio)', /desconocido/.test(throws(() => C.compose(rep, { profile: 'nada' })) || ''));
t('un reporte sin páginas lanza', /no trae páginas/.test(throws(() => C.compose({})) || ''));
t('una página con annex:true no es lámina propia y se dice por qué', (() => { const r2 = mini(['cover', 'reliability', 'annex']); r2.pages[1].annex = true; const p = C.compose(r2); const e = p.excluded.find((x) => x.block === 'reliability'); return !p.slides.some((s) => s.block === 'reliability') && e.kind === 'en-anexo' && /annex/.test(e.reason); })());
t('la persona puede quitar el anexo: no genera A, B ni C', (() => { const r2 = mini(['cover', 'annex']); return C.compose(r2, { exclude: ['annex'] }).slides.length === 1 && C.compose(r2).slides.length === 4; })());
t('el aviso de rezago del resumen se lista con el texto que el reporte ya muestra', (() => { const r2 = mini(['summary']); r2.pages[0].lag = { last: '22 sep 2026', cutoff: '30 sep 2026', days: 8 }; const l = C.limitationsOf(r2)[0]; return l.kind === 'rezago' && l.text === 'Venta real hasta el 22 sep 2026 · faltan 8 días del corte'; })());
console.log(bad ? `\n${bad} FALLAS` : '\nTODO OK'); process.exit(bad ? 1 : 0);
