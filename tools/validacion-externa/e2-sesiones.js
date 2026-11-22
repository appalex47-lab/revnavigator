#!/usr/bin/env node
/* E-2 · Conciliación de sesiones: serie diaria por canal ↔ segmentos GA4.
 *   node tools/validacion-externa/e2-sesiones.js --origen real --from 2026-09-01 --to 2026-09-30 [--tolerance 0.05] [--diario <ruta>] [--segmentos <ruta>]
 * Valida estructura (periodo, canales, dimensiones, duplicados, negativos, no enteros), compara cada canal × dimensión con el total diario SIN sumar dimensiones y reporta diferencias
 * por periodo y por día. La tolerancia SOLO se aplica si se declara con --tolerance; el paquete NO fija ni sugiere un valor de negocio: entrega la evidencia (mediana, p95, máximo) para que se decida.
 * Salida: salida/<origen>/e2-sesiones.{json,md}. Código: 0 = conciliación ejecutada, 1 = estructura inválida, 2 = PENDIENTE (faltan datos). */
const path = require('path'), L = require('./lib.js');
const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined; };
const origen = arg('--origen'), from = arg('--from'), to = arg('--to'), tol = arg('--tolerance') !== undefined ? Number(arg('--tolerance')) : undefined;
const out = { id: 'E-2', origen, banner: L.banner(origen), generado: new Date().toISOString(), periodo: { from, to }, toleranciaDeclarada: Number.isFinite(tol) ? tol : null };
const finish = (v, code) => { out.veredicto = v; const md = render(); const rel = L.writeReport(origen, 'e2-sesiones', out, md); console.log(md); console.log('Reporte: ' + rel); process.exit(code); };
const pct = (x) => (x === null || x === undefined ? '—' : (x * 100).toFixed(2) + ' %');
function render() {
  let s = `# E-2 · Conciliación serie diaria ↔ segmentos GA4\n\n**${out.banner}** · veredicto: **${out.veredicto}**\n\n`; if (out.error) return s + `Motivo: ${out.error}\n`;
  s += `Periodo: ${out.periodo.from} → ${out.periodo.to} · tolerancia declarada: ${out.toleranciaDeclarada === null ? 'ninguna (no se aplica)' : pct(out.toleranciaDeclarada)}\n- diario: \`${out.archivos.diario.ruta}\` sha256 \`${out.archivos.diario.sha256}\`\n- segmentos: \`${out.archivos.segmentos.ruta}\` sha256 \`${out.archivos.segmentos.sha256}\`\n\n## Estructura\n- errores: ${out.estructura.errores.length} · advertencias: ${out.estructura.advertencias.length}\n`;
  out.estructura.errores.slice(0, 30).forEach((e) => { s += `  - ERROR ${e}\n`; }); out.estructura.advertencias.slice(0, 30).forEach((e) => { s += `  - aviso ${e}\n`; });
  if (!out.conciliacion) return s;
  s += `\n## Conciliación por canal × dimensión (periodo completo)\n` + L.mdTable(['canal', 'dimensión', 'total diario', 'total segmentos', 'diferencia', '%', 'estado', 'días diario/seg'], out.conciliacion.filas.map((f) => [f.canal, f.dimension || '—', f.totalDiario ?? '—', f.totalSegmentos ?? '—', f.diferencia ?? '—', pct(f.pct), f.estado, `${f.diasDiario}/${f.diasSegmentos}`]));
  s += `\n## Evidencia por día (para decidir una tolerancia; el paquete NO la fija)\n` + L.mdTable(['canal', 'dimensión', 'días comparados', 'días con diferencia', 'mediana abs %', 'p95 abs %', 'máx abs %'], out.conciliacion.porDia.map((f) => [f.canal, f.dimension, f.dias, f.diasConDiferencia, pct(f.mediana), pct(f.p95), pct(f.max)]));
  s += `\n## Advertencias de doble conteo\n` + (out.conciliacion.advertencias.length ? out.conciliacion.advertencias.map((w) => `- ${w.channel}: ${w.detail}`).join('\n') : '- ninguna') + '\n';
  s += `\n## Lectura\n- Las dimensiones NO se suman entre sí (un visitante cuenta en cada una).\n- Si el estado es «discrepancia_sin_criterio» no existe una tolerancia aprobada: la diferencia se reporta, no se oculta.\n- «sin_diferencia_observada» no equivale a conciliación formal (D-02).\n`; return s;
}
const rd = L.resolveInput(origen, 'diario-canal.csv', arg('--diario')), rs = L.resolveInput(origen, 'segmentos-ga4.csv', arg('--segmentos'));
const bad = [rd, rs].find((x) => x.error && !x.missing); if (bad) { out.error = bad.error; finish('FALLIDA', 1); }
const miss = [rd, rs].filter((x) => x.missing); if (miss.length) { out.error = miss.map((x) => x.error).join('; '); finish('PENDIENTE (faltan datos)', 2); }
if (origen === 'real') { const m = L.manifest('real'); if (m.error) { out.error = m.error; finish('FALLIDA', 1); } out.manifiesto = m.manifest; }
out.archivos = { diario: { ruta: path.relative(L.ROOT, rd.file), sha256: rd.sha }, segmentos: { ruta: path.relative(L.ROOT, rs.file), sha256: rs.sha } };
const err = [], adv = [], CH = ['ecommerce', 'app', 'whatsapp', 'llamadas'], GA4_CH = ['ecommerce', 'app'];
const D = L.parseCsv(rd.text), S = L.parseCsv(rs.text), has = (h, c) => h.map((x) => x.toLowerCase()).includes(c);
['date', 'channel', 'sessions'].filter((c) => !has(D.header, c)).forEach((c) => err.push(`diario: falta la columna «${c}»`));
['date', 'channel', 'dimension', 'segment', 'sessions'].filter((c) => !has(S.header, c)).forEach((c) => err.push(`segmentos: falta la columna «${c}»`));
if (origen === 'real' && (!from || !to)) err.push('el periodo explícito (--from y --to, aaaa-mm-dd) es obligatorio con datos reales');
if (from && !L.parseIso(from)) err.push('--from inválido (aaaa-mm-dd)'); if (to && !L.parseIso(to)) err.push('--to inválido (aaaa-mm-dd)'); if (from && to && from > to) err.push('--from es posterior a --to');
const dRows = [], sRows = [], seenD = new Set(), seenS = new Set();
if (!err.length) {
  D.rows.forEach((r) => { const d = L.parseIso(r.date), ch = r.channel.toLowerCase(), v = L.parseNum(r.sessions);
    if (!d) return err.push(`diario línea ${r._line}: fecha inválida (aaaa-mm-dd)`); if (!CH.includes(ch)) return err.push(`diario línea ${r._line}: canal «${r.channel}» fuera de ${CH.join('|')}`);
    if (Number.isNaN(v)) return err.push(`diario línea ${r._line}: sessions no numérico`); if (v !== null && v < 0) return err.push(`diario línea ${r._line}: sessions negativo`); if (v !== null && !Number.isInteger(v)) adv.push(`diario línea ${r._line}: sessions no entero (${v})`);
    const k = d + '|' + ch; if (seenD.has(k)) return err.push(`diario línea ${r._line}: DUPLICADO ${d} ${ch} (una fila por fecha × canal)`); seenD.add(k); dRows.push({ date: d, channel: ch, sessions: v }); });
  S.rows.forEach((r) => { const d = L.parseIso(r.date), ch = r.channel.toLowerCase(), v = L.parseNum(r.sessions);
    if (!d) return err.push(`segmentos línea ${r._line}: fecha inválida`); if (!CH.includes(ch)) return err.push(`segmentos línea ${r._line}: canal «${r.channel}» fuera de ${CH.join('|')}`);
    if (!GA4_CH.includes(ch)) return err.push(`segmentos línea ${r._line}: GA4 no mide «${ch}» (solo ${GA4_CH.join(', ')})`); if (!r.dimension) return err.push(`segmentos línea ${r._line}: dimensión vacía`); if (!r.segment) return err.push(`segmentos línea ${r._line}: segmento vacío`);
    if (Number.isNaN(v)) return err.push(`segmentos línea ${r._line}: sessions no numérico`); if (v !== null && v < 0) return err.push(`segmentos línea ${r._line}: sessions negativo`); if (v !== null && !Number.isInteger(v)) adv.push(`segmentos línea ${r._line}: sessions no entero (${v})`);
    const k = [d, ch, r.dimension, r.segment].join('|'); if (seenS.has(k)) return err.push(`segmentos línea ${r._line}: DUPLICADO ${d} ${ch} ${r.dimension}=${r.segment} (doble conteo)`); seenS.add(k); sRows.push({ date: d, channel: ch, dimension: r.dimension, segment: r.segment, sessions: v }); });
}
const inP = (d) => (!from || d >= from) && (!to || d <= to), dIn = dRows.filter((r) => inP(r.date)), sIn = sRows.filter((r) => inP(r.date));
if (!err.length) { if (!dIn.length) err.push('la serie diaria no tiene filas dentro del periodo'); if (!sIn.length) err.push('los segmentos no tienen filas dentro del periodo');
  if (from && to) { const total = Math.round((Date.parse(to) - Date.parse(from)) / 864e5) + 1; CH.forEach((ch) => { const n = new Set(dIn.filter((r) => r.channel === ch).map((r) => r.date)).size; if (n && n < total) adv.push(`diario ${ch}: ${n} de ${total} días del periodo (faltan ${total - n})`); if (!n) adv.push(`diario ${ch}: sin filas en el periodo`); }); }
  [...new Set(sIn.map((r) => r.channel + '|' + r.dimension))].forEach((k) => { const [ch, dm] = k.split('|'), rows = sIn.filter((r) => r.channel === ch && r.dimension === dm), ns = rows.filter((r) => /^\(?not set\)?$/i.test(r.segment)).reduce((a, r) => a + (r.sessions || 0), 0), tot = rows.reduce((a, r) => a + (r.sessions || 0), 0); if (tot && ns / tot > 0.2) adv.push(`segmentos ${ch}/${dm}: ${(ns / tot * 100).toFixed(1)} % del tráfico «(not set)»`); });
  sIn.filter((r) => r.sessions === null).length && adv.push(`${sIn.filter((r) => r.sessions === null).length} filas de segmentos sin sessions (se tratan como ausentes, no como 0)`); }
out.estructura = { ok: err.length === 0, errores: err, advertencias: adv, estadisticas: { filasDiario: dRows.length, filasSegmentos: sRows.length } };
if (err.length) finish('FALLIDA', 1);
/* ---------- conciliación (función de la aplicación + estadísticas por día) ---------- */
const FP = L.appContext(), rep = FP.metricCatalog.reconcileSessionsReport(dIn, sIn, { from, to, tolerancePct: out.toleranciaDeclarada === null ? undefined : out.toleranciaDeclarada });
out.conciliacion = { advertencias: rep.warnings, combinedTotal: rep.combinedTotal, filas: rep.rows.map((r) => ({ canal: r.channel, dimension: r.dimension, totalDiario: r.dailyTotal, totalSegmentos: r.segmentsTotal, diferencia: r.difference, pct: r.differencePct, estado: r.status, diasDiario: r.daysDaily, diasSegmentos: r.daysSegments, nota: r.universeNote || null })), porDia: [] };
const q = (xs, p) => { if (!xs.length) return null; const s = xs.slice().sort((a, b) => a - b), i = (s.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
[...new Set(sIn.map((r) => r.channel + '|' + r.dimension))].sort().forEach((k) => { const [ch, dm] = k.split('|'), per = []; let con = 0;
  const days = [...new Set(dIn.filter((r) => r.channel === ch && r.sessions !== null).map((r) => r.date))];
  days.forEach((d) => { const dv = dIn.find((r) => r.channel === ch && r.date === d).sessions, ss = sIn.filter((r) => r.channel === ch && r.dimension === dm && r.date === d && r.sessions !== null); if (!ss.length) return; const sv = ss.reduce((a, r) => a + r.sessions, 0); if (dv !== sv) con++; per.push(dv ? Math.abs((dv - sv) / dv) : (sv ? 1 : 0)); });
  out.conciliacion.porDia.push({ canal: ch, dimension: dm, dias: per.length, diasConDiferencia: con, mediana: q(per, 0.5), p95: q(per, 0.95), max: per.length ? Math.max(...per) : null }); });
finish('CONCILIACIÓN EJECUTADA (tolerancia no fijada por el paquete)', 0);
