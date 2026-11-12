# Matriz de trazabilidad de Z4 — Subfase 3.4

Generada desde `generated/MATRIZ_TRAZABILIDAD_Z4.json` con `python3 tools/audit/matriz_zona_md.py Z4` (no editar a mano). Conecta cada requisito con la decisión que lo origina, su componente visual (`data-wf-f` en el wireframe), la fuente de datos, el motor o contrato responsable, su estado, la evidencia y la dependencia pendiente. Las filas M-xx remiten a la matriz de 3.1.

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
| Z4-01 | Destacar hasta tres acciones sin limitar el universo | D-03 | Fila de acciones destacadas (`z4-lista`) | actionPriorityEngine y attentionEngine | Motor existente: `FP.actionPriorityEngine`, `FP.attentionEngine.evaluate` | **Parcial** | Lote batch_fase3_3_3_4_zonas: las rutas FP.* existen en la aplicación | completar_motores (4.4): Criterio definitivo de priorización de acciones |
| Z4-02 | Acceso al universo completo de acciones | D-03 | Desplegable y filtros (`z4-ver-todas`) | actionPriorityEngine | Motor existente: `FP.actionPriorityEngine` | **Parcial** | Lote batch_fase3_3_3_4_zonas: las rutas FP.* existen en la aplicación | contratos_existentes (4.4): El motor ya devuelve el universo ordenado |
| Z4-03 | Sin recomendaciones genéricas; trazabilidad entre Z3 y Z4 | 3.1 §7.4 | Bloque «Motivada por» (`z4-motivo`) | Contrato de acción propuesto (especificación) | Especificación: _especificación:_ `tools/audit/z4-acciones.js · build` | **Por desarrollar** | Prueba tools/test-fase3-4-z4.js y verificador de consistencia | completar_motores (4.4): Definir el contrato de acción con vínculo al hallazgo (hoy el motor no lo trae) |
| Z4-04 | Primero los datos cuando condicionan todo | Aclaración B | Tarjeta de tipo «datos» (`z4-tarjeta`) | attentionEngine.next y guide.nextStep | Motor existente: `FP.attentionEngine.evaluate`, `FP.guide.nextStep` | **Disponible** | Lote batch_fase3_3_3_4_zonas: las rutas FP.* existen en la aplicación | Ninguna |
| Z4-05 | Distinguir revisar, comprobar y evaluar alternativas | 3.1 §7.4 | Etiqueta del tipo (`z4-tarjeta`) | Pasos step de attentionEngine (complete_data, review_gap, investigate_*) | Motor existente: `FP.attentionEngine.evaluate` | **Parcial** | Lote batch_fase3_3_3_4_zonas: las rutas FP.* existen en la aplicación | completar_motores (4.4): Unificar el vocabulario de pasos entre motores |
| Z4-06 | Con Baja datos y revisión; con Insuficiente solo datos | Aclaración B | Aviso y nota de retenidas (`z4-retenidas`) | Especificación de confiabilidad (3.2) | Especificación: _especificación:_ `tools/audit/z4-acciones.js · build` | **Por desarrollar** | Prueba tools/test-fase3-4-z4.js y verificador de consistencia | completar_motores (4.2): Regla de confiabilidad en el motor de diagnósticos |
| Z4-07 | Sin genéricas, sin causas, sin importes, sin términos financieros, sin tareas | Principio 5.2 | Texto de la tarjeta (`z4-tarjeta`) | checkActionText (especificación) | Especificación: _especificación:_ `tools/audit/z4-acciones.js · build` | **Por desarrollar** | Prueba tools/test-fase3-4-z4.js y verificador de consistencia | completar_motores (4.4): Validador en el motor; requiere_ia (5.4): Aplicar las mismas reglas a recomendaciones generadas con IA |
| Z4-08 | Una señal o hipótesis solo se comprueba; no se decide sobre ella | Principio 5.3 | Etiqueta «Comprobar» y aviso (`z4-tarjeta`) | Escalera de certeza de Fase 2 | Especificación: _especificación:_ `tools/audit/z4-acciones.js · build` | **Por desarrollar** | Prueba tools/test-fase3-4-z4.js y verificador de consistencia | completar_motores (4.4): Regla en el motor; validacion_produccion (4.4): Validar con usuarios que la distinción se entiende |
| Z4-09 | Evitar doble conteo entre Z3 y Z4 | 3.1 §3.7 | Bloque «Motivada por» (`z4-motivo`) | FP.economics (impacto del elemento) | Motor existente: `FP.economics.fromRecovery`, `FP.economics.fromGap` | **Parcial** | Lote batch_fase3_3_3_4_zonas: las rutas FP.* existen en la aplicación | completar_motores (4.5): Impacto por hallazgo conectado |
| Z4-10 | La misma acción de dos motores es una sola | 3.1 §7.4 | Tarjeta única (`z4-lista`) | Especificación (misma llave: tipo, destino y motivos) | Especificación: _especificación:_ `tools/audit/z4-acciones.js · build` | **Por desarrollar** | Prueba tools/test-fase3-4-z4.js y verificador de consistencia | completar_motores (4.4): Deduplicar en el motor de prioridades |
| Z4-11 | Mantener RGT Execution OS fuera de alcance | Alcance del proyecto | Ausencia de esos campos (`z4-tarjeta`) | Especificación (campos descartados) | Especificación: _especificación:_ `tools/audit/z4-acciones.js · build` | **Por desarrollar** | Prueba tools/test-fase3-4-z4.js y verificador de consistencia | completar_motores (4.4): Impedir esos campos en el contrato de acción |
| Z4-12 | No inventar una recomendación sin base | 3.1 §7.4 | Bloque de reemplazo (`z4-vacio`) | contextEngine.requirements | Motor existente: `FP.contextEngine.requirements` | **Disponible** | Lote batch_fase3_3_3_4_zonas: las rutas FP.* existen en la aplicación | Ninguna |
| Z4-13 | Comparar alternativas estimadas; la decisión es del responsable | 3.1 §7.1 | Tarjeta de tipo «evaluar» (`z4-tarjeta`) | recoveryEngine.recoveryOptions | Motor existente: `FP.recoveryEngine.recoveryOptions` | **Parcial** | Lote batch_fase3_3_3_4_zonas: las rutas FP.* existen en la aplicación | completar_motores (4.4): Traducir cada alternativa a una acción con su elemento |

**Resumen:** 13 requisitos: 2 Disponible · 5 Parcial · 6 Por desarrollar.

## Dependencias por categoría

### contratos_existentes — Resoluble con contratos y motores existentes: solo falta conectar y presentar.

- Z4-02 · Fase 4.4: El motor ya devuelve el universo ordenado

### completar_motores — Requiere completar o ampliar un motor (Fase 4) antes de poder mostrarse.

- Z4-01 · Fase 4.4: Criterio definitivo de priorización de acciones
- Z4-03 · Fase 4.4: Definir el contrato de acción con vínculo al hallazgo (hoy el motor no lo trae)
- Z4-05 · Fase 4.4: Unificar el vocabulario de pasos entre motores
- Z4-06 · Fase 4.2: Regla de confiabilidad en el motor de diagnósticos
- Z4-07 · Fase 4.4: Validador en el motor
- Z4-08 · Fase 4.4: Regla en el motor
- Z4-09 · Fase 4.5: Impacto por hallazgo conectado
- Z4-10 · Fase 4.4: Deduplicar en el motor de prioridades
- Z4-11 · Fase 4.4: Impedir esos campos en el contrato de acción
- Z4-13 · Fase 4.4: Traducir cada alternativa a una acción con su elemento

### requiere_ia — Requiere inteligencia artificial (Fase 5) para su versión final; existe una versión determinista de respaldo.

- Z4-07 · Fase 5.4: Aplicar las mismas reglas a recomendaciones generadas con IA

### validacion_produccion — Requiere validación con datos y usuarios de producción (umbrales y supuestos de la especificación).

- Z4-08 · Fase 4.4: Validar con usuarios que la distinción se entiende

