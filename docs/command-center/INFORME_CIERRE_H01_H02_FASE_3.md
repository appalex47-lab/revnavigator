# Informe de cierre de H-01 y H-02, auditoría final y preparación de la aceptación de la Fase 3

> **Nota posterior (12-nov-2026):** el usuario aceptó formalmente 3.3, 3.4 y 3.5 con limitaciones documentadas y cerró la Fase 3 (`INFORME_CIERRE_FASE_3.md`). Las menciones a «pendiente de aceptación formal» de este informe describen el estado a su fecha.

> 12 de noviembre de 2026 · rama `ccr-a81af632-rirtu7` · HEAD `a2b3863` (sin commits nuevos). **No** se hizo commit, push, merge, despliegue ni publicación; no se inició la Fase 4; no se modificó el motor de cálculos, `combineImpacts`, el modelo de datos ni ningún contrato. Datos **simulados** (ninguno de FESA). Ninguna subfase se marcó como aceptada.

## 1. Resolución de H-01 (propiedad única y referencias)
Cada elemento tiene **una zona propietaria y una fuente de verdad**; otras zonas lo **referencian, resumen o proponen acciones** cuando cada aparición cumple una función distinta (las tres apariciones de una oportunidad en Z3, Z4 y Z5 son el mismo elemento). Documento: `ACLARACION_H01_H02_PROPIEDAD_Z5.md`.
- **Único cambio al documento aceptado de 3.1** (§3.1, una frase): «Una pieza vive en **una sola** capa y zona.» → «Una pieza tiene **una sola capa y zona propietaria** y una sola fuente de verdad; otras zonas pueden mostrar referencias, resúmenes o acciones relacionadas con ella cuando cada aparición cumple una función distinta (aclaración H-01…)». Comprobado: al devolver la frase nueva a la anterior se obtiene exactamente el documento aceptado (hash de la línea base). Registrado en `generated/MODIFICACIONES_AUTORIZADAS.json`.
- Ninguna otra decisión aceptada cambió. La implementación actual no contradice la interpretación; la única discrepancia hallada fue la derivación de Z3 (ver §4).

## 2. Resolución de H-02 (Z5 «Oportunidades y visión de conjunto»)
Aclaración funcional derivada de D-07 (**no se creó D-08**: D-07 la resuelve). Tres niveles: **Oportunidades** (referencias a Z3, sin importes propios) · **Visión de conjunto** (relación con Z1, Z2 y Z4; alternativas declaradas como alternativas; sin cifras) · **Evidencia y detalle** (apartado secundario desplegable: evidencia, fuentes, periodos, cálculos y referencias, limitaciones, información faltante, confiabilidad, canales, descartados y método). Sin sexta zona; la evidencia no se eliminó ni se trasladó a Z2; las **advertencias críticas** (confiabilidad, completitud, retenidos, faltantes, hipótesis) se muestran **fuera** del desplegable; ningún importe ni cálculo se repite. Especificación ejecutable: `tools/audit/z5-conjunto.js` (reglas P0–P12). Prototipo actualizado. **Estado: implementada solo en especificación y prototipo; no en la aplicación real.**

## 3. Matriz final de responsabilidades Z1–Z5
| Zona | Nombre oficial | Responsabilidad | Posee (fuente de verdad) | Muestra de otras zonas |
|---|---|---|---|---|
| Z1 | Qué está pasando | Estado, veredicto, brecha, confiabilidad, completitud (D-05) | Cifras, brecha, veredicto | — |
| Z2 | Contexto y desempeño | Contexto, evolución, drivers (contribución matemática), hipótesis aparte | Contexto y drivers | Referencias a Z1 y Z3 |
| Z3 | Qué merece atención | Hallazgo ◆, riesgo ▲, oportunidad ●; datos que faltan | **Hallazgos, riesgos, oportunidades** (con su único importe) | Relaciones de inclusión entre elementos |
| Z4 | Qué puedo hacer | Acciones que citan un elemento visible; datos primero | Acciones | Referencias a Z3 (sin importes propios) |
| Z5 | Oportunidades y visión de conjunto | Integrar oportunidades y dar visión de conjunto; evidencia secundaria | **Nada de negocio**: solo referencias y resumen | Oportunidades de Z3, acciones de Z4, contexto de Z2 |

## 4. Auditoría de duplicidad en Z3 (brecha total y del canal)
- **Corrección verificada:** la brecha total y la del canal que la concentra comparten el grupo de superposición (mismo dinero). En 1 008 lecturas con ambas: la línea de total no muestra cifra; el total **no** excede ni difiere del importe de Z1 (regla C20).
- **Presentación (ajuste de esta tarea):** antes, la tarjeta del canal mostraba su importe sin indicar que ya estaba incluido, lo que podía sugerir un impacto adicional. Ahora la tarjeta del canal dice «Parte del importe de otro elemento: ya está incluida; no se suma» y la total «Importe total: incluye la parte de otros elementos; no se suman»; se conserva la relación (`relation`: incluye / incluido_en, propietario y miembros) y el canal sigue identificado con su título, alcance e importe propio.
- Regresiones: prueba plantada (C20), mutación en Z3 (sin la relación el defecto se detecta) y mutaciones en Z5. Coherente con D-06. `combineImpacts` **no se tocó** (sigue con sus defectos caracterizados, pendiente de 4.5).

## 5. Auditoría de D-05
La corrección autorizada se conserva: 21/21 pruebas de completitud (regresión idéntica contra la especificación aceptada en 4 030 entradas; «datos completos» solo con completitud verificada; faltantes comunicados y métricas calculables intactas; sin causas inventadas). Z5 muestra las advertencias de completitud fuera del desplegable (P10). No se amplió el alcance de D-05.

## 6. Archivos modificados en esta tarea
- **Documento aceptado (autorizado, una frase):** `FASE_3_1_ARQUITECTURA_INFORMACION.md`.
- **Documentos:** `ACLARACION_H01_H02_PROPIEDAD_Z5.md` (nuevo), `INFORME_CIERRE_H01_H02_FASE_3.md` (nuevo), `PROPUESTA_CONSERVACION_GIT.md` (nuevo), `EQUIVALENCIAS_ZONAS_D07.md`, `ESTADO.md`, `REGISTRO_DECISIONES_PENDIENTES.md`, `REGISTRO_LIMITACIONES_FASE_3.md`, `MATRIZ_CORRESPONDENCIA_PROTOTIPO_APP.md`, `ESPECIFICACION_UX_UI_COMMAND_CENTER.md`, `FASE_3_5_PROTOTIPO_VALIDACION_UX.md`, `INFORME_CIERRE_D05_D07_FASE_3.md` (nota de superación).
- **Especificaciones y prototipo (3.3–3.5, pendientes de aceptación):** `tools/audit/z5-conjunto.js` (nuevo), `z3-atencion.js` (relación de inclusión), `prototipo-generar.js`, `prototipo/home_3_5_prototipo.html`, `generated/ESCENARIOS_Z3.json`, `wireframes/z3_3_3_wireframe.html`, 38 capturas regeneradas.
- **Herramientas y pruebas:** `registrar_modificaciones_autorizadas.py`, `verificar_consistencia_3_2.py` (admite el hash autorizado de 3.1), `propuesta_conservacion.py` (nuevo), `test-fase3-propiedad-z5.js` (nuevo), `test-fase3-transversal-d05-d07.js`, `batch_fase3_5_prototipo.py`, `generated/MODIFICACIONES_AUTORIZADAS.json`.

## 7. Integridad de documentos protegidos
Comparados contra la línea base: **sin cambios** `index.html`, los 249 archivos de `js/`, `css/` e `index.html` (verificador A3 de 3.2–3.5), `js/economics/impactModel.js` (hash `1e1b29bb…` igual al de las líneas base de 3.2 y 3.3), `command-center-contracts.js`, `z1-escenarios.js`, `z1-ejemplos-incorrectos.json`, `z1-generar-artefactos.js`, los documentos de Fases 1–2 y los documentos de 3.2 (salvo los cuatro autorizados por D-05). **Únicas diferencias autorizadas** (6 archivos, hash base → hash nuevo registrados): `FASE_3_1_ARQUITECTURA_INFORMACION.md` (H-01) y los cinco de Z1 (D-05). Cualquier otro cambio a esos archivos sigue haciendo fallar los verificadores (prueba negativa ejecutada en la tarea anterior).

## 8. Pruebas ejecutadas y resultados exactos
| Prueba | Resultado |
|---|---|
| `test-fase3-propiedad-z5.js` (Z5 P0–P12 en 3 030 lecturas, propiedad, referencias, un solo importe, trazabilidad, doble contabilización en 1 008 lecturas, nomenclatura, 3.1, 8 mutaciones) | 28 bien, 0 mal |
| `test-fase3-transversal-d05-d07.js` (D-01…D-07; 4 pendientes reportadas como pendientes) | 18 bien, 0 mal |
| `test-fase3-d05-completitud.js` | 21/21 |
| `test-fase3-2-z1.js` · `-3-z3.js` · `-4-z4.js` · `coherencia` · `escenarios-comerciales` · `combineimpacts` | 91 · 53 · 50 · 18 · 23 · 22 |
| Node: 106 archivos `tools/test-*.js`; motor `selftest-node.js` | 0 fallas; 233/233 |
| Verificadores documentales 3.1, 3.2, 3.3, 3.4, 3.5 | 36, 43, 30, 30, 15: todo consistente |
| Pruebas de los verificadores (mutaciones) | 27, 46, 51 |
| Navegador: prototipo 3.5 · zonas 3.3–3.4 · calidad UX (9 anchos, accesibilidad) · correspondencia · auditoría Home 3.1 · wireframe Z1 | 80 · 57 · 62 · 10 · 58 · 48 |
| Regresión de la app: atención · resumen Home · ajustes · margen · modelo real · consistencia de cálculos · CSP · XSS | 11 · 40 · 23 · 26 · 25 · 18 · 10 · 5 (código 0 en todas) |
| `lint_design.py` | 193 (línea base) |
**Defecto hallado y corregido en esta tarea (de las pruebas):** los enlaces «Ver el elemento en Z3» de Z5 medían 15 px de alto (< 24 px, WCAG 2.5.8); corregido y repetida la batería (Q4).
**No ejecutadas / bloqueadas / externas:** usuarios, móviles reales, lector de pantalla, otros navegadores, datos reales de FESA (protocolos y planes listos; no se declara validación alguna).

## 9. Limitaciones pendientes
`REGISTRO_LIMITACIONES_FASE_3.md` (L-01…L-22). Destacan: D-01, D-02 ($0.01 por verificar), D-03, D-04 y D-06 (`combineImpacts`) aceptadas pero **no implementadas**; Z2 sin especificación ejecutable propia; H-01/H-02 implementadas solo en especificación y prototipo; la visión de conjunto de Z5 es cualitativa; el Home real no incorpora nada del diseño; una captura de 3.2 desactualizada (L-22).

## 10. Estado real de Git
Rama `ccr-a81af632-rirtu7`, HEAD `a2b3863`, sin commits nuevos. **Antes de esta tarea:** 24 modificados, 30 sin rastrear (243 entradas con `-uall`). **Después:** 24 modificados, 31 sin rastrear (249 con `-uall`; +6 archivos nuevos: `ACLARACION_H01_H02_PROPIEDAD_Z5.md`, `INFORME_CIERRE_H01_H02_FASE_3.md`, `PROPUESTA_CONSERVACION_GIT.md`, `propuesta_conservacion.py`, `z5-conjunto.js`, `test-fase3-propiedad-z5.js`). Todo sigue **sin confirmar**.

## 11. Procedencia de `js/economics/impactModel.js`
- **No tiene cambios pendientes porque es un archivo nuevo sin rastrear**: no existe en HEAD ni en ningún commit (`git ls-files` y `git log` vacíos). El informe anterior decía «el motor no se modificó» y es correcto en el sentido que importa: **su contenido es idéntico al de las líneas base de 3.2 y 3.3** (hash `1e1b29bb…`, 234 líneas) y no se tocó en la Fase 3 ni en estas tareas; pero **sí es código nuevo respecto de lo publicado**.
- **Cuándo y por qué:** creado el 2026-11-08 21:11 (mismo minuto que `index.html`, `js/app.js` y `tools/test-economia-dual.js`), en el **Punto B de la Fase 2** («modelo económico dual», margen bruto opcional). Está nombrado en `ACEPTACION_FASE_2.md` (§Punto B), en `MODELO_CUANTIFICACION_ECONOMICA.md` y en `ESTADO.md` («Archivos modificados: `js/economics/impactModel.js` (nuevo)»).
- **Autorización:** el usuario aceptó formalmente el Punto B (`ACEPTACION_FASE_2.md`).
- **Efecto productivo:** sí. `index.html` lo carga; `js/app.js` y `js/ui/settings-view.js` lo usan para la configuración opcional del margen (`FP.economics.DEFAULT_SETTING`, `buildSetting`, `availability`); sin margen la herramienta se comporta como antes. `combineImpacts` no se invoca desde `js/` (solo desde pruebas y especificaciones).
- **Conclusión:** procedencia **demostrada** (Fase 2, aceptada). No debe ir solo: depende de `index.html` y `js/app.js`. Se propone **únicamente dentro del commit C1** (código de Fases 1–2), con la advertencia de que **cambia el comportamiento de la aplicación** y requiere tu aprobación antes de cualquier rama de producción.
- **Otros cambios de procedencia verificada:** los 5 archivos de texto de Cohere (`cohereAudit.js`, `cohereDiagnostic.js`, `action-plan-view.js`, `diagnostic-view.js`, `narrative-view.js`) y el meta CSP de `index.html` son de la **Fase 1** (`FASE_1_AUDITORIA.md` §F, `test-fase1-ia-sin-clave-local.js`, `batch_fase1_csp.py`); `tools/test-agents-seleccion.js` y similares acompañan la Fase 2. **No hay cambios de procedencia no demostrada.**

## 12. Evaluación de las 100 capturas PNG (no se eliminó ninguna)
| Carpeta | PNG | Peso | Estado frente a la versión actual | Relación con documentos y pruebas | Recomendación |
|---|---|---|---|---|---|
| `wireframes/capturas_3_2` | 38 | 3.4 MB | 37 vigentes; **1 desactualizada**: `diseno_propuesto_escenario_A7.png` (muestra el veredicto anterior a D-05) | Evidencia de 3.2 (aceptada); exigidas por los verificadores 3.2 | Conservar las 38; regenerar solo la A7 **si lo autorizas** (no estaba en la autorización de D-05) |
| `wireframes/capturas_3_3` | 20 | 1.9 MB | Regeneradas hoy (Z3 con la relación de inclusión) | Verificador de zona y documento 3.3 | Conservar |
| `wireframes/capturas_3_4` | 20 | 1.2 MB | Regeneradas hoy | Verificador y documento 3.4 | Conservar |
| `prototipo/capturas_3_5` | 19 | 5.5 MB | Regeneradas hoy (Z5 en tres niveles) | Verificador 3.5 y documento 3.5 | Conservar; las 6 de tableta son las menos informativas (prescindibles si quieres reducir peso) |
| `wireframes/capturas_auditoria` | 3 | 0.9 MB | De 3.1 (Home existente, 08-nov); el Home real no cambió | Evidencia del Home existente en 3.1 | Conservar |
Total **12.8 MB**; **0 duplicados exactos** (comparación por hash). Todas son evidencia útil de Chromium emulado y las consumen verificadores o documentos; recomiendo incluirlas en un commit **separado** (C7) para poder prescindir de ellas sin tocar el código.

## 13. Propuesta de commits (NO ejecutados) — detalle en `PROPUESTA_CONSERVACION_GIT.md`
Rama de destino: `ccr-a81af632-rirtu7` (nunca producción).
| Commit | Contenido | Archivos |
|---|---|---|
| C1 | Código de la aplicación de Fases 1–2 (`index.html`, `js/**` con 17 archivos, incluido `impactModel.js`) | 17 |
| C2 | Pruebas de Fases 1–2 (`test-*` y `batch_fase1_*`/`batch_fase2_*`, `run_batch.py`) | 16 |
| C3 | Documentos y contratos aceptados (Fases 1–2 y 3.1 con la aclaración H-01), `ARCHITECTURE.md`, `PROMPT_PARA_OTRA_IA.md` | 17 |
| C4 | Fase 3: documentos (3.2 aceptada; 3.3–3.5 pendientes; ronda de calidad, D-05, D-07, H-01, H-02), especificaciones, prototipo, wireframes y generados | 81 |
| C5 | Fase 3: pruebas y lotes de navegador | 18 |
| C7 | Capturas PNG | 100 |
Separación solicitada: código → C1 · documentos aceptados → C3 · especificaciones y prototipos de Fase 3 → C4 · pruebas → C2 y C5 · evidencias visuales → C7 · cambios ajenos o de procedencia no demostrada → **ninguno**. Los números exactos y las listas completas se generan con `python3 tools/audit/propuesta_conservacion.py`.

## 14. Dictamen técnico
**3.3, 3.4 y 3.5 están listas para revisión y aceptación formal, con limitaciones.** Las ambigüedades de arquitectura (H-01, H-02) quedaron resueltas sin crear una decisión nueva; hay un único cambio autorizado a un documento aceptado por cada resolución (3.1 y Z1); la coherencia entre Z1–Z5 se verifica con pruebas propias, mutaciones y 3 000 lecturas aleatorias. **No** están validadas con usuarios, dispositivos, lectores de pantalla ni datos reales; el Home real no las incorpora; D-01…D-06 están aceptadas pero no implementadas. La aceptación formal es tuya; no marqué ninguna subfase como aceptada.

## 15. Roadmap consolidado
| Fase | Estado |
|---|---|
| Fase 1 | Aceptada con limitaciones documentadas |
| Fase 2 | Aceptada |
| Fase 3.1 | Aceptada con limitaciones |
| Fase 3.2 | Aceptada con limitaciones |
| Fase 3.3 | Pendiente de aceptación formal |
| Fase 3.4 | Pendiente de aceptación formal |
| Fase 3.5 | Pendiente de aceptación formal |
| Fase 4 | No iniciada |
| Fase 5 | No iniciada |
| Fase 6 | No iniciada |
