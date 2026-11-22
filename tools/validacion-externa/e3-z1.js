#!/usr/bin/env node
/* E-3 · Validación de Z1 y de la confiabilidad (cc.reliability/1) con datos reales de un periodo.
 *   node tools/validacion-externa/e3-z1.js --origen real [--diario <ruta>] [--config <ruta>]
 * Construye la entrada de Z1 por canal y Total a partir del diario (sin fórmulas propias: usa FP.metrics.calcGap y FP.attentionEngine.support de la aplicación), ejecuta FP.z1.build y
 * FP.reliability.assess, y comprueba 7 invariantes (A1–A7) + la comparación con lo ESPERADO por el analista (A8, opcional). NO modifica reglas ni umbrales.
 * Salida: salida/<origen>/e3-z1.{json,md}. Código: 0 = sin fallas, 1 = falla/estructura inválida, 2 = PENDIENTE (faltan datos). */
const path = require('path'), L = require('./lib.js');
const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined; };
const origen = arg('--origen'), out = { id: 'E-3', origen, banner: L.banner(origen), generado: new Date().toISOString() };
const finish = (v, code) => { out.veredicto = v; const md = render(); const rel = L.writeReport(origen, 'e3-z1', out, md); console.log(md); console.log('Reporte: ' + rel); process.exit(code); };
function render() {
  let s = `# E-3 · Z1 y confiabilidad con datos de un periodo\n\n**${out.banner}** · veredicto: **${out.veredicto}**\n\n`; if (out.error) return s + `Motivo: ${out.error}\n`;
  s += `Periodo: ${out.config.periodo.tipo} ${out.config.periodo.clave} · corte ${out.config.corte} (${out.diasEsperados} días)\n- diario: \`${out.archivos.diario.ruta}\` sha256 \`${out.archivos.diario.sha256}\`\n- config: \`${out.archivos.config.ruta}\` sha256 \`${out.archivos.config.sha256}\`\n\n## Estructura\n- errores: ${out.estructura.errores.length} · advertencias: ${out.estructura.advertencias.length}\n`;
  out.estructura.errores.slice(0, 30).forEach((e) => { s += `  - ERROR ${e}\n`; }); out.estructura.advertencias.slice(0, 30).forEach((e) => { s += `  - aviso ${e}\n`; });
  if (!out.entidades) return s;
  s += `\n## Resultado por entidad\n` + L.mdTable(['entidad', 'días contados', 'cobertura', 'cumplimiento', 'nivel (Z1)', 'completitud', 'comparabilidad', 'mostrar venta', 'clasificar estado', 'estimar impacto'], out.entidades.map((e) => [e.id, e.diasContados, e.cobertura === null ? '—' : (e.cobertura * 100).toFixed(1) + ' %', e.cumplimiento === null ? '—' : (e.cumplimiento * 100).toFixed(2) + ' %', e.nivel, e.completitud, e.comparabilidad, e.usos.show_metric, e.usos.classify_state, e.usos.estimate_impact]));
  s += `\n## Invariantes\n` + L.mdTable(['entidad', ...out.invariantes.map((i) => i.id)], out.entidades.map((e) => [e.id, ...out.invariantes.map((i) => e.invariantes[i.id])]));
  s += `\n${out.invariantes.map((i) => `- **${i.id}** ${i.texto}`).join('\n')}\n\n## Razones y límites declarados por la confiabilidad\n` + out.entidades.map((e) => `- **${e.id}** (${e.nivel}): ${[...e.explicacion.limits, ...(e.explicacion.missing.length ? ['falta: ' + e.explicacion.missing.join(', ')] : [])].join(' · ') || 'sin limitaciones declaradas'}`).join('\n') + '\n';
  return s;
}
const rd = L.resolveInput(origen, 'diario-plan-real.csv', arg('--diario')), rc = L.resolveInput(origen, 'config-z1.json', arg('--config'));
const bad = [rd, rc].find((x) => x.error && !x.missing); if (bad) { out.error = bad.error; finish('FALLIDA', 1); }
const miss = [rd, rc].filter((x) => x.missing); if (miss.length) { out.error = miss.map((x) => x.error).join('; '); finish('PENDIENTE (faltan datos)', 2); }
if (origen === 'real') { const m = L.manifest('real'); if (m.error) { out.error = m.error; finish('FALLIDA', 1); } out.manifiesto = m.manifest; }
out.archivos = { diario: { ruta: path.relative(L.ROOT, rd.file), sha256: rd.sha }, config: { ruta: path.relative(L.ROOT, rc.file), sha256: rc.sha } };
const err = [], adv = [], CH = ['ecommerce', 'app', 'whatsapp', 'llamadas']; let cfg; try { cfg = JSON.parse(rc.text); } catch (e) { out.error = 'config-z1.json no es JSON válido: ' + e.message; finish('FALLIDA', 1); }
out.config = cfg;
if (!L.parseIso(cfg.corte || '')) err.push('config: «corte» debe ser aaaa-mm-dd'); const per = cfg.periodo || {};
if (!['mes', 'anio'].includes(per.tipo)) err.push('config: periodo.tipo debe ser «mes» o «anio»'); else if (per.tipo === 'mes' ? !/^\d{4}-\d{2}$/.test(per.clave || '') : !/^\d{4}$/.test(per.clave || '')) err.push('config: periodo.clave debe ser aaaa-mm (mes) o aaaa (anio)');
Object.entries(cfg.calidad || {}).forEach(([c, q]) => { if (!CH.includes(c)) err.push(`config: calidad de canal desconocido «${c}»`); if (!['ready', 'warnings', 'invalid'].includes(q)) err.push(`config: calidad «${q}» de ${c} debe ser ready|warnings|invalid`); });
const D = L.parseCsv(rd.text), H = D.header.map((h) => h.toLowerCase()); ['date', 'channel', 'plan_revenue', 'actual_revenue', 'sessions', 'orders'].filter((c) => !H.includes(c)).forEach((c) => err.push(`diario: falta la columna «${c}»`));
let start = null, end = cfg.corte; if (!err.length) { start = per.tipo === 'mes' ? per.clave + '-01' : per.clave + '-01-01'; if (start > end) err.push('el corte es anterior al inicio del periodo'); }
const rows = [], seen = new Set(); let outside = 0;
if (!err.length) D.rows.forEach((r) => { const d = L.parseIso(r.date), ch = r.channel.toLowerCase(); if (!d) return err.push(`diario línea ${r._line}: fecha inválida`); if (!CH.includes(ch)) return err.push(`diario línea ${r._line}: canal «${r.channel}»`);
  const p = L.parseNum(r.plan_revenue), a = L.parseNum(r.actual_revenue), s = L.parseNum(r.sessions), o = L.parseNum(r.orders);
  if ([p, a, s, o].some((x) => Number.isNaN(x))) return err.push(`diario línea ${r._line}: valor no numérico`); const k = d + '|' + ch; if (seen.has(k)) return err.push(`diario línea ${r._line}: DUPLICADO ${d} ${ch}`); seen.add(k);
  if (d < start || d > end) { outside++; return; }
  if (s !== null && s < 0 || o !== null && o < 0 || a !== null && a < 0) adv.push(`diario línea ${r._line}: valor NEGATIVO (Z1 debe declarar «no calculable»)`);
  rows.push({ d, ch, p, a, s, o }); });
if (outside) adv.push(`${outside} filas fuera del periodo hasta el corte (se ignoran; p. ej. el plan de días futuros)`);
const chans = [...new Set(rows.map((r) => r.ch))].sort(); if (!err.length && !chans.length) err.push('el diario no tiene filas dentro del periodo');
out.diasEsperados = start ? Math.round((Date.parse(end) - Date.parse(start)) / 864e5) + 1 : 0;
out.estructura = { ok: !err.length, errores: err, advertencias: adv, estadisticas: { filas: rows.length, canales: chans } };
if (err.length) finish('FALLIDA', 1);
/* ---------- entrada de Z1 (solo con funciones de la aplicación) ---------- */
const FP = L.appContext(), sum = (xs) => xs.reduce((a, x) => a + x, 0), q = cfg.calidad || {};
const days = []; for (let t = Date.parse(start); t <= Date.parse(end); t += 864e5) days.push(new Date(t).toISOString().slice(0, 10));
function build(id, perDay) { // perDay: { d → {p,a,s,o} } ya combinado para la entidad
  const counted = days.filter((d) => perDay[d] && perDay[d].a !== null && perDay[d].a !== undefined), withPlan = counted.filter((d) => perDay[d].p !== null && perDay[d].p !== undefined && perDay[d].p > 0);
  const planOk = counted.length > 0 && withPlan.length === counted.length, planTo = planOk ? sum(counted.map((d) => perDay[d].p)) : null, actTo = counted.length ? sum(counted.map((d) => perDay[d].a)) : null;
  const sess = counted.length && counted.every((d) => perDay[d].s !== null && perDay[d].s !== undefined) ? sum(counted.map((d) => perDay[d].s)) : null, ord = counted.length && counted.every((d) => perDay[d].o !== null && perDay[d].o !== undefined) ? sum(counted.map((d) => perDay[d].o)) : null;
  const g = planTo !== null && actTo !== null ? FP.metrics.calcGap(planTo, actTo) : null, expected = days.length, cov = expected ? withPlan.length / expected : null;
  const quality = id === 'total' ? (Object.values(q).includes('invalid') ? 'invalid' : Object.values(q).includes('warnings') ? 'warnings' : 'ready') : (q[id] || 'ready');
  const sup = FP.attentionEngine.support({ summary: { whyPlan: { coverage: { paired: withPlan.length, expected } } }, status: { data: { quality } } }).level;
  const input = { period: { daysCounted: counted.length }, plan: { available: planOk }, revenue: { planToDate: planTo, actualToDate: actTo, gap: g ? g.abs : null, compliance: g ? g.attainment : null, gapPct: g ? g.pct : null },
    activity: counted.length ? { sessions: sess, orders: ord, revenue: actTo } : undefined, forecast: {}, reliability: { support: { alto: 'alto', medio: 'medio', bajo: 'bajo' }[sup] || 'bajo', coverage: cov, warnings: quality === 'warnings' ? ['Datos con avisos de calidad (declarado en config-z1.json).'] : [], blocking: [], dataErrors: quality === 'invalid' } };
  return { id, input, counted: counted.length, cov };
}
const entidades = chans.map((c) => { const pd = {}; rows.filter((r) => r.ch === c).forEach((r) => { pd[r.d] = r; }); return build(c, pd); });
const tot = {}; days.forEach((d) => { const rs = chans.map((c) => rows.find((r) => r.ch === c && r.d === d)); if (rs.every((r) => r && r.a !== null && r.a !== undefined)) tot[d] = { p: rs.every((r) => r.p !== null) ? sum(rs.map((r) => r.p)) : null, a: sum(rs.map((r) => r.a)), s: rs.every((r) => r.s !== null) ? sum(rs.map((r) => r.s)) : null, o: rs.every((r) => r.o !== null) ? sum(rs.map((r) => r.o)) : null }; });
entidades.push(build('total', tot));
const hasNF = (o) => { if (typeof o === 'number') return !Number.isFinite(o); return o && typeof o === 'object' ? Object.values(o).some(hasNF) : false; };
out.invariantes = [{ id: 'A1', texto: 'el nivel de reliability es EXACTAMENTE el de Z1' }, { id: 'A2', texto: 'la venta observada válida se muestra (o Z1 declara sin_actividad / no_calculable)' }, { id: 'A3', texto: 'sesiones o pedidos ausentes llegan como null (nunca 0) y no hay conclusión de conversión' }, { id: 'A4', texto: 'cobertura < 100 % ⇒ nivel ≠ Alta; actividad ausente ⇒ completitud ≠ verificada' }, { id: 'A5', texto: 'valores negativos ⇒ nivel Insuficiente (no calculable)' }, { id: 'A6', texto: 'ni NaN ni Infinity en la entrada ni en las salidas' }, { id: 'A7', texto: 'brecha y cumplimiento de la entrada = FP.metrics.calcGap (trazabilidad)' }, { id: 'A8', texto: 'coincide con lo esperado por el analista (si se declaró en config-z1.json)' }];
const exp = cfg.esperados || {};
out.entidades = entidades.map((e) => { const z = FP.z1.build(e.input), a = FP.reliability.assess(e.input), r = e.input.revenue, act = e.input.activity, inv = {}, neg = (v) => typeof v === 'number' && v < 0;
  inv.A1 = a.level === z.reliability.level; inv.A2 = z.economic.observed.visible || z.reliability.causes.some((c) => ['sin_actividad', 'no_calculable', 'sin_venta'].includes(c));
  inv.A3 = !act || !(act.sessions === null || act.orders === null) || (z.conclusions.conversion !== 'observable' && z.conclusions.conversion !== 'cero_observado');
  inv.A4 = (e.cov === null || e.cov >= 1 || z.reliability.level !== 'Alta') && (!(act && (act.sessions === null || act.orders === null)) || a.completeness !== 'verificada');
  inv.A5 = !(neg(r.actualToDate) || (act && (neg(act.sessions) || neg(act.orders)))) || z.reliability.level === 'Insuficiente'; inv.A6 = !hasNF(e.input) && !hasNF(z) && !hasNF(a);
  inv.A7 = r.planToDate === null || r.actualToDate === null || (r.gap === FP.metrics.calcGap(r.planToDate, r.actualToDate).abs && r.compliance === FP.metrics.calcGap(r.planToDate, r.actualToDate).attainment);
  const ex = exp[e.id]; inv.A8 = !ex ? 'N/A' : ((!ex.nivel || ex.nivel === a.level) && (!ex.completitud || ex.completitud === a.completeness));
  const row = { id: e.id, diasContados: e.counted, cobertura: e.cov, cumplimiento: r.compliance, nivel: a.level, completitud: a.completeness, comparabilidad: z.comparability.code, usos: Object.fromEntries(Object.entries(a.uses).map(([k, v]) => [k, v.restriction === 'none' ? 'permitido' : v.restriction])), explicacion: a.explain, esperado: ex || null, entrada: e.input };
  row.invariantes = Object.fromEntries(Object.entries(inv).map(([k, v]) => [k, v === 'N/A' ? 'N/A' : v ? 'OK' : 'FALLA'])); return row; });
const fallas = out.entidades.flatMap((e) => Object.entries(e.invariantes).filter(([k, v]) => v === 'FALLA').map(([k]) => `${e.id}:${k}`));
out.fallas = fallas; const defectos = fallas.filter((f) => !f.endsWith(':A8'));
finish(defectos.length ? 'FALLIDA (invariantes: ' + defectos.join(', ') + ')' : fallas.length ? 'DIFERENCIAS CON LO ESPERADO (revisión analítica: ' + fallas.join(', ') + ')' : 'APROBADA', fallas.length ? 1 : 0);
