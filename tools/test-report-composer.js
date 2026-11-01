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

/* ---- Fase 2: profundidad, bloques agregados y alternar ---- */
const DEF = ['reliability', 'seasonality', 'annex'];
const blocks = (plan) => plan.slides.map((x) => x.block).filter((b, i, a) => a.indexOf(b) === i);
const ORDER_L = ['cover', 'summary', 'pacing', 'drivers', 'movers', 'categories', 'trends', 'customers', 'traffic', 'campaigns', 'seasonality', 'recovery', 'closing', 'decisions', 'annex'];
let dOk = 0, dFull = 0, dSub = 0;
reports.forEach((rep) => {
  const full = C.compose(rep, { exclude: DEF }), det = C.compose(rep, { exclude: DEF, depth: 'detallado' }), ej = C.compose(rep, { exclude: DEF, depth: 'ejecutivo' }), res = C.compose(rep, { exclude: DEF, depth: 'resumen' });
  if (JSON.stringify(full.slides) === JSON.stringify(det.slides)) dFull++;
  const sub = (a, b) => blocks(a).every((x) => blocks(b).includes(x));
  if (sub(res, ej) && sub(ej, det)) dSub++;
  const okRes = blocks(res).every((b) => ['cover', 'summary', 'closing', 'decisions'].includes(b)), okEj = blocks(ej).every((b) => ['cover', 'summary', 'pacing', 'drivers', 'movers', 'recovery', 'closing', 'decisions'].includes(b));
  const order = [res, ej, det].every((p) => JSON.stringify(blocks(p)) === JSON.stringify(ORDER_L.filter((b) => blocks(p).includes(b))));
  if (okRes && okEj && order && res.depth === 'resumen' && det.depth === 'detallado' && full.depth === null) dOk++;
});
t('«detallado» da EXACTAMENTE las mismas láminas que sin profundidad (el reporte de siempre), en los 89 reportes', dFull === reports.length, dFull);
t('cada profundidad contiene a la anterior (resumen ⊂ ejecutivo ⊂ detallado), con el orden del perfil', dSub === reports.length && dOk === reports.length, { dSub, dOk });
t('con profundidad «resumen» solo entran portada, resumen, cierre y decisiones; con «ejecutivo» se suman pacing, factores, quién suma/resta y recuperación', dOk === reports.length);
const withAll = reports.find((r) => ['categories', 'trends', 'customers', 'movers', 'pacing'].every((id) => (r.pages.find((p) => p.id === id) || {}).status === 'included'));
t('hay un reporte con las páginas de análisis incluidas para probar la profundidad', !!withAll);
const r1 = C.compose(withAll, { exclude: DEF, depth: 'resumen' }), cat = r1.excluded.find((e) => e.block === 'categories');
t('lo que la profundidad deja fuera se explica: tipo «profundidad» y motivo con las dos profundidades', cat && cat.kind === 'profundidad' && /Detallado/.test(cat.reason) && /Resumen/.test(cat.reason), cat);
t('un bloque sin datos sigue siendo «sin-datos» aunque la profundidad también lo deje fuera (el dato manda)', r1.excluded.filter((e) => e.kind === 'sin-datos').every((e) => withAll.pages.find((p) => p.id === e.block).status === 'omitted'));
const add1 = C.compose(withAll, { exclude: DEF, depth: 'resumen', include: ['categories'] });
t('la persona puede agregar un bloque que la profundidad dejó fuera; entra en su lugar y dice «Agregada por la persona»', blocks(add1).includes('categories') && add1.slides.find((s) => s.block === 'categories').reason === 'Agregada por la persona.' && JSON.stringify(blocks(add1)) === JSON.stringify(ORDER_L.filter((b) => blocks(add1).includes(b))), blocks(add1));
t('quitar (exclude) siempre gana sobre agregar (include)', !blocks(C.compose(withAll, { depth: 'resumen', include: ['categories'], exclude: ['categories'] })).includes('categories'));
t('una profundidad que el perfil no tiene lanza un error claro', /no tiene la profundidad/.test(throws(() => C.compose(withAll, { depth: 'enorme' })) || ''));
t('una profundidad en un perfil sin profundidades se rechaza; sin depth no se filtra nada', (() => { FP.reportProfiles.register({ id: 'sinprof', label: 'Sin profundidades', status: 'enabled', slots: [{ block: 'cover', type: 'portada' }] }); return /no tiene la profundidad/.test(throws(() => C.compose(mini(['cover']), { profile: 'sinprof', depth: 'resumen' })) || '') && C.compose(mini(['cover']), { profile: 'sinprof' }).slides.length === 1; })());
t('el plan trae la profundidad usada (o null)', C.compose(withAll, { depth: 'ejecutivo' }).depth === 'ejecutivo' && C.compose(withAll).depth === null);

/* alternar */
const sel0 = { profile: 'legacy', depth: 'detallado', exclude: DEF.slice(), include: [] };
const tg = (sel, b) => C.toggle(withAll, sel, b);
t('alternar un bloque incluido lo quita (exclude) sin modificar la selección de entrada', (() => { const copy = JSON.stringify(sel0); const n = tg(sel0, 'movers'); return n.exclude.includes('movers') && JSON.stringify(sel0) === copy; })());
t('alternar otra vez un bloque quitado por la persona lo vuelve a poner', (() => { const a = tg(sel0, 'movers'); const b = tg({ ...sel0, exclude: a.exclude, include: a.include }, 'movers'); return !b.exclude.includes('movers'); })());
t('alternar un bloque dejado fuera por la profundidad lo agrega (include); alternarlo de nuevo vuelve a dejarlo fuera SIN añadirlo a exclude', (() => { const s2 = { ...sel0, depth: 'resumen' }; const a = tg(s2, 'categories'); const b = tg({ ...s2, exclude: a.exclude, include: a.include }, 'categories'); return a.include.includes('categories') && !a.exclude.includes('categories') && !b.include.includes('categories') && !b.exclude.includes('categories'); })());
t('alternar un bloque sin datos o la portada (obligatoria) no cambia nada', (() => { const om = withAll.pages.find((p) => p.status === 'omitted'); const a = tg(sel0, om.id), c = tg(sel0, 'cover'); return JSON.stringify(a) === JSON.stringify({ exclude: sel0.exclude, include: [] }) && JSON.stringify(c) === JSON.stringify({ exclude: sel0.exclude, include: [] }); })());
t('alternar el contenido que va dentro del anexo (confiabilidad) no cambia nada: la casilla no tiene efecto (hallazgo D2 resuelto en la vista)', JSON.stringify(tg(sel0, 'reliability')) === JSON.stringify({ exclude: sel0.exclude, include: [] }));
t('el motivo de lo que va dentro del anexo usa el título del anexo, sin jerga', (() => { const e = C.compose(withAll, { exclude: DEF }).excluded.find((x) => x.block === 'reliability'); return e && e.kind === 'en-anexo' && /«Anexo técnico/.test(e.reason) && !/bloque/.test(e.reason); })());
console.log(bad ? `\n${bad} FALLAS` : '\nTODO OK'); process.exit(bad ? 1 : 0);
