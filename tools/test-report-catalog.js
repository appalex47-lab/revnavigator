#!/usr/bin/env node
/* Presentation Intelligence · Fase 2 — catálogo de audiencias y tipos (js/report/catalog.js).  node tools/test-report-catalog.js */
const fs = require('fs'), vm = require('vm');
let bad = 0; const t = (n, c, d) => { console.log((c ? '✔ ' : '✘ ') + n + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 300) : '')); if (!c) bad++; };
const fresh = () => { const ctx = { console, JSON, Object, Array, Map, Set, Number, String, Error }; ctx.globalThis = ctx; ctx.window = undefined; vm.createContext(ctx); ['profiles', 'catalog'].forEach((f) => vm.runInContext(fs.readFileSync(`js/report/${f}.js`, 'utf8'), ctx)); return ctx.FP; };
const FP = fresh(), K = FP.reportCatalog;

t('hay 4 audiencias (reporte actual, operativo, gerencial, directivo) y 6 tipos', K.AUDIENCES.map((a) => a.id).join() === 'actual,operativo,gerencial,directivo' && K.TYPES.map((x) => x.id).join() === 'desempeno,diagnostico,bpr,crecimiento,dbr,planeacion', K.AUDIENCES.map((a) => a.id));
t('hoy solo está habilitada la audiencia «actual»; operativo, gerencial y directivo traen su motivo y no son elegibles', (() => { const a = K.audiences(); return a.filter((x) => x.enabled).map((x) => x.id).join() === 'actual' && a.filter((x) => !x.enabled).every((x) => x.reason === K.NOT_YET); })());
t('hoy solo «Desempeño comercial» está habilitado para el reporte actual; los otros 5 tipos no', (() => { const ty = K.types('actual'); return ty.filter((x) => x.enabled).map((x) => x.id).join() === 'desempeno' && ty.filter((x) => !x.enabled).length === 5; })());
t('ningún tipo está habilitado para una audiencia sin perfil', ['operativo', 'gerencial', 'directivo'].every((a) => K.types(a).every((x) => !x.enabled)));
t('resolve devuelve el perfil habilitado o null; nunca inventa uno', K.resolve('actual', 'desempeno').id === 'legacy' && K.resolve('actual', 'bpr') === null && K.resolve('directivo', 'desempeno') === null && K.resolve('nada', 'nada') === null);
t('las profundidades salen del perfil, con la de por defecto marcada', (() => { const d = K.depths(K.resolve('actual', 'desempeno')); return d.map((x) => x.id).join() === 'resumen,ejecutivo,detallado' && d.filter((x) => x.default).map((x) => x.id).join() === 'detallado' && K.depths(null).length === 0; })());
t('la elección inicial es la del reporte actual: audiencia actual, tipo desempeño, profundidad detallada', JSON.stringify(K.defaults()) === JSON.stringify({ audience: 'actual', type: 'desempeno', depth: 'detallado', profile: 'legacy' }), K.defaults());
/* La selección inicial del estado de la app debe coincidir con el catálogo. */
const app = fs.readFileSync('js/app.js', 'utf8'), m = /rp: \{ status: 'idle', report: null, error: null, audience: '([^']*)', type: '([^']*)', depth: '([^']*)', include: \[([^\]]*)\]/.exec(app);
t('el estado inicial de app.js (audiencia, tipo, profundidad, sin bloques agregados) coincide con el catálogo', m && m[1] === K.defaults().audience && m[2] === K.defaults().type && m[3] === K.defaults().depth && m[4].trim() === '', m && m.slice(1));

/* Habilitar un formato es registrar su perfil: el catálogo no tiene banderas propias. */
const F2 = fresh(), K2 = F2.reportCatalog;
F2.reportProfiles.register({ id: 'gerencial_prueba', label: 'Gerencial (prueba)', status: 'planned', audience: 'gerencial', presentationTypes: ['bpr'], slots: [{ block: 'cover', type: 'portada' }] });
t('un perfil «planned» NO habilita nada en el catálogo', !K2.audiences().find((a) => a.id === 'gerencial').enabled && K2.resolve('gerencial', 'bpr') === null);
F2.reportProfiles.register({ id: 'gerencial_ok', label: 'Gerencial (prueba habilitada)', status: 'enabled', audience: 'gerencial', presentationTypes: ['bpr', 'crecimiento'], depths: [{ id: 'x', label: 'X' }], defaultDepth: 'x', slots: [{ block: 'cover', type: 'portada', depth: 'x' }] });
t('al registrar un perfil habilitado, su audiencia y sus tipos se habilitan (y solo esos)', (() => { const a = K2.audiences(), ty = K2.types('gerencial'); return a.find((x) => x.id === 'gerencial').enabled && ty.filter((x) => x.enabled).map((x) => x.id).join() === 'bpr,crecimiento' && !a.find((x) => x.id === 'operativo').enabled && K2.resolve('gerencial', 'bpr').id === 'gerencial_ok'; })());
t('los tipos de una audiencia siguen sin habilitarse para otra', K2.types('actual').filter((x) => x.enabled).map((x) => x.id).join() === 'desempeno');
console.log(bad ? `\n${bad} FALLAS` : '\nTODO OK'); process.exit(bad ? 1 : 0);
