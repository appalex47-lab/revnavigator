# Command Center Intelligence · Fase 1 — Auditoría, diagnóstico y preparación técnica

Estado de la fase: **COMPLETADA CON LIMITACIONES DOCUMENTADAS** (ver §10 y §H). Estado inicial del repositorio: rama `ccr-a81af632-rirtu7`, commit `a2b38630bb9c0183b920e619567b950953eba31e`, árbol limpio. Los cambios de esta fase **no están confirmados con commit** (el prompt operativo lo exige).

Todo lo que sigue está medido en el código o en pruebas ejecutadas en esta intervención. Lo que no pude comprobar se dice como tal.

---

## A. Resumen ejecutivo

RevNavigator (v0.16.6) es una aplicación de navegador sin framework ni empaquetador: 241 archivos JS (≈51 mil líneas más `app.js` con 6 478), organizados en módulos IIFE que cuelgan de un espacio global `FP`. Tiene motores de cálculo maduros y documentados (venta, pacing, gap, forecast, reforecast, drivers, PVM, escenarios, proyección) y **ya existe una capa de lectura** que el Command Center puede reutilizar: `homeSummaryEngine`, `attentionEngine`, `riskOpportunityEngine`, `actionPriorityEngine`, `narrativeEngine` y los tres agentes (Analista, Auditor, Arquitecto).

Qué se auditó: arquitectura y seguridad del cliente (1.1), inventario módulo→datos→indicadores (1.2), exactitud de los cálculos contra un recálculo independiente (1.3), la integración de IA (1.4) y las brechas hacia el Command Center (1.5).

Qué se corrigió: se añadió una **política de seguridad de contenido (CSP)** que antes no existía; se corrigieron **cuatro textos de interfaz que seguían diciendo que la API key de Cohere se guarda en el navegador** (ya no es cierto); se añadieron **cuatro baterías de pruebas nuevas** (consistencia de cálculos con oráculo independiente, XSS, CSP, IA sin clave local) y un lanzador de baterías; se generó el catálogo de módulos desde el código.

Estado final: **ningún error crítico ni alto** que impida iniciar la Fase 2. Limitaciones que impiden declarar «COMPLETADA Y VALIDADA»: la validación **en vivo** de Cohere y de la concurrencia en Supabase sigue pendiente de credenciales/permisos (§D, §H).

## B. Estado de las cinco subfases

### 1.1 Auditoría de arquitectura y código — completada
- **Actividades:** inspección de `index.html`, estructura de carpetas, arranque, navegación, persistencia, sincronización, seguridad, pruebas y deuda; búsquedas dirigidas (eval, innerHTML, localStorage, fetch, TODO).
- **Flujo real:** `index.html` carga ~239 scripts en orden fijo (config → calendario → modelo/datos → cálculos → forecast → diagnóstico → análisis → informes → interfaz → `app.js`; `lazy.js` difiere pruebas y asistentes). `app.js` crea un único objeto `state`, lee el hash (`readHash`, con alias heredados `#producto`/`#analisis`/`#negocio`/`#paquete`), restaura almacenamiento (`initStorage`), trae lo más nuevo de la nube si la sincronización está activa (`autoPull`) y pinta la vista (`render`). Los motores se calculan bajo demanda (`ensureForecast`…) y las 525 acciones de la interfaz viven en un registro dentro de `app.js`.
- **Navegación:** 27 vistas en 8 grupos (`js/config/guidanceConfig.js`: Inicio, Datos, Planear, Monitorear, Diagnosticar, Recuperar, Crecer, Medir y aprender).
- **Persistencia:** `localStorage` con espacio `fp.v1:` para claves pequeñas; IndexedDB `fp-data` v2 (vía `repository.js`) para datos pesados (historial, plan, real, segmentos, escenarios…); catálogo de productos y clientes en IndexedDB propio.
- **Sincronización:** Supabase `team_blobs` (RLS por equipo), con versión por documento y escritura condicional (migración `put_blob_cas`, aplicada) y detección de conflictos del lado cliente.
- **Seguridad:** sin `eval`/`new Function`; 243 usos de `innerHTML` pasan por `escapeHtml` (verificado con la prueba de inyección, abajo); sin API keys en el cliente; servicios externos solo Supabase y Turnstile (CAPTCHA).
- **Hallazgos y correcciones:**
  - *No había CSP.* Corregido: meta CSP con huella SHA-256 del único script en línea; permite solo el proyecto Supabase y Turnstile; `object-src 'none'`; sin `unsafe-eval` ni `unsafe-inline` en scripts. Efecto colateral documentado: las ayudas de Playwright que evalúan texto (`wait_for_function('…')`) quedan bloqueadas, por lo que las baterías se ejecutan con `tools/regression/run_batch.py` (abre el navegador con `bypass_csp`); la batería de la propia CSP corre sin ese bypass.
  - Deuda sin corregir (documentada en §D): `app.js` de 6 478 líneas; 96 bloques `catch` vacíos; CI solo avisa y no corre las baterías de navegador; `ARCHITECTURE.md` quedó en la v0.12.0 (se añadió una nota al inicio).
- **Pruebas nuevas:** `batch_fase1_csp.py` (10 comprobaciones: política declarada, huella coincide, sin `unsafe-eval`, hosts permitidos = los del código, 27 vistas + reporte + PDF + importación con y sin trabajador sin ninguna violación, y un script inyectado sí se bloquea) y `batch_fase1_seguridad_xss.py` (payloads de HTML/JS en nombre del negocio, eventos, hitos, columnas de texto y nombre de archivo de un CSV real; las 27 vistas y el reporte imprimible no ejecutan nada; incluye control positivo; con `escapeHtml` anulado la batería falla en 3 comprobaciones).
- **Archivos:** `index.html`, `tools/regression/run_batch.py`, las dos baterías, `ARCHITECTURE.md` (nota).

### 1.2 Inventario de módulos, datos e indicadores — completada
- **Entregable:** `docs/command-center/generated/CATALOGO_MODULOS.md`, **generado del código** por `tools/audit/fase1_catalogo.py` (se puede regenerar): por archivo, propósito (cabecera), `FP.*` que exporta, líneas y si hay referencia en pruebas; más el **mapa archivo de interfaz → familias de motores que consume**.
- **Datos de entrada:** colecciones `historical`, `plan`, `actual`, `segments` del almacén (`FP.dataStore`), catálogo de productos y clientes (IndexedDB), eventos, hitos y configuración de negocio. **Canales:** ecommerce, app, whatsapp, llamadas. **Métricas base:** venta, pedidos, volumen (sesiones), CR, AOV.
- **Fuentes de verdad por indicador** (confirmadas en código y en el recálculo de 1.3):

| Indicador | Fuente de verdad | Quién lo consume (sin recalcular) |
|---|---|---|
| Venta/pedidos/volumen acumulados y plan de los mismos días | `calculations/pacing.js` | Inicio, Pacing, reporte, agentes |
| gap, gapPct, cumplimiento | `calculations/gap.js` → `metrics.calcGap` | Inicio, atención, reporte, Directivo |
| CR y AOV | `metrics.js` (`calcConversionRate`, `calcAov`), vía `model/derivations.js` | todo; CR/AOV nunca se promedian |
| Forecast de cierre, forecast gap | `forecast/forecastEngine.js` + `forecastMethods.js` | Inicio, reporte |
| Reforecast requerido | `forecast/reforecastEngine.js` | Recovery, reporte |
| Atribución de la brecha (tráfico×CR×AOV) | `diagnostics/attribution.js` + `driverEngine.js` | Diagnóstico, Inicio, Analista |
| Volumen·precio·mezcla | `analytics/pvmEngine.js` | Producto y evolución |
| Proyección del año siguiente | `projection/projection.js` | Planear |

- **Duplicaciones detectadas (no corregidas a propósito, documentadas):**
  1. La variación «a ÷ b − 1» aparece ≈25 veces fuera de los motores centrales (comparaciones periodo contra periodo en `ui/`, `analytics/`, `promotions/`, `projection/`), con guardas distintas (`b > 0` vs `b !== 0`). Es el mismo concepto con tratamiento de denominadores inconsistente; unificarlo toca muchas pantallas y es parte del diseño de la Fase 2.2.
  2. `reforecastEngine.js:116-117` reimplementa CR y AOV inline; su semántica es la de `metrics` salvo denominadores negativos, que no existen en los datos. Se deja como está (no se tocan motores que funcionan).
  3. Dos «sistemas» de derivación (`metrics` y `model/derivations.js`): el segundo delega en el primero, no hay doble fórmula.
- **Disponibilidad y calidad de datos:** modelada en `model/availability.js` y `quality/*`; el inventario no encontró indicadores sin origen rastreable en los módulos revisados.

### 1.3 Motores de cálculo y diagnósticos — completada
- **Catálogo de fórmulas (extraído de las cabeceras documentadas):** `Pedidos = sesiones × CR`; `Venta = pedidos × AOV`; `gap = real − plan`; `gapPct = (real − plan)/plan`; `cumplimiento = real/plan`; el plan se compara siempre contra los **mismos días contados**; sumas estrictas (un faltante no se trata como cero); forecast = real en días contados + proyección por método (A plan restante, B índice acumulado, C índice reciente, D por drivers); reforecast = lo que tendría que ocurrir para conservar la meta; atribución secuencial (suma telescópica exacta) o Shapley; PVM con reconciliación exacta; escenarios derivados con las fórmulas centrales.
- **Prueba nueva con oráculo independiente** `batch_fase1_consistencia_calculos.py` (18 comprobaciones, aplicación real): recalcula desde los registros crudos del almacén (sin pasar por los motores) y compara con el forecast/pacing por canal y total, anual y mensual: venta, plan, brecha, brecha %, cumplimiento, pedidos, sesiones, CR (Σpedidos/Σsesiones) y AOV (Σventa/Σpedidos); la suma de canales = total; Inicio y el reporte ejecutivo muestran lo mismo que el motor; el diagnóstico cumple Σ contribuciones = brecha, delta = actual − base, venta = sesiones×CR×AOV y todas sus validaciones internas. **Resultado: 18/18.** Con una mutación deliberada (cumplimiento ×1.001) la batería falla en 10 comprobaciones.
- **Casos límite:** cubiertos por las 233 pruebas del motor (`selftest-node`: plan 0, días nulos, faltantes, mes parcial, etc.) y las baterías de pruebas por área; no se encontraron errores de cálculo ni se modificó ninguna fórmula.
- **Archivos:** `tools/regression/batch_fase1_consistencia_calculos.py`.

### 1.4 Cohere e inteligencia artificial — completada (sin validación en vivo)
- **Arquitectura real:** navegador → `cohereClient.chatJson` → `cohereProxy` (JWT de la sesión de equipo) → Edge Function `cohere-proxy` (versión 3 desplegada, `verify_jwt`) → Cohere. La API key vive solo como secreto del servidor. No hay llamada directa ni respaldo con key local (eliminados). La función valida sesión no anónima, equipo, cuerpo y modelo, y aplica límites por persona (10/min, 300/día, falla cerrado).
- **Módulos que usan IA y su protección:** hipótesis de diagnóstico, líneas de acción y «ampliar», narrativa ejecutiva, asistente conversacional de Análisis, agentes (Analista/Auditor/Arquitecto), mapeo semántico de columnas y tipo de archivo (solo encabezados, columnas con datos personales protegidas), hipótesis de presentación. Cada una pasa la respuesta por un validador antes de mostrarla: JSON con forma esperada, **cifras solo del payload calculado** (con tolerancia de formato), lenguaje de posibilidad (no causal), entidades/señales existentes y reintento único ante cifras inventadas; si falla, el resultado determinístico sigue ahí.
- **Qué puede hacer hoy la IA:** redactar y ordenar lo ya calculado, proponer hipótesis y líneas de acción **como posibilidades**, responder preguntas sobre resultados ya calculados. **Qué no puede:** calcular o corregir cifras, afirmar causas, inventar entidades, persistir sus textos salvo las hipótesis que la persona acepta en una presentación; el registro de transparencia (`cohereAudit`) vive solo en memoria y no guarda valores ni respuestas.
- **Hallazgo corregido:** cuatro textos de interfaz y dos comentarios seguían afirmando que la API key se escribe/guarda en el navegador (`diagnostic-view`, `narrative-view`, `action-plan-view`, `settings-view`, `cohereDiagnostic`, `cohereAudit`). Corregidos y protegidos con una prueba que falla si reaparecen.
- **Prueba nueva:** `tools/test-fase1-ia-sin-clave-local.js` (12 comprobaciones): ningún texto afirma una key local; ningún archivo menciona `api.cohere.com`; los 9 módulos que llaman a Cohere tienen validador reconocible. *Limitación:* esa última comprobación es estructural; el comportamiento (rechazo de cifras inventadas) lo cubren las pruebas existentes de cada módulo (`test-report-ai`, `test-phase27-assistant`, `test-retry-cifras`, `test-agents-*`, `test-phase23-*`, `test-expand-action`).
- **No validado:** una llamada real navegador → proxy → Cohere, la existencia del secreto `COHERE_API_KEY` y el comportamiento ante errores/timeouts reales de Cohere (sin red ni credenciales en este entorno). Procedimiento en `docs/presentation-intelligence/HARDENING_FINAL.md`, apéndice C.

### 1.5 Brechas y preparación — completada
Ver §H (evaluación) y la tabla de brechas en §D.

---

## C. Problemas detectados y resueltos
| Problema | Causa | Solución | Evidencia |
|---|---|---|---|
| Sin política de seguridad de contenido | Nunca se declaró (sitio estático en GitHub Pages, sin cabeceras) | Meta CSP + huella del script de arranque | `batch_fase1_csp.py` 10/10; las 179 baterías y 94 archivos Node siguen pasando |
| Textos que afirmaban una API key local | Quedaron del diseño anterior a la eliminación de la llamada directa | Textos corregidos | `test-fase1-ia-sin-clave-local.js` |
| Riesgo de XSS no verificado | 243 `innerHTML` sin una prueba global | Batería con payloads en todas las fuentes de texto | `batch_fase1_seguridad_xss.py` 5/5; falla si se anula el escape |
| Exactitud de cálculos solo probada con datos sintéticos de unidad | — | Oráculo independiente sobre la app real | `batch_fase1_consistencia_calculos.py` 18/18 |
| Documentación desactualizada | `ARCHITECTURE.md` en v0.12.0 | Nota al inicio + catálogo generado | `docs/command-center/` |

## D. Problemas y brechas no resueltos (clasificados)
| # | Brecha | Clase | Impacto / motivo |
|---|---|---|---|
| 1 | Validación en vivo de Cohere (secreto, llamada real, errores) y de la concurrencia con dos conexiones simultáneas en Supabase | **Alta** (bloquea Fase 5.5 y 6.3, no la Fase 2) | Falta acceso/credenciales; procedimiento documentado |
| 2 | Cuatro modelos de «hallazgo» en paralelo (`attentionEngine`, detectores de agentes, `narrativeEngine`, `riskOpportunityEngine`) sin un contrato común de evidencia y certeza | **Alta** | Es el centro de la Fase 2.1/2.4; no se unifica aquí (sería construir el modelo) |
| 3 | Cuantificación económica no unificada: hay montos en oportunidades de promociones, proyección y escenarios, pero `riskOpportunityEngine`/`actionPriorityEngine` puntúan sin dinero y no distinguen potencial teórico de alcanzable (regla 5.6) | **Alta** | Fase 2.5 y 4.5 |
| 4 | `app.js` de 6 478 líneas y 525 acciones en un solo registro | **Media** | Riesgo al integrar el Command Center; refactor fuera de alcance |
| 5 | Variación «a/b−1» duplicada ≈25 veces con guardas inconsistentes | **Media** | Fase 2.2 (helper común); sin error de resultados observado |
| 6 | CI solo avisa y no corre baterías de navegador | **Media** | Decisión del dueño del repositorio (volverlo bloqueante) |
| 7 | 96 `catch` vacíos | **Media** | Algunos pueden ocultar errores; revisar en 6.x |
| 8 | 140 de 241 módulos sin referencia directa por nombre en pruebas (el motor sí se ejercita completo vía `selftest-node`, que carga todos) | **Baja** | Medida heurística |
| 9 | ≈80 informes `REPORTE_*.md` en la raíz | **Baja** | Orden documental |

## E. Resultados de pruebas
| Batería | Resultado |
|---|---|
| Pruebas Node (`tools/test-*.js`) | 94 archivos, **0 fallas** (incluye `test-fase1-ia-sin-clave-local.js`, 12/12) |
| Pruebas del motor (`selftest-node`) | **233 de 233** |
| Baterías de navegador (`run_batch.py`) | **179 de 179 con código 0; 3 715 ✔ / 0 ✘** (incluye las 3 nuevas de la Fase 1 y las de sincronización, PDF y cierre técnico) |
| Lint de diseño | 193 hallazgos = línea base, sin nuevos |
| Mutaciones de verificación | cumplimiento ×1.001 → 10 fallas; `escapeHtml` anulado → 3 fallas (ambos revertidos, `git diff` limpio) |
| No ejecutadas | Cohere real, Supabase real (HTTP), móvil real: sin acceso en este entorno |

## F. Archivos modificados o creados
- `index.html` — meta CSP.
- `ARCHITECTURE.md` — nota de vigencia.
- `docs/presentation-intelligence/PROMPT_PARA_OTRA_IA.md` — comando de ejecución de baterías.
- `js/ui/diagnostic-view.js`, `js/ui/narrative-view.js`, `js/ui/action-plan-view.js`, `js/ui/settings-view.js`, `js/ai/cohereDiagnostic.js`, `js/ai/cohereAudit.js` — textos sobre la API key.
- Nuevos: `tools/regression/run_batch.py`, `tools/regression/batch_fase1_csp.py`, `batch_fase1_seguridad_xss.py`, `batch_fase1_consistencia_calculos.py`, `tools/test-fase1-ia-sin-clave-local.js`, `tools/audit/fase1_catalogo.py`, `docs/command-center/FASE_1_AUDITORIA.md`, `docs/command-center/ESTADO.md`, `docs/command-center/generated/CATALOGO_MODULOS.md`.
- No se modificó ningún motor de cálculo ni ninguna estructura de datos. Escaneo de credenciales en el diff: ninguna.

## G. Arquitectura y capacidades finales
Cliente estático con CSP; motores determinísticos con contratos documentados y verificados contra un oráculo independiente; capa de lectura reutilizable (`homeSummaryEngine`, `attentionEngine`, `riskOpportunityEngine`, `actionPriorityEngine`, `narrativeEngine`); IA solo vía servidor del equipo con validación posterior; persistencia local con sincronización versionada y detección de conflictos; informes ejecutivos en tres formatos sobre una única fuente de cálculo.

## H. Preparación para la Fase 2
**Lista:** lectura de negocio determinística (cumplimiento, gap, forecast, drivers, canales, confianza); diagnóstico con evidencia y validaciones; priorización de señales; narrativa con certeza por afirmación; un contrato de IA con validación.
**A considerar en el diseño de la Fase 2:**
1. Un único contrato de «hallazgo» (indicador, valor, referencia, periodo, fuente, método, evidencia, confianza, limitaciones, y tipo: hecho/inferencia/hipótesis/recomendación) que unifique los cuatro modelos actuales.
2. Un helper común de variación con una política de denominadores única.
3. Cuantificación económica con tres niveles: observado, potencial teórico, alcanzable; sin inventar margen/CAC/ROAS.
4. Reutilizar, no reconstruir: `homeSummaryEngine`/`attentionEngine` ya componen sin recalcular.
5. El Command Center vivirá en `app.js` (o un módulo nuevo): conviene definir su punto de integración desde la 2.1 para no engrosar el archivo.

## I. Riesgos residuales
- Cohere real y concurrencia con dos conexiones sin validar en vivo.
- La CSP depende del host Supabase configurado: si cambia el proyecto hay que actualizar la meta (hay una prueba que lo detecta) y la huella del script de arranque si se edita.
- Las baterías de navegador requieren `run_batch.py`; ejecutar una batería directamente hoy falla en las que usan `wait_for_function` con texto.
- Deuda de `app.js` y de `catch` vacíos.

## 10. Dictamen

**COMPLETADA CON LIMITACIONES DOCUMENTADAS.**

No emito la declaración de «COMPLETADA Y VALIDADA» porque el criterio 5 («las capacidades de Cohere estén verificadas») solo se cumple por código y pruebas, no por una llamada real, y esa verificación requiere credenciales y red que este entorno no tiene. Ninguna de las limitaciones impide iniciar la Fase 2, que es de diseño de arquitectura; sí condicionan las Fases 5.5 y 6.3. **La Fase 2 no se inicia sin tu autorización.**
