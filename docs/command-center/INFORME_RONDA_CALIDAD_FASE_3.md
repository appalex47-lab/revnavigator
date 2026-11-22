# Informe de la ronda final de calidad, consolidación y preparación para aceptación — Fase 3

> **Nota posterior (12-nov-2026):** el usuario aceptó formalmente 3.3, 3.4 y 3.5 con limitaciones documentadas y cerró la Fase 3 (`INFORME_CIERRE_FASE_3.md`). Las menciones a «pendiente de aceptación formal» de este informe describen el estado a su fecha.

> Rama de trabajo `ccr-a81af632-rirtu7` · base `a2b3863` · **sin commit, push, merge, despliegue ni cambio de configuración de GitHub.** Datos **simulados** (ninguno de FESA). Las capturas y pruebas son de Chromium **emulado**.

## A. Resumen ejecutivo
- Se auditó la coherencia entre Z1, Z3 y Z4, y se construyó un **detector de contradicciones entre capas (reglas C1–C17)** con derivación de Z3/Z4 desde la misma lectura de Z1. Con 3 000 lecturas aleatorias, 29 escenarios de Z1 y 10 mutaciones: **0 contradicciones** en lo derivado; el detector sí encuentra las contradicciones que tenía el prototipo anterior.
- Se corrigieron defectos reales: acciones que requieren un dato faltante, elementos de conversión mostrados con la conversión no verificable (C17), ids de encabezado sin resolver (`aria-labelledby` de Z3/Z4), botones de destino de Z4 angostos en móvil, y capturas generadas con selectores obsoletos.
- Se ejecutó una **auditoría automatizada de UX/accesibilidad/responsive** (9 anchos: 320, 360, 375, 390, 414, 768, 1024, 1366, 1440): 62 comprobaciones, 0 fallas.
- 16 escenarios comerciales críticos con datos, interpretación, confiabilidad, mensaje, recomendación y afirmaciones evitadas: 16/16 sin contradicción.
- `combineImpacts`: diagnóstico con 22 pruebas de caracterización. Hay **3 defectos** (pérdidas superpuestas elige la de menor magnitud, asimetría por signo, rango del grupo que descarta incertidumbre) y 6 decisiones abiertas. **El motor no se modificó**; Z3 ya evita mostrar esas cifras.
- **Lo que no se pudo validar aquí:** usuarios, móviles reales, lector de pantalla, otros navegadores y datos reales de FESA (protocolo, checklist y plan listos).
- **La aplicación real no cambió**: el Home sigue con su estructura anterior (matriz de correspondencia). Todo lo de la Fase 3 es diseño ejecutable, prototipo y documentos.

## B. Matriz de correcciones
| Hallazgo | Severidad | Acción | Archivos | Prueba | Resultado |
|---|---|---|---|---|---|
| Z3 no marcaba lo que aparece por primera vez (Desde ayer) y repetía la etiqueta de estimación | Media | Marca «Nuevo»; se quitó la etiqueta redundante | `z3-atencion.js` | `test-fase3-3-z3.js` (53) | Corregido y probado |
| Acciones que requieren un dato faltante se ofrecían como ejecutables | Alta | Regla de retención en Z4 («datos primero») | `z4-acciones.js` | `test-fase3-4-z4.js` (50) | Corregido y probado |
| El prototipo anterior mezclaba elementos de otros escenarios (brecha distinta entre Z1 y Z3, confiabilidad Media con lectura de Alta) | Alta | Derivación Z1→Z3→Z4 coherente + guarda del generador que falla si hay contradicción | `coherencia-zonas.js`, `prototipo-generar.js` | `test-fase3-coherencia.js` (18) | Corregido y probado |
| Z3 mostraba «por debajo» con Z1 «en línea»; Insuficiente con `sin_venta` sin elemento de datos | Alta | Dirección de Z1; elemento de datos añadido | `coherencia-zonas.js` | coherencia (planted + 3 000) | Corregido y probado |
| **Z3 ofrecía elementos de conversión con la conversión no verificable** (sesiones faltantes, venta con 0 pedidos, pedidos sin sesiones) | Alta | Compuerta `convOk/sesOk`; regla C17 en el detector | `coherencia-zonas.js` | `test-fase3-escenarios-comerciales.js` (23, incluye 2 mutaciones) | Corregido y probado |
| `aria-labelledby` de Z3 y Z4 apuntaba a ids inexistentes | Media | Ids `z3t-*`/`z4t-*` y foco programático | `prototipo-generar.js` | `batch_fase3_calidad_ux.py` Q6 | Corregido y probado |
| Botones «Ir a…» de Z4 de 110–143 px en móvil | Baja | Ancho completo y alto mínimo 36 px en ≤ 700 px | `prototipo-generar.js` | Q4, Q5 | Corregido (ergonomía real: pendiente en dispositivo) |
| Textos de 10 px | Baja | Mínimo 11 px | `prototipo-generar.js` | Q3 | Corregido y probado |
| Scripts de captura con selectores obsoletos (`#z3`) | Baja | `[id^=z3]` | `capturas_fase3_5.py` | capturas regeneradas | Corregido |
| Prueba de orden de tabulación sin tolerar columnas | — (afinación de la prueba, no del producto) | Lectura por filas con tolerancia | `batch_fase3_calidad_ux.py` Q9 | Q9 | Aclaro que fue ajuste de la prueba |
| Primer pantallazo medido con la botonera del prototipo | — (ajuste de la prueba) | Se mide desde el inicio de la situación | Q2 | Q2 | Idem |
| `combineImpacts` con 3 defectos y 6 decisiones | Alta (para Fase 4.5) | **Diagnóstico y propuesta; motor sin modificar** | `DIAGNOSTICO_COMBINEIMPACTS.md`, `test-fase3-combineimpacts.js` | 22 | Pendiente de decisión (D-06) |
| Z1 (aceptado) dice «datos completos» con sesiones faltantes | Baja | **No modificado** (documento aceptado); L-17 | `REGISTRO_LIMITACIONES_FASE_3.md` | escenario E04 | Pendiente de decisión (D-05) |

**Respuesta a las comprobaciones pedidas (punto 3):** Z1 vs Z3 sin contradicciones (C1–C5, C15, C16); Z4 siempre cita un elemento visible (C8) o es de datos; Z3 no presenta oportunidades como hechos (clase y certeza por tarjeta, sin lenguaje causal en hipótesis); confiabilidad única en las tres capas (C1); faltante ≠ cero (E04, E06: nunca «0 sesiones»); sin causas inventadas (E15); observado/calculado/estimado/hipotético diferenciados por etiqueta de certeza.

## C. Resultados UX/UI
- **Cinco preguntas del Home:** barra de respuestas rápidas (¿Cómo estamos? · ¿Qué está sucediendo? · ¿Qué merece atención (n)? · ¿Qué puedo hacer (n)? · ¿Dónde está la oportunidad?). La de oportunidad filtra Z3, lleva allí y mueve el foco; en «todo en orden» no ofrece un enlace vacío (Q11–Q13).
- **Longitud percibida (honesta):** la página «alta» a 390 px mide **≈ 3 673 px** (antes de la ronda: 3 636 px). Subió ligeramente porque se añadió la barra de respuestas y el h1; se compensó en parte con la compactación móvil (el supuesto y la contribución pasan a «Evidencia y límites» a un toque en ≤ 700 px, sin perder información) y un resumen más corto. **No se redujo más porque eso exigiría cambiar el diseño aceptado de Z1.** Otras alturas a 390 px: media 3 746, baja 3 936, insuficiente 2 807, sin actividad 2 807, en orden 3 031; a 768 px alta ≈ 2 591; a 1366 px ≈ 2 014.
- **Primer pantallazo (360–414 px):** estado, veredicto, cifra protagonista, confiabilidad y respuestas rápidas visibles en 800 px de alto (Q2).
- **Accesibilidad automatizada:** un h1, h2 por zona, sin saltos, ids únicos, referencias aria resueltas, idioma, enlace de salto, foco visible, orden de tabulación, contraste ≥ 4.5:1 en todo el texto, clase/tipo/estado/confiabilidad siempre con texto, texto ≥ 11 px, objetivos ≥ 24 × 24 px. **Requiere lector de pantalla real y usuarios** (checklist).
- **Capturas (antes/después):** `prototipo/capturas_3_5/` (19), `wireframes/capturas_3_3/` y `capturas_3_4/` regeneradas tras los cambios. La versión «antes» de esta ronda no se conserva como archivo (se sobrescribe); el «antes» está documentado con las alturas y en el diff de generación.

## D. Pruebas
| Prueba | Resultado |
|---|---|
| Z3 `test-fase3-3-z3.js` / Z4 `test-fase3-4-z4.js` / coherencia / escenarios comerciales / combineImpacts | 53 / 50 / 18 / 23 / 22 — 0 fallas |
| Verificadores de consistencia 3.1, 3.2, 3.3, 3.4, 3.5 | 36 / 43 / 30 / 30 / 15 — todo consistente |
| Pruebas de los verificadores (mutaciones) 3.1, 3.2, 3.3–3.5 | 27 / 46 / 51 — 0 fallas |
| Navegador: prototipo 3.5 / zonas 3.3–3.4 / calidad UX / correspondencia / auditoría Home 3.1 / wireframe Z1 | 80 / 57 / 62 / 10 / 58 / 48 — 0 fallas |
| Regresión de la aplicación: atención, resumen del Home, ajustes, margen (Fase 2), modelo real (Fase 2), consistencia de cálculos (Fase 1) | 11 / 40 / 23 / 26 / 25 / 18 — código 0 |
| Node: 103 archivos `tools/test-*.js` · motor `selftest-node.js` | 0 fallas · 233/233 |
| `lint_design.py` | 193 hallazgos (igual que la línea base; preexistentes) |
| **No ejecutado** | Usuarios, móviles reales, lector de pantalla, otros navegadores (solo Chromium), datos reales de FESA, rendimiento bajo carga, Cohere en vivo, Supabase concurrente. |

## E. Limitaciones por responsable (`REGISTRO_LIMITACIONES_FASE_3.md`, L-01…L-19)
- **Claude:** integrar el prototipo en la aplicación (Fase 5), contrato único de hallazgo (4.4), especificar Z2 y Z5, derivación real desde los motores.
- **Decisión del usuario:** D-01 a D-07.
- **FESA/Finanzas:** datos reales, margen, regla de conciliación.
- **Usuarios finales:** pruebas del protocolo.
- **Dispositivos/infraestructura:** móviles reales, lector de pantalla, navegadores.

## F. Decisiones que sí necesito de ti
**Actualización (12 de noviembre de 2026): las siete decisiones D-01 a D-07 fueron ACEPTADAS por el usuario** y están registradas con su criterio, consecuencias, fase y dependencias en `REGISTRO_DECISIONES_PENDIENTES.md`. Aceptadas ≠ implementadas: ninguna está implementada ni integrada, y siguen pendientes los pasos técnicos y externos de ese registro. Lo que sigue es el planteamiento original, conservado como contexto: **D-01** margen negativo · **D-02** conciliación entre fuentes · **D-03** actividad mínima · **D-04** priorización definitiva · **D-05** interpretaciones pendientes (incluida la frase «datos completos») · **D-06** agregación de impactos · **D-07** nomenclatura de zonas (el encargo usa Z2 «Contexto y desempeño» y Z5 «Oportunidades y visión de conjunto»; la arquitectura aceptada usa otros nombres; mantuve la aceptada). Detalle, alternativas y recomendación en `REGISTRO_DECISIONES_PENDIENTES.md`.

## G. Integridad y Git
- Rama `ccr-a81af632-rirtu7`, HEAD `a2b3863` (sin commits nuevos). Al inicio de la ronda: 24 archivos modificados y 23 no rastreados (con `-uall`: 215 entradas); al final: 24 modificados y 28 no rastreados (233 entradas con `-uall`).
- **Archivos nuevos de la ronda:** `tools/audit/coherencia-zonas.js`, `escenarios-comerciales.js`, `escenarios-comerciales-generar.js`; `tools/test-fase3-coherencia.js`, `test-fase3-combineimpacts.js`, `test-fase3-escenarios-comerciales.js`; `tools/regression/batch_fase3_calidad_ux.py`, `batch_fase3_correspondencia.py`; 9 documentos listados en `ESTADO.md` y `generated/ESCENARIOS_COMERCIALES.json`, `generated/CORRESPONDENCIA_HOME_REAL.json`.
- **Archivos modificados de la ronda** (todos de subfases 3.3–3.5, pendientes de aceptación): `z3-atencion.js`, `z4-acciones.js`, `wf-common.js`, `prototipo-generar.js`, sus pruebas y verificadores, el prototipo, wireframes, capturas, `ESCENARIOS_Z3.json`, `PROTOTIPO_SITUACIONES.json`, `FASE_3_5_PROTOTIPO_VALIDACION_UX.md`, `ESTADO.md`.
- **Hashes de los protegidos:** los 20 documentos aceptados, los 5 archivos de especificación aceptados (incluido `command-center-contracts.js`) y los 249 archivos funcionales (`index.html`, `js/`, `css/`): **idénticos a la línea base** (0 diferencias). `js/economics/impactModel.js` (donde vive `combineImpacts`) sin cambios.
- **No hice:** commit, push, merge, despliegue/publicación, cambios a la rama de producción, cierre de PR, borrado de ramas, cambios de configuración de GitHub, desactivar automatizaciones, iniciar Fase 4/5 ni conectar RGT. Las sugerencias del hook de Git no se tomaron como autorización.

## H. Recomendación de aceptación
**Aceptar con limitaciones** las subfases 3.3, 3.4 y 3.5 *como diseño y especificación*, con estas salvedades explícitas: no hay validación con usuarios ni con datos reales; la aplicación real no incorpora nada de ello; y las decisiones D-01–D-07, aunque aceptadas, no están implementadas. **Las decisiones D-01–D-07 ya están aceptadas, pero su implementación no.** **No recomiendo «aceptar sin reservas»** porque eso sugeriría validación externa que no existe. La aceptación es del usuario; no marco ninguna subfase como aceptada.

## Roadmap consolidado
| Fase | Estado |
|---|---|
| Fase 1 — Auditoría | Aceptada con limitaciones documentadas |
| Fase 2 — Modelo de inteligencia | Aceptada |
| **Fase 3 — Diseño UX/UI** | **En cierre de calidad** · 3.1 y 3.2 aceptadas · 3.3, 3.4 y 3.5 completadas con limitaciones, **pendientes de aceptación formal** |
| Fase 4 — Motores e integración | No iniciada |
| Fase 5 — Inteligencia artificial | No iniciada |
| Fase 6 — Integración y liberación | No iniciada |

**Siguiente subfase:** 4.1 Integración de fuentes y contexto. **Autorización necesaria:** aceptación formal de 3.3–3.5 (o instrucciones sobre ellas) y autorización expresa para iniciar la Fase 4; además, decisiones D-01–D-07 para lo que bloquee 4.x. Me detengo aquí.
