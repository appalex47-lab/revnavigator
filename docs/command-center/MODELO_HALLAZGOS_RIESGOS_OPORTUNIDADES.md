# Modelo de hallazgos, riesgos y oportunidades (Subfase 2.4)

Contrato `cc.finding` v1 — un único formato para todo lo que el Command Center muestre como hallazgo, venga de donde venga. Implementación de referencia: `validateFinding`, `dedupKey`, `mergeFindings`, `reconcileValidity` (`tools/audit/command-center-contracts.js`). Verificado con 69 pruebas de contrato (`tools/test-fase2-contratos.js`) y contra salidas reales de `attentionEngine` y el agente analista (`batch_fase2_modelo_real.py`, F2.R1–R6).

## 1. Contrato (campos obligatorios)
| Campo | Contenido |
|---|---|
| `schema`, `version`, `id` | `cc.finding`, 1, id estable |
| `type` | `risk` · `opportunity` · `deviation` · `finding` |
| `title`, `description` | Texto legible, sin causalidad no probada |
| `scope` | `{level: total/channel/dimension/entity, channel, entity?}` |
| `period` | `{type, key, comparison: plan/previous/yoy/trend/expected/none}` |
| `indicator` | Indicador involucrado (venta, CR…) |
| `observed`, `reference` | Valor + unidad / valor + base de comparación |
| `evidence[]` | Cada una: `class`, `text`, `source{module,field}`, `numbers[]`, `headline?` |
| `rule` | `{id, family, version}` de la regla que lo originó |
| `certainty` | `{level, support alto/medio/bajo, basis}` con la regla visible |
| `severity` | `seguimiento` · `importante` · `critica` (lo normal no es hallazgo) |
| `limitations[]` | Lo que no se sabe |
| `validity` | `{status, firstSeen, lastSeen, expiresWhen}` |
| `lineage[]` | Motor e id de cada fuente: `origin` / `duplicate` / `enrichment` |
| `economics` | Impacto `cc.economic_impact` v1/v2 (2.5; v2 = ventas + capa opcional de contribución) **o** `economicsReason` si no aplica |
**No entran** campos de responsable, tarea, fecha límite ni estatus de ejecución (alcance excluido: gestión de tareas / RGT). El campo `owner` que traen los candidatos de agentes se ignora en el adaptador.

## 2. Escalera de certeza (única)
`hecho › cálculo › driver › señal › estimación › hipótesis › acción`. Extiende los seis niveles de `narrativeEngine.LEVELS` con **estimación** (proyección o escenario con supuestos) y se corresponde con `analysisArchitecture` (fact/driver/signal/hypothesis/projection) y `diagnosticArchitecture` (HECHO/DRIVER/SEÑAL/HIPÓTESIS).

Reglas (validadas por el contrato): (1) la certeza del hallazgo no puede superar la de la evidencia más débil **que sostiene el titular**; (2) debe haber al menos una evidencia con `headline`; (3) toda evidencia cita módulo y campo — **sin fuente no hay hallazgo**; (4) una hipótesis nunca sostiene un titular ni usa lenguaje causal («se debe a», «la causa es»…, mismas frases que `cohereNarrative`); (5) una `accion` es recomendación, no afirmación.

| Clase | Ejemplo | Quién la produce |
|---|---|---|
| Hecho comprobado | «Venta real a la fecha: $15,233,994» | motores de datos |
| Desviación calculada | «−$722,816 contra plan (4.5 %)» | `gap.js` |
| Hipótesis explicativa | «un cambio en el checkout podría estar bajando la conversión» | detectores / IA, siempre marcada |
| Posible causa | solo como hipótesis con datos faltantes declarados | — |
| Oportunidad estimada | «cerrar la brecha exige CR +x pp» | `recoveryEngine` |
| Recomendación | «Ver diagnóstico de brecha» | `attentionEngine.next` |

## 3. Riesgo vs oportunidad
- **Riesgo**: resultado esperado o actual por debajo del plan/umbral (p. ej. cierre proyectado < 99 %; `forecast`, `meta_en_riesgo`).
- **Oportunidad**: resultado o potencial por encima de lo que el plan supone, o brecha recuperable con palancas **controlables** (`recoveryEngine`).
- **Desviación**: diferencia calculada sin juicio de valor todavía; pasa a riesgo/oportunidad según su signo y severidad.
`riskOpportunityEngine` **existe pero no se usa en producción** (hallazgo de Fase 1): se conserva como candidato a adaptador, no como verdad.

## 4. Deduplicación, agrupación y vigencia
- **Llave**: `scope.level | canal | entidad | indicador | periodo | comparación | familia`. La familia agrupa por *qué se dice* (`pacing_gap`, `driver:cr`, `forecast_close`, `channel_lag:<canal>`, `data:<x>`…) sin importar qué motor lo dijo.
- **Canónico**: gana el motor de cálculo > atención > agentes > prioridades > narrativa (esta última solo cita). Los demás pasan a `lineage` como `duplicate`.
- **Agrupación**: un driver apunta con `explains` a la brecha del mismo canal y periodo (relación, no suma → evita doble conteo).
- **Actualización**: la misma llave conserva `firstSeen` y actualiza `lastSeen`.
- **Vencimiento**: sin la llave en 2 corridas con datos más recientes → `vigilancia` y luego `resuelto`; con datos más viejos o ausentes no se resuelve nada.
En la prueba con motores reales: 7 hallazgos de atención + agente analista → fusión de los que coinciden (`forecast` con `meta_en_riesgo`; `channel_ecommerce` con `brecha_concentrada`), con ambos orígenes en `lineage`, todos válidos.

## 5. Relación con los motores existentes
| Motor | Papel | Adaptación |
|---|---|---|
| `attentionEngine` | Fuente principal de hallazgos de portada | `kind` → familia; `support` → certeza; `evidence[]` → evidencia `calculo`; `hypothesis` → evidencia `hipotesis` sin `headline` |
| Agentes (`analista`, `auditor`, `arquitecto`) | Hallazgos de detalle | `detector` → regla; `prio` → severidad; `owner` descartado |
| `narrativeEngine` | Redacta con fuente | No genera hallazgos: cita los del contrato |
| `signalEngine` / diagnóstico | Señales y drivers | Evidencia `driver` / `senal` |
| `actionPriorityEngine` | Ordena acciones | Consume hallazgos; no los define |
| `changeEngine.reconcile` | Ciclo de vida | Modelo de `validity` |
| `riskOpportunityEngine` | Sin uso | Candidato a adaptador (Fase 4) |

## 6. Trazabilidad y límites
Cada hallazgo se puede reconstruir hasta el motor y campo de origen (`evidence.source`, `lineage`). Pendiente (Fase 4): implementar los adaptadores en `js/` con estas mismas pruebas y migrar `attentionEngine` al contrato sin cambiar sus resultados actuales.
