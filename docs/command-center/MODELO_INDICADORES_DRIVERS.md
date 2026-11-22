# Modelo de indicadores y drivers (Subfase 2.2)

## 1. Identidad central
**VENTA = SESIONES × CONVERSIÓN (CR) × TICKET PROMEDIO (AOV)**, con CR = pedidos ÷ sesiones y AOV = venta ÷ pedidos, siempre calculados **sobre sumas** (nunca promedio de razones). Verificado con un oráculo independiente en `batch_fase1_consistencia_calculos.py` (F1.3) y en el diagnóstico (`venta = sesiones × CR × AOV`).

## 2. Clasificación de indicadores
| Clase | Definición | Indicadores | Dueño del cálculo |
|---|---|---|---|
| **Resultado** | Lo que se mide contra el objetivo | Venta, pedidos | `metrics.js`, `gap.js`, `pacing.js` |
| **Comportamiento** | Lo que hace el cliente | Sesiones, CR, AOV, unidades por pedido | `metrics.js` |
| **Driver** | Pieza multiplicativa que explica un cambio de venta | Sesiones, CR, AOV | `attribution.js` |
| **Contexto** | Aclara sin explicar | Mix de canal/producto, calendario, promociones, calidad de datos | `shareMixEngine`, `temporalEngine`, `promotionEvaluation` |
| **Alerta** | Señal de que algo salió de banda | Cumplimiento, brecha, cierre proyectado, racha | `attentionEngine`, `signalEngine` |

Un indicador pertenece a **una** clase principal; puede aparecer como contexto en otro análisis, pero la clase define cómo se puede usar (un indicador de contexto nunca se presenta como causa).

## 3. Mapa de dependencias
```
VENTA ── = ──► SESIONES ──┐
                          ├─ × ─► PEDIDOS = SESIONES × CR
              CR ─────────┘
              AOV ──────────────► VENTA = PEDIDOS × AOV
Contexto (mix, calendario, promos, calidad) ──► modula, no entra en la identidad
```
Reglas de uso: (1) la brecha de venta se descompone solo con estos tres factores; (2) la descomposición es **secuencial** en el orden fijo sesiones → CR → AOV, con suma exacta (`attribution.js`, `closes` = verdadero); Shapley es opcional y solo cambia el reparto, no el total; (3) el efecto conjunto de varios cambios **no es la suma** de los individuales: `R·((1+a)(1+b)(1+c) − 1)`; la diferencia es `R·términos cruzados` (verificado en F2.E1–E3).

## 4. Matemática válida vs causalidad
| Afirmación | ¿Permitida? | Etiqueta |
|---|---|---|
| «Conversión aporta −$803 mil a la brecha (111 %)» | Sí: contribución aritmética | `driver` |
| «La caída de conversión es la causa» | No | — |
| «Podría deberse al checkout o a la mezcla de tráfico (hipótesis a validar)» | Sí, marcada | `hipotesis` |
| «Si CR vuelve al plan, la brecha cierra X» | Sí, escenario con supuestos | `estimacion` |
Una contribución > 100 % es válida (otro driver compensa) y debe explicarse así. El orden secuencial asigna a sesiones el efecto «puro» y a AOV el efecto cruzado: **el reparto depende del orden**, y la lectura debe decirlo cuando la contribución cruzada es material.

## 5. Preguntas que el modelo debe poder contestar
| Pregunta | Con qué se responde |
|---|---|
| ¿Cuánto falta para el plan? | `gap.js`: real − plan en los mismos días contados |
| ¿Dónde se concentra? | `contributionEngine` por canal; detector `brecha_concentrada` |
| ¿Es volumen, conversión o ticket? | `attribution.js` nivel 1 (suma = brecha) |
| ¿Cierro el mes? | `forecastEngine` (método + spread entre métodos) |
| ¿Qué pasaría si CR +x? | `scenarioEngine.simulate` |
| ¿Cuánto cuesta cerrar la brecha? | `recoveryEngine.recoveryOptions` (alternativas excluyentes) |

## 6. Hallazgos de la auditoría que afectan al modelo
1. **Dos implementaciones de la atribución secuencial** (`attribution.js` y `trafficConversionEngine.effects`): coincidían con base normal (F2.E4) y divergían con base sin pedidos. **Resuelto** (punto A): fuente única `FP.attribution.attributeSegment`, estados explícitos por escenario y lo no comparable queda «sin atribuir». Ver `ATRIBUCION_FUENTE_DE_VERDAD.md`.
2. Umbrales fragmentados (≥ 5 conjuntos) — ver `MODELO_DETECCION_DESVIACIONES.md` §6.
3. `growthVsComparable` sin productor único (ver `MODELO_LECTURA_EJECUTIVA.md` §6).
