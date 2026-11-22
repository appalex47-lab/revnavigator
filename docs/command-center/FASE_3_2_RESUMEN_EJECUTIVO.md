# Fase 3 · Subfase 3.2 — Resumen ejecutivo (Z1 · Lectura ejecutiva)

**Estado:** COMPLETADA CON LIMITACIONES DOCUMENTADAS, lista para tu revisión. **No está aceptada.**
**Alcance:** exclusivamente el diseño UX de **Z1 · Lectura ejecutiva** del Home inteligente. No diseña en profundidad Z2, Z3, Z4 ni Z5; no inicia 3.3, 3.4, 3.5 ni la Fase 4 o 5. No cambia código de la aplicación, motores, contratos, modelo económico ni taxonomía de atribución. RGT Execution OS queda fuera. No reabre ninguna decisión de 3.1.
**Base:** rama `ccr-a81af632-rirtu7`, commit base `a2b3863`, cambios previos sin confirmar (no se tocaron).
**Arquitectura vigente (3.1, aceptada con limitaciones documentadas):** NAV · BC · Z1 · Z2 · Z3 · Z4 · Z5. Este documento diseña solo Z1 y respeta esa arquitectura.

**Numeración.** Las secciones son §0 a §16. Los requisitos de Z1 se citan como **Z1-01 a Z1-29** (matriz de trazabilidad). Los escenarios son **1 a 14** (obligatorios) y **A1 a A16** (adicionales). Las decisiones cerradas son **D-01 a D-06** y los criterios resueltos de la auditoría son **C1 a C5**. Las reglas de contenido del veredicto son **R1 a R14**. Las filas de la matriz de 3.1 son **M01 a M33**.

**Qué es diseño propuesto y qué es aplicación existente.** Todo lo de este documento y de `wireframes/z1_3_2_wireframe.html` es **diseño propuesto**, de baja fidelidad. Lo único que representa la aplicación existente es la captura marcada «APLICACIÓN EXISTENTE» (`wireframes/capturas_3_2/aplicacion_existente_home_actual.png`).

**Etiquetas de evidencia usadas en este documento y en el informe de cierre:** **Verificado** (lo comprobé yo en esta sesión), **Reportado por pruebas automatizadas** (lo afirma una prueba que ejecuté y cuyo resultado cito), **Documentado** (está escrito pero no se ejecuta) y **Pendiente de validación real** (requiere dispositivos, datos de producción o usuarios).

**Documentos y artefactos de la subfase**
| Archivo | Qué es |
|---|---|
| `FASE_3_2_RESUMEN_EJECUTIVO.md` | Este documento |
| `FASE_3_2_ESCENARIOS_Z1.md` | Detalle de los 30 escenarios (generado desde la especificación; no se edita a mano) |
| `MATRIZ_TRAZABILIDAD_Z1.md` | Matriz de trazabilidad de Z1 (generada desde `generated/MATRIZ_TRAZABILIDAD_Z1.json`) |
| `wireframes/z1_3_2_wireframe.html` | Wireframe de Z1: escritorio, tableta, móvil, 30 escenarios, estados de confiabilidad y prueba de legibilidad |
| `wireframes/capturas_3_2/` | 38 capturas de evidencia |
| `tools/audit/z1-lectura-ejecutiva.js` | Especificación **ejecutable** de las reglas de Z1 (no es código de la aplicación) |
| `tools/audit/z1-escenarios.js` | Los 30 escenarios con su comportamiento esperado, razonado desde Fase 2 y las decisiones |

**Fuentes consultadas.** `ESTADO.md`, `FASE_3_1_ARQUITECTURA_INFORMACION.md`, `MATRIZ_UX_MOTORES.md` y su JSON (`generated/`), `ACEPTACION_FASE_2.md`, `ATRIBUCION_FUENTE_DE_VERDAD.md`, `MODELO_LECTURA_EJECUTIVA.md`, `MODELO_INDICADORES_DRIVERS.md`, `MODELO_DETECCION_DESVIACIONES.md`, `MODELO_HALLAZGOS_RIESGOS_OPORTUNIDADES.md` y `MODELO_CUANTIFICACION_ECONOMICA.md`. **Hallazgo documental:** el prompt cita `wireframes/home_3_1_wireframe.html`; esa ruta no existe en la raíz, el archivo real está en `docs/command-center/wireframes/home_3_1_wireframe.html`.

---

## 0. Estado de partida y qué se hereda
- 3.1 definió Z1 como «Lectura ejecutiva»: estado (6 estados), conclusión con narrativa corta ↔ larga, brecha, cierre proyectado, evolución vs comparable y condición de la lectura por confiabilidad (3.1 §3.1, §6).
- Fase 2 fija los contratos: 6 estados de negocio, 9 estados de atribución, modelo económico dual y escalera de certeza. **Este diseño no inventa estados, indicadores, motores ni fuentes**; solo cambia el nombre que ve el usuario (D-06).
- Aplicación actual (verificada en `F32.4` a `F32.7`): el veredicto del Home es asertivo («Vas… por debajo de la meta») aunque exista un hallazgo que **bloquea el análisis**, la confiabilidad está en un plegable cerrado y el veredicto lleva importes en pesos. Z1 corrige las tres cosas.
- La versión anterior de 3.2 (cierre previo) tenía 14 escenarios, reglas R1–R10 y un veredicto que podía llevar un porcentaje; **este cierre la sustituye** por las decisiones D-01 a D-06.

## 1. Objetivo y principios UX
**Objetivo.** Que un analista, un gerente y un director entiendan el estado del negocio en 10–15 segundos y sepan **qué se conoce y qué no se puede concluir**, con posibilidad de profundizar. El analista ve la evidencia y sus límites; el gerente, la brecha y qué decidir sobre los datos; el director, un veredicto breve sin cifras duplicadas.
1. **Sintetizar, no absorber:** Z1 no contiene drivers, canales, hallazgos, acciones ni tablas (Z2–Z5).
2. **Proporcionada a la evidencia:** la contundencia de la lectura nunca supera la confiabilidad.
3. **No ocultar resultados válidos:** una venta observada válida se muestra siempre, aunque la lectura no se pueda concluir (D-01).
4. **No inventar conclusiones:** sin brecha válida no hay dirección contra el plan; sin comparación válida no hay evolución; nunca una causa que los motores no respaldan.
5. **Un solo número protagonista**; el veredicto interpreta con palabras y las tarjetas llevan las cifras: ninguna cifra se escribe dos veces (D-03).
6. **La confiabilidad no es el desempeño:** se muestran por separado (§8).
7. **Sobrio y legible:** sin semáforos sin explicación, sin colores de alarma que compitan con el veredicto, sin decoración sin función.

## 2. Arquitectura de Z1
**Estructura (escritorio).**
```
Z1 ──────────────────────────────────────────────────────────────────────────
 Cabecera:  [Estado]  [Confiabilidad]  Periodo · día 22 de 30 · Comparabilidad
 Cuerpo:    Veredicto (texto grande) + narrativa corta  │  CIFRA PROTAGONISTA
            «Ver contexto ▸»                              │  (brecha; si no hay, venta observada)
                                                          │  + venta observada · meta · cumplimiento
 Banda:     Motivos de la lectura (solo si la confiabilidad no es Alta)
 Banda:     Alcance: Se conoce · No se puede concluir · Diagnóstico (solo si no es Alta)
 Fila:      Cierre proyectado │ Evolución (y venta comparable) │ Contribución (detalle)
 Bajo demanda: Narrativa ampliada (hecho observado · interpretación · limitaciones · implicación)
```
**Jerarquía visual** (de mayor a menor): **1** situación del negocio (estado + veredicto); **2** magnitud económica (brecha o venta observada); **3** confiabilidad (chip siempre visible + banda de motivos + alcance); **4** contexto y explicación breve (narrativa corta; la ampliada bajo demanda).

**Qué pertenece a Z1 y qué se queda en otras zonas**
| Va en Z1 | Se queda en otra zona |
|---|---|
| Estado, veredicto, narrativa | Puente de drivers, atribución, hipótesis → **Z2** |
| Venta observada, brecha, cierre, evolución, contribución (detalle) | Cumplimiento por canal, concentración → **Z2** |
| Confiabilidad, sus motivos y el alcance | Hallazgos, riesgos y oportunidades, universo completo → **Z3** |
| Periodo y comparabilidad | Acciones y su orden → **Z4** |
| — | Tablas de cifras y canales, cobertura detallada, método → **Z5** |
Z1 solo **deriva** (qué zona atiende cada cosa); el detalle de cada escenario lo indica en «Se deriva a otras zonas» (`FASE_3_2_ESCENARIOS_Z1.md`).

## 3. Decisiones D-01 a D-06 y cómo se aplicaron
Las seis decisiones llegaron como **definitivas**; no se vuelven a consultar. Donde la decisión dejaba un margen de interpretación, la **interpretación aplicada** se documenta aquí como «criterio aplicado» para que puedas objetarla en la revisión.

| Decisión | Resolución aplicada | Criterio aplicado (interpretación) |
|---|---|---|
| **D-01** Visibilidad de cifras | La **venta observada** se muestra siempre que sea válida (≥ 0, con actividad observable, resultado calculable), incluso con confiabilidad Insuficiente. La **brecha, la meta acumulada y el cumplimiento** se muestran juntos y solo si hay plan, venta válida y confiabilidad distinta de Insuficiente; sin brecha válida no se muestra ninguna de las tres ni se presenta una brecha favorable o desfavorable. La **venta comparable** acompaña a la evolución. La cifra protagonista es la brecha; si no hay, la venta observada. | «Comparación válida y confiable» se entiende como «datos suficientes y válidos» (confiabilidad ≠ Insuficiente); con confiabilidad Baja la brecha se muestra rotulada «preliminar». |
| **D-02** Contribución | La contribución bruta estimada es siempre **detalle**, nunca cifra protagonista; solo con brecha válida y margen configurado; con confiabilidad Baja aparece rotulada «preliminar»; sin brecha válida se oculta; sin margen dice «Margen no configurado · Configurar» (nunca un 0). | Se calcula sobre la **brecha** (impacto en ventas), no sobre la venta total; el margen no cambia veredicto, estado, nivel ni narrativa corta. |
| **D-03** Veredicto y certeza | El veredicto es **cualitativo**: ningún importe, ninguna cifra de las tarjetas, ninguna frase genérica, ≤ 34 palabras; su contundencia depende de la confiabilidad, no del desempeño. Reglas **R1–R14** ejecutables (§5). | No se usan palabras de magnitud («fuertemente», «levemente») en el veredicto porque no existen umbrales aprobados; la narrativa corta sí califica la evolución con palabras («positiva», «ligeramente negativa») usando las bandas del contrato (±3 %, ±1 %). |
| **D-04** Casos especiales | **Sin actividad** → confiabilidad Insuficiente, sin cifra (no $0), sin lenguaje de crecimiento, deterioro o estabilidad, sin conclusión sobre conversión; si la actividad no puede verificarse (falta de dato) el mensaje es distinto («No se puede verificar la actividad»). **Conversión cero** (sesiones sin pedidos ni venta) → resultado observable, confiabilidad máxima Media, veredicto específico, sin causa atribuida ni sugerida. **Cambio de composición** → confiabilidad máxima Media, veredicto específico sin lenguaje de mejora ni de eficiencia. **Comparación inválida** → sin evolución. | «Sin actividad» significa **ninguna** sesión, pedido ni venta; un **umbral de actividad mínima observable** requiere datos de producción y queda como dependencia (Z1-27, Z1-28). |
| **D-05** Orden de evaluación | Ocho pasos fijos (§8); un **bloqueo duro** (Insuficiente) siempre precede a una limitación secundaria (Baja); Baja e Insuficiente son excluyentes y los motivos de un bloqueo duro no incluyen la limitación secundaria. | Precisa, sin modificar, el solapamiento de 3.1 §6. |
| **D-06** Nombres visibles | Tabla única de nombres para el usuario (§10); los identificadores internos no cambian y **no se muestran** en pantalla. | Los nombres de los 6 estados cambian respecto de la versión anterior del documento (p. ej. «Riesgo de cumplimiento» → «En riesgo de incumplir el plan»). |

**Precisiones de la auditoría final de aceptación** (corrigen defectos hallados en los puntos 1 a 3 sin cambiar D-01 a D-06; detalle y evidencia en `AUDITORIA_FINAL_ACEPTACION_3_2_Z1.md`):
1. **Cinco situaciones de venta que nunca se confunden.** *(A)* Venta positiva válida: se muestra siempre. *(B)* Venta cero **medida** con actividad (sesiones > 0): se muestra el cero y se dice «no se registró ningún pedido ni venta» o «no se registró venta en el periodo, aunque sí hubo actividad»; nunca «Hay venta registrada». *(C)* Sin actividad **verificada** (sesiones, pedidos y venta medidos y en cero, o el motor reporta ambos periodos en cero): Insuficiente, sin cifra. *(D)* Información **no verificable**: si no hay evidencia positiva y falta alguna medida, Insuficiente (causa `sin_dato_actividad`, sin cifra, mensaje de falta de información). *(E)* Información **no calculable**: solo valores negativos (el contrato de datos del motor los pone en cuarentena y no los suma) o una comparación que el motor declara no calculable; Insuficiente y sin cifra.
2. **Conversión cero sin causa sugerida.** Z1 informa lo que ocurrió («hay sesiones, pero no se registró ningún pedido») y declara que «la información disponible no permite determinar la causa»; ya no sugiere confirmar la medición de pedidos (eso insinuaba una causa). La regla R7 prohíbe además falla, checkout, calidad del tráfico, precio, inventario, campañas o marketing.
3. **Contribución.** El margen se muestra con una decimal como máximo; toda contribución disponible declara que es una estimación sobre la brecha contra el plan con margen promedio general, no el margen real del canal, producto o pedido ni una contribución observada.

**Resolución de los criterios C1 a C5** (decisiones del usuario; cada regla se sustenta en el contrato real del motor, que se inspeccionó sin modificarlo):

| Criterio | Regla aplicada en Z1 | Sustento en el contrato del motor |
|---|---|---|
| **C1** Pedidos y venta que no cuadran | **No invalidan el dato.** Pedidos con venta cero, venta con cero pedidos, pedidos sin sesiones o más pedidos que sesiones se clasifican como **dato inconsistente (pendiente de interpretación)**: las cifras siguen visibles, el aviso queda a la vista, la confiabilidad no puede ser Alta y Z1 no saca ninguna conclusión comercial (tampoco «conversión cero»). El dato se clasifica en cuatro categorías que no se confunden: **válido, inconsistente, no verificable y no calculable**. | `js/quality/validation.js` y `rules.js`: estas combinaciones son `MATHEMATICAL_INCONSISTENCY` con acción «flag» («se registra como advertencia y no se excluye nada»); en WhatsApp y Llamadas el volumen son contactos, no sesiones. Solo los negativos van a cuarentena y «no se suman». |
| **C2** Conciliación de ventas | **No hay tolerancia** (se retiró el 1 %). Si la venta del agregado de actividad y la venta del periodo difieren en más de un centavo (precisión de representación de la moneda, no una tolerancia de negocio), la conciliación queda **pendiente** y se avisa; si no difieren se informa «sin diferencia observada», nunca «conciliada». La brecha siempre sale de la venta del periodo. | No existe una tolerancia documentada: el agregado de actividad no tiene productor (Z1-28) y la tolerancia de `config.tolerances` aplica a CR y AOV cargados contra calculados, no a esta conciliación. Queda pendiente de definición con datos reales. |
| **C3** Actividad parcial | **Confiabilidad por conclusión.** Sesiones y pedidos son esenciales para la conversión, no para el cumplimiento (que necesita venta, plan y cobertura). Con venta positiva, una medida ausente deja la conversión «no verificable» (visible en el alcance) sin bajar la confiabilidad del cumplimiento. Solo cuando la venta es cero falta información secundaria relevante para evaluar ese cero y la lectura es Baja. Sin evidencia de actividad, Insuficiente. | `rules.js`: «Celda vacía: no se trata como cero». |
| **C4** Validación del margen | Z1 **no define un rango propio**: «Margen no válido · Revisar» es exactamente lo que rechaza la validación del motor, y muestra su motivo. Vacío o nulo es «no configurado»; guardado y apagado es «desactivado». | `js/economics/impactModel.js`: margen bruto sobre venta = (venta − costo) ÷ venta, en porcentaje, 0 ≤ m < 100 (`validateMarginInput` rechaza negativos y ≥ 100, que trata como probable markup). Es el contrato aceptado en Fase 2; si finanzas necesita un margen bruto negativo, es una decisión de 4.5. |
| **C5** Margen de 0 % | Tres situaciones: vacío o nulo → «Margen no configurado»; **0 % explícito** (activado y con fecha de configuración) → válido, contribución estimada de $0, declarada como estimación que no indica un margen real de 0 %; **0 % sin evidencia de configuración** → «Margen sin confirmar · Revisar», sin importe. | `buildSetting` deja `marginEnabled = true`, `updatedAt` y `source` al configurar; el valor predeterminado (`DEFAULT_SETTING`) es nulo, no 0. |

## 4. Reglas de contenido (generales)
1. Todo texto de Z1 sale de datos que ya calcularon los motores; Z1 no calcula indicadores oficiales.
2. Una cifra aparece **una sola vez** en Z1; el veredicto **no lleva importes ni cifras** (R4, R10) y la narrativa corta solo menciona los días contados.
3. Nunca «utilidad», «ganancia», «beneficio neto», ROI, ROAS ni CAC; la contribución se llama siempre «Contribución bruta estimada» y se rotula «estimada».
4. Una hipótesis no sostiene el veredicto ni aparece en Z1; si un motor no respalda una causa, no se escribe una causa (R7).
5. Una comparación inválida no produce lenguaje de crecimiento ni deterioro (R2).
6. Sin dato, el elemento conserva su lugar y dice qué falta; nunca muestra 0 como sustituto de «no hay dato».

## 5. Veredicto ejecutivo
**5.1 Estructura.** Una o dos frases cualitativas: `[Sujeto + dirección contra el plan o evolución] + [Implicación sobre el cierre, en palabras]`, precedidas por «Con avisos:» o «Lectura preliminar:» según la confiabilidad. **Máximo 34 palabras y 240 caracteres.** Texto grande, junto al estado; nunca una repetición de las cifras de las tarjetas.
**5.2 Tipos de veredicto.** ``saludable`, `creciendo`, `creciendo_bajo_potencial`, `riesgo_cumplimiento`, `deterioro` (uno por estado del contrato), más `conversion_cero`, `composicion` (casos especiales de D-04), `preliminar` (confiabilidad Baja) y `sin_lectura` (confiabilidad Insuficiente, con su causa).`
**5.3 Estados posibles.** Los 6 estados del contrato con su nombre visible (§10). Con confiabilidad Baja no se muestra etiqueta de estado («Lectura preliminar»); con Insuficiente se muestra «Sin lectura concluyente».
**5.4 Cómo se genera.** Plantilla determinista por estado y por modo; el modo lo fija la confiabilidad:

| Modo (confiabilidad) | Forma del veredicto |
|---|---|
| Definitiva (Alta) | Frase del estado, terminada según la **completitud** (D-05, §5.5): «Lectura sustentada en datos completos.» solo si está **verificada**; «Lectura calculable; la información disponible está incompleta.» si falta algo conocido; «No es posible confirmar que la información esté completa.» si no puede determinarse |
| Con avisos (Media) | «Con avisos: …» y «Conclusión con reservas.»; los motivos están a la vista en la banda |
| Preliminar (Baja) | «Lectura preliminar: la venta acumulada parece estar … la meta, pero los datos tienen limitaciones y no permiten una conclusión definitiva.» (sin estado ni verbos de certeza) |
| Sin lectura (Insuficiente) | Una frase por causa (sin actividad, sin venta, sin plan, datos insuficientes, no calculable): dice qué falta y no emite lectura |
| Especiales | Conversión cero y cambio de composición tienen su propio texto (§3, D-04) |
El **motivo** vive solo en la banda: ni el veredicto ni la narrativa corta lo repiten.

**5.5 Completitud de los datos (modificación autorizada por D-05, 12 de noviembre de 2026).** El sistema no declara que los datos están completos sin comprobarlo. Estados de la nueva salida `completeness`:
| Estado | Condición verificable | Lo que se afirma |
|---|---|---|
| `verificada` | Cobertura de días = 100 %; sesiones, pedidos y venta de actividad presentes; sin avisos ni errores de calidad | «Lectura sustentada en datos completos.» |
| `incompleta` | Falta al menos una medida (sesiones, pedidos, venta del agregado de actividad), hay días sin comparar o avisos de calidad | «Lectura calculable; la información disponible está incompleta.» y, en la narrativa ampliada (limitaciones, con confiabilidad Alta), «Falta información: …». |
| `no_verificable` | No hay medida de actividad con la que comprobarlo, o no se conoce la cobertura | «No es posible confirmar que la información esté completa.» |
La corrección **no** cambia la confiabilidad, el estado, las cifras ni la visibilidad: las métricas calculables se siguen mostrando y la conversión sigue siendo «no verificable» cuando faltan sesiones o pedidos (C3). No se interpreta el motivo de la ausencia. Registro y diferencias exactas: `CAMBIO_AUTORIZADO_D05_Z1.md`.
**5.5 Reglas de contenido (ejecutables en `checkVerdictText`).**

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

**5.6 Condiciones que impiden emitirlo.** Confiabilidad Insuficiente: no se emite veredicto de desempeño; se explica qué falta. Una comparación inválida **no** impide el veredicto de cumplimiento, pero impide cualquier frase de evolución.

**5.7 Veredictos correctos** (los produce la especificación; ninguno infringe R1–R14):
- Escenario 2 (negativo, confiabilidad alta): «La venta acumulada está por debajo de la meta; el cierre proyectado no la alcanzaría. Lectura sustentada en datos completos.»
- Escenario 4 (positivo, confiabilidad media): «Con avisos: la venta crece contra agosto 2026 y supera la meta acumulada; el cierre proyectado la superaría. Conclusión con reservas.»
- Escenario 5 (negativo, confiabilidad baja): «Lectura preliminar: la venta acumulada parece estar por debajo de la meta, pero los datos tienen limitaciones y no permiten una conclusión definitiva.»
- Escenario 6 (datos insuficientes): «Hay venta registrada, pero los datos no alcanzan para valorar el cumplimiento ni emitir una lectura del negocio.»
- Escenario 7 (sin actividad): «No hay actividad observable en el periodo: no es posible emitir una lectura del negocio.»
- Escenario 10 (conversión igual a cero): «Con avisos: hay sesiones en el periodo, pero no se registró ningún pedido; es un resultado observado, sin causa atribuida.»
- Escenario 11 (cambio de composición): «Con avisos: la venta acumulada está por debajo de la meta acumulada; la composición cambió frente al comparable, por lo que no se interpreta la evolución. Conclusión con reservas.»
- Escenario 14 (negativo con contribución disponible): «La venta acumulada está por debajo de la meta; el cierre proyectado no la alcanzaría. Lectura sustentada en datos completos.»
- Escenario A2 (sin plan con venta observada válida): «Hay venta registrada, pero sin plan del periodo no es posible valorar el cumplimiento.»
- Escenario A5 (venta cero medida sin plan): «Hubo sesiones, pero no se registró ningún pedido ni venta; sin plan del periodo no es posible valorar el cumplimiento.»
- Escenario A6 (actividad no verificable): «No se puede verificar la actividad del periodo: no es posible emitir una lectura del negocio.»
- Escenario A9 (conversión cero con errores de datos): «Lectura preliminar: hay sesiones, pero no se registró ningún pedido; los datos tienen limitaciones y no permiten una conclusión definitiva.»
- Escenario A8 (pedidos con venta cero, dato inconsistente): «Con avisos: la venta acumulada está por debajo de la meta; el cierre proyectado no la alcanzaría. Conclusión con reservas.»
- Escenario A15 (venta cero con pedidos sin medir): «Lectura preliminar: la venta acumulada parece estar por debajo de la meta, pero los datos tienen limitaciones y no permiten una conclusión definitiva.»

**5.8 Ejemplos incorrectos** (cada uno infringe exactamente las reglas indicadas; lo comprueba `tools/test-fase3-2-z1.js` y lo contrasta el verificador de consistencia):
| Id | Escenario | Texto incorrecto | Reglas que infringe |
|---|---|---|---|
| E1 | 5 | La venta cae por debajo de la meta: el negocio está en riesgo de incumplir el plan. | R1, R8 |
| E2 | 8 | La venta crece 5.0 % contra el periodo anterior y el negocio está saludable. | R2 |
| E3 | 2 | La venta va 4.5 % por encima de la meta acumulada (−$723 mil). | R3, R4, R10 |
| E4 | 12 | Estás en deterioro: la venta cae 12 % y cerrarías muy por debajo de la meta. | R1, R2, R8, R13 |
| E5 | 13 | Estás creciendo 5.0 % y la contribución es de $0 de utilidad neta. | R4, R5, R9, R10 |
| E6 | 10 | La venta cae porque el checkout falló, y el ROI de la campaña es negativo. | R5, R7 |
| E7 | 2 | La venta va 4.5 % por debajo de la meta acumulada y, además, el cierre proyectado queda por debajo de la meta, lo que sumado a la concentración de la brecha en un canal y al comportamiento de los últimos días sugiere revisar con urgencia todas las áreas del negocio. | R6 |
| E8 | 2 | La venta va 4.5 % por debajo de la meta acumulada; al ritmo actual cerrarías en $21.1 M. | R4, R10 |
| E9 | 2 | Mal resultado: la venta acumulada está por debajo de la meta. | R11 |
| E10 | 7 | Sin actividad: el negocio se mantiene estable, sin cambios en la conversión. | R12 |
| E11 | 6 | Hay venta registrada y queda en línea con la meta. | R13 |
| E12 | 11 | La venta acumulada está por debajo de la meta acumulada; la composición mejora la eficiencia. | R14 |
| E13 | 10 | No hubo pedidos, probablemente por tráfico de baja calidad. | R7 |
| E14 | A6 | Sin datos de actividad: el negocio se mantiene estable. | R12 |
| E15 | A6 | La venta es de $0 porque no hubo actividad. | R1, R4, R7 |

## 6. Indicador económico y visibilidad de cifras
**Cifra protagonista.** La **brecha vs plan a la fecha** (real − plan en los mismos días contados; `gap.js`), en pesos, con su signo y su base. Si no hay brecha válida, la cifra protagonista pasa a ser la **venta observada** (sin dirección contra el plan). Es el **único número de tamaño grande** de Z1.
**Subtexto de la brecha:** venta observada, meta acumulada y cumplimiento (tres líneas) y la base («plan de los mismos N días»). Con confiabilidad Baja el cumplimiento y la brecha van rotulados «preliminar».
**No se confunde:** venta observada (hecho), venta comparable (hecho), variación (cálculo), contribución bruta estimada (estimación) y utilidad o beneficio neto (**no existen** en el sistema y nunca se presentan).

**Reglas de visibilidad por cifra (D-01, D-02)**
| Cifra | Alta | Media | Baja | Insuficiente |
|---|---|---|---|---|
| Venta observada | Sí (subtexto de la brecha) | Sí | Sí | **Sí, como cifra protagonista, si es válida** (un cero medido con actividad se muestra como $0); no se muestra sin actividad, con actividad no verificable, sin venta contada o no calculable (nunca $0) |
| Brecha, meta acumulada, cumplimiento | Sí | Sí | Sí, «preliminar» | No |
| Cierre proyectado | Sí (con brecha válida) | Sí | No | No |
| Evolución y venta comparable | Solo con comparación válida | Solo con comparación válida | No | No |
| Contribución bruta estimada | Detalle, con margen y brecha válida | Detalle | Detalle «preliminar» | No (oculta) |

**Contribución.** Solo con margen bruto promedio general configurado y activo (`FP.economics.contributionOf`; no se recalcula) y sobre la brecha válida. Sin margen: celda suave «Margen no configurado · Configurar ▸» (o «Margen desactivado · Configurar ▸»); **nunca un importe ni un 0**. Sin brecha válida no se muestra ni la celda.
**Formato.** Importe compacto con signo («−$723 mil», «$21.1 M», «−$1.3 mil M»); el importe exacto vive en Z5. El signo, la cifra y su unidad no se separan (espacio de no separación); un importe largo baja un paso de tamaño (§12).

## 7. Periodo y comparación
Z1 rotula siempre: **periodo analizado** («Sep 2026 · día 22 de 30»), **base** («plan de los mismos 22 días»), **comparable** (etiqueta corta en el veredicto, etiqueta con fechas en su celda) y **disponibilidad de la comparación**. Los nueve estados de `attributeSegment` se agrupan en siete etiquetas:

| Etiqueta que ve el usuario | Estados de atribución | Qué permite | Qué no permite |
|---|---|---|---|
| Comparación válida | `ok`, `sin_trafico_actual`, `conversion_cero_actual` | Evolución con cifra, venta comparable y palabras de crecimiento o caída | — (con `conversion_cero_actual` se aplica el tope de confiabilidad Media) |
| Sin base comparable | `sin_base_comparable` (o no hay comparable) | Veredicto de cumplimiento | Cifra y palabras de evolución |
| Recuperación desde cero | `recuperacion_desde_cero` | Hecho: el comparable no registró pedidos | Porcentaje de evolución |
| Cambio de composición | `cambio_de_composicion` | Variación observada en pesos | Evolución directa; confiabilidad Alta; lenguaje de mejora o de eficiencia |
| Datos insuficientes | `datos_insuficientes` | Rotular qué falta | Evolución |
| Sin actividad | `sin_actividad` | Rotular «sin variación que explicar» | Evolución; cualquier cifra; confiabilidad distinta de Insuficiente |
| Resultado no calculable | `no_calculable` | Nada: confiabilidad Insuficiente | Veredicto, estado, cifra principal |
**Una comparación inválida nunca produce un veredicto contundente** sobre evolución (R2).

## 8. Confiabilidad de la lectura
**Cómo se presenta.** Siempre dentro de Z1: un **chip** en la cabecera («Confiabilidad alta/media/baja/insuficiente») y, cuando no es Alta, una **banda** con los **motivos a la vista** (no en un desplegable) y una banda de **alcance** («Se conoce / No se puede concluir / Diagnóstico»).

| Nivel | Estado | Veredicto | Motivos y alcance | Qué se oculta | Z2 |
|---|---|---|---|---|---|
| **Alta** | Etiqueta definitiva | Asertivo | No aparecen | Nada | Puente y atribución normales |
| **Media** | Etiqueta con «· con avisos» | «Con avisos: …» | **Visibles** | Nada | Puente con nota de cobertura |
| **Baja** | **Sin etiqueta** («Lectura preliminar») | «Lectura preliminar: …» sin verbos de certeza | **Visibles**: por qué es preliminar | Cierre, evolución | **«Diagnóstico no concluyente»** |
| **Insuficiente** | «Sin lectura concluyente» | Dice qué falta; no emite lectura | **Visibles**: qué falta | Brecha, cumplimiento, cierre, evolución, contribución (la venta observada válida se conserva) | No se muestra; solo acciones de datos |

**Orden de evaluación (D-05).** Ocho pasos fijos; el paso 6 fija el nivel y los pasos 7 y 8 derivan lo que se muestra y lo que se dice. La especificación devuelve esta traza (`evaluation.steps`) y el detalle de escenarios la imprime.

| Paso | Qué se evalúa | Efecto |
|---|---|---|
| 1 | Integridad y suficiencia de los datos (cobertura < 60 %, bloqueos, sin venta contada, sin días) | **Bloqueo duro** → Insuficiente |
| 2 | Actividad observable (sesiones, pedidos o venta) | Cero verificado → **bloqueo duro** `sin_actividad`; actividad no verificable (falta de dato) → **bloqueo duro** `sin_dato_actividad`; con venta cero y sesiones o pedidos sin medir → limitación (Baja); con venta positiva, la medida ausente solo deja la conversión «no verificable» (C3) |
| 3 | Existencia y comparabilidad de la base de referencia (plan, comparable) | Sin plan → **bloqueo duro**; comparable inválido → sin evolución |
| 4 | Indicadores y denominadores | Valores negativos → **bloqueo duro** `no_calculable`; combinaciones pendientes de interpretación entre sesiones, pedidos y venta, o conciliación pendiente → aviso y tope Media, sin invalidar (C1, C2); conversión cero → tope Media |
| 5 | Cambios de composición y límites de atribución (conversión cero, composición) | **Tope**: máximo Media |
| 6 | Nivel de confiabilidad final | Bloqueo duro → Insuficiente; limitación secundaria (errores en los datos, respaldo bajo) → Baja; avisos o tope → Media; en otro caso Alta |
| 7 | Elementos de Z1 que pueden mostrarse | Aplica la tabla de visibilidad (§6) |
| 8 | Veredicto y narrativa permitidos | Aplica el modo y las reglas R1–R14 |
Un bloqueo duro **siempre** precede a una limitación secundaria: añadir errores o avisos a una entrada ya bloqueada no la convierte en Baja (propiedad comprobada en miles de entradas aleatorias), y los motivos visibles de un bloqueo duro no incluyen la limitación secundaria. **Topes de diseño:** «conversión cero» y «cambio de composición» no permiten confiabilidad Alta. «Sin actividad» no es un tope sino un bloqueo duro.
**La confiabilidad no es el desempeño** (ambos casos están probados):
- *Mal desempeño con datos confiables:* escenario 2 (cumplimiento 95.5 %, confiabilidad Alta) → «En riesgo de incumplir el plan», declarado con firmeza.
- *Buen desempeño con datos insuficientes:* el escenario 1 con cobertura del 30 % → no se declara «En crecimiento», se conserva la venta observada y no hay brecha ni contribución.

## 9. Narrativa ejecutiva
Sustituye al antiguo «Resumen en texto» **sin reintroducirlo como bloque**: vive dentro de Z1.
- **Corta (visible):** una o dos frases, **sin cifras** (solo los días contados), que describen lo que el veredicto no dice: la evolución en palabras o por qué no se valora, y la base de la lectura. No repite el veredicto ni menciona drivers ni canales. Máximo 45 palabras.
- **Ampliada (bajo demanda, «Ver contexto ▸»):** cuatro capas separadas, máximo 140 palabras en total: **hecho observado** (venta observada y meta acumulada al día de corte), **interpretación respaldada por datos**, **limitaciones** (motivos de la confiabilidad y falta de margen) e **implicación para el negocio** (cierre al ritmo actual o por qué no conviene decidir).
- **Reglas:** no hay hipótesis ni causas; no se repiten frases de la corta ni del veredicto; Z1 no menciona conversión (salvo el veredicto de conversión cero), ticket, canales ni conteos de hallazgos. Una redacción posterior con IA (Fase 5, 5.2) deberá pasar las mismas reglas R1–R14.

## 10. Nombres visibles (D-06)
Los identificadores internos no cambian (son los del contrato de Fase 2). En pantalla solo se usan estos nombres; el wireframe y su prueba verifican que ningún identificador interno aparece en el texto visible.

| Familia | Identificador interno | Nombre visible | Explicación para el usuario |
|---|---|---|---|
| Estados del negocio | `saludable` | Cumpliendo el plan | La venta acumulada está en línea o por encima del plan y no hay alertas importantes. |
| Estados del negocio | `creciendo` | En crecimiento | La venta crece contra el periodo comparable y va en línea o por encima del plan. |
| Estados del negocio | `creciendo_bajo_potencial` | Crece, pero sin alcanzar el plan | La venta crece contra el comparable, pero queda por debajo del plan o el cierre proyectado está en riesgo. |
| Estados del negocio | `riesgo_cumplimiento` | En riesgo de incumplir el plan | La venta o el cierre proyectado quedan por debajo del plan, o hay una alerta crítica activa. |
| Estados del negocio | `deterioro` | En deterioro | La venta cae contra el periodo comparable y además queda por debajo del plan o el cierre está en riesgo. |
| Estados del negocio | `sin_base` | Sin lectura concluyente | Falta información válida y suficiente para emitir un estado del negocio. |
| Confiabilidad | `Alta` | Confiabilidad alta | Datos completos y comparables: la lectura puede sostenerse. |
| Confiabilidad | `Media` | Confiabilidad media | Hay avisos o cobertura parcial: la lectura se emite con reservas visibles. |
| Confiabilidad | `Baja` | Confiabilidad baja | Hay datos observables, pero con errores que impiden una conclusión sólida: solo hay lectura preliminar. |
| Confiabilidad | `Insuficiente` | Confiabilidad insuficiente | Falta información válida o suficiente: no se emite lectura. |
| Comparación | `valida` | Comparación válida | Existe un periodo comparable con actividad y pedidos: la evolución puede valorarse. |
| Comparación | `sin_base_comparable` | Sin base comparable | No hay periodo comparable con el que valorar la evolución. |
| Comparación | `recuperacion_desde_cero` | Recuperación desde cero | El periodo comparable no registró pedidos: no hay porcentaje de evolución que mostrar. |
| Comparación | `cambio_de_composicion` | Cambio de composición | Los canales o segmentos no son los mismos que en el comparable: la evolución no es directa. |
| Comparación | `datos_insuficientes` | Datos insuficientes | Faltan datos del comparable para valorar la evolución. |
| Comparación | `sin_actividad` | Sin actividad | No hay actividad registrada que comparar. |
| Comparación | `no_calculable` | Resultado no calculable | Hay valores negativos o inconsistentes: no se calcula. |
| Contribución | `disponible` | Contribución bruta estimada | Estimación con el margen bruto promedio general; no es utilidad ni beneficio real. |
| Contribución | `no_configurado` | Margen no configurado · Configurar | Sin margen no se estima contribución. |
| Contribución | `desactivado` | Margen desactivado · Configurar | El margen está guardado pero desactivado. |
| Contribución | `invalido` | Margen no válido · Revisar | La validación del motor rechazó el margen guardado: no se estima contribución. |
| Contribución | `no_confirmado` | Margen sin confirmar · Revisar | Hay un margen de 0 % sin evidencia de haber sido configurado: no se estima contribución. |
| Diagnóstico | `disponible` | Diagnóstico disponible | La explicación del resultado puede sostenerse. |
| Diagnóstico | `con_reservas` | Diagnóstico con reservas | La explicación se emite con los avisos indicados. |
| Diagnóstico | `no_concluyente` | Diagnóstico no concluyente | Solo se muestra lo observado; no se explica el porqué. |
| Diagnóstico | `no_disponible` | Diagnóstico no disponible | No hay información suficiente para diagnosticar. |

## 11. Estados y escenarios
Los 14 escenarios obligatorios y los 16 adicionales están diseñados, representados en el wireframe y documentados uno a uno en `FASE_3_2_ESCENARIOS_Z1.md` (orden de evaluación, qué se muestra, qué no, veredicto y narrativa permitidos, indicadores, alcance, advertencias y derivaciones). Resumen:

| # | Escenario | Confiabilidad | Estado ejecutivo | Comparación | Veredicto | Contribución |
|---|---|---|---|---|---|---|
| 1 | Desempeño positivo con confiabilidad alta | Alta | En crecimiento | Comparación válida | creciendo | Disponible |
| 2 | Desempeño negativo con confiabilidad alta | Alta | En riesgo de incumplir el plan | Comparación válida | riesgo_cumplimiento | No configurado |
| 3 | Desempeño estable con confiabilidad alta | Alta | Cumpliendo el plan | Comparación válida | saludable | No configurado |
| 4 | Desempeño positivo con confiabilidad media | Media | En crecimiento | Comparación válida | creciendo | Disponible |
| 5 | Desempeño negativo con confiabilidad baja | Baja | Lectura preliminar | Comparación válida | preliminar | Disponible |
| 6 | Datos insuficientes | Insuficiente | Sin lectura concluyente | Comparación válida | sin_lectura | Oculta |
| 7 | Sin actividad | Insuficiente | Sin lectura concluyente | Sin actividad | sin_lectura | Oculta |
| 8 | Sin base comparable | Alta | Cumpliendo el plan | Sin base comparable | saludable | No configurado |
| 9 | Recuperación desde cero | Alta | Cumpliendo el plan | Recuperación desde cero | saludable | No configurado |
| 10 | Conversión igual a cero | Media | En deterioro | Comparación válida | conversion_cero | No configurado |
| 11 | Cambio de composición | Media | En riesgo de incumplir el plan | Cambio de composición | composicion | No configurado |
| 12 | Resultado no calculable | Insuficiente | Sin lectura concluyente | Resultado no calculable | sin_lectura | Oculta |
| 13 | Venta positiva, pero sin margen configurado | Alta | En crecimiento | Comparación válida | creciendo | No configurado |
| 14 | Venta negativa, con contribución bruta estimada disponible | Alta | En riesgo de incumplir el plan | Comparación válida | riesgo_cumplimiento | Disponible |
| A1 | Conversión cero sin comparación válida | Media | En riesgo de incumplir el plan | Sin base comparable | conversion_cero | No configurado |
| A2 | Sin plan, con venta observada válida | Insuficiente | Sin lectura concluyente | Comparación válida | sin_lectura | Oculta |
| A3 | Bloqueo duro con una limitación secundaria | Insuficiente | Sin lectura concluyente | Comparación válida | sin_lectura | Oculta |
| A4 | Confiabilidad baja sin margen configurado | Baja | Lectura preliminar | Comparación válida | preliminar | No configurado |
| A5 | Venta real igual a cero con actividad y sin plan | Insuficiente | Sin lectura concluyente | Sin base comparable | sin_lectura | Oculta |
| A6 | Información incompleta: actividad no verificable | Insuficiente | Sin lectura concluyente | Comparación válida | sin_lectura | Oculta |
| A7 | Información parcial con venta positiva: pedidos no disponibles | Alta | En riesgo de incumplir el plan | Comparación válida | riesgo_cumplimiento | No configurado |
| A8 | Dato inconsistente: pedidos registrados con venta cero | Media | En riesgo de incumplir el plan | Comparación válida | riesgo_cumplimiento | No configurado |
| A9 | Conversión cero con errores de medición en los datos | Baja | Lectura preliminar | Comparación válida | preliminar | No configurado |
| A10 | Conversión cero con cambio de composición | Media | En riesgo de incumplir el plan | Cambio de composición | conversion_cero | No configurado |
| A11 | Margen guardado no válido | Alta | En riesgo de incumplir el plan | Comparación válida | riesgo_cumplimiento | Margen no válido |
| A12 | Margen configurado en 0 % | Alta | En riesgo de incumplir el plan | Comparación válida | riesgo_cumplimiento | Disponible |
| A13 | Dato inconsistente: venta positiva con cero pedidos | Media | En riesgo de incumplir el plan | Comparación válida | riesgo_cumplimiento | No configurado |
| A14 | Venta de la actividad distinta de la venta del periodo | Media | En riesgo de incumplir el plan | Comparación válida | riesgo_cumplimiento | No configurado |
| A15 | Información parcial con venta cero: pedidos sin medir | Baja | Lectura preliminar | Sin base comparable | preliminar | No configurado |
| A16 | Margen de 0 % sin evidencia de configuración | Alta | En riesgo de incumplir el plan | Comparación válida | riesgo_cumplimiento | Margen sin confirmar |

**Notas.** Los estados son los del contrato de Fase 2; el comportamiento esperado de cada escenario se **razonó desde los umbrales del contrato y las decisiones** y no se copió de la salida de la especificación. **Origen de las cifras:** el escenario 2 usa cumplimiento, brecha y cierre que entregó el motor con los datos de demostración desviados («motor»); **todos los demás valores son ilustrativos** y no provienen de datos reales. **Adicionales:** A1 a A4 (decisiones D-01 a D-05): conversión cero sin comparación válida, sin plan con venta observada válida, bloqueo duro con limitación secundaria y confiabilidad baja sin margen. A5 a A12 (auditoría final): venta cero medida sin plan (A5), actividad no verificable (A6), actividad parcial con venta positiva (A7), pedidos con venta cero = dato inconsistente (A8), conversión cero con errores de datos (A9), conversión cero con cambio de composición (A10), margen no válido (A11) y margen explícito de 0 % (A12). A13 a A16 (resolución de C1 a C5): venta positiva con cero pedidos (A13), conciliación pendiente (A14), venta cero con pedidos sin medir (A15) y 0 % sin evidencia de configuración (A16). Se añadieron únicamente porque cubren combinaciones que los 14 no ejercitan. El estado «Crece, pero sin alcanzar el plan» no es uno de los 30 pero se verificó con un caso adicional (X1 en la prueba). En conversión cero el aviso declara que la información disponible no permite determinar la causa; no sugiere ninguna.

## 12. Diseño responsive
Los puntos de corte son los que ya usa el sistema de diseño (1 024 y 600 px) y se aplican **al ancho del contenedor** de Z1.

| | Escritorio ≥ 1025 px | Tableta 600–1024 px | Móvil < 600 px |
|---|---|---|---|
| Orden | Cabecera → cuerpo → bandas → fila → ampliada | Igual | **Mismo orden de lectura**, no una reducción: chips → veredicto → **cifra protagonista** → motivos → alcance → narrativa corta → celdas → ampliada |
| Cuerpo | Veredicto (1.55) \| indicador (1) | Veredicto (1.3) \| indicador (1) | Una columna |
| Fila secundaria | 3 celdas | 3 celdas | Apiladas |
| Importes | 34 px (largo: 28 px) | 30 px (largo: 24 px) | 28 px (largo: 22 px) |
| Veredicto | 21 px | 19 px | 17 px |
| Textos largos | Se ajustan en varias líneas | Igual | Igual |
| Espaciado | 12 px | 12 px | 10 px |
**Nunca quedan ocultos:** estado, veredicto, cifra protagonista con su signo y su base, chip de confiabilidad y, si no es Alta, sus motivos y el alcance. **Pueden colapsarse:** narrativa ampliada, detalle del periodo y las celdas cuya confiabilidad ya las oculta. **Desbordamientos:** un importe o un porcentaje nunca se parte ni se recorta (no se separa de su unidad); el importe largo baja un paso de tamaño; los textos largos de periodo y comparación se ajustan. Verificado con una prueba de estrés (importes en miles de millones, −100 %, periodo y base largos) en los tres anchos (`F32.9`) y con los estados Baja, Insuficiente y sin plan en móvil y tableta emulados. **Es una verificación en Chromium emulado, no en un dispositivo móvil real (Pendiente de validación real).**

## 13. Matriz de trazabilidad y dependencias de Fase 4 y Fase 5
`MATRIZ_TRAZABILIDAD_Z1.md` conecta cada requisito de Z1 con la decisión que lo origina, su componente visual (`data-wf`), su fuente de datos, motor o contrato, su estado, la evidencia y la dependencia pendiente. **29 requisitos: 5 Disponible, 13 Parcial, 11 Por desarrollar.** Nada que solo esté propuesto figura como disponible, y no se implementó ninguna brecha.

**Dependencias por categoría** (cada una apunta a la fase donde se resuelve; ninguna se implementa aquí):
- **contratos_existentes** — Resoluble con contratos y motores existentes: solo falta conectar y presentar. (10): Z1-03 (Fase 4.1); Z1-04 (Fase 4.3); Z1-06 (Fase 4.2); Z1-12 (Fase 4.5); Z1-13 (Fase 4.2); Z1-17 (Fase 5.5); Z1-20 (Fase 4.1); Z1-21 (Fase 4.1); Z1-25 (Fase 4.2); Z1-27 (Fase 4.2).
- **completar_motores** — Requiere completar o ampliar un motor (Fase 4) antes de poder mostrarse. (14): Z1-01 (Fase 4.2); Z1-02 (Fase 4.2); Z1-05 (Fase 4.2); Z1-11 (Fase 4.3); Z1-12 (Fase 4.5); Z1-14 (Fase 4.2); Z1-15 (Fase 4.2); Z1-19 (Fase 4.2); Z1-22 (Fase 4.3); Z1-23 (Fase 4.2); Z1-24 (Fase 4.2); Z1-26 (Fase 4.3); Z1-28 (Fase 4.1); Z1-29 (Fase 4.2).
- **requiere_ia** — Requiere inteligencia artificial (Fase 5) para su versión final; existe una versión determinista de respaldo. (5): Z1-05 (Fase 5.2); Z1-06 (Fase 5.2); Z1-15 (Fase 5.5); Z1-16 (Fase 5.2); Z1-24 (Fase 5.5).
- **validacion_produccion** — Requiere validación con datos y usuarios de producción (umbrales y supuestos de la especificación). (9): Z1-02 (Fase 4.2); Z1-12 (Fase 4.5); Z1-14 (Fase 4.2); Z1-23 (Fase 4.2); Z1-26 (Fase 4.3); Z1-27 (Fase 4.2); Z1-28 (Fase 4.1); Z1-28 (Fase 4.2); Z1-29 (Fase 4.2).

## 14. Verificación y evidencia
**Ejecutado por mí en esta sesión (resultados exactos en el informe de cierre)**
| Prueba | Qué verifica |
|---|---|
| `tools/test-fase3-2-z1.js` | Los 30 escenarios contra salidas esperadas razonadas desde Fase 2 y las decisiones; 61 invariantes de contradicción sobre 4 000 entradas aleatorias; 21 propiedades metamórficas (orden D-05, independencia del margen, criterios C1 a C5) sobre 1 500; los 15 ejemplos incorrectos (cada uno infringe exactamente sus reglas) y los correctos; la tabla de nombres visibles; 38 mutaciones de la especificación (cada una debe ser detectada) |
| `tools/regression/batch_fase3_2_z1_wireframe.py` | Matriz contra la aplicación real; el problema actual del Home; wireframe sin errores ni desbordamientos a tres anchos y sin identificadores internos en el texto visible; existencia de las capturas |
| `tools/audit/verificar_consistencia_3_2.py` | Consistencia entre este documento, la matriz, los escenarios generados, el wireframe, `ESTADO.md` y los documentos aceptados (sin alterar), con un oráculo independiente en Python |
| `tools/audit/verificar_consistencia_3_1.py` y `tools/audit/probar_verificador_3_1.py` | Máquina de estados del roadmap (sin saltos ni retrocesos) y pruebas negativas del propio verificador |
Los verificadores prueban **contradicciones reales** (un veredicto asertivo con confiabilidad baja, crecimiento sin comparación válida, importe de contribución sin margen, brecha visible con confiabilidad insuficiente), no solo coincidencias de texto. **Qué prueba cada cosa (y qué no).** *Verificado por prueba lógica y matemática:* las reglas de Z1 sobre entradas sintéticas (escenarios, invariantes, propiedades y mutaciones), la aritmética de la contribución (brecha × margen) y la coincidencia con el clasificador de estado de Fase 2. *Verificado por integración con datos de demostración:* únicamente el escenario 2 usa cumplimiento, brecha y cierre del motor con los datos de demostración desviados, y el lote de navegador contrasta la matriz con las rutas `FP.*` reales. *Datos ilustrativos:* todos los demás escenarios; **no** demuestran que Z1 funcione con datos reales de FESA. *Pendiente de validación con datos reales:* umbrales de cobertura y de actividad mínima, la frecuencia real de conversión cero y su significado, la granularidad del margen, la lectura de los textos por analistas, gerentes y directores, y el comportamiento con las fuentes de producción. *No existe todavía:* el productor de actividad agregada (Z1-28) ni la integración de Z1 en la aplicación. **Ninguna de estas pruebas es una validación con datos reales de FESA.**

**No ejecutado / limitaciones del entorno (Pendiente de validación real):** pruebas en dispositivo móvil real; pruebas con usuarios; accesibilidad con lector de pantalla; rendimiento; otros navegadores. El wireframe es estático y de baja fidelidad.

## 15. Limitaciones, riesgos y decisiones para tu revisión
**Limitaciones:** diseño de baja fidelidad, sin estilo visual ni copy final; los textos son los de la especificación; cifras ilustrativas salvo el escenario 2; auditoría con datos de demostración; sin validación con usuarios ni en móvil real; el **umbral de actividad mínima observable** no está definido (la especificación solo reconoce «ninguna actividad»); no existen umbrales aprobados para palabras de magnitud en el veredicto.
**Limitaciones que permanecen documentadas (no se resuelven en esta subfase):** (1) no se ha realizado validación con datos reales de FESA; (2) el agregado de actividad no tiene todavía un productor conectado en la aplicación; (3) la diferencia entre el motor (`sin_trafico_actual`, que trata como caída de volumen) y la lectura de Z1 (que no emite lectura sin actividad) debe reconciliarse en 4.1 y 4.2; (4) el motor dispone de margen promedio general, no de margen real por canal, producto o pedido; (5) la contribución es una estimación sobre la brecha contra el plan, nunca un margen o una contribución real observada; (6) la especificación y varios verificadores se desarrollaron en la misma sesión: se requiere una revisión independiente posterior.
**Riesgos pendientes:** (1) los nombres visibles pueden no coincidir con el vocabulario de los usuarios finales (se validan en 3.5); (2) el criterio «datos suficientes y válidos» para mostrar la brecha con confiabilidad Baja puede parecer permisivo a un director; (3) la confiabilidad de producción dependerá de que los motores entreguen los motivos con la granularidad que Z1 asume (Z1-02, Z1-14); (4) el veredicto de conversión cero asume que la medición de pedidos puede fallar sin saber si falló.
**Criterios aplicados que esperan tu revisión** (ver §3): «comparación válida y confiable» = datos suficientes y válidos; contribución calculada sobre la brecha; sin palabras de magnitud en el veredicto; «sin actividad» = ninguna actividad.
**Hallazgos:** (1) la ruta `wireframes/home_3_1_wireframe.html` del prompt no existe tal cual; (2) 3.1 §6 solapa Baja e Insuficiente (precisado en §8 sin modificar 3.1); (3) el Home actual afirma «Vas… por debajo» con un hallazgo bloqueante (`F32.4`, `F32.5`); (4) al reforzar el verificador de 3.1 se halló que su comprobación de estados era demasiado laxa (aceptaba cualquier estado que empezara por «COMPLETADA»); ahora es una máquina de estados con pruebas negativas.

## 16. Relación con el roadmap
3.2 queda **lista para revisión, no aceptada**. 3.3 a 3.5 y las Fases 4 a 6 permanecen NO INICIADAS. No se modificó ningún documento aceptado de fases anteriores (comprobado por hash en `generated/HASHES_BASE_3_2.json`) ni código de la aplicación. Tras tu aceptación formal, el siguiente paso sería 3.3; no se inicia sin ella.
