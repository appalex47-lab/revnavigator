# Informe de cierre de D-05 y D-07 y preparación para la aceptación de la Fase 3

> **Nota posterior (12-nov-2026):** el usuario aceptó formalmente 3.3, 3.4 y 3.5 con limitaciones documentadas y cerró la Fase 3 (`INFORME_CIERRE_FASE_3.md`). Las menciones a «pendiente de aceptación formal» de este informe describen el estado a su fecha.

> **Nota posterior (12-nov-2026): H-01 y H-02 se resolvieron en `INFORME_CIERRE_H01_H02_FASE_3.md`; las referencias a «D-08 propuesta» de este informe quedan superadas (no se crea D-08).**
> 12 de noviembre de 2026 · rama `ccr-a81af632-rirtu7` · HEAD `a2b3863` (sin commits nuevos). **No** se hizo commit, push, merge, despliegue, publicación, borrado de ramas, cierre de PR ni cambio de configuración de GitHub. No se inició la Fase 4, no se tocó el motor de cálculos ni `combineImpacts`, y no se implementó D-01 a D-07 en el motor. Datos **simulados** (ninguno de FESA).

## 1. Resumen ejecutivo
- **D-05 resuelta en la especificación de Z1**: «datos completos» solo se afirma con completitud verificable; con datos faltantes se dice que la información está incompleta y qué falta; sin forma de comprobarlo se dice que no es posible confirmarlo. Las métricas calculables no se invalidan (4 030 entradas con resultado idéntico fuera del texto). Modificación autorizada de 5 archivos de Z1, registrada con hashes.
- **D-07 documentada**: matriz de equivalencias y responsabilidades Z3/Z5. **Dos hallazgos requieren tu decisión y quedaron detenidos sin cambios** (H-01 y H-02).
- **Auditoría transversal Z1–Z5**: encontró y corrigió un defecto real (doble conteo de la brecha total y la del canal en los totales de Z3, −$1.4 M frente a −$723 mil de Z1) y añadió tres reglas al detector (C18, C19, C20).
- Todas las pruebas ejecutadas pasan. Lo que no se pudo validar sigue en la sección 10.

## 2. Resultado D-05
Detalle completo y diff exacto: `CAMBIO_AUTORIZADO_D05_Z1.md`.
| Aspecto | Resultado |
|---|---|
| Frase localizada | `z1-lectura-ejecutiva.js` (2 puntos), `FASE_3_2_RESUMEN_EJECUTIVO.md` §5.4, escenarios generados y wireframe |
| Condición verificable de completitud | Cobertura de días = 100 %, sesiones + pedidos + venta de actividad presentes, sin avisos ni errores |
| Con datos faltantes | «Lectura calculable; la información disponible está incompleta.» + «Falta información: …» (limitaciones, confiabilidad Alta) |
| Sin forma de comprobarlo | «No es posible confirmar que la información esté completa.» |
| Escenario de los 30 afectado | Solo **A7** (pedidos no disponibles); los otros 29 conservan su texto |
| Confiabilidad/estado/cifras/visibilidad | **Sin cambios** (regresión contra la especificación aceptada, mismo hash que la línea base) |
| Z5 del prototipo | «Confiabilidad y cobertura» ahora muestra el estado de la completitud |
| No modificado | Fórmula de ventas, motor, atribución, contratos de Fase 2, `impactModel.js`, generador, demás reglas y arquitectura de Z1 |
| Estado | **Implementada en la especificación y el prototipo; no en la aplicación real; sin validación externa** |

## 3. Resultado D-07
Detalle: `EQUIVALENCIAS_ZONAS_D07.md`. Z1, Z2 y Z4 difieren solo en el rótulo (equivalencia documentada); Z3 coincide. **Contradicciones reales** (no se cambió nada):
- **H-01:** 3.1 dice «una pieza vive en una sola capa y zona»; D-07 admite una oportunidad en más de una zona con funciones distintas. Interpretación adoptada: una sola **fuente** y un solo **importe** por elemento; las demás zonas lo **referencian**. Corregir el texto de 3.1 exige tu autorización.
- **H-02:** el Z5 aceptado «Evidencia y detalle» no coincide con el Z5 oficial «Oportunidades y visión de conjunto»: la evidencia no tiene lugar oficial y la visión de conjunto no está especificada. Propuesta **D-08**: (a) evidencia plegable dentro de Z5 (recomendada), (b) llevarla a Z2, (c) zona aparte.

## 4. Matriz de responsabilidades Z1–Z5
| Zona | Responsabilidad | Fuente del dato | Importes | Acciones |
|---|---|---|---|---|
| Z1 Qué está pasando | Estado, veredicto, brecha, confiabilidad y completitud | Motores de ventas/plan | Cifra protagonista | No |
| Z2 Contexto y desempeño | Contexto, evolución, drivers (contribución matemática, no causa), hipótesis aparte | Atribución | Referencias | No |
| Z3 Qué merece atención | Hallazgo ◆, riesgo ▲, oportunidad ●; datos que faltan | Elementos con certeza | **Fuente única por elemento** | No |
| Z4 Qué puedo hacer | Acciones que citan un elemento visible; datos primero | Z3 | Solo referencias | Sí |
| Z5 Oportunidades y visión de conjunto | Integración sin duplicar (hoy: evidencia y detalle; visión de conjunto sin especificar: H-02) | Z1/Z3 | Referencias; sin consolidar superposiciones (D-06) | No |

## 5. Archivos modificados en esta tarea
- **Autorizados (Z1):** `tools/audit/z1-lectura-ejecutiva.js`, `FASE_3_2_RESUMEN_EJECUTIVO.md`, `FASE_3_2_ESCENARIOS_Z1.md`, `generated/ESCENARIOS_Z1.json`, `wireframes/z1_3_2_wireframe.html`.
- **De subfases pendientes de aceptación (3.3–3.5):** `tools/audit/coherencia-zonas.js`, `prototipo-generar.js`, `prototipo/home_3_5_prototipo.html`, `generated/PROTOTIPO_SITUACIONES.json`, `FASE_3_5_PROTOTIPO_VALIDACION_UX.md`, 10 capturas, `ESCENARIOS_COMERCIALES_CRITICOS.md`, `generated/ESCENARIOS_COMERCIALES.json`.
- **Verificadores:** `_verificador_zona.py`, `verificar_consistencia_3_2.py`, `verificar_consistencia_3_5.py` (aceptan solo los hashes de la modificación autorizada; cualquier otro cambio se sigue detectando: comprobado).
- **Registros y estado:** `ESTADO.md`, `REGISTRO_DECISIONES_PENDIENTES.md`, `REGISTRO_LIMITACIONES_FASE_3.md`.
- **Nuevos:** `CAMBIO_AUTORIZADO_D05_Z1.md`, `EQUIVALENCIAS_ZONAS_D07.md`, `INFORME_CIERRE_D05_D07_FASE_3.md`, `generated/MODIFICACIONES_AUTORIZADAS.json`, `tools/audit/_autorizadas.py`, `tools/audit/registrar_modificaciones_autorizadas.py`, `tools/audit/_historico/z1-lectura-ejecutiva.v3.2-aceptada.js` (copia de la especificación aceptada, mismo hash), `tools/test-fase3-d05-completitud.js`, `tools/test-fase3-transversal-d05-d07.js`.

## 6. Archivos protegidos y hashes
- Comparados contra la línea base: **idénticos** `index.html`, los 249 archivos de `js/`, `css/` e `index.html` (verificador A3 en 3.2, 3.3, 3.4 y 3.5), `impactModel.js`, `command-center-contracts.js`, `z1-escenarios.js`, `z1-ejemplos-incorrectos.json`, `z1-generar-artefactos.js`, los 13 documentos de Fases 1–2 y 3.1, y los documentos de 3.2 salvo los 4 autorizados.
- **Diferencias, todas autorizadas (hash base → hash nuevo en `generated/MODIFICACIONES_AUTORIZADAS.json`):** `z1-lectura-ejecutiva.js` `09f1059e…` → `5ae008c0…`; los otros cuatro archivos de Z1 tienen sus hashes registrados en el mismo archivo.
- Prueba negativa ejecutada: añadir un carácter a la especificación de Z1 hace fallar el verificador (A2).

## 7. Pruebas ejecutadas (resultados exactos)
| Prueba | Resultado |
|---|---|
| `test-fase3-d05-completitud.js` (regresión, B1–B4, C0–C9, 4 mutaciones, hash) | 21 bien, 0 mal |
| `test-fase3-transversal-d05-d07.js` (T1–T8, D-01…D-07, 2 000 lecturas) | 18 bien, 0 mal; 4 **pendientes** reportadas como tales (D-01 implementación, D-03 suficiencia de muestra, D-04) |
| `test-fase3-2-z1.js` | 91/91 |
| `test-fase3-3-z3.js` / `test-fase3-4-z4.js` | 53 / 50 |
| `test-fase3-coherencia.js` (C1–C20, 3 000 lecturas, 10 mutaciones) | 18/18 |
| `test-fase3-escenarios-comerciales.js` / `test-fase3-combineimpacts.js` | 23 / 22 |
| Node: 105 archivos `tools/test-*.js`; motor `selftest-node.js` | 0 fallas; 233/233 |
| Verificadores documentales 3.1, 3.2, 3.3, 3.4, 3.5 | 36, 43, 30, 30, 15: todo consistente |
| Pruebas de los verificadores (mutaciones) 3.1, 3.2, 3.3–3.5 | 27, 46, 51 |
| Navegador: prototipo 3.5, zonas 3.3–3.4, calidad UX (9 anchos, accesibilidad), correspondencia, auditoría Home 3.1, wireframe Z1 | 80, 57, 62, 10, 58, 48 |
| Regresión de la app: atención, resumen del Home, ajustes, margen, modelo real, consistencia de cálculos | 11, 40, 23, 26, 25, 18 (código 0) |
| `lint_design.py` | 193 (línea base, sin cambios) |
**Escenarios de esta tarea (ejecutados):** sesiones faltantes, pedidos faltantes, datos parciales (cobertura 80 %), completitud no verificable (sin actividad), oportunidades compartidas entre Z3, Z4 y Z5, consistencia con D-01…D-07.
**Preparadas pero no ejecutadas:** pruebas con usuarios, móviles reales, lector de pantalla, datos reales (protocolos listos). **Bloqueadas por el entorno:** otros navegadores y dispositivos reales. **Requieren datos reales o usuarios:** calibración de umbrales, frecuencia de clases, validación de D-01…D-04.

## 8. Defectos encontrados y corrección
| Defecto | Origen | Corrección | Prueba |
|---|---|---|---|
| «Datos completos» afirmado sin comprobar | Z1 (especificación) | Condición verificable (autorizada) | d05 B1, C1–C5 |
| Limitaciones de Z1 no mencionaban la información faltante con confiabilidad Alta | Z1 | Nota de completitud | d05 C1, C4 |
| Z5 decía «Sin motivos que advertir» sin estado de completitud | Prototipo | Línea «Completitud» | batch del prototipo |
| Z1 decía incompleta y Z3 no lo decía | Derivación | Elemento `d:incompleta`, regla C19 | transversal T3b, T7b |
| **Total de Z3 sumaba la brecha total y la del canal** | Derivación | Grupo de superposición común, regla C20 | transversal T5d |
| Verificadores comparaban contra la línea base sin admitir la modificación autorizada | Herramientas | Registro de hashes autorizados | verificadores + prueba negativa |

## 9. Limitaciones que permanecen
`REGISTRO_LIMITACIONES_FASE_3.md` (L-01…L-21). Destacan: D-01, D-02 ($0.01 por verificar), D-03 (método de suficiencia), D-04 (ponderaciones) y D-06 (`combineImpacts`) **aceptadas pero no implementadas**; Z2 sin especificación propia; H-01/H-02; derivación simulada (L-19); el Home real no incorpora nada del diseño (`MATRIZ_CORRESPONDENCIA_PROTOTIPO_APP.md`).

## 10. Pendientes de validación externa
Datos reales de FESA (con autorización), pruebas con usuarios, móviles reales, lectores de pantalla, otros navegadores, validación independiente de reglas comerciales.

## 11. Estado real de Git
- Rama `ccr-a81af632-rirtu7`, HEAD `a2b3863`. **Antes de esta tarea:** 24 modificados, 30 sin rastrear en directorios (234 entradas con `-uall`). **Después:** 24 modificados, 30 sin rastrear (242 con `-uall`; +8 archivos nuevos de esta tarea). Los cambios existían antes de esta tarea y siguen **sin confirmar** (riesgo de pérdida si el entorno se reclama).

## 12. Propuesta de conservación (NO ejecutada; requiere tu autorización expresa)
**Rama de destino:** la rama de trabajo existente `ccr-a81af632-rirtu7` (nunca `main`/producción). Sin merge ni PR. Por separado, tu aprobación para cualquier integración posterior.
**Recomiendo tres commits separados** (la autorización para conservar la ronda de calidad anterior **no** se aplica automáticamente a lo posterior):
| Commit | Contenido | Justificación y riesgo |
|---|---|---|
| **1 · Fase 2 (código de la aplicación y pruebas)** | 18 archivos modificados (`index.html`, `js/…`, `ARCHITECTURE.md`, `docs/presentation-intelligence/PROMPT_PARA_OTRA_IA.md`, 6 pruebas, `batch_ajustes_tabs.py`) + `js/economics/impactModel.js` + pruebas y lotes nuevos de Fases 1–2 (`tools/test-atribucion-escenarios.js`, `test-economia-dual.js`, `test-fase1-ia-sin-clave-local.js`, `test-fase2-contratos.js`, `tools/regression/batch_fase1_*`, `batch_fase2_*`, `run_batch.py`) | **Es código de producción**: Fase 2 aceptada, pero este commit cambia el comportamiento de la aplicación; confirmar que es lo que quieres conservar |
| **2 · Documentación y especificaciones de Fases 1–2** | Documentos aceptados de `docs/command-center/` (Fases 1–2, 3.1) y contratos de `tools/audit/` | Solo documentos |
| **3 · Fase 3 (diseño, especificaciones, prototipo, pruebas, capturas)** | Resto de `docs/command-center/` (3.2–3.5, ronda de calidad, D-05/D-07), `tools/audit/` de Fase 3, pruebas y lotes `*fase3*`, `capturas_*`, prototipo | Solo diseño y herramientas; no cambia la aplicación |
**Excluir:** nada con secretos, `.env` ni `node_modules` (no hay); `__pycache__` ya ignorado; las 100 capturas PNG (12 MB) son evidencia: recomiendo **incluirlas** salvo que prefieras un repositorio más ligero (decisión tuya). `ramas_a_borrar.txt` ya está versionado y no se toca.
**Cambios ajenos al alcance de Fase 3 detectados:** los 18 archivos modificados de la aplicación y `js/economics/` (Fase 2). Se separan en el commit 1 para poder revisarlos o excluirlos.
**Mensajes propuestos:**
1. `Fase 2: atribución única, economía dual y contratos de inteligencia (código y pruebas)`
2. `Docs: Fases 1–2 y subfase 3.1 (aceptadas) y contratos del Command Center`
3. `Fase 3: diseño de Z1–Z5, prototipo, especificaciones y pruebas; cierre de D-05 y D-07`
**Verificación posterior (después de commit y push, si los autorizas):** `git status` limpio; `git log` con los 3 commits; el HEAD remoto de la rama coincide con el local; repetir los verificadores 3.1–3.5, `test-fase3-*`, `selftest-node.js` y los lotes de navegador desde un clon limpio de la rama; confirmar los hashes de `MODIFICACIONES_AUTORIZADAS.json`.

## 13. Roadmap consolidado
| Fase | Estado |
|---|---|
| Fase 1 | Aceptada con limitaciones documentadas |
| Fase 2 | Aceptada |
| Fase 3.1 | Aceptada con limitaciones |
| Fase 3.2 | Aceptada con limitaciones (con la corrección D-05 de Z1 autorizada y registrada) |
| Fase 3.3 | Pendiente de aceptación formal |
| Fase 3.4 | Pendiente de aceptación formal |
| Fase 3.5 | Pendiente de aceptación formal |
| Fase 4 | No iniciada |
| Fase 5 | No iniciada |
| Fase 6 | No iniciada |

## 14. Dictamen técnico
**3.3, 3.4 y 3.5 están listas para revisión y aceptación formal, con limitaciones**: son diseño y especificación ejecutable, con pruebas técnicas en verde y coherencia entre capas verificada. **No** están validadas con usuarios, dispositivos ni datos reales, y el Home real no las incorpora. Antes de aceptar sin reservas conviene decidir H-01/H-02 (D-08). La aceptación formal es tuya; no la marqué.
