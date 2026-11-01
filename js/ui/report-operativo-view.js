/**
 * report-operativo-view.js — Dibujo de las láminas del formato Operativo (Presentation Intelligence · Fase 3).
 *
 * Solo presenta lo que ya construyó FP.reportOperativo (cifras, titulares y notas); no calcula nada. Registra en FP.reportView el cuerpo de cada
 * bloque nuevo y el gráfico de barras agrupadas (real contra plan). Los colores salen de css/report.css (clases rp-gb__*), no de este archivo.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const esc = (v) => FP.ui.helpers.esc(v);
  const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
  const f = (k, v) => FP.reportBuilder.fmt(k, v);
  const NA = '<td class="num rp-na">No disponible</td><td class="num rp-na">—</td>';
  const cls = (g) => (!isNum(g) || g === 0 ? '' : g > 0 ? 'rp-pos' : 'rp-neg');
  const arrow = (g) => (!isNum(g) || g === 0 ? '' : g > 0 ? '▲ ' : '▼ ');
  const tag = (t, c) => `<span class="rp-tag rp-tag--${c}">${esc(t)}</span>`;
  const callout = (t) => `<div class="rp-callout rp-callout--info">${t}</div>`;

  /** Real y variación contra el plan de una celda: la conversión varía en puntos porcentuales; lo demás, en %. */
  function pair(m, c, real) {
    if (!c || !isNum(c.actual)) return NA;
    const d = m.id === 'conversionRate' ? c.gap : c.gapPct, txt = m.id === 'conversionRate' ? FP.reportOperativo.pp2(c.gap) : f('spct', c.gapPct);
    return `<td class="num">${esc(f(m.fmt, c.actual))}</td>${isNum(d) && txt ? `<td class="num ${cls(d)}">${arrow(d)}${esc(txt)}</td>` : '<td class="num rp-na">—</td>'}`;
  }

  function channelBody(p) {
    const O = FP.reportOperativo, M = O.METRICS;
    const row = (r, tot) => `<tr${tot ? ' class="rp-total"' : ''}><th scope="row">${esc(r.label)}</th>${M.map((m) => pair(m, r.cells[m.id])).join('')}</tr>`;
    return `<div class="rp-op"><table class="rp-t rp-op__t"><caption class="sr-only">Pacing por canal contra el plan</caption><thead><tr><th rowspan="2" scope="col">Canal</th>${M.map((m) => `<th colspan="2" scope="colgroup">${esc(m.label)}</th>`).join('')}</tr>
      <tr>${M.map(() => '<th scope="col" class="num">Real</th><th scope="col" class="num">vs plan</th>').join('')}</tr></thead>
      <tbody>${p.rows.map((r) => row(r)).join('')}${p.total ? row(p.total, true) : ''}</tbody></table>
      <div class="rp-op__two">${p.review.length ? callout(`<strong>Qué revisar.</strong> ${p.review.map(esc).join(' ')}`) : '<div></div>'}<div>${p.notes.map((n) => `<p class="rp-small">${esc(n)}</p>`).join('')}</div></div></div>`;
  }

  /** Barras agrupadas: venta real contra el plan de los mismos días (el plan va punteado; en rojo, el real que queda ≥ umbral bajo el plan). */
  function chartGroupBars(c) {
    const items = (c.items || []).filter((i) => isNum(i.actual) || isNum(i.plan));
    if (!items.length) return '<p class="rp-empty">Sin datos para graficar</p>';
    const W = 520, H = 280, base = H - 40, top = 44, mx = Math.max(...items.flatMap((i) => [i.actual, i.plan].filter(isNum))) * 1.12 || 1;
    const gap = (W - 40) / items.length, bw = Math.min(34, gap / 2.6), hOf = (v) => (isNum(v) ? (v / mx) * (base - top) : 0);
    let g = `<line class="rp-gb__ax" x1="30" x2="${W - 8}" y1="${base}" y2="${base}"/>`;
    items.forEach((it, i) => {
      const x = 30 + i * gap + gap / 2 - bw - 3, h1 = hOf(it.actual), h2 = hOf(it.plan);
      if (isNum(it.actual)) g += `<rect class="rp-gb__r${it.bad ? ' rp-gb__bad' : ''}" x="${x.toFixed(1)}" y="${(base - h1).toFixed(1)}" width="${bw}" height="${h1.toFixed(1)}" rx="3"/><text class="rp-gb__t rp-gb__v" x="${(x + bw / 2).toFixed(1)}" y="${(base - h1 - 6).toFixed(1)}" text-anchor="middle">${esc(f('moneyC', it.actual))}</text>`;
      if (isNum(it.plan)) g += `<rect class="rp-gb__p" x="${(x + bw + 6).toFixed(1)}" y="${(base - h2).toFixed(1)}" width="${bw}" height="${h2.toFixed(1)}" rx="3"/>`;
      g += `<text class="rp-gb__t" x="${(x + bw + 3).toFixed(1)}" y="${base + 20}" text-anchor="middle">${esc(it.label)}${it.partial ? '*' : ''}</text>`;
    });
    g += `<g class="rp-gb__lg"><rect class="rp-gb__r" x="30" y="6" width="14" height="14" rx="2"/><text class="rp-gb__t" x="50" y="18">Real</text><rect class="rp-gb__p" x="100" y="6" width="14" height="14" rx="2"/><text class="rp-gb__t" x="120" y="18">Plan de los mismos días</text><rect class="rp-gb__r rp-gb__bad" x="300" y="6" width="14" height="14" rx="2"/><text class="rp-gb__t" x="320" y="18">Bajo el plan</text></g>`;
    return `<svg class="rp-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(c.title || '')}" font-family="inherit">${g}</svg>`;
  }

  function evolutionBody(p) {
    const head = p.unit === 'week' ? 'Semana' : p.unit === 'month' ? 'Mes' : 'Día';
    const body = p.rows.map((r) => {
      const dr = r.revenue.deltaPct, dp = r.orders.deltaPct;
      return `<tr><th scope="row">${esc(r.label)}${r.partial ? '*' : ''}</th><td class="num">${r.days}</td><td class="num">${esc(f('moneyC', r.revenue.actual))}</td><td class="num ${cls(dr)}">${isNum(dr) ? arrow(dr) + esc(f('spct', dr)) : '—'}</td>
        <td class="num">${esc(f('int', r.orders.actual))}</td><td class="num ${cls(dp)}">${isNum(dp) ? arrow(dp) + esc(f('spct', dp)) : '—'}</td><td class="num">${isNum(r.aov) ? esc(f('money', r.aov)) : '<span class="rp-na">No disponible</span>'}</td></tr>`;
    }).join('');
    return `<div class="rp-op"><div class="rp-row"><div class="rp-col-a"><figure class="rp-fig"><figcaption>${esc(p.charts[0].title)}</figcaption>${chartGroupBars(p.charts[0])}</figure></div>
      <div class="rp-col-b"><table class="rp-t rp-op__t"><caption class="sr-only">Venta y pedidos por ${esc(head.toLowerCase())}</caption><thead><tr><th scope="col">${head}</th><th scope="col" class="num">Días</th><th scope="col" class="num">Venta</th><th scope="col" class="num">vs plan</th><th scope="col" class="num">Pedidos</th><th scope="col" class="num">vs plan</th><th scope="col" class="num">Ticket</th></tr></thead><tbody>${body}</tbody></table></div></div>
      <div class="rp-op__two">${callout(`<strong>Qué revisar.</strong> ${esc(p.review)}`)}<div>${p.notes.map((n) => `<p class="rp-small">${esc(n)}</p>`).join('')}</div></div></div>`;
  }

  function actionsBody(p) {
    const D = (iso) => (iso ? f('date', iso) : '—');
    const body = p.rows.map((r) => {
      const prio = r.priority ? Object.entries({ 'impacto simulado': r.priority.impact, exposición: r.priority.exposure, urgencia: r.priority.urgency, evidencia: r.priority.evidence }).filter(([, v]) => v && v !== 'n/d').map(([k, v]) => `${k} ${v}`).join(' · ') : '';
      const sub = [r.measurement ? `Medición: ${r.measurement.metric}${isNum(r.measurement.windowDays) ? `, ventana de ${r.measurement.windowDays} días` : ''}` : null, prio ? `Prioridad (descriptiva): ${prio}` : null].filter(Boolean);
      return `<tr><th scope="row">${esc(r.id)}</th><td><strong>${esc(r.title)}</strong>${sub.map((s) => `<span class="rp-op__sub">${esc(s)}</span>`).join('')}</td><td>${esc(r.channel)}</td>
        <td>${r.owner ? esc(r.owner) : '<span class="rp-na">Por asignar</span>'}</td><td>${esc(D(r.start))} → ${esc(D(r.end))}</td><td>${esc(r.status)}</td>
        <td class="num">${r.impact ? `${esc(f('smoneyC', r.impact.value))} ${tag('Estimado', 'est')}` : '<span class="rp-na">Sin escenario</span>'}</td></tr>`;
    }).join('');
    return `<div class="rp-op"><table class="rp-t rp-op__t rp-op__t--big"><caption class="sr-only">Acciones registradas</caption><thead><tr><th scope="col">ID</th><th scope="col">Acción</th><th scope="col">Canal</th><th scope="col">Responsable</th><th scope="col">Ventana</th><th scope="col">Estado</th><th scope="col" class="num">Impacto simulado</th></tr></thead><tbody>${body}</tbody></table>
      <div class="rp-op__notes">${p.notes.map((n) => `<p class="rp-small">${esc(n)}</p>`).join('')}</div></div>`;
  }

  FP.reportView.charts.groupbars = chartGroupBars;
  const title = (p) => p.conclusion || null;
  FP.reportView.register('channelPacing', { section: 'Pacing por canal', body: channelBody, title, noHeadline: true });
  FP.reportView.register('evolution', { section: 'Evolución de venta y pedidos', body: evolutionBody, title, noHeadline: true });
  FP.reportView.register('actions', { section: 'Acciones y responsables', body: actionsBody, title, noHeadline: true });
})(typeof window !== 'undefined' ? window : globalThis);
