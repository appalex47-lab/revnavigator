# Modelo de lectura ejecutiva (Subfase 2.1)

Qué debe decir el Command Center en los primeros segundos y con qué reglas lo decide. **No calcula nada**: clasifica entradas que ya entregan `gap.js`, `pacing.js`, `forecastEngine`, `attentionEngine` y los agentes. Implementación de referencia: `classifyBusinessState` en `tools/audit/command-center-contracts.js` (pruebas: `tools/test-fase2-contratos.js`, `tools/regression/batch_fase2_modelo_real.py`).

## 1. Estructura de la lectura (contrato de salida)
Orden fijo, de lo general a lo específico. Cada bloque cita su fuente (motor y campo).

| # | Bloque | Contenido | Fuente existente |
|---|---|---|---|
| 1 | Estado general | Una de 6 etiquetas (§3) + calificadores | `classifyBusinessState` (nuevo) sobre las entradas de abajo |
| 2 | Cumplimiento | Venta real y plan a la fecha, brecha, % de cumplimiento | `gap.js`, `pacing.js` (`toDate`) |
| 3 | Evolución vs comparable | Crecimiento contra periodo anterior / año anterior | `temporalEngine`, `trendEngine` |
| 4 | Canal | Qué canal concentra la brecha o el avance | `contributionEngine`, agente `brecha_concentrada` |
| 5 | Indicadores explicativos | Sesiones, CR, AOV (VENTA = SESIONES × CR × AOV) | `attribution.js` |
| 6 | Desviaciones | Las que superan banda (2.3) | `attentionEngine`, detectores |
| 7 | Riesgos y oportunidades | Hallazgos `cc.finding` ordenados por severidad × materialidad (2.4) | adaptadores a `attentionEngine`/agentes |
| 8 | Qué requiere atención | Máximo 3, con enlace a la vista que lo resuelve | `attentionEngine.findings[].next` |
| 9 | Conclusión | Una frase construida con evidencia con fuente | `narrativeEngine.build` (nivel hecho/cálculo) |

Entrada del clasificador (todo ya calculado): `compliance`, `forecastGapPct`, `growthVsComparable` (o `null`), `coverage` (fracción de días comparados), `findings[]` (con `severity`, `type`, `economics`), `dataWarnings`, `concentration`, `blockingData`.

## 2. Niveles de lectura
`total` → `canal` → `periodo` (mes/trimestre/año) → `indicador` → `driver`. La lectura baja un nivel solo si el anterior tiene hallazgo activo (de total a canal que concentra; de canal a driver que explica). Nunca mezcla niveles en una misma cifra.

## 3. Estados del negocio
Los ejes: **C** cumplimiento (`arriba` ≥ 101 %, `en_plan` 99–101 %, `debajo` < 99 %), **G** evolución (`crece` ≥ +3 %, `cae` ≤ −3 %, `plano` |x| < 1 %, `crece_poco`/`cae_poco`, `sin_dato`), **F** cierre proyectado (`riesgo` si el forecast cierra < 99 % del plan). Las bandas son configurables (`DEFAULT_BANDS`); los valores por defecto reutilizan la escala de materialidad de `config` (2 % / 5 % / 15 %).

Prioridad de reglas (la primera que aplica gana):
| Orden | Condición | Estado |
|---|---|---|
| 0 | Datos bloqueantes, sin cumplimiento o cobertura < 60 % | `sin_base` (no se emite estado; se muestran acciones de datos) |
| 1 | G = cae y (C = debajo o F = riesgo o hallazgo crítico) | `deterioro` |
| 2 | Hay hallazgo crítico activo | `riesgo_cumplimiento` |
| 3 | G = crece y (C = debajo o F = riesgo) | `creciendo_bajo_potencial` |
| 4 | C = debajo o F = riesgo | `riesgo_cumplimiento` |
| 5 | G = crece y sin hallazgo importante | `creciendo` |
| 6 | Sin hallazgo importante | `saludable` |
| 7 | Resto (hallazgo importante con plan cumplido) | `riesgo_cumplimiento` (se vigila) |

Calificadores (no sustituyen al estado): `oportunidad_aceleracion` (hallazgo de oportunidad con impacto **alcanzable** material), `cierre_en_riesgo`, `concentracion_en_un_canal`, `datos_con_avisos`.

**Excepciones.** (a) Sin comparable, G = `sin_dato`: el estado se emite solo con C y F, y la lectura lo dice. (b) Un hallazgo crítico prevalece sobre un cumplimiento sano. (c) Si el mes aún no cuenta días suficientes, `sin_base`. (d) «Deterioro» exige caída contra comparable: un mal mes sin dato histórico es `riesgo_cumplimiento`, no deterioro.

Ejemplo real (datos de demostración con Ecommerce −12 %): cumplimiento 95.5 %, cierre −3.3 %, sin comparable → `riesgo_cumplimiento` con calificadores `cierre_en_riesgo`, `concentracion_en_un_canal`, `datos_con_avisos`. Con crecimiento de +6 % contra comparable → `creciendo_bajo_potencial`. Ambos verificados en `batch_fase2_modelo_real.py` (F2.R7–R9).

## 4. Separación obligatoria de capas
Cada afirmación de la lectura se etiqueta con una sola de estas capas y no se mezcla con la siguiente:
1. **Observado** — dato real (venta, sesiones…).
2. **Histórico / comparable** — plan, periodo anterior, año anterior.
3. **Desviación** — diferencia calculada entre las dos anteriores.
4. **Interpretación** — qué significa (regla visible; nunca causa).
5. **Implicación** — qué consecuencia tiene (cierre, brecha, riesgo) y, si hay fuente confiable, su valor económico (2.5).

La IA puede redactar las capas 4 y 5 a partir de las capas 1–3 con sus números; no puede producir cifras ni elevar una hipótesis a hecho (regla ya aplicada por `narrativeEngine` y `cohereNarrative`).

## 5. Reglas de presentación por estado (insumo para Fase 3)
| Estado | Mensaje central | Qué se prioriza |
|---|---|---|
| `saludable` | «Va en plan» + lo único a vigilar | Oportunidades |
| `creciendo` | Crecimiento y su origen | Sostener y acelerar |
| `creciendo_bajo_potencial` | Crece, pero no alcanza | Brecha y driver que explica |
| `riesgo_cumplimiento` | Cuánto falta y dónde | Brecha, canal, cierre |
| `deterioro` | Caída contra comparable | Causa probable (hipótesis marcada) |
| `sin_base` | Faltan datos | Acciones de carga |

## 6. Límites
El modelo no define la interfaz (Fase 3) ni el motor definitivo (Fase 4). `growthVsComparable` hoy no tiene un único productor; Fase 4 debe fijar de qué motor sale (`temporalEngine` es el candidato).
