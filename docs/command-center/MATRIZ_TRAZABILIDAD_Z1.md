# Matriz de trazabilidad de Z1 — Lectura ejecutiva (Subfase 3.2)

Generada desde `generated/MATRIZ_TRAZABILIDAD_Z1.json` con `python3 tools/audit/matriz_z1_md.py` (no editar a mano). Conecta cada requisito de Z1 con la decisión que lo origina (D-01 a D-06), su componente visual en el wireframe (`wireframes/z1_3_2_wireframe.html`, atributo `data-wf`), la fuente de datos, el motor o contrato responsable, su estado, la evidencia y la dependencia pendiente. Las filas M-xx remiten a la matriz de 3.1.

**No se presenta como disponible nada que solo esté propuesto en el diseño.** Las brechas se documentan como dependencias futuras; no se implementan.

## Estados
- **Disponible**: El motor existe y entrega lo necesario; solo falta presentarlo según este diseño.
- **Parcial**: El motor o parte de él existe, pero falta una pieza (regla, etiqueta, estado, conexión al Home) para cumplir este diseño.
- **Por desarrollar**: No existe en js/. Es solo diseño propuesto o especificación; su implementación es una dependencia futura.

## Categorías de dependencia (Fase 4 y Fase 5)
- **contratos_existentes**: Resoluble con contratos y motores existentes: solo falta conectar y presentar.
- **completar_motores**: Requiere completar o ampliar un motor (Fase 4) antes de poder mostrarse.
- **requiere_ia**: Requiere inteligencia artificial (Fase 5) para su versión final; existe una versión determinista de respaldo.
- **validacion_produccion**: Requiere validación con datos y usuarios de producción (umbrales y supuestos de la especificación).

## Matriz

| Id | Requisito | Decisión relacionada | Componente visual | Fuente de datos | Motor o contrato | Estado | Evidencia | Dependencia pendiente |
|---|---|---|---|---|---|---|---|---|
| Z1-01 | Emitir uno de los 6 estados solo si la confiabilidad lo permite | D-03, D-05 | Chip de estado (cabecera) (`z1-estado`) | Cumplimiento, cierre proyectado, evolución vs comparable y hallazgos activos | classifyBusinessState (especificación de Fase 2: tools/audit/command-center-contracts.js): _especificación:_ `tools/audit/command-center-contracts.js · classifyBusinessState` | **Por desarrollar** | Prueba tools/test-fase3-2-z1.js (escenarios, invariantes, mutaciones) y verificador de consistencia 3.2 | completar_motores (4.2): Conectar classifyBusinessState a un motor de diagnósticos |
| Z1-02 | Declarar siempre la confiabilidad (Alta, Media, Baja, Insuficiente) con su motivo | D-03, D-05 | Chip de confiabilidad (cabecera) (`z1-confiabilidad`) | Respaldo del motor de atención (cobertura de días y calidad), confianza de datos, preparación de datos y hallazgos que bloquean | attentionEngine.support, homeSummaryEngine.trust, contextEngine.dataReadiness: `FP.attentionEngine.evaluate`, `FP.homeSummaryEngine.trust`, `FP.contextEngine.dataReadiness` | **Parcial** | Prueba batch_fase3_2_z1_wireframe: las rutas FP.* existen en la aplicación | completar_motores (4.2): Unificar attentionEngine, homeSummaryEngine y contextEngine en un solo nivel; validacion_produccion (4.2): Validar con datos reales el umbral de cobertura del 60 % |
| Z1-03 | Rotular periodo, día de corte y base de comparación | D-04 | Chip de periodo (cabecera) (`z1-periodo`) | Periodo y fecha de corte, días contados, rango del comparable | homeView.periodFigures, homeSummaryEngine.why (rangos y cobertura), navigation.contextLabel: `FP.homeView.periodFigures`, `FP.homeSummaryEngine.why`, `FP.navigation.contextLabel` | **Parcial** | Prueba batch_fase3_2_z1_wireframe: las rutas FP.* existen en la aplicación | contratos_existentes (4.1): Rótulos ya disponibles en el contexto |
| Z1-04 | Etiquetar la comparabilidad con 7 estados visibles | D-04, D-06 | Chip de periodo y celda de evolución (`z1-periodo`) | Estados de attributeSegment agrupados: válida, sin base comparable, recuperación desde cero, cambio de composición, datos insuficientes, sin actividad, no calculable | attributeSegment (ATRIBUCION_FUENTE_DE_VERDAD.md) vía homeSummaryEngine.why: `FP.attribution.attributeSegment`, `FP.homeSummaryEngine.why` | **Parcial** | Prueba batch_fase3_2_z1_wireframe: las rutas FP.* existen en la aplicación | contratos_existentes (4.3): Mapear los 9 estados de attribution a las 7 etiquetas visibles |
| Z1-05 | Veredicto sin importes ni cifras de las tarjetas, condicionado por la confiabilidad | D-03 | Titular (veredicto) (`z1-veredicto`) | Estado, cumplimiento, cierre proyectado, evolución (si es válida) y confiabilidad | homeResumen.build (veredicto actual) + regla de contundencia (por construir): `FP.homeResumen.build`, `FP.homeSummaryEngine.compute` | **Parcial** | Prueba batch_fase3_2_z1_wireframe: las rutas FP.* existen en la aplicación | completar_motores (4.2): Generar el veredicto desde los motores; requiere_ia (5.2): Versión narrativa con IA (opcional) |
| Z1-06 | Narrativa corta sin cifras, ≤ 2 frases | D-03 | Párrafo bajo el veredicto (`z1-narr-corta`) | Evolución, base de la lectura y estado de la comparación | homeResumen.build (filas en versión corta): `FP.homeResumen.build` | **Parcial** | Prueba batch_fase3_2_z1_wireframe: las rutas FP.* existen en la aplicación | contratos_existentes (4.2): Versión determinista disponible; requiere_ia (5.2): Versión con IA (opcional) |
| Z1-07 | Mostrar la brecha como cifra protagonista solo con brecha válida | D-01 | Bloque económico (cifra grande) (`z1-economico`) | gap.js: real − plan en los mismos días contados | gap.js / pacing (toDate.revenue.gap): `FP.gap.pacingStatus`, `FP.homeView.periodFigures` | **Disponible** | Prueba batch_fase3_2_z1_wireframe: las rutas FP.* existen en la aplicación | Ninguna |
| Z1-08 | Mostrar la venta observada en el subtexto de la brecha | D-01 | Subtexto del bloque económico (`z1-economico`) | gap.js: venta real a la fecha y cumplimiento | gap.js / pacing: `FP.gap.pacingStatus`, `FP.homeView.periodFigures` | **Disponible** | Prueba batch_fase3_2_z1_wireframe: las rutas FP.* existen en la aplicación | Ninguna |
| Z1-09 | Indicar la dirección contra el plan solo con brecha válida | D-01, D-03 | Titular y bloque económico (`z1-economico`) | Signo de la brecha y bandas de cumplimiento (≥ 1.01 arriba, ≥ 0.99 en plan) | gap.pacingStatus (etiqueta de ritmo): `FP.gap.pacingStatus` | **Disponible** | Prueba batch_fase3_2_z1_wireframe: las rutas FP.* existen en la aplicación | Ninguna |
| Z1-10 | Mostrar el cierre proyectado con Alta o Media y brecha válida | D-01 | Celda «Cierre proyectado» (`z1-cierre`) | forecastEngine: forecast del periodo y forecastGap | forecastEngine.runForecast: `FP.forecastEngine.runForecast` | **Disponible** | Prueba batch_fase3_2_z1_wireframe: las rutas FP.* existen en la aplicación | Ninguna |
| Z1-11 | Mostrar la evolución solo con comparación válida y confiabilidad suficiente | D-04 | Celda «Evolución vs comparable» (`z1-evolucion`) | homeSummaryEngine.why (actual vs periodo anterior) y temporalEngine | homeSummaryEngine.why, temporalEngine: `FP.homeSummaryEngine.why`, `FP.temporalEngine` | **Parcial** | Prueba batch_fase3_2_z1_wireframe: las rutas FP.* existen en la aplicación | completar_motores (4.3): Entregar la comparación en una estructura única con venta comparable |
| Z1-12 | Mostrar la contribución solo como detalle, estimada con margen promedio general, sobre la brecha válida; distinguir margen no configurado, desactivado, no válido (según la validación del motor) y 0 % sin confirmar; un 0 % explícito es válido y da $0 estimado | D-02, C4, C5 | Celda «Contribución» (detalle) (`z1-contribucion`) | FP.economics.contributionOf sobre el impacto en ventas, con settings.economics | FP.economics (modelo económico dual de Fase 2): `FP.economics.contributionOf`, `FP.economics.availability` | **Parcial** | Prueba batch_fase3_2_z1_wireframe: las rutas FP.* existen en la aplicación | contratos_existentes (4.5): Contribución con margen promedio general y validación del margen ya existen (FP.economics); completar_motores (4.5): Margen por canal, producto o pedido: hoy solo existe el promedio general; Z1 no lo inventa; validacion_produccion (4.5): Validar con finanzas el margen promedio, su granularidad y si debe admitirse un margen bruto negativo (el contrato aceptado de Fase 2 lo rechaza) |
| Z1-13 | Mostrar motivos visibles cuando la confiabilidad no es Alta | D-05 | Banda de condición (`z1-condicion`) | support.why del motor de atención, avisos de calidad, cobertura y bloqueos | attentionEngine.support, homeSummaryEngine.trust: `FP.attentionEngine.evaluate`, `FP.homeSummaryEngine.trust` | **Parcial** | Prueba batch_fase3_2_z1_wireframe: las rutas FP.* existen en la aplicación | contratos_existentes (4.2): Motivos ya disponibles en los motores |
| Z1-14 | Aplicar topes (conversión cero y cambio de composición no son Alta) y bloqueo duro (sin actividad) | D-04, D-05 | Banda de condición (`z1-condicion`) | Estados de atribución sin_actividad, conversion_cero_actual y cambio_de_composicion | Regla de diseño propuesta (no existe): _especificación:_ `tools/audit/z1-lectura-ejecutiva.js · reliability (propuesta)` | **Por desarrollar** | Prueba tools/test-fase3-2-z1.js (escenarios, invariantes, mutaciones) y verificador de consistencia 3.2 | completar_motores (4.2): Implementar topes y bloqueos en el motor; validacion_produccion (4.2): Validar con datos reales el umbral de actividad mínima observable |
| Z1-15 | Condicionar la contundencia del veredicto por la confiabilidad | D-03 | Titular (veredicto) (`z1-veredicto`) | Nivel de confiabilidad y estado de comparabilidad | Regla de diseño propuesta (no existe): _especificación:_ `tools/audit/z1-lectura-ejecutiva.js · build` | **Por desarrollar** | Prueba tools/test-fase3-2-z1.js (escenarios, invariantes, mutaciones) y verificador de consistencia 3.2 | completar_motores (4.2): Aplicar la regla en el motor; requiere_ia (5.5): Verificar con IA la consistencia |
| Z1-16 | Narrativa ampliada en cuatro capas separadas | D-03 | Panel «Ver contexto» (`z1-narr-larga`) | Las mismas cifras de Z1 y los motivos de confiabilidad | homeResumen.build (filas en versión larga; sin las cuatro capas): `FP.homeResumen.build` | **Parcial** | Prueba batch_fase3_2_z1_wireframe: las rutas FP.* existen en la aplicación | requiere_ia (5.2): Versión con IA (opcional) |
| Z1-17 | Etiquetar la certeza de las cifras (hecho, cálculo, estimación) | D-03 | Subtextos de las celdas (`z1-cierre`) | Escalera de certeza de Fase 2 | narrativeEngine.LEVELS (6 niveles; falta «estimación»): `FP.narrativeEngine.LEVELS` | **Parcial** | Prueba batch_fase3_2_z1_wireframe: las rutas FP.* existen en la aplicación | contratos_existentes (5.5): Niveles de certeza existentes |
| Z1-18 | Derivar el detalle a Z2–Z5 | D-05 | Enlaces «Ver contexto» (`escenarios`) | Botón de evidencia y acciones de navegación contextual | explain.whyButton: `FP.explain.whyButton` | **Disponible** | Prueba batch_fase3_2_z1_wireframe: las rutas FP.* existen en la aplicación | Ninguna |
| Z1-19 | Saber qué se puede afirmar y qué no | D-01, D-05 | Banda «Alcance» (`z1-alcance`) | Lo visible en Z1 y el nivel de confiabilidad | Especificación: _especificación:_ `tools/audit/z1-lectura-ejecutiva.js · build (scope)` | **Por desarrollar** | Prueba tools/test-fase3-2-z1.js (escenarios, invariantes, mutaciones) y verificador de consistencia 3.2 | completar_motores (4.2): Producir el alcance desde el motor de diagnósticos |
| Z1-20 | Ver siempre lo que se vendió si el dato es válido | D-01 | Bloque económico (sin brecha) (`z1-economico`) | Venta acumulada con actividad observable | Motor existente: `FP.gap.pacingStatus`, `FP.homeView.periodFigures` | **Parcial** | Prueba batch_fase3_2_z1_wireframe: las rutas FP.* existen en la aplicación | contratos_existentes (4.1): Regla de selección de la cifra protagonista |
| Z1-21 | Entender la brecha con su meta y su porcentaje | D-01 | Subtexto del bloque económico (`z1-economico`) | Plan a la fecha y cumplimiento | Motor existente: `FP.gap.pacingStatus` | **Parcial** | Prueba batch_fase3_2_z1_wireframe: las rutas FP.* existen en la aplicación | contratos_existentes (4.1): Regla de visibilidad conjunta |
| Z1-22 | Valorar la evolución con su base en pesos | D-01, D-04 | Celda «Evolución vs comparable» (`z1-evolucion`) | Venta del periodo comparable | Motor existente: `FP.homeSummaryEngine.why`, `FP.temporalEngine` | **Parcial** | Prueba batch_fase3_2_z1_wireframe: las rutas FP.* existen en la aplicación | completar_motores (4.3): Exponer la venta comparable (baseRevenue) en el contrato de comparación |
| Z1-23 | Que Baja e Insuficiente no se confundan | D-05 | Detalle de los escenarios (traza) (`escenarios`) | Datos, actividad, base, indicadores, composición | Especificación: _especificación:_ `tools/audit/z1-lectura-ejecutiva.js · evaluate` | **Por desarrollar** | Prueba tools/test-fase3-2-z1.js (escenarios, invariantes, mutaciones) y verificador de consistencia 3.2 | completar_motores (4.2): Implementar el orden en el motor de diagnósticos; validacion_produccion (4.2): Validar la precedencia con casos reales |
| Z1-24 | Veredictos que no contradicen las cifras ni inventan causas | D-03 | Detalle de los escenarios (veredicto permitido) (`escenarios`) | Salida de la especificación | Especificación: _especificación:_ `tools/audit/z1-lectura-ejecutiva.js · checkVerdictText` | **Por desarrollar** | Prueba tools/test-fase3-2-z1.js (escenarios, invariantes, mutaciones) y verificador de consistencia 3.2 | completar_motores (4.2): Validador en el motor; requiere_ia (5.5): Validar textos de IA con las mismas reglas |
| Z1-25 | Lenguaje de negocio sin códigos internos | D-06 | Chips de estado, confiabilidad y periodo (`z1-estado`) | Tabla D-06 | Especificación: _especificación:_ `tools/audit/z1-lectura-ejecutiva.js · NAMES` | **Por desarrollar** | Prueba tools/test-fase3-2-z1.js (escenarios, invariantes, mutaciones) y verificador de consistencia 3.2 | contratos_existentes (4.2): Tabla de nombres lista para i18n |
| Z1-26 | Reconocer que hay sesiones y no pedidos sin inventar un porqué | D-04 | Titular (veredicto de conversión cero) (`z1-veredicto`) | Sesiones y pedidos del periodo | Especificación: _especificación:_ `tools/audit/z1-lectura-ejecutiva.js · build (conversion_cero)` | **Por desarrollar** | Prueba tools/test-fase3-2-z1.js (escenarios, invariantes, mutaciones) y verificador de consistencia 3.2 | completar_motores (4.3): Diagnóstico de conversión cero sin atribuir causa (el motor ya distingue conversion_cero_actual); validacion_produccion (4.3): Validar con datos de producción si el patrón corresponde a un resultado real o a un problema de registro; Z1 no lo afirma |
| Z1-27 | Clasificar el dato en válido, inconsistente (pendiente de interpretación), no verificable o no calculable; no confundir ausencia de información con venta cero; no invalidar automáticamente pedidos y venta que no cuadran | D-04, C1 | Bloque económico (sin cifra, no $0) (`z1-economico`) | Sesiones, pedidos y venta del periodo | Especificación: _especificación:_ `tools/audit/z1-lectura-ejecutiva.js · evaluate (paso 2)` | **Por desarrollar** | Prueba tools/test-fase3-2-z1.js (escenarios, invariantes, mutaciones) y verificador de consistencia 3.2 | contratos_existentes (4.2): El motor ya marca estas combinaciones como MATHEMATICAL_INCONSISTENCY sin excluir nada (js/quality); validacion_produccion (4.2): Definir con producción el umbral de actividad mínima y cómo interpretar pedidos sin importe o venta sin pedidos |
| Z1-28 | Producir un agregado de actividad del periodo que distinga medida en cero de medida ausente (hoy el Home no lo produce: sin plan no calcula cifras del periodo y las sesiones y pedidos se agregan por segmento en attribution) | D-01, D-04, C2 | Bloque económico y banda de motivos (`z1-economico`) | Sesiones, pedidos y venta del periodo | Especificación: _especificación:_ `tools/audit/z1-lectura-ejecutiva.js · activityOf` | **Por desarrollar** | Prueba tools/test-fase3-2-z1.js (A5–A8, I39–I41, M10–M14); la ausencia de productor se comprobó leyendo js/ui/guidance/home-view.js y js/diagnostics/attribution.js | completar_motores (4.1): Productor de actividad agregada con medidas nulas explícitas (null ≠ 0); validacion_produccion (4.1): Definir y validar con datos reales la regla de conciliación entre la venta del agregado y la venta del periodo (no existe tolerancia documentada; no se usa 1 %); validacion_produccion (4.2): Definir con producción el umbral de actividad mínima observable |
| Z1-29 | Evaluar la confiabilidad de cada conclusión según los datos que esa conclusión necesita: una medida ausente de sesiones o pedidos deja la conversión «no verificable» sin bajar la confiabilidad del cumplimiento; solo baja a «Baja» cuando falta información secundaria relevante para evaluar un resultado en cero | D-05, C3 | Banda «Alcance» y chip de confiabilidad (`z1-alcance`) | Venta, plan y cobertura (cumplimiento); sesiones y pedidos (conversión); comparable (evolución); margen (contribución) | Especificación: _especificación:_ `tools/audit/z1-lectura-ejecutiva.js · build (conclusions)` | **Por desarrollar** | Prueba tools/test-fase3-2-z1.js (A7, A15, I55–I57, M12, M16) y verificador de consistencia 3.2 | completar_motores (4.2): Motor de diagnósticos con estado por conclusión; validacion_produccion (4.2): Validar con usuarios que la confiabilidad por conclusión se entiende |

**Resumen:** 29 requisitos: 5 Disponible · 13 Parcial · 11 Por desarrollar.

## Dependencias por categoría y fase

### contratos_existentes — Resoluble con contratos y motores existentes: solo falta conectar y presentar.

- Z1-03 · Fase 4.1: Rótulos ya disponibles en el contexto
- Z1-04 · Fase 4.3: Mapear los 9 estados de attribution a las 7 etiquetas visibles
- Z1-06 · Fase 4.2: Versión determinista disponible
- Z1-12 · Fase 4.5: Contribución con margen promedio general y validación del margen ya existen (FP.economics)
- Z1-13 · Fase 4.2: Motivos ya disponibles en los motores
- Z1-17 · Fase 5.5: Niveles de certeza existentes
- Z1-20 · Fase 4.1: Regla de selección de la cifra protagonista
- Z1-21 · Fase 4.1: Regla de visibilidad conjunta
- Z1-25 · Fase 4.2: Tabla de nombres lista para i18n
- Z1-27 · Fase 4.2: El motor ya marca estas combinaciones como MATHEMATICAL_INCONSISTENCY sin excluir nada (js/quality)

### completar_motores — Requiere completar o ampliar un motor (Fase 4) antes de poder mostrarse.

- Z1-01 · Fase 4.2: Conectar classifyBusinessState a un motor de diagnósticos
- Z1-02 · Fase 4.2: Unificar attentionEngine, homeSummaryEngine y contextEngine en un solo nivel
- Z1-05 · Fase 4.2: Generar el veredicto desde los motores
- Z1-11 · Fase 4.3: Entregar la comparación en una estructura única con venta comparable
- Z1-12 · Fase 4.5: Margen por canal, producto o pedido: hoy solo existe el promedio general; Z1 no lo inventa
- Z1-14 · Fase 4.2: Implementar topes y bloqueos en el motor
- Z1-15 · Fase 4.2: Aplicar la regla en el motor
- Z1-19 · Fase 4.2: Producir el alcance desde el motor de diagnósticos
- Z1-22 · Fase 4.3: Exponer la venta comparable (baseRevenue) en el contrato de comparación
- Z1-23 · Fase 4.2: Implementar el orden en el motor de diagnósticos
- Z1-24 · Fase 4.2: Validador en el motor
- Z1-26 · Fase 4.3: Diagnóstico de conversión cero sin atribuir causa (el motor ya distingue conversion_cero_actual)
- Z1-28 · Fase 4.1: Productor de actividad agregada con medidas nulas explícitas (null ≠ 0)
- Z1-29 · Fase 4.2: Motor de diagnósticos con estado por conclusión

### requiere_ia — Requiere inteligencia artificial (Fase 5) para su versión final; existe una versión determinista de respaldo.

- Z1-05 · Fase 5.2: Versión narrativa con IA (opcional)
- Z1-06 · Fase 5.2: Versión con IA (opcional)
- Z1-15 · Fase 5.5: Verificar con IA la consistencia
- Z1-16 · Fase 5.2: Versión con IA (opcional)
- Z1-24 · Fase 5.5: Validar textos de IA con las mismas reglas

### validacion_produccion — Requiere validación con datos y usuarios de producción (umbrales y supuestos de la especificación).

- Z1-02 · Fase 4.2: Validar con datos reales el umbral de cobertura del 60 %
- Z1-12 · Fase 4.5: Validar con finanzas el margen promedio, su granularidad y si debe admitirse un margen bruto negativo (el contrato aceptado de Fase 2 lo rechaza)
- Z1-14 · Fase 4.2: Validar con datos reales el umbral de actividad mínima observable
- Z1-23 · Fase 4.2: Validar la precedencia con casos reales
- Z1-26 · Fase 4.3: Validar con datos de producción si el patrón corresponde a un resultado real o a un problema de registro; Z1 no lo afirma
- Z1-27 · Fase 4.2: Definir con producción el umbral de actividad mínima y cómo interpretar pedidos sin importe o venta sin pedidos
- Z1-28 · Fase 4.1: Definir y validar con datos reales la regla de conciliación entre la venta del agregado y la venta del periodo (no existe tolerancia documentada; no se usa 1 %)
- Z1-28 · Fase 4.2: Definir con producción el umbral de actividad mínima observable
- Z1-29 · Fase 4.2: Validar con usuarios que la confiabilidad por conclusión se entiende

