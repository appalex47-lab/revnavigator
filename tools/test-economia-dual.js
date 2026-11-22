#!/usr/bin/env node
/* Fase 2 · punto B — modelo dual de impacto económico (js/economics/impactModel.js). Oráculos independientes (aritmética directa).
 * Cubre B.7: 1 sin margen · 2 margen 25 % · 3 margen 0 % · 4 inválido · 5 fuera de rango · 6 actualización · 8 sobre venta incremental ·
 * 9 sobre venta recuperable · 10 sobre venta potencial · 11 escenarios excluyentes. (7 persistencia y 12 motores intactos: batch_fase2_margen.py)
 *   node tools/test-economia-dual.js */
const path = require('path'), fs = require('fs');
const E = require(path.join(__dirname, '../js/economics/impactModel.js'));
let bad = 0, n = 0; const t = (name, c, d) => { n++; console.log((c ? '✔ ' : '✘ ') + name + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 500) : '')); if (!c) bad++; };
const near = (a, b, e = 1e-9) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= Math.max(e, Math.abs(b) * 1e-12);
const basis = { period: '2026-09', scope: 'total', indicator: 'revenue' };
const sim = (v) => ({ valid: true, incremental: { revenue: v }, assumptions: ['supuesto de prueba'] });
const SET25 = { marginEnabled: true, grossMarginPct: 25, updatedAt: '2026-11-08T10:00:00Z', source: 'manual' };

/* 1 ── sin margen configurado: ventas completas, contribución «no_configurado», jamás 0 */
{
  const x = E.fromSimulation(sim(1000000), { period: '2026-09' }, undefined);
  t('1 sin margen: el impacto en ventas sale completo', x.amount.point === 1000000 && x.status === 'ok' && x.salesKind === 'potencial' && x.currency === 'MXN');
  t('1 sin margen: contribución = no_configurado, amount null (NO cero)', x.contribution.status === 'no_configurado' && x.contribution.amount === null && x.contribution.marginPct === null, x.contribution);
  t('1 sin margen: el impacto cumple el contrato v2', E.validateImpact(x).ok, E.validateImpact(x).errors);
  t('1 sin margen: la disponibilidad lo dice con claridad', E.availability(undefined).status === 'no_configurado' && /no se ha configurado/i.test(E.availability(undefined).message));
  t('1 sin margen: basura guardada (cadena, número, null) se trata igual que sin margen', [null, 'x', 7, [], { grossMarginPct: 'abc', marginEnabled: true }].every((s) => E.availability(s).status === 'no_configurado'));
}
/* 2 ── margen 25 % */
{
  const x = E.fromSimulation(sim(1000000), { period: '2026-09' }, SET25);
  t('2 margen 25 %: $1,000,000 de ventas → $250,000 de contribución bruta estimada', x.contribution.status === 'disponible' && near(x.contribution.amount.point, 250000), x.contribution);
  t('2 margen 25 %: declara margen, base (promedio general), fórmula, estimación y limitaciones', x.contribution.marginPct === 25 && x.contribution.marginBasis.level === 'general' && /×/.test(x.contribution.formula) && x.contribution.precision === 'estimacion_margen_promedio_general' && x.contribution.limitations.length >= 2 && x.contribution.label === 'Contribución bruta estimada');
  t('2 margen 25 %: el importe de ventas NO cambia respecto a la corrida sin margen', E.fromSimulation(sim(1000000), { period: '2026-09' }).amount.point === x.amount.point);
  t('2 margen 25 %: cumple el contrato v2', E.validateImpact(x).ok, E.validateImpact(x).errors);
  t('2 margen 25 % desactivado: contribución = desactivado, null; las ventas siguen', (() => { const y = E.fromSimulation(sim(1000000), {}, { ...SET25, marginEnabled: false }); return y.contribution.status === 'desactivado' && y.contribution.amount === null && y.amount.point === 1000000; })());
}
/* 3 ── margen 0 %: distinto de «sin margen» */
{
  const x = E.fromSimulation(sim(1000000), {}, { marginEnabled: true, grossMarginPct: 0, updatedAt: 'x', source: 'manual' });
  t('3 margen 0 %: disponible con contribución 0 (ausencia ≠ cero: aquí SÍ es un cero declarado)', x.contribution.status === 'disponible' && x.contribution.amount.point === 0 && x.contribution.marginPct === 0, x.contribution);
  t('3 margen 0 % ≠ sin margen (estados distintos)', E.availability({ marginEnabled: true, grossMarginPct: 0 }).status === 'disponible' && E.availability(undefined).status === 'no_configurado');
  t('3 margen 0 %: el contrato lo acepta', E.validateImpact(x).ok, E.validateImpact(x).errors);
}
/* 4 y 5 ── margen inválido / fuera de rango */
{
  const bads = [['', 'vacio'], [null, 'vacio'], [undefined, 'vacio'], ['abc', 'formato'], ['25%', 'formato'], ['1e2', 'formato'], [NaN, 'formato'], [Infinity, 'formato'], [{}, 'formato'], [-1, 'rango'], ['-0.01', 'rango'], [100, 'rango'], [150, 'rango'], ['100', 'rango']];
  bads.forEach(([v, code]) => { const r = E.validateMarginInput(v); t(`4/5 rechaza ${JSON.stringify(v)} (${code})`, r.ok === false && r.code === code && r.message.length > 10, r); });
  [[0, 0], ['0', 0], [25, 25], ['25', 25], ['25,5', 25.5], [' 33.33 ', 33.33], [99.99, 99.99]].forEach(([v, out]) => { const r = E.validateMarginInput(v); t(`aceptado ${JSON.stringify(v)} → ${out}`, r.ok && near(r.value, out), r); });
  const rb = E.buildSetting(undefined, { enabled: true, marginPct: '120' });
  t('4/5 guardar un margen inválido NO produce un ajuste (no se persiste nada)', rb.ok === false && !rb.setting);
  t('5 un valor guardado fuera de rango se descarta al leerlo (sin margen, no un margen roto)', E.availability({ marginEnabled: true, grossMarginPct: 150 }).status === 'no_configurado');
  t('4 conversión markup→margen: 33.33 % de markup = 25 % de margen', near(E.markupToMargin(100 / 3), 25, 1e-9) && near(E.marginToMarkup(25), 100 / 3, 1e-9) && near(E.markupToMargin(100), 50));
  t('4 la ayuda explica margen vs markup con el ejemplo $100 / $75', /\(venta − costo\) ÷ venta/.test(E.MARGIN_HELP) && /25 %/.test(E.MARGIN_HELP) && /33\.33 %/.test(E.MARGIN_HELP) && /markup/i.test(E.MARGIN_HELP));
}
/* 6 ── actualización */
{
  const s1 = E.buildSetting(undefined, { enabled: true, marginPct: 25, now: '2026-11-01T00:00:00Z' }).setting;
  const s2 = E.buildSetting(s1, { enabled: true, marginPct: '30', now: '2026-11-08T00:00:00Z' }).setting;
  t('6 actualizar el margen cambia el valor, la fecha y conserva el origen', s1.grossMarginPct === 25 && s2.grossMarginPct === 30 && s2.updatedAt === '2026-11-08T00:00:00Z' && s2.source === 'manual' && s2.marginEnabled === true, [s1, s2]);
  t('6 la contribución sigue al margen vigente (30 % de $1,000,000 = $300,000)', near(E.fromSimulation(sim(1000000), {}, s2).contribution.amount.point, 300000));
  const off = E.buildSetting(s2, { enabled: false });
  t('6 desactivar conserva valor y fecha (reactivar no obliga a recapturar)', off.marginEnabled === false && off.grossMarginPct === 30 && off.updatedAt === '2026-11-08T00:00:00Z', off);
  const on = E.buildSetting(off, { enabled: true });
  t('6 reactivar usa el valor guardado', on.ok && on.setting.marginEnabled === true && on.setting.grossMarginPct === 30);
  t('6 el ajuste guardado sobrevive a JSON (persistencia serializada) y se normaliza igual', JSON.stringify(E.normalizeSetting(JSON.parse(JSON.stringify(s2)))) === JSON.stringify(E.normalizeSetting(s2)));
}
/* 8 ── venta incremental (observada de un cambio ya medido) · 9 ── recuperable · 10 ── potencial */
{
  const gap = E.fromGap({ revenue: { actual: 15233993.8272, plan: 15956810, gap: -722816.1728 } }, { period: '2026-09' }, SET25);
  t('8 venta observada y brecha: ventas intactas y contribución = ventas × 25 %', near(gap[0].amount.point, 15233993.8272) && near(gap[0].contribution.amount.point, 15233993.8272 * 0.25) && near(gap[1].amount.point, -722816.1728) && near(gap[1].contribution.amount.point, -722816.1728 * 0.25), gap.map((g) => g.contribution));
  t('8 la brecha negativa produce contribución negativa (contribución en riesgo), no cero', gap[1].contribution.amount.point < 0 && gap[1].category === 'brecha' && gap[1].salesKind === 'brecha');
  const ro = { ok: true, alternatives: [{ id: 'cr', label: 'Conversión', simulated: { incremental: 722816 } }, { id: 'traffic', label: 'Tráfico', simulated: { incremental: 722816 } }, { id: 'aov', label: 'Ticket', simulated: { incremental: 722816 } }] };
  const rec = E.fromRecovery(ro, { period: '2026-09' }, SET25);
  t('9 venta recuperable: cada alternativa = ventas × 25 % (kind «recuperable»)', rec.length === 3 && rec.every((r) => r.salesKind === 'recuperable' && near(r.contribution.amount.point, 722816 * 0.25) && E.validateImpact(r).ok), rec.map((r) => E.validateImpact(r).errors));
  const pot = E.fromSimulation(sim(2500000), { period: '2026-09' }, SET25);
  t('10 venta potencial: ventas × 25 % (kind «potencial»)', pot.salesKind === 'potencial' && near(pot.contribution.amount.point, 625000));
  const ord = E.checkOrdering({ potencial_teorico: pot, alcanzable: rec[0] });
  t('10 el recuperable no excede el potencial (orden de categorías)', ord.ok, ord);
  t('10 recuperable > potencial se detecta', !E.checkOrdering({ potencial_teorico: sim(0) && E.fromSimulation(sim(100), {}, SET25), alcanzable: rec[0] }).ok);
}
t('9 una alternativa inviable (sin simulación) = datos insuficientes con su motivo, nunca 0', (() => { const r = E.fromRecovery({ ok: true, alternatives: [{ id: 'x', label: 'X', feasible: false, errors: ['El CR resultante excede 100 %.'], simulated: null }] }, {}, SET25)[0]; return r.status === 'insufficient_data' && r.amount === null && /excede/.test(r.reason) && r.contribution.status === 'sin_importe'; })());
/* 11 ── escenarios excluyentes y superpuestos */
{
  const ro = { ok: true, alternatives: [{ id: 'a', label: 'A', simulated: { incremental: 700000 } }, { id: 'b', label: 'B', simulated: { incremental: 800000 } }, { id: 'c', label: 'C', simulated: { incremental: 750000 } }] };
  const items = E.fromRecovery(ro, { period: '2026-09' }, SET25);
  const c = E.combineImpacts(items, SET25), tot = c.byCategory['alcanzable|projected'];
  t('11 alternativas que cierran la misma brecha: rango [700k, 800k], NO la suma (2.25 M)', tot.low === 700000 && tot.high === 800000 && tot.point === 700000 && tot.point < 2250000 && c.warnings.some((w) => /excluyentes/.test(w)), tot);
  t('11 contribución del rango = rango × 25 % (175k – 200k); no suma las contribuciones de alternativas', near(tot.contribution.amount.low, 175000) && near(tot.contribution.amount.high, 200000), tot.contribution);
  const ov = [E.makeImpact({ id: 'x', category: 'potencial_teorico', provenance: 'projected', amount: { point: 500000 }, method: { id: 'm', formula: 'f', engine: 'e' }, basis, horizon: 'h', assumptions: ['a'], overlapGroup: 'cr_gap' }, SET25),
    E.makeImpact({ id: 'y', category: 'potencial_teorico', provenance: 'projected', amount: { point: 600000 }, method: { id: 'm', formula: 'f', engine: 'e' }, basis, horizon: 'h', assumptions: ['a'], overlapGroup: 'cr_gap' }, SET25),
    E.makeImpact({ id: 'z', category: 'potencial_teorico', provenance: 'projected', amount: { point: 100000 }, method: { id: 'm', formula: 'f', engine: 'e' }, basis, horizon: 'h', assumptions: ['a'] }, SET25)];
  const co = E.combineImpacts(ov, SET25).byCategory['potencial_teorico|projected'];
  t('11 oportunidades superpuestas: se toma la mayor (600k) + la independiente (100k) = 700k, no 1.2 M', co.point === 700000 && near(co.contribution.amount.point, 175000), co);
  t('11 datos insuficientes no suman cero: el total queda marcado incompleto y la contribución sigue siendo de lo disponible', (() => { const bad_ = E.fromRecovery({ ok: false, reason: 'No hay brecha que recuperar.' }, {}, SET25); const k = E.combineImpacts([...ov, ...bad_], SET25); return bad_[0].status === 'insufficient_data' && bad_[0].amount === null && bad_[0].contribution.status === 'sin_importe' && bad_[0].contribution.amount === null && k.excluded.length === 1 && k.byCategory['potencial_teorico|projected'].incomplete === true; })());
  t('11 sin margen, el combinado de ventas es idéntico y la contribución del total no se calcula (null, no 0)', (() => { const a = E.combineImpacts(ov, undefined).byCategory['potencial_teorico|projected'], b = E.combineImpacts(ov, SET25).byCategory['potencial_teorico|projected'], c0 = E.combineImpacts(ov, {}).byCategory['potencial_teorico|projected']; return a.point === b.point && a.low === b.low && a.high === b.high && c0.contribution.status === 'no_configurado' && c0.contribution.amount === null; })());
}
/* Propiedad: linealidad e independencia del margen respecto de las ventas */
{
  let ok = true, ok2 = true;
  for (let i = 0; i < 200; i++) {
    const v = (Math.random() - 0.3) * 5e7, m = Math.round(Math.random() * 9990) / 100;
    const x = E.fromSimulation(sim(v), {}, { marginEnabled: true, grossMarginPct: m, updatedAt: 'x', source: 'manual' }), y = E.fromSimulation(sim(v), {}, undefined);
    ok = ok && near(x.contribution.amount.point, v * m / 100, 1e-6);
    ok2 = ok2 && x.amount.point === y.amount.point && JSON.stringify(x.method) === JSON.stringify(y.method) && JSON.stringify(x.basis) === JSON.stringify(y.basis);
  }
  t('propiedad (200 casos): contribución = ventas × margen / 100', ok);
  t('propiedad (200 casos): el margen nunca altera ventas, método ni base del impacto', ok2);
}
/* Contrato */
{
  const bad1 = { ...E.fromSimulation(sim(1), {}, SET25) }; bad1.contribution = { ...bad1.contribution, amount: { point: 999 } };
  t('contrato: una contribución que no es ventas × margen se rechaza', !E.validateImpact(bad1).ok);
  const bad2 = { ...E.fromSimulation(sim(1), {}, undefined) }; bad2.contribution = { ...bad2.contribution, amount: { point: 0 } };
  t('contrato: «sin margen» con importe 0 se rechaza (ausencia ≠ cero)', !E.validateImpact(bad2).ok);
  const v1 = { schema: 'cc.economic_impact', version: 1, category: 'brecha', status: 'ok', provenance: 'observed', amount: { point: -5 }, basis, method: { id: 'g', formula: 'f', engine: 'gap' }, assumptions: [] };
  t('compatibilidad: los impactos v1 de la Fase 2 siguen siendo válidos', E.validateImpact(v1).ok);
  t('contrato: la categoría y el salesKind deben corresponder', !E.validateImpact({ ...E.fromSimulation(sim(1), {}, SET25), salesKind: 'recuperable' }).ok);
  t('futuro: resolveMargin acepta un alcance (categoría/SKU) y hoy responde con el margen general declarándolo', (() => { const r = E.resolveMargin(SET25, { level: 'sku', key: 'X1' }); return r.available && r.pct === 25 && r.basis.level === 'general' && r.basis.requestedScope === 'sku'; })());
}
/* Lenguaje: nada de utilidad/ROI en lo que ve el usuario */
{
  const src = fs.readFileSync(path.join(__dirname, '../js/economics/impactModel.js'), 'utf8');
  const strings = [E.MARGIN_HELP, E.CONTRIBUTION_LABEL, ...E.CONTRIBUTION_CAVEATS, E.availability(undefined).message, E.availability(SET25).message];
  const BAN = /utilidad neta|ganancia neta|beneficio financiero neto|rentabilidad neta|\bROI\b|\bROAS\b|\bCAC\b/i;
  t('lenguaje: ningún texto al usuario usa utilidad/ganancia/beneficio neto, ROI, ROAS o CAC', !strings.some((s) => BAN.test(s)), strings.filter((s) => BAN.test(s)));
  t('lenguaje: el módulo no importa motores de ventas (solo recibe sus resultados)', !/FP\.(gap|pacing|forecastEngine|scenarioEngine|recoveryEngine|attribution)\b/.test(src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')));
}
console.log(`\n${n - bad} bien, ${bad} mal`); process.exit(bad ? 1 : 0);
