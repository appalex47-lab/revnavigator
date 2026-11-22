# Auditoría de Z1 y del evaluador portado

> **Actualización del cierre técnico (ver `docs/cierre-fase-4-1-4-2/`).** Lo siguiente supera a lo escrito más abajo si hay contradicción: (1) `planStatus`, `businessState` y `attentionEngine` ya **no** contienen umbrales de respaldo (solo `FP.config.forecast.pacingThresholds`); (2) `js/commandCenter/z1.js` es un archivo **generado** desde la especificación (`tools/build-z1-port.js`), no una copia manual; (3) los textos de `segments-view` salen de la configuración (P-21 resuelto, límite «textos fijos» cerrado); (4) «121 scripts, 0 fallas» (y «117») incluía **3 scripts omitidos** (requieren archivos externos): son 120 ejecutados + 3 omitidos; (5) existe `reconcileSessionsReport` y `tools/audit/validar-sesiones-ga4.js` para validar sesiones con datos reales; (6) `index.html` carga solo `planStatus.js` y `sampleSufficiency.js` desde `js/commandCenter/`.


**Especificación aceptada (no modificada):** `tools/audit/z1-lectura-ejecutiva.js` (3.2, D-01…D-07). **Port:** `js/commandCenter/z1.js` (`FP.z1`) + `js/commandCenter/businessState.js` (`FP.businessState`). **Prueba:** `tools/test-fase4-2-z1-evaluador.js` (22 comprobaciones).

## 1. Qué es Z1 (inspección de la especificación)
- **Entradas** (las calculan los motores; Z1 no calcula indicadores): periodo (`daysCounted`…), plan (`available`), `revenue` (plan/real a la fecha, brecha, cumplimiento), `activity` (sesiones, pedidos, venta), `forecast` (cierre), `comparable`, `reliability` (soporte, cobertura, avisos, bloqueos, errores), margen y hallazgos.
- **Orden de evaluación (D-05), determinista y registrado en `evaluation.steps`:** 1 integridad y suficiencia de datos · 2 actividad observable · 3 existencia y comparabilidad de la base · 4 indicadores y denominadores · 5 cambios de composición y límites de atribución · 6 nivel de confiabilidad final · 7 elementos de Z1 visibles · 8 veredicto y narrativa. Un bloqueo duro (pasos 1–4) fija «Insuficiente» y ninguna limitación posterior lo degrada a «Baja».
- **Salidas:** nivel (`Alta/Media/Baja/Insuficiente`) y modo, comparabilidad (7 códigos), completitud (`verificada/incompleta/no_verificable`, D-05), cifras visibles (`economic.observed/compliance/contribution`), conclusiones (`cumplimiento`, `conversion`), qué se muestra/oculta/deriva a Z2–Z5, veredicto y narrativa.

## 2. Qué pertenece al evaluador y qué al contrato de confiabilidad
| Pieza | Dueño | Dónde vive |
|---|---|---|
| nivel, causas, comparabilidad, completitud, cifras visibles, conclusiones, narrativa | **Evaluador Z1** | `FP.z1` (`evaluate`, `build`) |
| dimensiones (con tipos de dato), matriz de **usos**, explicación | **`cc.reliability/1`** | `FP.reliability` — **lee** el nivel de Z1, no lo define |
| clasificación arriba/en plan/debajo | **`FP.gap.pacingStatus`** | `FP.businessState` y `FP.planStatus` la **invocan** |
| estado del negocio compuesto (deterioro, saludable…) | `FP.businessState` (port de Fase 2) | solo su eje de cumplimiento se delegó |

## 3. Una sola implementación de las reglas
- **El cuerpo del evaluador en `js/` es textualmente el de la especificación** (B1: comparación del texto completo, 100 % igual); la única diferencia es la inyección de dependencias (`businessState`, `economics`) en lugar de `require`. Cualquier divergencia futura la detecta la prueba. Hay dos copias **idénticas y verificadas**, no dos implementaciones independientes: la especificación aceptada no puede modificarse sin autorización (hash protegido), por eso se conserva como referencia.
- **Corrección de una duplicación oculta:** Z1 usaba `classifyBusinessState` (Fase 2), cuyo eje de cumplimiento volvía a comparar umbrales (una segunda regla de «arriba/en plan/debajo»). En el port, ese eje **delega en `FP.gap.pacingStatus`**; salida idéntica en 20 000 entradas × 4 configuraciones de bandas (bordes 0.99/1.01 y cobertura 0.6 incluidos).
- `reliability.js` no contiene regla de nivel (prueba D3): `assess(i)` usa `FP.z1.build(i)` y devuelve nivel/causas/modo/completitud **iguales** a Z1 en 4 000 entradas (D2).

## 4. Resultados de la auditoría de comportamiento
- 14 escenarios aceptados de 3.2: `build()` y `evaluate()` **idénticos** (C1).
- 4 000 entradas aleatorias con nulos, ceros, sesiones/pedidos ausentes y cobertura en el límite 0.6/0.59: **idénticas** (C2).
- Ausencia ≠ cero: sesiones ausentes → conversión «no verificable» y completitud «incompleta» (E1, N = entradas generadas); pedidos ausentes → ni «cero observado» ni «observable» (E2); cero legítimo (pedidos 0 con sesiones) → «cero observado» (E3); actividad cero verificada → «sin actividad» (E4); datos contradictorios → «no calculable» (E5); **sin plan la venta observada válida se muestra** (E6, D-01).
- Mutaciones (bloqueo duro que degrada a «Baja»; «Alta» que ignora avisos) **se detectan** (F1, F2).

## 5. Casos que no pueden evaluarse (documentado; no se inventa)
| Caso | Resultado |
|---|---|
| sesiones o pedidos ausentes | conversión «no verificable»; completitud «incompleta»; sin conclusión de conversión |
| sin plan / plan 0 | no se clasifica el estado; la venta observada se conserva |
| base no comparable / cambio de composición | comparabilidad explícita; sin atribución forzada |
| vigencia, trazabilidad, muestra | `no_evaluado` si quien llama no aporta el dato/criterio (D-03: sin umbral universal) |
| **No existe** un umbral universal de confiabilidad: el nivel sale de bloqueos duros, límites y avisos explícitos. |

## 6. Limitaciones
- Z1 y la confiabilidad **no están cargados por `index.html` ni consumidos por ninguna vista**: no hay Command Center visual (fuera de alcance). Su integración real es solo de pruebas.
- El port incluye la narrativa y el veredicto de Z1 (texto en español) porque forman parte del evaluador aceptado; no se muestran en la app.
