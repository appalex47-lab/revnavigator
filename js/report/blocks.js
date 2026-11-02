/**
 * blocks.js — Registro de constructores de bloques adicionales (Presentation Intelligence · Fase 3).
 *
 * FP.reportBuilder arma las páginas del reporte actual y NO se modifica. Los perfiles nuevos pueden pedir bloques que ese reporte no tiene
 * (p. ej. el formato Operativo: pacing por canal, evolución, acciones). Cada bloque nuevo registra aquí un constructor
 *   builder(src, report, profile) → página { id, title, status: 'included'|'omitted', ... }     (mismo contrato de página que reportBuilder)
 * y FP.reportBlocks.extend() lo agrega al reporte SOLO si el perfil elegido lo declara en sus slots y el reporte todavía no lo trae.
 *
 * Con el perfil LEGACY no hay bloques por agregar, así que extend() devuelve el mismo reporte, sin tocarlo: el reporte actual no cambia.
 * Las páginas agregadas se insertan antes del anexo y quedan reflejadas en la numeración, en `included`, `omitted`, `total` y en la lista de
 * páginas omitidas del Anexo A (para que una lámina sin datos también explique su motivo ahí).
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const REG = new Map();

  /** Registra el constructor de un bloque. Un id repetido lanza (nada se sobrescribe en silencio). */
  function register(id, builder) {
    if (typeof id !== 'string' || !id) throw new Error('El bloque necesita un id.');
    if (typeof builder !== 'function') throw new Error(`El constructor del bloque «${id}» debe ser una función.`);
    if (REG.has(id)) throw new Error(`Ya existe un constructor para el bloque «${id}».`);
    REG.set(id, builder);
  }
  const has = (id) => REG.has(id);
  const list = () => [...REG.keys()];

  /** Agrega al reporte las páginas que el perfil pide y el reporte no trae. Modifica y devuelve el mismo reporte (recién armado). */
  function extend(report, src, profile) {
    if (!report || !Array.isArray(report.pages)) throw new Error('El reporte no trae páginas.');
    if (!profile || !Array.isArray(profile.slots)) return report;
    const have = new Set(report.pages.map((p) => p.id)), added = [];
    profile.slots.forEach((s) => {
      if (have.has(s.block) || !REG.has(s.block)) return;
      const pg = REG.get(s.block)(src, report, profile);
      if (!pg || pg.id !== s.block || !['included', 'omitted'].includes(pg.status)) throw new Error(`El constructor del bloque «${s.block}» no devolvió una página válida.`);
      added.push(pg); have.add(s.block);
    });
    if (!added.length) return report;
    const pages = report.pages.slice(), at = pages.findIndex((p) => p.id === 'annex');
    pages.splice(at < 0 ? pages.length : at, 0, ...added);
    // Las páginas con `needs` (p. ej. el anexo de ediciones) dependen de lo que la persona edite después de generar: no cuentan en el total ni en la numeración del reporte; el compositor decide si entran.
    const included = pages.filter((p) => p.status === 'included' && !p.needs);
    included.forEach((p, i) => { p.number = i + 1; });
    report.pages = pages;
    report.included = included.map((p) => p.id);
    report.omitted = pages.filter((p) => p.status === 'omitted').map((p) => ({ id: p.id, title: p.title, reason: p.reason }));
    report.total = included.length;
    report.profile = profile.id;
    const annex = pages.find((p) => p.id === 'annex' && p.status === 'included');
    if (annex && Array.isArray(annex.omitted)) added.filter((p) => p.status === 'omitted').forEach((p) => annex.omitted.push({ title: p.title, reason: p.reason }));
    return report;
  }

  FP.reportBlocks = { register, has, list, extend };
})(typeof window !== 'undefined' ? window : globalThis);
