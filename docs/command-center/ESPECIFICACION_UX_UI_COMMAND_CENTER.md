# Especificación UX/UI del Command Center (Home inteligente) — consolidación de la Fase 3

**Estado:** documento de la Subfase 3.5; consolida lo definido y aceptado en 3.1 y 3.2 y lo completado, pendiente de aceptación, en 3.3 y 3.4. **Es una especificación de diseño de baja fidelidad con datos simulados;** no define estilo visual final ni copy final, y no es código de la aplicación.

## 1. Principios
Explicar el negocio antes que mostrar indicadores; un solo número protagonista; confiabilidad visible y proporcionada a la evidencia; lo que no se puede concluir se dice, no se pinta como cero; hecho, cálculo, estimación e hipótesis se distinguen por texto y forma; el dinero se muestra con su procedencia y sin mezclar clases; la información secundaria se alcanza con navegación progresiva; ninguna recomendación sin su motivo.

## 2. Estructura y orden de lectura (3.1, aceptada)
`NAV (fuera del Home) · BC · Z1 Qué está pasando · Z2 Contexto y desempeño · Z3 Qué merece atención · Z4 Qué puedo hacer · Z5 Oportunidades y visión de conjunto` (nombres oficiales de D-07; equivalencias con los rótulos de 3.1 en `EQUIVALENCIAS_ZONAS_D07.md`). El mismo orden en escritorio, tableta y móvil. **Z5 tiene tres niveles** (aclaración H-02, `ACLARACION_H01_H02_PROPIEDAD_Z5.md`): Oportunidades, Visión de conjunto y, como apartado secundario desplegable, Evidencia y detalle; las advertencias críticas se muestran fuera del desplegable.

## 3. Componentes
| Componente | Zona | Qué muestra | Fuente de reglas | Estados |
|---|---|---|---|---|
| Barra de contexto | BC | Canal, periodo, fecha de datos, confiabilidad con motivo, «Cómo leer» | 3.1 §3.1 | Alta, Media, Baja, Insuficiente |
| Chip de estado | Z1 | Uno de los 6 estados con su nombre visible, o «Lectura preliminar» | 3.2 §10 (D-06) | Definitivo, con avisos, preliminar, sin lectura concluyente |
| Veredicto y narrativa corta | Z1 | Frase cualitativa sin importes ni cifras de las tarjetas | 3.2 (R1–R14) | Por modo de confiabilidad |
| Cifra protagonista | Z1 | Brecha vs plan; si no hay brecha válida, venta observada | 3.2 (D-01) | Brecha, venta observada, sin cifra |
| Celdas secundarias | Z1 | Cierre, evolución con venta comparable, contribución en detalle | 3.2 (D-01, D-02) | Visible, oculta, «Margen no configurado» |
| Bandas de motivos y de alcance | Z1 | Por qué no es Alta; qué se conoce y qué no | 3.2 (D-05) | Solo si no es Alta |
| Pasos de explicación | Z2 | Qué ocurrió, por qué, dónde se concentra; detalle plegable e hipótesis aparte | 3.1 §5 | Con puente, sin base comparable, no concluyente |
| Tarjeta de elemento | Z3 | Clase ◆▲●, severidad, impacto, certeza, evidencia plegada | 3.3 | Por clase, respaldo bajo, vigilancia |
| Filtros y «Ver todos» | Z3, Z4 | Conteos por clase o tipo; universo completo | 3.3, 3.4 (D-03) | Activo, inactivo |
| Tarjeta de acción | Z4 | Tipo, acción, motivo con su certeza, importe del elemento, destino | 3.4 | Por tipo |
| Avisos, retenidos y «qué falta» | Z3, Z4 | Lo que la confiabilidad limita y lo que falta | 3.3 §6, 3.4 §6 | Por modo |
| Sección plegable | Z5 | Evidencia y detalle: evidencia, fuentes, periodos, cálculos y referencias, limitaciones, información faltante, confiabilidad; canales, descartados, método | H-02 (D-07) | Cerrada, abierta |

## 4. Nombres visibles (D-06)
| Familia | Identificador interno | Nombre visible |
|---|---|---|
| estados | `saludable` | Cumpliendo el plan |
| estados | `creciendo` | En crecimiento |
| estados | `creciendo_bajo_potencial` | Crece, pero sin alcanzar el plan |
| estados | `riesgo_cumplimiento` | En riesgo de incumplir el plan |
| estados | `deterioro` | En deterioro |
| estados | `sin_base` | Sin lectura concluyente |
| confiabilidad | `Alta` | Confiabilidad alta |
| confiabilidad | `Media` | Confiabilidad media |
| confiabilidad | `Baja` | Confiabilidad baja |
| confiabilidad | `Insuficiente` | Confiabilidad insuficiente |

## 5. Reglas de contenido ejecutables
**Z1 (veredicto):**
| Regla | Contenido |
|---|---|
| R1 | Con confiabilidad Baja o Insuficiente no hay verbos de certeza ni afirmaciones asertivas (la preliminar solo puede hablar con «parece»). |
| R2 | Sin comparación válida no se habla de crecimiento, caída ni deterioro. |
| R3 | La dirección del texto coincide con el signo real de la brecha. |
| R4 | El veredicto no lleva importes en pesos. |
| R5 | Sin utilidad, ganancia o beneficio neto, ROI, ROAS ni CAC. |
| R6 | Máximo 34 palabras y 240 caracteres. |
| R7 | Sin causas inventadas ni sugeridas (falla, checkout, calidad del tráfico, precio, campañas…): los motores no respaldan «porque» ni «se debe a». |
| R8 | Sin confiabilidad suficiente no se afirma una etiqueta de estado. |
| R9 | Sin margen configurado no se habla de contribución como cifra (ni como 0). |
| R10 | A lo sumo un número, y ninguno que repita una cifra de las tarjetas. |
| R11 | Sin frases genéricas («buen desempeño», «mal resultado», «va bien»). |
| R12 | Sin actividad no se infiere crecimiento, deterioro ni estabilidad, ni se concluye sobre conversión. |
| R13 | No se presenta una brecha o un cumplimiento, favorable o desfavorable, si no hay una brecha válida contra el plan. |
| R14 | Con cambio de composición no se habla de mejora ni de deterioro de eficiencia. |

**Z3 (tarjetas de elemento):**
| Regla | Contenido |
|---|---|
| T1 | Sin utilidad, ganancia, beneficio, rentabilidad, ROI, ROAS ni CAC. |
| T2 | Sin lenguaje causal si la certeza es menor que «contribución matemática» (señal, estimación o hipótesis). |
| T3 | Una oportunidad se redacta como estimación o posibilidad, nunca como resultado obtenido. |
| T4 | Un riesgo proyectado no se redacta como hecho consumado. |
| T5 | El título no repite el importe del impacto (el importe vive en la línea de impacto). |
| T6 | Máximo 16 palabras en el título y 45 en la descripción. |

**Z4 (acciones):**
| Regla | Contenido |
|---|---|
| A1 | Sin utilidad, ganancia, beneficio, rentabilidad, ROI, ROAS ni CAC. |
| A2 | Sin recomendaciones genéricas («mejorar las ventas», «tomar acciones», «dar seguimiento»). |
| A3 | Una recomendación no afirma causas. |
| A4 | Sin responsables, fechas límite ni estatus de ejecución (gestión de tareas fuera de alcance). |
| A5 | El texto de la acción no lleva importes. |
| A6 | Máximo 14 palabras. |
| A7 | Una acción apoyada en una señal o hipótesis se redacta como comprobación, no como decisión ni como hecho. |

## 6. Reglas transversales
1. **Confiabilidad:** una sola fuente (la de Z1) condiciona Z3 (qué elementos) y Z4 (qué recomendaciones); con Baja, solo lo observado y los datos; con Insuficiente, solo los datos.
2. **Cifras:** la venta observada válida se muestra siempre; la brecha, la meta y el cumplimiento solo con brecha válida; el veredicto no lleva importes ni cifras de las tarjetas; una cifra aparece una sola vez.
3. **Dinero:** ventas siempre que haya importe; contribución solo con margen configurado y en detalle; observado y proyectado rotulados; clases sin sumar; alternativas que cierran la misma brecha como rango; una acción no tiene importe propio.
4. **Certeza:** hecho, cálculo, contribución matemática, señal, estimación, hipótesis, recomendación. La hipótesis va aparte y no titula. Sobre una señal o hipótesis solo se recomienda comprobar.
5. **Sin dato:** el elemento conserva su lugar y dice qué falta; nunca $0 como sustituto de «no hay dato».
6. **Sin gestión de tareas:** responsables, fechas y estatus no existen (RGT Execution OS fuera de alcance).

## 7. Responsive
Puntos de corte 1 024 y 600 px aplicados al ancho del contenedor. Z1: veredicto 21/19/17 px; cifra protagonista 34/30/28 px (largo: 28/24/22). Z3 y Z4: 3, 2 y 1 columnas. Nunca se ocultan: estado, veredicto, cifra protagonista con su base, confiabilidad con sus motivos, clase, título, impacto con su rótulo, certeza y avisos. Se pliegan: narrativa ampliada, evidencia, resto del universo y Z5.

## 8. Accesibilidad (requisitos para la implementación)
Contraste del texto ≥ 4.5:1; objetivos interactivos ≥ 24 × 24 px (los desplegables, ≥ 28 px de alto); foco visible con teclado; nombre accesible en todo control; `aria-expanded` en lo plegable; clase, estado y certeza nunca solo por color; reflujo sin desplazamiento horizontal desde 320 px. **Verificado en el prototipo con pruebas automatizadas; pendiente con lector de pantalla y dispositivos reales.**

## 9. Estados
Sin datos; solo plan; periodo futuro; dato insuficiente en un bloque; sin base comparable; confiabilidad media, baja e insuficiente; sin actividad; bloqueo por meta anual; error de un bloque; margen no configurado, desactivado, no válido o sin confirmar; sin elementos; sin acciones; elementos retenidos por confiabilidad. Cada uno está especificado en el documento de su zona y representado en sus escenarios.

## 10. Contratos y motores que la implementación debe usar (sin duplicar cálculos)
`cc.finding` y `cc.economic_impact` v2 (Fase 2); `FP.attribution.attributeSegment`; `FP.economics`; `attentionEngine`, `actionPriorityEngine`, `recoveryEngine`, `forecastEngine`, `contextEngine`; la matriz UX↔motores de 3.1 y las matrices de Z1, Z3 y Z4 indican, por requisito, qué existe y qué falta (Fase 4).

## 11. Verificación
Cada zona tiene una especificación ejecutable, escenarios, pruebas con mutaciones y un verificador de consistencia; el prototipo, una validación automatizada. **Ninguna usa datos reales; la validación con usuarios está pendiente** (`FASE_3_5_PROTOTIPO_VALIDACION_UX.md` §5).
