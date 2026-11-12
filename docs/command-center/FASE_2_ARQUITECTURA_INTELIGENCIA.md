# Fase 2 — Arquitectura de inteligencia comercial (documento maestro)

Estado: **COMPLETADA Y FORMALMENTE ACEPTADA CON LIMITACIONES DOCUMENTADAS** — con el cierre metodológico de los puntos A (atribución) y B (modelo dual de impacto) aprobado por el usuario (`ACEPTACION_FASE_2.md`). Los cambios siguen sin commit; pendientes de autorización expresa. Base: rama `ccr-a81af632-rirtu7`, commit `a2b38630`. Fase 1 aceptada con limitaciones documentadas (`FASE_1_AUDITORIA.md`).

## 1. Principio rector
El Command Center no agrega motores de cálculo: **lee, clasifica, deduplica, cuantifica combinando y explica** lo que ya calculan los motores oficiales. La IA interpreta y redacta; no calcula indicadores oficiales ni inventa cifras ni presenta hipótesis como hechos.

## 2. Arquitectura en capas
```
Datos (store: actual, plan, metas)                      ← sin cambios
  └─ Motores oficiales: metrics · gap · pacing · forecast · attribution · scenario · recovery · impact
       └─ Detección: attentionEngine · agentes · signalEngine · changeEngine          (2.3)
            └─ Adaptadores → cc.finding (validar · deduplicar · vigencia)             (2.4)
                 ├─ Cuantificación: cc.economic_impact (combinar sin doble conteo)    (2.5)
                 ├─ Estado del negocio + calificadores                                (2.1)
                 └─ Narrativa con fuente (narrativeEngine; IA solo redacta)
                      └─ UI (Fase 3) / Motor definitivo (Fase 4)
```

## 3. Evaluación de los motores existentes (verificados contra el código, no supuestos)
| Motor | ¿Completo y usado? | Veredicto |
|---|---|---|
| `homeSummaryEngine` | Sí, alimenta Inicio | Reutilizar como fuente del bloque cumplimiento |
| `attentionEngine` | Sí; bloquea si falta meta anual (`readiness`) | Fuente principal de hallazgos; adaptar al contrato |
| `riskOpportunityEngine` | **Existe, no se usa en producción** | No es base confiable; candidato a adaptador |
| `actionPriorityEngine` | Sí | Consumidor de hallazgos, no productor |
| `narrativeEngine` | Sí, seis niveles de certeza con fuente | Fuente de la escalera de certeza |
| `attribution.js` | Sí | **Fuente única** de atribución |
| `trafficConversionEngine.effects` | Sí; antes duplicaba la atribución secuencial | Ahora adaptador de `attributeSegment` (ver `ATRIBUCION_FUENTE_DE_VERDAD.md`) |
| `scenarioEngine` / `recoveryEngine` | Sí | Orquestados por 2.5 |

## 4. Entregables de la fase
| Subfase | Documento | Evidencia ejecutable |
|---|---|---|
| 2.1 Lectura ejecutiva | `MODELO_LECTURA_EJECUTIVA.md` | `classifyBusinessState`; Node + F2.R7–R9 |
| 2.2 Indicadores y drivers | `MODELO_INDICADORES_DRIVERS.md` | F2.E1–E5 (identidad, atribución, equivalencia) |
| 2.3 Desviaciones | `MODELO_DETECCION_DESVIACIONES.md` | `classifyDeviation`; Node (12 casos) + F2.R10 |
| 2.4 Hallazgos | `MODELO_HALLAZGOS_RIESGOS_OPORTUNIDADES.md` | `validateFinding`/`mergeFindings`; Node + F2.R1–R6 con motores reales |
| 2.5 Economía | `MODELO_CUANTIFICACION_ECONOMICA.md` | `validateImpact`/`combineImpacts`; Node + F2.E1–E3, E6–E7 |

Código nuevo (no se carga en la aplicación): `tools/audit/command-center-contracts.js` (especificación ejecutable), `tools/test-fase2-contratos.js` (69 pruebas), `tools/regression/batch_fase2_modelo_real.py` (25 pruebas contra la aplicación real con una desviación real: Ecommerce −12 %).

## 5. Decisiones de diseño
1. Una sola escalera de certeza (extiende `narrativeEngine`).
2. Un solo contrato de hallazgo; `owner`/tareas fuera (alcance excluido).
3. Estado del negocio = estado principal + calificadores; reglas con prioridad y excepciones.
4. Severidad = magnitud + materialidad + persistencia + calidad de datos.
5. Economía **dual**: impacto en ventas MXN siempre disponible + contribución bruta estimada opcional con un margen bruto promedio general (`MODELO_CUANTIFICACION_ECONOMICA.md` §0); seis categorías no sumables entre sí; alcanzable y esperado nunca con tasas inventadas.
6. Cambios de código acotados al cierre metodológico: `attribution.js`, adaptadores de atribución (`trafficConversionEngine`, `homeSummaryEngine`, `funnelEngine`, `analistaStory`, `driverEngine`, dos textos de vista), módulo nuevo `js/economics/impactModel.js` y un ajuste opcional `settings.economics`. Sin cambios en datos existentes, esquema de persistencia, credenciales ni umbrales vigentes.

## 6. Hallazgos de la auditoría de arquitectura
1. Atribución secuencial duplicada (`attribution.js` vs `trafficConversionEngine.effects`) con divergencia en bases en cero: **RESUELTO** en el cierre metodológico (punto A): fuente única, estados explícitos y casos límite probados (`ATRIBUCION_FUENTE_DE_VERDAD.md`).
2. Umbrales fragmentados en ≥ 5 módulos (Fase 1 §D); no se tocan.
3. `riskOpportunityEngine` sin uso.
4. Orquestación dentro de código de vista (scenarios/recovery) — debe moverse a un módulo en Fase 4.
5. `growthVsComparable` sin productor único.
6. Con datos de demostración en plan, `attentionEngine` solo emite hallazgos de datos (bloqueado por falta de meta anual): el modelo lo trata como `sin_base`/datos, no como «saludable».

## 7. Limitaciones documentadas (aceptadas)
La Fase 2 está **COMPLETADA Y FORMALMENTE ACEPTADA CON LIMITACIONES DOCUMENTADAS** (`ACEPTACION_FASE_2.md`). Las limitaciones se mantienen documentadas y no son defectos pendientes de aceptación.

**Punto A — Atribución** (`ATRIBUCION_FUENTE_DE_VERDAD.md` §7)
- `effects()` continúa siendo secuencial.
- La mezcla de segmentos nuevos o desaparecidos conserva dos definiciones.
- No existe umbral de exceso de venta sin atribuir.

**Punto B — Modelo económico dual** (`MODELO_CUANTIFICACION_ECONOMICA.md` §8)
- La contribución bruta estimada no aparece todavía en las vistas.
- No existe margen por categoría o SKU (solo el punto de extensión `resolveMargin`).
- La clasificación `estimada` no se emite sin calibración (el impacto `esperado` tampoco).

**Generales de la fase**
- Los contratos de hallazgo, estado y severidad son especificación ejecutable, **no** código de producción: la integración con Inicio es Fase 3/4.
- Estado y severidad se probaron con datos de demostración modificados, no con datos de producción del usuario.
- Cohere sigue sin prueba en vivo (limitación heredada de Fase 1).

## 8. Preparación para la Fase 3 (UX/UI)
Lista para diseñar: contrato de lectura (9 bloques), 6 estados con mensaje y prioridad por estado, severidades, certeza visible, impacto económico con rango/«datos insuficientes». **No es necesario** que el motor definitivo exista para diseñar: la UI consume `cc.finding` y `cc.economic_impact`. Riesgo para Fase 3: diseñar lo que Fase 4 no pueda alimentar (p. ej. `esperado`, que no se emite sin calibración).

## 9. Consolidado del roadmap
Ver `ESTADO.md`. Fase 2: aceptada. Fase 3: NO INICIADA hasta instrucción independiente y expresa del usuario.
