/**
 * catalog.js — Catálogo de audiencias y tipos de presentación (Presentation Intelligence · Fase 2).
 *
 * Declara lo que la persona puede ELEGIR (audiencia → tipo → profundidad) y a qué perfil (FP.reportProfiles) corresponde cada combinación.
 * No contiene lógica de negocio ni cifras: solo qué existe, qué está habilitado y por qué no lo está.
 *
 * Una opción está habilitada únicamente si existe un perfil habilitado que la sirve; el catálogo NO tiene su propia bandera. Así, habilitar un formato
 * nuevo es registrar su perfil, y nada se ofrece antes de poder generar una presentación coherente.
 *   - audiencia: el perfil la declara en `audience` (null = «Reporte actual», la presentación que la herramienta genera hoy).
 *   - tipo: el perfil lo declara en `presentationTypes`.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const CURRENT = 'actual';

  const AUDIENCES = [
    { id: CURRENT, label: 'Reporte actual', who: 'Sin audiencia definida', description: 'El reporte ejecutivo que la herramienta genera hoy: resultado, brecha, forecast y qué decidir.' },
    { id: 'operativo', label: 'Operativo', who: 'Analistas y coordinadores', description: 'Entender el desempeño, encontrar desviaciones, identificar oportunidades y definir acciones concretas.' },
    { id: 'gerencial', label: 'Gerencial', who: 'Gerentes de Ecommerce, Growth y Canales Digitales', description: 'Entender el estado del negocio, explicar las desviaciones, evaluar el cumplimiento y dirigir las iniciativas.' },
    { id: 'directivo', label: 'Directivo', who: 'Directores de Ecommerce, Marketing Digital y Canales Digitales', description: 'Estado del negocio digital, potencial de crecimiento, riesgos y decisiones estratégicas.' }
  ];
  const TYPES = [
    { id: 'desempeno', label: 'Desempeño comercial', description: 'Resultado contra el plan, brecha, forecast, qué mirar y qué decidir.' },
    { id: 'diagnostico', label: 'Diagnóstico y oportunidades', description: 'Qué explica las desviaciones y dónde hay oportunidades de recuperación.' },
    { id: 'bpr', label: 'Business Performance Review', description: 'Revisión periódica del negocio: resultados, motores, riesgos y compromisos.' },
    { id: 'crecimiento', label: 'Plan de crecimiento', description: 'Oportunidades cuantificadas, iniciativas prioritarias y su impacto esperado.' },
    { id: 'dbr', label: 'Digital Business Review', description: 'Estado del negocio digital, su evolución y sus escenarios.' },
    { id: 'planeacion', label: 'Planeación estratégica', description: 'Escenarios, riesgos, hoja de ruta y decisiones de la dirección.' }
  ];
  const NOT_YET = 'Todavía no está disponible: se habilita cuando pueda generar una presentación completa con los datos de la herramienta.';

  const aud = (p) => (p.audience === null || p.audience === undefined ? CURRENT : p.audience);
  const profiles = () => (FP.reportProfiles ? FP.reportProfiles.list() : []);   // solo habilitados

  /** Perfil habilitado que sirve esa audiencia y tipo (null si no existe). */
  const resolve = (audience, type) => profiles().find((p) => aud(p) === audience && (p.presentationTypes || []).includes(type)) || null;
  const audiences = () => AUDIENCES.map((a) => ({ ...a, enabled: profiles().some((p) => aud(p) === a.id), reason: profiles().some((p) => aud(p) === a.id) ? null : NOT_YET }));
  /** Tipos para una audiencia, habilitados o no (los no habilitados se muestran con su motivo, nunca se pueden elegir). */
  const types = (audience) => TYPES.map((t) => { const on = Boolean(resolve(audience, t.id)); return { ...t, enabled: on, reason: on ? null : NOT_YET }; });
  const depths = (profile) => (profile && profile.depths ? profile.depths.map((d) => ({ ...d, default: d.id === profile.defaultDepth })) : []);
  /** Elección inicial: la primera audiencia habilitada, con su primer tipo habilitado y la profundidad por defecto de su perfil. */
  function defaults() {
    for (const a of audiences()) {
      if (!a.enabled) continue;
      const t = types(a.id).find((x) => x.enabled), prof = t && resolve(a.id, t.id);
      if (prof) return { audience: a.id, type: t.id, depth: prof.defaultDepth || null, profile: prof.id };
    }
    return null;
  }

  FP.reportCatalog = { CURRENT, NOT_YET, AUDIENCES, TYPES, resolve, audiences, types, depths, defaults };
})(typeof window !== 'undefined' ? window : globalThis);
