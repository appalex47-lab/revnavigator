# Catálogo de fuentes de verdad (consolidado)

> **Actualización del cierre técnico (ver `docs/cierre-fase-4-1-4-2/`).** Lo siguiente supera a lo escrito más abajo si hay contradicción: (1) `planStatus`, `businessState` y `attentionEngine` ya **no** contienen umbrales de respaldo (solo `FP.config.forecast.pacingThresholds`); (2) `js/commandCenter/z1.js` es un archivo **generado** desde la especificación (`tools/build-z1-port.js`), no una copia manual; (3) los textos de `segments-view` salen de la configuración (P-21 resuelto, límite «textos fijos» cerrado); (4) «121 scripts, 0 fallas» (y «117») incluía **3 scripts omitidos** (requieren archivos externos): son 120 ejecutados + 3 omitidos; (5) existe `reconcileSessionsReport` y `tools/audit/validar-sesiones-ga4.js` para validar sesiones con datos reales; (6) `index.html` carga solo `planStatus.js` y `sampleSufficiency.js` desde `js/commandCenter/`.


| Dato | Fuente canónica | Respaldo | Notas |
|---|---|---|---|
| Venta real | serie diaria «Venta real / Actual» (modelo canónico, `FP.metrics`) | ninguno: «No disponible» | observado ≠ estimado |
| **Sesiones** | **serie diaria por canal `traffic_volume`** (ver §1) | **ninguno** | segmentos GA4 = desglose |
| Pedidos, CR, AOV | derivaciones sobre sumas (`FP.metrics`) | — | 15 reimplementaciones (ver `CATALOGO_METRICAS_CANONICAS.md`) |
| Plan | plan original congelado → plan importado → «Sin plan» | — | plan 0 = no disponible |
| Brecha / cumplimiento | `FP.gap` | — | 6 reimplementaciones |
| Estado frente al plan | `FP.gap.pacingStatus` + `pacingThresholds` | — | contrato `cc.plan_status/1` |
| Forecast | `forecastEngine` | — | etiqueta de estimación |
| Impacto económico | `FP.economics` (`cc.economic_impact` v2) | — | sin consumidores productivos; D-01/D-06 → 4.5 |
| Nivel de confiabilidad | Z1 (spec, D-05) | — | `cc.reliability/1` lo lee, no lo redefine |
| Persistencia | localStorage + IndexedDB; nube solo con sesión (no usada) | — | sin cambios |

## 1. Sesiones (P-02) — política `cc.sessions_policy/1` (`FP.metricCatalog.SESSIONS_POLICY`)
Determinada a partir de la arquitectura real (19 pruebas en `test-fase4-1-sesiones.js`), no asumida:

| | Fuente primaria | Fuente secundaria |
|---|---|---|
| **Qué es** | serie diaria por canal `traffic_volume` (`sessions ↔ trafficVolume`) | almacén de segmentos (export GA4 convertido `ga4_segments`/`ga4_traffic` o archivo `segments_file`) |
| **Universo** | ecommerce y app: sesiones; **WhatsApp y Llamadas: contactos** | **solo sitio y app** (GA4 no mide WhatsApp ni Llamadas) |
| **Granularidad** | día × canal | día × dimensión × segmento |
| **Periodo** | el de los datos cargados | el del archivo cargado (puede diferir) |
| **Deduplicación** | una fila por fecha × canal | dentro de una dimensión los segmentos suman el universo de esa dimensión; **entre dimensiones no se suman** (un visitante aparece en varias); `users/new_users` no son sumables |
| **Quién la usa** | plan, forecast, pacing, CR, atribución, totales | desgloses por dimensión (motor de tráfico y conversión, vista de segmentos) |

- **Evidencia:** `canonical.js` (campo y perfiles), `forecastEngine`/`derivations` (consumen `trafficVolume`), `availability.js` (`NON_GA4`), `trafficConversionEngine` (total = dimensión de referencia; «no se suman entre dimensiones»).
- **Respaldo:** **ninguno.** Sin la primaria para el canal y periodo se informa «sesiones no disponibles»; el total de una dimensión de segmentos **nunca** sustituye al total del canal.
- **Conciliación:** `FP.metricCatalog.reconcileSessions(a, b, {tolerancePct?})`: mismo canal y periodo; nunca suma (`sum: null`); estados `datos_faltantes` · `no_comparable` · `sin_diferencia_observada` · `discrepancia_sin_criterio` · dentro/fuera de una tolerancia **declarada por quien llama**; `formal: false` siempre.
- **Casos sin información / discrepancias:** se reportan con la diferencia; no se ocultan ni se rellenan con la otra fuente.
- **Lo que NO se pudo establecer (no se inventa):** si la serie diaria y GA4 miden exactamente las mismas sesiones (definición y filtros); qué discrepancia es normal; **no existe tolerancia aprobada entre ambas** (la única del código, 5 % `COVER_TOL`, compara una dimensión contra la dimensión de referencia, no contra la serie diaria, y no se reutiliza). Requiere datos reales y validación (limitación L-02).
