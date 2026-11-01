#!/usr/bin/env node
/* Presentation Intelligence · Fase 1 — perfiles de presentación (js/report/profiles.js).  node tools/test-report-profiles.js */
const fs = require('fs'), vm = require('vm');
const fresh = () => { const ctx = { console, JSON, Object, Array, Map, Set, Number, String }; ctx.globalThis = ctx; ctx.window = undefined; vm.createContext(ctx); vm.runInContext(fs.readFileSync('js/report/profiles.js', 'utf8'), ctx); return ctx.FP.reportProfiles; };
let bad = 0; const t = (n, c, d) => { console.log((c ? '✔ ' : '✘ ') + n + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 300) : '')); if (!c) bad++; };
const throws = (f) => { try { f(); return null; } catch (e) { return e.message; } };
const P = fresh(), L = P.get('legacy');

t('existe el perfil LEGACY, habilitado, sin audiencia (es el reporte actual)', L && L.status === 'enabled' && L.audience === null && L.schema === 'report_profile', L && L.id);
t('LEGACY es válido según el contrato', P.validate(L).length === 0, P.validate(L));
/* El orden y los anexos son los del reporte anterior (copia congelada: si cambian, cambia el reporte). */
const ORDER = ['cover', 'summary', 'pacing', 'drivers', 'movers', 'categories', 'trends', 'customers', 'traffic', 'campaigns', 'seasonality', 'recovery', 'closing', 'decisions', 'reliability', 'annex'];
t('el orden de lectura de LEGACY es el del reporte anterior', JSON.stringify(L.slots.map((s) => s.block)) === JSON.stringify(ORDER), L.slots.map((s) => s.block));
t('los anexos A, B y C de LEGACY son los de siempre', JSON.stringify(L.annexes) === JSON.stringify([{ sub: 1, title: 'Anexo técnico A · Calidad de datos y brechas' }, { sub: 2, title: 'Anexo técnico B · Métodos, backtest y confiabilidad' }, { sub: 3, title: 'Anexo técnico C · Definiciones y límites' }]), L.annexes);
t('«reliability» no es lámina propia: va dentro del bloque «annex»', L.slots.find((s) => s.block === 'reliability').embeddedIn === 'annex');
/* La selección inicial de la vista previa vive hoy en app.js: el perfil debe coincidir con ella. */
const app = fs.readFileSync('js/app.js', 'utf8'), m = /rp: \{ status: 'idle', report: null, error: null, audience: '[^']*', type: '[^']*', depth: '[^']*', include: \[[^\]]*\], exclude: \[([^\]]*)\]/.exec(app);
const appEx = m ? m[1].split(',').map((x) => x.trim().replace(/['"]/g, '')).filter(Boolean) : null;
t('defaultExclude de LEGACY coincide con la selección inicial de app.js', JSON.stringify(L.defaultExclude) === JSON.stringify(appEx), { perfil: L.defaultExclude, app: appEx });
t('los perfiles registrados están congelados', Object.isFrozen(L) && Object.isFrozen(L.slots) && Object.isFrozen(L.slots[0]) && !!throws(() => { 'use strict'; L.slots.push({}); }));

/* Contrato: cada incumplimiento se detecta. */
const ok = () => ({ id: 'demo', label: 'Demo', status: 'planned', slots: [{ block: 'a', type: 'portada' }, { block: 'b', type: 'analisis' }, { block: 'annex', type: 'anexo' }], annexes: [{ sub: 1, title: 'A' }], defaultExclude: ['b'] });
t('un perfil bien formado es válido', P.validate(ok()).length === 0, P.validate(ok()));
const variants = {
  'id inválido': (p) => { p.id = 'Demo 1'; }, 'sin label': (p) => { delete p.label; }, 'status inválido': (p) => { p.status = 'on'; },
  'slots vacío': (p) => { p.slots = []; }, 'bloque repetido': (p) => { p.slots.push({ block: 'a', type: 'analisis' }); }, 'type inválido': (p) => { p.slots[1].type = 'grafica'; },
  'embeddedIn desconocido': (p) => { p.slots[1].embeddedIn = 'zzz'; }, 'defaultExclude desconocido': (p) => { p.defaultExclude = ['zzz']; },
  'annexes sin bloque annex': (p) => { p.slots.pop(); p.defaultExclude = []; }, 'annexes mal formado': (p) => { p.annexes = [{ sub: 'x', title: '' }]; }, 'depths no es lista': (p) => { p.depths = 'resumen'; }
};
Object.entries(variants).forEach(([n, f]) => { const p = ok(); f(p); t(`se rechaza: ${n}`, P.validate(p).length > 0, P.validate(p)); });
t('validate rechaza algo que no es un perfil', P.validate(null).length > 0 && P.validate('x').length > 0);

/* Registro: sin sobrescrituras silenciosas y sin ofrecer lo que no está habilitado. */
const R = fresh();
t('registrar un perfil inválido lanza', /inválido/.test(throws(() => R.register({ id: 'x' })) || ''));
t('registrar un id repetido lanza (no se sobrescribe LEGACY)', /Ya existe/.test(throws(() => R.register({ ...ok(), id: 'legacy' })) || ''));
const planned = R.register(ok());
t('un perfil «planned» queda registrado pero no se lista por defecto', R.get('demo').status === 'planned' && !R.list().some((p) => p.id === 'demo') && R.list({ enabledOnly: false }).some((p) => p.id === 'demo'));
t('list() por defecto devuelve solo habilitados (hoy: LEGACY)', JSON.stringify(R.list().map((p) => p.id)) === JSON.stringify(['legacy']), R.list().map((p) => p.id));
t('get de un id desconocido devuelve null', R.get('nada') === null);
t('el perfil registrado es una copia: mutar el original no lo cambia', (() => { const o = ok(); o.id = 'copia'; const r = R.register(o); o.slots.push({ block: 'z', type: 'analisis' }); return r.slots.length === 3; })());

/* ---- Fase 2: profundidades, defaultDepth y lámina obligatoria ---- */
t('LEGACY declara 3 profundidades ordenadas (resumen, ejecutivo, detallado) y «detallado» por defecto (= el reporte de siempre)', JSON.stringify(L.depths.map((d) => d.id)) === JSON.stringify(['resumen', 'ejecutivo', 'detallado']) && L.defaultDepth === 'detallado', L.depths);
t('LEGACY sirve el tipo «desempeno» y solo la portada es obligatoria', JSON.stringify(L.presentationTypes) === JSON.stringify(['desempeno']) && JSON.stringify(L.slots.filter((x) => x.required).map((x) => x.block)) === JSON.stringify(['cover']));
t('todo bloque de LEGACY tiene una profundidad válida y «detallado» incluye a todos (no se pierde ninguna página)', L.slots.every((x) => L.depths.some((d) => d.id === x.depth)));
const base2 = () => ({ ...ok(), depths: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], defaultDepth: 'a' });
t('un perfil con profundidades es válido', P.validate(base2()).length === 0, P.validate(base2()));
const v2 = {
  'defaultDepth fuera de la lista': (p) => { p.defaultDepth = 'z'; }, 'profundidades sin defaultDepth': (p) => { delete p.defaultDepth; }, 'profundidad repetida': (p) => { p.depths.push({ id: 'a', label: 'Otra' }); },
  'profundidad sin label': (p) => { p.depths[0] = { id: 'a' }; }, 'slot con profundidad inexistente': (p) => { p.slots[1].depth = 'z'; }, 'required no booleano': (p) => { p.slots[0].required = 'si'; },
  'presentationTypes mal formado': (p) => { p.presentationTypes = [1]; }
};
Object.entries(v2).forEach(([n, f]) => { const p = base2(); f(p); t(`se rechaza: ${n}`, P.validate(p).length > 0, P.validate(p)); });
t('un slot con depth en un perfil SIN profundidades se rechaza', P.validate({ ...ok(), slots: [{ block: 'a', type: 'portada', depth: 'x' }, { block: 'b', type: 'analisis' }, { block: 'annex', type: 'anexo' }] }).length > 0);
console.log(bad ? `\n${bad} FALLAS` : '\nTODO OK'); process.exit(bad ? 1 : 0);
