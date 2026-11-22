# Informe ejecutivo — Fase 4.2

> **Actualización del cierre técnico (ver `docs/cierre-fase-4-1-4-2/`).** Lo siguiente supera a lo escrito más abajo si hay contradicción: (1) `planStatus`, `businessState` y `attentionEngine` ya **no** contienen umbrales de respaldo (solo `FP.config.forecast.pacingThresholds`); (2) `js/commandCenter/z1.js` es un archivo **generado** desde la especificación (`tools/build-z1-port.js`), no una copia manual; (3) los textos de `segments-view` salen de la configuración (P-21 resuelto, límite «textos fijos» cerrado); (4) «121 scripts, 0 fallas» (y «117») incluía **3 scripts omitidos** (requieren archivos externos): son 120 ejecutados + 3 omitidos; (5) existe `reconcileSessionsReport` y `tools/audit/validar-sesiones-ga4.js` para validar sesiones con datos reales; (6) `index.html` carga solo `planStatus.js` y `sampleSufficiency.js` desde `js/commandCenter/`.


**Dictamen: COMPLETADA CON LIMITACIONES DOCUMENTADAS.** Lista para tu revisión y aceptación. 4.3 no iniciada. No hubo commit, push, merge, PR ni despliegue.

## En lenguaje llano
**Qué se construyó.** El evaluador de Z1 (la «lectura ejecutiva» aprobada en Fase 3) ahora existe como código reutilizable en `js/commandCenter/` (`z1.js`) junto con el estado general del negocio (`businessState.js`). El contrato de confiabilidad (`reliability.js`) toma el nivel directamente de Z1: ya no hay dos reglas de «qué tan confiable es el dato». Se añadió un criterio de suficiencia de muestra por tipo de operación (`sampleSufficiency.js`) y las reglas de estado frente al plan quedaron en **una sola función** (`FP.gap.pacingStatus`).

**Qué se conectó realmente en la aplicación.**
1. **Mínimo de sesiones por segmento (P-16):** estaba copiado en 3 archivos; ahora vive en `FP.config.diagnostics.segmentMinVolume` y lo leen los motores de tráfico y conversión, de segmentos y el reporte. Mismos resultados (comprobado en 20 013 tráficos).
2. **Exportación (P-12):** `pacing_status` usa los umbrales efectivos del usuario con la misma función que Pacing e Inicio (antes usaba el valor por defecto y lo ignoraba). Comprobado en el navegador en 66 periodos.
3. **Estado frente al plan:** el titular del Inicio clasifica con el contrato `cc.plan_status/1`, que delega en la regla central.
4. **Fórmulas (P-13):** `changeEngine` y `driverEngine` usan `FP.metrics.calcGap` para la brecha, con resultado idéntico bit a bit.

**Qué NO está conectado.** Z1, reliability, findings y el catálogo **no se cargan en la aplicación ni los usa ninguna vista**: la integración Z1 → confiabilidad se demostró con pruebas, no en pantalla. No existe aún un Command Center visual y no se tocó el Home real.

## Qué cambió en la aplicación (autorizado y registrado)
`index.html` (carga `planStatus.js` y `sampleSufficiency.js`), `config.js` (+`segmentMinVolume`), `trafficConversionEngine.js`, `segmentInsights.js`, `reportBuilder.js` (P-16), `forecastExport.js`, `pacing.js` (campo por defecto eliminado, P-12), `changeEngine.js`, `driverEngine.js` (P-13), `home-resumen.js`. Efecto visible: ninguno nuevo respecto de 4.1 (el titular del Inicio conserva la regla de 4.1).

## Problemas eliminados
Mínimo de sesiones triplicado · umbral por defecto paralelo en la exportación y en `summarizePeriod` · segunda regla «arriba/en plan/debajo» dentro del estado del negocio de Fase 2 (ahora delega) · dos fórmulas de brecha.

## Hallazgo importante que corrige a 4.1
Marqué GAP-4 (`a/b − 1`) como «idéntico» a la función canónica usando tolerancia; con comparación exacta **no lo es** (difiere en el último bit en ≈ 78 % de los casos). Por eso **solo se migraron 2 de los 3 casos de P-13**; GAP-4 queda fuera (`MATRIZ_MIGRACION_P13.md`).

## Pruebas
59 pruebas nuevas de 4.2 + 9 de navegador; 276 en total 4.1+4.2. Regresión: **121 scripts Node, 5 verificadores, 249 archivos sin errores de sintaxis y 49 lotes de navegador sin fallas finales** (`RESULTADOS_REGRESION.md`). Datos simulados. Dos lotes de Fase 3 que afirmaban «Z1 no existe en `js/`» se actualizaron: ahora verifican «existe solo en `js/commandCenter/` y sin consumidores».

## Matriz de criterios de aceptación
| # | Criterio | Estado |
|---|---|---|
| 1 | Z1 implementado y reutilizable | ✅ |
| 2 | Z1 alimenta `cc.reliability/1` | ✅ en pruebas; sin consumidor en la app (L-01) |
| 3 | Sin segunda implementación paralela | ⚠ dos copias **textualmente idénticas** (especificación aceptada protegida + port), verificadas por prueba (L-04) |
| 4 | P-16 centralizado y consumido | ✅ |
| 5 | Consumidores usan los contratos | ⚠ parcial: `sampleSufficiency` (3 motores) y `planStatus` (Inicio) sí; `reliability`/`z1`/`findings`/catálogo sin consumidores (L-01, L-02) |
| 6 | P-12 con paridad | ✅ |
| 7 | P-13 solo casos idénticos | ✅ 2 de 3 (GAP-4 no idéntico) |
| 8 | Dato observado no se bloquea por falta de plan | ✅ |
| 9 | Lo no calculable no se inventa | ✅ |
| 10 | Unitarias, integración y regresión pasan | ✅ |
| 11 | Sin cambios fuera de alcance | ✅ (`impactModel`, Home real, persistencia, 4.3 intactos) |
| 12 | Limitaciones documentadas | ✅ |

## Riesgos abiertos y pendientes de datos reales
`LIMITACIONES_Y_RIESGOS.md`. Falta validar con datos reales: relación serie diaria ↔ GA4, tolerancias, comportamiento de Z1 con datos de producción. **Preparado para 4.3:** Z1, reliability, sampleSufficiency, findings y el catálogo listos en `js/`. **No preparado:** consumo visual, D-01/D-06, redondeo de GAP-4/GAP-5.
Decisiones nuevas: P-17…P-21 (`DECISIONES_PENDIENTES.md`).
