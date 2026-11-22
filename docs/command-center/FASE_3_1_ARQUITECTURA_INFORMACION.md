# Fase 3 · Subfase 3.1 — Arquitectura de información del Home inteligente

**Versión 2.** Incorpora el cierre de observaciones del usuario: las decisiones D-01 a D-04 (aprobadas) y las aclaraciones A y B.
**Estado:** COMPLETADA CON LIMITACIONES DOCUMENTADAS; lista para aceptación formal del usuario (todavía no aceptada).
**Alcance:** solo 3.1. No ejecuta 3.2 (resumen ejecutivo), 3.3 (hallazgos, riesgos y oportunidades), 3.4 (prioridades y recomendaciones) ni 3.5 (prototipo y validación UX). No cambia código de la aplicación ni contratos metodológicos.
**Base:** rama `ccr-a81af632-rirtu7`, commit base `a2b3863`, cambios previos sin confirmar (no se tocaron).
**Fuentes de verdad respetadas:** Fase 2 (`ACEPTACION_FASE_2.md`, `MODELO_*`, `ATRIBUCION_FUENTE_DE_VERDAD.md`) y el roadmap maestro sin cambios.

Documentos hermanos: `MATRIZ_UX_MOTORES.md` (matriz UX ↔ motores; fuente: `generated/MATRIZ_UX_MOTORES.json`), `wireframes/home_3_1_wireframe.html` (wireframe estructural), `wireframes/capturas_auditoria/` (capturas de la auditoría).

**Numeración de este documento.** Las secciones son §0 a §16. Las capas del Home son **NAV**, **BC** y **Z1 a Z5** (§3.1). Las decisiones aprobadas por el usuario se citan como **D-01 a D-04** (su numeración). Las decisiones de diseño propias se citan como **DD-01 a DD-11** (§13). Las filas de la matriz son **M01 a M33**. Los problemas de la auditoría son **P1 a P13**. La hipótesis inicial A–G solo se usa como referencia para mapear a Z1–Z5 (§3.2).

---

## 0. Decisiones aprobadas por el usuario

| Decisión | Estado | Condición | Cómo queda incorporada | Documento | Matriz | Wireframe |
|---|---|---|---|---|---|---|
| **D-01** Fusionar explicación del desempeño y drivers | **Aprobada** | Experiencia narrativa integrada (qué ocurrió, por qué, qué factores); conservar detalle metodológico y atribución | Z2 «Qué ocurrió y por qué» en tres pasos y un plegable con el método y la atribución completos | §3.2, §5 | M05, M06, M33 | `z2`, `z2-ocurrio`, `z2-porque`, `z2-donde`, `z2-detalle-atribucion` |
| **D-02** Una sola experiencia de atención | **Aprobada con condición** | Hallazgo, riesgo y oportunidad conservan clasificación, significado y tratamiento | Z3 única, cada tarjeta con su clase visible por texto y forma (◆ ▲ ●) y tratamiento propio | §7.1 | M09–M13, M27 | `z3`, `z3-lista`, `z3-clases` |
| **D-03** Máximo tres destacados | **Aprobada con condición** | 3 hallazgos y 3 acciones destacados; no limitar el universo; acceso al resto; selección por impacto, urgencia y confiabilidad | «3 de N» y «Ver todos» en Z3 y «3 de M» y «Ver todas» en Z4; criterios de selección definidos | §7.2, §7.3 | M28, M30 | `z3-seleccion`, `z4`, `z4-ver-todas` |
| **D-04** Retirar bloques redundantes | **Aprobada con condición** | Retirar el Recorrido del Home principal; eliminar el Resumen en texto como bloque; conservar su capacidad narrativa en la lectura ejecutiva; no perder información útil | Narrativa corta/larga dentro de Z1; el Recorrido pasa a la ayuda existente; tabla de destino de cada pieza | §3.4, §8.1 | M02, M31, M32 | `z1-narrativa`, `z5-sin-recorrido` |
| **A.** Barra de contexto, navegación y contenido principal | **Incorporada** | Numeración y estructura inequívocas | Tres capas: NAV (fuera del Home), BC (contexto), Z1–Z5 (contenido) | §3.1 | M26 | `nav`, `bc`, `z1`…`z5` |
| **B.** Confiabilidad condiciona la lectura | **Incorporada** | Un diagnóstico insuficientemente sustentado no se presenta como definitivo | Regla de contundencia por nivel de confiabilidad | §6 | M16, M17, M29 | `bc-confiabilidad`, `z1-condicion`, `var-confiabilidad-media`, `var-confiabilidad-baja` |

---

## 1. Auditoría del Home actual

### 1.1 Qué es el «Home» hoy (código real)
El Home es la vista `inicio` (`js/ui/guidance/home-view.js`, 237 líneas). Se compone de:

| Pieza | Archivo | Qué pinta |
|---|---|---|
| Encabezado y filtros | `home-view.js` | Título, píldoras de contexto, «Cómo leer esta página», selectores Canal y Periodo |
| Banner del Analista | `agentLauncher` (`FP.agentLauncher.paintLine`) | «El Analista encontró N cosas…» + «Abrir en Asistentes» |
| Versión B: veredicto | `home-resumen.js` + `home-view.js` (`homeHead`) | Frase de veredicto, chips de confiabilidad (plegables), 4 cifras, «Resumen en texto» (corta/larga) |
| ¿Qué hago hoy? | `home-view.js` + `attention-view.js` | Siguiente mejor paso, qué necesita atención, «Desde ayer» y línea de Promociones |
| Canales | `home-summary-view.js` (`channelsBlock`) | Tabla de cumplimiento por canal |
| «Ver más» (4 plegables) | `home-summary-view.js` | ¿Cómo voy en detalle?, ¿Por qué va así?, ¿Dónde mirar?, ¿Qué tan confiable es? |
| «Metodología y ayuda» | `home-view.js` | Recorrido del sistema (6 etapas) y preparación de datos |
| Pie | `home-view.js` | «Convenciones» |
Estados que ya existen: sin datos (siguiente paso + preparación + recorrido), solo plan, periodo futuro, rango sin venta real y error del resumen (bloque aislado con try/catch).

### 1.2 Motores y contratos que lee el Home (verificado en el código)
`homeSummaryEngine.compute` (cómo voy, por qué, canales, confianza, dónde mirar), `attentionEngine.evaluate`, `contextEngine` (preparación y siguiente paso), `gap.pacingStatus`, `forecastEngine` (vía `state.fc.run`), `changesView.summaryOf` (desde ayer), `guide.nextStep` (Promociones) y `explain.whyButton` (evidencia). El resumen descriptivo se arma en `homeResumen.build` con umbrales provisionales de `config.diagnostics.homeSummary`.

**Lo que el Home no consume** (comprobado por la batería, `F31.4`): `temporalEngine`, `trendEngine`, `patternEngine`, `shareMixEngine`, `forecastConfidence`, `FP.economics`, `riskOpportunityEngine`, `actionPriorityEngine`, `scenarioEngine`, `recoveryEngine`. `attentionEngine` solo emite seis tipos de hallazgo (`gap`, `driver`, `forecast`, `channel`, `data`, `followup`); ninguno es riesgo u oportunidad (`F31.6`). `riskOpportunityEngine` existe pero ningún otro archivo de `js/` lo usa (`F31.5`).

### 1.3 Estilos y componentes
Dos capas visuales conviven: el sistema `ds-*` (`css/design-system.css`, 2 516 líneas) y la familia `px-*` de la versión B (`css/px.css`, 232 líneas; `FP.pxView.P` antepone el prefijo a las clases del bloque). El Home combina ambas. Hay insignias por tipo de dato (`ds-badge--fact`, `--driver`, `--signal`, `--hyp`, `--forecast`, `--scenario`, `--observed`, `--actual`, `--plan`, `--reforecast`, `--time`, `--chain`, `--neutral`). Puntos de corte presentes en los dos archivos de estilo: 1 100, 1 024, 860, 820, 760, 700, 620 y 600 px.

### 1.4 Medición en la aplicación real
Chromium headless con datos de demostración y una desviación real (Ecommerce −12 %); capturas en `wireframes/capturas_auditoria/`. **No es un dispositivo móvil real.**

| Medida | Escritorio 1280×900 | Móvil emulado 390×844 | Vacío (escritorio) |
|---|---|---|---|
| Altura de la página | 3 594 px | 5 547 px | 1 263 px (bloque Home) |
| Palabras visibles por defecto | 680 | 680 | 296 |
| Palabras con todos los plegables abiertos | 1 867 (8 028 px) | — | — |
| Plegables (`details`) | 14, todos cerrados | 14 | — |
| Elementos interactivos | 36 | — | — |
| Elementos con cifras en el primer pantallazo | 17 | 11 | — |
| Desbordamiento horizontal de página | ninguno | ninguno | ninguno |
| Errores de consola | 0 | 0 | 0 |
Son una fotografía de un escenario concreto, no un promedio.

### 1.5 Información que hoy no se presenta
Estado general del negocio (6 estados de Fase 2); evolución contra comparable como cifra de portada; drivers a la vista (solo una frase en el veredicto); estado de atribución rotulado; riesgos y oportunidades como categorías; impacto económico por hallazgo y contribución bruta; etiqueta de certeza por elemento; confianza del forecast; tendencias, patrones y mezcla; concentración de la brecha por canal como hallazgo.

---

## 2. Diagnóstico de problemas UX/UI

| # | Problema | Evidencia | Gravedad | Lo resuelve |
|---|---|---|---|---|
| P1 | «¿Crece o se deteriora?» y «¿qué lo impulsa?» sin respuesta visible; los drivers están en un plegable cerrado | `F31.8` | Alta | Z1 (evolución), Z2 (D-01) |
| P2 | Conteos que no cuadran: «El Analista encontró 4 cosas» frente a «2 hallazgos» | `F31.9` | Alta | Z3 única (D-02, DD-11) |
| P3 | Sin riesgos ni oportunidades como categoría | `F31.6` | Alta | Z3 con clases (D-02) |
| P4 | Sin impacto económico ni contribución en ningún hallazgo | `F31.4` | Alta | Z3 (impacto), DD-06 |
| P5 | El mismo mensaje («Completa la información necesaria para el diagnóstico») aparece tres veces | Captura | Media | Z3/Z4 (una fuente por concepto) |
| P6 | Jerarquía plana y espacio vacío (~700 px estimados de la captura en la columna izquierda) | Captura | Media | Columna narrativa única |
| P7 | Tarjeta «Tu siguiente mejor paso» demasiado larga para una acción | Captura | Media | Z4 (acción compacta) |
| P8 | Saturación: 14 plegables, 36 interactivos, 680 palabras por defecto y 1 867 abiertas | §1.4 | Media | Zonas y jerarquía (§3.4) |
| P9 | Redundancias: «Resumen en texto», «¿Cómo voy en detalle?» y «Recorrido del sistema» (duplica el menú) | Código y capturas | Media | D-04 |
| P10 | Certeza y confiabilidad escondidas (plegable cerrado); sin etiqueta de certeza por elemento | Captura | Alta | Aclaración B (§6), BC |
| P11 | Veredicto afirmativo con un hallazgo que «Bloquea el análisis» | Captura | Alta | Aclaración B (§6) |
| P12 | Legibilidad: signo negativo partido en dos líneas; modal de bienvenida sobre el veredicto en una primera visita (contexto limpio); filtros ocupan una fila antes del contenido (más de 300 px hasta el veredicto) | Capturas | Baja | BC compacta; 3.2 |
| P13 | Redacción del veredicto en código de vista, con umbrales provisionales | `home-resumen.js` | Baja | DD-09 (Fase 4) |
Se conservan: veredicto en lenguaje natural, cabecera descriptiva sin causas, plegado de detalle, estados vacíos explicativos, bloque aislado ante errores y ausencia de desbordamiento horizontal.

---

## 3. Arquitectura de información

### 3.1 Tres capas inequívocas: navegación, barra de contexto y contenido principal (aclaración A)

| Capa | Qué es | ¿Es parte del Home? | Qué contiene | Qué NO contiene |
|---|---|---|---|---|
| **NAV** · Navegación | Menú lateral (Inicio y siete grupos), barra superior y búsqueda de la aplicación | **No**: es de la aplicación | Movimiento entre módulos | Datos, cifras ni lectura del negocio |
| **BC** · Barra de contexto | Franja fija en la parte superior del Home | Sí, pero **no es contenido ni navegación** | Canal, periodo, fecha de datos, **confiabilidad global con su motivo**, «Cómo leer esta página» | Cifras de negocio, conclusiones ni enlaces a otros módulos |
| **Z1 a Z5** · Contenido principal | Las cinco zonas narrativas | Sí | La lectura del negocio, en el orden de las preguntas | Filtros ni navegación |
Reglas de numeración: las zonas se numeran **Z1–Z5** y solo ellas; BC no es una zona; NAV no pertenece al Home; no existe «Zona 0». Una pieza tiene **una sola capa y zona propietaria** y una sola fuente de verdad; otras zonas pueden mostrar referencias, resúmenes o acciones relacionadas con ella cuando cada aparición cumple una función distinta (aclaración H-01, derivada de D-07, 12-nov-2026: `ACLARACION_H01_H02_PROPIEDAD_Z5.md`).

| Zona | Responde | Contenido |
|---|---|---|
| **Z1** Lectura ejecutiva | ¿Cómo está? ¿Crece o se deteriora? | Estado (6 estados), conclusión (con narrativa corta ↔ larga), brecha, cierre proyectado, evolución vs comparable, condición de la lectura |
| **Z2** Qué ocurrió y por qué | ¿Qué lo impulsa? ¿Qué factores explican las desviaciones? | Qué ocurrió → por qué (puente de drivers) → dónde se concentra; detalle metodológico y de atribución; hipótesis aparte |
| **Z3** Qué merece atención | ¿Dónde hay riesgos y oportunidades? ¿Qué es prioritario? | Una experiencia, tres clases (hallazgo, riesgo, oportunidad); 3 destacados de N |
| **Z4** Qué hago | ¿Qué hago con esto? | 3 acciones destacadas de M |
| **Z5** Evidencia y detalle | ¿Qué tan confiable es? ¿Qué falta? | Tablas completas, confiabilidad y cobertura, datos faltantes, método |

### 3.2 Evaluación de la hipótesis A–G y su mapeo a Z1–Z5
| Hipótesis | Veredicto | Zona | Razón |
|---|---|---|---|
| A. Estado general | Se conserva | Z1 | Es lo primero que debe verse |
| B. Explicación del desempeño | **Se funde con C (D-01, aprobada)** | Z2 | Hoy están separadas; el usuario las lee como una sola respuesta |
| C. Drivers y factores | Se funde con B | Z2 | Puente de drivers + dónde se concentra, con el método conservado |
| D. Hallazgos relevantes | **Una sola experiencia con E (D-02, aprobada con condición)** | Z3 | Mismo objeto con clasificación; la experiencia es única, el significado no |
| E. Riesgos y oportunidades | Experiencia única con D | Z3 | Cada elemento conserva su clase y tratamiento |
| F. Prioridades y recomendaciones | Se conserva | Z4 | Depende de Z3: va después |
| G. Evidencia y detalle | Se conserva | Z5 | Bajo demanda |
| (contexto) | Capa propia | BC | Los filtros y la confiabilidad condicionan toda la lectura y no son A–G |

### 3.3 Alternativas descartadas
1. **Siete secciones A–G apiladas:** repite la saturación actual.
2. **Pestañas:** esconden la cadena de respuestas y añaden navegación no pedida.
3. **Columna derecha fija de atención** (diseño actual): descompensa la altura (P6) y obliga a leer en zigzag.
4. **Dashboard de tarjetas de indicadores:** contradice el objetivo de explicar el negocio.

### 3.4 Jerarquía de información
| Nivel | Qué va | Regla |
|---|---|---|
| **Protagonista** | Estado + conclusión y **la brecha en pesos** (Z1) | Único número de tamaño grande |
| **Secundario visible** | Cierre proyectado, evolución, cumplimiento (%), puente de drivers, canales, 3 destacados de atención y 3 acciones | A la vista cuando hay datos suficientes |
| **Bajo demanda (Z5 y plegables)** | Tabla de cifras, tabla de canales, confiabilidad y cobertura, qué falta, método y definiciones, detalle de atribución, hipótesis, universo completo de hallazgos y acciones | Plegado o tras «Ver todos»; sigue en la página |
| **Agrupar** | Los dos conteos de hallazgos en uno; siguiente paso, atención y «desde ayer» en Z3/Z4 | Una fuente por concepto |
| **Retirar del Home principal (D-04)** | «Resumen en texto» como bloque; «Recorrido del sistema»; «¿Cómo voy en detalle?» (repite cifras); tarjeta larga «Tu siguiente mejor paso» | **Ninguna información útil se pierde**: tabla de destino en §8.1 |
| **Solo con datos suficientes** | Evolución (comparable); puente (base atribuible); contribución (margen); oportunidades (alcanzable calculable); tabla de canal (≥ 2 canales); preparación de datos (si bloquea) | Si faltan: el elemento conserva su lugar con «qué falta»; **nunca muestra 0** |

### 3.5 Distinción de la calidad de la información
Cada afirmación de la portada lleva una etiqueta de certeza (escalera de Fase 2: hecho, cálculo, driver, señal, estimación, hipótesis; «datos insuficientes» es un estado, no un nivel).

| Clase | Qué es | Dónde aparece | Regla |
|---|---|---|---|
| Hecho | Dato observado | Venta real, fecha de datos | Sin matiz |
| Cálculo | Resultado determinista | Brecha, cumplimiento, cierre | Con su fuente |
| Estimación | Proyección o escenario con supuestos | Cierre proyectado, venta recuperable | Siempre con rango o supuesto |
| Hipótesis | Explicación posible | Plegable propio en Z2; tarjetas en Z3 | **Nunca titula ni sostiene una conclusión** |
| Datos insuficientes | No se puede concluir | Cualquier bloque sin base | Se dice qué falta; no se pinta 0 |
La distinción debe ser reconocible por **texto y forma, no solo por color**. Qué insignia de `ds-badge` corresponde a cada clase se decide en 3.2/3.3.

### 3.6 Atribución visible
Los nueve estados de `attributeSegment` se agrupan para la experiencia sin cambiar el motor:

| Grupo | Estados | Qué muestra Z2 |
|---|---|---|
| Atribuido | `ok`, `sin_trafico_actual`, `conversion_cero_actual` | Puente de drivers; en `conversion_cero_actual` la nota «el ticket no es observable» |
| Sin atribuir | `recuperacion_desde_cero`, `sin_base_comparable`, `cambio_de_composicion`, `no_calculable`, `datos_insuficientes` | La variación observada y el estado en palabras; **sin puente** ni porcentajes |
| Sin variación | `sin_actividad` | «Sin variación que explicar» |
Una contribución se rotula «contribución matemática», nunca «causa».

### 3.7 Economía visible
Impacto en ventas siempre que haya importe; contribución bruta estimada **solo con margen configurado**, rotulada «estimada» y con la nota de margen promedio general; sin margen, una línea «Margen no configurado» con enlace a Configuración (nunca un 0). Nunca «utilidad», «ganancia» ni «beneficio neto»; sin ROI, ROAS ni CAC. Alternativas de recuperación como rango, no suma; oportunidades solapadas no se duplican; el impacto de una clase no se suma al de otra.

---

## 4. Mapa jerárquico de secciones
```
APLICACIÓN
├─ NAV   Menú lateral (Inicio + 7 grupos), barra superior, búsqueda        [fuera del Home]
└─ HOME INTELIGENTE
   ├─ BC   Barra de contexto   Canal ▾ · Periodo ▾ · Datos al … · Confiabilidad ● con motivo · Cómo leer ▸
   ├─ Z1   Lectura ejecutiva   [Estado + conclusión (corta ↔ larga)] [Brecha $] [Cierre] [Evolución] · Lectura condicionada
   ├─ Z2   Qué ocurrió y por qué   1 Qué ocurrió → 2 Por qué (puente) → 3 Dónde se concentra
   │                               ▸ Detalle metodológico y de atribución   ▸ Hipótesis (aparte)
   ├─ Z3   Qué merece atención   3 de N destacados: ◆ Hallazgo · ▲ Riesgo · ● Oportunidad   → Ver todos (N)
   ├─ Z4   Qué hago              3 de M acciones destacadas                                 → Ver todas (M)
   └─ Z5   Evidencia y detalle   ▸ Cifras ▸ Canales ▸ Confiabilidad y cobertura ▸ Qué falta ▸ Método y definiciones
```

## 5. Z2: explicación integrada (D-01)
Una sola narrativa en tres pasos, de izquierda a derecha en escritorio y de arriba abajo en móvil:
1. **Qué ocurrió:** la variación observada (brecha y evolución), con certeza hecho/cálculo.
2. **Por qué:** cómo se descompone (sesiones → conversión → ticket → brecha) con el **estado de atribución** visible y la advertencia «contribución matemática, no causa».
3. **Dónde se concentra:** cumplimiento por canal; resalta el canal que concentra la brecha.

Se conserva todo el detalle metodológico en el plegable «Detalle metodológico y de atribución»: método (secuencial o Shapley, según configuración), orden de factores, contribución de cada factor, estado de atribución, cobertura de días comparados y la distinción entre variación observada, contribución matemática, atribución secuencial, efecto conjunto e hipótesis causal (`ATRIBUCION_FUENTE_DE_VERDAD.md` §4). La **hipótesis** vive aparte, plegada, y nunca sostiene la conclusión. Si no hay base comparable, el paso 2 muestra el estado explícito en lugar del puente (§3.6). Si la confiabilidad no sustenta un diagnóstico (§6), Z2 dice «Diagnóstico no concluyente» y muestra solo lo observado.

## 6. Confiabilidad y contundencia de la lectura (aclaración B)

**Principio.** La confiabilidad condiciona qué tan contundente es cada conclusión. Un diagnóstico insuficientemente sustentado no se presenta como definitivo. La certeza de una conclusión nunca es mayor que la confiabilidad global ni que la de la evidencia más débil que la sostiene (regla de Fase 2).

**Niveles.** Se construyen con señales que ya existen (`attentionEngine.support`: alto si ≥ 90 % de días comparados y datos sin avisos; medio si ≥ 60 % o con avisos; bajo si menos o con errores; `homeSummaryEngine.trust`; `contextEngine.dataReadiness`; hallazgos que bloquean):

| Nivel | Cuándo | Lectura en Z1 | Explicación en Z2 | Atención en Z3 |
|---|---|---|---|---|
| **Alta** | Respaldo alto, sin bloqueos | Estado definitivo; verbos asertivos permitidos («Vas 4.5 % por debajo…») | Puente y atribución completos | Normal |
| **Media** | Respaldo medio (cobertura parcial o avisos) | Estado emitido y rotulado **«con avisos»**; los motivos se muestran en Z1 (no plegados); frases con matiz («según los datos cargados…») | Puente con nota de cobertura | Certeza visible en cada tarjeta |
| **Baja** | Respaldo bajo | **«Lectura preliminar»**: sin estado definitivo ni verbos de certeza; se dice qué falta | **«Diagnóstico no concluyente»**: solo lo observado | Solo hallazgos y lo que falta; ninguna conclusión |
| **Insuficiente** | Sin plan o sin venta real, cobertura < 60 % o un hallazgo bloquea el análisis (p. ej. falta la meta anual) | Sin estado (`sin_base`); Z1 dice qué falta y ofrece el paso | No se muestra | Solo acciones de datos |

**Dónde se ve (nunca solo en un plegable):** BC (nivel global y motivo en una línea), Z1 (condición de la lectura), cada tarjeta de Z3 (su certeza). **Qué limita el bloqueo:** limita el diagnóstico y el estado, no las cifras observadas (el cumplimiento del mes sigue siendo un cálculo); lo que no puede presentarse es un «por qué» definitivo ni un estado definitivo. Esto resuelve P10 y P11.

Dependencia: M29 (Parcial): las señales existen; la regla que baja la contundencia debe construirse (Fase 4 / 3.2).

## 7. Z3 y Z4: atención y acciones

### 7.1 Una experiencia, tres clases (D-02)
Z3 es una sola experiencia visual, pero **cada elemento conserva su clasificación, su significado y su tratamiento**. La clase se muestra por **texto y forma** (◆ Hallazgo, ▲ Riesgo, ● Oportunidad), no solo por color.

| Clase | Qué es | Tratamiento | Impacto económico |
|---|---|---|---|
| ◆ **Hallazgo** | Lo que se observó o se calculó (hecho o desviación), sin juicio de valor | Se describe y se evidencia | No obligatorio |
| ▲ **Riesgo** | Resultado esperado o actual por debajo del plan o umbral, con consecuencia | Severidad, **impacto en riesgo**, certeza | Impacto en riesgo (observado/proyectado, sin mezclar) |
| ● **Oportunidad** | Potencial o venta recuperable con palancas controlables | Estimación con supuestos, restricciones declaradas, alternativas excluyentes (rango, no suma) | Venta potencial o recuperable |
Las clases no se confunden: el importe de una no se suma al de otra; una oportunidad no se presenta como hecho; un riesgo no se presenta como hallazgo neutro. Mapa al contrato de Fase 2: hallazgo ← `finding`/`deviation`; riesgo ← `risk`; oportunidad ← `opportunity` (M27).

### 7.2 Destacados y acceso al universo completo (D-03)
La portada destaca **hasta tres elementos de atención y hasta tres acciones**. **El universo total no se limita a tres:** se muestra siempre «3 de N» y existe «Ver todos (N)» con filtros por clase (Todos · Hallazgos · Riesgos · Oportunidades); lo mismo en acciones («3 de M» · «Ver todas (M)»). Nada relevante queda inaccesible.

### 7.3 Criterios de selección de los destacados
Se consideran, en este orden de precedencia, **urgencia, impacto y confiabilidad**:
1. **Urgencia:** severidad (crítica, importante, seguimiento); lo que bloquea el análisis va primero porque condiciona todo lo demás.
2. **Impacto:** importe en ventas (MXN) cuando existe; impacto en riesgo para riesgos; venta recuperable o potencial para oportunidades; las clases no se comparan sumando importes.
3. **Confiabilidad:** certeza y respaldo del elemento. Un elemento de baja confiabilidad puede aparecer, rotulado, pero **no desplaza** a uno mejor sustentado de impacto y urgencia similares.
Propuesta para 3.3: que la portada no se llene con una sola clase cuando existan otras de relevancia comparable. El criterio exacto (puntaje, desempate) lo define 4.4; la portada debe poder explicar el orden («Cómo se decide», ya existente). Dependencia: M28 y M30 (Parcial).

### 7.4 Acciones (Z4)
Hasta tres acciones destacadas; cada una cita el hallazgo, riesgo u oportunidad que la motiva. Sin recomendaciones genéricas: si no hay base, aparece «qué dato falta». La selección sigue los mismos tres criterios y se detalla en 3.4.

## 8. Navegación

### 8.1 Qué se retira del Home principal y adónde va (D-04)
**Ninguna información útil se pierde.** Cada pieza retirada tiene destino:

| Pieza retirada | Destino | Qué se conserva |
|---|---|---|
| **Resumen en texto** (bloque independiente, corta/larga) | **Dentro de Z1:** la frase corta es la conclusión; «Ver contexto ▸» despliega en el sitio la versión larga | La capacidad narrativa completa (`homeResumen.build`, M31). Sus filas se reparten: «Cómo voy» y «Cierre» → Z1; «Qué pesa» y «Canales» → Z2; «Atención» → Z3; «Desde ayer» → marca «nuevo» en Z3; «Confianza» → BC y Z5 |
| **Recorrido del sistema** (6 etapas con avance) | **Vista de ayuda existente** («¿Cómo funciona?»), sin cambios de contenido | Las 6 etapas y su avance (`homeView.journey`, M32); duplicaba el menú lateral |
| **Preparación de datos** (porcentaje y lista) | BC y Z1 cuando bloquea o es insuficiente; siempre en Z5 («Confiabilidad y cobertura» y «Qué falta») | Porcentaje, ítems y enlaces |
| **¿Cómo voy en detalle?** | Z5 («Cifras del periodo») | Las 7 cifras del periodo |
| **Tarjeta larga «Tu siguiente mejor paso»** | Z4 (acción compacta); el detalle («Resultado esperado», «Datos que se necesitan», «Estado», «Termina cuando») bajo demanda | Todo el contenido, plegado |
Esta subfase solo define el destino; el cambio de código corresponde a la construcción posterior.

### 8.2 Navegación del Home
No se agregan módulos ni pestañas; NAV no cambia (Inicio y siete grupos de `guidanceConfig.GROUPS`). Dentro del Home el orden de Z1–Z5 es la navegación. **Profundidad (4 niveles):** N0 portada · N1 expandir en el sitio (plegables, «Ver contexto», «Ver todos») · N2 evidencia por cifra (`explain.whyButton`, trazabilidad) · N3 el módulo completo con canal y periodo preservados (`go`/`data-nav`). Una sola acción «Ver detalle» por elemento.

| Elemento | Destino existente |
|---|---|
| Brecha, cumplimiento, cierre | Pacing / Forecast (Monitorear) |
| Puente de drivers, hipótesis | Diagnóstico |
| Canal | Pacing por canal / Diagnóstico |
| Riesgo de datos o calidad | Calidad / Carga |
| Oportunidad, acción | Recovery / Reforecast |
| Desde ayer | Cambios |
| Recorrido del sistema | Ayuda («¿Cómo funciona?») |
| Margen no configurado | Configuración → Herramienta → Margen comercial |

## 9. Estados (vacío, insuficiente, error)
| Estado | Comportamiento | Ya existe |
|---|---|---|
| Sin datos | Z1 pasa a «Falta información» con un botón; Z2–Z4 ocultas; Z5 muestra la preparación | Parcial |
| Solo plan | Meta del periodo y qué falta para medir | Sí |
| Periodo futuro | «El periodo no empieza»; plan y pronóstico | Sí |
| Dato insuficiente en un bloque | Conserva su lugar con «qué falta»; nunca 0 | Parcial |
| Sin base comparable (atribución) | Estado explícito en lugar del puente | Motor sí; presentación no |
| Confiabilidad media | BC ámbar; Z1 «con avisos» con motivos visibles | Nuevo (§6) |
| Confiabilidad baja o insuficiente | Z1 «Lectura preliminar»; Z2 «Diagnóstico no concluyente» | Nuevo (§6) |
| Bloqueo por meta anual | Banda en BC; Z1 y Z2 pasan a lectura preliminar | Parcial (P11) |
| Error de un bloque | Falla aislada con mensaje; la página sigue | Sí (resumen) |
| Margen no configurado | Una línea con enlace; sin importes | Nuevo |

## 10. Matriz UX ↔ motores
Ver `MATRIZ_UX_MOTORES.md`: **33 elementos: 11 Disponible, 19 Parcial, 3 Por desarrollar.** Las filas M27 a M33 incorporan las decisiones aprobadas y las aclaraciones. Los tres «Por desarrollar» son M01 (estado del negocio), M11 (contrato único de hallazgo) y M27 (clasificación hallazgo/riesgo/oportunidad); existen solo como especificación ejecutable de Fase 2 (`tools/audit/command-center-contracts.js`). La matriz se verifica contra la aplicación con `batch_fase3_1_home_auditoria.py` y contra este documento y el wireframe con `tools/audit/verificar_consistencia_3_1.py`.

## 11. Inventarios de componentes

### 11.1 Reutilizables (existen y se verificaron en el código)
| Componente | Dónde | Uso previsto |
|---|---|---|
| Veredicto en lenguaje natural | `homeResumen.build` + bloque `px` | Conclusión de Z1 |
| Narrativa corta/larga | `homeResumen.build` (filas) y botones corta/larga | «Ver contexto» de Z1 (D-04) |
| Cifra con comparación (veredicto `px`, `metric-card`) | px / `ds` | Brecha, cierre, evolución |
| Insignias por tipo de dato (`ds-badge--*`) | `design-system.css` | Base de las etiquetas de certeza |
| Chips de confiabilidad | `homeHead` / `homeResumen.build` | BC |
| Tarjeta de atención y de siguiente paso | `attention-view.js` | Base de la tarjeta de Z3 |
| «Cómo se decide» (explicación del orden) | `attention-view.js` | Transparencia de la selección (§7.3) |
| Tabla de canales con píldora de ritmo | `channelsBlock`, `pacingView.pacePill` | Z2 y Z5 |
| Cascada de efectos | `FP.segmentsDecompView.waterfall` | Base del puente de drivers |
| Plegable «Ver más» | `homeSummaryView.more` | Z5 y plegables de Z2 |
| Botón de evidencia | `explain.whyButton`, `traceability` | N2 |
| Franja «Desde ayer» | `FP.changesView.stripHtml` | Marca «nuevo» en Z3 |
| Estado vacío explicativo | `.ds-empty`, `FP.help.enhanceEmpty` | Estados §9 |
| Selectores de canal y periodo | `home-view.js` | BC |
| Recorrido del sistema | `homeView.journey` + `stepper` | Se traslada a ayuda (§8.1) |

### 11.2 Por desarrollar (en las subfases que correspondan, no ahora)
| Componente | Para qué | Diseño | Dependencia |
|---|---|---|---|
| Barra de contexto fija con confiabilidad y motivo | BC | 3.2 | M26, M29 |
| Etiqueta de estado del negocio | Los 6 estados | 3.2 | M01 |
| Condición de la lectura («con avisos», «preliminar») | Aclaración B | 3.2 | M29 |
| Etiqueta de certeza | Hecho…hipótesis y «datos insuficientes» | 3.2/3.3 | M16 |
| Cifra de evolución con estado «sin comparable» | Responder si crece o se deteriora | 3.2 | M05 |
| Narrativa en tres pasos y puente con estado de atribución | D-01 | 3.2 | M06, M33 |
| Tarjeta de elemento de atención con clase (◆ ▲ ●) | D-02 | 3.3 | M11, M27 |
| Selector de destacados y «Ver todos» con filtros | D-03 | 3.3 | M28, M30 |
| Línea de impacto (ventas + contribución condicionada) | Impacto sin confundir | 3.3 | M14, M15 |
| Panel de «datos insuficientes» | Qué falta para concluir | 3.3 | M18 |
| Lista de acciones con vínculo al elemento y «Ver todas» | D-03 | 3.4 | M19, M30 |

## 12. Wireframe estructural
Archivo: `wireframes/home_3_1_wireframe.html` (estático, escala de grises, sin lógica; versión 2). Muestra NAV, BC y Z1–Z5 en escritorio y móvil, la regla de condición de la lectura, la experiencia única de atención con sus tres clases, «3 de N / Ver todos», la ausencia del Recorrido y diez variantes de estado (incluidas confiabilidad media y baja). Resumen:
```
NAV (fuera del Home)  │ ┌ BC  Canal ▾ Periodo ▾ │ Datos al … │ Confiabilidad ● con motivo │ Cómo leer ▸ ┐
Menú lateral          │ ├ Z1  LECTURA EJECUTIVA: [Estado + conclusión (corta↔larga)] [Brecha $] [Cierre] [Evolución]
                      │ │     LECTURA CONDICIONADA por la confiabilidad
                      │ ├ Z2  QUÉ OCURRIÓ Y POR QUÉ: 1 Qué ocurrió → 2 Por qué (puente) → 3 Dónde
                      │ │     ▸ Detalle metodológico y de atribución   ▸ Hipótesis (aparte)
                      │ ├ Z3  QUÉ MERECE ATENCIÓN (3 de N · Ver todos): ◆ Hallazgo · ▲ Riesgo · ● Oportunidad
                      │ ├ Z4  QUÉ HAGO (3 de M · Ver todas)
                      │ └ Z5  EVIDENCIA Y DETALLE (plegado)   [el Recorrido ya no está aquí]
Móvil: mismo orden en una columna.
```
No define estilo visual ni copy final.

## 13. Decisiones de diseño propias
| # | Decisión | Justificación |
|---|---|---|
| DD-01 | Tres capas: NAV, BC y Z1–Z5 | Aclaración A; evita confundir contexto, navegación y contenido |
| DD-02 | La brecha en pesos es el único número grande | Evita que todos los indicadores pesen igual |
| DD-03 | Estado del negocio como etiqueta primaria + calificadores (Fase 2) | Responde «¿crece o se deteriora?» sin otro KPI |
| DD-04 | Certeza y severidad en cada tarjeta; la hipótesis nunca titula | Principio metodológico de Fase 2 |
| DD-05 | Estados de atribución visibles; sin puente cuando no hay base | `ATRIBUCION_FUENTE_DE_VERDAD.md` |
| DD-06 | Contribución solo con margen; si no, una línea con enlace | `MODELO_CUANTIFICACION_ECONOMICA.md` §0 |
| DD-07 | Sin navegación nueva | Pedido explícito; el menú ya cubre los módulos |
| DD-08 | Mismo orden en móvil, apilado | Consistencia; el primer pantallazo móvil debe traer estado y brecha |
| DD-09 | La redacción del veredicto sale de la capa de vista en Fase 4 | Los motores calculan, la vista presenta (P13) |
| DD-10 | La confiabilidad condiciona la lectura (§6) | Aclaración B |
| DD-11 | Una lista deduplicada con clasificación (contrato `cc.finding`) | Resuelve P2; soporta D-02 |

## 14. Dependencias con las siguientes subfases
| Subfase | Qué recibe de 3.1 | Dependencias |
|---|---|---|
| 3.2 Resumen ejecutivo | BC, Z1, Z2, regla de contundencia, narrativa integrada, estados | Etiqueta de estado, evolución y regla de confiabilidad (Fase 4) para la versión funcional |
| 3.3 Hallazgos, riesgos y oportunidades | Z3, clases, selección de destacados, «Ver todos», impacto, datos insuficientes | `cc.finding` con clasificación, `FP.economics` integrado (Fase 4) |
| 3.4 Prioridades y recomendaciones | Z4, «Ver todas», vínculo al elemento | `actionPriorityEngine` conectado; recomendaciones inteligentes (Fase 5) |
| 3.5 Prototipo y validación UX | Wireframe, estados, medidas de línea base | Pruebas con usuarios y dispositivos reales (no disponibles aquí) |
| Fase 4 | Matriz: 19 Parcial y 3 Por desarrollar | Productor único de `growthVsComparable`; criterio de selección; regla de confiabilidad; unificación de umbrales |
Esta subfase no ejecuta nada de lo anterior; solo identifica necesidades.

## 15. Validación
**Ejecutado por el desarrollador en esta sesión:**
- `tools/regression/batch_fase3_1_home_auditoria.py` (matriz contra la aplicación real; hechos de la auditoría; render sin errores ni desbordamiento a 1280, 768 y 390 px, con datos y sin datos).
- `tools/audit/verificar_consistencia_3_1.py` (consistencia entre este documento, la matriz JSON, su versión en Markdown y el wireframe: capas, numeración, decisiones D-01 a D-04, referencias M-xx, elementos del wireframe y ausencia de lo retirado).
- Pruebas existentes: Node, autotest, lint y baterías del Home (resultados en el informe de cierre).

**No ejecutado / no posible aquí:** pruebas en dispositivo móvil real; pruebas con usuarios; accesibilidad con lector de pantalla; rendimiento; otros navegadores. Capturas y mediciones: Chromium headless con datos de demostración.

## 16. Limitaciones y riesgos
**Limitaciones:** wireframe estático y de baja fidelidad; auditoría con un solo conjunto de datos de demostración; sin validación con usuarios; copy y estilo visual quedan para 3.2–3.5; los niveles de confiabilidad se construyen con señales existentes, pero su regla de aplicación no está implementada (M29).
**Riesgos:** (1) la versión funcional de Z1, Z2 y Z3 depende de la Fase 4; (2) la arquitectura podría ajustarse tras la validación UX de 3.5; (3) retirar bloques cambia hábitos de quien ya usa el Home; (4) los umbrales del veredicto y de confiabilidad son provisionales; (5) el modal de bienvenida y el botón de Asistentes compiten con la lectura inicial.
**Observaciones del usuario:** las cuatro decisiones y las dos aclaraciones están incorporadas (§0). No quedan decisiones abiertas de 3.1; queda la aceptación formal.
