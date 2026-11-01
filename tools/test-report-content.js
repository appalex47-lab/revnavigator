#!/usr/bin/env node
/* Presentation Intelligence · Fase 1 — modelo de contenido, hallazgos y contrato de integridad (js/report/contentModel.js).  node tools/test-report-content.js */
const fs = require('fs'), vm = require('vm'), os = require('os'), path = require('path'), cp = require('child_process');
let bad = 0; const t = (n, c, d) => { console.log((c ? '✔ ' : '✘ ') + n + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 360) : '')); if (!c) bad++; };
const ctx = { console, JSON, Object, Array, Map, Set, Number, String, Error, Math }; ctx.globalThis = ctx; ctx.window = undefined; vm.createContext(ctx);
['profiles', 'composer', 'contentModel'].forEach((f) => vm.runInContext(fs.readFileSync(`js/report/${f}.js`, 'utf8'), ctx));
const RC = ctx.FP.reportContent;
const tmp = path.join(os.tmpdir(), `rb_reports_c_${process.pid}.json`), tmp2 = tmp + '.g';
const r = cp.spawnSync(process.execPath, [path.join(__dirname, 'test-report-builder.js')], { env: { ...process.env, RB_GOLDEN_OUT: tmp2, RB_REPORTS_OUT: tmp }, encoding: 'utf8' });
if (r.status !== 0) { console.log('✘ test-report-builder.js falla por sí mismo'); process.exit(1); }
const reports = JSON.parse(fs.readFileSync(tmp, 'utf8')); fs.unlinkSync(tmp); fs.unlinkSync(tmp2);

/* ---- el contrato sobre los reportes reales del armador ---- */
const all = reports.map((rep) => RC.validate(rep).violations).flat();
t('el contrato sobre 89 reportes no encuentra ningún hallazgo (D1 corregido: sin fecha de corte el resumen ya no dice «Al corte del null»)', all.length === 0, all);
t('ningún resumen contiene «null», «undefined» ni «NaN»', !reports.some((rep) => rep.pages.some((p) => p.id === 'summary' && p.status === 'included' && /\b(null|undefined|NaN)\b/.test(JSON.stringify(p, (k, v) => (v === null ? undefined : v))))));
t('ningún reporte omite una página sin motivo, ni trae KPI numérico sin sello, ni páginas repetidas', !all.some((v) => ['omitida', 'sello', 'estructura', 'incluida'].includes(v.rule)), all);
t('toda página incluida declara fuentes, salvo el cierre (que sintetiza otras)', !all.some((v) => v.rule === 'fuentes') && RC.DERIVED.join() === 'closing', RC.DERIVED);

/* ---- cada regla del contrato se detecta ---- */
const page = (o) => ({ id: 'p', title: 'P', status: 'included', kpis: [], tables: [], charts: [], notes: [], sources: ['f'], ...o });
const rules = (pages) => RC.validate({ pages }).violations.map((v) => v.rule);
t('detecta: reporte sin páginas', RC.validate({}).ok === false && RC.validate(null).ok === false);
t('detecta: página sin status válido', rules([{ id: 'a', title: 'A', status: 'x' }]).includes('estructura'));
t('detecta: página repetida', rules([page({ id: 'a' }), page({ id: 'a' })]).includes('estructura'));
t('detecta: omitida sin motivo', rules([{ id: 'a', title: 'A', status: 'omitted' }]).includes('omitida'));
t('detecta: omitida con contenido', rules([{ id: 'a', title: 'A', status: 'omitted', reason: 'x', kpis: [] }]).includes('omitida'));
t('acepta: omitida con motivo y sin contenido', RC.validate({ pages: [{ id: 'a', title: 'A', status: 'omitted', reason: 'Sin datos.' }] }).ok);
t('detecta: incluida sin listas', rules([{ id: 'a', title: 'A', status: 'included' }]).includes('incluida'));
t('detecta: incluida sin fuentes', rules([page({ sources: [] })]).includes('fuentes'));
t('acepta: el cierre sin fuentes (derivado)', RC.validate({ pages: [page({ id: 'closing', sources: [] })] }).ok);
t('detecta: KPI numérico sin sello', rules([page({ kpis: [{ id: 'k', label: 'K', value: 5, tag: null }] })]).includes('sello'));
t('acepta: KPI de texto sin sello y KPI sin dato (null)', RC.validate({ pages: [page({ kpis: [{ id: 'k', label: 'K', value: 'A', tag: null }, { id: 'j', label: 'J', value: null, tag: 'Calculado' }] })] }).ok);
t('detecta: número no finito', rules([page({ tables: [{ rows: [{ v: NaN }] }] })]).includes('valores') && rules([page({ notes: [{ v: Infinity }] })]).includes('valores'));
t('detecta: texto con undefined, null, NaN o Infinity', ['undefined', 'null', 'NaN', 'Infinity'].every((w) => rules([page({ headline: `Venta ${w} en el mes` })]).includes('valores')));
t('no confunde palabras: «nulo» o «nullify» no son «null»', RC.validate({ pages: [page({ headline: 'Resultado nulo; nullify' })] }).ok);

/* ---- hallazgos ---- */
let fOk = 0, certOk = 0, numOk = 0;
reports.forEach((rep) => {
  const F = RC.findings(rep), inc = rep.pages.filter((p) => p.status === 'included');
  const kpis = inc.flatMap((p) => p.kpis.map((k) => `${p.id}#kpi:${k.id}`)), ind = F.filter((f) => f.kind === 'indicator').map((f) => f.id);
  if (JSON.stringify(kpis) === JSON.stringify(ind) && new Set(F.map((f) => f.id)).size === F.length) fOk++;
  if (F.every((f) => f.certainty === null || ['observado', 'calculado', 'estimado'].includes(f.certainty))) certOk++;
  if (F.every((f) => f.numbers.every(Number.isFinite)) && F.filter((f) => f.kind === 'indicator').every((f) => (typeof f.value === 'number') === (f.numbers.length === 1))) numOk++;
});
t('cada KPI de cada página incluida es un hallazgo-indicador, una sola vez y en orden; los ids no se repiten (89 reportes)', fOk === reports.length, fOk);
t('toda certeza es observado, calculado, estimado o nula', certOk === reports.length);
t('los indicadores citan su valor tal cual (sin recalcular) y solo los numéricos traen cifra', numOk === reports.length);
t('las conclusiones son los titulares de las páginas, sin la portada ni textos con null/undefined', reports.every((rep) => RC.findings(rep).filter((f) => f.kind === 'conclusion').every((f) => f.block !== 'cover' && f.text === rep.pages.find((p) => p.id === f.block).headline && !/\b(null|undefined|NaN)\b/.test(f.text))));
t('certeza de una página = la MÁS incierta de sus sellos', RC.certaintyOf({ kpis: [{ tag: 'Observado' }, { tag: 'Estimado' }, { tag: 'Calculado' }] }) === 'estimado' && RC.certaintyOf({ kpis: [{ tag: 'Observado' }, { tag: 'Calculado' }] }) === 'calculado' && RC.certaintyOf({ kpis: [{ tag: 'Observado' }] }) === 'observado' && RC.certaintyOf({ kpis: [] }) === null);

/* ---- disponibilidad y registro de cifras ---- */
const rep0 = reports.find((x) => x.pages.some((p) => p.status === 'omitted')), D = RC.describe(rep0);
t('describe trae un bloque por página, con el motivo exacto de omisión', D.blocks.length === rep0.pages.length && rep0.pages.filter((p) => p.status === 'omitted').every((p) => D.blocks.find((b) => b.block === p.id).available === false && D.blocks.find((b) => b.block === p.id).reason === p.reason));
t('los bloques disponibles listan sus certezas de menor a mayor incertidumbre', reports.every((rep) => RC.describe(rep).blocks.filter((b) => b.available).every((b) => b.certainty.every((c, i, a) => i === 0 || ['observado', 'calculado', 'estimado'].indexOf(a[i - 1]) < ['observado', 'calculado', 'estimado'].indexOf(c)))));
/* Recuento independiente de cifras (otra implementación: recorrido iterativo con pila). */
function countNums(rep) { let n = 0; const st = rep.pages.filter((p) => p.status === 'included').map((p) => p); while (st.length) { const v = st.pop(); if (typeof v === 'number') n++; else if (Array.isArray(v)) st.push(...v); else if (v && typeof v === 'object') Object.keys(v).forEach((k) => { if (k !== 'tags' && k !== 'generatedAt') st.push(v[k]); }); } return n; }
t('el registro de cifras recoge todas las cifras de las páginas incluidas (recuento independiente, 89 reportes)', reports.every((rep) => RC.numbersOf(rep).length === countNums(rep)));
t('el registro de cifras no incluye páginas omitidas ni cifras no finitas inventadas', reports.every((rep) => RC.numbersOf(rep).every((x) => Number.isFinite(x.value) && rep.pages.find((p) => x.path.split(/[.[]/)[0] === p.id).status === 'included')));
console.log(bad ? `\n${bad} FALLAS` : '\nTODO OK'); process.exit(bad ? 1 : 0);
