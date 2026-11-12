# Propuesta de conservación del trabajo en Git (NO ejecutada)

> Generado por `tools/audit/propuesta_conservacion.py` (solo lee `git status`). Rama `ccr-a81af632-rirtu7` · HEAD `a2b3863` · 24 archivos modificados y 227 nuevos (en `-uall`).
> **No se ejecutó ni se ejecutará ningún commit, push, merge, despliegue o publicación sin tu autorización expresa.** La autorización para conservar una ronda anterior no se aplica a estos cambios.

**Rama de destino propuesta:** la rama de trabajo existente `ccr-a81af632-rirtu7` (nunca `main` ni una rama de producción; sin PR ni merge). **Orden propuesto:** C1+C2 → C3 → C4+C5 → C7 (cuatro commits; C1 y C2 pueden ir juntos).

## Resumen

| Commit | Contenido | Archivos | Mensaje propuesto |
|---|---|---|---|
| C1 | Código de la aplicación (Fases 1 y 2) — PRODUCCIÓN | 17 | `Fases 1 y 2: CSP, textos de Cohere, atribución unificada y modelo económico dual (código de la aplicación)` |
| C2 | Pruebas de las Fases 1 y 2 | 16 | `Fases 1 y 2: pruebas de código y de navegador` |
| C3 | Documentos y contratos aceptados (Fases 1–2 y 3.1) | 17 | `Docs: documentos y contratos aceptados de las Fases 1–2 y 3.1 (con la aclaración H-01)` |
| C4 | Fase 3 — documentos, especificaciones ejecutables, prototipo y artefactos generados | 83 | `Fase 3: diseño de Z1–Z5, especificaciones, prototipo y artefactos; cierre de D-05, D-07, H-01 y H-02` |
| C5 | Fase 3 — pruebas y lotes de navegador | 18 | `Fase 3: pruebas y lotes de navegador` |
| C7 | Evidencias visuales (capturas PNG) | 100 | `Fase 3: capturas de evidencia (Chromium emulado)` |

**Clases pedidas:** cambios de código → C1 · documentos aceptados → C3 (y los de 3.2 dentro de C4, marcados abajo) · especificaciones y prototipos de Fase 3 → C4 · pruebas → C2 y C5 · evidencias visuales → C7 · **cambios ajenos o de procedencia no demostrada → ninguno** (los cinco archivos de texto de Cohere y `ARCHITECTURE.md`/`PROMPT_PARA_OTRA_IA.md` tienen procedencia demostrada en Fase 1; ver `INFORME_CIERRE_H01_H02_FASE_3.md`).

## C1 · Código de la aplicación (Fases 1 y 2) — PRODUCCIÓN

*Procedencia / fase:* Fase 1 y 2 (aceptadas). Fase 1: CSP en `index.html` y 5 textos de interfaz/comentarios de Cohere (documentados en `FASE_1_AUDITORIA.md` §F y probados por `test-fase1-ia-sin-clave-local.js`). Fase 2: atribución unificada, economía dual y margen opcional (`ACEPTACION_FASE_2.md`; lista de archivos en `ESTADO.md` «Archivos modificados»). **Cambia el comportamiento de la aplicación al integrarse**: requiere tu aprobación expresa antes de cualquier rama de producción.

Mensaje propuesto: `Fases 1 y 2: CSP, textos de Cohere, atribución unificada y modelo económico dual (código de la aplicación)`

<details><summary>Lista de archivos (17)</summary>

- `index.html` (modificado)
- `js/agents/analistaStory.js` (modificado)
- `js/ai/cohereAudit.js` (modificado)
- `js/ai/cohereDiagnostic.js` (modificado)
- `js/analytics/funnelEngine.js` (modificado)
- `js/analytics/homeSummaryEngine.js` (modificado)
- `js/analytics/trafficConversionEngine.js` (modificado)
- `js/app.js` (modificado)
- `js/diagnostics/attribution.js` (modificado)
- `js/diagnostics/driverEngine.js` (modificado)
- `js/economics/impactModel.js` (nuevo)
- `js/ui/action-plan-view.js` (modificado)
- `js/ui/diagnostic-view.js` (modificado)
- `js/ui/guidance/home-summary-view.js` (modificado)
- `js/ui/narrative-view.js` (modificado)
- `js/ui/segments-decomp-view.js` (modificado)
- `js/ui/settings-view.js` (modificado)

</details>

## C2 · Pruebas de las Fases 1 y 2

*Procedencia / fase:* Fase 1 y 2 (aceptadas). Pruebas de código y de navegador de las Fases 1 y 2 (atribución, economía dual, contratos, CSP, XSS, IA sin clave local, consistencia de cálculos, margen, modelo real) y `run_batch.py` (el ejecutor de lotes de navegador con CSP).

Mensaje propuesto: `Fases 1 y 2: pruebas de código y de navegador`

<details><summary>Lista de archivos (16)</summary>

- `tools/regression/batch_ajustes_tabs.py` (modificado)
- `tools/regression/batch_fase1_consistencia_calculos.py` (nuevo)
- `tools/regression/batch_fase1_csp.py` (nuevo)
- `tools/regression/batch_fase1_seguridad_xss.py` (nuevo)
- `tools/regression/batch_fase2_margen.py` (nuevo)
- `tools/regression/batch_fase2_modelo_real.py` (nuevo)
- `tools/regression/run_batch.py` (nuevo)
- `tools/test-agents-fase2.js` (modificado)
- `tools/test-agents-seleccion.js` (modificado)
- `tools/test-atribucion-escenarios.js` (nuevo)
- `tools/test-economia-dual.js` (nuevo)
- `tools/test-fase1-ia-sin-clave-local.js` (nuevo)
- `tools/test-fase2-contratos.js` (nuevo)
- `tools/test-funnel-engine.js` (modificado)
- `tools/test-traffic-all.js` (modificado)
- `tools/test-traffic-conversion.js` (modificado)

</details>

## C3 · Documentos y contratos aceptados (Fases 1–2 y 3.1)

*Procedencia / fase:* Aceptados. Los documentos aceptados de `docs/command-center/` (Fases 1 y 2 y la arquitectura 3.1, esta con la **aclaración H-01 autorizada**), `command-center-contracts.js`, `ARCHITECTURE.md` y `PROMPT_PARA_OTRA_IA.md` (notas de Fase 1).

Mensaje propuesto: `Docs: documentos y contratos aceptados de las Fases 1–2 y 3.1 (con la aclaración H-01)`

<details><summary>Lista de archivos (17)</summary>

- `ARCHITECTURE.md` (modificado)
- `docs/command-center/ACEPTACION_FASE_2.md` (nuevo)
- `docs/command-center/ATRIBUCION_FUENTE_DE_VERDAD.md` (nuevo)
- `docs/command-center/FASE_1_AUDITORIA.md` (nuevo)
- `docs/command-center/FASE_2_ARQUITECTURA_INTELIGENCIA.md` (nuevo)
- `docs/command-center/FASE_3_1_ARQUITECTURA_INFORMACION.md` (nuevo)
- `docs/command-center/MATRIZ_UX_MOTORES.md` (nuevo)
- `docs/command-center/MODELO_CUANTIFICACION_ECONOMICA.md` (nuevo)
- `docs/command-center/MODELO_DETECCION_DESVIACIONES.md` (nuevo)
- `docs/command-center/MODELO_HALLAZGOS_RIESGOS_OPORTUNIDADES.md` (nuevo)
- `docs/command-center/MODELO_INDICADORES_DRIVERS.md` (nuevo)
- `docs/command-center/MODELO_LECTURA_EJECUTIVA.md` (nuevo)
- `docs/command-center/generated/CATALOGO_MODULOS.md` (nuevo)
- `docs/command-center/generated/MATRIZ_UX_MOTORES.json` (nuevo)
- `docs/command-center/wireframes/home_3_1_wireframe.html` (nuevo)
- `docs/presentation-intelligence/PROMPT_PARA_OTRA_IA.md` (modificado)
- `tools/audit/command-center-contracts.js` (nuevo)

</details>

## C4 · Fase 3 — documentos, especificaciones ejecutables, prototipo y artefactos generados

*Procedencia / fase:* Fase 3 (3.1–3.2 aceptadas; 3.3–3.5 pendientes). Documentos de 3.2 (aceptada, con la corrección D-05 autorizada), de 3.3–3.5 (pendientes de aceptación) y de la ronda de calidad, D-05, D-07, H-01 y H-02; especificaciones `tools/audit/` (Z1, Z3, Z4, Z5, coherencia, escenarios comerciales, verificadores y registro de modificaciones autorizadas); wireframes y prototipo HTML; JSON y matrices generados.

Mensaje propuesto: `Fase 3: diseño de Z1–Z5, especificaciones, prototipo y artefactos; cierre de D-05, D-07, H-01 y H-02`

<details><summary>Lista de archivos (83)</summary>

- `docs/command-center/ACLARACION_H01_H02_PROPIEDAD_Z5.md` (nuevo)
- `docs/command-center/AUDITORIA_FINAL_ACEPTACION_3_2_Z1.md` (nuevo)
- `docs/command-center/CAMBIO_AUTORIZADO_D05_Z1.md` (nuevo)
- `docs/command-center/CHECKLIST_MOVIL_REAL_Y_ACCESIBILIDAD.md` (nuevo)
- `docs/command-center/DIAGNOSTICO_COMBINEIMPACTS.md` (nuevo)
- `docs/command-center/EQUIVALENCIAS_ZONAS_D07.md` (nuevo)
- `docs/command-center/ESCENARIOS_COMERCIALES_CRITICOS.md` (nuevo)
- `docs/command-center/ESPECIFICACION_UX_UI_COMMAND_CENTER.md` (nuevo)
- `docs/command-center/ESTADO.md` (nuevo)
- `docs/command-center/FASE_3_2_ESCENARIOS_Z1.md` (nuevo)
- `docs/command-center/FASE_3_2_RESUMEN_EJECUTIVO.md` (nuevo)
- `docs/command-center/FASE_3_3_ESCENARIOS_Z3.md` (nuevo)
- `docs/command-center/FASE_3_3_HALLAZGOS_RIESGOS_OPORTUNIDADES.md` (nuevo)
- `docs/command-center/FASE_3_4_ESCENARIOS_Z4.md` (nuevo)
- `docs/command-center/FASE_3_4_PRIORIDADES_RECOMENDACIONES.md` (nuevo)
- `docs/command-center/FASE_3_5_PROTOTIPO_VALIDACION_UX.md` (nuevo)
- `docs/command-center/INFORME_CIERRE_D05_D07_FASE_3.md` (nuevo)
- `docs/command-center/INFORME_CIERRE_FASE_3.md` (nuevo)
- `docs/command-center/INFORME_CIERRE_H01_H02_FASE_3.md` (nuevo)
- `docs/command-center/INFORME_FINAL_FASE_3.md` (nuevo)
- `docs/command-center/INFORME_RONDA_CALIDAD_FASE_3.md` (nuevo)
- `docs/command-center/MATRIZ_CORRESPONDENCIA_PROTOTIPO_APP.md` (nuevo)
- `docs/command-center/MATRIZ_TRAZABILIDAD_Z1.md` (nuevo)
- `docs/command-center/MATRIZ_TRAZABILIDAD_Z3.md` (nuevo)
- `docs/command-center/MATRIZ_TRAZABILIDAD_Z4.md` (nuevo)
- `docs/command-center/PLAN_DATOS_REALES_FESA.md` (nuevo)
- `docs/command-center/PROPUESTA_CONSERVACION_GIT.md` (nuevo)
- `docs/command-center/PROTOCOLO_PRUEBAS_CON_USUARIOS.md` (nuevo)
- `docs/command-center/REGISTRO_DECISIONES_PENDIENTES.md` (nuevo)
- `docs/command-center/REGISTRO_LIMITACIONES_FASE_3.md` (nuevo)
- `docs/command-center/generated/AUTORIZACIONES.json` (nuevo)
- `docs/command-center/generated/CORRESPONDENCIA_HOME_REAL.json` (nuevo)
- `docs/command-center/generated/ESCENARIOS_COMERCIALES.json` (nuevo)
- `docs/command-center/generated/ESCENARIOS_Z1.json` (nuevo)
- `docs/command-center/generated/ESCENARIOS_Z3.json` (nuevo)
- `docs/command-center/generated/ESCENARIOS_Z4.json` (nuevo)
- `docs/command-center/generated/ESTADO_MAXIMOS.json` (nuevo)
- `docs/command-center/generated/HASHES_BASE_3_2.json` (nuevo)
- `docs/command-center/generated/HASHES_BASE_3_3.json` (nuevo)
- `docs/command-center/generated/MATRIZ_TRAZABILIDAD_Z1.json` (nuevo)
- `docs/command-center/generated/MATRIZ_TRAZABILIDAD_Z3.json` (nuevo)
- `docs/command-center/generated/MATRIZ_TRAZABILIDAD_Z4.json` (nuevo)
- `docs/command-center/generated/MODIFICACIONES_AUTORIZADAS.json` (nuevo)
- `docs/command-center/generated/PROTOTIPO_SITUACIONES.json` (nuevo)
- `docs/command-center/prototipo/home_3_5_prototipo.html` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/LEEME_CAPTURAS_3_2_A7_HISTORICA.md` (nuevo)
- `docs/command-center/wireframes/z1_3_2_wireframe.html` (nuevo)
- `docs/command-center/wireframes/z3_3_3_wireframe.html` (nuevo)
- `docs/command-center/wireframes/z4_3_4_wireframe.html` (nuevo)
- `tools/audit/_autorizadas.py` (nuevo)
- `tools/audit/_historico/z1-lectura-ejecutiva.v3.2-aceptada.js` (nuevo)
- `tools/audit/_verificador_zona.py` (nuevo)
- `tools/audit/coherencia-zonas.js` (nuevo)
- `tools/audit/escenarios-comerciales-generar.js` (nuevo)
- `tools/audit/escenarios-comerciales.js` (nuevo)
- `tools/audit/fase1_catalogo.py` (nuevo)
- `tools/audit/matriz_ux_md.py` (nuevo)
- `tools/audit/matriz_z1_md.py` (nuevo)
- `tools/audit/matriz_zona_md.py` (nuevo)
- `tools/audit/probar_verificador_3_1.py` (nuevo)
- `tools/audit/probar_verificador_3_2.py` (nuevo)
- `tools/audit/probar_verificadores_3_3_a_3_5.py` (nuevo)
- `tools/audit/propuesta_conservacion.py` (nuevo)
- `tools/audit/prototipo-generar.js` (nuevo)
- `tools/audit/registrar_modificaciones_autorizadas.py` (nuevo)
- `tools/audit/verificar_consistencia_3_1.py` (nuevo)
- `tools/audit/verificar_consistencia_3_2.py` (nuevo)
- `tools/audit/verificar_consistencia_3_3.py` (nuevo)
- `tools/audit/verificar_consistencia_3_4.py` (nuevo)
- `tools/audit/verificar_consistencia_3_5.py` (nuevo)
- `tools/audit/wf-common.js` (nuevo)
- `tools/audit/z1-ejemplos-incorrectos.json` (nuevo)
- `tools/audit/z1-escenarios.js` (nuevo)
- `tools/audit/z1-generar-artefactos.js` (nuevo)
- `tools/audit/z1-lectura-ejecutiva.js` (nuevo)
- `tools/audit/z3-atencion.js` (nuevo)
- `tools/audit/z3-ejemplos-incorrectos.json` (nuevo)
- `tools/audit/z3-escenarios.js` (nuevo)
- `tools/audit/z34-generar-artefactos.js` (nuevo)
- `tools/audit/z4-acciones.js` (nuevo)
- `tools/audit/z4-ejemplos-incorrectos.json` (nuevo)
- `tools/audit/z4-escenarios.js` (nuevo)
- `tools/audit/z5-conjunto.js` (nuevo)

</details>

## C5 · Fase 3 — pruebas y lotes de navegador

*Procedencia / fase:* Fase 3. `tools/test-fase3-*.js`, `batch_fase3_*.py` y `capturas_fase3_*.py`.

Mensaje propuesto: `Fase 3: pruebas y lotes de navegador`

<details><summary>Lista de archivos (18)</summary>

- `tools/regression/batch_fase3_1_home_auditoria.py` (nuevo)
- `tools/regression/batch_fase3_2_z1_wireframe.py` (nuevo)
- `tools/regression/batch_fase3_3_3_4_zonas.py` (nuevo)
- `tools/regression/batch_fase3_5_prototipo.py` (nuevo)
- `tools/regression/batch_fase3_calidad_ux.py` (nuevo)
- `tools/regression/batch_fase3_correspondencia.py` (nuevo)
- `tools/regression/capturas_fase3_2.py` (nuevo)
- `tools/regression/capturas_fase3_3_3_4.py` (nuevo)
- `tools/regression/capturas_fase3_5.py` (nuevo)
- `tools/test-fase3-2-z1.js` (nuevo)
- `tools/test-fase3-3-z3.js` (nuevo)
- `tools/test-fase3-4-z4.js` (nuevo)
- `tools/test-fase3-coherencia.js` (nuevo)
- `tools/test-fase3-combineimpacts.js` (nuevo)
- `tools/test-fase3-d05-completitud.js` (nuevo)
- `tools/test-fase3-escenarios-comerciales.js` (nuevo)
- `tools/test-fase3-propiedad-z5.js` (nuevo)
- `tools/test-fase3-transversal-d05-d07.js` (nuevo)

</details>

## C7 · Evidencias visuales (capturas PNG)

*Procedencia / fase:* Fase 3. Capturas de Chromium emulado de los wireframes y del prototipo; consumidas por los verificadores documentales (ver auditoría de capturas).

Mensaje propuesto: `Fase 3: capturas de evidencia (Chromium emulado)`

<details><summary>Lista de archivos (100)</summary>

- `docs/command-center/prototipo/capturas_3_5/prototipo_escritorio_alta.png` (nuevo)
- `docs/command-center/prototipo/capturas_3_5/prototipo_escritorio_baja.png` (nuevo)
- `docs/command-center/prototipo/capturas_3_5/prototipo_escritorio_enorden.png` (nuevo)
- `docs/command-center/prototipo/capturas_3_5/prototipo_escritorio_insuficiente.png` (nuevo)
- `docs/command-center/prototipo/capturas_3_5/prototipo_escritorio_media.png` (nuevo)
- `docs/command-center/prototipo/capturas_3_5/prototipo_escritorio_sinactividad.png` (nuevo)
- `docs/command-center/prototipo/capturas_3_5/prototipo_interaccion_contexto_y_filtro.png` (nuevo)
- `docs/command-center/prototipo/capturas_3_5/prototipo_movil_alta.png` (nuevo)
- `docs/command-center/prototipo/capturas_3_5/prototipo_movil_baja.png` (nuevo)
- `docs/command-center/prototipo/capturas_3_5/prototipo_movil_enorden.png` (nuevo)
- `docs/command-center/prototipo/capturas_3_5/prototipo_movil_insuficiente.png` (nuevo)
- `docs/command-center/prototipo/capturas_3_5/prototipo_movil_media.png` (nuevo)
- `docs/command-center/prototipo/capturas_3_5/prototipo_movil_sinactividad.png` (nuevo)
- `docs/command-center/prototipo/capturas_3_5/prototipo_tableta_alta.png` (nuevo)
- `docs/command-center/prototipo/capturas_3_5/prototipo_tableta_baja.png` (nuevo)
- `docs/command-center/prototipo/capturas_3_5/prototipo_tableta_enorden.png` (nuevo)
- `docs/command-center/prototipo/capturas_3_5/prototipo_tableta_insuficiente.png` (nuevo)
- `docs/command-center/prototipo/capturas_3_5/prototipo_tableta_media.png` (nuevo)
- `docs/command-center/prototipo/capturas_3_5/prototipo_tableta_sinactividad.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/aplicacion_existente_home_actual.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_00_jerarquia.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_01_escritorio.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_02_tableta.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_03_movil.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_04_legibilidad_estres.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_05_estados_movil.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_06_estados_tableta.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_01.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_02.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_03.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_04.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_05.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_06.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_07.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_08.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_09.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_10.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_11.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_12.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_13.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_14.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_A1.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_A10.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_A11.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_A12.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_A13.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_A14.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_A15.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_A16.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_A2.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_A3.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_A4.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_A5.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_A6.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_A7.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_A8.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_2/diseno_propuesto_escenario_A9.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_3/aplicacion_existente_home_actual.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_3/diseno_propuesto_00_clases.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_3/diseno_propuesto_01_escritorio.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_3/diseno_propuesto_02_tableta.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_3/diseno_propuesto_03_movil.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_3/diseno_propuesto_04_legibilidad_estres.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_3/diseno_propuesto_escenario_01.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_3/diseno_propuesto_escenario_02.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_3/diseno_propuesto_escenario_03.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_3/diseno_propuesto_escenario_04.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_3/diseno_propuesto_escenario_05.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_3/diseno_propuesto_escenario_06.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_3/diseno_propuesto_escenario_07.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_3/diseno_propuesto_escenario_08.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_3/diseno_propuesto_escenario_09.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_3/diseno_propuesto_escenario_10.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_3/diseno_propuesto_escenario_11.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_3/diseno_propuesto_escenario_12.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_3/diseno_propuesto_escenario_13.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_3/diseno_propuesto_escenario_14.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_4/aplicacion_existente_home_actual.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_4/diseno_propuesto_00_tipos.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_4/diseno_propuesto_01_escritorio.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_4/diseno_propuesto_02_tableta.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_4/diseno_propuesto_03_movil.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_4/diseno_propuesto_04_legibilidad_estres.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_4/diseno_propuesto_escenario_01.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_4/diseno_propuesto_escenario_02.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_4/diseno_propuesto_escenario_03.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_4/diseno_propuesto_escenario_04.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_4/diseno_propuesto_escenario_05.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_4/diseno_propuesto_escenario_06.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_4/diseno_propuesto_escenario_07.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_4/diseno_propuesto_escenario_08.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_4/diseno_propuesto_escenario_09.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_4/diseno_propuesto_escenario_10.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_4/diseno_propuesto_escenario_11.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_4/diseno_propuesto_escenario_12.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_4/diseno_propuesto_escenario_13.png` (nuevo)
- `docs/command-center/wireframes/capturas_3_4/diseno_propuesto_escenario_14.png` (nuevo)
- `docs/command-center/wireframes/capturas_auditoria/home_desktop_full.png` (nuevo)
- `docs/command-center/wireframes/capturas_auditoria/home_empty_desktop.png` (nuevo)
- `docs/command-center/wireframes/capturas_auditoria/home_mobile_fold.png` (nuevo)

</details>

## Verificación posterior (si autorizas el commit y el push)

1. `git status` limpio y `git log` con los commits propuestos, en la rama de trabajo.
2. El HEAD remoto de la rama coincide con el local.
3. Desde un clon limpio de esa rama: `node tools/selftest-node.js`, los `tools/test-*.js`, `python3 tools/audit/verificar_consistencia_3_1.py … 3_5.py` y los lotes de navegador con `tools/regression/run_batch.py`.
4. Comparar los hashes de `generated/MODIFICACIONES_AUTORIZADAS.json` y de la línea base de `generated/HASHES_BASE_3_3.json`.
5. Confirmar que no se subió nada a la rama de producción y que la aplicación publicada no cambió.
