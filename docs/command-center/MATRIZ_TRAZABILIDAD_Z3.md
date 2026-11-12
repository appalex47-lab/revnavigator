# Matriz de trazabilidad de Z3 — Subfase 3.3

Generada desde `generated/MATRIZ_TRAZABILIDAD_Z3.json` con `python3 tools/audit/matriz_zona_md.py Z3` (no editar a mano). Conecta cada requisito con la decisión que lo origina, su componente visual (`data-wf-f` en el wireframe), la fuente de datos, el motor o contrato responsable, su estado, la evidencia y la dependencia pendiente. Las filas M-xx remiten a la matriz de 3.1.

**No se presenta como disponible nada que solo esté propuesto en el diseño.** Las brechas se documentan como dependencias futuras; no se implementan.

## Estados
- **Disponible**: El motor existe y entrega lo necesario; solo falta presentarlo según este diseño.
- **Parcial**: El motor o parte de él existe, pero falta una pieza (regla, etiqueta, clasificación, conexión al Home) para cumplir este diseño.
- **Por desarrollar**: No existe en js/. Es solo diseño propuesto o especificación; su implementación es una dependencia futura.

## Categorías de dependencia
- **contratos_existentes**: Resoluble con contratos y motores existentes: solo falta conectar y presentar.
- **completar_motores**: Requiere completar o ampliar un motor (Fase 4) antes de poder mostrarse.
- **requiere_ia**: Requiere inteligencia artificial (Fase 5) para su versión final; existe una versión determinista de respaldo.
- **validacion_produccion**: Requiere validación con datos y usuarios de producción (umbrales y supuestos de la especificación).

## Matriz

| Id | Requisito | Decisión relacionada | Componente visual | Fuente de datos | Motor o contrato | Estado | Evidencia | Dependencia pendiente |
|---|---|---|---|---|---|---|---|---|
| Z3-01 | Una sola experiencia con tres clases que conservan clasificación, significado y tratamiento | D-02 | Tarjeta de elemento (clase y símbolo) (`z3-tarjeta`) | Contrato cc.finding (type) y clasificación por clase | Especificación: _especificación:_ `tools/audit/z3-atencion.js · build` | **Por desarrollar** | Prueba tools/test-fase3-3-z3.js y verificador de consistencia | completar_motores (4.4): Contrato único con clasificación en js/ (hoy es solo especificación) |
| Z3-02 | Mostrar lo observado o calculado, sin juicio de valor | D-02 | Tarjeta ◆ (`z3-lista`) | attentionEngine.evaluate | Motor existente: `FP.attentionEngine.evaluate` | **Parcial** | Lote batch_fase3_3_3_4_zonas: las rutas FP.* existen en la aplicación | completar_motores (4.4): Adaptar la salida de attentionEngine al contrato cc.finding |
| Z3-03 | Mostrar lo que queda por debajo del plan o de un umbral con su consecuencia | D-02 | Tarjeta ▲ (`z3-lista`) | attentionEngine y forecastEngine | Motor existente: `FP.attentionEngine.evaluate`, `FP.forecastEngine.runForecast` | **Parcial** | Lote batch_fase3_3_3_4_zonas: las rutas FP.* existen en la aplicación | completar_motores (4.4): Clasificar riesgos con el contrato; riskOpportunityEngine sin uso queda como candidato |
| Z3-04 | Mostrar venta recuperable o potencial con supuestos y restricciones declaradas | D-02 | Tarjeta ● (`z3-lista`) | recoveryEngine y scenarioEngine | Motor existente: `FP.recoveryEngine.recoveryOptions`, `FP.scenarioEngine.simulate` | **Parcial** | Lote batch_fase3_3_3_4_zonas: las rutas FP.* existen en la aplicación | completar_motores (4.4): Exponer las alternativas con su grupo excluyente en el contrato de hallazgo |
| Z3-05 | Destacar hasta tres elementos sin limitar el universo | D-03 | Fila de destacados (`z3-lista`) | attentionEngine (prioridad, severidad, soporte) y actionPriorityEngine | Motor existente: `FP.attentionEngine.evaluate`, `FP.actionPriorityEngine` | **Parcial** | Lote batch_fase3_3_3_4_zonas: las rutas FP.* existen en la aplicación | completar_motores (4.4): Criterio definitivo de priorización (la especificación usa orden cualitativo sin puntajes); validacion_produccion (4.4): Validar con usuarios que el orden coincide con lo que consideran urgente |
| Z3-06 | Acceso al universo completo | D-03 | Desplegable y filtros (`z3-ver-todos`) | attentionEngine.evaluate (todos los hallazgos) | Motor existente: `FP.attentionEngine.evaluate` | **Parcial** | Lote batch_fase3_3_3_4_zonas: las rutas FP.* existen en la aplicación | contratos_existentes (4.4): El motor ya devuelve el universo completo |
| Z3-07 | Importe observado o proyectado, rotulado, sin mezclar clases | D-02 | Bloque de impacto de la tarjeta (`z3-impacto`) | FP.economics (fromGap, fromSimulation, fromRecovery) | Motor existente: `FP.economics.fromGap`, `FP.economics.fromSimulation`, `FP.economics.fromRecovery` | **Parcial** | Lote batch_fase3_3_3_4_zonas: las rutas FP.* existen en la aplicación | completar_motores (4.5): Calcular el impacto de cada hallazgo de portada con los adaptadores |
| Z3-08 | Mostrar contribución solo con margen configurado; si no, «Margen no configurado · Configurar» | D-02 | Línea de contribución de la tarjeta (`z3-impacto`) | FP.economics.contributionOf | Motor existente: `FP.economics.contributionOf`, `FP.economics.availability` | **Parcial** | Lote batch_fase3_3_3_4_zonas: las rutas FP.* existen en la aplicación | contratos_existentes (4.5): Capa de contribución ya existe; completar_motores (4.5): Margen por canal, producto o pedido: hoy solo existe el promedio general; validacion_produccion (4.5): Validar el margen con finanzas |
| Z3-09 | Que cada tarjeta diga qué tan firme es | 3.1 §3.5 | Línea de certeza de la tarjeta (`z3-tarjeta`) | narrativeEngine.LEVELS y attentionEngine.support | Motor existente: `FP.narrativeEngine.LEVELS`, `FP.attentionEngine.evaluate` | **Parcial** | Lote batch_fase3_3_3_4_zonas: las rutas FP.* existen en la aplicación | completar_motores (4.4): Escalera única con «estimación» en los motores |
| Z3-10 | Que una hipótesis nunca sostenga el título | 3.1 §3.5 | Evidencia plegada de la tarjeta (`z3-tarjeta`) | attentionEngine (hypothesis) | Motor existente: `FP.attentionEngine.evaluate` | **Parcial** | Lote batch_fase3_3_3_4_zonas: las rutas FP.* existen en la aplicación | completar_motores (4.4): Incluir «cómo validarla» en cada hipótesis |
| Z3-11 | Con Baja solo lo observado; con Insuficiente solo lo que falta | Aclaración B | Aviso y nota de elementos retenidos (`z3-retenidos`) | Especificación de confiabilidad (3.2) | Especificación: _especificación:_ `tools/audit/z3-atencion.js · build` | **Por desarrollar** | Prueba tools/test-fase3-3-z3.js y verificador de consistencia | completar_motores (4.2): Regla de confiabilidad en el motor de diagnósticos |
| Z3-12 | Decir qué dato falta en lugar de mostrar cero | 3.1 §9 | Panel de datos (`z3-datos`) | contextEngine.requirements | Motor existente: `FP.contextEngine.requirements` | **Disponible** | Lote batch_fase3_3_3_4_zonas: las rutas FP.* existen en la aplicación | Ninguna |
| Z3-13 | El mismo hallazgo dicho por varios motores es uno solo, con su origen | D-02 | Origen en la evidencia plegada (`z3-tarjeta`) | mergeFindings (especificación de Fase 2) | Especificación: _especificación:_ `tools/audit/z3-atencion.js · build` | **Por desarrollar** | Prueba tools/test-fase3-3-z3.js y verificador de consistencia | completar_motores (4.4): Portar mergeFindings a js/ con las mismas pruebas |
| Z3-14 | No mezclar clases; alternativas que cierran la misma brecha como rango; superposición sin cifra | D-02 | Totales por clase (`z3-totales`) | FP.economics.combineImpacts | Motor existente: `FP.economics.combineImpacts` | **Parcial** | Lote batch_fase3_3_3_4_zonas: las rutas FP.* existen en la aplicación | completar_motores (4.5): combineImpacts toma el «mayor» por valor en las superposiciones: con importes negativos subestimaría una brecha; Z3 no muestra cifra en ese caso y se documenta para 4.5 |
| Z3-15 | Rotular lo que no reapareció y sacar lo resuelto de la portada | 3.1 §7 | Rótulo de vigilancia (`z3-tarjeta`) | changeEngine (reconcile) | Motor existente: `FP.changeEngine` | **Parcial** | Lote batch_fase3_3_3_4_zonas: las rutas FP.* existen en la aplicación | completar_motores (4.4): Aplicar el ciclo de vida del contrato a los hallazgos |
| Z3-16 | Sin trazabilidad no hay hallazgo | Principio 5.3 | Lista de descartados (Z5) (`z3-lista`) | validateFinding (especificación de Fase 2) | Especificación: _especificación:_ `tools/audit/z3-atencion.js · build` | **Por desarrollar** | Prueba tools/test-fase3-3-z3.js y verificador de consistencia | completar_motores (4.4): Validación de contrato en el motor |
| Z3-17 | Sin términos financieros, sin causas inferidas, oportunidad como estimación | Principio 5.2 | Título y descripción de la tarjeta (`z3-tarjeta`) | Validador checkCardText (especificación) | Especificación: _especificación:_ `tools/audit/z3-atencion.js · build` | **Por desarrollar** | Prueba tools/test-fase3-3-z3.js y verificador de consistencia | completar_motores (4.4): Validador en el motor; requiere_ia (5.5): Aplicar las mismas reglas a textos generados con IA |

**Resumen:** 17 requisitos: 1 Disponible · 11 Parcial · 5 Por desarrollar.

## Dependencias por categoría

### contratos_existentes — Resoluble con contratos y motores existentes: solo falta conectar y presentar.

- Z3-06 · Fase 4.4: El motor ya devuelve el universo completo
- Z3-08 · Fase 4.5: Capa de contribución ya existe

### completar_motores — Requiere completar o ampliar un motor (Fase 4) antes de poder mostrarse.

- Z3-01 · Fase 4.4: Contrato único con clasificación en js/ (hoy es solo especificación)
- Z3-02 · Fase 4.4: Adaptar la salida de attentionEngine al contrato cc.finding
- Z3-03 · Fase 4.4: Clasificar riesgos con el contrato; riskOpportunityEngine sin uso queda como candidato
- Z3-04 · Fase 4.4: Exponer las alternativas con su grupo excluyente en el contrato de hallazgo
- Z3-05 · Fase 4.4: Criterio definitivo de priorización (la especificación usa orden cualitativo sin puntajes)
- Z3-07 · Fase 4.5: Calcular el impacto de cada hallazgo de portada con los adaptadores
- Z3-08 · Fase 4.5: Margen por canal, producto o pedido: hoy solo existe el promedio general
- Z3-09 · Fase 4.4: Escalera única con «estimación» en los motores
- Z3-10 · Fase 4.4: Incluir «cómo validarla» en cada hipótesis
- Z3-11 · Fase 4.2: Regla de confiabilidad en el motor de diagnósticos
- Z3-13 · Fase 4.4: Portar mergeFindings a js/ con las mismas pruebas
- Z3-14 · Fase 4.5: combineImpacts toma el «mayor» por valor en las superposiciones: con importes negativos subestimaría una brecha; Z3 no muestra cifra en ese caso y se documenta para 4.5
- Z3-15 · Fase 4.4: Aplicar el ciclo de vida del contrato a los hallazgos
- Z3-16 · Fase 4.4: Validación de contrato en el motor
- Z3-17 · Fase 4.4: Validador en el motor

### requiere_ia — Requiere inteligencia artificial (Fase 5) para su versión final; existe una versión determinista de respaldo.

- Z3-17 · Fase 5.5: Aplicar las mismas reglas a textos generados con IA

### validacion_produccion — Requiere validación con datos y usuarios de producción (umbrales y supuestos de la especificación).

- Z3-05 · Fase 4.4: Validar con usuarios que el orden coincide con lo que consideran urgente
- Z3-08 · Fase 4.5: Validar el margen con finanzas

