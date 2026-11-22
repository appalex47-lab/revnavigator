# Matriz de limitaciones (cierre 4.1 / 4.2)

Clases: **1** Corregida · **2** Pendiente por dependencia técnica · **3** Pendiente por datos reales · **4** Pendiente por decisión de negocio · **5** Fuera del alcance autorizado.

## 1 · Corregidas en este cierre (con prueba)
| ID | Defecto | Causa raíz | Corrección | Prueba |
|---|---|---|---|---|
| C-01 | Umbrales de respaldo **paralelos** del estado frente al plan: `planStatus` (1.01/0.99), `businessState` (constantes propias) y `attentionEngine` (**0.95** en un sitio y **0.99** en otro, incompatibles entre sí) | los ports y el motor copiaron valores por si faltaba la configuración | los tres leen solo `FP.config.forecast.pacingThresholds` (o umbrales explícitos); sin configuración fallan con mensaje claro | `test-cierre-4-1-4-2` C1–C6; mutaciones M6, M9, M10 detectadas |
| C-02 | Texto de ayuda de `segments-view` con «500 y el 1 %» escrito a mano (2 lugares): podía contradecir al motor si cambiaba la configuración | texto estático | `FP.sampleSufficiency.describeSegmentMin()` genera el texto de la misma configuración que usa el motor | B1–B6; mutación M7 detectada |
| C-03 | Dos copias manuales de Z1 (especificación protegida + port) | port hecho una vez a mano | `js/commandCenter/z1.js` es un **artefacto generado** por `tools/build-z1-port.js` desde la especificación; `--check` falla ante cualquier divergencia o edición manual | A1–A3 |
| C-04 | La prueba existente de `changeEngine` no comprobaba el signo ni el valor de la brecha (una inversión pasaba sin ser detectada: mutación M5) | cobertura insuficiente | aserción de brecha total y por canal (+ paridad con la versión original de Git) | `test-change-engine` 22/22; `test-cierre-paridad-consumidores` |
| C-05 | Aserción constante `true` en `test-fase4-1-impacto-conceptual` (C5) | marcador de documentación contado como prueba | sustituida por una comprobación real (documento + comportamiento vigente de `combineImpacts`) | `F1` del cierre |
| C-06 | El conteo «121 scripts, 0 fallas» incluía 3 scripts **omitidos** | scripts preexistentes terminan con código 0 al faltar archivos externos | se informa **120 ejecutados + 3 omitidos** | `AUDITORIA_PRUEBAS.md` |
| C-07 | No había forma de validar la relación serie diaria ↔ GA4 | faltaba el mecanismo | `reconcileSessionsReport` + `tools/audit/validar-sesiones-ga4.js` (sin tolerancias inventadas, alerta de doble conteo) | `test-cierre-4-1-4-2` E1–E9 |
| C-08 | Comentario desactualizado en `batch_fase3_1_home_auditoria` | texto de 4.1 | corregido | lote OK |

## 2 · Pendientes por dependencia técnica
| ID | Pendiente | Qué falta |
|---|---|---|
| T-01 | `z1`, `businessState`, `reliability`, `findings` y el catálogo no tienen consumidores ni carga en `index.html` | el primer consumidor real (4.3/4.6); cargar entonces (P-19) |
| T-02 | `sampleSufficiency.evaluate` sin consumidores; dimensión `sample` de `reliability` aún recibe `{n,min}` de quien llama | conectarlo en 4.3 (P-17) |
| T-03 | Solo el titular del Inicio consume `planStatus`; el resto usa `FP.gap.pacingStatus` (que el contrato delega) | los estados `plan_unavailable/no_activity/not_comparable` los necesitará 4.3 (P-20) |
| T-04 | 17 fórmulas «equivalentes en dominio válido» sin migrar | oleadas con guarda canónica y prueba por sitio |
| T-05 | 3 scripts de Node omitidos (`test-phase20-diagnostic`, `test-phase21-forecast`, `test-phase21-real`) | requieren archivos externos en `/tmp/rev14`, `/mnt…` que no están en este entorno (preexistente) |
| T-06 | `pacing_status` en el contrato de exportación: sin versionado explícito | decidir si se versiona el contrato de exportación |

## 3 · Pendientes por datos reales
| ID | Pendiente |
|---|---|
| R-01 | Tolerancia entre serie diaria y GA4 (el mecanismo está listo: `validar-sesiones-ga4.js`) |
| R-02 | Confirmar que ambas fuentes miden las mismas sesiones (definición y filtros) |
| R-03 | Comportamiento de Z1 y de la confiabilidad con datos de producción |

## 4 · Pendientes por decisión de negocio
| ID | Decisión |
|---|---|
| B-01 | P-04: unificar o no 0.005 (Z1) y $0.01 (D-02) |
| B-02 | P-11: escala del reporte (±2 %, −10 %, ±0.5 %) frente a `pacingThresholds` |
| B-03 | P-18: GAP-4 (último bit) y GAP-5 (centavos) |
| B-04 | P-14 / R-01: qué tolerancia se aprueba una vez comparadas las fuentes |

## 5 · Fuera del alcance autorizado (no se tocó)
`impactModel.js`, `combineImpacts`, D-01 (margen negativo), D-06, integración visual del Command Center / maqueta en el Home real, persistencia y sincronización, datos reales de FESA, RGT Execution OS, commits/push/merge/PR/deploy y la Fase 4.3.

---

## Resultado de la validación externa real (2026-11-20)

E-1 aprobada; E-3 aprobada (calidad declarada `warnings`); E-2 ejecutada con **limitación aceptada por el usuario**: `traffic_volume` de ecommerce anterior a 2026-10-05 y de app anterior a 2026-09-25 (y app 2026-10-02) no coincide con GA4 (cambio de origen sin explicar). Detalle, alcance y condiciones: [`docs/validacion-externa/LIMITACION_E2_TRAFFIC_VOLUME.md`](../validacion-externa/LIMITACION_E2_TRAFFIC_VOLUME.md). La limitación está documentada, **no impuesta por código** (decisión pendiente). Esto no equivale a la aceptación formal de 4.1/4.2, que corresponde al usuario.
