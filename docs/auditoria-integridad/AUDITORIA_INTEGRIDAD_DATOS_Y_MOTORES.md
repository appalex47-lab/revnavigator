# Auditoría de integridad de datos y motores

> Rama `ccr-a81af632-rirtu7`, commit `625daec`. **Solo investigación**: no se corrigió ni se modificó código, motores, contratos ni datos. Navegador aislado, sin sesión (sin nube). Detalle por tema en los documentos hermanos. Defectos «confirmados» solo con evidencia reproducible; el resto, «hipótesis».

## 1. Resumen
| H | Tema | Veredicto | Evidencia |
|---|---|---|---|
| H‑01 | Clientes y LTV vacío | **Esperado + flujo de demo + UX**; el módulo funciona (8 827 pedidos, 3 000 clientes tras ~13 s) | `INVESTIGACION_CLIENTES_Y_LTV.md` |
| H‑02 | Tráfico y conversión «inconsistente» | **Determinista**: depende de confirmar el archivo Segmentos (0 vs 1 814 registros); sin carrera | `INVESTIGACION_TRAFICO_Y_CONVERSION.md` |
| H‑03 | Impacto económico desconectado | **Confirmado**: contrato implementado y probado, **0 consumidores** salvo la configuración de margen | `AUDITORIA_IMPACTO_ECONOMICO.md` |
| H‑04 | Plan vacío | **Esperado, pero con inconsistencia de mensajes** (ver §2) | este documento |
| H‑05 | Seguimiento vacío | **Esperado**; contrato funcional adecuado (ver §3) | este documento |
| H‑06 | Móvil | **Confirmado en parte; una cifra de la revisión visual se corrige** (ver §4) | este documento |

## 2. H‑04 — Plan vacío
- La página **Plan** («Metas y generación del plan», `js/ui/planning-view.js`) **genera** un plan a partir de **metas anuales por canal** (`Origen: Meta del usuario`); con las metas vacías muestra «Sin meta» y deshabilita «Generar vista previa» (`:58`).
- Con los datos de prueba hay **120 registros de plan cargados** (dataset «Plan / Meta») y Pacing/Home los usan. La página Plan **no los reconoce** y dice «Todavía no hay plan para 2026 · Captura metas por canal…» (`:263`).
- **Conclusión:** comportamiento esperado de la *función de generar*, pero **hay dos orígenes de «plan» sin vínculo visible** (cargado vs generado): `planningEngine` usa `explicit_plan`/`user_target` como fuentes. La interfaz sí explica qué falta para *generar*; **no explica** que ya existe un plan cargado. No se inventaron metas. Requiere una decisión de producto (¿la página debe mostrar el plan vigente cualquiera sea su origen?).

## 3. H‑05 — Seguimiento vacío
Cadena y contrato (verificados en código): **hipótesis** (`diagnosticEngine`/`hypothesisEngine`) → **escenario guardado ligado a la hipótesis** (`scenarioEngine`/`recoveryEngine`, `state.rc.scenarioStore`) → **acción** (`addActionFrom`, `js/app.js:5878`, exige `escenario guardado con hypothesisId` o responde «La acción necesita un escenario guardado ligado a una hipótesis») → plan de acción por año (`FP.actionPlan`, `storage.save(yk(K.actionPlan, año))`, historial *append‑only*) → **medición** (`FP.actionTracking`) → `measure-view.js` (lee `state.rc.plan`; sin acciones muestra el vacío y dice cómo llegar).
- Persistencia: clave anual de `localStorage`; estados definidos en `config.recovery.actionStatuses`; actualización con `updateAction`/`recordDecision`/`recordConclusion` (cada cambio al historial).
- **No se pudo crear una acción en la demo** (0 acciones tras pulsar el catálogo): con los datos de prueba la brecha es 0.2 %, el Recovery Center muestra «Sin brecha que analizar» y no hay escenario guardado. Esto **no se verificó como defecto**: es la precondición del contrato. **Pendiente de prueba:** crear la cadena completa con un dataset con brecha.
- **Dictamen:** existe un contrato funcional adecuado y trazable; el módulo está vacío por diseño.

## 4. H‑06 — Móvil (390 px; Chromium emulado)
| Hallazgo de la revisión visual | Resultado de esta auditoría |
|---|---|
| Home ≈ 5 700 px | Confirmado: **5 421 px** a 390 px; 14 secciones, **15 plegables**, 11 gráficos, 2 tablas, 16 botones |
| Pacing > 15 000 px | Confirmado: **16 378 px**; un único contenedor `.px` con **64 botones**, 29 filas, 10 plegables |
| Recovery > 15 000 px | **Corregido**: Recovery Center mide **11 119 px** (Reforecast 14 900 px); el panel «Catálogo de acciones» ocupa **7 461 px** por sí solo |
| 16–18 controles < 24 px | **Se matiza**: 18×18 `help-dot` («?») y 17 px `why-link` **sí** tienen área táctil ampliada a 44 px en ≤ 760 px (`design-system.css:846‑847`, pseudo‑elemento); **sí son demasiado pequeños** los `link-btn` de los canales (20 px de alto) y enlaces en línea (19 px) |
| Modal de bienvenida superpuesto | Confirmado: `.tour-offer--soft` es `position: fixed`, `z-index: 70`, ocupa 358×283 px a 390 px (y 545…828 px) sobre el contenido; es una **oferta no bloqueante**, pero tapa «Tu siguiente mejor paso» |
| Botón «Asistentes» tapa texto | Confirmado visualmente (flotante fijo); no medido en CSS |
| Tono distinto titular vs indicador | **Causa confirmada**: dos reglas de clasificación (`home-resumen.js:41` con banda ±2 % `planBand`; `contextEngine.js:164` con umbral 0.05 %); deben leer una sola |
**Causas estructurales:** páginas compuestas con muchos bloques del mismo nivel (sin jerarquía de «lo esencial primero»), tablas y listas completas incrustadas (catálogo de acciones), patrón «?»‑ayuda repetido (≥ 18 por página), plegables que conservan la información (bien) pero sin priorizar. **No se debe resolver ocultando inteligencia**: la arquitectura Z1–Z5 (decisiones D‑02/D‑03, «3 de N», evidencia secundaria) ya prescribe el criterio.

## 5. Pruebas no destructivas ejecutadas (esta tarea)
| Prueba | Resultado |
|---|---|
| `selftest-node.js` (motor) | 233 de 233 |
| `test-atribucion-escenarios.js` / `test-economia-dual.js` / `test-fase2-contratos.js` | 64 / 64 / OK |
| `test-traffic-all.js` / `test-funnel-engine.js` | OK / 15 de 15 |
| Reproducción H‑01 (4 ejecuciones), H‑02 (2), H‑04, H‑05, H‑06 en navegador aislado | Resultados arriba; **0 errores de consola**, **0 peticiones externas** |
**No ejecutado:** sesión/nube, Cohere, PDF, exportaciones, dispositivo real, carga con archivos reales. Persistencia de segmentos y de clientes tras recargar: clientes sí (libro conservado); segmentos no verificada específicamente.

## 6. Registro de defectos y brechas (ver `PRIORIZACION_BRECHAS_FASE_4.md`)
D‑1 estado frente al plan con dos umbrales (**confirmado**); D‑2 brecha/CR/AOV con ≥ 4–5 implementaciones (riesgo; divergencia no probada); D‑3 sesiones con dos fuentes; D‑4 Plan sin reconocer el plan cargado; D‑5 `FP.economics` sin consumidores; D‑6 `riskOpportunityEngine` sin consumidores y sin clases de hallazgo; D‑7 `combineImpacts`; D‑8 estados vacíos sin «pendiente de confirmar»; D‑9 móvil (tamaños, modal, longitud).
