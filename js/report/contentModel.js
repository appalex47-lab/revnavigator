/**
 * contentModel.js — Modelo de contenido, hallazgos y contrato del reporte (Presentation Intelligence · Fase 1).
 *
 * FP.reportBuilder sigue siendo la ÚNICA fuente de cifras. Este módulo no calcula ni redacta nada nuevo: LEE las páginas ya armadas y las expone con
 * una forma estable para que las capas siguientes (perfiles, compositor, narrativa por audiencia, economía de oportunidades, editor) trabajen sobre
 * un mismo vocabulario:
 *
 *   describe(report)  → { blocks, findings, numbers }
 *     blocks    disponibilidad de cada bloque: { block, title, available, reason, certainty[], limitations }
 *     findings  hallazgos trazables: { id, block, kind: 'conclusion'|'indicator', text | label/value/valueKind, certainty, sources[], numbers[] }
 *     numbers   registro de todas las cifras del reporte: { path, value } (lo que una narrativa nueva puede citar)
 *   validate(report)  → { ok, violations[] }   contrato de integridad del reporte (ver RULES)
 *
 * Niveles de certeza (los mismos sellos que ya muestra el reporte): observado, calculado, estimado.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const SCHEMA = 'content_model', VERSION = '1.0.0';
  const CERT = { Observado: 'observado', Calculado: 'calculado', Estimado: 'estimado' };
  const RISK = ['observado', 'calculado', 'estimado'];                       // de menor a mayor incertidumbre
  /** Páginas que sintetizan a otras y por eso no declaran fuentes propias (sus cifras vienen de las páginas que citan). */
  const DERIVED = ['closing'];
  const BAD_TEXT = /\b(null|undefined|NaN|Infinity)\b/;
  const fin = (v) => typeof v === 'number' && Number.isFinite(v);
  const included = (report) => (report.pages || []).filter((p) => p.status === 'included');

  /** Certeza de una página: la MÁS incierta entre los sellos de sus indicadores (un titular que mezcla datos estimados no es «calculado»). */
  function certaintyOf(p) {
    const seen = new Set((p.kpis || []).map((k) => CERT[k.tag]).filter(Boolean));
    for (let i = RISK.length - 1; i >= 0; i--) if (seen.has(RISK[i])) return RISK[i];
    return null;
  }

  /** Disponibilidad de un bloque: por qué hay (o no) contenido y con qué certezas. */
  function availability(p) {
    if (p.status !== 'included') return { block: p.id, title: p.title, available: false, reason: p.reason || null, certainty: [], limitations: 0 };
    const cert = [...new Set((p.kpis || []).map((k) => CERT[k.tag]).filter(Boolean))].sort((a, b) => RISK.indexOf(a) - RISK.indexOf(b));
    const lim = FP.reportComposer ? FP.reportComposer.limitationsOf({ pages: [p] }).length : 0;
    return { block: p.id, title: p.title, available: true, reason: null, certainty: cert, limitations: lim };
  }

  /** Hallazgos: una conclusión por página (su titular) y un indicador por KPI. Nada se recalcula: se citan los valores del reporte. */
  function findings(report) {
    const out = [];
    included(report).forEach((p) => {
      const src = Array.isArray(p.sources) ? p.sources.slice() : [];
      if (p.id !== 'cover' && typeof p.headline === 'string' && p.headline.trim() && !BAD_TEXT.test(p.headline))
        out.push({ id: `${p.id}#headline`, block: p.id, kind: 'conclusion', text: p.headline, certainty: certaintyOf(p), sources: src, numbers: [] });
      (p.kpis || []).forEach((k) => out.push({
        id: `${p.id}#kpi:${k.id}`, block: p.id, kind: 'indicator', label: k.label, value: k.value === undefined ? null : k.value, valueKind: k.kind || null,
        certainty: CERT[k.tag] || null, sources: src, numbers: fin(k.value) ? [k.value] : []
      }));
    });
    return out;
  }

  /** Registro de cifras: todas las hojas numéricas de cada página incluida (misma regla que la comparación numérica editorial). */
  function numbersOf(report) {
    const out = [];
    const walk = (v, path) => {
      if (v === null || v === undefined) return;
      if (typeof v === 'number') { out.push({ path, value: v }); return; }
      if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${path}[${i}]`)); return; }
      if (typeof v === 'object') Object.keys(v).sort().forEach((k) => { if (k !== 'tags' && k !== 'generatedAt') walk(v[k], `${path}.${k}`); });
    };
    included(report).forEach((p) => walk(p, p.id));
    return out;
  }

  const describe = (report) => ({ schema: SCHEMA, version: VERSION, blocks: (report.pages || []).map(availability), findings: findings(report), numbers: numbersOf(report) });

  /**
   * Contrato de integridad. Cada regla es algo que el reporte actual YA cumple (salvo lo que se registre como hallazgo en las pruebas):
   *   estructura        toda página trae id, title y status 'included'|'omitted'; los ids no se repiten.
   *   omitida           una página omitida trae motivo y ningún contenido.
   *   incluida          una página incluida trae kpis, tables, charts, notes y sources como listas.
   *   fuentes           una página incluida declara sus fuentes (salvo las derivadas: ver DERIVED).
   *   sello             todo KPI con valor numérico lleva un sello Observado, Calculado o Estimado.
   *   valores           ningún número no finito ni texto con null, undefined, NaN o Infinity.
   * «Sin dato» es null (el reporte lo muestra como «No disponible»); nunca se acepta un cero en su lugar: eso lo garantiza quien arma la página.
   */
  function validate(report) {
    const bad = [], add = (rule, block, detail) => bad.push({ rule, block, detail });
    if (!report || !Array.isArray(report.pages)) return { ok: false, violations: [{ rule: 'estructura', block: null, detail: 'El reporte no trae páginas.' }] };
    const ids = new Set();
    const scan = (v, path, block) => {
      if (typeof v === 'string') { if (BAD_TEXT.test(v)) add('valores', block, `${path}: «${v.slice(0, 70)}»`); }
      else if (typeof v === 'number') { if (!Number.isFinite(v)) add('valores', block, `${path}: número no finito`); }
      else if (Array.isArray(v)) v.forEach((x, i) => scan(x, `${path}[${i}]`, block));
      else if (v && typeof v === 'object') Object.keys(v).forEach((k) => scan(v[k], `${path}.${k}`, block));
    };
    report.pages.forEach((p) => {
      if (!p || typeof p.id !== 'string' || typeof p.title !== 'string' || !['included', 'omitted'].includes(p.status)) { add('estructura', p && p.id, 'Falta id, title o status válido.'); return; }
      if (ids.has(p.id)) add('estructura', p.id, 'Página repetida.');
      ids.add(p.id);
      if (p.status === 'omitted') {
        if (!(typeof p.reason === 'string' && p.reason.trim())) add('omitida', p.id, 'Página omitida sin motivo.');
        ['kpis', 'tables', 'charts'].forEach((k) => { if (p[k] !== undefined) add('omitida', p.id, `Página omitida con contenido (${k}).`); });
        return;
      }
      ['kpis', 'tables', 'charts', 'notes', 'sources'].forEach((k) => { if (!Array.isArray(p[k])) add('incluida', p.id, `${k} no es una lista.`); });
      if (!DERIVED.includes(p.id) && !(Array.isArray(p.sources) && p.sources.length)) add('fuentes', p.id, 'Sin fuentes declaradas.');
      (p.kpis || []).forEach((k) => { if (fin(k.value) && !CERT[k.tag]) add('sello', p.id, `KPI «${k.id}» con valor numérico y sin sello.`); });
      scan(p, p.id, p.id);
    });
    return { ok: bad.length === 0, violations: bad };
  }

  FP.reportContent = { SCHEMA, VERSION, CERTAINTY: CERT, DERIVED, certaintyOf, availability, findings, numbersOf, describe, validate };
})(typeof window !== 'undefined' ? window : globalThis);
