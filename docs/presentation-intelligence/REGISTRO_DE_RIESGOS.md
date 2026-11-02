# Registro de riesgos — Presentation Intelligence (corte: Fase 8 + endurecimiento)

Insumo del reporte final para la otra IA. Se completa al cerrar las Fases 8 y 9. Cada riesgo: qué es, dónde vive, cómo se mitigó y qué queda abierto.

## Estado tras el endurecimiento (corrección de los 18 riesgos abiertos)
Leyenda: **Cerrado** = corregido y con prueba · **Mitigado** = reducido con prueba, el riesgo de fondo sigue · **Abierto** = no se puede cerrar con código.

| # | Riesgo | Estado | Qué se hizo / qué falta |
|---|---|---|---|
| 1 | Venta ≠ utilidad | **Mitigado** | Las columnas de impacto dicen «Impacto simulado (venta)» y las notas lo repiten. Sin costos ni márgenes cargados no hay cierre posible. |
| 2 | Impacto simulado > brecha | **Mitigado** | Aviso, «Supera la brecha» sobre 1000 % y rótulo «(venta)». Sigue siendo un escenario. |
| 3 | IA sin prueba real | **Mitigado** | Validación más estricta: solo valen las cifras que la IA recibió (tolerancia 0.5 %, sin redondeo generoso) y no puede nombrar canales que la lámina no menciona. **Abierto:** no se probó con Cohere real. |
| 4 | Directivo «negocio» vs canal digital | **Cerrado** | La portada de Directivo agrega «Canal digital · no incluye la venta total de la empresa». |
| 5 | Datos en el navegador / cierre de sesión | **Cerrado** (con servidor simulado) | Botón «Borrar mis ediciones y preferencias guardadas»; prueba del flujo real de cierre de sesión (Supabase simulado): se borra `reportPrefs` y no se vuelve a escribir tras recargar. **Abierto:** no se probó contra el servicio real. |
| 6 | Umbrales provisionales | **Mitigado** | Sugerencia según el historial (`js/forecast/thresholdAdvisor.js`): percentil 75 y 90 de la desviación semanal contra el plan (≥ 8 semanas completas; sin historia no inventa). Se recalcula sola al llegar datos y una vez al día, aparece en Pacing › Versiones y parámetros y en la sensibilidad de la presentación, y **nunca se aplica sola**. **Abierto:** que el negocio confirme el criterio (p75/p90) y que haya ≥ 8 semanas de historial (los datos de ejemplo tienen 4). |
| 7 | Embudo GA4 sin archivo real | **Mitigado** | Prueba con venta y embudo por el importador real (`mockProducts → productImport → productStore`). **Abierto:** datos generados, no un archivo GA4 real. |
| 8 | Narrativa distinta por audiencia | **Mitigado** | Etapa 1: titulares propios (`js/report/voice.js`) para Resumen, Pacing, Factores y Quién suma y resta en Gerencial y Directivo, como plantillas sobre campos de la página. Riesgo propio (plantillas acopladas a los campos): el anexo «Reglas y umbrales» lista qué titulares salieron con la voz del formato y cuáles conservan el del reporte actual (y qué campo faltó), y una prueba sobre 89 reportes reales falla si una regla cae al titular actual teniendo sus campos, si un número no existe en el reporte o si hay lenguaje causal. **Abierto:** Operativo y el resto de láminas. |
| 9 | Cambio del periodo repetido | **Aceptado** | Aprobado por la persona. |
| 10 | Dependencia del formato del motor de escenarios | **Cerrado** | Si no hay supuestos/advertencias/cambios legibles, la lámina lo dice en una nota; la prueba con el motor real verifica la forma. |
| 11 | Ediciones largas desbordan | **Cerrado** | Tras dibujar, se avisa en pantalla qué lámina no cabe con tu texto (probado forzando el desborde). |
| 12 | Contrato interno compartido | **Mitigado** | Pruebas de integridad nuevas (`test-report-integrity.js`). |
| 13 | Acoplamiento y orden de scripts | **Cerrado** | `test-report-integrity.js` verifica el orden de carga y que no haya módulos sueltos (verificado por mutación). |
| 14 | Perfil estricto y páginas nuevas | **Cerrado** | La misma prueba obliga a decidir (slot o lista explícita) para cada página nueva del armador. |
| 15 | Choques de clases CSS | **Cerrado** | La misma prueba falla si una clase de las Fases 3–8 redefine una anterior (salvo 3 acotadas bajo `.rp-op`). |
| 16 | Conteo «N páginas» ≠ PDF | **Cerrado** | Con un formato nuevo el aviso cuenta las láminas que saldrán en el PDF. |
| 17 | Supuestos recortados | **Mitigado** | El texto completo queda como detalle (tooltip) en pantalla; la lámina impresa sigue recortada. |
| 18 | Preferencias por navegador | **Cerrado** | Ya no son locales: `reportPrefs` se sincroniza con el equipo (sale de las claves que nunca viajan), se aplica en caliente al traerla y «Borrar mis ediciones…» guarda el estado vacío para que el borrado también llegue al equipo. **Nuevo riesgo:** las ediciones de texto ahora se comparten con el equipo (última escritura gana, sin fusión) y la copia de la nube se conserva al cerrar sesión. |

**Pruebas que antes faltaban:** contraste AA de colores de estado (corregido el chip «en seguimiento»: 4.49:1 → 5.01:1), celular 390 px con editor y sensibilidad abiertos (sin desborde), tiempo de generación (≈7 s con datos de ejemplo, umbral de prueba 20 s).
**Fallos preexistentes (ya no hay):** `batch_dias_excluidos` (X3), `batch_evolucion_filtro` y `batch_movil` (M-11) eran pruebas desactualizadas por rediseños de pantalla (Inicio «Ver más», Producto y evolución, veredicto de Pacing), no errores del producto; se adaptaron sin cambiar lo que verifican. `batch_editorial` ya pasa desde cualquier carpeta.
**Corregidas después:** `batch_drill` (D6) y `batch_restaurar_carga` (R1e) esperaban un tiempo fijo y fallaban con la máquina cargada; ahora esperan la condición.
**Siguen sin corregirse:** lint de diseño en 193 hallazgos (línea base), PPTX, la higiene del repositorio (sección G).

## A. Decisiones de negocio provisionales
| # | Riesgo | Dónde | Estado |
|---|---|---|---|
| A1 | Umbrales «bajo el plan» 0.5 % y «más floja» 1 % (Operativo) elegidos sin base de negocio | `config.reports.operativo` | Editables en pantalla; sin validar con el negocio |
| A2 | Semáforo Gerencial/Directivo: en meta < 1 %, fuera de meta ≥ 5 % | `config.reports.gerencial` | Editables; provisionales |
| A3 | Los umbrales editados se guardan en el navegador y se sincronizan con el equipo (última escritura gana) | Fase 7 | Ver 18 |

## B. Cifras y honestidad de los datos
| # | Riesgo | Mitigación | Abierto |
|---|---|---|---|
| B1 | **Valor = venta, no utilidad**: no hay costos, márgenes, inversión ni atribución; no se calcula margen, ROI, ROAS ni CAC | Notas explícitas en las láminas; la validación de IA rechaza esos términos | Cualquier lectura de «rentabilidad» sería inválida |
| B2 | Impacto simulado de acciones (Estimado) puede superar la brecha | Aviso «Revisa los supuestos»; nunca se suma entre acciones | Sigue siendo un escenario, no un resultado |
| B3 | La suma de brechas por canal ≠ brecha del total digital (los canales sobre el plan no restan) | Se muestran ambas cifras y la nota | Lector desatento puede confundirse |
| B4 | Directivo habla del **canal digital**, no de la empresa: no hay venta total de la empresa | No se calcula contribución; nota en el veredicto | La portada conserva el titular del reporte actual (a veces dice «negocio») |
| B5 | `recoveryPercent` = fracción de la brecha (verificado); antes se creyó ambiguo | Se muestra como «% de la brecha» rotulado Estimado | — |
| B6 | Cierre estimado del Veredicto depende del método y la confiabilidad del forecast | Muestra confiabilidad y divergencia que el reporte ya calculó | Con poca historia es un rango, no una cifra |
| B7 | Embudo (GA4 por producto): es por producto, no por canal; «compras» son artículos, no pedidos | Nota en la lámina | Probado en pantalla con datos inyectados; **no** con un archivo GA4 real |

## C. Arquitectura y compatibilidad
| # | Riesgo | Mitigación | Abierto |
|---|---|---|---|
| C1 | Regresión del reporte actual | Líneas base (golden): 89 llamadas del armador + escenarios en navegador (`report_golden.json`, `report_builder_golden.json`); 712 combinaciones de equivalencia | Cada cambio intencional exige reescribir la línea base con diferencia justificada (hecho: D1, fecha única, `thresholds` en la entrada) |
| C2 | Cambio visible en el reporte actual: ya no repite el periodo arriba a la derecha si el subtítulo lo trae (solo cambió Clientes) | Verificado por diferencia de texto | Aprobado por la persona |
| C3 | Acoplamiento: Gerencial depende de `operativo.js`; Directivo de operativo, oportunidades y gerencial (orden de carga en `index.html`) | Errores explícitos si falta alguno | Fragilidad si se reordenan scripts |
| C4 | Perfiles «strict» (Directivo) excluyen páginas no listadas; los demás no | Bandera explícita y probada | Una página nueva del reporte no aparecerá en Directivo hasta listarla |
| C5 | Las láminas reutilizadas conservan el texto del reporte actual: la diferencia de narrativa entre formatos es de selección/orden, no de redacción | Documentado | Meta del prompt maestro (narrativa distinta por audiencia) cubierta solo en parte |
| C6 | `reportBuilder.js` no creció; los bloques nuevos viven en módulos propios | Revisado | — |
| C7 | Choques de nombres de clases CSS (ya ocurrió con `rp-dv*` de Factores) | Prefijos propios; prueba visual | Riesgo recurrente en `report.css` (archivo compartido) |
| C8 | Lámina que no cabe en 16:9 | `fitPages` + pruebas de 1122×630, sin desborde y texto ≥ 13.4 px por lámina nueva | Ediciones de texto largas pueden desbordar láminas densas |

## D. Persistencia, privacidad y sesión (Fase 7)
| # | Riesgo | Mitigación | Abierto |
|---|---|---|---|
| D1 | Datos del equipo (ediciones de texto) quedan en el navegador y, con la sincronización activa, en la nube del equipo | La clave `reportPrefs` se borra de este navegador al cerrar sesión (no está en `SIGNOUT_KEEP`); la copia de la nube se conserva | Mientras la sesión está abierta, otra persona con acceso al navegador las ve |
| D2 | Escrituras tardías tras cerrar sesión | `storage.save` devuelve false mientras se borra; solo se escribe si cambió | Probado con el borrado de datos, no con el flujo completo de cierre de sesión en un servidor real |
| D3 | Preferencias guardadas inválidas o de otra versión | Se descartan con aviso; nunca se rellenan | — |
| D4 | Texto de la persona con HTML | Se escapa; probado con `<b>` e `<img onerror>` | — |

## E. IA opcional (Fase 7)
| # | Riesgo | Mitigación | Abierto |
|---|---|---|---|
| E1 | Salen datos del navegador a Cohere | Apagada por defecto, permiso por sesión, solo al pulsar el botón, solo texto y cifras de esa lámina, registro de transparencia (`FP.aiAudit`) | Una vez enviado no se puede retirar |
| E2 | Hipótesis con cifras inventadas o causas como hecho | Validación local: lista de cifras de la lámina, lenguaje de posibilidad obligatorio, sin lenguaje causal ni margen/ROI/ROAS/CAC; todo o nada | La lista de cifras es tolerante: una cifra inventada que coincida con otra de la lámina pasaría; afirmaciones falsas sin números no se detectan |
| E3 | La persona acepta una hipótesis y la presenta como hecho | Se rotula «Hipótesis (IA), por validar» en la lámina | Depende de la persona |
| E4 | Probado con cliente simulado, no con Cohere real | — | Falta prueba con la API real |

## F. Pruebas y proceso
| # | Riesgo | Estado |
|---|---|---|
| F1 | 3 fallos preexistentes sin clasificar: `batch_dias_excluidos` (X3), `batch_evolucion_filtro`, `batch_movil` (M-11) | No relacionados con el reporte; abiertos |
| F2 | `batch_editorial` solo pasa corrido desde la raíz del repo | Conocido |
| F3 | `batch_drill` y `batch_restaurar_carga` fallan bajo carga paralela y pasan solos | Conocido |
| F4 | Lint de diseño estable en 193 hallazgos (línea base, no 0) | Conocido |
| F5 | Varias pruebas de pantalla usan datos de ejemplo/mocks; el embudo GA4 y la IA no se han probado con datos o servicios reales | Abierto |
| F6 | Pruebas triviales detectadas y retiradas durante el desarrollo; se usaron mutaciones para verificar las críticas | Hecho |

## H. Escenarios y anexos (Fase 8)
| # | Riesgo | Mitigación | Abierto |
|---|---|---|---|
| H1 | La lámina depende de la forma de `assumptions`/`warnings`/`expectedImpact` que guarda el motor de escenarios (verificada) | Lee solo textos y números; si faltan, muestra «Sin supuestos guardados» o «—» | Un cambio de forma en el motor degradaría la lámina sin error visible |
| H2 | «% de la brecha» enorme o engañoso con brechas chicas | Sobre 1000 % se escribe «Supera la brecha»; aviso «Revisa los supuestos» sobre 100 % | El impacto simulado sigue siendo un escenario con supuestos |
| H3 | Supuestos recortados a 110 caracteres pueden perder matiz | Nota «completos en Recuperar» | Solo el primer supuesto/advertencia |
| H4 | El anexo «Ediciones e IA» se decide al componer y no cuenta en el total del reporte | `needs:'edits'` en el compositor; probado | El conteo «N láminas» del aviso de generación puede diferir en 1 del PDF |
| H5 | El anexo de reglas refleja los umbrales del momento de generar | La vista previa se marca desactualizada al cambiarlos | — |
| H6 | `blocks.extend` ahora entrega el perfil a los constructores y excluye del total las páginas `needs` | Probado | Cambio en un contrato interno compartido por todos los formatos |

## I. Riesgos nuevos de las mitigaciones
| # | Riesgo | Mitigación | Abierto |
|---|---|---|---|
| I1 | La sugerencia de umbrales es estadística, no un criterio de negocio: con semanas atípicas (campañas, fechas pico) sube los umbrales | Solo semanas completas; percentiles (no promedio); evidencia visible; nunca se aplica sola | No distingue semanas de campaña |
| I2 | El cálculo diario/por datos se ejecuta al dibujar la pantalla | Solo recalcula si cambia la corrida del forecast o el día; probado (no repite) | Primera pantalla del día paga el cálculo (≈ms) |
| I3 | Aplicar la sugerencia de Pacing recalcula la corrida y cambia los semáforos de la herramienta | Botón explícito, deshabilitado si ya coincide | Cambia lo que se ve en Pacing e Inicio para todo el equipo (los ajustes se sincronizan) |
| I4 | Titulares con voz propia pueden quedar desfasados de las cifras de la lámina | Salen de los mismos campos que las cifras; prueba de números sobre 89 reportes | Solo cubre 2 formatos y 4 láminas |
| I5 | Las ediciones de texto y los umbrales de la presentación se comparten con el equipo (última escritura gana) | Aviso en el editor | Sin fusión de conflictos |

## G. Higiene del repositorio (fuera del código)
Ramas viejas por borrar, 8 PRs de Jules obsoletos (#64, #117, #130, #135, #140, #160, #188, #191), activar «Automatically delete head branches» y desactivar el schedule de Jules.
