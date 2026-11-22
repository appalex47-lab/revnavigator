#!/usr/bin/env node
/* Cierre técnico · hallazgo 4: conflictos de sincronización de `reportPrefs` entre DOS personas/navegadores.
 * ⚠ SIMULADO: el servidor es un Supabase en memoria (tabla team_blobs con updated_at, como la real). Ejecuta el código REAL de js/cloud/cloudSync.js y de
 *   js/report/presentationPrefs.js en dos navegadores independientes (localStorage propio cada uno), pero NO prueba el Supabase real (RLS, red, latencias, condiciones de carrera
 *   del servidor). Eso queda como validación pendiente con credenciales reales.   node tools/test-sync-conflicts.js */
const fs = require('fs'), vm = require('vm');
let bad = 0; const t = (n, c, d) => { console.log((c ? '✔ ' : '✘ ') + n + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 500) : '')); if (!c) bad++; };
const CFG = { url: 'https://x.supabase.co', publishableKey: 'pk', table: 'team_blobs', chunkChars: 400000, skipKeys: ['cohereApiKey', 'storageMigration', 'cloudSession', 'thresholdSuggestion'], autoSkipKeys: ['uxSettings', 'productSettings'], conflictKeys: ['*'] };

// ---- servidor simulado (compartido por el equipo) ----
const rows = []; let puts = 0, casMode = false, dropRpcResponse = false;
const resp = (status, obj) => ({ ok: status < 300, status, json: async () => obj, text: async () => (obj === null ? '' : JSON.stringify(obj)) });
function applyCas(b) {
  const cur = rows.find((r) => r.key === b.p_key && r.part === 0);
  if (cur ? (b.p_expected_version === null || Number(b.p_expected_version) !== cur.version) : (b.p_expected_version !== null && Number(b.p_expected_version) !== 0)) return { ok: false, conflict: true, version: cur ? cur.version : 0 };
  const nv = cur ? cur.version + 1 : 1;
  for (let i = rows.length - 1; i >= 0; i--) if (rows[i].key === b.p_key) rows.splice(i, 1);
  b.p_rows.forEach((r) => rows.push({ team_id: 'T', key: b.p_key, ...r, version: nv }));
  return { ok: true, version: nv };
}
async function server(url, o) {
  const u = new URL(url), q = (k) => u.searchParams.get(k);
  if (u.pathname === '/rest/v1/rpc/put_blob_cas') {   // réplica de supabase/migrations/20261102_put_blob_cas.sql (atómica: un solo turno del bucle de eventos). La prueba REAL contra PostgreSQL está en docs (ver informe).
    if (!casMode) return resp(404, { code: 'PGRST202', message: 'Could not find the function' });
    if (dropRpcResponse) { dropRpcResponse = false; applyCas(JSON.parse(o.body)); throw new TypeError('Failed to fetch'); }   // el servidor aplicó la escritura pero la respuesta se perdió
    return resp(200, applyCas(JSON.parse(o.body)));
  }
  if (!u.pathname.startsWith('/rest/v1/team_blobs')) return resp(404, {});
  let sel = rows.slice();
  const kf = q('key'), pf = q('part');
  if (kf && kf.startsWith('eq.')) sel = sel.filter((r) => r.key === kf.slice(3));
  if (pf && pf.startsWith('eq.')) sel = sel.filter((r) => r.part === +pf.slice(3));
  if (pf && pf.startsWith('gte.')) sel = sel.filter((r) => r.part >= +pf.slice(4));
  if (o.method === 'POST') { puts++; JSON.parse(o.body).forEach((r) => { const i = rows.findIndex((x) => x.key === r.key && x.part === r.part); if (i >= 0) rows[i] = { ...r, version: r.part === 0 ? rows[i].version + 1 : rows[i].version }; else rows.push({ ...r, version: 1 }); }); return resp(201, null); }
  if (o.method === 'DELETE') { sel.forEach((r) => rows.splice(rows.indexOf(r), 1)); return resp(204, null); }
  return resp(200, sel.map((r) => ({ key: r.key, part: r.part, total: r.total, payload: r.payload, updated_at: r.updated_at, bytes: r.bytes, version: r.version })));
}
// ---- un navegador: su propio localStorage, su propio FP y su propio «disco» de claves ----
function browser(name) {
  const ls = new Map(), disk = new Map();
  const ctx = { console, JSON, Math, Date, Map, Set, Promise, setTimeout, clearTimeout, Error, Array, Object, String, Number, encodeURIComponent, URL, AbortController, fetch: server };
  ctx.localStorage = { getItem: (k) => (ls.has(k) ? ls.get(k) : null), setItem: (k, v) => ls.set(k, String(v)), removeItem: (k) => ls.delete(k) };
  ctx.globalThis = ctx; ctx.window = undefined; vm.createContext(ctx);
  ctx.FP = { config: { cloud: JSON.parse(JSON.stringify(CFG)) } };
  ['js/cloud/cloudSync.js', 'js/report/presentationPrefs.js'].forEach((f) => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx));
  ctx.localStorage.setItem('fp.cloudSession', JSON.stringify({ access_token: 'tok-' + name, refresh_token: 'r', expires_at: Math.floor(Date.now() / 1000) + 3600, user_id: name, email: name + '@x.com', anonymous: false, team_id: 'T', team_name: 'Equipo' }));
  const FP = ctx.FP, provider = { keys: async () => [...disk.keys()], read: async (k) => (disk.has(k) ? JSON.parse(disk.get(k)) : null), write: async (k, e) => { disk.set(k, JSON.stringify(e)); } };
  const save = (key, data, at) => { disk.set(key, JSON.stringify({ schemaVersion: 1, savedAt: at, data })); };   // como storage.save, con la fecha de guardado
  const isData = () => false;
  return { name, FP, provider, save, isData, ls, disk, get: (k) => (disk.has(k) ? JSON.parse(disk.get(k)) : null),
    push: (keys, o) => FP.cloud.pushKeys(provider, keys, o || {}), pull: () => FP.cloud.pullNewer(provider, isData, {}) };
}
const P = (note, extra) => ({ schema: 'report_prefs', version: 1, audience: 'operativo', type: 'desempeno', depth: 'detallado', include: [], exclude: [], options: { showTags: false, showBusinessName: false, thresholds: {} }, edits: { 'operativo|pacing': { note } , ...(extra || {}) } });
const iso = (m) => new Date(Date.UTC(2026, 10, 2, 9, m, 0)).toISOString();   // 2 nov 2026 09:mm
const cloudData = () => { const r = rows.filter((x) => x.key === 'reportPrefs').sort((a, b) => a.part - b.part); return r.length ? JSON.parse(r.map((x) => x.payload).join('')).data : null; };

(async () => {
  const note = (d) => d && d.edits && d.edits['operativo|pacing'] && d.edits['operativo|pacing'].note;
  // ---------- 1. flujo normal sin conflicto ----------
  let A = browser('ana'), B = browser('beto');
  A.save('reportPrefs', P('v1 de Ana'), iso(1));
  let r = await A.push(['reportPrefs']);
  t('Ana sube su presentación (primera subida: no hay nada en la nube, sin conflicto)', r.ok && r.pushed === 1 && r.conflicts.length === 0 && note(cloudData()) === 'v1 de Ana', r);
  r = await B.pull();
  t('Beto (sin cambios propios) trae la de Ana: se aplica, sin conflicto', r.ok && r.applied.includes('reportPrefs') && r.conflicts.length === 0 && note(B.get('reportPrefs').data) === 'v1 de Ana', r);
  t('después de sincronizar, subir lo mismo no sube nada y no hay conflicto', (await B.push(['reportPrefs'])).conflicts.length === 0);

  // ---------- 2. los dos editan sin verse (el caso que antes se perdía en silencio) ----------
  A.save('reportPrefs', P('Ana: versión 2'), iso(10));
  r = await A.push(['reportPrefs']); t('Ana edita y sube (base vigente): se sube', r.ok && r.pushed === 1 && note(cloudData()) === 'Ana: versión 2', r);
  B.save('reportPrefs', P('Beto: su propia edición'), iso(12));   // Beto editó SIN haber traído lo de Ana
  const before = JSON.stringify(rows);
  r = await B.push(['reportPrefs']);
  t('Beto intenta subir: se detecta CONFLICTO, no se sube nada y la nube conserva lo de Ana', r.ok && r.pushed === 0 && r.conflicts.length === 1 && r.conflicts[0].key === 'reportPrefs' && JSON.stringify(rows) === before && note(cloudData()) === 'Ana: versión 2', { pushed: r.pushed, c: r.conflicts.length });
  t('el conflicto trae las dos versiones completas (la local y la del equipo) para que la persona decida', note(r.conflicts[0].local.data) === 'Beto: su propia edición' && note(r.conflicts[0].cloud.data) === 'Ana: versión 2');
  r = await B.pull();
  t('al traer de la nube, la copia local de Beto (más reciente) NO se pisa; el conflicto ya quedó registrado al intentar subir', r.ok && r.applied.length === 0 && note(B.get('reportPrefs').data) === 'Beto: su propia edición', r);

  // ---------- 3. aunque la edición local sea ANTERIOR a la de la nube (último-en-escribir-gana la habría borrado) ----------
  const C = browser('carla'); C.save('reportPrefs', P('v1 de Ana'), iso(1)); await C.pull().then(() => 0);
  C.save('reportPrefs', P('Carla editó a las 9:05'), iso(5));   // antes que la v2 de Ana (9:10)
  r = await C.pull();
  t('edición local más VIEJA que la de la nube: con «gana la última» se perdía; ahora es conflicto y la local sigue intacta', r.conflicts.length === 1 && note(C.get('reportPrefs').data) === 'Carla editó a las 9:05', { applied: r.applied, c: r.conflicts.length });

  // ---------- 4. resolver: tres salidas, sin pérdida silenciosa ----------
  const cmp = B.FP.reportPrefs.compare(r.conflicts[0].local.data, r.conflicts[0].cloud.data);
  t('compare: describe qué difiere (misma lámina editada distinto en las dos)', cmp.both.length === 1 && cmp.both[0] === 'operativo|pacing' && !cmp.onlyMine.length, cmp);
  const mine = B.FP.reportPrefs.merge(B.get('reportPrefs').data, cloudData());
  t('merge: une las ediciones de las dos; donde chocan queda la mía y se informa cuáles chocaron', mine.clashes.length === 1 && note(mine.data) === 'Beto: su propia edición');
  const D1 = P('Beto: base', { 'operativo|drivers': { note: 'solo de Beto' } }), D2 = P('Ana: base', { 'operativo|movers': { note: 'solo de Ana' } });
  const mg = B.FP.reportPrefs.merge(D1, D2);
  t('merge: conserva las ediciones que solo tiene cada lado (nada se pierde) y avisa del choque', Object.keys(mg.data.edits).sort().join() === 'operativo|drivers,operativo|movers,operativo|pacing' && mg.clashes.join() === 'operativo|pacing', mg);
  // «conservar la mía» (con fecha nueva y forzado) → la nube queda con la de Beto y Ana la recibe sin conflicto
  B.save('reportPrefs', B.get('reportPrefs').data, iso(20));
  r = await B.push(['reportPrefs'], { force: ['reportPrefs'] });
  t('«Conservar la mía»: tras elegir, sube forzado y la nube queda con la de Beto', r.ok && r.pushed === 1 && note(cloudData()) === 'Beto: su propia edición', r);
  r = await A.pull();
  t('Ana (que tenía su v2 ya sincronizada, sin cambios nuevos) recibe la elegida sin conflicto y sin rebote', r.applied.includes('reportPrefs') && r.conflicts.length === 0 && note(A.get('reportPrefs').data) === 'Beto: su propia edición', r);
  const stable = JSON.stringify(rows); await A.push(['reportPrefs']); await B.push(['reportPrefs']); await A.pull(); await B.pull();
  t('después de resolver no hay rebotes: nuevas rondas de subir/traer no cambian nada', JSON.stringify(rows) === stable);

  // ---------- 5. «usar la del equipo» ----------
  const E = browser('eva'); E.save('reportPrefs', P('Eva local'), iso(15));
  r = await E.pull();
  t('un navegador que nunca se sincronizó y tiene su propia versión: conflicto (no se pisa en silencio)', r.conflicts.length === 1 && note(E.get('reportPrefs').data) === 'Eva local', r);
  await E.provider.write('reportPrefs', r.conflicts[0].cloud); E.FP.cloud.setBase('reportPrefs', r.conflicts[0].cloudAt);
  r = await E.pull(); t('«Usar la del equipo»: se aplica la de la nube y no vuelve a haber conflicto', r.conflicts.length === 0 && note(E.get('reportPrefs').data) === note(cloudData()), r);

  // ---------- 6. sin conflicto cuando el contenido es igual / quien no editó ----------
  const F = browser('fer'); F.save('reportPrefs', JSON.parse(JSON.stringify(cloudData())), iso(5));
  r = await F.pull(); const rp = await F.push(['reportPrefs']);
  t('mismo contenido en las dos copias: no hay conflicto y la nube queda igual', r.conflicts.length === 0 && rp.conflicts.length === 0 && JSON.stringify(cloudData()) === JSON.stringify(F.get('reportPrefs').data));
  const G = browser('gus'); r = await G.pull();
  t('un navegador sin datos propios trae la de la nube sin conflicto', r.applied.includes('reportPrefs') && r.conflicts.length === 0);

  // ---------- 7. error al revisar la nube: no se sube nada ----------
  const H = browser('hugo'); H.save('reportPrefs', P('Hugo'), iso(40));
  const real = rows.filter((x) => x.key === 'reportPrefs'); real[0].total = 5;   // trozos incompletos en la nube
  r = await H.push(['reportPrefs']);
  t('si no se puede revisar lo que hay en la nube (incompleto), NO se sube: se informa el error', r.ok === false && /no se subió nada/.test(r.error || ''), r);
  real[0].total = real.length;

  // ---------- 8. otras claves siguen igual (no entran en esta revisión) ----------
  const I = browser('ines'), J = browser('jose');
  I.save('targets:2026', { goal: 1 }, iso(1)); await I.push(['targets:2026']);
  J.save('targets:2026', { goal: 2 }, iso(0));
  r = await J.pull();
  t('otras claves sincronizadas (metas, supuestos…) también detectan el conflicto y no se pisan (ya no «gana la última escritura»)', r.conflicts.length === 1 && r.conflicts[0].key === 'targets:2026' && J.get('targets:2026').data.goal === 2 && !r.applied.includes('targets:2026'), r);
  const O = browser('olga'); O.save('targets:2026', { goal: 1 }, iso(1)); await O.pull().catch(() => 0);
  r = await O.pull(); t('y una clave sin cambios propios se actualiza sin conflicto', r.conflicts.length === 0);
  // ---------- 8b. escritura condicional en el servidor (put_blob_cas, SIMULADA con una réplica de la función SQL) ----------
  casMode = true;
  const K = browser('kira'), L = browser('luis');
  K.save('reportPrefs', P('base'), iso(50)); rows.length = 0; await K.push(['reportPrefs']); await L.pull();
  K.save('reportPrefs', P('Kira escribe a la vez'), iso(51)); L.save('reportPrefs', P('Luis escribe a la vez'), iso(52));
  const [rk, rl] = await Promise.all([K.push(['reportPrefs']), L.push(['reportPrefs'])]);
  const won = [rk, rl].filter((x) => x.pushed === 1).length, lost = [rk, rl].filter((x) => x.conflicts.length === 1).length;
  t('dos subidas SIMULTÁNEAS: el servidor deja pasar una y rechaza la otra, que queda como conflicto (nadie se pisa, ni siquiera en la ventana de carrera)', won === 1 && lost === 1 && ['Kira escribe a la vez', 'Luis escribe a la vez'].includes(note(cloudData())), { rk: [rk.pushed, rk.conflicts.length], rl: [rl.pushed, rl.conflicts.length] });
  const loser = rk.conflicts.length ? rk.conflicts[0] : rl.conflicts[0];
  t('el conflicto por rechazo del servidor trae las dos versiones completas', loser && loser.local.data && loser.cloud.data && note(loser.local.data) !== note(loser.cloud.data));
  casMode = false;
  const M = browser('mia'), N = browser('nico'); M.save('reportPrefs', P('m'), iso(60)); rows.length = 0; await M.push(['reportPrefs']); await N.pull();
  M.save('reportPrefs', P('m2'), iso(61)); N.save('reportPrefs', P('n2'), iso(62));
  const [rm, rn] = await Promise.all([M.push(['reportPrefs']), N.push(['reportPrefs'])]);
  t('sin la función instalada se conserva el comportamiento anterior (subida normal; la ventana de carrera documentada)', rm.ok && rn.ok);
  // ---------- 8c. más escenarios exigidos: repetición, desconexión, reintento, sesión vencida ----------
  casMode = true;
  let allOk = true, detail = [];
  for (let i = 0; i < 25; i++) {
    const X = browser('x' + i), Y = browser('y' + i), key = 'reportPrefs';
    rows.length = 0; X.save(key, P('base'), iso(1)); await X.push([key]); await Y.pull();
    X.save(key, P('X ' + i), iso(2)); Y.save(key, P('Y ' + i), iso(3));
    const [a, b] = await Promise.all(i % 2 ? [X.push([key]), Y.push([key])] : [Y.push([key]), X.push([key])]);
    const w = [a, b].filter((x) => x.pushed === 1).length, l = [a, b].filter((x) => x.conflicts.length === 1).length;
    if (!(w === 1 && l === 1 && /^[XY] \d+$/.test(note(cloudData())))) { allOk = false; detail.push([i, w, l, note(cloudData())]); }
  }
  t('25 rondas de dos escrituras simultáneas (orden alternado): en TODAS pasa exactamente una y la otra recibe conflicto; nunca dos aceptadas', allOk, detail.slice(0, 3));
  // la versión solo sube cuando se acepta una escritura
  rows.length = 0; const V1 = browser('v1'); V1.save('reportPrefs', P('v1'), iso(1)); await V1.push(['reportPrefs']);
  const verOf = () => rows.find((x) => x.key === 'reportPrefs' && x.part === 0).version;
  const v0 = verOf(); V1.save('reportPrefs', P('v2'), iso(2)); await V1.push(['reportPrefs']);
  t('la versión sube de 1 en 1 solo con escrituras aceptadas', v0 === 1 && verOf() === 2, [v0, verOf()]);
  // desconexión durante la escritura: el servidor aplicó el cambio pero la respuesta se perdió; el reintento NO debe verse como conflicto ni duplicar la escritura
  V1.save('reportPrefs', P('v3 con corte de red'), iso(3)); dropRpcResponse = true;
  r = await V1.push(['reportPrefs']);
  t('desconexión durante la escritura (respuesta perdida) + reintento: se reconoce que la escritura ya estaba en el servidor, sin conflicto falso y sin doble versión', r.ok && r.conflicts.length === 0 && note(cloudData()) === 'v3 con corte de red' && verOf() === 3, { ok: r.ok, c: r.conflicts.length, v: verOf() });
  r = await V1.push(['reportPrefs']); t('reintentar la misma operación no cambia nada (idempotente)', r.conflicts.length === 0 && verOf() === 3, verOf());
  // otra persona escribió justo mientras se perdía la respuesta: eso SÍ es conflicto
  const V2 = browser('v2'); await V2.pull(); V2.save('reportPrefs', P('otra persona'), iso(10)); await V2.push(['reportPrefs']);
  V1.save('reportPrefs', P('mi cambio sobre base vieja'), iso(11)); r = await V1.push(['reportPrefs']);
  t('si entre tanto otra persona escribió, el reintento es conflicto real y lo suyo queda intacto en la nube', r.conflicts.length === 1 && note(cloudData()) === 'otra persona', note(cloudData()));
  t('el cambio local rechazado se conserva completo para combinarlo (no se pierde)', note(r.conflicts[0].local.data) === 'mi cambio sobre base vieja' && V1.get('reportPrefs').data.edits['operativo|pacing'].note === 'mi cambio sobre base vieja');
  // sesión vencida: nada se escribe y el cambio local sigue en el navegador
  const S1 = browser('s1'); S1.save('reportPrefs', P('s1'), iso(20)); S1.ls.set('fp.cloudSession', JSON.stringify({ access_token: 'x', refresh_token: 'r', expires_at: 1, user_id: 's1', anonymous: false, team_id: 'T' }));
  const before2 = JSON.stringify(rows);
  const savedFetch = S1.FP.cloud; r = await S1.FP.cloud.pushKeys(S1.provider, ['reportPrefs'], { fetchImpl: async () => resp(400, { error: 'bad' }) });
  t('sesión vencida (renovar falla): no se escribe nada en la nube y el cambio local sigue guardado', (r.ok === false || r.pushed === 0) && JSON.stringify(rows) === before2 && S1.get('reportPrefs').data.edits['operativo|pacing'].note === 's1', r);
  casMode = false;
  // ---------- 9. configuración ----------
  t('la configuración declara la detección de conflictos para todas las claves de sincronización automática', JSON.parse(JSON.stringify(require('./_cfg.js'))).conflictKeys.includes('*'));
  console.log(bad ? `\n${bad} FALLAS` : '\nTODO OK'); process.exit(bad ? 1 : 0);
})();
