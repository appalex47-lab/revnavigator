# Matriz de relación: elemento UX ↔ fuente ↔ motor ↔ estado (Subfase 3.1)

Generada desde `generated/MATRIZ_UX_MOTORES.json` (`python3 tools/audit/matriz_ux_md.py`). La batería `batch_fase3_1_home_auditoria.py` comprueba contra la aplicación real que cada ruta `FP.*` declarada existe cuando el estado es Disponible o Parcial, y que lo «Por desarrollar» no existe aún en `js/`.

**Los motores calculan; la experiencia visual presenta.** Ninguna fila pide duplicar lógica: cuando algo no existe, se indica la subfase que lo completa.

## Estados
- **Disponible**: El motor existe, calcula lo necesario y ya puede alimentar la experiencia.
- **Parcial**: El motor existe pero no cubre todo lo que el diseño necesita, o no está conectado al Home, o falta una pieza (etiqueta, estado, contrato).
- **Por desarrollar**: No existe en js/; hoy es solo especificación (Fase 2) o ni siquiera eso.

## Matriz

| Id | Elemento UX | Fuente de información | Motor responsable | Estado | Se completa en |
|---|---|---|---|---|---|
| M01 | Etiqueta de estado general del negocio (6 estados) | cumplimiento, cierre proyectado, evolución vs comparable, hallazgos activos | _especificación:_ `tools/audit/command-center-contracts.js · classifyBusinessState` | **Por desarrollar** | 3.2 (diseño) · 4.2 (motor) |
| M02 | Conclusión en una frase (veredicto) | homeResumen.build: cumplimiento, cierre, driver principal, nº de hallazgos | `FP.homeResumen.build`, `FP.homeSummaryEngine.compute` _Descriptiva y sin etiqueta de certeza; mezcla reglas de redacción en código de vista. Su capacidad narrativa (corta/larga) se conserva dentro de la Zona 1 (D-04); ver M31._ | **Parcial** | 3.2 · 5.2 |
| M03 | Cumplimiento y brecha a la fecha | gap.js · toDate.revenue (real − plan, mismos días) | `FP.gap.pacingStatus`, `FP.homeView.periodFigures` | **Disponible** | — |
| M04 | Cierre proyectado y brecha de cierre | forecastEngine · forecast, forecastGap | `FP.forecastEngine.runForecast` | **Disponible** | — |
| M05 | Evolución contra comparable (periodo anterior / año anterior) | homeSummaryEngine.why (actual vs periodo anterior) y temporalEngine | `FP.homeSummaryEngine.why`, `FP.temporalEngine` _Se calcula vs periodo anterior pero solo se muestra dentro de un plegable; no hay productor único de growthVsComparable ni comparación contra año anterior en Inicio._ | **Parcial** | 3.2 · 4.3 |
| M06 | Drivers (sesiones, CR, AOV) con estado de atribución | attributeSegment (9 estados), driverEngine nivel 1, homeSummaryEngine.compute (incluye whyPlan, función interna no exportada) | `FP.attribution.attributeSegment`, `FP.driverEngine.level1`, `FP.homeSummaryEngine.compute` _El cálculo y los 9 estados existen; Inicio muestra contribuciones dentro de un plegable y sin rotular el estado de atribución._ | **Parcial** | 3.2 · 4.2 |
| M07 | Cumplimiento por canal | homeSummaryEngine.channels | `FP.homeSummaryEngine.channels` | **Disponible** | — |
| M08 | Concentración de la brecha en un canal | agente analista (brecha_concentrada) y contributionEngine | `FP.agents.analista.detect`, `FP.contributionEngine` _Existe en el agente; Inicio solo muestra un banner con el conteo._ | **Parcial** | 4.3 |
| M09 | Hallazgos de portada (qué necesita atención) | attentionEngine.evaluate: tipos gap, driver, forecast, channel, data, followup | `FP.attentionEngine.evaluate` _No emite tipos riesgo ni oportunidad; esa clasificación es M27._ | **Disponible** | — |
| M10 | Hallazgos de detalle de los agentes | FP.agents.analista.detect | `FP.agents.analista.detect` _Conteo propio («4 cosas») distinto al de attentionEngine («2 hallazgos»)._ | **Parcial** | 4.4 |
| M11 | Contrato único de hallazgo con deduplicación | cc.finding v1 | _especificación:_ `tools/audit/command-center-contracts.js · validateFinding, mergeFindings` _Incluye el campo type (hallazgo, desviación, riesgo, oportunidad) que sostiene la clasificación de M27._ | **Por desarrollar** | 4.4 |
| M12 | Riesgos | forecastGap, hallazgos forecast/meta en riesgo, calidad de datos | `FP.attentionEngine.evaluate`, `FP.forecastEngine.runForecast` _Las señales existen pero ningún motor las clasifica como riesgo. Tratamiento propio del riesgo (severidad, impacto en riesgo): ver M27._ | **Parcial** | 3.3 · 4.4 |
| M13 | Oportunidades | recoveryOptions, scenarioEngine, riskOpportunityEngine (sin uso en producción) | `FP.recoveryEngine.recoveryOptions`, `FP.scenarioEngine.simulate` _Se puede calcular venta potencial/recuperable; ningún motor emite una oportunidad como hallazgo. Tratamiento propio de la oportunidad (estimación, alternativas excluyentes): ver M27._ | **Parcial** | 3.3 · 4.4 · 4.5 |
| M14 | Impacto en ventas por hallazgo (MXN) | FP.economics: fromGap, fromSimulation, fromRecovery | `FP.economics.fromGap`, `FP.economics.fromSimulation`, `FP.economics.fromRecovery` _El módulo existe y está probado; ninguna vista lo usa todavía._ | **Parcial** | 4.5 |
| M15 | Contribución bruta estimada (solo con margen configurado) | FP.economics.contributionOf + settings.economics | `FP.economics.contributionOf`, `FP.economics.availability` _Condicionada a margen; todavía sin vista._ | **Parcial** | 3.3 · 4.5 |
| M16 | Etiqueta de certeza (hecho, cálculo, driver, señal, estimación, hipótesis) | narrativeEngine.LEVELS y cc.finding.certainty | `FP.narrativeEngine.LEVELS` _narrativeEngine tiene 6 niveles; falta «estimación» y conectar la etiqueta a cada elemento del Inicio. La certeza de una conclusión nunca supera la confiabilidad (M29)._ | **Parcial** | 3.3 · 5.5 |
| M17 | Confiabilidad y cobertura de datos | homeSummaryEngine.trust, contextEngine.dataReadiness | `FP.homeSummaryEngine.trust`, `FP.contextEngine.dataReadiness` | **Disponible** | — |
| M18 | Qué falta para concluir (datos insuficientes) | attentionEngine tipo data, contextEngine.requirements | `FP.contextEngine.requirements` | **Disponible** | — |
| M19 | Siguiente paso y recomendación | attentionEngine.next, guide.nextStep, actionPriorityEngine | `FP.guide.nextStep`, `FP.actionPriorityEngine` _Pasos de ruta genéricos; la priorización de acciones existe pero no alimenta Inicio._ | **Parcial** | 3.4 · 5.4 |
| M20 | Qué cambió desde ayer | changeEngine / changesView.summaryOf | `FP.changesView.summaryOf`, `FP.changeEngine` | **Disponible** | — |
| M21 | Escenarios y acciones en curso | contextEngine.collectStatus (conteos) | `FP.contextEngine.collectStatus` _Solo conteos._ | **Parcial** | 3.4 |
| M22 | Tendencia y patrones | trendEngine, patternEngine | `FP.trendEngine`, `FP.patternEngine` _Existen; Inicio no los consume._ | **Parcial** | 4.3 |
| M23 | Mezcla y participación | shareMixEngine | `FP.shareMixEngine` _Existe; Inicio no lo consume._ | **Parcial** | 4.3 |
| M24 | Confianza del forecast | forecastConfidence | `FP.forecastConfidence` _Existe; Inicio no lo consume._ | **Parcial** | 3.2 · 4.2 |
| M25 | Evidencia y trazabilidad por cifra | explain.whyButton, traceability | `FP.explain.whyButton` | **Disponible** | — |
| M26 | Contexto de lectura (canal, periodo, fecha de datos) | state.ux.home, homeView.periodFigures, navigation.contextLabel | `FP.homeView.periodFigures`, `FP.navigation.contextLabel` | **Disponible** | — |
| M27 | Clasificación de cada elemento de atención: hallazgo, riesgo u oportunidad (D-02) | cc.finding.type; cada clase conserva significado y tratamiento propios | _especificación:_ `tools/audit/command-center-contracts.js · validateFinding (TYPES)` _Hoy attentionEngine emite seis tipos técnicos (gap, driver, forecast, channel, data, followup); ninguno es riesgo ni oportunidad._ | **Por desarrollar** | 3.3 (diseño) · 4.4 (motor) |
| M28 | Selección de los destacados por impacto, urgencia y confiabilidad (D-03) | attentionEngine: priority, severity, support; actionPriorityEngine | `FP.attentionEngine.evaluate`, `FP.actionPriorityEngine` _Existen prioridad, severidad y respaldo por hallazgo; no existe un criterio que combine impacto económico, urgencia y confiabilidad._ | **Parcial** | 3.3 · 3.4 · 4.4 |
| M29 | Condicionamiento de la lectura ejecutiva por confiabilidad (aclaración B) | attentionEngine.support (alto/medio/bajo), homeSummaryEngine.trust (cobertura, avisos), contextEngine.dataReadiness, hallazgos que bloquean | `FP.homeSummaryEngine.trust`, `FP.contextEngine.dataReadiness`, `FP.attentionEngine.evaluate` _Las señales de confiabilidad existen; la regla que baja la contundencia de la conclusión (y que impide presentar como definitiva una lectura sin sustento) no existe._ | **Parcial** | 3.2 · 4.2 |
| M30 | Acceso al universo completo de hallazgos y acciones («Ver todos»; D-03) | attentionEngine.evaluate devuelve todos los hallazgos; actionPriorityEngine ordena acciones | `FP.attentionEngine.evaluate`, `FP.actionPriorityEngine` _Los datos completos existen; falta el diseño de acceso con filtros por clasificación._ | **Parcial** | 3.3 · 3.4 |
| M31 | Narrativa corta/larga integrada en la lectura ejecutiva (D-04) | homeResumen.build: filas del resumen en versión corta y larga | `FP.homeResumen.build` _Se reutiliza como contenido de la Zona 1; deja de ser un bloque independiente._ | **Disponible** | — |
| M32 | Recorrido del sistema (avance por etapas) — sale del Home principal (D-04) | homeView.journey (6 etapas calculadas con datos reales) | `FP.homeView.journey` _Su contenido se conserva sin cambios en la vista de ayuda existente; no se pierde información._ | **Disponible** | — |
| M33 | Detalle metodológico y de atribución (método, orden, estado, «contribución ≠ causa»; D-01) | attributeSegment, driverEngine nivel 1 | `FP.attribution.attributeSegment`, `FP.driverEngine.level1` _El cálculo y su método existen; Inicio no los muestra con su estado ni con la advertencia._ | **Parcial** | 3.2 · 4.2 |

**Resumen:** 11 Disponible · 19 Parcial · 3 Por desarrollar (de 33 elementos).
