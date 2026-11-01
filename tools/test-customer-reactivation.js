#!/usr/bin/env node
/* Clientes y LTV · reactivación: tasa observada, venta potencial, top y lista completa.
   Cifras esperadas calculadas AQUÍ con una implementación independiente (sin usar el motor). */
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const ctx = { console }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('js/analytics/customerEngine.js', 'utf8'), ctx);
const E = ctx.FP.customerEngine;
let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const START = E.dayNum('2024-01-01'), END = E.dayNum('2025-12-31');
/* 600 clientes; cada uno con 1 a 6 pedidos repartidos en 2 años, en 2 canales */
const raw = [];
for (let c = 0; c < 600; c++) {
  const k = 1 + Math.floor(rnd() * 6); let d = START + Math.floor(rnd() * 500);
  for (let j = 0; j < k && d <= END; j++) { raw.push({ cust: 'c' + c, order: 'o' + c + '_' + j, day: d, channel: rnd() < 0.6 ? 'ecommerce' : 'app', rev: 100 + Math.floor(rnd() * 900) }); d += 20 + Math.floor(rnd() * 200); }
}
raw.push({ cust: 'c0', order: 'last', day: END, channel: 'app', rev: 10 });   // el libro termina el 31-dic-2025
const dr = E.draftLedger(['0', 'null']);
raw.forEach((o) => dr.add({ order: o.order, customer: o.cust, day: o.day, channel: o.channel, revenue: o.rev }));
const L = E.emptyLedger(); E.mergeInto(L, dr, { id: 'b', fileName: 'x.csv' });

/* implementación independiente */
function expected(rows, chan) {
  const by = new Map(); const maxDay = Math.max(...raw.map((o) => o.day)), minDay = Math.min(...raw.map((o) => o.day)), D0 = maxDay - 180;
  rows.filter((o) => !chan || o.channel === chan).forEach((o) => { (by.get(o.cust) || by.set(o.cust, []).get(o.cust)).push(o); });
  let risk = 0, lost = 0, base = 0, ret = 0, retRev = 0, retOrd = 0, ordLast = 0; const lapsed = [];
  by.forEach((os, id) => {
    os.sort((a, b) => a.day - b.day); const last = os[os.length - 1], age = maxDay - last.day;
    if (age > 180) lost++; else if (age > 90) risk++;
    if (age > 90) lapsed.push({ id, age, orders: os.length, revenue: os.reduce((s, o) => s + o.rev, 0), last: last.day });
    const before = os.filter((o) => o.day <= D0), after = os.filter((o) => o.day > D0);
    ordLast += after.length;
    if (before.length && D0 - before[before.length - 1].day > 90) { base++; if (after.length) { ret++; retRev += after.reduce((s, o) => s + o.rev, 0); retOrd += after.length; } }
  });
  lapsed.sort((a, b) => b.revenue - a.revenue || a.age - b.age || (a.id < b.id ? -1 : 1));
  const group = risk + lost, rate = ret / base, revPer = retRev / ret, ordPer = retOrd / ret;
  return { risk, lost, base, ret, rate, revPer, potCust: group * rate, potRev: group * rate * revPer, potOrd: group * rate * ordPer, ordPct: group * rate * ordPer / ordLast, lapsed, history: maxDay - minDay + 1 };
}
const near = (a, b, m) => assert.ok(Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(b)), `${m}: ${a} ≠ ${b}`);

/* 1) todos los canales */
let ex = expected(raw, null), re = E.analyze(L, {}).extras.reactivation;
assert.ok(ex.base >= 30 && ex.ret > 0, 'el caso debe tener base suficiente');
assert.strictEqual(re.risk, ex.risk); assert.strictEqual(re.lost, ex.lost); assert.strictEqual(re.group, ex.risk + ex.lost);
assert.strictEqual(re.base, ex.base); assert.strictEqual(re.returned, ex.ret);
near(re.rate, ex.rate, 'tasa'); near(re.revenuePerReturned, ex.revPer, 'venta por cliente reactivado');
near(re.potentialCustomers, ex.potCust, 'clientes potenciales'); near(re.potentialRevenue, ex.potRev, 'venta potencial');
near(re.potentialOrders, ex.potOrd, 'pedidos potenciales'); near(re.ordersPct, ex.ordPct, '% sobre pedidos de 180 días');
/* 2) top 10 = primeros 10 de la lista completa, y la lista completa trae a todos */
const list = E.lapsedList(L, {});
assert.strictEqual(list.rows.length, ex.lapsed.length);
list.rows.forEach((r, i) => { assert.strictEqual(r.id, ex.lapsed[i].id); assert.strictEqual(r.days, ex.lapsed[i].age); near(r.revenue, ex.lapsed[i].revenue, 'venta de ' + r.id); assert.strictEqual(r.orders, ex.lapsed[i].orders); });
assert.deepStrictEqual(re.top.map((r) => r.id), list.rows.slice(0, 10).map((r) => r.id));
/* 3) un canal: mismos cálculos con solo los pedidos de ese canal */
ex = expected(raw, 'app'); re = E.analyze(L, { channel: 'app' }).extras.reactivation;
assert.strictEqual(re.base, ex.base); assert.strictEqual(re.returned, ex.ret); near(re.potentialRevenue, ex.potRev, 'venta potencial del canal');
assert.strictEqual(E.lapsedList(L, { channel: 'app' }).rows.length, ex.lapsed.length);
/* 4) sin historia suficiente no se inventa la tasa */
const dr2 = E.draftLedger(['0']); raw.filter((o) => o.day <= START + 200).forEach((o) => dr2.add({ order: o.order, customer: o.cust, day: o.day, channel: o.channel, revenue: o.rev }));
const L2 = E.emptyLedger(); E.mergeInto(L2, dr2, { id: 'b2', fileName: 'y.csv' });
const re2 = E.analyze(L2, {}).extras.reactivation;
assert.strictEqual(re2.rate, null); assert.strictEqual(re2.potentialRevenue, null); assert.ok(re2.history < 361);
/* 5) base chica (< 30): sin tasa */
const dr3 = E.draftLedger(['0']); raw.filter((o) => ['c1', 'c2', 'c3', 'c4', 'c5'].includes(o.cust)).forEach((o) => dr3.add({ order: o.order, customer: o.cust, day: o.day, channel: o.channel, revenue: o.rev }));
dr3.add({ order: 'z', customer: 'c1', day: END, channel: 'app', revenue: 1 });
const L3 = E.emptyLedger(); E.mergeInto(L3, dr3, { id: 'b3', fileName: 'z.csv' });
assert.strictEqual(E.analyze(L3, {}).extras.reactivation.rate, null);
console.log('OK · reactivación: ' + [ex.base, ex.ret].join('/') + ' · lista de ' + list.rows.length + ' clientes');
