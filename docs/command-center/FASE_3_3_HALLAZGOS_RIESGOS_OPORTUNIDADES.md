# Fase 3 · Subfase 3.3 — Hallazgos, riesgos y oportunidades (Z3 · Qué merece atención)

**Estado:** ACEPTADA CON LIMITACIONES DOCUMENTADAS (aceptación formal comunicada por el usuario el 12-nov-2026). Es un diseño y una especificación funcional: no está integrado en la aplicación real ni validado con usuarios, móviles reales, lectores de pantalla ni datos reales de FESA.
**Alcance:** exclusivamente el diseño UX de **Z3 · Qué merece atención** del Home inteligente, dentro de la arquitectura aceptada en 3.1 (NAV · BC · Z1–Z5) y de las decisiones D-02 y D-03. No rediseña Z1 (aceptada en 3.2) ni diseña Z4, Z5 ni el prototipo (3.4 y 3.5). No cambia código de la aplicación, motores, contratos ni documentos aceptados. RGT Execution OS queda fuera.
**Autorización:** el usuario aceptó 3.2 y autorizó ejecutar 3.3, 3.4 y 3.5 de forma continua; no autorizó las Fases 4, 5 ni 6.
**Base:** rama `ccr-a81af632-rirtu7`, commit base `a2b3863`, cambios previos sin confirmar (no se tocaron).

**Numeración.** Secciones §0 a §16. Los requisitos de Z3 son **Z3-01 a Z3-17** (matriz de trazabilidad). Los escenarios son **1 a 14**. Las reglas de texto de las tarjetas son **T1 a T6**. Las filas de la matriz de 3.1 son **M01 a M33**.
**Qué es diseño propuesto y qué es aplicación existente.** Todo lo de este documento y de `wireframes/z3_3_3_wireframe.html` es **diseño propuesto**, de baja fidelidad. Lo único que representa la aplicación existente es la captura marcada «APLICACIÓN EXISTENTE». Los importes de los escenarios son **ilustrativos (datos simulados)**; no provienen de datos reales de FESA.
**Etiquetas de evidencia:** **Verificado** (lo comprobé yo), **Reportado** (lo afirma una prueba automatizada que ejecuté), **Documentado** (escrito, no se ejecuta), **Pendiente de validación real** (requiere datos de producción, dispositivos o usuarios).

**Documentos y artefactos de la subfase**
| Archivo | Qué es |
|---|---|
| `FASE_3_3_HALLAZGOS_RIESGOS_OPORTUNIDADES.md` | Este documento |
| `FASE_3_3_ESCENARIOS_Z3.md` | Detalle de los 14 escenarios (generado desde la especificación; no se edita a mano) |
| `MATRIZ_TRAZABILIDAD_Z3.md` | Matriz de trazabilidad de Z3 (generada desde `generated/MATRIZ_TRAZABILIDAD_Z3.json`) |
| `wireframes/z3_3_3_wireframe.html` | Wireframe de Z3: clases, escritorio, tableta, móvil, 14 escenarios y prueba de legibilidad |
| `wireframes/capturas_3_3/` | 20 capturas de evidencia |
| `tools/audit/z3-atencion.js`, `z3-escenarios.js` | Especificación **ejecutable** de las reglas de Z3 y sus 14 escenarios (no es código de la aplicación) |

---

## 0. Estado de partida y qué se hereda
- 3.1 definió Z3 como **una sola experiencia de atención** (D-02) donde hallazgo, riesgo y oportunidad **conservan clasificación, significado y tratamiento**, con **hasta tres destacados sin limitar el universo** (D-03) seleccionados por urgencia, impacto y confiabilidad (3.1 §7).
- La aclaración B de 3.1 (§6) exige que la confiabilidad condicione lo que se concluye: Z3 la aplica a qué elementos se muestran.
- Fase 2 fija los contratos: `cc.finding` (2.4), la escalera de certeza, `cc.economic_impact` v2 (2.5) y los estados de atribución. **Este diseño no inventa clases, indicadores, motores ni fuentes**; añade reglas de presentación y las hace ejecutables.
- Aplicación actual (**Verificado** en `F33.4`): el Home no muestra la clase de cada elemento de atención por forma; en 3.1 se documentó además que presenta dos conteos de hallazgos y mezcla siguiente paso, atención y «desde ayer».

## 1. Objetivo y principios UX
**Objetivo.** Que un analista, un gerente y un director vean **qué merece atención ahora**, qué tan firme es cada cosa, cuánto dinero representa y qué falta para concluir, sin tener que abrir diez bloques.
1. **Una experiencia, tres clases** que no se confunden (§3).
2. **Los tres primeros importan; el resto existe:** «3 de N» y «Ver todos» (§5).
3. **Proporcionada a la evidencia:** con confiabilidad baja o insuficiente no se muestran conclusiones (§6).
4. **Dinero sin confusión:** ventas siempre que haya importe; contribución solo con margen; observado y proyectado rotulados; clases sin sumar (§7).
5. **Sin trazabilidad no hay hallazgo:** lo que no cumple el contrato no se muestra (§4).
6. **Una hipótesis nunca titula** (§8).
7. **Sin dato, se dice qué falta; nunca se pinta cero** (§9).

## 2. Arquitectura de Z3
```
Z3 ─ Qué merece atención ─────────────────────────────────────────────  «3 de N»
 Aviso de la lectura (si la confiabilidad limita lo que se muestra)
 Filtros por clase:  Todos (N) · Hallazgos · Riesgos · Oportunidades
 Tres tarjetas destacadas:  [◆ ▲ ●  severidad]  título · descripción · impacto · certeza · ▸ evidencia y límites
 «Ver todos (N)»  → el resto del universo, en la misma página
 Totales por clase (sin mezclar clases)
 Nota de elementos retenidos por confiabilidad  ·  Panel «Qué falta para concluir»
```
**Qué va en Z3 y qué no.** Va: el elemento, su clase, severidad, certeza, impacto, evidencia y límites. No va: el puente de drivers y la atribución (→ **Z2**), las acciones (→ **Z4**), las tablas y la cobertura detallada (→ **Z5**). Cada tarjeta **deriva** a Z2 cuando explica la brecha (`explains`) y Z4 cita el elemento que motiva cada acción.

## 3. Las tres clases (D-02)
| Clase | Qué es | Forma y tratamiento | Impacto que admite |
|---|---|---|---|
| ◆ **Hallazgo** | Lo que se observó o se calculó, sin juicio de valor | Borde simple; se describe y se evidencia | Brecha u observado (hecho o cálculo) |
| ▲ **Riesgo** | Un resultado actual o esperado por debajo del plan o de un umbral, con su consecuencia | Borde grueso a la izquierda; severidad e impacto en riesgo | Brecha, venta en riesgo o venta esperada |
| ● **Oportunidad** | Venta potencial o recuperable con palancas controlables; siempre estimación con supuestos | Borde punteado; supuestos y restricciones declaradas; alternativas excluyentes como rango | Venta potencial (teórica), recuperable o esperada |
La clase se reconoce por **texto y forma, no solo por color**. Las clases **no se confunden**: el importe de una no se suma al de otra; una oportunidad no se presenta como hecho (la especificación rechaza una oportunidad con certeza de hecho, cálculo o contribución); un hallazgo no lleva una proyección. Correspondencia con el contrato: hallazgo ← `finding` y `deviation`; riesgo ← `risk`; oportunidad ← `opportunity` (M27). **Decisión propia (documentada):** el contrato `cc.finding` ya distingue estos tipos; la regla de qué impacto admite cada clase es nueva y vive solo en la especificación.

## 4. La tarjeta de elemento
| Zona | Contenido | Regla |
|---|---|---|
| Cabecera | Clase (símbolo y nombre), severidad (Crítica, Importante, Seguimiento) y «Datos» si es un faltante de datos | Siempre visible |
| Título y descripción | Qué ocurre, en una frase | Reglas T1–T6 (§10); sin causas inferidas |
| Impacto | Etiqueta según la categoría («Brecha observada», «Venta en riesgo», «Venta recuperable», «Venta potencial (teórica)»), procedencia (observado o proyectado) y «estimación» si es proyectado; importe o rango; supuesto principal | Sin importe: «No aplica» o «Datos insuficientes», nunca $0 |
| Contribución | «Contribución bruta estimada» con el margen promedio, o «Margen no configurado · Configurar» | Solo con margen configurado (§7) |
| Certeza | Hecho, cálculo, contribución matemática, señal, estimación o hipótesis, y respaldo alto, medio o bajo | Respaldo bajo siempre rotulado |
| Evidencia y límites (plegado) | Evidencia con módulo y campo, hipótesis aparte con cómo validarla, limitaciones, vigencia y origen | Sin fuente no hay elemento |
**Rechazo por contrato.** Un elemento que no cumple `cc.finding` (sin fuente, sin regla, certeza mayor que su evidencia…) o las reglas de clase **no se muestra**; queda listado con su motivo para Z5.
**Deduplicación.** El mismo hallazgo dicho por varios motores es uno solo y conserva el origen de cada uno (`mergeFindings`).

## 5. Selección de destacados y universo (D-03)
**Cabecera «3 de N» y «Ver todos (N)»** con filtros por clase y sus conteos. **El universo no se limita a tres.** Orden (3.1 §7.3, urgencia → impacto → confiabilidad), **cualitativo y sin puntajes**:
1. **Urgencia:** lo que bloquea el análisis (un faltante de datos crítico) va primero; después, la severidad.
2. **Confiabilidad (guarda):** dentro de la misma urgencia, un elemento con respaldo bajo no desplaza a uno mejor sustentado.
3. **Impacto:** magnitud del importe en ventas cuando existe (solo para ordenar; no se suman clases).
4. **Certeza y respaldo.** Desempate estable por identificador.
**Diversidad (propuesta de 3.1):** si los tres primeros son de una sola clase y existe otro elemento de otra clase con **la misma urgencia** que el tercero, ese entra en su lugar (nunca desplaza a algo más urgente). La portada explica el criterio («Cómo se decide»). **El criterio definitivo (puntajes, desempates, calibración) corresponde a 4.4**; aquí es una especificación cualitativa verificable.

## 6. La confiabilidad condiciona lo que se muestra (aclaración B)
| Confiabilidad de la lectura (Z1) | Modo de Z3 | Qué se muestra | Qué se retiene |
|---|---|---|---|
| **Alta** o **Media** | Completo | Los tres clases; con Media, la certeza visible en cada tarjeta | Nada |
| **Baja** | Solo lo observado | Hallazgos observados o calculados y faltantes de datos; aviso «Lectura preliminar» | Riesgos y oportunidades (con su conteo); sin totales |
| **Insuficiente** | Solo datos | Solo faltantes de datos y «Qué falta para concluir» | Todo lo demás; sin totales |
La nota de retenidos dice cuántos elementos no se presentan y por qué. **El bloqueo limita las conclusiones, no las cifras observadas.**

## 7. Impacto económico en Z3
- **Ventas siempre que haya importe** (`cc.economic_impact`); **contribución bruta estimada solo con margen configurado**, con el margen promedio y la nota «no es utilidad». Sin margen, «Margen no configurado · Configurar» (nunca $0). Nunca «utilidad», «ganancia» ni «beneficio»; sin ROI, ROAS ni CAC. La especificación **no recalcula**: usa `makeImpact` y `contributionOf`.
- **Observado y proyectado** van rotulados y no se mezclan en una línea.
- **Totales por clase** con `combineImpacts`: nunca entre clases; las **alternativas que cierran la misma brecha** son un **rango** (p. ej. $723 mil a $760 mil), no la suma; un impacto sin datos se excluye del total y se avisa.
- **Hallazgo documentado sobre el contrato de Fase 2:** cuando varios elementos describen el mismo dinero (la brecha total y la del canal que la concentra), `combineImpacts` toma «el mayor» por valor, que con importes negativos es el de **menor magnitud**: el total subestimaría la brecha. Z3 **no muestra cifra** en esa línea y lo dice («los elementos describen el mismo dinero»). **No se modificó el motor;** se documenta para 4.5.

## 8. Certeza, evidencia e hipótesis
Cada tarjeta lleva la etiqueta de certeza de la escalera de Fase 2 (hecho, cálculo, contribución matemática, señal, estimación, hipótesis) y el respaldo. La **hipótesis va aparte**, plegada, con **cómo validarla**, y nunca sostiene el título ni se presenta como causa. Una contribución se rotula «contribución matemática», nunca «causa». Un elemento con respaldo bajo o en vigilancia lo dice en una etiqueta.

## 9. Estados
| Estado | Comportamiento |
|---|---|
| Sin elementos | «No hay hallazgos, riesgos ni oportunidades que destacar en este periodo» |
| Sin conclusiones (confiabilidad limita) | Aviso, nota de retenidos y panel «Qué falta para concluir» |
| Datos insuficientes en el impacto | «Datos insuficientes: …» sin importe; no se pinta cero |
| Impacto que no aplica | «No aplica: …» con la razón |
| Elemento en vigilancia | Etiqueta «En vigilancia: no reapareció en la última corrida» |
| Elemento resuelto o vencido | Fuera de la portada; consta en Z5 |
| Elemento inválido | No se muestra; consta en Z5 con su motivo |

## 10. Reglas de texto de las tarjetas (T1–T6, ejecutables en `checkCardText`)
| Regla | Contenido |
|---|---|
| T1 | Sin utilidad, ganancia, beneficio, rentabilidad, ROI, ROAS ni CAC. |
| T2 | Sin lenguaje causal si la certeza es menor que «contribución matemática» (señal, estimación o hipótesis). |
| T3 | Una oportunidad se redacta como estimación o posibilidad, nunca como resultado obtenido. |
| T4 | Un riesgo proyectado no se redacta como hecho consumado. |
| T5 | El título no repite el importe del impacto (el importe vive en la línea de impacto). |
| T6 | Máximo 16 palabras en el título y 45 en la descripción. |

**Ejemplos incorrectos** (cada uno infringe exactamente las reglas indicadas; lo comprueba `tools/test-fase3-3-z3.js`):
| Id | Elemento | Título | Descripción | Reglas que infringe |
|---|---|---|---|---|
| X1 | pacing_gap | La utilidad del periodo cae contra el plan | La venta acumulada queda por debajo del plan. | T1 |
| X2 | forecast_close | El cierre no alcanzaría la meta | El cierre proyectado queda por debajo debido a que la campaña falló. | T2 |
| X3 | recovery_cr | Se recuperó la brecha con la conversión | La conversión generó la venta que faltaba. | T3 |
| X4 | forecast_close | No se alcanzó la meta del periodo | El periodo ya se incumplió. | T4 |
| X5 | pacing_gap | La venta va $722 mil por debajo del plan | La venta acumulada queda por debajo del plan de los mismos días. | T5 |
| X6 | pacing_gap | La venta acumulada del periodo analizado se encuentra en este momento claramente por debajo del plan que se definió | La venta acumulada queda por debajo del plan. | T6 |
| X7 | recovery_traffic | El ROAS permitiría recuperar $760 mil | Se logró la venta porque subieron las sesiones. | T1, T2, T3, T5 |

## 11. Escenarios
Los 14 escenarios están diseñados, representados en el wireframe y documentados uno a uno en `FASE_3_3_ESCENARIOS_Z3.md`. **Origen de los datos: ilustrativos.** Resumen:

| # | Escenario | Confiabilidad de la lectura | Modo | Cabecera | Clases destacadas | Retenidas |
|---|---|---|---|---|---|---|
| 1 | Las tres clases con confiabilidad alta | Alta | completo | 3 de 7 | ▲ · ● · ◆ | 0 |
| 2 | Las tres clases con confiabilidad media | Media | completo | 3 de 7 | ▲ · ● · ◆ | 0 |
| 3 | Confiabilidad baja: solo lo observado | Baja | solo_observado | 3 de 3 | ◆ · ◆ · ◆ | 4 |
| 4 | Confiabilidad insuficiente: solo los datos que faltan | Insuficiente | solo_datos | 2 de 2 | ◆ · ◆ | 7 |
| 5 | Sin elementos que destacar | Alta | completo | — | — | 0 |
| 6 | La portada no se llena con una sola clase | Alta | completo | 3 de 5 | ◆ · ◆ · ▲ | 0 |
| 7 | Un elemento con respaldo bajo no desplaza a uno mejor sustentado | Alta | completo | 3 de 3 | ◆ · ● · ▲ | 0 |
| 8 | Lo que bloquea el análisis va primero | Media | completo | 3 de 4 | ◆ · ▲ · ◆ | 0 |
| 9 | El mismo hallazgo dicho por dos motores es uno solo | Alta | completo | 2 de 2 | ▲ · ◆ | 0 |
| 10 | Lo que no cumple el contrato no se muestra | Alta | completo | 1 de 1 | ◆ | 0 |
| 11 | Impacto con margen configurado | Alta | completo | 3 de 7 | ▲ · ● · ◆ | 0 |
| 12 | Resueltos fuera de la portada; en vigilancia, rotulados | Alta | completo | 2 de 2 | ▲ · ◆ | 0 |
| 13 | Impacto con datos insuficientes: se dice, no se pinta cero | Alta | completo | 3 de 3 | ● · ● · ▲ | 0 |
| 14 | Confiabilidad baja y solo hay conclusiones: no se muestra nada | Baja | solo_observado | — | — | 2 |

**Notas.** Los hallazgos usan el contrato real `cc.finding` y los impactos `makeImpact`; el comportamiento esperado se razonó desde D-02, D-03 y la aclaración B antes de ejecutar la especificación. Los importes de brecha y cierre del catálogo base son los del motor con datos de demostración desviados; todo lo demás es inventado para ejercitar la regla.

## 12. Diseño responsive
Puntos de corte del sistema de diseño (1 024 y 600 px) aplicados al ancho del contenedor.
| | Escritorio ≥ 1025 px | Tableta 600–1024 px | Móvil < 600 px |
|---|---|---|---|
| Tarjetas | 3 columnas | 2 columnas | 1 columna |
| Orden | Aviso → filtros → destacadas → «Ver todos» → totales → retenidos → qué falta | Igual | **Mismo orden** |
| Se pliegan | Evidencia y límites, resto del universo | Igual | Igual |
| Nunca se ocultan | Clase, título, impacto con su rótulo, certeza, avisos | Igual | Igual |
Verificado con una prueba de legibilidad (título largo, importe en miles de millones y rango) en los tres anchos (`F33.Z3.9`). **Es una verificación en Chromium emulado, no en un dispositivo móvil real (Pendiente de validación real).**

## 13. Matriz de trazabilidad y dependencias
`MATRIZ_TRAZABILIDAD_Z3.md` conecta cada requisito con su decisión, componente visual, fuente, motor o contrato, estado, evidencia y dependencia. **17 requisitos: 1 Disponible, 11 Parcial, 5 Por desarrollar.** Nada que solo esté propuesto figura como disponible.
**Dependencias por categoría** (se resuelven en las fases indicadas; ninguna se implementa aquí):
- **contratos_existentes** — Resoluble con contratos y motores existentes: solo falta conectar y presentar. (2): Z3-06 (Fase 4.4); Z3-08 (Fase 4.5).
- **completar_motores** — Requiere completar o ampliar un motor (Fase 4) antes de poder mostrarse. (15): Z3-01 (Fase 4.4); Z3-02 (Fase 4.4); Z3-03 (Fase 4.4); Z3-04 (Fase 4.4); Z3-05 (Fase 4.4); Z3-07 (Fase 4.5); Z3-08 (Fase 4.5); Z3-09 (Fase 4.4); Z3-10 (Fase 4.4); Z3-11 (Fase 4.2); Z3-13 (Fase 4.4); Z3-14 (Fase 4.5); Z3-15 (Fase 4.4); Z3-16 (Fase 4.4); Z3-17 (Fase 4.4).
- **requiere_ia** — Requiere inteligencia artificial (Fase 5) para su versión final; existe una versión determinista de respaldo. (1): Z3-17 (Fase 5.5).
- **validacion_produccion** — Requiere validación con datos y usuarios de producción (umbrales y supuestos de la especificación). (2): Z3-05 (Fase 4.4); Z3-08 (Fase 4.5).

## 14. Verificación y evidencia
| Prueba | Tipo | Qué verifica |
|---|---|---|
| `tools/test-fase3-3-z3.js` | Lógica y especificación, **datos simulados** | 14 escenarios; 26 invariantes sobre 2 500 conjuntos aleatorios; 7 propiedades metamórficas; ejemplos de texto incorrecto; 22 mutaciones de la especificación |
| `tools/regression/batch_fase3_3_3_4_zonas.py` | Navegador emulado e integración con rutas reales | Matriz contra la aplicación; wireframe sin errores ni desbordamientos a tres anchos; capturas |
| `tools/audit/verificar_consistencia_3_3.py` | Consistencia documental con oráculo independiente | Documento, matriz, escenarios generados, wireframe y `ESTADO.md` |
**Ninguna de estas pruebas usa datos reales de FESA** ni demuestra que Z3 funcione con ellos. **Pendiente de validación real:** el orden de los destacados frente a lo que los usuarios consideran urgente; la frecuencia real de cada clase; textos con usuarios; dispositivos móviles; accesibilidad con lector de pantalla.

## 15. Limitaciones, riesgos y decisiones propias
**Limitaciones:** diseño de baja fidelidad sin copy final; datos simulados; el criterio de selección es cualitativo (el definitivo es 4.4); el contrato `cc.finding` no trae hoy la clasificación en `js/` (M27); `riskOpportunityEngine` sigue sin uso; no existe margen por canal ni producto.
**Riesgos:** (1) mostrar solo lo observado con confiabilidad baja puede parecer poco ambicioso a un director (se valida en 3.5); (2) la diversidad de clases podría desplazar a un elemento más relevante para el usuario aunque no más urgente; (3) el orden por magnitud de importe puede favorecer a las oportunidades teóricas si no se calibra (4.4).
**Decisiones propias de esta subfase:** retener riesgos y oportunidades con confiabilidad Baja; no totalizar superposiciones; admitir por clase solo ciertos tipos de impacto; la regla de diversidad por igual urgencia.

## 16. Relación con el roadmap
3.3 queda **completada con limitaciones documentadas, pendiente de aceptación formal**. La ejecución continuó con 3.4 y 3.5 por autorización expresa del usuario. Las Fases 4, 5 y 6 permanecen NO INICIADAS. No se modificó ningún documento aceptado (hash en `generated/HASHES_BASE_3_3.json`) ni código de la aplicación.
