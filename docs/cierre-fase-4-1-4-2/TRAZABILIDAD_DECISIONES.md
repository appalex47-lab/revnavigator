# Trazabilidad de decisiones (D-01…D-07 y P-01…P-21)

Cada fila enlaza decisión → estado actual → evidencia. Las decisiones aceptadas **no se reinterpretaron**.

## Decisiones aceptadas el 12-nov-2026 (D-01…D-07)
| Decisión | Estado | Evidencia / dónde se respeta |
|---|---|---|
| D-01 márgenes negativos | **Reservada (4.5)**: `impactModel.js` intacto; conflicto documentado | hash de la línea base; `test-fase4-1-impacto-conceptual` C1 |
| D-02 conciliación $0.01 | Respetada; 0.005 de Z1 distinto, no unificado | `test-fase4-1-tolerancias` (9); `reconcile`/`reconcileSessions` |
| D-03 suficiencia sin umbral universal | **Cumplida**: `cc.sample/1` por operación, `universalThreshold:false` | `test-fase4-1-contratos-js` E1–E12 |
| D-04 priorización conjunta | Sin cambios (Z4, no integrada) | verificadores 3.x |
| D-05 completitud solo si verificable | Respetada: sesiones/pedidos ausentes → `incompleta`/`no_verificable`; no se convierte en cero | `test-fase4-2-z1-evaluador` E1–E6 |
| D-06 no consolidar impactos superpuestos | **Reservada (4.5)**: `combineImpacts` intacto; conflicto documentado | `impacto-conceptual` C3 |
| D-07 equivalencias y agregación | Sin cambios | verificadores 3.x |

## Decisiones P-xx
| ID | Decisión | Estado | Evidencia |
|---|---|---|---|
| P-01 | regla y configuración únicas del estado | **Resuelta** (2 sitios unificados; 5 con otro concepto conservados; sin umbrales de respaldo paralelos tras este cierre) | `estado-consumidores` (15), cierre C1–C6 |
| P-02 | fuente de sesiones | **Resuelta**; conciliación sin tolerancia (mecanismo listo) | `sesiones` (19), cierre E1–E9 |
| P-03 | catálogo y migración | Matriz de 21 sitios; migración por oleadas | `reimplementaciones` (27) |
| P-04 | 0.005 vs $0.01 | **No unificado** (investigado) | `tolerancias` (9) |
| P-05 | contratos reutilizables en `js/` | **Hecho**; sin consumidores (T-01) | `contratos-js` (30) |
| P-08 | suficiencia contextual | **Hecho** | idem |
| P-11 | escala del reporte | **Pendiente de decisión** | B-02 |
| P-12 | exportación con umbral efectivo | **Resuelta** | navegador C1–C3 |
| P-13 | migrar fórmulas idénticas | **2 de 3** (GAP-4 no idéntico) | `p13-migracion` (10), `paridad-consumidores` (5) |
| P-14 | tolerancia serie diaria ↔ GA4 | **Pendiente de datos reales**; mecanismo listo | R-01 |
| P-15 | portar Z1 | **Hecho** (generado desde la especificación) | `z1-evaluador` (22), cierre A1–A5 |
| P-16 | mínimo de sesiones centralizado | **Resuelta** (motores y texto) | `p16` (12), cierre B1–B6 |
| P-17 | conectar `evaluate` a `reliability.sample` | Pendiente (4.3) | T-02 |
| P-18 | GAP-4/GAP-5 redondeo | Pendiente de decisión | B-03 |
| P-19 | cargar `z1`/`reliability` en `index.html` | Pendiente: cuando exista consumidor | T-01 |
| P-20 | usar `planStatus` en más consumidores | Pendiente (4.3) | T-03 |
| P-21 | textos «500 / 1 %» desde la configuración | **Resuelta en este cierre** | cierre B1–B6 |
| P-06/P-07/P-09/P-10 | economía, Home real, commits | **Reservadas**: sin cambios | `git status`; hashes |
