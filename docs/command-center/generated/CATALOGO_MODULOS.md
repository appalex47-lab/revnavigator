# Catálogo de módulos (generado del código)

Generado por `tools/audit/fase1_catalogo.py`. Archivos JS: **241**; cargados en `index.html`: **241**; con referencia en alguna prueba: **101**.

Archivos JS no cargados por `index.html` (ni worker): ninguno 

## js/actions  (3 archivos, 361 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `actionLibrary.js` | actionLibrary.js — Catálogo de acciones POSIBLES (Fase 6). No son recomendaciones: es un catálogo configurable (config.recovery.actionLibrary + acciones del | `FP.actionLibrary` | 50 | **no** |
| `actionPlan.js` | actionPlan.js — Plan de acción (Fase 6). Acción = actividad que una persona o equipo ejecuta. Se liga a hipótesis, escenario, driver, canal y | `FP.actionPlan` | 286 | sí |
| `actionTracking.js` | actionTracking.js — Seguimiento de acciones (Fase 6). Registra mediciones (baseline / escenario / observado) sin borrar las anteriores. | `FP.actionTracking` | 25 | **no** |

## js/agents  (6 archivos, 1824 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `agentLauncher.js` | agentLauncher.js — Fase 1 · Botón «Asistentes» (pequeño, vive en el arranque) y registro de agentes. El panel, los detectores y la IA (FP.agents.*, FP.agentPanel) son un módulo DIFERIDO (data-lazy="agentes" en index.html): | `FP.agentLauncher`, `FP.agents` | 96 | sí |
| `agentRunner.js` | agentRunner.js — Fase 1 · Orquesta a un agente: detectores (código) → IA opcional que ordena y redacta → validación → resultado. Reglas que no se negocian (ARCHITECTURE.md · «Fase 1 · Panel de agentes»): | `FP.agents` | 303 | sí |
| `analistaDetectors.js` | analistaDetectors.js — Fase 1 · Detectores del Analista de Números. Código determinista: LEE los motores que ya existen (Pacing/Forecast, Diagnóstico) y devuelve «candidatos a hallazgo» | `FP.agents` | 417 | sí |
| `analistaStory.js` | analistaStory.js — Fase 2 · «La historia del periodo» del Analista de Números. En vez de una lista suelta de hallazgos, arma una historia en tres partes (qué se cae, qué crece, dónde revisar primero) y una ruta de | `FP.agents` | 310 | sí |
| `arquitectoDetectors.js` | arquitectoDetectors.js — Fase 4 · Detectores del Arquitecto de Ofertas. Lee lo que el módulo de Promociones ya tiene (ofertas recibidas, promociones, metas por campaña, oportunidades y reglas de activación) y busca | `FP.agents` | 326 | sí |
| `auditorDetectors.js` | auditorDetectors.js — Fase 2 · Detectores del Auditor de Conversión. Sigue el embudo de GA4 por producto (vista → carrito → checkout → compra) y lo compara contra la mediana de su propia categoría. | `FP.agents` | 372 | sí |

## js/ai  (8 archivos, 828 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `cohereActions.js` | cohereActions.js — Líneas de acción con Cohere (Fase 6, opcional). Cohere puede transformar una hipótesis en POSIBLES líneas de acción, explicar su relación con el | `FP.cohereActions` | 182 | sí |
| `cohereAnalysisAssistant.js` | cohereAnalysisAssistant.js — Fase 27 · Asistente conversacional de Análisis. Cohere interpreta preguntas libres sobre resultados YA calculados por los motores | `FP.cohereAnalysisAssistant` | 196 | sí |
| `cohereAudit.js` | cohereAudit.js — Fase H1 · registro de transparencia de las consultas a Cohere (solo en esta sesión, solo en memoria). Cada consulta que SALE del navegador deja una línea: para qué, qué modelo, cuántas columnas y ejemplos se enviaron, cuáles se protegieron y c | `FP.aiAudit` | 25 | **no** |
| `cohereClient.js` | cohereClient.js — Cliente mínimo de Cohere Chat API v2 (compartido; Fase 6). Extraído de cohereDiagnostic.js para no duplicar la llamada de red entre el diagnóstico (Fase 5) | `FP.cohereClient` | 99 | sí |
| `cohereDataset.js` | cohereDataset.js — Fase H4 · ayuda de la IA cuando la detección por reglas duda entre dos tipos de archivo. Solo se consulta si detectDataset marcó la clasificación como ambigua. Viajan SOLO los encabezados (ningún valor) y los tipos candidatos. | `FP.cohereDataset` | 46 | sí |
| `cohereDiagnostic.js` | cohereDiagnostic.js — Redacción de hipótesis con Cohere (Fase 5, opcional). JavaScript → cálculos → drivers → señales → [Cohere] → redacción de hipótesis | `FP.cohereDiagnostic` | 127 | sí |
| `cohereNarrative.js` | cohereNarrative.js — Redacción ejecutiva con Cohere (Fase 9.2, opcional). JavaScript → narrativeEngine.build() → [Cohere redacta] → validación anti-alucinación → UI | `FP.cohereNarrative` | 124 | sí |
| `cohereProxy.js` | cohereProxy.js — Cohere a través del servidor del equipo (Edge Function `cohere-proxy` de Supabase). Con sesión iniciada, las llamadas a Cohere van a tu Supabase con tu sesión; la API key de Cohere vive solo en el secreto del servidor | `FP.cohereProxy` | 29 | **no** |

## js/analytics  (22 archivos, 3192 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `actionPriorityEngine.js` | actionPriorityEngine.js — Prioridades de acción. Fusiona Patrones Avanzados + Riesgos/Oportunidades en una sola capa de decisión. | `FP.actionPriorityEngine` | 85 | sí |
| `analysisArchitecture.js` | analysisArchitecture.js — Fase 15. Contrato de navegación analítica: Hecho → Driver → Señal → Hipótesis → Proyección → Ciclo de vida. | `FP.analysisArchitecture` | 24 | sí |
| `analysisContext.js` | analysisContext.js — Contexto único del módulo Análisis (canal + período + comparación + nivel + métrica). Es la ÚNICA fuente de verdad para: | `FP.analysisContext` | 91 | sí |
| `analysisNarrativeEngine.js` | analysisNarrativeEngine.js — Fase 23: narrativa ejecutiva trazable. Orquesta resultados ya calculados de las seis capas de Análisis. | `FP.analysisNarrativeEngine` | 91 | sí |
| `attentionEngine.js` | attentionEngine.js — «Qué necesita atención» y «Tu siguiente mejor paso» (Inicio, etapa 1 del rediseño). NO calcula métricas de negocio. Lee lo que ya calcularon los motores existentes y lo ordena con reglas explícitas: | `FP.attentionEngine` | 414 | sí |
| `basketEngine.js` | basketEngine.js — Productos que se compran juntos (canasta) para detectar cross-sell. Puro: no toca el DOM, la red ni el almacenamiento. Trabaja sobre el libro de clientes (FP.customerEngine): una fila por pedido y, aparte, las líneas de cada pedido (producto, | `FP.basketEngine` | 162 | sí |
| `changeEngine.js` | changeEngine.js — «Qué cambió desde ayer». Puro: no toca la red, el DOM ni el almacenamiento. Solo LEE la corrida de forecast (run) y, si existe, una foto anterior (snapshot). No crea cálculos nuevos de negocio: | `FP.changeEngine` | 211 | sí |
| `cohortEngine.js` | cohortEngine.js — Cohortes + ciclo de vida descriptivo de entidades. No infiere clientes: una cohorte es el primer período observado de una entidad. | `FP.cohortEngine` | 129 | **no** |
| `contributionEngine.js` | contributionEngine.js — Análisis 4: Contribución y origen. Determina qué entidades explican un movimiento observado y qué tan concentrado está. | `FP.contributionEngine` | 66 | sí |
| `customerEngine.js` | customerEngine.js — Clientes nuevos / recurrentes / reactivados, cohortes de adquisición, retención y LTV. Puro: no toca el DOM, la red ni el almacenamiento. Trabaja sobre un «libro de clientes» (ledger) con una fila por PEDIDO: | `FP.customerEngine` | 437 | sí |
| `funnelEngine.js` | funnelEngine.js — Embudo de ficha por producto (GA4): vistas → carrito → checkout → compra. Puro: recibe cifras ya agregadas (del periodo y de su referencia) y devuelve la tasa de cada paso, su cambio en puntos porcentuales, | `FP.funnelEngine` | 69 | sí |
| `homeSummaryEngine.js` | homeSummaryEngine.js — Resumen general de Inicio (4 bloques). Solo LEE: no crea un cálculo nuevo, compone los que ya existen. 1. why      Por qué cambió la venta: Δ venta del periodo contra el periodo anterior, partido en tráfico → conversión → ticket | `FP.homeSummaryEngine` | 205 | **no** |
| `patternEngine.js` | patternEngine.js — Detección avanzada de patrones sobre resultados de trendEngine. Fase 2. No calcula causalidad ni llama APIs. | `FP.patternEngine` | 105 | sí |
| `planBridgeEngine.js` | planBridgeEngine.js — Puente al plan: ¿cuánto de la brecha contra la meta explica cada canal / entidad? Puro. Identidad exacta:  Brecha = Real − Meta = (Real − Base) − (Meta − Base) = Δ observado − Δ esperado por la meta. | `FP.planBridgeEngine` | 33 | sí |
| `pvmEngine.js` | pvmEngine.js — Descomposición Volumen · Precio · Mezcla (PVM) de la VENTA. Puro y determinístico. Explica MATEMÁTICAMENTE cuánto del cambio de venta viene de vender más/menos unidades | `FP.pvmEngine` | 56 | sí |
| `riskOpportunityEngine.js` | riskOpportunityEngine.js — Análisis 5: Riesgos y oportunidades. Prioriza señales existentes sin afirmar causalidad. Solo usa evidencia calculada. | `FP.riskOpportunityEngine` | 43 | **no** |
| `shareMixEngine.js` | shareMixEngine.js — Share & Mix Intelligence (Análisis 3). Calcula participación, cambio de mix, ranking y concentración de forma determinística. | `FP.shareMixEngine` | 73 | sí |
| `temporalEngine.js` | temporalEngine.js — Capa temporal global. Define periodo focal, completitud y comparaciones equivalentes (YoY/MoM/WoW/DoD). | `FP.temporalEngine` | 117 | sí |
| `trafficConversionEngine.js` | trafficConversionEngine.js — Descomposición de la venta por segmento: Venta = Sesiones × CR × Ticket. Mueve los factores de uno en uno (tráfico → conversión → ticket) entre el periodo base y el actual, así los tres efectos | `FP.trafficConversionEngine` | 269 | sí |
| `trendEngine.js` | trendEngine.js — Evolución temporal y detección determinística de patrones (Análisis 1). No interpreta causalidad: recibe una serie y devuelve evidencia, patrón y métricas. | `FP.trendEngine` | 151 | sí |
| `trendForecastEngine.js` | trendForecastEngine.js — Análisis 6: forecast de tendencias históricas. Proyección descriptiva desde las series de Análisis. No sustituye al Forecast operativo PLAN→ACTUAL. | `FP.trendForecastEngine` | 104 | sí |
| `trendStoryEngine.js` | trendStoryEngine.js — «La historia» de una entidad (producto, categoría, SKU…): cuándo creció, cuándo cayó, cómo está AHORA, si es estable o volátil y cómo se compara con su contexto. Puro y determinístico. | `FP.trendStoryEngine` | 257 | sí |

## js/calculations  (7 archivos, 2597 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `gap.js` | gap.js — Capa explícita de gap (Fase 3). gap          = actual − plan | `FP.gap` | 59 | sí |
| `metrics.js` | metrics.js — Núcleo matemático determinístico. Pedidos = traffic_volume × CR | `FP.metrics` | 283 | sí |
| `pacing.js` | pacing.js — Pacing: plan vs actual en el tiempo (Fase 3). Conceptos: | `FP.pacing` | 132 | **no** |
| `seasonality.js` | seasonality.js — Motor de estacionalidad (Fase 2). Entrada: registros canónicos del HISTÓRICO (Fase 1) de un canal. | `FP.seasonality` | 340 | **no** |
| `self-test.js` | self-test.js — Pruebas del motor que corren en el navegador al iniciar. Alimentan el indicador "Estado del motor". Cada fase nueva debe AGREGAR | `FP.selfTest` | 1580 | **no** |
| `targetAssistant.js` | targetAssistant.js — Asistente para PROPONER metas anuales a partir de la venta real de un año base. La meta es una decisión del negocio (Original Target): el asistente solo llena el formulario con una | `FP.targetAssistant` | 74 | **no** |
| `weights.js` | weights.js — Estadística robusta y utilidades de pesos (Fase 2). Funciones puras, sin conocimiento de canales ni fechas. Las usa seasonality.js. | `FP.weights` | 129 | sí |

## js/calendar  (1 archivos, 234 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `calendar.js` | calendar.js — Fechas, semanas, periodos. Todas las fechas se manejan como 'YYYY-MM-DD' y se operan en UTC | `FP.calendar` | 234 | sí |

## js/cloud  (3 archivos, 763 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `changeStore.js` | changeStore.js — Guarda el estado de las alertas y la foto diaria de «Qué cambió desde ayer». - Con sesión de equipo: tablas alert_states y daily_snapshots de Supabase (las ve todo el equipo, RLS por equipo). | `FP.changeStore` | 109 | **no** |
| `cloudSync.js` | cloudSync.js — Nube (Supabase) con acceso controlado por equipo. Sin dependencias: habla con Auth y REST de Supabase con fetch. | `FP.cloud` | 537 | sí |
| `productSync.js` | productSync.js — Productos en la nube del equipo. Los productos viven en IndexedDB como bloques día × canal con columnas tipadas (no caben en el sobre {data} de las demás claves), | `FP.productSync` | 117 | **no** |

## js/config  (3 archivos, 1675 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `businessContext.js` | businessContext.js — Business Setup / Business Context (Fase 8.2). "¿Qué tipo de negocio estoy analizando y cómo funciona?" | `FP.businessContext` | 211 | **no** |
| `config.js` | config.js — Configuración central (única fuente de verdad). Todo lo que "describe el negocio" vive aquí: canales, métricas, | `FP.config` | 816 | sí |
| `guidanceConfig.js` | guidanceConfig.js — Contenidos de la capa de guía (Fase 7). Solo texto y estructura: grupos de navegación, metadatos de cada vista, entradas de ayuda | `FP.guidanceConfig` | 648 | **no** |

## js/data  (6 archivos, 1366 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `data-model.js` | data-model.js — Contrato de datos interno (schema 1.0.0). Entidades: | `FP.dataModel` | 215 | **no** |
| `data-store.js` | data-store.js — Modelo canónico de datos cargados (Fase 1). store = { | `FP.dataStore` | 488 | **no** |
| `mock-csv.js` | mock-csv.js — Archivos CSV de prueba (Fase 1, solo QA). Pasan por el MISMO pipeline que un archivo real (stage → process → commit), | `FP.mockCsv` | 294 | **no** |
| `mock-data.js` | mock-data.js — Datos de prueba controlados (solo Fase 0 / QA). Determinísticos (semilla fija): cada ejecución produce los mismos números, | `FP.mock` | 117 | **no** |
| `mock-products.js` | mock-products.js — Archivos de prueba de productos (solo QA; Fases 8.1 y 8.1.1). Dos archivos como los reales: venta (estado, sucursal, tipo de entrega) y funnel GA4 (sin dimensiones). | `FP.mockProducts` | 171 | **no** |
| `replace-plan.js` | replace-plan.js — Reemplazo de un archivo cargado por su versión nueva (Google Sheets «Actualizar» o archivo suelto). Módulo puro (sin DOM ni almacenamiento): compara la versión anterior con la nueva y decide si hace falta una confirmación extra. | `FP.replacePlan` | 81 | sí |

## js/diagnostics  (6 archivos, 820 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `attribution.js` | attribution.js — Atribución matemática de una variación multiplicativa (Fase 5). Revenue = Traffic × CR × AOV      (Orders = Traffic × CR) | `FP.attribution` | 72 | **no** |
| `diagnosticArchitecture.js` | diagnosticArchitecture.js — Contrato de la capa HIPÓTESIS. No calcula cifras. Define la cadena de evidencia y garantiza que las hipótesis | `FP.diagnosticArchitecture` | 31 | sí |
| `diagnosticEngine.js` | diagnosticEngine.js — ¿Por qué existe la brecha? (Fase 5) runDiagnostic({ period, channel, comparison, metric, method, run, rf, store, quality }) | `FP.diagnosticEngine` | 155 | **no** |
| `driverEngine.js` | driverEngine.js — Brecha y drivers (Fase 5). Todas las comparaciones se reducen a la misma estructura: una lista de PARES diarios | `FP.driverEngine` | 315 | **no** |
| `hypothesisEngine.js` | hypothesisEngine.js — Hipótesis por reglas (Fase 5). Cadena obligatoria: HECHO → DRIVER → SEÑAL → HIPÓTESIS. Nunca se salta un paso: | `FP.hypothesisEngine` | 128 | **no** |
| `signalEngine.js` | signalEngine.js — Señales (Fase 5). Una señal es un HECHO cuantificado que merece investigación: un cambio relevante contra la | `FP.signalEngine` | 119 | **no** |

## js/events  (1 archivos, 63 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `events.js` | events.js — Entidades de eventos comerciales e hitos. Fase 0: creación, validación y consulta por fecha. | `FP.events` | 63 | **no** |

## js/export  (12 archivos, 1224 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `actionPlanExport.js` | actionPlanExport.js — action_plan_export.json (Fase 6). Conserva la trazabilidad completa: gap → driver → señal → hipótesis → escenario → acción → medición. | `FP.actionPlanExport` | 45 | **no** |
| `analysisExport.js` | analysisExport.js — analysis_export.json (Fase 5). Contrato pensado para la app de diagnóstico independiente ("Diagnóstico de brecha de ventas"): | `FP.analysisExport` | 71 | **no** |
| `analysisPackage.js` | analysisPackage.js — Fase 10 · Paquete de análisis. Junta en un .zip los 7 exports que la app ya genera (Pacing y forecast, Reforecast, Diagnóstico, Categoría → Producto, | `FP.analysisPackage` | 106 | **no** |
| `categoryProductExport.js` | categoryProductExport.js — category_product_analysis_export.json (Fase 8.1). Resultado de FP.productAnalysis.run con filtros, disponibilidad de métricas, participación, contribución, | `FP.categoryProductExport` | 56 | **no** |
| `export.js` | export.js — Contrato de forecast_export.json. Fase 0: define la estructura y la construye desde el estado actual | `FP.exporter` | 206 | sí |
| `forecastExport.js` | forecastExport.js — forecast_export.json (Fase 3). Es un SUPERCONJUNTO del contrato de Fase 0 (`FP.exporter.buildForecastExport`): | `FP.forecastExport` | 110 | **no** |
| `narrativeExport.js` | narrativeExport.js — narrative_export.json (Fase 9.2). Empaqueta la narrativa ya construida (claims con nivel de certeza, fuente y cifras) más, si existe, | `FP.narrativeExport` | 31 | **no** |
| `planningExport.js` | planningExport.js — Contrato de planning_export.json (Fase 2). Pensado para que el futuro módulo de reforecast y la app de diagnóstico lo lean | `FP.planningExport` | 96 | **no** |
| `promotionExport.js` | promotionExport.js — Exportación del registro de promociones (propuesta B, fase 1): CSV (una fila por promoción-SKU) y JSON. Solo lee el registro: no calcula venta, incremental ni efecto. Las fechas salen como AAAA-MM-DD (texto) para no depender | `FP.promotionExport` | 273 | sí |
| `reforecastExport.js` | reforecastExport.js — reforecast_export.json (Fase 4). Estructura pensada para la futura app de diagnóstico: plan, actual, forecast, reforecast, | `FP.reforecastExport` | 67 | **no** |
| `xlsxWriter.js` | xlsxWriter.js — Escritor mínimo de .xlsx, sin dependencias (un .xlsx es un ZIP de XML; usa FP.zip.create). Solo lo necesario para una hoja de datos legible: texto, números, fechas, porcentajes y moneda con formato real, encabezado con relleno, | `FP.xlsxWriter` | 90 | sí |
| `zip.js` | zip.js — Fase 10. Escritor de archivos .zip mínimo, sin dependencias (la app corre sin servidor y la política de contenido no permite librerías externas). Método «stored» (sin compresión): los archivos viajan tal cual, así cualquier herramienta | `FP.zip` | 73 | sí |

## js/forecast  (14 archivos, 3047 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `distribution.js` | distribution.js — Reparto exacto de un total entre partes (Fase 2). Método del mayor residuo (Hamilton) sobre unidades enteras: | `FP.distribution` | 53 | sí |
| `forecast.js` | forecast.js — Versionado de plan / forecast (sin algoritmos). Original Plan  (inmutable, congelado) | `FP.forecast` | 104 | **no** |
| `forecastCalibration.js` | forecastCalibration.js — Fase 3.3 · Calibración de la confianza del cierre estimado (determinista, sin IA). Qué hace: compara cada cierre estimado con lo que el mes realmente cerró y, con ese historial, ajusta qué tan exigentes son los umbrales de los factores | `FP.forecastCalibration` | 313 | sí |
| `forecastConfidence.js` | forecastConfidence.js — Fase 3 · Confianza del cierre estimado (solo lectura, determinista). Dice qué tan SÓLIDA es la base de la estimación del cierre de un periodo, no qué tan probable es acertar: no es una probabilidad ni un | `FP.forecastConfidence` | 151 | sí |
| `forecastEngine.js` | forecastEngine.js — Motor central: PLAN → ACTUAL → PACING → GAP → FORECAST (Fase 3). plan      = Plan distribuido ORIGINAL de Fase 2 (congelado). Si no existe, el plan | `FP.forecastEngine` | 564 | sí |
| `forecastMethods.js` | forecastMethods.js — Métodos de proyección de un día no cerrado (Fase 3). A · Plan restante         forecast_día = plan_día                         (baseline) | `FP.forecastMethods` | 109 | **no** |
| `forecastVersioning.js` | forecastVersioning.js — Snapshots de forecast, cambio y accuracy (Fase 3). Cada vez que el usuario guarda, se crea una versión NUEVA e inmutable (congelada): | `FP.forecastVersioning` | 128 | **no** |
| `futureWeights.js` | futureWeights.js — Pesos futuros para el reforecast (Fase 4). Arquitectura:  Seasonality Engine (Fase 2) → Plan distribuido → Future Weights → Reforecast Engine | `FP.futureWeights` | 55 | **no** |
| `methodAdvisor.js` | methodAdvisor.js — Lectura explicable de la comparación de métodos A/B/C/D (solo lectura: NO cambia el método en uso). - Semáforo por método: verde = índices con días suficientes y sin fallback · amarillo = pocos días o con fallback · rojo = falta un índice o  | `FP.methodAdvisor` | 98 | sí |
| `performanceIndex.js` | performanceIndex.js — Índices de desempeño (Fase 3). índice = actual ÷ plan, sobre los MISMOS días comparables de la ventana. | `FP.performanceIndex` | 95 | **no** |
| `planningEngine.js` | planningEngine.js — Motor de planeación (Fase 2). Responde: "dada la meta y el histórico, ¿cómo debería distribuirse en el tiempo y por canal?" | `FP.planning` | 738 | **no** |
| `reforecastEngine.js` | reforecastEngine.js — Reforecast dinámico (Fase 4). PLAN ORIGINAL (solo lectura) ─┐ | `FP.reforecastEngine` | 469 | **no** |
| `reforecastVersioning.js` | reforecastVersioning.js — Versiones del reforecast (Fase 4). Cada "Guardar reforecast" crea una versión NUEVA e inmutable (congelada): | `FP.reforecastVersioning` | 111 | **no** |
| `thresholdAdvisor.js` | thresholdAdvisor.js — Sugerencia de umbrales a partir del historial (Presentation Intelligence · endurecimiento). Los umbrales «bajo el plan», «en meta» y «fuera de meta» (presentación) y «Arriba del plan desde» / «En plan desde» (Forecast) son criterios de ne | `FP.thresholdAdvisor` | 59 | sí |

## js/impact  (2 archivos, 139 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `impactCalculator.js` | impactCalculator.js — Impacto SIMULADO de un escenario (Fase 6). Solo transforma el resultado de FP.scenarioEngine.simulate en la estructura del brief. No calcula | `FP.impactCalculator` | 38 | **no** |
| `impactMeasurement.js` | impactMeasurement.js — Impacto OBSERVADO después de ejecutar una acción (Fase 6). Compara, sobre los MISMOS días de la ventana de medición y solo donde ya hay real: | `FP.impactMeasurement` | 101 | **no** |

## js/import  (9 archivos, 1812 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `aliases.js` | aliases.js — Equivalencias de nombres (homologación): una sola tabla que los normalizadores consultan al importar. Formato de cada regla (una por línea):   campo: valor = canónico      (sin «campo:» vale para cualquier campo) | `FP.aliases` | 134 | **no** |
| `csv.js` | csv.js — Lectura de CSV → RAW DATA (Fase 1). Paso 1 del flujo: CSV → RAW → VALIDATION → NORMALIZATION → CANONICAL → APP. | `FP.csv` | 118 | **no** |
| `ga4Funnel.js` | ga4Funnel.js — traductor del CSV de artículos de GA4 al formato de «Productos · funnel». Si el archivo trae «Plataforma» (web / Android / iOS) y no trae «canal», convierte web → ecommerce y Android / iOS → app y SUMA las filas | `FP.ga4Funnel` | 97 | **no** |
| `ga4Segments.js` | ga4Segments.js — Fase 11 · pieza 2: traductor del CSV exportado de GA4 al formato de Segmentos. Decisiones del usuario: web y app en la misma propiedad (Plataforma: web → Ecommerce; Android / iOS → App); «(not set)» se muestra como | `FP.ga4Segments` | 229 | sí |
| `import.js` | import.js — Pipeline de importación (Fase 1). CSV ──csv.parse──▶ RAW (texto) ──mapping──▶ campos | `FP.importer` | 400 | **no** |
| `normalize.js` | normalize.js — Reglas de normalización (Fase 1). Cada función recibe TEXTO crudo y devuelve un resultado explícito: | `FP.normalize` | 390 | sí |
| `sheetsLink.js` | sheetsLink.js — Google Sheets por enlace publicado (opción A). Una pestaña publicada en la web como CSV es una URL pública de solo lectura. Este módulo: | `FP.sheetsLink` | 114 | sí |
| `workerClient.js` | workerClient.js — la página habla con el Worker de importación (js/workers/import-worker.js). Si el navegador no puede crear el Worker (p. ej. abriendo index.html como archivo local) `start()` devuelve false y la app usa el flujo normal. | `FP.importWorker` | 83 | **no** |
| `xlsx.js` | xlsx.js — lector XLSX mínimo, sin librerías externas. Convierte la primera hoja de un .xlsx a la misma estructura que FP.csv.parse: | `FP.xlsx` | 247 | **no** |

## js/model  (3 archivos, 443 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `availability.js` | availability.js — Fase B · disponibilidad real de métricas, dimensiones y análisis, con periodos explícitos y comparabilidad. Consume lo que ya produce la Fase A (registros con su estado, celdas en cuarentena, lotes con su fuente) sin repetir validaciones. | `FP.availability` | 217 | **no** |
| `canonical.js` | canonical.js — Fase B · modelo canónico extensible, registro de perfiles de dataset y detección determinística. Decisión de arquitectura (Fase 0): el contrato interno de la app NO se renombra (los 7 exports y el paquete dependen de él). | `FP.canonical` | 158 | **no** |
| `derivations.js` | derivations.js — Fase B · motor central de métricas derivadas. Cada fórmula se REGISTRA (id, entradas, fórmula, unidad, requisitos, tolerancia, versión) y se calcula con las funciones que la app ya usaba (FP.metrics.calcAov / calcConversionRate), | `FP.derivations` | 68 | **no** |

## js/narrative  (1 archivos, 305 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `narrativeEngine.js` | narrativeEngine.js — Narrativa ejecutiva (Fase 9.2). DATOS → CÁLCULOS DETERMINÍSTICOS → DIAGNÓSTICOS → SEÑALES → HIPÓTESIS → NARRATIVA | `FP.narrativeEngine` | 305 | sí |

## js/products  (4 archivos, 1665 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `customerStore.js` | customerStore.js — Libro de clientes (una fila por pedido) en IndexedDB, almacén `meta` (clave `customerLedger`). - Se guarda en el almacén `meta` con clave `productCustomerLedger`: empieza con «product», así que viaja con los productos a la nube del | `FP.customerStore` | 73 | **no** |
| `productAnalysis.js` | productAnalysis.js — Análisis Categoría → Producto (Fase 8.1). Negocio → Canal → Categoría → Subcategoría → Producto → SKU, sobre los agregados de FP.productStore. | `FP.productAnalysis` | 254 | **no** |
| `productImport.js` | productImport.js — Carga de productos integrada al flujo de Fase 1 (Fase 8.1). Mismo recorrido que cualquier archivo: seleccionar → vista previa → mapeo → validación → resumen → | `FP.productImport` | 161 | **no** |
| `productStore.js` | productStore.js — Datos diarios por SKU (Fase 8.1, ampliada en 8.1.1). Dos archivos, dos bloques por día × canal (IndexedDB): | `FP.productStore` | 1177 | **no** |

## js/projection  (2 archivos, 611 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `projection.js` | projection.js — Proyección del año siguiente: base del año actual, meta propuesta (objetivo) y proyección (lo que esperamos). Todo es JavaScript determinístico: ningún número sale de la IA. | `FP.projection` | 246 | sí |
| `projectionCalibration.js` | projectionCalibration.js — Calibración de la proyección del año siguiente (lógica pura, sin DOM ni almacenamiento). Qué calibra (y qué NO): | `FP.projectionCalibration` | 365 | sí |

## js/promotions  (12 archivos, 2262 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `activationEngine.js` | activationEngine.js — Activación de ofertas y oportunidades (propuesta B, etapa ACTIVACIÓN). Sugiere DÓNDE colocar y QUÉ hacer con cada oferta recibida y con cada oportunidad (producto sin oferta). Son reglas explícitas, | `FP.activation` | 199 | sí |
| `campaignGoals.js` | campaignGoals.js — Meta numérica por campaña (propuesta B). Una meta es una cifra que la persona decide para una campaña (por ejemplo «Buen Fin»): venta y/o unidades. La herramienta no la propone ni la calcula. | `FP.goals` | 170 | sí |
| `demoData.js` | demoData.js — datos de EJEMPLO para ver cómo se ve Promociones sin cargar nada real (propuesta B). Todo lo que crea lleva «EJEMPLO» en el nombre de la campaña, de la propuesta, de la promoción o del archivo, para quitarlo sin tocar datos reales. | `FP.demo` | 94 | sí |
| `exposureStore.js` | exposureStore.js — «Exposición»: productos que se decide exponer (banner, cuadrícula, CRM…) sin una oferta de descuento. No es una oferta: no lleva descuento ni precio, no pasa por validar ni por armar promoción y NO cuenta en el descuento promedio ni en la | `FP.exposures` | 124 | sí |
| `guideEngine.js` | guideEngine.js — «Ahora haz esto» y el resumen de ofertas/oportunidades (propuesta B, simplificación del flujo). Solo LEE lo que ya existe (ofertas, promociones, sugerencias de activación) y calcula: el siguiente paso del flujo, los conteos | `FP.guide` | 252 | sí |
| `offerStore.js` | offerStore.js — Ofertas recibidas (propuesta B, fase 1B). Recibe y ordena las ofertas que mandan terceros (proveedores / comercial). NO calcula venta, margen ni efecto, y NO inventa | `FP.offers` | 330 | sí |
| `opportunityEngine.js` | opportunityEngine.js — Oportunidades del canal digital (propuesta B, etapa PRE). Lee la comparación por SKU que ya calcula FP.productAnalysis (periodo actual contra periodo de referencia) y asigna a cada SKU | `FP.opportunities` | 174 | sí |
| `promotionEvaluation.js` | promotionEvaluation.js — Evaluación de promociones (propuesta B, etapa POST). Módulo propio (no una capa sobre impactMeasurement.js): evalúa por SKU y por día, con línea base de periodo anterior comparable. | `FP.promotionEvaluation` | 259 | sí |
| `promotionStore.js` | promotionStore.js — Registro de promociones (propuesta B, fase 1). Guarda lo que una persona decide y lo que ocurre en la ejecución. NUNCA copia venta ni funnel: la medición posterior | `FP.promotionNotes`, `FP.promotions` | 327 | sí |
| `removalEngine.js` | removalEngine.js — eliminar ofertas recibidas y promociones (propuesta B, simplificación del flujo). Eliminar NO es descartar ni cancelar: quita el registro. Por eso tiene reglas y deja una línea en el «Registro de eliminaciones» | `FP.removal` | 115 | sí |
| `requestStore.js` | requestStore.js — Solicitudes de oferta a Comercial (se piden desde Oportunidades). Una solicitud dice: «de este SKU necesitamos una oferta». No guarda precios, descuentos, costos ni márgenes: solo qué se pidió, | `FP.requests` | 116 | sí |
| `summaryEngine.js` | summaryEngine.js — Resumen de promociones (propuesta B): qué pedimos, qué llegó y qué falta. Solo cuenta y agrupa lo que ya existe (propuestas exportadas, ofertas recibidas, promociones); no calcula venta, margen ni efecto. | `FP.summary` | 102 | sí |

## js/quality  (6 archivos, 829 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `coverage.js` | coverage.js — Cobertura y resumen de calidad (Fase 1). Cobertura = qué tan completo está el dato, sin juzgar si es correcto. | `FP.coverage` | 187 | sí |
| `dataSources.js` | dataSources.js — Fase I · «Fuentes de datos»: qué fuentes existen, cuáles están activas, cuándo se cargó cada una por última vez, qué periodo cubre, qué tan frescos están los datos y qué calidad tienen. Solo lee lo ya guardado (lotes, cobertura y salud); no ca | `FP.dataSources` | 81 | **no** |
| `health.js` | health.js — Fase A · Data Health: un puntaje 0–100 por colección que SIEMPRE se puede desglosar. Cada componente dice cuánto vale, cuántos casos lo bajaron y por qué. El total es el promedio de los componentes que aplican | `FP.dataHealth` | 122 | **no** |
| `qualitySteps.js` | qualitySteps.js — Fase 3.2 · Calidad de datos paso a paso (lógica pura, sin DOM). Convierte lo que la pantalla de Calidad de datos YA calcula (cobertura, errores y cuarentena, salud, disponibilidad de análisis) en un recorrido de | `FP.qualitySteps` | 103 | sí |
| `rules.js` | rules.js — Fase A · motor de calidad: catálogo de reglas con acción, y cuarentena por celda. Cada tipo de incidencia que ya detecta validation.js (catálogo en config.errorTypes) recibe aquí su ACCIÓN: | `FP.qualityRules` | 146 | **no** |
| `validation.js` | validation.js — Reglas de calidad sobre registros canónicos (Fase 1). Estructura de un issue (ver ARCHITECTURE.md §10): | `FP.validation` | 190 | **no** |

## js/raíz  (2 archivos, 6522 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `app.js` | app.js — Orquestador. Dueño del estado de la aplicación. Flujo: acción del usuario → modifica `state` → persiste → render de la vista activa. | `FP.app`, `FP.cohereConnection` | 6478 | sí |
| `lazy.js` | lazy.js — Carga bajo demanda de módulos que no hacen falta para abrir la app (Fase A). index.html sigue siendo la única lista de archivos (ARCHITECTURE.md): un módulo diferido se declara allí como | `FP.lazy` | 44 | sí |

## js/report  (16 archivos, 2694 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `blocks.js` | blocks.js — Registro de constructores de bloques adicionales (Presentation Intelligence · Fase 3). FP.reportBuilder arma las páginas del reporte actual y NO se modifica. Los perfiles nuevos pueden pedir bloques que ese reporte no tiene | `FP.reportBlocks` | 56 | sí |
| `brand.js` | brand.js — Marca de la presentación (logo + colores). Una sola marca para toda la herramienta. - Puro y sin DOM salvo `readLogo` (canvas) y `applyStyle` (una hoja <style>): paleta, contraste y tonos se prueban con píxeles sueltos. | `FP.brand` | 165 | **no** |
| `catalog.js` | catalog.js — Catálogo de audiencias y tipos de presentación (Presentation Intelligence · Fase 2). Declara lo que la persona puede ELEGIR (audiencia → tipo → profundidad) y a qué perfil (FP.reportProfiles) corresponde cada combinación. | `FP.reportCatalog` | 53 | sí |
| `composer.js` | composer.js — Compositor determinista de presentaciones (Presentation Intelligence · Fase 1). Toma el reporte ya armado por FP.reportBuilder (las páginas con sus cifras, sellos y motivos de omisión) y un perfil (FP.reportProfiles) y devuelve | `FP.reportComposer` | 126 | sí |
| `contentModel.js` | contentModel.js — Modelo de contenido, hallazgos y contrato del reporte (Presentation Intelligence · Fase 1). FP.reportBuilder sigue siendo la ÚNICA fuente de cifras. Este módulo no calcula ni redacta nada nuevo: LEE las páginas ya armadas y las expone con | `FP.reportContent` | 111 | sí |
| `directivo.js` | directivo.js — Formato DIRECTIVO (Presentation Intelligence · Fase 6). Audiencia: dirección. Pregunta: «¿cómo va el canal digital, dónde está el riesgo y qué decisión toca?». Pocas láminas, una idea por lámina, casi sin tablas. | `FP.reportDirectivo` | 93 | sí |
| `escenarios.js` | escenarios.js — Escenarios de recuperación y anexos del formato (Presentation Intelligence · Fase 8). Tres bloques, sin fórmulas nuevas y sin tocar los motores: | `FP.reportScenarios` | 96 | sí |
| `gerencial.js` | gerencial.js — Formato GERENCIAL (Presentation Intelligence · Fase 4). Audiencia: gerentes y líderes de área. Pregunta: «¿cómo vamos contra la meta, qué nos separa de ella y qué decisión toca?». | `FP.reportGerencial` | 91 | sí |
| `operativo.js` | operativo.js — Formato OPERATIVO (Presentation Intelligence · Fase 3). Audiencia: analistas y coordinadores. Objetivo: entender el desempeño, encontrar desviaciones y definir acciones concretas. | `FP.reportOperativo` | 252 | sí |
| `oportunidades.js` | oportunidades.js — Economía de oportunidades y priorización (Presentation Intelligence · Fase 5). Bloque «opportunities» (Oportunidades priorizadas): une dos cosas que la herramienta YA calcula y las ordena por tamaño, sin inventar una calificación: | `FP.reportOpportunities` | 71 | sí |
| `presentationAI.js` | presentationAI.js — Hipótesis de IA para una lámina (Presentation Intelligence · Fase 7). OPCIONAL y APAGADA por defecto. La IA recibe SOLO el texto ya armado de la lámina (titular, preguntas, lectura, notas, cifras con su etiqueta) y propone hasta 3 hipótesis | `FP.presentationAI` | 95 | sí |
| `presentationPrefs.js` | presentationPrefs.js — Preferencias y ediciones de la presentación que se guardan en este navegador (Presentation Intelligence · Fase 7). Puro: valida y normaliza lo que se lee del almacenamiento y arma lo que se guarda. No toca el reporte, no calcula cifras y | `FP.reportPrefs` | 123 | sí |
| `profiles.js` | profiles.js — Perfiles de presentación (Presentation Intelligence · Fase 1). Un perfil describe, de forma DECLARATIVA, qué bloques de contenido (las páginas que arma FP.reportBuilder) puede llevar una presentación, | `FP.reportProfiles` | 108 | sí |
| `reportBuilder.js` | reportBuilder.js — Presentación ejecutiva (PDF). Arma el CONTENIDO de las páginas; no calcula nada nuevo ni dibuja. Recibe resultados que la app ya calculó (forecast, reforecast, diagnóstico, evolución, productos, clientes, proyección, calidad) | `FP.reportBuilder` | 965 | sí |
| `reportCopy.js` | reportCopy.js — Títulos de la presentación (PDF) generados a partir de las cifras de cada lámina. Solo texto de presentación: lee la salida de FP.reportBuilder.build y no calcula, ni cambia, ningún dato. | `FP.reportCopy` | 195 | sí |
| `voice.js` | voice.js — «Voz» de cada formato: titulares de las láminas reutilizadas escritos para su audiencia (Presentation Intelligence · endurecimiento). El reporte actual escribe un solo titular por lámina. Aquí cada formato puede decir lo mismo a su manera (Gerencial | `FP.reportVoice` | 94 | sí |

## js/scenarios  (3 archivos, 704 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `recoveryEngine.js` | recoveryEngine.js — ¿Qué tendría que cambiar para cerrar el gap? (Fase 6) Cálculo inverso sobre los días editables del alcance (canal o total), con I = gap × objetivo %: | `FP.recoveryEngine` | 231 | **no** |
| `scenarioEngine.js` | scenarioEngine.js — Motor de escenarios (Fase 6). Un escenario es una SIMULACIÓN determinística: aplica cambios a los drivers primarios y deriva | `FP.scenarioEngine` | 393 | **no** |
| `scenarioValidation.js` | scenarioValidation.js — Validación de escenarios (Fase 6). Errores (bloquean la simulación): NaN, Infinity, valores negativos, CR resultante > 100 % o < 0, | `FP.scenarioValidation` | 80 | **no** |

## js/storage  (5 archivos, 857 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `idb.js` | idb.js — Envoltura mínima de IndexedDB (Fase 8 · capa de almacenamiento). Sin dependencias. Funciona en GitHub Pages (https) y en file:// en Chromium. | `FP.idb` | 147 | **no** |
| `migration.js` | migration.js — Migración NO destructiva de localStorage → IndexedDB (Fase 8.1). localStorage (fuente) ─copia─▶ IndexedDB kv ─lectura directa─▶ verificación ─▶ estado 'verified' | `FP.storageMigration` | 98 | **no** |
| `repository.js` | repository.js — Capa de acceso a datos (Fase 8.1). UI / vistas | `FP.repository` | 225 | **no** |
| `storage-tests.js` | storage-tests.js — Pruebas asíncronas de almacenamiento (Fase 8.1). Corren en el navegador real (botón "Pruebas de almacenamiento" en Categoría → Producto), también en | `FP.storageTests` | 304 | **no** |
| `storage.js` | storage.js — Persistencia local con adaptadores intercambiables. Adaptadores disponibles: | `FP.storage` | 83 | **no** |

## js/ui  (82 archivos, 16794 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `action-plan-view.js` | action-plan-view.js — Recovery Center, parte de acciones (Fase 6). Catálogo de acciones posibles, plan de acción, líneas de acción con Cohere y seguimiento | `FP.actionPlanView` | 230 | **no** |
| `activation-view.js` | activation-view.js — columnas, parámetros y detalle de «Activación sugerida» dentro de Ofertas recibidas y Oportunidades. Solo pinta lo que calcula FP.activation; los cambios pasan por las acciones ac-* de app.js. La sugerencia es una regla con su | `FP.activationView` | 92 | **no** |
| `agent-panel.js` | agent-panel.js — Panel de asistentes (módulo diferido «agentes»; se carga al abrir el panel o al contar el botón). Un solo panel con selector de agente. Fase 2: Analista de Números (historia del periodo + ruta de comprensión) y Auditor de Conversión | `FP.agentPanel` | 428 | **no** |
| `bg-task.js` | bg-task.js — Indicador de «tarea en segundo plano» (Cuenta y nube: subir, restaurar, borrar). La operación ya sigue corriendo si cambias de pantalla (es red, no una pantalla); esto solo la hace visible desde cualquier vista: | `FP.bgTask` | 55 | **no** |
| `brand-view.js` | brand-view.js — «Marca de la presentación» (Configuración → Negocio). Solo pinta el borrador (state.brand) y una vista previa. La paleta sale del logo en el navegador; la persona elige color principal y acento. No calcula cifras de negocio. | `FP.brandView` | 78 | **no** |
| `business-view.js` | business-view.js — Business Setup (Fase 8.2). "¿Qué tipo de negocio estoy analizando y cómo funciona?" Solo pinta el borrador (state.bc.draft) y el contexto activo (FP.config.business). No calcula nada. | `FP.businessView` | 140 | **no** |
| `changes-view.js` | changes-view.js — «Qué cambió desde ayer» (Monitorear). Solo pinta lo que calcula FP.changeEngine con la corrida de forecast y lo que guarda FP.changeStore (estado de alertas, foto diaria). No explica causas: ordena lo que se movió y dice dónde mirar. | `FP.changesView` | 192 | **no** |
| `chart.js` | chart.js — Gráfico de líneas SVG compartido (Fase 4; lo usan Pacing & Forecast y Reforecast). Solo presentación: recibe series ya calculadas. Sin dependencias externas. | `FP.chart` | 89 | **no** |
| `chg-resumen.js` | chg-resumen.js — Reglas invisibles de «Qué cambió desde ayer»: qué frase del veredicto, qué chips de confiabilidad, qué filas del resumen general, qué línea de lectura de cada sección, qué acciones de «¿Qué hago hoy?» y qué líneas de la franja de Inicio se mue | `FP.chgResumen` | 84 | **no** |
| `cross-resumen.js` | cross-resumen.js — Reglas invisibles de «Cross-sell»: qué frase del veredicto, qué filas del resumen general y qué línea de lectura de cada sección se muestran. Descriptivo (qué se compra junto, no por qué). Umbrales en FP.config.products.crossSell (PROVISIONA | `FP.crossResumen` | 82 | **no** |
| `crosssell-view.js` | crosssell-view.js — «Cross-sell» (Crecer): qué productos se compran juntos. Versión B (clases px-, estilos en css/px.css y design-system.css). Solo pinta lo que calcula FP.basketEngine con el libro de pedidos (ID de pedido + líneas por producto) y las reglas d | `FP.crosssellView` | 187 | **no** |
| `cus-resumen.js` | cus-resumen.js — Reglas invisibles de «Clientes y LTV»: qué frase del veredicto, qué filas del resumen general y qué línea de lectura de cada sección se muestran. Todo es descriptivo (qué cambió, no por qué) y sale de lo que ya calculó FP.customerEngine. | `FP.cusResumen` | 227 | **no** |
| `customers-view.js` | customers-view.js — «Clientes y LTV» (Diagnosticar). Solo pinta lo que calcula FP.customerEngine con el libro de clientes que arma la carga de productos (ID de pedido + ID de cliente). El ID de cliente nunca sale de este navegador. | `FP.customersView` | 256 | **no** |
| `data-view.js` | data-view.js — Vista "Datos normalizados" (Fase 1). Explorador del modelo canónico, archivos importados y exportaciones. | `FP.dataView` | 182 | **no** |
| `diagnostic-view.js` | diagnostic-view.js — Vista "¿Por qué existe la brecha?" (Fase 5). Pinta `state.dx.run` (FP.diagnosticEngine) respetando la cadena | `FP.diagnosticView` | 466 | **no** |
| `dx-resumen.js` | dx-resumen.js — Reglas invisibles del Diagnóstico («¿Por qué?»): qué frase del veredicto, qué filas del resumen general, qué línea de lectura de cada sección y qué acciones de «¿Qué hago con esto?» se muestran. Descriptivo: solo repite lo que ya calculó FP.dia | `FP.dxResumen` | 157 | **no** |
| `filter-shell.js` | filter-shell.js — Contenedor único de filtros para todas las pantallas (escritorio y móvil). - Fila principal: lo básico siempre a la vista. | `FP.filterShell` | 33 | **no** |
| `forecast-view.js` | forecast-view.js — Vista "Pacing & Forecast", parte 2 (Fase 3). Índices de performance por ventana, comparación de métodos, alertas descriptivas, | `FP.forecastView` | 264 | **no** |
| `format.js` | format.js — Formato de presentación. Único lugar donde un número se vuelve texto. Cualquier valor inválido se muestra como "—" (nunca NaN / Infinity). | `FP.format` | 92 | **no** |
| `goals-view.js` | goals-view.js — panel «Metas por campaña» dentro de la pestaña Resumen de Promociones (propuesta B). Pinta lo que calcula FP.goals. La meta es una cifra que decide la persona; el avance suma la venta REAL durante las promociones de la campaña | `FP.goalsView` | 91 | **no** |
| `attention-view.js` | attention-view.js — «Qué necesita atención» y «Tu siguiente mejor paso» en Inicio (etapa 1 del rediseño). Presenta lo que decide FP.attentionEngine (que solo lee cálculos existentes). El progreso de la ruta (qué paso se abrió) es PERSONAL: | `FP.attentionView` | 330 | **no** |
| `contextEngine.js` | contextEngine.js — Motor de contexto y siguiente paso (Fase 7). Determinista y sin IA. NO calcula métricas de negocio: interpreta cifras que ya calcularon los | `FP.contextEngine` | 257 | **no** |
| `diagnostic-guide.js` | diagnostic-guide.js — "¿Por qué está pasando?" (Fase 7). Resumen orientado a preguntas sobre el diagnóstico ya calculado (Fase 5) y árbol visual | `FP.diagnosticGuide` | 66 | **no** |
| `explain.js` | explain.js — Trazabilidad pedagógica (Fase 9.1): "¿Por qué este número?" y "¿Qué significa?". Extiende el sistema de ayuda de Fase 7 (usa el mismo panel lateral de FP.help). No calcula nada nuevo: | `FP.explain` | 250 | **no** |
| `help-view.js` | help-view.js — «¿Cómo funciona RevNavigator?» · Centro de aprendizaje básico (Fase 9.x). Solo presentación. Todo el contenido sale de guidanceConfig (HOW_IT_WORKS, READ_DIAGNOSIS, STATES, HELP, | `FP.helpView` | 200 | **no** |
| `help.js` | help.js — Sistema de ayuda reutilizable (Fase 7). Un solo componente para: ícono de ayuda, panel lateral (drawer), glosario con búsqueda, | `FP.help` | 224 | **no** |
| `home-resumen.js` | home-resumen.js — Reglas invisibles de Inicio: qué frase del veredicto, qué chips de confiabilidad, qué cifras visibles y qué filas del resumen general se muestran. Descriptivo: solo repite lo que ya calcularon Pacing/Forecast (cumplimiento, brecha, forecast), | `FP.homeResumen` | 89 | **no** |
| `home-summary-view.js` | home-summary-view.js — Resumen general de Inicio: 4 bloques debajo de «¿Qué está pasando?». Solo presenta lo que calcula homeSummaryEngine; las tarjetas de «¿Qué está pasando?» no se tocan. | `FP.homeSummaryView` | 247 | **no** |
| `home-view.js` | home-view.js — Inicio / Overview (Fase 7). Centro de control: lee lo que ya calcularon forecast (Fase 3) y reforecast (Fase 4) para el canal | `FP.homeView` | 237 | **no** |
| `measure-view.js` | measure-view.js — Medir y aprender (Fase 7). Vista global (todos los canales y periodos) de acciones, mediciones, cadena trazable y aprendizajes. | `FP.measureView` | 120 | **no** |
| `navigation.js` | navigation.js — Navegación agrupada, migas, barra de contexto y filtros persistentes (Fase 7). Grupos: Inicio · Planear · Monitorear · Diagnosticar · Recuperar · Medir y aprender (+ Ayuda). | `FP.navigation` | 448 | **no** |
| `tour.js` | tour.js — Recorrido guiado interactivo (Fase 7 → Fase 10). Histórico → real → meta → plan → pacing → forecast → gap → drivers → señales → hipótesis → recovery → escenario → acción → medición. | `FP.tour` | 273 | **no** |
| `traceability.js` | traceability.js — Cadena trazable de una acción (Fase 7). Solo lectura: arma los nodos plan → forecast → gap → driver → señal → hipótesis → escenario → | `FP.traceability` | 49 | sí |
| `why-hub.js` | why-hub.js — Entrada única «¿Por qué?» (Fase 4 del plan de simplificación). Solo navegación: no calcula nada. Una franja con las formas de investigar una brecha; la vista actual aparece marcada. Se pinta arriba de Diagnóstico, | `FP.whyHub` | 31 | **no** |
| `guide-view.js` | guide-view.js — barra «Ahora haz esto» (arriba de las pestañas de Promociones) y resumen con acciones de un clic en Ofertas recibidas y en Oportunidades. Solo pinta lo que calcula FP.guide; los cambios pasan por las acciones gd-* de app.js | `FP.guideView` | 195 | **no** |
| `import-view.js` | import-view.js — Vista "Carga de datos" (Fase 1). Solo pinta. Lee `state.settings`, `state.staging`, `state.store`. | `FP.importView` | 429 | **no** |
| `loader.js` | loader.js — compatibilidad: el loader general de las vistas de análisis usa ahora el mismo componente homologado (FP.ui.loader). Estas esperas son cálculos de una sola pieza que no reportan avance real. Para no inventar un porcentaje: | `FP.loader` | 41 | **no** |
| `narrative-view.js` | narrative-view.js — Narrativa ejecutiva (Fase 9.2). Solo pinta: todo el contenido viene ya calculado de FP.narrativeEngine.build() (ver ensureNarrative() | `FP.narrativeView` | 292 | **no** |
| `offer-view.js` | offer-view.js — pestaña «Ofertas recibidas» dentro de Promociones (propuesta B, fase 1B). Solo pinta lo que guarda FP.offers; los cambios pasan por las acciones of-* de app.js. No calcula venta ni efecto. | `FP.offerView` | 240 | **no** |
| `opportunity-view.js` | opportunity-view.js — pestaña «Oportunidades» dentro de Promociones (propuesta B, etapa PRE). Pinta el resultado de FP.opportunities (calculado en app.js sobre la comparación por SKU). No calcula venta ni efecto. | `FP.opportunityView` | 317 | **no** |
| `pacing-view.js` | pacing-view.js — Vista "Pacing & Forecast", parte 1 (Fase 3). Controles, tablero ejecutivo (total y canales), tendencia acumulada, tablas mensual / | `FP.pacingView` | 455 | **no** |
| `package-view.js` | package-view.js — Fase 10 · Paquete de análisis. Lista los 7 exports con su estado (con datos / viajaría vacío y qué falta) y descarga el .zip. No calcula nada propio: | `FP.packageView` | 65 | **no** |
| `pc-resumen.js` | pc-resumen.js — Reglas invisibles de «Pacing & Forecast» (Monitorear): la frase del veredicto, las etiquetas de confiabilidad, las filas del resumen general, la línea de lectura de cada sección y las acciones de «¿Qué hago con esto?». Descriptivo: solo repite  | `FP.pcResumen` | 149 | **no** |
| `planning-config-view.js` | planning-config-view.js — Vista "Configuración de planeación" (Fase 2). Edita `planningSettings` (valores por defecto en config.planning) y muestra la comparación de métodos. | `FP.planningConfigView` | 95 | **no** |
| `planning-view.js` | planning-view.js — Vista "Plan" (Fase 2). Pinta el plan activo (vista previa o versión guardada). No calcula distribución. | `FP.planningView` | 283 | **no** |
| `prodevol-context.js` | prodevol-context.js — Producto y evolución · lo que conecta la página con otros módulos: · contexto de época (¿es normal para esta época?, contra el año anterior, movimientos inusuales), | `FP.prodevolContext` | 164 | sí |
| `prodevol-view.js` | prodevol-view.js — «Producto y evolución». La página la dibuja FP.pxView (versión B, css/px.css) y su ficha FP.pxFicha; aquí quedan el punto de entrada (render), el aviso de «sin historia suficiente», el salto a un capítulo al llegar desde #producto o #analisi | `FP.prodevolView` | 49 | **no** |
| `product-filter.js` | product-filter.js — Selección en cascada (categoría → subcategoría → producto; estado → ciudad → sucursal; tipo de entrega) que se combina con el canal. Solo arma opciones con el catálogo y la geografía ya cargados; el filtrado lo hace productStore. | `FP.productFilter` | 72 | **no** |
| `product-view.js` | product-view.js — Vista "Categoría → Producto" y revisión de archivos de productos (Fase 8.1). Solo pinta. Los datos vienen de FP.productStore / FP.productAnalysis (IndexedDB) y del estado `state.pa`. | `FP.productView` | 401 | **no** |
| `progress-loader.js` | Loader homologado de RevNavigator: mismo aspecto, textos y accesibilidad en toda espera larga (carga de archivos, validación y guardado de productos, evolución histórica, nube). | `FP.ui` | 70 | **no** |
| `projection-view.js` | projection-view.js — «Proyección del año siguiente» (Planear). Pinta FP.projection.build(); no calcula nada propio. Tarjetas con encabezado como Diagnóstico, Pacing y Tráfico y conversión. | `FP.projectionView` | 187 | **no** |
| `promotion-view.js` | promotion-view.js — «Promociones» (Recuperar). Registro, aprobación, ejecución e historial de promociones (propuesta B, fase 1). Solo pinta lo que guarda FP.promotions; los cambios pasan por las acciones de app.js. No muestra venta ni resultados: | `FP.promotionView` | 221 | **no** |
| `px-ficha.js` | px-ficha.js — la ficha de una fila en el panel lateral de «Producto y evolución» (versión B). Historia, venta por periodo con proyección, detalle temporal con clientes, datos de la ficha y detalle y trazabilidad, | `FP.pxFicha` | 145 | **no** |
| `px-resumen.js` | px-resumen.js — Resumen general de la ficha de «Producto y evolución». Reglas invisibles: cada fila y cada causa se dibuja solo si sus datos la justifican; lo que no aplica no se menciona. | `FP.pxResumen` | 221 | **no** |
| `px-view.js` | px-view.js — «Producto y evolución», versión B (maqueta aprobada «maqueta_v3_confianza»). Una sola página para tres lectores: veredicto y atención arriba, cinco preguntas debajo y el método cerrado al final. | `FP.pxView` | 527 | **no** |
| `quality-view.js` | quality-view.js — Vista "Calidad de datos" (Fase 1). Pinta el resumen de FP.coverage.summarize(); no calcula nada propio. | `FP.qualityView`, `FP.qualityViewLines` | 600 | **no** |
| `recovery-center.js` | recovery-center.js — Recovery Center (Fase 6): contexto, brecha, drivers, hipótesis, árbol de trazabilidad (brecha → … → resultado observado), importación de exports y exportación. | `FP.recoveryCenter` | 209 | **no** |
| `reforecast-view.js` | reforecast-view.js — Vista "Recovery & Reforecast" (Fase 4). Solo pinta `state.rf.run` (FP.reforecastEngine). Separa siempre plan, forecast y reforecast. | `FP.reforecastView` | 473 | **no** |
| `replace-view.js` | replace-view.js — «Reemplazar un archivo ya cargado»: candidatos, comparación y bloque de la revisión. Usa FP.replacePlan (puro). item.replace = { batchId: id/null, confirmed: bool }. | `FP.replaceView` | 124 | **no** |
| `report-directivo-view.js` | report-directivo-view.js — Dibujo de las láminas del formato Directivo (Presentation Intelligence · Fase 6). Solo presenta lo que construyó FP.reportDirectivo; no calcula nada. Colores y tamaños salen de css/report.css. | — | 29 | sí |
| `report-escenarios-view.js` | report-escenarios-view.js — Dibujo de la lámina de Escenarios y de los anexos «Reglas y umbrales» y «Ediciones e IA» (Presentation Intelligence · Fase 8). Solo presenta lo que construyó FP.reportScenarios (y las ediciones vigentes de la persona); no calcula na | — | 49 | sí |
| `report-gerencial-view.js` | report-gerencial-view.js — Dibujo de las láminas del formato Gerencial (Presentation Intelligence · Fase 4). Solo presenta lo que ya construyó FP.reportGerencial; no calcula nada. Los colores salen de css/report.css. | — | 25 | sí |
| `report-operativo-view.js` | report-operativo-view.js — Dibujo de las láminas del formato Operativo (Presentation Intelligence · Fase 3). Solo presenta lo que ya construyó FP.reportOperativo (cifras, titulares y notas); no calcula nada. Registra en FP.reportView el cuerpo de cada | — | 92 | sí |
| `report-oportunidades-view.js` | report-oportunidades-view.js — Dibujo de la lámina «Oportunidades priorizadas» (Presentation Intelligence · Fase 5). Solo presenta lo que construyó FP.reportOpportunities; no calcula nada. | — | 22 | sí |
| `report-setup-view.js` | report-setup-view.js — Configuración y propuesta de la presentación (Presentation Intelligence · Fase 2). Pinta los pasos 1 a 3 (audiencia, tipo de presentación y profundidad) y el paso 5 (propuesta del compositor: láminas con su motivo, lo no incluido | `FP.reportSetupView` | 89 | sí |
| `report-view.js` | report-view.js — Presentación (PDF): pinta las páginas que arma FP.reportBuilder y las imprime a PDF con el navegador. Solo presenta: no calcula nada (cada cifra llega ya calculada y etiquetada). Sin librerías ni servicios externos: | `FP.reportView` | 695 | sí |
| `responsive-tables.js` | Tablas en tarjetas (móvil). Marca las tablas angostas en filas y con pocas filas como «tarjetas» y copia el título de cada columna a cada celda (data-label); el CSS (≤ 860 px) hace el resto. No cambia datos ni cálculos y en escritorio no tiene efecto. | `FP.responsiveTables` | 53 | **no** |
| `results-view.js` | results-view.js — pestaña «Resultados e historial» dentro de Promociones (propuesta B, etapa POST). Pinta la evaluación que calcula FP.promotionEvaluation (en app.js) y el historial consultable de promociones. | `FP.resultsView` | 203 | **no** |
| `rf-resumen.js` | rf-resumen.js — Reglas invisibles de «Recovery & Reforecast»: qué frase del veredicto, qué chips de confiabilidad, qué filas del resumen general, qué línea de lectura de cada sección y qué acciones de «¿Qué hago con esto?» se muestran. Descriptivo: solo repite | `FP.rfResumen` | 118 | **no** |
| `scenario-view.js` | scenario-view.js — Recovery Center, parte de escenarios (Fase 6). Simulador (Nivel 1 y segmentos), "¿qué tendría que cambiar?", escenarios guardados, | `FP.scenarioView` | 255 | **no** |
| `search.js` | search.js — Búsqueda global (MVP): secciones («Ir a»), acciones y conceptos del glosario. NO busca dentro de los datos. - Atajo Ctrl/Cmd+K o «/»; campo de la barra superior y botón 🔍 (móvil) abren la misma paleta. | `FP.search` | 122 | sí |
| `seasonality-view.js` | seasonality-view.js — Vista "Estacionalidad" (Fase 2). Pinta los perfiles de FP.seasonality (ya calculados por app.js). No calcula pesos. | `FP.seasonalityView` | 135 | **no** |
| `segmentInsights.js` | segmentInsights.js — «Tráfico y conversión», parte 1 de descubrimiento (en orden de valor): 1) hallazgos en frases, 2) mapa tráfico × CR (cuadrantes), 3) oportunidad estimada en pesos, 4) rankings con umbral. | `FP.segmentInsights` | 140 | **no** |
| `segments-decomp-view.js` | segments-decomp-view.js — «Tráfico y conversión»: tarjeta «Qué explica el cambio de la venta» (titular, cascada tráfico → conversión → ticket, hallazgos en frases, mezcla del CR y tabla de efectos por segmento) y resumen de todas las dimensiones. | `FP.segmentsDecompView` | 200 | **no** |
| `segments-view.js` | segments-view.js — Fase 11 · pieza 2: «Tráfico y conversión» por segmento. Lee el archivo de Segmentos que ya acepta Carga de datos (fecha, canal, dimensión, segmento, venta, pedidos, tráfico y clientes) | `FP.segmentsView` | 408 | **no** |
| `settings-view.js` | settings-view.js — Configuración de RevNavigator. Reúne en un solo lugar lo que se configura una vez y vale para toda la app: | `FP.settingsView` | 315 | sí |
| `startup-assumptions-view.js` | startup-assumptions-view.js — «Supuestos de arranque» (Fase 14). Guía para planear cuando faltan histórico o venta real: forma estándar del año (día de semana y eventos), | `FP.startupAssumptionsView` | 224 | **no** |
| `summary-view.js` | summary-view.js — pestaña «Resumen» de Promociones: embudo, tabla agrupada, pendientes y propuestas exportadas. Solo pinta lo que calcula FP.summary; los cambios pasan por las acciones sm-* de app.js. | `FP.summaryView` | 80 | **no** |
| `threshold-view.js` | threshold-view.js — Caja «Sugerencia de umbrales según tu historial» (Forecast y la sensibilidad de la presentación). Solo presenta lo que calculó FP.thresholdAdvisor (guardado en state.th) y ofrece dos botones: recalcular y aplicar. Nunca aplica nada sola. | `FP.thresholdView` | 41 | sí |
| `tr-resumen.js` | tr-resumen.js — Reglas invisibles de «Tráfico y conversión»: qué frase del veredicto, qué chips de confiabilidad, qué filas del resumen general, qué línea de lectura de cada sección y qué acciones de «¿Qué hago con esto?» se muestran. Descriptivo: lee lo que y | `FP.trResumen` | 126 | **no** |
| `trend-view.js` | trend-view.js — Análisis → Evolución (Análisis 1). Solo presenta resultados de FP.trendEngine. | `FP.trendView` | 631 | sí |
| `ui.js` | ui.js — Render de la interfaz. Solo lee estado y pinta HTML. No calcula métricas (usa FP.metrics / FP.dataModel) ni guarda datos (usa app.js). | `FP.ui` | 472 | **no** |

## js/workers  (2 archivos, 179 líneas)

| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |
|---|---|---|---|---|
| `import-worker.js` | import-worker.js — lectura, traducción y validación de archivos CSV grandes FUERA del hilo de la página. Con un export de GA4 de 90 MB y 300 mil líneas, hacerlo en la página congelaba RevNavigator ~12 s (traducir 7 s, volver a leer el CSV | — | 149 | **no** |
| `selftest-worker.js` | selftest-worker.js — Ejecuta las pruebas del motor (FP.selfTest) en segundo plano (Fase A). Las pruebas tardan segundos; en el hilo principal congelarían la pantalla. Aquí corren aisladas: este Worker tiene su propia copia | — | 30 | sí |

## Mapa archivo de interfaz → familias de motores que consume

Generado leyendo las referencias `FP.<módulo>` de cada archivo de `js/ui/` y asignándolas a la carpeta que las define. Una referencia indica dependencia, no necesariamente cálculo propio.

| Archivo de interfaz | Familias de motores | Módulos más usados |
|---|---|---|
| `action-plan-view.js` | actions, scenarios | `actionPlan`, `actionLibrary`, `actionTracking`, `scenarioEngine` |
| `activation-view.js` | promotions | `activation` |
| `agent-panel.js` | agents, ai | `agents`, `agentLauncher`, `cohereAnalysisAssistant` |
| `brand-view.js` | report | `brand` |
| `changes-view.js` | analytics, cloud, data | `changeEngine`, `changeStore`, `dataModel` |
| `chart.js` | calculations | `metrics` |
| `chg-resumen.js` | analytics, cloud | `changeEngine`, `changeStore` |
| `cross-resumen.js` | data | `dataModel` |
| `crosssell-view.js` | analytics, data, products | `basketEngine`, `dataModel`, `customerStore` |
| `cus-resumen.js` | analytics, data | `customerEngine`, `dataModel` |
| `customers-view.js` | analytics, data, products | `customerStore`, `customerEngine`, `dataModel`, `productStore` |
| `data-view.js` | data, products | `dataStore`, `dataModel`, `productStore` |
| `diagnostic-view.js` | ai, calculations, diagnostics, model, products | `productStore`, `availability`, `cohereProxy`, `diagnosticEngine` |
| `dx-resumen.js` | diagnostics | `diagnosticEngine` |
| `forecast-view.js` | calculations, forecast | `methodAdvisor`, `forecastVersioning`, `metrics`, `forecastEngine` |
| `format.js` | calculations | `metrics` |
| `goals-view.js` | promotions | `goals` |
| `guidance/attention-view.js` | analytics, data, products | `attentionEngine`, `productStore`, `dataStore` |
| `guidance/contextEngine.js` | forecast | `planning` |
| `guidance/explain.js` | calculations, data | `metrics`, `dataModel` |
| `guidance/home-resumen.js` | analytics | `homeSummaryEngine`, `attentionEngine` |
| `guidance/home-summary-view.js` | analytics, calculations | `gap`, `homeSummaryEngine` |
| `guidance/home-view.js` | agents, calculations, data, promotions | `agentLauncher`, `guide`, `gap`, `dataStore` |
| `guidance/measure-view.js` | actions | `actionTracking`, `actionPlan` |
| `guidance/navigation.js` | analytics, data, products | `temporalEngine`, `productStore`, `dataModel` |
| `guidance/tour.js` | calculations, forecast | `seasonality`, `planning` |
| `guide-view.js` | promotions | `guide`, `promotions`, `requests`, `activation` |
| `import-view.js` | data, import, model, products | `importer`, `productStore`, `mockCsv`, `dataStore` |
| `narrative-view.js` | data, narrative | `narrativeEngine`, `dataModel` |
| `offer-view.js` | promotions | `promotionNotes`, `offers`, `activation`, `exposures` |
| `opportunity-view.js` | data, export, products, promotions | `offers`, `productStore`, `opportunities`, `requests` |
| `pacing-view.js` | calculations, data, forecast | `forecastEngine`, `gap`, `dataModel`, `metrics` |
| `package-view.js` | export | `analysisPackage` |
| `pc-resumen.js` | calculations, data, forecast | `forecastEngine`, `forecastConfidence`, `dataModel`, `gap` |
| `planning-config-view.js` | calculations | `seasonality` |
| `planning-view.js` | calculations, data, forecast | `metrics`, `planning`, `dataModel`, `distribution` |
| `prodevol-context.js` | analytics, products, promotions | `opportunities`, `promotions`, `productStore`, `funnelEngine` |
| `prodevol-view.js` | analytics | `funnelEngine`, `trendEngine` |
| `product-filter.js` | products | `productStore` |
| `product-view.js` | analytics, data, products, quality | `productStore`, `dataHealth`, `dataModel`, `temporalEngine` |
| `projection-view.js` | projection | `projection`, `projectionCalibration` |
| `promotion-view.js` | data, promotions | `promotionEvaluation`, `promotions`, `goals`, `dataModel` |
| `px-ficha.js` | analytics | `analysisContext` |
| `px-resumen.js` | analytics, data | `trafficConversionEngine`, `dataStore` |
| `px-view.js` | analytics, products | `productStore`, `analysisContext`, `funnelEngine` |
| `quality-view.js` | calculations, data, forecast, model, quality | `qualityRules`, `dataStore`, `dataModel`, `qualitySteps` |
| `recovery-center.js` | actions, scenarios | `scenarioEngine`, `actionTracking` |
| `reforecast-view.js` | forecast | `reforecastEngine`, `reforecastVersioning` |
| `replace-view.js` | data, import | `replacePlan`, `importer` |
| `report-directivo-view.js` | report | `reportDirectivo`, `reportBuilder`, `reportGerencial` |
| `report-escenarios-view.js` | report | `reportScenarios`, `reportBuilder` |
| `report-gerencial-view.js` | report | `reportGerencial`, `reportBuilder` |
| `report-operativo-view.js` | report | `reportOperativo`, `reportBuilder` |
| `report-oportunidades-view.js` | report | `reportOpportunities`, `reportBuilder` |
| `report-setup-view.js` | report | `reportCatalog`, `reportProfiles`, `reportPrefs`, `reportComposer` |
| `report-view.js` | products, report | `brand`, `reportCopy`, `reportComposer`, `reportBuilder` |
| `results-view.js` | products, promotions | `productStore`, `offers`, `goals`, `promotionEvaluation` |
| `rf-resumen.js` | forecast | `reforecastEngine`, `reforecastVersioning` |
| `scenario-view.js` | scenarios | `scenarioEngine`, `recoveryEngine` |
| `search.js` | data, products | `productStore`, `dataModel` |
| `seasonality-view.js` | calculations, data, forecast | `seasonality`, `weights`, `dataModel`, `planning` |
| `segments-decomp-view.js` | analytics | `trafficConversionEngine` |
| `segments-view.js` | analytics, data, products | `dataModel`, `dataStore`, `trafficConversionEngine`, `productAnalysis` |
| `settings-view.js` | ai, data, import, products, quality | `cohereProxy`, `dataSources`, `aliases`, `aiAudit` |
| `startup-assumptions-view.js` | calculations, data, forecast | `planning`, `dataStore`, `seasonality` |
| `summary-view.js` | promotions | `summary`, `demo` |
| `threshold-view.js` | forecast, report | `thresholdAdvisor`, `reportPrefs` |
| `tr-resumen.js` | analytics | `trafficConversionEngine` |
| `trend-view.js` | analytics, products | `trendStoryEngine`, `analysisContext`, `trendEngine`, `trendForecastEngine` |
| `ui.js` | calculations, data, export, forecast, import, quality | `targetAssistant`, `metrics`, `dataModel`, `coverage` |
