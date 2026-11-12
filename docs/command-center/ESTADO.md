# Command Center Intelligence — registro de estado del proyecto

Última actualización: resolución de los criterios C1 a C5 de la auditoría final de la Subfase 3.2 (Resumen ejecutivo · Z1), lista para revisión y no aceptada; se registra además la aceptación formal de la 3.1 comunicada por el usuario (sin commit). Rama de trabajo `ccr-a81af632-rirtu7`, commit base `a2b38630bb9c0183b920e619567b950953eba31e`. Los cambios de Fase 1 y Fase 2 siguen sin confirmar en Git, pendientes de autorización expresa.

## Estado actual
- **Fase actual:** ninguna en ejecución. **La Fase 3 — Diseño UX/UI quedó cerrada** (12-nov-2026) como diseño, arquitectura UX/UI y especificación funcional: las subfases 3.1 a 3.5 están **ACEPTADAS CON LIMITACIONES DOCUMENTADAS** por aceptación formal del usuario. Esto **no** significa que el diseño esté integrado en el Home real, validado con usuarios ni listo para producción. Las Fases 4, 5 y 6 siguen NO INICIADAS y requieren autorización expresa.
- Las Fases 1 y 2 permanecen aceptadas (`ACEPTACION_FASE_2.md`). Las Subfases 3.1, 3.2, 3.3, 3.4 y 3.5 figuran **ACEPTADAS CON LIMITACIONES DOCUMENTADAS** por aceptación formal comunicada por el usuario (3.3–3.5 el 12-nov-2026). Las Fases 4, 5 y 6 permanecen NO INICIADAS.

## Roadmap (6 fases · 30 subfases)
| Fase | Subfase | Estado |
|---|---|---|
| **1. Auditoría y diagnóstico** | 1.1 Auditoría de arquitectura y código | COMPLETADA Y ACEPTADA (con limitaciones documentadas) |
| | 1.2 Inventario de módulos, datos e indicadores | COMPLETADA Y ACEPTADA |
| | 1.3 Auditoría de motores de cálculo y diagnósticos | COMPLETADA Y ACEPTADA |
| | 1.4 Auditoría de Cohere e IA | COMPLETADA Y ACEPTADA (sin prueba en vivo de Cohere: limitación) |
| | 1.5 Identificación de brechas y oportunidades | COMPLETADA Y ACEPTADA |
| **2. Arquitectura de inteligencia comercial** | 2.1 Modelo de lectura ejecutiva | COMPLETADA Y ACEPTADA (con limitaciones documentadas) |
| | 2.2 Modelo de indicadores y drivers | COMPLETADA Y ACEPTADA (con limitaciones documentadas) |
| | 2.3 Motor de detección de desviaciones | COMPLETADA Y ACEPTADA (con limitaciones documentadas) |
| | 2.4 Modelo de riesgos y oportunidades | COMPLETADA Y ACEPTADA (con limitaciones documentadas) |
| | 2.5 Modelo de cuantificación económica | COMPLETADA Y ACEPTADA (con limitaciones documentadas) |
| **3. Diseño UX/UI** — CERRADA como diseño, arquitectura UX/UI y especificación funcional (todas sus subfases aceptadas con limitaciones; no integrada en la aplicación real ni validada externamente) | 3.1 Arquitectura de información | ACEPTADA CON LIMITACIONES DOCUMENTADAS (aceptación formal comunicada por el usuario) |
| | 3.2 Resumen ejecutivo | ACEPTADA CON LIMITACIONES DOCUMENTADAS (aceptación formal comunicada por el usuario; limitaciones en `AUDITORIA_FINAL_ACEPTACION_3_2_Z1.md`) |
| | 3.3 Hallazgos, riesgos y oportunidades | ACEPTADA CON LIMITACIONES DOCUMENTADAS (aceptación formal comunicada por el usuario el 12-nov-2026; limitaciones en `REGISTRO_LIMITACIONES_FASE_3.md`: validación con usuarios, móviles reales, lectores de pantalla y datos reales de FESA pendientes; integración en la aplicación real pendiente; implementación de D-01 a D-07 pendiente) |
| | 3.4 Prioridades y recomendaciones | ACEPTADA CON LIMITACIONES DOCUMENTADAS (aceptación formal comunicada por el usuario el 12-nov-2026; limitaciones en `REGISTRO_LIMITACIONES_FASE_3.md`: validación con usuarios, móviles reales, lectores de pantalla y datos reales de FESA pendientes; integración en la aplicación real pendiente; implementación de D-01 a D-07 pendiente) |
| | 3.5 Prototipo y validación UX | ACEPTADA CON LIMITACIONES DOCUMENTADAS (aceptación formal comunicada por el usuario el 12-nov-2026; limitaciones en `REGISTRO_LIMITACIONES_FASE_3.md`: validación con usuarios, móviles reales, lectores de pantalla y datos reales de FESA pendientes; integración en la aplicación real pendiente; implementación de D-01 a D-07 pendiente) |
| **4. Motor de diagnóstico e inteligencia** | 4.1 Integración de fuentes y contexto | NO INICIADA |
| | 4.2 Motor de diagnósticos | NO INICIADA |
| | 4.3 Patrones y desviaciones | NO INICIADA |
| | 4.4 Priorización de riesgos y oportunidades | NO INICIADA |
| | 4.5 Cálculo del impacto económico | NO INICIADA |
| **5. IA y generación de insights** | 5.1 Arquitectura de contexto para IA | NO INICIADA |
| | 5.2 Narrativa ejecutiva | NO INICIADA |
| | 5.3 Explicación de causas y hallazgos | NO INICIADA |
| | 5.4 Recomendaciones inteligentes | NO INICIADA |
| | 5.5 Validación de calidad, seguridad y consistencia | NO INICIADA |
| **6. Integración, QA y liberación** | 6.1 Integración del Command Center | NO INICIADA |
| | 6.2 Validación funcional y matemática | NO INICIADA |
| | 6.3 Seguridad, persistencia y sincronización | NO INICIADA |
| | 6.4 Pruebas UX, móvil y rendimiento | NO INICIADA |
| | 6.5 Liberación y documentación | NO INICIADA |

Nombres del roadmap: se usan los del roadmap maestro vigente indicado por el usuario en la instrucción de la Subfase 3.1 (fuente de verdad); sin cambios de numeración, secuencia ni alcance.

Base de los estados de la Fase 2: la resolución del usuario sobre los puntos A y B (`ACEPTACION_FASE_2.md`) cierra la fase completa; las cinco subfases se registran con el estado de la fase.

## Subfase 3.1 — Arquitectura de información (versión 2: observaciones del usuario incorporadas)
- **Decisiones aprobadas por el usuario:**
  - **D-01** Fusionar explicación del desempeño y drivers: **aprobada**. Z2 «Qué ocurrió y por qué», con el detalle metodológico y la atribución conservados.
  - **D-02** Una sola experiencia de atención: **aprobada con condición**. Hallazgo, riesgo y oportunidad conservan clasificación, significado y tratamiento (◆ ▲ ●).
  - **D-03** Máximo tres destacados: **aprobada con condición**. 3 de N hallazgos y 3 de M acciones; el universo no se limita; selección por urgencia, impacto y confiabilidad.
  - **D-04** Retirar bloques redundantes: **aprobada con condición**. El Recorrido sale del Home principal (pasa a la ayuda existente); el Resumen en texto deja de ser bloque y su narrativa vive en Z1; sin pérdida de información.
- **Aclaraciones incorporadas:** (A) tres capas inequívocas: NAV (fuera del Home), BC (barra de contexto) y Z1 a Z5 (contenido principal); (B) la confiabilidad condiciona la lectura: cuatro niveles (Alta, Media, Baja, Insuficiente) y regla de contundencia; un diagnóstico sin sustento no se presenta como definitivo.
- **Entregables:** `FASE_3_1_ARQUITECTURA_INFORMACION.md` (§0 a §16), `MATRIZ_UX_MOTORES.md` (33 elementos: 11 Disponible, 19 Parcial, 3 Por desarrollar), `wireframes/home_3_1_wireframe.html` (versión 2), `wireframes/capturas_auditoria/`, `generated/MATRIZ_UX_MOTORES.json` (versión 2).
- **Sin cambios en código de la aplicación ni en contratos metodológicos** (verificado por checksum de los archivos preexistentes). Archivos nuevos de la subfase: los documentos citados, `tools/audit/matriz_ux_md.py`, `tools/audit/verificar_consistencia_3_1.py` y `tools/regression/batch_fase3_1_home_auditoria.py`.
- **Limitaciones:** wireframe estático y de baja fidelidad; auditoría con un solo conjunto de datos de demostración; sin pruebas en dispositivo móvil real ni con usuarios ni de accesibilidad con lector de pantalla; copy y estilo visual quedan para 3.2 a 3.5; la regla de contundencia por confiabilidad y el criterio de selección de destacados dependen de la Fase 4.
- **Aceptación formal:** comunicada por el usuario en la instrucción de la Subfase 3.2 («formalmente aceptada por el usuario»), con las limitaciones documentadas arriba.

## Subfase 3.2 — Resumen ejecutivo · Z1 Lectura ejecutiva (lista para revisión; no aceptada)
- **Alcance:** solo el diseño UX de Z1 dentro de la arquitectura aceptada en 3.1 (NAV · BC · Z1–Z5). No diseña en profundidad Z2–Z5; no inicia 3.3, 3.4, 3.5 ni las Fases 4 y 5; sin cambios de código, motores, contratos, modelo económico ni taxonomía de atribución; RGT Execution OS excluido.
- **Cierre de decisiones (D-01 a D-06, aprobadas por el usuario y no reabiertas):** D-01 visibilidad de cifras (la venta observada válida nunca se oculta; brecha, meta y cumplimiento solo con brecha válida y confiabilidad suficiente; venta comparable junto a la evolución); D-02 contribución solo como detalle estimado (nunca protagonista; «preliminar» con Baja; oculta sin brecha válida; «Margen no configurado» sin margen); D-03 veredicto cualitativo sin importes ni cifras de las tarjetas, reglas R1–R14; D-04 casos especiales (sin actividad, conversión cero, cambio de composición, comparación inválida); D-05 orden de evaluación de ocho pasos con precedencia del bloqueo duro; D-06 nombres visibles sin identificadores internos. Los **criterios aplicados** donde la decisión dejaba margen están en el documento (§3) para tu revisión.
- **Auditoría final y resolución de C1 a C5 (decisiones del usuario):** C1, pedidos y venta que no cuadran no invalidan el dato (dato inconsistente, pendiente de interpretación; cuatro clases: válido, inconsistente, no verificable, no calculable); C2, sin tolerancia de conciliación (se retiró el 1 %; pendiente de definición con datos reales); C3, confiabilidad por conclusión (una medida ausente solo afecta a la conclusión que la necesita); C4, «margen no válido» es exactamente lo que rechaza la validación del motor; C5, 0 % explícito válido, 0 % sin evidencia «sin confirmar», vacío «no configurado». Detalle en `AUDITORIA_FINAL_ACEPTACION_3_2_Z1.md`.
- **Entregables:** `FASE_3_2_RESUMEN_EJECUTIVO.md` (§0 a §16); `FASE_3_2_ESCENARIOS_Z1.md` (14 escenarios obligatorios y 16 adicionales A1–A16, generado); `MATRIZ_TRAZABILIDAD_Z1.md` (29 requisitos: 5 Disponible, 13 Parcial, 11 Por desarrollar; generada desde su JSON); `wireframes/z1_3_2_wireframe.html` (escritorio, tableta, móvil, 30 escenarios, estados de confiabilidad y prueba de legibilidad); `wireframes/capturas_3_2/` (38 capturas); `AUDITORIA_FINAL_ACEPTACION_3_2_Z1.md` (informe de auditoría y resolución de criterios).
- **Especificación ejecutable de las reglas de Z1** (no es código de la aplicación): `tools/audit/z1-lectura-ejecutiva.js`, escenarios en `tools/audit/z1-escenarios.js`, ejemplos incorrectos en `tools/audit/z1-ejemplos-incorrectos.json`, generador `tools/audit/z1-generar-artefactos.js`.
- **Verificación (ejecutada por el desarrollador):** `tools/test-fase3-2-z1.js`, `tools/regression/batch_fase3_2_z1_wireframe.py`, `tools/audit/verificar_consistencia_3_2.py` (con oráculo independiente en Python y comprobación por hash de que no cambiaron ni los documentos aceptados ni el código de la aplicación) y `tools/audit/probar_verificador_3_2.py` (pruebas negativas del propio verificador). Resultados exactos en el informe de cierre.
- **Verificador de 3.1 endurecido:** `tools/audit/verificar_consistencia_3_1.py` ahora valida una máquina de estados del roadmap (permite avances legítimos; detecta estados desconocidos o incompatibles, saltos, subfases abiertas en paralelo, retrocesos contra `generated/ESTADO_MAXIMOS.json` y contradicciones entre documentos y este archivo) y `tools/audit/probar_verificador_3_1.py` prueba que detecta cada una. No se modificó ninguna decisión ni documento de 3.1.
- **Dependencias:** etiqueta de estado del negocio, orden de evaluación y topes de confiabilidad, evolución vs comparable con venta comparable (Fase 4); contribución integrada en las vistas (Fase 4, 4.5); umbral de actividad mínima observable (validación en producción); narrativa con IA bajo los validadores R1–R14 y validación de consistencia en producción (Fase 5).
- **Limitaciones:** diseño de baja fidelidad sin estilo visual ni copy final; cifras ilustrativas (solo el escenario 2 usa valores del motor); sin pruebas en dispositivo móvil real, con usuarios ni de accesibilidad con lector de pantalla.
- **Criterios aplicados que esperan tu revisión:** «comparación válida y confiable» = datos suficientes y válidos (Baja muestra la brecha como preliminar); contribución calculada sobre la brecha; sin palabras de magnitud en el veredicto; «sin actividad» = ninguna actividad (el umbral mínimo queda como dependencia).
- **No aceptada.** Las subfases 3.3 a 3.5 y las Fases 4, 5 y 6 permanecen NO INICIADAS.

## Protocolo permanente de desarrollo, revisión y liberación (instrucción del usuario)
1. **Desarrollo:** Claude realiza autónomamente las correcciones técnicas y funcionales autorizadas dentro del alcance de cada fase. 2. **Validación:** ejecuta pruebas, regresiones y verificaciones de integridad y documenta los resultados. 3. **Preparación de revisión:** con cambios visuales o funcionales, entrega capturas, demostraciones o staging si la infraestructura lo permite. 4. **Pull Request:** resumen, archivos afectados, justificación, evidencias, pruebas, riesgos y limitaciones, y diferencias con la versión anterior. 5. **Aprobación del propietario:** nada se integra en la rama de producción sin autorización expresa; los cambios que alteren reglas comerciales, cálculos, indicadores, interpretaciones o decisiones estratégicas requieren además **aprobación funcional expresa**. 6. **Producción:** ningún merge, despliegue ni publicación sin autorización expresa; con ella, se ejecuta la liberación y se verifica que la versión publicada funcione. 7. **Protección:** la producción permanece estable mientras haya cambios pendientes de revisión. **Aceptar una subfase no equivale a autorizar su publicación.**

## Subfases 3.3, 3.4 y 3.5 — Z3, Z4 y prototipo (ACEPTADAS CON LIMITACIONES DOCUMENTADAS por el usuario el 12-nov-2026)
- **Autorización:** el usuario aceptó formalmente 3.2 y autorizó ejecutar 3.3, 3.4 y 3.5 de forma continua, sin autorización intermedia (`generated/AUTORIZACIONES.json`, que la máquina de estados de `verificar_consistencia_3_1.py` reconoce); no autorizó las Fases 4, 5 ni 6, que permanecen NO INICIADAS. RGT Execution OS sigue fuera.
- **3.3 (Z3 · Qué merece atención):** `FASE_3_3_HALLAZGOS_RIESGOS_OPORTUNIDADES.md`, `FASE_3_3_ESCENARIOS_Z3.md`, `MATRIZ_TRAZABILIDAD_Z3.md` (17 requisitos: 1 Disponible, 11 Parcial, 5 Por desarrollar), wireframe y 20 capturas; especificación ejecutable `tools/audit/z3-atencion.js` (D-02 tres clases, D-03 «3 de N» y «Ver todos», aclaración B).
- **3.4 (Z4 · Qué hago):** `FASE_3_4_PRIORIDADES_RECOMENDACIONES.md`, `FASE_3_4_ESCENARIOS_Z4.md`, `MATRIZ_TRAZABILIDAD_Z4.md` (13 requisitos: 2 Disponible, 5 Parcial, 6 Por desarrollar), wireframe y 20 capturas; especificación `tools/audit/z4-acciones.js`. El formato de acción candidata es una propuesta de diseño, no un contrato aceptado de Fase 2.
- **3.5 (prototipo y validación UX):** `FASE_3_5_PROTOTIPO_VALIDACION_UX.md`, `ESPECIFICACION_UX_UI_COMMAND_CENTER.md`, prototipo navegable `prototipo/home_3_5_prototipo.html` (BC + Z1–Z5, 6 situaciones) y 19 capturas. **Validación automatizada y de experto con datos simulados; la validación con usuarios, en móvil real y con lector de pantalla está PENDIENTE** (protocolo en el documento).
- **Hallazgo sobre un contrato de Fase 2 (documentado, no corregido):** `combineImpacts` toma «el mayor» por valor en las superposiciones; con importes negativos (brechas) eso es el de menor magnitud y subestimaría el total. Z3 no muestra cifra en esa línea. Se resuelve en 4.5.
- **Limitaciones comunes:** diseño de baja fidelidad sin copy final; datos simulados (ninguna prueba usa datos reales de FESA); Z2 y Z5 solo como estructura de 3.1; criterio de selección y de priorización cualitativo (el definitivo es 4.4); sin productor de actividad agregada ni margen por canal; revisión heurística hecha por el autor del diseño.

## Ronda final de calidad de la Fase 3 (instrucción del usuario; sin Git)
- **Alcance ejecutado:** auditoría y corrección de coherencia entre Z1, Z3 y Z4; UX/accesibilidad/responsive del prototipo (9 anchos emulados); 16 escenarios comerciales críticos; diagnóstico de `combineImpacts` (motor **sin modificar**); matriz de correspondencia prototipo ↔ aplicación; entregables externos; registros de decisiones y limitaciones. **No** se hizo commit, push, merge, despliegue, cierre de PR, borrado de ramas ni cambio de configuración; no se inició la Fase 4 ni se conectó RGT.
- **Documentos nuevos (pendientes de aceptación formal):** `INFORME_RONDA_CALIDAD_FASE_3.md`, `ESCENARIOS_COMERCIALES_CRITICOS.md`, `DIAGNOSTICO_COMBINEIMPACTS.md`, `MATRIZ_CORRESPONDENCIA_PROTOTIPO_APP.md`, `REGISTRO_DECISIONES_PENDIENTES.md`, `REGISTRO_LIMITACIONES_FASE_3.md`, `PROTOCOLO_PRUEBAS_CON_USUARIOS.md`, `CHECKLIST_MOVIL_REAL_Y_ACCESIBILIDAD.md`, `PLAN_DATOS_REALES_FESA.md`.
- **Estado de la Fase 3 (a la fecha de esa ronda; superado por la aceptación del 12-nov-2026 descrita arriba):** *En cierre de calidad*. 3.1 y 3.2 aceptadas; **3.3, 3.4 y 3.5 completadas con limitaciones y pendientes de aceptación formal** (no las marco como aceptadas). Fases 4, 5 y 6: no iniciadas.
- **Decisiones D-01 a D-07 de esta ronda: ACEPTADAS POR EL USUARIO el 12 de noviembre de 2026** (márgenes negativos; conciliación con umbral de $0.01; actividad mínima sin umbral universal; priorización conjunta de impacto, confiabilidad y capacidad de ejecución; interpretaciones; agregación de impactos; nomenclatura de zonas). Registro oficial: `REGISTRO_DECISIONES_PENDIENTES.md` (con consecuencias, fase y dependencias). **Aceptar una decisión no implica que esté especificada, implementada, probada, validada externamente, integrada ni publicada:** ninguna está implementada; el motor (`combineImpacts`, rechazo de margen negativo) **no se modificó**. Los identificadores D-01…D-07 de este registro son distintos de los D-01…D-06 de 3.2 y D-01…D-04 de 3.1.
- **Cierre de D-05 y D-07 (12-nov-2026, autorización específica):** la afirmación «datos completos» de Z1 se condiciona a completitud verificable (`CAMBIO_AUTORIZADO_D05_Z1.md`; modificación autorizada de 5 archivos de Z1 registrada con hashes en `generated/MODIFICACIONES_AUTORIZADAS.json`; implementada **solo en la especificación y el prototipo**, probada con datos simulados). D-07: `EQUIVALENCIAS_ZONAS_D07.md` (equivalencias, responsabilidades Z3/Z5); los dos hallazgos (H-01 y H-02) **se resolvieron después como aclaraciones derivadas de D-07** (`ACLARACION_H01_H02_PROPIEDAD_Z5.md`; no se creó D-08). Informes: `INFORME_CIERRE_D05_D07_FASE_3.md` e `INFORME_CIERRE_H01_H02_FASE_3.md`. **H-01 y H-02 (12-nov-2026):** una zona propietaria y una fuente de verdad por elemento (las demás zonas referencian, resumen o proponen acciones; único cambio a 3.1: una frase, registrada con hash); Z5 «Oportunidades y visión de conjunto» con tres niveles y evidencia desplegable; relación de inclusión en Z3 (la brecha del canal no se suma a la total). **Implementado en la especificación ejecutable y el prototipo; no en la aplicación real; sin validación externa.** Propuesta de conservación en Git (no ejecutada): `PROPUESTA_CONSERVACION_GIT.md`. 3.3, 3.4 y 3.5 siguen **pendientes de aceptación formal**.
- **Pendientes que se conservan (sin evidencia de cierre):** resolución técnica y pruebas de `combineImpacts` (4.5, prioritario); implementación de los criterios aprobados; datos reales de FESA (requiere autorización); pruebas con usuarios; móviles y lectores de pantalla reales; validación independiente de reglas comerciales; integración del diseño de la Fase 3 en la aplicación; aceptación formal de 3.3, 3.4 y 3.5.
- **Nota sobre D-07:** los documentos aceptados de 3.1 y los de 3.3–3.5 usan rótulos de zona distintos a la nomenclatura aprobada; no se modificaron (protegidos); se registra como equivalencia de rótulos sin cambio funcional.

## Aceptación formal de 3.3, 3.4 y 3.5 y cierre de la Fase 3 (resolución del usuario, 12 de noviembre de 2026)
- **Aceptadas CON LIMITACIONES DOCUMENTADAS:** 3.3 (Z3 · Qué merece atención), 3.4 (Z4 · Qué puedo hacer) y 3.5 (experiencia integral, prototipo y especificación UX/UI). La Fase 3 queda **cerrada como diseño, arquitectura UX/UI y especificación funcional**.
- **Limitaciones que se conservan (sin cambio de resultados):** validación con usuarios reales pendiente; validación en dispositivos móviles reales pendiente; pruebas con lectores de pantalla pendientes; validación con datos reales de FESA pendiente; integración del diseño en la aplicación real pendiente; implementación de D-01 a D-07 pendiente (decisiones aceptadas, no implementadas). Además: `combineImpacts` con sus defectos caracterizados (4.5), la captura `diseno_propuesto_escenario_A7.png` es **evidencia histórica desactualizada** (anterior a D-05) y no representa el diseño vigente.
- **Autorización de conservación en Git:** ejecutar los seis commits de `PROPUESTA_CONSERVACION_GIT.md` y el push exclusivamente a `origin/ccr-a81af632-rirtu7`. **No** autoriza merge, despliegue, publicación, cambios en producción ni la Fase 4 (resumen en `INFORME_CIERRE_FASE_3.md`).

## Aceptación de la Fase 2 (resolución del usuario)
- **Punto A — Atribución:** ACEPTADO como COMPLETADO CON LIMITACIONES DOCUMENTADAS (`ATRIBUCION_FUENTE_DE_VERDAD.md`).
- **Punto B — Modelo económico dual:** ACEPTADO como COMPLETADO CON LIMITACIONES DOCUMENTADAS (`MODELO_CUANTIFICACION_ECONOMICA.md` §0).
- Resolución completa, limitaciones aceptadas y distinción entre pruebas del desarrollador y aceptación metodológica: `ACEPTACION_FASE_2.md`.

### Limitaciones aceptadas
| Punto | Limitación |
|---|---|
| A · Atribución | `effects()` continúa siendo secuencial |
| A · Atribución | La mezcla de segmentos nuevos o desaparecidos conserva dos definiciones |
| A · Atribución | No existe umbral de exceso de venta sin atribuir |
| B · Modelo dual | La contribución no aparece todavía en las vistas |
| B · Modelo dual | No existe margen por categoría o SKU |
| B · Modelo dual | La clasificación `estimada` no se emite sin calibración |
| Fase 2 en general | Contratos como especificación ejecutable, no código de producción; probados con datos de demostración; Cohere sin prueba en vivo |

## Decisiones aprobadas
- Alcance: solo el Home inteligente (Command Center); sin RGT ni gestión de tareas.
- Ejecución de la Fase 1 completa en un solo prompt, con cierre autónomo.
- Fase 2: escalera de certeza única; contrato `cc.finding`; estados del negocio con calificadores; severidad con materialidad y persistencia (`FASE_2_ARQUITECTURA_INTELIGENCIA.md` §5).
- Punto A: fuente única de atribución `FP.attribution.attributeSegment`, nueve estados.
- Punto B: modelo económico dual — impacto en ventas siempre; contribución bruta estimada solo con margen general opcional.
- Sin commits, merges ni pushes sin autorización expresa.

## Hallazgos relevantes
- Fase 1: ver `FASE_1_AUDITORIA.md` §C y §D (no había CSP —corregido—; cuatro modelos de «hallazgo» sin contrato común; `app.js` de 6 478 líneas).
- Fase 2: atribución secuencial duplicada con divergencia en bases en cero (**resuelta** en el punto A); umbrales fragmentados; `riskOpportunityEngine` sin uso; orquestación en código de vista (`FASE_2_ARQUITECTURA_INTELIGENCIA.md` §6).

## Archivos modificados
Fase 1: `FASE_1_AUDITORIA.md` §F. Fase 2 (cierre metodológico): `js/diagnostics/attribution.js`, `js/analytics/{trafficConversionEngine,homeSummaryEngine,funnelEngine}.js`, `js/agents/analistaStory.js`, `js/diagnostics/driverEngine.js`, `js/ui/segments-decomp-view.js`, `js/ui/guidance/home-summary-view.js`, `js/economics/impactModel.js` (nuevo), `js/app.js`, `js/ui/settings-view.js`, `index.html`, `ARCHITECTURE.md`, pruebas en `tools/` y documentos en `docs/command-center/`. Todo sin commit.

## Pruebas realizadas (por el desarrollador)
Subfases 3.3 a 3.5 (sin cambios de código de la aplicación; pruebas de lógica, especificación, navegador emulado y datos simulados, **ninguna con datos reales de FESA**): `test-fase3-3-z3.js` 51/51 (22 mutaciones) · `test-fase3-4-z4.js` 48/48 (21 mutaciones) · `batch_fase3_3_3_4_zonas.py` 57/57 · `batch_fase3_5_prototipo.py` 80/80 · `verificar_consistencia_3_3.py` 30/30 · `_3_4.py` 30/30 · `_3_5.py` 15/15 · `probar_verificadores_3_3_a_3_5.py` 51/51 · `verificar_consistencia_3_1.py` 36/36 (máquina de estados con cadena autorizada) · `probar_verificador_3_1.py` 27/27 · `verificar_consistencia_3_2.py` 43/43 · `probar_verificador_3_2.py` 46/46 · `test-fase3-2-z1.js` 91/91 · `batch_fase3_2_z1_wireframe.py` 48/48 · `batch_fase3_1_home_auditoria.py` 58/58 · Node 100 archivos sin fallas · motor 233/233 · lint 193 (línea base) · baterías del Home, atención, ajustes, Fase 1 y Fase 2 sin fallas. No se repitió la regresión completa de 181 baterías porque no cambió código de la aplicación (comprobado por hash).

Subfase 3.2 (sin cambios de código de la aplicación; todas son pruebas de lógica, matemáticas, de especificación o con datos simulados, **ninguna con datos reales de FESA**): `test-fase3-2-z1.js` 91/91 (30 escenarios, 61 invariantes sobre 4 000 entradas aleatorias, 21 propiedades sobre 1 500, 15 ejemplos incorrectos, 38 mutaciones detectadas) · `batch_fase3_2_z1_wireframe.py` 48/48 · `verificar_consistencia_3_2.py` 41/41 · `probar_verificador_3_2.py` 46/46 · `verificar_consistencia_3_1.py` 36/36 · `probar_verificador_3_1.py` 26/26 · `batch_fase3_1_home_auditoria.py` 58/58 · Node 98 archivos sin fallas · motor 233/233 · lint 193 (línea base). No se repitió la regresión completa de 181 baterías porque no cambió código de la aplicación (comprobado por hash).

Subfase 3.1 (sobre el código sin cambios): `verificar_consistencia_3_1.py` (consistencia documento–matriz–wireframe–ESTADO) · `batch_fase3_1_home_auditoria.py` (ver informe) · Node 97 archivos sin fallas · motor 233/233 · lint 193 (línea base) · 16 baterías del Home, móvil, atención y Fase 2 con código de salida 0. No se repitió la regresión completa de 181 baterías porque 3.1 no modificó código de la aplicación; la última corrida completa es la de la Fase 2.

Código final de Fase 2 sin commit: Node 97 archivos sin fallas · motor 233/233 · baterías de navegador 181/181 (código 0 cada una) · lint 193 (línea base) · pruebas nuevas: atribución 64, economía dual 64, contratos 69, batería real 25, batería de margen 26. Fase 1 (cierre anterior): Node 94/94 · motor 233/233 · baterías de navegador 179/179 · lint 193. La aceptación metodológica del usuario no equivale a una ejecución de pruebas por su parte (`ACEPTACION_FASE_2.md` §3).

## Riesgos abiertos
Validación en vivo de Cohere y de la concurrencia con dos conexiones en Supabase; CSP dependiente del host configurado; deuda de `app.js`; cambios sin confirmar en Git (si se pierde el entorno se pierden).

## Pendientes que no impiden la aceptación
Ver `ACEPTACION_FASE_2.md` §4.

## Próximo paso
Revisión y aceptación formal de la Subfase 3.2 por el usuario. La Subfase 3.3 (Hallazgos, riesgos y oportunidades) **no está iniciada** y requiere su autorización expresa. Las operaciones de Git (commit y push) siguen requiriendo su autorización expresa.
