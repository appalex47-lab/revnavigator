# Contrato `cc.sample/1` — suficiencia de muestra y P-16

> **Actualización del cierre técnico (ver `docs/cierre-fase-4-1-4-2/`).** Lo siguiente supera a lo escrito más abajo si hay contradicción: (1) `planStatus`, `businessState` y `attentionEngine` ya **no** contienen umbrales de respaldo (solo `FP.config.forecast.pacingThresholds`); (2) `js/commandCenter/z1.js` es un archivo **generado** desde la especificación (`tools/build-z1-port.js`), no una copia manual; (3) los textos de `segments-view` salen de la configuración (P-21 resuelto, límite «textos fijos» cerrado); (4) «121 scripts, 0 fallas» (y «117») incluía **3 scripts omitidos** (requieren archivos externos): son 120 ejecutados + 3 omitidos; (5) existe `reconcileSessionsReport` y `tools/audit/validar-sesiones-ga4.js` para validar sesiones con datos reales; (6) `index.html` carga solo `planStatus.js` y `sampleSufficiency.js` desde `js/commandCenter/`.


**Módulo:** `js/commandCenter/sampleSufficiency.js` (**cargado por `index.html`**). **Pruebas:** `test-fase4-1-contratos-js.js` (E1–E12), `test-fase4-2-p16-minimo-sesiones.js` (12), `test-fase4-2-escenarios-integracion.js` (S7, S9, T5), lote de navegador `batch_fase4_2_contratos.py` (D1).

## 1. Criterio contextual (sin umbral universal)
Por **operación** (mostrar · calcular desviación · diagnosticar · estimar impacto) × tipo de métrica (importe/conteo/tasa). Base de cada resultado: `estructural`, `criterio_repo:<id>`, `criterio_declarado` o `sin_criterio` (→ `no_evaluado`). `universalThreshold: false` siempre. Detalle de reglas en `docs/fase-4-1-integridad/CONTRATO_CONFIABILIDAD.md` §2.

## 2. P-16 — el mínimo de sesiones por segmento, centralizado
**Regla (conservada):** el **mayor** entre un piso de 500 sesiones y el 1 % del tráfico del periodo.
| Sitio | Antes | Ahora |
|---|---|---|
| `trafficConversionEngine.js:76` | `Math.max(500, Math.ceil(0.01 * T1all))` | `FP.sampleSufficiency.segmentMinSessions(T1all)` |
| `trafficConversionEngine.js:47` (respaldo) | `dec.minSessions \|\| 500` | `… \|\| segmentMinSessions(0)` |
| `segmentInsights.js:14,37` | constantes `MIN_SESSIONS`, `MIN_SHARE` | `segmentMinSessions(T)` (constantes y exportaciones eliminadas) |
| `reportBuilder.js:549,558` | `SEG_MIN_SESSIONS`, `SEG_MIN_SHARE` | `segmentMinSessions(T)` |
| **Fuente única** | — | `FP.config.diagnostics.segmentMinVolume = { minSessions: 500, minShare: 0.01 }` (`js/config/config.js`) |

- **Equivalencia:** idéntica a la fórmula anterior en 20 013 tráficos (bordes 49 999/50 000/50 001 y redondeo hacia arriba), y los motores reales devuelven el mismo `minSessions`/`threshold` (C1, C2).
- **Una sola fuente de verdad:** cambiar la configuración cambia el umbral en ambos motores a la vez (C3). Sin configuración la función falla con mensaje claro (no cae en un valor copiado).
- **Diferencias contextuales conservadas explícitamente:** el **tráfico base `T`** lo aporta cada sitio según su contexto (total de la dimensión en `trafficConversionEngine`; total del periodo en `segmentInsights`; total del reporte); un mínimo elegido por el usuario (`minSessions`) sigue ganando sobre el automático. No se convirtió en regla universal: es el criterio de **visibilidad de un segmento** y no se reutiliza para otras operaciones.
- **Residual:** los textos de ayuda de `segments-view` («el mayor entre 500 y el 1 % del tráfico») siguen escritos a mano (texto estático): deuda D-7.
