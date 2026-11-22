# Dictamen independiente · Fases 4.1 y 4.2 (RevNavigator Command Center Intelligence)

Fecha: 2026-11-20 · Base Git: `625daec` en la rama `ccr-a81af632-rirtu7` (todo el trabajo posterior está **sin commit**).
**Este documento no acepta ninguna fase.** La aceptación formal corresponde al usuario. No se inició 4.3.

## 1. Evidencia de verificación (reproducible)

| Verificación | Resultado | Cómo se comprobó |
|---|---|---|
| Node: 135 entradas (pruebas, `selftest-node`, verificadores 3.1–3.5, `build-z1-port --check`) | **135/135 con código 0** (repetida tras el último cambio) | `tools/test-*.js`, `tools/audit/verificar_consistencia_3_*.py` |
| Autoprueba del paquete de validación externa | 27/27; `entrada-real/` intacta (hash antes/después) | `node tools/test-validacion-externa.js` |
| Navegador | **189/189 ejecutadas**: 186 en verde, **1 con fallo real preexistente**, 2 omitidas por archivos externos ausentes | `tools/regression/run_batch.py` + lectura de cada log (el código de salida NO sirve: ver §6) |
| Reanudación tras reinicios del entorno | sin omitir ni duplicar: 105 → 116 → 189, sin líneas duplicadas | registro por lote |
| Z1 generado vs. especificación | coincide | `node tools/build-z1-port.js --check` |
| Validación externa real | E-1 aprobada; E-3 aprobada; E-2 ejecutada con limitación aceptada | `tools/validacion-externa/salida/real/` |

**Fallo real de navegador (uno):** `batch_controles` CT-3: «Quitar margen» (`#ajustes`, acción `margin-clear`) aparece deshabilitado sin explicar por qué. **Reproducido igual sobre una copia limpia de HEAD** (`git archive`), por lo tanto es preexistente y no lo introdujeron 4.1/4.2.
**Lotes omitidos (2):** `batch_real_ga4` (falta `/mnt/user-data/uploads/Segmentos_2026.csv`) y `batch_w` (falta `/tmp/w/venta.xlsx`). **Script Node omitido (1):** `test-phase21-real` en su ruta por defecto; sus 7 aserciones sí se ejecutaron con el CSV real de productos en E-1.

### Pruebas modificadas y comprobación de que no se debilitaron
Se revisó el diff contra HEAD de las 20 pruebas/lotes modificados. Sin aserciones eliminadas sin reemplazo. Cambios, por naturaleza:
- **Carga de módulos añadidos** (`metrics.js`, `gap.js`, `sampleSufficiency.js`, config real) en 12 pruebas: necesario porque el código migró a funciones canónicas; no altera aserciones.
- **Aserciones añadidas** (p. ej. signo y valor de la brecha en `test-change-engine`).
- **Cambios de contenido que se declaran expresamente** (decisión de revisión del usuario):
  1. `test-phase21-forecast`: dos aserciones de etiquetas de la UI de la fase 21 («Inicio del patrón actual», «Duración del patrón») se conservan solo contra la instantánea externa; contra el código actual se verifican las etiquetas vigentes y que el motor sigue entregando inicio y duración. (La UI las retiró en el commit `68b4aef`.)
  2. `test-report-directivo`: el borde de «a la par» pasa de ±0.5 % a ±1 % (regla central `pacingThresholds`, P-11).
  3. `batch_fase3_1_home_auditoria` y `batch_fase3_2_z1_wireframe`: «nada de Z1/businessState en `js/`» pasa a «nada **fuera de `js/commandCenter/`**», porque 4.1/4.2 los integraron a propósito; la regla sigue vigilando que ninguna vista los defina o los invoque directamente.
  4. `test-phase20-diagnostic`, `test-phase21-forecast`, `test-phase21-real`: dejan de **omitirse** en silencio y ejecutan el código actual (más cobertura).
  5. `batch_inicio_chip`: el chip se valida con la misma regla que Pacing (`FP.gap.pacingStatus`).
- Defecto de **mi propia autoprueba** corregido en esta ronda: borraba archivos reales de `entrada-real/` (restaurados con hashes idénticos) y ahora trabaja en un directorio aislado.

## 2. Dictamen 4.1 · Fuentes y contexto

**Técnicamente completado**
- Contratos en `js/commandCenter/`: `planStatus`, `sampleSufficiency`, `reliability`, `findings`, `metricCatalog` (política de sesiones sin respaldo), `businessState`, `z1` (generado desde la especificación, con `--check`).
- Una sola fuente para umbrales de pacing (1.01/0.99), mínimo de sesiones por segmento y tolerancias de conciliación (`FP.config`); 17 fórmulas migradas a `FP.metrics.calcConversionRate/calcAov/calcGap/calcRelativeChange` con paridad contra HEAD.
- Mecanismo de conciliación serie diaria ↔ GA4 (`reconcileSessionsReport`, `validar-sesiones-ga4.js`) y paquete de validación externa reproducible.
- E-1 real: 186 066 filas, 5 858 productos (2 687 con ≥ 6 periodos); 7/7 aserciones.

**Limitaciones aceptadas**
- E-2: `traffic_volume` de ecommerce anterior a 2026-10-05 y de app anterior a 2026-09-25 (y app 2026-10-02) no coincide con GA4 → [`LIMITACION_E2_TRAFFIC_VOLUME.md`](../validacion-externa/LIMITACION_E2_TRAFFIC_VOLUME.md). **Aceptada por el usuario como limitación documentada**; esa decisión no equivale a aceptar la fase.
- Calidad de datos de E-3 declarada `warnings` global (la app no ofrece estado por canal).

**Defectos / pendientes abiertos**
- La causa del cambio de origen de `traffic_volume` es **desconocida** (el usuario indica que no cambió nada).
- La limitación está **documentada, no impuesta por código** (ver §4).
- No existe tolerancia entre ambas fuentes (R-01/B-04): **no se propone ni se aplica**.
- Preexistente fuera de 4.1: CT-3 (`Quitar margen`).
- Reservados (sin tocar): D-01, D-06, `impactModel`, `combineImpacts`, criterio de margen negativo, integración visual del Command Center, persistencia/sincronización.

**Valoración:** el trabajo técnico de 4.1 está completo y verificado. La aceptación depende de la decisión del usuario sobre la limitación E-2 y el defecto abierto de origen.

## 3. Dictamen 4.2 · Diagnósticos

**Técnicamente completado**
- Z1 portado como artefacto generado y `businessState`, conectados por `z1Input` (productor) y `attentionContract` (consumidor) a `attention-view`, `home-resumen` y `contextEngine`; `reliability.sample` evalúa con `sampleSufficiency` (P-17).
- P-12 (exportación + `planStatus`), P-13 (GAP-3/4/5/6 migrados), P-16 (mínimo de sesiones central), P-11 (reporte con umbrales efectivos y `farFromPlanBelow` en config), P-04 (candado entre 0.005 y $0.01).
- E-3 real (octubre 2026, corte 31/10): invariantes A1–A7 en OK en los 4 canales y el total; cumplimiento: ecommerce 79.80 %, app 110.78 %, whatsapp 57.98 %, llamadas 188.94 %, total 98.63 % (verificado con un cálculo independiente). Con calidad `warnings`: nivel Media; con `ready` (sensibilidad): Alta; mismos cumplimientos.

**Limitaciones aceptadas**
- Los cálculos de tráfico y conversión que aún consumen días afectados por E-2 → [`CONSUMIDORES_AFECTADOS_E2.md`](../validacion-externa/CONSUMIDORES_AFECTADOS_E2.md) (inventario por código, no medición).
- En E-3 la comparabilidad sale `sin_base_comparable` porque el diario no incluye periodo previo: esa rama de Z1 **no se ejercitó con datos reales**.

**Defectos / pendientes abiertos**
- Decisión pendiente de producto: aviso o exclusión de los periodos afectados (opciones 1–4 del inventario). **No se cambió ningún comportamiento.**
- Preexistente: CT-3.
- Datos reales no cubren: comparación con periodo previo en Z1; calidad por canal.

**Valoración:** el trabajo técnico de 4.2 está completo y verificado; la aceptación depende de la decisión del usuario sobre cómo tratar los consumidores de los periodos afectados.

## 4. Cálculos que todavía pueden consumir los periodos afectados
Resumen (detalle y método en `CONSUMIDORES_AFECTADOS_E2.md`): pacing y `performanceIndex`, `z1Input`/reliability (solo habilita la conclusión de conversión), `driverEngine` (+ señales, hipótesis, atribución), Inicio y atención, `reforecastEngine`, escenarios y recuperación, medición de impacto, proyección, reportes y export de forecast. No los consumen: el motor de segmentos GA4, la planeación sobre histórico 2024–2025, venta/pedidos/plan y E-3.

## 5. Estado de Git
HEAD y rama sin cambios (`625daec`); 47 archivos modificados y 39 rutas nuevas sin versionar; nada perdido; datos reales ignorados por `.gitignore`. **Riesgo:** el trabajo existe solo en este contenedor, sin commit ni push.

## 6. Defecto de infraestructura de pruebas (nuevo, sin corregir)
Los lotes de navegador terminan con código 0 aunque informen fallas (`batch_controles` lo demuestra). La regresión solo es fiable leyendo los logs. Propuesta: que el lanzador devuelva código ≠ 0 si el log contiene `FALLAS` distinto de cero. No se modificó.

## 7. Roadmap consolidado

| Fase | Estado | Qué falta para avanzar |
|---|---|---|
| 1 Fundamentos y contratos | ✅ Aceptada | — |
| 2 Motores y reglas de negocio | ✅ Aceptada | — |
| 3 Diseño/UX/especificación | ✅ Aceptada (maqueta = referencia de diseño) | — |
| 4.1 Fuentes y contexto | 🟡 Técnicamente completa · **espera tu decisión** | aceptar/rechazar con la limitación E-2 |
| 4.2 Diagnósticos | 🟡 Técnicamente completa · **espera tu decisión** | aceptar/rechazar; decidir tratamiento de los periodos afectados |
| 4.3 Patrones y desviaciones | ⏳ No iniciada | 4.1/4.2 aceptadas |
| 4.4 Prioridades | ⏳ | 4.3 |
| 4.5 Impacto económico | ⏳ (D-01, D-06, `impactModel`, `combineImpacts` reservados) | 4.3 |
| 4.6 Cierre e integración | ⏳ (integración visual del Home) | 4.2–4.5 |

**Decisiones pendientes del usuario:** (1) aceptación formal de 4.1 y de 4.2; (2) tratamiento de los periodos afectados por E-2 (documentar / avisar / excluir / corregir el dato); (3) si se corrige CT-3 (`Quitar margen`) ahora o después; (4) si se corrige el código de salida del lanzador de lotes; (5) autorización para commit y push (riesgo de pérdida del trabajo en el contenedor); (6) calidad por canal para E-3 (`warnings` vigente).

---

## 8. Decisión del usuario (2026-11-21)
El usuario **acepta formalmente las Fases 4.1 y 4.2**, con la limitación de E-2 documentada ([`LIMITACION_E2_TRAFFIC_VOLUME.md`](../validacion-externa/LIMITACION_E2_TRAFFIC_VOLUME.md)) y los defectos abiertos listados en §2, §3 y §6. Esta aceptación no autoriza por sí misma commit, push, merge, PR, despliegue ni el inicio de 4.3; cada uno requiere instrucción expresa.
