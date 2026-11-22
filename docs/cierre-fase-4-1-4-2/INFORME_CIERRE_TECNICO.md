# Informe de cierre técnico — Fases 4.1 y 4.2

**Dictamen: APROBADO TÉCNICAMENTE CON LIMITACIONES CLASIFICADAS.** No quedan defectos conocidos corregibles dentro del alcance autorizado. Las limitaciones restantes dependen de un primer consumidor real, de datos reales o de decisiones de negocio (`MATRIZ_LIMITACIONES.md`). Rama `ccr-a81af632-rirtu7`, HEAD `625daec0969f9cd6e9db5d93a41eb652040d506` (sin commits). No se inició 4.3.

## Qué se investigó y qué se encontró
| Punto | Hallazgo real | Resultado |
|---|---|---|
| **A · Z1** | Dos copias manuales (especificación protegida + port): el riesgo era que divergieran con el tiempo | `js/commandCenter/z1.js` es ahora un **archivo generado** por `tools/build-z1-port.js` desde la especificación; `--check` falla si difiere o si alguien lo edita (mutación probada). La especificación queda como **fuente de referencia**; hay una sola implementación ejecutable en la app. Sin carga en `index.html` hasta que exista consumidor (A4). |
| **B · P-16** | El motor ya leía una sola configuración, pero los **textos** de `segments-view` («500 y el 1 %», 2 lugares) seguían escritos a mano | los textos salen de `FP.sampleSufficiency.describeSegmentMin()` (misma configuración). Cambiar la configuración cambia texto y motor a la vez (B2). Ningún otro texto de `js/` conserva el valor fijo (B4). |
| **C · Estado frente al plan** | Quedaban **umbrales de respaldo paralelos**: `planStatus` (1.01/0.99), `businessState` (constantes propias) y, lo más serio, `attentionEngine` con **0.95 en un sitio y 0.99 en otro** | los tres leen solo `FP.config.forecast.pacingThresholds`; sin configuración fallan con mensaje claro. Los valores 1.01/0.99 se definen en **un solo** archivo (`config.js`). Límites inclusivos y umbrales editables verificados. Escalas diarias/semanales/cierre proyectado **no tocadas**. |
| **D · P-13** | GAP-3 y GAP-6 migrados; faltaba demostrar paridad con los **motores reales**, no solo con la fórmula | se carga la versión original desde Git y se comparan las salidas completas de `changeEngine.compare` (3 000 corridas) y `driverEngine.delta` (100 000 pares) con igualdad exacta: **idénticas**. GAP-4 y GAP-5 intactos (texto igual al de `HEAD`). |
| **E · Sesiones** | Sin mecanismo para validar con datos reales; riesgo de doble conteo sin alerta | `reconcileSessionsReport` + `tools/audit/validar-sesiones-ga4.js`: compara cada canal × dimensión con el total diario **sin sumar dimensiones**, alerta de doble conteo (suma ≫ total), distingue días distintos, ausencia ≠ cero, **tolerancia solo si se declara**. Sin fallback (verificado). |
| **F · Pruebas** | (1) una aserción constante en mi trabajo de 4.1; (2) la prueba existente de `changeEngine` **no detectaba** una brecha invertida; (3) «121 scripts, 0 fallas» incluía **3 scripts omitidos** | (1) reemplazada; (2) reforzada; (3) corregido el conteo: **120 ejecutados + 3 omitidos**. 11 mutaciones sobre el código real: 11/11 detectadas. |

## Defectos corregidos (resumen)
C-01 umbrales paralelos · C-02 textos fijos · C-03 copia manual de Z1 · C-04 laguna de cobertura en `changeEngine` · C-05 aserción constante · C-06 conteo de pruebas · C-07 mecanismo de sesiones · C-08 comentario obsoleto. Cada uno con causa raíz, solución y prueba en `MATRIZ_LIMITACIONES.md`.

## Archivos modificados en este cierre
**Aplicación (registrados en `MODIFICACIONES_AUTORIZADAS.json`):** `js/analytics/attentionEngine.js`, `js/ui/segments-view.js`. **Nuevos/ajustados en `js/commandCenter/`:** `planStatus.js`, `businessState.js`, `sampleSufficiency.js`, `metricCatalog.js`, `z1.js` (generado). **Herramientas:** `tools/build-z1-port.js`, `tools/audit/validar-sesiones-ga4.js`. **Pruebas:** `test-cierre-4-1-4-2.js` (28), `test-cierre-paridad-consumidores.js` (5), `test-change-engine.js` (+1), ajustes en `test-fase4-1-estado-comercial/impacto-conceptual`, lote `batch_fase3_1_home_auditoria`. **Documentos:** esta carpeta (6) y avisos de actualización en los de 4.1/4.2.

## Pruebas ejecutadas (resultados reproducibles)
| Conjunto | Resultado |
|---|---|
| Scripts Node (`tools/test-*.js` + `selftest-node.js`) | **123 scripts: 120 ejecutados, 0 fallas, 3 omitidos** (requieren archivos externos; no se cuentan como aprobados) |
| Pruebas nuevas de 4.1 + 4.2 + cierre | **309 comprobaciones, todas bien** (217 + 59 + 33) |
| Verificadores de Fase 3 (documentos aceptados) | **5/5 OK** |
| Sintaxis `js/**/*.js` | **249 archivos, 0 errores** |
| Lotes de navegador (Chromium) de los módulos afectados | **52 lotes, 52 OK** (incluye `batch_fase4_2_contratos`, segmentos, atención, reporte/golden, cambios, Inicio, Pacing, exportación, diagnóstico, tráfico) |
| Mutaciones sobre código real | **11/11 detectadas** |
Datos simulados. No hubo validación visual del Command Center (no existe) ni datos reales.

## Criterios de cierre
| Criterio | Estado |
|---|---|
| Sin defectos corregibles conocidos dentro del alcance | ✅ |
| Contratos con fuente de verdad identificada | ✅ (pacing: `config.js`; mínimo de sesiones: `config.js`; Z1: especificación → generado; fórmulas: `FP.metrics`) |
| Consumidores usan las funciones centrales | ✅ (`MATRIZ_CONSUMIDORES.md`) |
| Fórmulas migradas equivalentes | ✅ (bit a bit, con motores reales) |
| Pruebas no debilitadas | ✅ (revisión de diffs + mutaciones; 1 laguna encontrada y cerrada) |
| Limitaciones externas documentadas | ✅ |
| Sin contradicciones configuración ↔ motor ↔ interfaz | ✅ para pacing y mínimo de sesiones (pruebas C y B) |
| Documentación = código real | ✅ tras los avisos de actualización en los documentos de 4.1/4.2 |

## Recomendación sobre 4.3
**Sí, se puede iniciar 4.3 una vez que aceptes 4.1/4.2 y este cierre.** La arquitectura está lista: Z1, businessState, reliability, findings, sampleSufficiency y el catálogo están en `js/` con una sola fuente de verdad cada uno. **Condiciones:** (1) decidir P-17 (conectar `evaluate` a la dimensión `sample`), P-19 (cargar `z1`/`reliability` en `index.html` junto con el primer consumidor) y P-20; (2) 4.3 debe traer su propio primer consumidor real; (3) siguen reservados D-01/D-06, la integración visual y los datos reales.

---

## Resultado de la validación externa real (2026-11-20)

E-1 aprobada; E-3 aprobada (calidad declarada `warnings`); E-2 ejecutada con **limitación aceptada por el usuario**: `traffic_volume` de ecommerce anterior a 2026-10-05 y de app anterior a 2026-09-25 (y app 2026-10-02) no coincide con GA4 (cambio de origen sin explicar). Detalle, alcance y condiciones: [`docs/validacion-externa/LIMITACION_E2_TRAFFIC_VOLUME.md`](../validacion-externa/LIMITACION_E2_TRAFFIC_VOLUME.md). La limitación está documentada, **no impuesta por código** (decisión pendiente). Esto no equivale a la aceptación formal de 4.1/4.2, que corresponde al usuario.
