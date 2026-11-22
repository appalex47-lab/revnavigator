# Investigación H-02 — «Tráfico y conversión» poblado en una ejecución y como índice en otra

> Rama `ccr-a81af632-rirtu7`, commit `625daec`. Navegador aislado, sin sesión. Scripts: `/tmp/q/aud/h02.py` (no versionado).

## 1. Dictamen
**Reproducible, determinista y explicado: depende de cuántos de los 6 archivos generados se confirmaron; no hay condición de carrera ni fuentes de verdad contradictorias dentro del módulo.** Causa raíz confirmada con 2 ejecuciones controladas. El «índice» que se veía era el encabezado del módulo + su estado vacío (`Todavía no hay segmentos cargados`).

## 2. Evidencia
Flujo: «Datos de prueba» → Carga → «Revisar todos los datasets generados» (`stage-all-generated`) → 6 archivos en revisión.
| Ejecución | Confirmaciones | Registros de segmentos (`FP.dataStore.segmentIndex(...).list`) | Vista `#segmentos` |
|---|---|---|---|
| Rápida (como la revisión visual): 1 clic y salir a los 2 s | 1 de 6 | **0** (sigue en 0 tras 15 s) | encabezado + «Todavía no hay segmentos cargados» (973 caracteres) |
| Completa: confirmar los 6 esperando cada importación | 6 de 6 | **1 814** | poblada: cascada, tablas y 12 827 caracteres |
En la revisión visual hubo una ejecución que confirmó los 6 y otra que no (cuatro clics con esperas de 4 s sobre importaciones de ~13 s).

## 3. Respuestas a las preguntas
| # | Pregunta | Respuesta |
|---|---|---|
| 1 | Fuente | El archivo **Segmentos** (`state.store`, colección `segments`) — `js/ui/segments-view.js:285` (`FP.dataStore.segmentIndex`) |
| 2 | Cálculos | `FP.trafficConversionEngine` (descomposición tráfico → CR → ticket vía `FP.attribution`), y `segments-decomp-view.js` solo dibuja (no calcula) |
| 3 | Filtros | canal y periodo de `state.dx.settings` (comparten Diagnóstico y Tráfico y conversión); dimensión del archivo |
| 4 | Estado global | `state.store`, `state.dx` (`ensureDiagnostic()`, `js/app.js:413`, memoizado por `dx.base/dx.baseRf`) |
| 5 | Valores almacenados | registros canónicos de segmentos (persistentes) |
| 6 | Valores recalculados | `dx.run` (diagnóstico) en cada cambio de plan/forecast/filtro |
| 7 | Inicialización vs recarga | no se observó diferencia con los datos ya confirmados (el store persiste; la persistencia de **segmentos** tras recargar no se verificó de forma específica, sí la de plan/real: 88/120) |
| 8 | Orden de carga | solo importa que el archivo de segmentos esté **confirmado**; no depende del orden entre archivos |
| 9 | Condiciones de carrera | **No observadas**: 2/2 ejecuciones coinciden con la hipótesis de confirmaciones |
| 10 | Fuentes de verdad distintas | **Sí, a nivel de la aplicación (no del módulo)**: las **sesiones** vienen de dos fuentes: `traffic_volume` diario del dataset «real» (Pacing, Diagnóstico nivel 1, Home) y el archivo de **segmentos** GA4 (Tráfico y conversión, nivel 2). Son datasets distintos que pueden no coincidir; `js/ui/segments-view.js:228` recalcula CR con una fórmula propia además de `derivations.js` |

## 4. Hipótesis descartadas
Condición de carrera (descartada: determinista); estado global obsoleto (descartado: store 0 vs 1 814 explica todo); error de cálculo (descartado: 0 errores de consola; el motor pasa 8 pruebas de `test-traffic-all.js` y 64 de atribución).

## 5. Hallazgos derivados
- UX: el estado vacío no dice cuántos archivos faltan confirmar; el índice «Tres formas de investigar» aparece sobre un estado vacío y parece un «índice».
- Arquitectura: dos fuentes de sesiones (ver `MAPA_FUENTES_DE_VERDAD.md`).
