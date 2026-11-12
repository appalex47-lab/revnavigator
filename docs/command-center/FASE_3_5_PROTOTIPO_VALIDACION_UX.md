# Fase 3 · Subfase 3.5 — Prototipo y validación UX

**Estado:** ACEPTADA CON LIMITACIONES DOCUMENTADAS (aceptación formal comunicada por el usuario el 12-nov-2026). Es un diseño y una especificación funcional: no está integrado en la aplicación real ni validado con usuarios, móviles reales, lectores de pantalla ni datos reales de FESA.
**Alcance:** integrar BC y Z1 a Z5 en un **prototipo navegable** del Home inteligente, **validarlo hasta donde permite el entorno** y consolidar la especificación UX/UI. No implementa el Home en la aplicación, no modifica código, motores, contratos ni documentos aceptados, no incorpora IA y no inicia la Fase 4, 5 ni 6. RGT Execution OS queda fuera.
**Autorización:** el usuario aceptó 3.2 y autorizó ejecutar 3.3, 3.4 y 3.5 de forma continua; no autorizó las Fases 4, 5 ni 6.
**Base:** rama `ccr-a81af632-rirtu7`, commit base `a2b3863`, cambios previos sin confirmar (no se tocaron).
**Etiquetas de evidencia:** **Verificado**, **Reportado** (lo afirma una prueba automatizada que ejecuté), **Documentado**, **Pendiente de validación real**.

**Qué NO es esta validación.** Es una validación **automatizada y de experto, con datos simulados, en un navegador emulado**. **No hay pruebas con usuarios, ni en dispositivos móviles reales, ni con lector de pantalla, ni con datos reales de FESA.** El protocolo para hacerlas está en §5 y queda **pendiente**. Por eso la subfase **no puede declararse «prototipo aprobado»**: esa aprobación es del usuario y, para sostenerla, falta la validación real.

**Documentos y artefactos de la subfase**
| Archivo | Qué es |
|---|---|
| `FASE_3_5_PROTOTIPO_VALIDACION_UX.md` | Este documento |
| `ESPECIFICACION_UX_UI_COMMAND_CENTER.md` | Especificación UX/UI consolidada de la Fase 3 (entregable de la fase) |
| `prototipo/home_3_5_prototipo.html` | Prototipo navegable (BC + Z1 a Z5, 6 situaciones, interacciones reales) |
| `generated/PROTOTIPO_SITUACIONES.json` | Resumen generado de las situaciones |
| `prototipo/capturas_3_5/` | 19 capturas: 6 situaciones × 3 anchos y 1 interacción |
| `tools/audit/prototipo-generar.js` | Generador del prototipo desde las especificaciones ejecutables (no es código de la aplicación) |
| `tools/regression/batch_fase3_5_prototipo.py` | Validación automatizada del prototipo |

---

## 0. Estado de partida y qué se hereda
3.1 definió la arquitectura (NAV · BC · Z1–Z5); 3.2 diseñó Z1; 3.3, Z3; 3.4, Z4. Z2 sigue la estructura de 3.1 (§5): **no tiene especificación ejecutable propia**; Z5 tiene la suya desde la aclaración H-02 de D-07 (`tools/audit/z5-conjunto.js`: Oportunidades, Visión de conjunto y Evidencia y detalle) y el prototipo las representa solo con lo que ya producen Z1 y Z3 (no inventa cifras ni cálculos).

## 1. Objetivo
Verificar que **las zonas funcionan juntas**: que la confiabilidad es coherente entre capas, que el orden de lectura responde a las preguntas del negocio, que la información secundaria se alcanza con pocos pasos y que el diseño se sostiene en tres anchos, con teclado y con las situaciones difíciles (datos insuficientes, sin actividad).

## 2. El prototipo
**Cómo abrirlo:** `docs/command-center/prototipo/home_3_5_prototipo.html` en cualquier navegador (archivo único, sin dependencias). **Qué es real y qué simulado:** los textos, estados, órdenes, rótulos e importes salen de las especificaciones ejecutables de Z1, Z3 y Z4; los **datos son simulados** (las cifras de brecha y cierre son las del motor con datos de demostración desviados; el resto, inventado). **Qué no hace:** no calcula, no persiste, no lee la aplicación, y los destinos de «Ir a…» solo informan a dónde llevarían.
**Interacciones implementadas:** cambio de situación simulada (control del prototipo, fuera del Home); «Ver contexto» (narrativa ampliada de Z1) con teclado y `aria-expanded`; filtros por clase en Z3 y por tipo en Z4; «Ver todos» y «Ver todas»; evidencia plegable de cada tarjeta; secciones plegables de Z2 y Z5; aviso del destino de una acción. **Placeholders honestos:** «Cómo leer», el selector de canal y de periodo y las tablas de Z5 no están implementados.

**Las seis situaciones** (cada una coherente en las tres capas):
| Situación | Título | Confiabilidad (Z1 = Z3 = Z4) | Modo de Z3 | Z3 | Modo de Z4 | Z4 |
|---|---|---|---|---|---|---|
| `alta` | Confiabilidad alta · el negocio va por debajo del plan | Alta | completo | 3 de 6 | completo | 3 de 5 |
| `media` | Confiabilidad media · crece, con avisos de datos | Media | completo | 3 de 4 | completo | 3 de 4 |
| `baja` | Confiabilidad baja · lectura preliminar | Baja | solo_observado | 3 de 4 | datos_primero | 3 de 4 |
| `insuficiente` | Confiabilidad insuficiente · falta información | Insuficiente | solo_datos | 1 de 1 | solo_datos | 1 de 1 |
| `sinactividad` | Sin actividad · no se puede verificar nada | Insuficiente | solo_datos | 1 de 1 | solo_datos | 1 de 1 |
| `enorden` | Todo en orden · sin elementos que destacar | Alta | completo | 2 de 2 | completo | 2 de 2 |

## 3. Validación ejecutada
### 3.1 Automatizada (`tools/regression/batch_fase3_5_prototipo.py`: 80 comprobaciones, **Reportado**)
| Familia | Qué verifica |
|---|---|
| P1 | Reflujo: en 4 anchos emulados (1 366, 768, 390 y 320 px) y las 6 situaciones, nada se sale del ancho y no hay desplazamiento horizontal |
| P2 | La confiabilidad es la misma en la barra de contexto, en Z1 y en el modo de Z3 y de Z4 |
| P3 | El orden de zonas es Z1, Z2, Z3, Z4, Z5 |
| P4 | Cada acción de Z4 cita un elemento que está a la vista en Z3 (o su requisito de datos) |
| P5, P6 | Sin identificadores internos en el texto visible; Z1 tiene a lo sumo un número grande |
| P7 a P11 | «Ver contexto», filtros de Z3 y Z4, destino de una acción y la Evidencia y detalle de Z5 (plegada; advertencias críticas fuera) funcionan |
| P12 a P16 | Accesibilidad básica: nombre accesible, recorrido con Tab, operación con Enter, foco visible y contraste del texto principal ≥ 4.5:1 |
| P17, P18 | En el primer pantallazo (escritorio y móvil emulado) se ven el estado, el veredicto, la cifra protagonista y la confiabilidad; los objetivos interactivos miden ≥ 24 × 24 px |
| P19 | 10 tareas: pasos necesarios para responder (§3.3) |
| P20 | Sin errores de consola |
**Es Chromium emulado con datos simulados: no sustituye ninguna prueba real.**

### 3.2 Hallazgos de la validación y correcciones
| # | Hallazgo | Corrección | Estado |
|---|---|---|---|
| V1 | Los desplegables «Evidencia y límites», «Detalle metodológico» e «Hipótesis» medían 16 px de alto: objetivo táctil insuficiente (P18) | Altura mínima de 28 px y relleno en el estilo compartido | Corregido y verificado |
| V2 | El bloque económico de Z1 sin venta válida decía «(ni $0)»: mencionaba el cero que se quiere evitar | Se redactó sin la cifra: «el cero no sustituye a la falta de información» | Corregido y verificado |
| V3 | Al construir el prototipo, las barras de contexto ocultas seguían visibles porque `display:flex` anulaba el atributo `hidden` | Regla `[hidden]{display:none!important}` | Corregido y verificado |
| V4 | La página móvil de la situación «alta» mide unos 3 600 px: **riesgo de lectura larga** | No se corrigió: se registra como riesgo y se propone medir con usuarios si debe plegarse más (p. ej. líneas de impacto y supuestos) | **Abierto** |
V1 y V2 también se aplicaron a los wireframes de 3.3 y 3.4, que se regeneraron.

### 3.3 Medición automatizada de tareas (no es una prueba con usuarios)
Mide cuántos clics necesita una persona **ideal** para responder cada pregunta y si la respuesta mostrada es la correcta.
| Tarea | Clics | Resultado |
|---|---|---|
| T1 ¿Cómo está el negocio? | 0 | Estado y veredicto visibles |
| T2 ¿Cuánto representa la brecha? | 0 | Cifra protagonista visible |
| T3 ¿Qué tan confiable es la lectura? | 0 | Visible en la barra de contexto y en Z1 |
| T4 ¿Qué merece atención primero? | 0 | Primer destacado de Z3 (un riesgo crítico) |
| T5 ¿Qué hago primero? | 0 | Primera acción de Z4 |
| T6 Ver los 4 elementos restantes de atención | 1 | «Ver todos» |
| T7 ¿Dónde está la evidencia de una cifra? | 1 | «Evidencia y límites» de la tarjeta |
| T8 (lectura preliminar) ¿Qué falta para concluir? | 0 | Panel «Qué falta para concluir» |
| T9 (información insuficiente) ¿Se afirma algo que no se puede sostener? | 0 | No: sin estado definitivo; solo la venta observada válida |
| T10 (sin actividad) ¿Aparece $0 como resultado? | 0 | No |

### 3.4 Revisión heurística de experto (**la hizo el mismo autor del diseño**; no sustituye una evaluación independiente)
| Heurística | Observación | Riesgo |
|---|---|---|
| Visibilidad del estado del sistema | La confiabilidad está en la barra de contexto, en Z1 y en cada tarjeta | Bajo |
| Lenguaje del usuario | Los nombres siguen la tabla visible (D-06); «contribución matemática» es técnico | **Medio:** validar con usuarios |
| Control y libertad | Filtros reversibles; todo plegable se vuelve a cerrar; sin acciones destructivas | Bajo |
| Consistencia | Z3 y Z4 comparten el patrón de tarjeta; la clase se distingue por forma y texto | **Medio:** pueden parecerse demasiado entre sí |
| Reconocer antes que recordar | Los filtros muestran sus conteos; cada acción muestra su motivo | Bajo |
| Diseño minimalista | Las tarjetas de Z3 llevan impacto, supuesto, contribución, certeza y etiquetas: **densas**, sobre todo en móvil (V4) | **Medio/alto:** medir con usuarios |
| Ayuda y documentación | «Cómo leer» es un placeholder | Medio |
| Prevención y recuperación de errores | No aplica: el Home no captura datos | — |
| Flexibilidad y eficiencia | Sin atajos; no se evaluó | No evaluado |

## 4. Cobertura de las preguntas del Command Center
| Pregunta | Dónde se responde | Cobertura en el prototipo |
|---|---|---|
| ¿Cómo está el negocio? | Z1: estado y veredicto | Completa |
| ¿Está creciendo o deteriorándose? | Z1: estado y evolución con su comparación | Completa, según la comparación sea válida |
| ¿Qué lo impulsa? | Z2 paso 2 (contribución matemática) | **Parcial:** estructura de 3.1; el puente real depende de 4.2 |
| ¿Qué explica las desviaciones? | Z2 y Z3 (hallazgo, hipótesis aparte) | Parcial (idem) |
| ¿Dónde hay riesgos? | Z3 ▲ | Completa |
| ¿Dónde hay oportunidades? | Z3 ● con su importe | Completa, con estimaciones rotuladas |
| ¿Qué merece atención prioritaria? | Z3 destacados y Z4 | Completa (criterio cualitativo; el definitivo es 4.4) |
| ¿Qué tan confiables son las conclusiones? | BC, Z1, tarjetas | Completa |
| ¿Qué falta para concluir? | Z1 alcance, Z3 y Z4 «qué falta» | Completa |

## 5. Protocolo de pruebas con usuarios (**PENDIENTE: no se ejecutó**)
**Objetivo:** comprobar con personas reales que el Home se entiende, que se confía en lo que dice y que se decide mejor.
**Participantes:** analista comercial, gerente de ventas y director, **5 por perfil como mínimo**, con experiencia previa en RevNavigator o en tableros comerciales. **Dispositivos:** escritorio y un móvil real.
**Sesión (30–40 min, moderada, pensando en voz alta):** (1) 2 min de contexto sin explicar el diseño; (2) las 10 tareas de §3.3 formuladas como preguntas, sin pistas; (3) preguntas de trampa: «¿esta cifra es un hecho o una estimación?», «¿qué es una hipótesis?», «¿qué significa preliminar?»; (4) cuestionario SUS y 3 preguntas abiertas.
**Medidas:** éxito por tarea, tiempo, errores, clics, comprensión de los rótulos de certeza y de estimación, confianza declarada (1–5) y SUS.
**Criterios sugeridos de aprobación (propuesta, a validar con el usuario):** ≥ 80 % de éxito en T1 a T5; ≥ 70 % entiende la diferencia entre hecho y estimación; ningún participante interpreta una hipótesis como causa ni una estimación como resultado; SUS ≥ 68.
**Qué se decidiría con los resultados:** densidad de las tarjetas (V4), nombres técnicos, si Z3 y Z4 deben diferenciarse más, y el orden de los destacados.
**Pruebas técnicas pendientes:** móvil real (iOS y Android), lector de pantalla, otros navegadores, rendimiento y datos reales de FESA.

## 6. Criterios de aceptación de la Fase 3
| Criterio | Evidencia | Estado |
|---|---|---|
| Arquitectura de información, wireframe y matriz (3.1) | `FASE_3_1_ARQUITECTURA_INFORMACION.md` | Aceptada con limitaciones |
| Resumen ejecutivo Z1 (3.2) | `FASE_3_2_RESUMEN_EJECUTIVO.md` y auditoría | Aceptada con limitaciones |
| Hallazgos, riesgos y oportunidades Z3 (3.3) | `FASE_3_3_HALLAZGOS_RIESGOS_OPORTUNIDADES.md` | Completada con limitaciones; pendiente de aceptación |
| Prioridades y recomendaciones Z4 (3.4) | `FASE_3_4_PRIORIDADES_RECOMENDACIONES.md` | Completada con limitaciones; pendiente de aceptación |
| Prototipo navegable | `prototipo/home_3_5_prototipo.html` | Hecho; **no aprobado** (la aprobación es del usuario) |
| Validación UX | §3 | **Automatizada y de experto hecha; con usuarios, pendiente** |
| Especificación UX/UI | `ESPECIFICACION_UX_UI_COMMAND_CENTER.md` | Hecha |

## 7. Dependencias para las Fases 4, 5 y 6 (nada se implementa aquí)
| Zona | Requisitos | Disponible | Parcial | Por desarrollar |
|---|---|---|---|---|
| Z1 (matriz de 3.2) | 29 | 5 | 13 | 11 |
| Z3 (matriz de 3.3) | 17 | 1 | 11 | 5 |
| Z4 (matriz de 3.4) | 13 | 2 | 5 | 6 |
- **Fase 4:** productor de actividad agregada (4.1); estado del negocio, orden de evaluación y confiabilidad por conclusión (4.2); evolución con venta comparable y diagnóstico de conversión cero (4.3); contrato único de hallazgo con clasificación y criterio de priorización (4.4); impacto por hallazgo y margen por canal o producto (4.5).
- **Fase 5:** narrativa, explicación de causas y recomendaciones con IA bajo las reglas R1–R14, T1–T6 y A1–A7 (5.2 a 5.5).
- **Fase 6:** integración del Home en la aplicación, estilos del sistema de diseño existente (`ds-badge`, `ds-card`, `ds-accordion`…), pruebas de móvil real, accesibilidad y rendimiento (6.1 a 6.5).

## 8. Limitaciones y riesgos
**Limitaciones:** baja fidelidad sin estilo visual ni copy final; datos simulados; Z2 solo como estructura y la visión de conjunto de Z5 es cualitativa (sin cifras, por D-06); sin pruebas con usuarios, en móvil real ni con lector de pantalla; la revisión heurística la hizo el autor del diseño; el prototipo no se integra en la aplicación.
**Riesgos:** densidad y longitud de la página móvil (V4); parecido visual entre Z3 y Z4; vocabulario técnico; que las seis situaciones no cubran combinaciones reales de datos.

## 9. Relación con el roadmap
Con 3.5 termina la ejecución continua de la Fase 3 autorizada por el usuario: 3.3, 3.4 y 3.5 quedan **completadas con limitaciones documentadas, pendientes de aceptación formal**. Las Fases 4, 5 y 6 permanecen NO INICIADAS.
