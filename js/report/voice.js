/**
 * voice.js — «Voz» de cada formato: titulares de las láminas reutilizadas escritos para su audiencia (Presentation Intelligence · endurecimiento).
 *
 * El reporte actual escribe un solo titular por lámina. Aquí cada formato puede decir lo mismo a su manera (Gerencial: estado contra la meta y canales en meta;
 * Directivo: una frase corta). Son PLANTILLAS deterministas sobre campos que la página ya trae (kpis, filas de factores, quién suma y resta, conteos del semáforo):
 * no calculan nada, no inventan cifras ni explican causas, y si falta un campo la lámina conserva el titular del reporte actual (nunca queda vacía).
 *
 * Contra el riesgo de «caer al titular actual sin avisar»: cada regla declara qué necesita (`needs`) y FP.reportVoice.audit() lista, por formato, qué titulares salieron
 * con la voz del formato y cuáles no (y qué campo faltó). El anexo «Reglas y umbrales» lo muestra y una prueba falla si una regla no produce titular teniendo sus campos.
 * Solo cubre los formatos Gerencial y Directivo y las láminas Resumen, Pacing, Factores y Quién suma y resta.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
  const fmt = (k, v) => FP.reportBuilder.fmt(k, v);
  const pageOf = (report, id) => ((report && report.pages) || []).find((p) => p.id === id && p.status === 'included') || null;
  const kpi = (p, id) => { const k = p && (p.kpis || []).find((x) => x.id === id); return k && isNum(k.value) ? k.value : null; };
  const money = (v) => fmt('moneyC', Math.abs(v));

  /** Hechos de pacing: cumplimiento y brecha (compliance − 1), solo si la página trae la forma anual (real, plan y cumplimiento). */
  function pacingFacts(report) {
    const p = pageOf(report, 'pacing'), c = kpi(p, 'compliance'), real = kpi(p, 'real'), plan = kpi(p, 'plan');
    if (!p) return { missing: 'la página de pacing' };
    if (!isNum(c) || !isNum(real) || !isNum(plan)) return { missing: 'venta real, plan y cumplimiento del pacing' };
    return { compliance: c, gapPct: c - 1, real, plan };
  }
  /** Canal que más resta y el que más suma (de «Quién suma y resta»; solo filas de tipo Canal). */
  function moversFacts(report) {
    const p = pageOf(report, 'movers');
    if (!p) return { missing: 'la página «Qué resta y qué suma»' };
    const ch = (a) => (Array.isArray(a) ? a.filter((x) => x && x.type === 'Canal' && isNum(x.value) && typeof x.name === 'string' && x.name) : []);
    const minus = ch(p.minus).filter((x) => x.value < 0).sort((a, b) => a.value - b.value)[0] || null, plus = ch(p.plus).filter((x) => x.value > 0).sort((a, b) => b.value - a.value)[0] || null;
    return { minus, plus };
  }
  /** «4 de 4 canales en meta» solo si el semáforo del formato está en la presentación. */
  function inGoal(report) {
    const p = pageOf(report, 'channelScorecard'); if (!p || !p.counts) return null;
    const n = (p.counts.ok || 0) + (p.counts.watch || 0) + (p.counts.alert || 0);
    return n > 0 ? `${p.counts.ok} de ${n} ${n === 1 ? 'canal' : 'canales'} en meta` : null;
  }
  const standingDir = (g) => (Math.abs(g) < 0.005 ? `Vamos a la par del plan (${fmt('spct', g)})` : `Vamos ${fmt('pct', Math.abs(g))} ${g < 0 ? 'por debajo' : 'por encima'} del plan a la fecha`);

  /** Reglas: needs(report) → texto de lo que falta o null; text(p, report) → titular. Una regla por (formato, lámina). */
  const RULES = {
    gerencial: {
      summary: { needs: (r) => pacingFacts(r).missing || null, text: (p, r) => { const f = pacingFacts(r), m = moversFacts(r); return `A la fecha vamos al ${fmt('pct', f.compliance)} del plan${m.minus ? `; ${m.minus.name} es el canal que más resta (${money(m.minus.value)})` : ''}`; } },
      pacing: { needs: (r) => pacingFacts(r).missing || null, text: (p, r) => { const f = pacingFacts(r), g = inGoal(r); return `Vamos al ${fmt('pct', f.compliance)} del plan a la fecha${g ? `: ${g}` : ` (${money(f.real)} de ${money(f.plan)})`}`; } },
      drivers: { needs: (r) => { const p = pageOf(r, 'drivers'), t = p && (p.tables || []).find((x) => x.id === 'drivers'); return !t || !(t.rows || []).some((x) => isNum(x.contribution)) || !isNum(kpi(p, 'gap')) ? 'la brecha y los factores del diagnóstico' : null; },
        text: (p, r) => { const t = (p.tables || []).find((x) => x.id === 'drivers'), top = t.rows.filter((x) => isNum(x.contribution) && x.driver).sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))[0]; return `La brecha es de ${fmt('smoneyC', kpi(p, 'gap'))}; el factor que más pesa es ${String(top.driver).toLowerCase()} (${fmt('smoneyC', top.contribution)})`; } },
      movers: { needs: (r) => { const m = moversFacts(r); return m.missing || (m.minus || m.plus ? null : 'canales que sumen o resten'); },
        text: (p, r) => { const m = moversFacts(r); return m.minus && m.plus ? `${m.minus.name} resta ${money(m.minus.value)} y ${m.plus.name} suma ${money(m.plus.value)}` : m.minus ? `${m.minus.name} resta ${money(m.minus.value)} y ningún canal suma sobre el plan` : `${m.plus.name} suma ${money(m.plus.value)} y ningún canal resta contra el plan`; } }
    },
    directivo: {
      pacing: { needs: (r) => pacingFacts(r).missing || null, text: (p, r) => standingDir(pacingFacts(r).gapPct) },
      movers: { needs: (r) => { const m = moversFacts(r); return m.missing || (m.minus || m.plus ? null : 'canales que sumen o resten'); },
        text: (p, r) => { const m = moversFacts(r); return [m.minus ? `${m.minus.name} resta ${money(m.minus.value)}` : null, m.plus ? `${m.plus.name} suma ${money(m.plus.value)}` : null].filter(Boolean).join('; '); } }
    }
  };
  const BAD = /undefined|NaN|null|\[object|Infinity/;

  /** Titular con la voz del formato, o null (la vista usa entonces el titular del reporte actual). Nunca lanza. */
  function title(profileId, p, report) {
    try {
      const rule = RULES[profileId] && RULES[profileId][p && p.id]; if (!rule || !report || rule.needs(report)) return null;
      const s = rule.text(p, report);
      return typeof s === 'string' && s.trim() && !BAD.test(s) ? s : null;
    } catch (e) { return null; }
  }
  /** Por formato y lámina incluida: { id, title, source: 'voz'|'actual', missing } — lo que se muestra en el anexo de reglas. */
  function audit(profileId, report) {
    const rules = RULES[profileId]; if (!rules) return [];
    return Object.keys(rules).map((id) => {
      const p = pageOf(report, id); if (!p) return null;
      const miss = rules[id].needs(report), t = miss ? null : title(profileId, p, report);
      return { id, title: p.title, source: t ? 'voz' : 'actual', missing: t ? null : (miss || 'una plantilla que no pudo armar el titular') };
    }).filter(Boolean);
  }
  FP.reportVoice = { RULES, title, audit, pageOf };
})(typeof window !== 'undefined' ? window : globalThis);
