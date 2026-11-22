/* Command Center · Fase 3 (ronda de calidad) — ESCENARIOS COMERCIALES CRÍTICOS, como especificación ejecutable.
 * Cada escenario fija: DATOS de entrada (simulados) · lo que Z1 INTERPRETA · CONFIABILIDAD · MENSAJE · Z3/Z4 derivados · AFIRMACIONES QUE SE EVITAN (comprobadas) · y,
 * cuando hay una definición de negocio abierta, la DECISIÓN PENDIENTE (no se inventa ninguna regla). No cambia ningún cálculo ni regla comercial: solo ejercita las existentes.
 * Datos SIMULADOS (nada de FESA). Lo consume tools/test-fase3-escenarios-comerciales.js y lo emite tools/audit/escenarios-comerciales-generar.js */
const Z1 = require('./z1-lectura-ejecutiva.js'), Z3 = require('./z3-atencion.js'), Z4 = require('./z4-acciones.js'), S1 = require('./z1-escenarios.js'), CO = require('./coherencia-zonas.js');
const h = S1.helpers, M = S1.MARGIN;
const rev = (plan, actual) => h.rev(plan, actual);
const OK = (extra = {}) => h.base({ revenue: rev(10000000, 9300000), activity: h.ACT(480000, 9000, 9300000), forecast: h.fc(15000000, 14100000), comparable: h.COMP('ok', -0.03, -290000, 9590000), reliability: h.REL(), margin: M, ...extra });

function pipeline(i) {
  const o1 = Z1.build(i), findings = CO.findingsFromZ1(i, o1);
  const missing = findings.filter((f) => /^data_/.test(f.rule.family) && (f.severity === 'critica' || f.rule.family === 'data_errores')).map((f) => ({ label: f.title, view: 'datos' }));
  const o3 = Z3.build({ findings, reliability: { level: o1.reliability.level }, missing }), actions = CO.actionsFromZ3(o3), o4 = Z4.build({ attention: o3, actions });
  return { o1, findings, o3, actions, o4, viol: CO.check(o1, o3, o4) };
}
const texts = (x) => [x.o1.verdict && x.o1.verdict.text, (x.o1.narrative && x.o1.narrative.short) || '', ...Object.values((x.o1.narrative && x.o1.narrative.long) || {}).map(String), ...x.o3.cards.map((c) => c.title + ' ' + (c.description || '')), ...x.o4.cards.map((c) => c.label)].filter(Boolean).join(' · ');
const noZero = (x) => !/\$\s?0(?![\d.,])|(?<![\d.])0\s?%|cero ventas|sin ventas/i.test(x.o1.verdict.text);

/* id · familia pedida · datos (texto) · input Z1 · aserciones [descripción, fn(x)] · afirmaciones evitadas · decisión pendiente (o null) */
const ESC = [
  { id: 'E01', familia: 'ventas > 0 y pedidos = 0', datos: 'Venta real a la fecha $2.4 M; pedidos = 0 (conversión 0).', i: OK({ activity: h.ACT(480000, 0, 2400000), revenue: rev(10000000, 2400000) }),
    interpreta: 'Dato incoherente (hay venta sin pedidos): no se concluye sobre conversión ni ticket; la venta se muestra tal cual.', evita: ['“la conversión es 0 %”', '“el ticket es indefinido/infinito”', 'una causa'],
    pend: null, ok: [['no hay conversión 0 % como conclusión', (x) => !/conversi[oó]n[^.]{0,25}(?<![\d.])0\s?%/i.test(texts(x))], ['la capa de datos lo señala o la confiabilidad no es Alta sin explicación', (x) => x.o1.reliability.level !== 'Alta' || x.o1.data.issues.length > 0 || x.o3.cards.some((c) => c.isData)]] },
  { id: 'E02', familia: 'pedidos > 0 y ventas = 0', datos: 'Pedidos 6,200; venta real a la fecha $0.', i: OK({ activity: h.ACT(480000, 6200, 0), revenue: rev(10000000, 0) }),
    interpreta: 'Venta real 0 con pedidos: inconsistente; no se afirma “sin ventas” como hecho comercial sin verificar.', evita: ['“no hubo ventas”', 'una brecha del 100 % como hecho'],
    pend: null, ok: [['Z1 no emite el veredicto de brecha como definitivo', (x) => x.o1.reliability.level !== 'Alta' || x.o1.verdict.kind !== 'riesgo_cumplimiento'], ['sin contradicción entre capas', (x) => x.viol.length === 0]] },
  { id: 'E03', familia: 'sesiones = 0', datos: 'Sesiones 0 (verificado) con pedidos 5,800 y venta $9.3 M.', i: OK({ activity: h.ACT(0, 5800, 9300000) }),
    interpreta: 'Sesiones 0 con pedidos es incoherente: no se calcula conversión (÷0).', evita: ['conversión infinita', '“el tráfico cayó a cero”'],
    pend: null, ok: [['sin conversión calculada ni afirmada', (x) => !/conversi[oó]n (es|de|del|fue|se ubic[oó] en)\s+[\d.]+\s?%/i.test(texts(x))], ['sin contradicción entre capas', (x) => x.viol.length === 0]] },
  { id: 'E04', familia: 'sesiones faltantes', datos: 'Sesiones sin dato (null); pedidos y venta presentes.', i: OK({ activity: { sessions: null, orders: 9000, revenue: 9300000 } }),
    interpreta: 'Falta el dato de sesiones: el embudo no se evalúa; se pide el dato. Faltante ≠ 0.', evita: ['“0 sesiones”', 'conversión'], pend: null,
    ok: [['no se presenta 0 sesiones', (x) => !/\b0 sesiones/i.test(texts(x))], ['existe un elemento de datos que pide completar', (x) => x.o3.cards.some((c) => c.isData) || x.o1.reliability.level !== 'Alta']] },
  { id: 'E05', familia: 'conversiones no verificables', datos: 'Conversión verificada como no verificable (comparabilidad con cambio de definición).', i: OK({ comparable: h.COMP('cambio_de_composicion', 0.1, 1e5, 9e6) }),
    interpreta: 'El periodo de comparación cambió de composición: el cambio vs periodo anterior no se afirma.', evita: ['“creció X % vs el periodo anterior”'], pend: null,
    ok: [['no afirma crecimiento comparable', (x) => !/creci[oó] .*%/i.test(x.o1.verdict.text)], ['sin contradicción entre capas', (x) => x.viol.length === 0]] },
  { id: 'E06', familia: 'CR / AOV no disponible', datos: 'Sin actividad (sesiones, pedidos) en el periodo: no hay CR ni ticket.', i: OK({ activity: undefined }),
    interpreta: 'Sin dato de actividad: no se evalúa conversión ni ticket; la venta vs plan sí.', evita: ['CR 0 %', 'ticket 0'], pend: null,
    ok: [['Z3 lo dice (actividad no disponible)', (x) => x.o3.cards.some((c) => /actividad|conversion_no_verificable/.test(c.id))], ['no hay números de CR/ticket inventados', (x) => !/ticket[^.]{0,25}\$\s?0(?![\d.,])/i.test(texts(x))]] },
  { id: 'E07', familia: 'datos incompletos', datos: 'Cobertura 40 % de los días comparados; apoyo bajo.', i: OK({ reliability: h.REL({ support: 'bajo', coverage: 0.4 }) }),
    interpreta: 'Cobertura insuficiente: la lectura es preliminar y baja de confiabilidad.', evita: ['presentar la brecha como definitiva', 'proyectar el cierre sin salvedad'], pend: 'Umbral mínimo de cobertura para «Alta/Media/Baja» (hoy: regla vigente de Z1; no se cambia).',
    ok: [['confiabilidad no es Alta', (x) => x.o1.reliability.level !== 'Alta'], ['sin contradicción entre capas', (x) => x.viol.length === 0]] },
  { id: 'E08', familia: 'diferencias entre fuentes', datos: 'Dos fuentes difieren: la suma por canal no coincide con el total.', i: OK({ reliability: h.REL({ warnings: ['La suma por canal no coincide con el total (diferencia 3.2 %).'], dataErrors: false }) }),
    interpreta: 'Dato inconsistente ≠ inválido: se declara la diferencia y se pide conciliar; no se aplica una tolerancia inventada (conciliación pendiente).', evita: ['elegir una fuente como “la verdadera”', 'una tolerancia del 1 %'],
    pend: 'Regla de conciliación entre fuentes: qué fuente manda y qué tolerancia es aceptable (C2 de 3.2: abierta).', ok: [['no declara una fuente ganadora', (x) => !/fuente correcta|la fuente verdadera/i.test(texts(x))], ['sin contradicción entre capas', (x) => x.viol.length === 0]] },
  { id: 'E09', familia: 'actividad sin productor', datos: 'Hay pedidos/venta pero ningún canal/productor los explica (sin desglose).', i: OK({ concentration: false }),
    interpreta: 'Sin desglose no se atribuye nada a un canal ni productor; Z3 no inventa una causa.', evita: ['“el canal X explica la brecha”'], pend: null,
    ok: [['no hay hallazgo de canal cuando no hay base para atribuirlo', (x) => x.o3.cards.filter((c) => c.family === 'pacing_channel').length === 0 || x.o1.reliability.level !== 'Insuficiente'], ['sin contradicción entre capas', (x) => x.viol.length === 0]] },
  { id: 'E10', familia: 'ausencia de actividad (cero verificado)', datos: 'Sesiones 0, pedidos 0, venta 0 verificados en el periodo.', i: OK({ activity: h.ACT(0, 0, 0), revenue: rev(10000000, 0) }),
    interpreta: 'Cero verificado: es un hecho (sin actividad), distinto de «sin dato».', evita: ['confundirlo con “sin dato”', 'recomendar acciones comerciales de optimización'], pend: 'Umbral mínimo de actividad para considerar que hay base de comparación (hoy: solo cero/no cero).',
    ok: [['Z1 declara sin actividad verificada o lectura limitada', (x) => x.o1.reliability.causes.includes('sin_actividad') || x.o1.reliability.level === 'Insuficiente'], ['sin contradicción entre capas', (x) => x.viol.length === 0]] },
  { id: 'E11', familia: 'margen no configurado', datos: 'Margen bruto sin configurar.', i: OK({ margin: undefined }),
    interpreta: 'El impacto se muestra en ventas; la contribución bruta no se estima (null, no 0).', evita: ['“contribución $0”', 'estimar un margen por defecto'], pend: null,
    ok: [['Z1 no muestra contribución', (x) => !x.o1.economic.primary || !x.o1.economic.primary.contribution || x.o1.economic.primary.contribution.amount === null || x.o1.economic.primary.contribution.status !== 'disponible'], ['sin contradicción entre capas', (x) => x.viol.length === 0]] },
  { id: 'E12', familia: 'margen = 0 %', datos: 'Margen configurado explícitamente en 0 %.', i: OK({ margin: { marginEnabled: true, grossMarginPct: 0, updatedAt: '2026-11-01', source: 'manual' } }),
    interpreta: 'Un 0 % explícito es una configuración, no ausencia: no se confunde con “no configurado”.', evita: ['tratarlo como no configurado sin decirlo', 'mostrar una contribución positiva'], pend: 'Si 0 % es un margen válido o debe tratarse como no configurado (C5 de 3.2: validez según el motor; confirmar con Finanzas).',
    ok: [['no hay contribución positiva', (x) => { const p = x.o1.economic.primary; return !p || !p.contribution || !(p.contribution.amount && p.contribution.amount.point > 0); }], ['sin contradicción entre capas', (x) => x.viol.length === 0]] },
  { id: 'E13', familia: 'margen negativo', datos: 'Margen configurado −5 %.', i: OK({ margin: { marginEnabled: true, grossMarginPct: -5, updatedAt: 'x', source: 'manual' } }),
    interpreta: 'Fuera del rango del motor (≥ 0): no es válido para estimar contribución; se muestra solo ventas.', evita: ['calcular una contribución negativa', 'corregir el signo en silencio'], pend: 'Margen negativo: ¿es válido (venta por debajo del costo) o error de captura? Decisión de negocio/Finanzas; hoy el motor lo rechaza.',
    ok: [['no muestra contribución con margen negativo', (x) => { const p = x.o1.economic.primary; return !p || !p.contribution || p.contribution.status !== 'disponible'; }], ['sin contradicción entre capas', (x) => x.viol.length === 0]] },
  { id: 'E14', familia: 'impactos positivos, negativos y superpuestos', datos: 'Brecha −$0.7 M; canal que la concentra (mismo dinero); alternativas de recuperación; riesgo de cierre.', i: S1.SCENARIOS[1].input,
    interpreta: 'Z3 no suma entre clases, no totaliza líneas superpuestas y muestra alternativas como rango (el hallazgo de combineImpacts se documenta aparte).', evita: ['sumar brecha + canal', 'sumar alternativas de recuperación', 'mezclar observado con proyectado'], pend: 'Cómo agregar riesgos y oportunidades en un total (netear o no) — ver DIAGNOSTICO_COMBINEIMPACTS.md.',
    ok: [['Z3 no presenta total de líneas superpuestas', (x) => x.o3.totals && Object.values(x.o3.totals).every((c) => (c.lines || []).every((l) => !l.overlap || l.display === null))], ['sin contradicción entre capas', (x) => x.viol.length === 0]] },
  { id: 'E15', familia: 'señales sin evidencia / hipótesis sin confirmación', datos: 'Un driver es solo una hipótesis (sin confirmar).', i: S1.SCENARIOS[1].input,
    interpreta: 'La hipótesis se presenta aparte, con su cómo validarla; nunca como causa ni dentro del total.', evita: ['“la causa es …”', 'incluir la hipótesis en el total'], pend: null,
    ok: [['no hay lenguaje causal sobre hipótesis', (x) => !/la causa es|se debe a|provocado por/i.test(texts(x))], ['sin contradicción entre capas', (x) => x.viol.length === 0]] },
  { id: 'E16', familia: 'recomendaciones no ejecutables y oportunidades sin impacto cuantificable', datos: 'Se requiere un dato que falta (p. ej. margen o plan) para ejecutar una acción; la oportunidad no tiene importe.', i: OK({ margin: undefined, plan: { available: false }, revenue: rev(null, 9300000) }),
    interpreta: 'La acción que requiere un dato faltante no se ofrece como ejecutable: se retiene (Z4 «datos primero»); la oportunidad sin importe se dice «no cuantificable», no $0.', evita: ['ofrecer una acción que no puede ejecutarse', 'poner $0 como impacto'], pend: null,
    ok: [['Z4 ofrece primero el dato y no acciones de negocio sin respaldo', (x) => x.o4.cards.every((c) => c.kind === 'datos') || x.o4.cards.length === 0 || x.o1.reliability.level === 'Alta'], ['sin contradicción entre capas', (x) => x.viol.length === 0]] },
];
function run() {
  return ESC.map((e) => {
    let x, err = null; try { x = pipeline(e.i); } catch (er) { err = er.message; }
    if (err) return { id: e.id, familia: e.familia, error: err, fallas: ['excepción: ' + err] };
    const fallas = e.ok.filter(([, fn]) => { try { return !fn(x); } catch (er) { return true; } }).map(([d]) => d);
    return { id: e.id, familia: e.familia, datos: e.datos, interpreta: e.interpreta, confiabilidad: `${x.o1.reliability.level}${x.o1.reliability.cause ? ' · ' + x.o1.reliability.cause : ''}`, mensaje: x.o1.verdict.text, z3: x.o3.header || 'sin elementos', z4: x.o4.header || 'sin acciones',
      recomendacion: x.o4.cards.slice(0, 2).map((c) => c.label), evita: e.evita, pendiente: e.pend, comprobaciones: e.ok.map(([d]) => d), fallas, contradicciones: x.viol };
  });
}
module.exports = { ESC, run, pipeline, OK };
