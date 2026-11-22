# Matriz de pruebas — Fase 4.2

> **Actualización del cierre técnico (ver `docs/cierre-fase-4-1-4-2/`).** Lo siguiente supera a lo escrito más abajo si hay contradicción: (1) `planStatus`, `businessState` y `attentionEngine` ya **no** contienen umbrales de respaldo (solo `FP.config.forecast.pacingThresholds`); (2) `js/commandCenter/z1.js` es un archivo **generado** desde la especificación (`tools/build-z1-port.js`), no una copia manual; (3) los textos de `segments-view` salen de la configuración (P-21 resuelto, límite «textos fijos» cerrado); (4) «121 scripts, 0 fallas» (y «117») incluía **3 scripts omitidos** (requieren archivos externos): son 120 ejecutados + 3 omitidos; (5) existe `reconcileSessionsReport` y `tools/audit/validar-sesiones-ga4.js` para validar sesiones con datos reales; (6) `index.html` carga solo `planStatus.js` y `sampleSufficiency.js` desde `js/commandCenter/`.


Todo con **datos simulados**. Se separa lo ejecutado de lo no ejecutado; nada de lo no ejecutado se cuenta como aprobado.

## A. Unitarias (Node, contexto limpio de navegador donde aplica)
| Prueba | Cubre | Resultado |
|---|---|---|
| `test-fase4-2-z1-evaluador.js` | Z1 portado: texto idéntico a la especificación; 14 escenarios; 4 000 entradas aleatorias (nulos, ceros, ausentes, cobertura 0.6/0.59); `businessState` 20 000 × 4 bandas; ausencia ≠ cero; D-01; mutaciones | **22/22** |
| `test-fase4-1-confiabilidad.js` | contrato de confiabilidad (spec) 4 000 entradas, escenarios, mutaciones | 23/23 |
| `test-fase4-1-contratos-js.js` | ports en `js/` = especificaciones (texto y comportamiento); `sampleSufficiency` E1–E12; estado de integración (D5) | 30/30 |
| `test-fase4-2-p16-minimo-sesiones.js` | mínimo de sesiones: equivalencia en 20 013 tráficos; una sola fuente; motores reales | **12/12** |
| `test-fase4-1-estado-comercial.js` | contrato `plan_status` (30), ahora delegando en `FP.gap.pacingStatus` | 30/30 |
| `test-fase4-1-metricas-y-fuentes.js` · `…-reimplementaciones.js` · `…-sesiones.js` · `…-tolerancias.js` | catálogo, 21 sitios, política de sesiones, tolerancias | 26 · 27 · 19 · 9 |
| `test-fase4-2-p13-migracion.js` | GAP-3/GAP-6 idénticas bit a bit (200 169 pares), GAP-4 no idéntica, sitios no migrados intactos | **10/10** |

## B. Integración
| Prueba | Cubre | Resultado |
|---|---|---|
| `test-fase4-2-z1-evaluador.js` D1–D3 | Z1 → `reliability` (nivel, causas, modo y completitud idénticos, 4 000 entradas) | ✔ |
| `test-fase4-1-estado-consumidores.js` | código **real** de `home-resumen` (vía `planStatus`) y `contextEngine` frente a `FP.gap.pacingStatus` (20 000 × 4 configuraciones) | 15/15 |
| `batch_fase4_2_contratos.py` (**navegador**) | carga real; Inicio con umbral por defecto y personalizado; **exportación** `pacing_status` en 66 periodos; paridad Pacing ↔ exportación; P-16 en la app; vistas renderizan sin errores | **9/9** |
| `test-fase4-2-p16…` C1–C3 | `sampleSufficiency` → `trafficConversionEngine`, `segmentInsights` | ✔ |
| `test-fase4-2-p13…` C1 | funciones canónicas → `changeEngine`/atribución | ✔ |

## C. Escenarios comerciales (`test-fase4-2-escenarios-integracion.js`, **15/15**, cadena `planStatus` + Z1 + reliability + sampleSufficiency + métricas + conciliación)
Venta superior (S1) · inferior (S2) · exactamente en el límite 0.99/1.01 (S3) · sesiones ausentes (S4) · conversión sin denominador (S5) · ticket con datos incompletos (S6) · muestra insuficiente (S7) · datos contradictorios (S8) · segmentos con volúmenes distintos (S9) · serie diaria vs GA4 (S10) · plan ausente (T1) · plan 0 (T2) · cero real ≠ ausencia (T3) · ausencia nunca produce conclusión (T4) · sin umbral universal (T5).

## D. Regresión: ver `RESULTADOS_REGRESION.md` (121 scripts Node, 5 verificadores, 249 archivos `js/` sin errores de sintaxis, 49 lotes de navegador).

## E. No ejecutado / pendiente
- Validación **visual** del Command Center: no existe en la aplicación; no se ejecutó ni se afirma.
- Pruebas con datos reales (FESA, GA4 real): fuera de alcance.
- Integración de `reliability`/`z1`/`findings` con vistas: no hay consumidores todavía.
- Los 139 lotes de navegador restantes (de 188) no se ejecutaron: no se relacionan con los archivos modificados (se eligieron los de segmentos, tráfico, cambios, diagnóstico, forecast/pacing, exportación, reporte, inicio, recuperación y Fase 2/3).
