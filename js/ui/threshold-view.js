/**
 * threshold-view.js — Caja «Sugerencia de umbrales según tu historial» (Forecast y la sensibilidad de la presentación).
 * Solo presenta lo que calculó FP.thresholdAdvisor (guardado en state.th) y ofrece dos botones: recalcular y aplicar. Nunca aplica nada sola.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const esc = (v) => FP.ui.helpers.esc(v), pct = (v, d = 1) => `${(v * 100).toFixed(d)} %`;
  const LABEL = { okPct: 'En meta hasta', alertPct: 'Fuera de meta desde', belowPlanPct: 'Indicador «bajo el plan» desde', weakPct: 'Semana «más floja» desde', aboveFrom: 'Arriba del plan desde', onPlanFrom: 'En plan desde' };
  const KEYS = { operativo: ['belowPlanPct', 'weakPct'], gerencial: ['okPct', 'alertPct'], directivo: ['okPct', 'alertPct'] };

  /** Valores vigentes de la presentación (los de la persona o, si no hay, los de la configuración). */
  function currentRp(state, keys) {
    const T = state.rp.options.thresholds || {}, D = FP.config.reports, out = {};
    keys.forEach((k) => { out[k] = FP.reportPrefs && typeof T[k] === 'number' ? T[k] : (D.operativo[k] !== undefined ? D.operativo[k] : D.gerencial[k]); });
    return out;
  }
  function box(state, scope) {
    const th = state.th || {}, s = th.sug, fc = state.fc.settings && state.fc.settings.pacingThresholds ? state.fc.settings.pacingThresholds : FP.config.forecast.pacingThresholds;
    const head = `<p class="field__hint">Se calcula sola cada vez que llegan datos nuevos y una vez al día, con tu historial. <strong>Nunca se aplica sin que lo decidas.</strong></p>`;
    const btnRe = `<button type="button" class="btn btn--ghost" data-action="th-suggest">Sugerir umbrales con mi historial</button>`;
    if (!s) return `<div class="th-box" data-th="${scope}"><h4 class="th-box__h">Sugerencia según tu historial</h4>${head}<p class="field__hint">Todavía no hay datos de pacing para calcularla.</p>${btnRe}</div>`;
    if (s.status !== 'ready') return `<div class="th-box" data-th="${scope}"><h4 class="th-box__h">Sugerencia según tu historial</h4>${head}<p class="note note--warn" role="status">${esc(s.reason)} Mientras tanto rigen los valores provisionales.</p>${btnRe}</div>`;
    const when = th.on ? `Calculada el ${esc(th.on)}${s.cutoff ? ` con datos al ${esc(s.cutoff)}` : ''}.` : '';
    let rows, apply, dis;
    if (scope === 'fc') {
      const cur = { aboveFrom: fc.aboveFrom, onPlanFrom: fc.onPlanFrom }, sug = s.pacing;
      rows = ['aboveFrom', 'onPlanFrom'].map((k) => `<tr><th scope="row">${LABEL[k]}</th><td class="num">${pct(cur[k], 1)}</td><td class="num"><b>${pct(sug[k], 1)}</b></td></tr>`).join('');
      dis = ['aboveFrom', 'onPlanFrom'].every((k) => Math.abs(cur[k] - sug[k]) < 1e-9); apply = 'th-apply-fc';
    } else {
      const keys = KEYS[state.rp.audience] || [], cur = currentRp(state, keys), sug = s.presentation;
      rows = keys.map((k) => `<tr><th scope="row">${LABEL[k]}</th><td class="num">${pct(cur[k], 1)}</td><td class="num">${sug[k] === null ? '<span class="rp-na">No disponible</span>' : `<b>${pct(sug[k], 1)}</b>`}</td></tr>`).join('');
      dis = keys.every((k) => sug[k] === null || Math.abs(cur[k] - sug[k]) < 1e-9); apply = 'th-apply-rp';
    }
    return `<div class="th-box" data-th="${scope}"><h4 class="th-box__h">Sugerencia según tu historial</h4>${head}
      <p class="field__hint">${esc(s.evidence)} ${when}</p>
      <table class="ds-table th-box__t"><caption class="sr-only">Valores vigentes y sugeridos</caption><thead><tr><th scope="col">Umbral</th><th scope="col" class="num">Vigente</th><th scope="col" class="num">Sugerido</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="btn-row"><button type="button" class="btn btn--primary" data-action="${apply}" ${dis ? 'disabled title="Ya coincide con la sugerencia"' : ''}>Usar la sugerencia</button>${btnRe}</div></div>`;
  }
  FP.thresholdView = { box, KEYS };
})(typeof window !== 'undefined' ? window : globalThis);
