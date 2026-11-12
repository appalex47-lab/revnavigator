# Escenarios comerciales críticos — Z1, Z3 y Z4 (ronda de calidad, Fase 3)

> Estado: **pendiente de aceptación formal** · Datos **simulados** (ninguno es de FESA) · No cambia cálculos ni reglas comerciales: ejercita las existentes y deja **decisiones pendientes** donde la definición de negocio no existe.
> Generado por `tools/audit/escenarios-comerciales-generar.js`; comprobado por `tools/test-fase3-escenarios-comerciales.js`.

Resultado: **16 de 16** escenarios cumplen todas sus comprobaciones y no presentan contradicción entre Z1, Z3 y Z4.

| Id | Escenario | Datos | Interpretación | Confiabilidad | Mensaje de Z1 | Z3 / Z4 | Recomendación | Afirmaciones que se evitan | Decisión pendiente |
|---|---|---|---|---|---|---|---|---|---|
| E01 | ventas > 0 y pedidos = 0 | Venta real a la fecha $2.4 M; pedidos = 0 (conversión 0). | Dato incoherente (hay venta sin pedidos): no se concluye sobre conversión ni ticket; la venta se muestra tal cual. | Media | Con avisos: la venta cae contra agosto 2026 y está por debajo de la meta acumulada; el cierre proyectado no la alcanzaría. Conclusión con reservas. | 3 de 4 / 3 de 4 | Revisar la combinación de sesiones, pedidos y venta; Ver el diagnóstico de la brecha | “la conversión es 0 %”; “el ticket es indefinido/infinito”; una causa | — |
| E02 | pedidos > 0 y ventas = 0 | Pedidos 6,200; venta real a la fecha $0. | Venta real 0 con pedidos: inconsistente; no se afirma “sin ventas” como hecho comercial sin verificar. | Media | Con avisos: la venta cae contra agosto 2026 y está por debajo de la meta acumulada; el cierre proyectado no la alcanzaría. Conclusión con reservas. | 3 de 4 / 3 de 4 | Revisar la combinación de sesiones, pedidos y venta; Ver el diagnóstico de la brecha | “no hubo ventas”; una brecha del 100 % como hecho | — |
| E03 | sesiones = 0 | Sesiones 0 (verificado) con pedidos 5,800 y venta $9.3 M. | Sesiones 0 con pedidos es incoherente: no se calcula conversión (÷0). | Media | Con avisos: la venta cae contra agosto 2026 y está por debajo de la meta acumulada; el cierre proyectado no la alcanzaría. Conclusión con reservas. | 3 de 4 / 3 de 4 | Revisar la combinación de sesiones, pedidos y venta; Revisar el pronóstico de cierre | conversión infinita; “el tráfico cayó a cero” | — |
| E04 | sesiones faltantes | Sesiones sin dato (null); pedidos y venta presentes. | Falta el dato de sesiones: el embudo no se evalúa; se pide el dato. Faltante ≠ 0. | Alta | La venta cae contra agosto 2026 y está por debajo de la meta acumulada; el cierre proyectado no la alcanzaría. Lectura calculable; la información disponible está incompleta. | 3 de 4 / 3 de 4 | Revisar la combinación de sesiones, pedidos y venta; Revisar el pronóstico de cierre | “0 sesiones”; conversión | — |
| E05 | conversiones no verificables | Conversión verificada como no verificable (comparabilidad con cambio de definición). | El periodo de comparación cambió de composición: el cambio vs periodo anterior no se afirma. | Media | Con avisos: la venta acumulada está por debajo de la meta acumulada; la composición cambió frente al comparable, por lo que no se interpreta la evolución. Conclusión con reservas. | 3 de 5 / 3 de 4 | Revisar el pronóstico de cierre; Evaluar las alternativas de recuperación | “creció X % vs el periodo anterior” | — |
| E06 | CR / AOV no disponible | Sin actividad (sesiones, pedidos) en el periodo: no hay CR ni ticket. | Sin dato de actividad: no se evalúa conversión ni ticket; la venta vs plan sí. | Alta | La venta cae contra agosto 2026 y está por debajo de la meta acumulada; el cierre proyectado no la alcanzaría. No es posible confirmar que la información esté completa. | 3 de 4 / 3 de 4 | Revisar la combinación de sesiones, pedidos y venta; Revisar el pronóstico de cierre | CR 0 %; ticket 0 | — |
| E07 | datos incompletos | Cobertura 40 % de los días comparados; apoyo bajo. | Cobertura insuficiente: la lectura es preliminar y baja de confiabilidad. | Insuficiente · cobertura | Hay venta registrada, pero los datos no alcanzan para valorar el cumplimiento ni emitir una lectura del negocio. | 1 de 1 / 1 de 1 | Cargar los días de venta que faltan | presentar la brecha como definitiva; proyectar el cierre sin salvedad | Umbral mínimo de cobertura para «Alta/Media/Baja» (hoy: regla vigente de Z1; no se cambia). |
| E08 | diferencias entre fuentes | Dos fuentes difieren: la suma por canal no coincide con el total. | Dato inconsistente ≠ inválido: se declara la diferencia y se pide conciliar; no se aplica una tolerancia inventada (conciliación pendiente). | Media | Con avisos: la venta cae contra agosto 2026 y está por debajo de la meta acumulada; el cierre proyectado no la alcanzaría. Conclusión con reservas. | 3 de 7 / 3 de 6 | Revisar los avisos de calidad de la carga; Revisar el pronóstico de cierre | elegir una fuente como “la verdadera”; una tolerancia del 1 % | Regla de conciliación entre fuentes: qué fuente manda y qué tolerancia es aceptable (C2 de 3.2: abierta). |
| E09 | actividad sin productor | Hay pedidos/venta pero ningún canal/productor los explica (sin desglose). | Sin desglose no se atribuye nada a un canal ni productor; Z3 no inventa una causa. | Alta | La venta cae contra agosto 2026 y está por debajo de la meta acumulada; el cierre proyectado no la alcanzaría. Lectura sustentada en datos completos. | 3 de 6 / 3 de 5 | Revisar el pronóstico de cierre; Evaluar las alternativas de recuperación | “el canal X explica la brecha” | — |
| E10 | ausencia de actividad (cero verificado) | Sesiones 0, pedidos 0, venta 0 verificados en el periodo. | Cero verificado: es un hecho (sin actividad), distinto de «sin dato». | Insuficiente · sin_actividad | No hay actividad observable en el periodo: no es posible emitir una lectura del negocio. | 1 de 1 / 1 de 1 | Verificar la carga de sesiones, pedidos y venta | confundirlo con “sin dato”; recomendar acciones comerciales de optimización | Umbral mínimo de actividad para considerar que hay base de comparación (hoy: solo cero/no cero). |
| E11 | margen no configurado | Margen bruto sin configurar. | El impacto se muestra en ventas; la contribución bruta no se estima (null, no 0). | Alta | La venta cae contra agosto 2026 y está por debajo de la meta acumulada; el cierre proyectado no la alcanzaría. Lectura sustentada en datos completos. | 3 de 6 / 3 de 5 | Revisar el pronóstico de cierre; Evaluar las alternativas de recuperación | “contribución $0”; estimar un margen por defecto | — |
| E12 | margen = 0 % | Margen configurado explícitamente en 0 %. | Un 0 % explícito es una configuración, no ausencia: no se confunde con “no configurado”. | Alta | La venta cae contra agosto 2026 y está por debajo de la meta acumulada; el cierre proyectado no la alcanzaría. Lectura sustentada en datos completos. | 3 de 6 / 3 de 5 | Revisar el pronóstico de cierre; Evaluar las alternativas de recuperación | tratarlo como no configurado sin decirlo; mostrar una contribución positiva | Si 0 % es un margen válido o debe tratarse como no configurado (C5 de 3.2: validez según el motor; confirmar con Finanzas). |
| E13 | margen negativo | Margen configurado −5 %. | Fuera del rango del motor (≥ 0): no es válido para estimar contribución; se muestra solo ventas. | Alta | La venta cae contra agosto 2026 y está por debajo de la meta acumulada; el cierre proyectado no la alcanzaría. Lectura sustentada en datos completos. | 3 de 6 / 3 de 5 | Revisar el pronóstico de cierre; Evaluar las alternativas de recuperación | calcular una contribución negativa; corregir el signo en silencio | Margen negativo: ¿es válido (venta por debajo del costo) o error de captura? Decisión de negocio/Finanzas; hoy el motor lo rechaza. |
| E14 | impactos positivos, negativos y superpuestos | Brecha −$0.7 M; canal que la concentra (mismo dinero); alternativas de recuperación; riesgo de cierre. | Z3 no suma entre clases, no totaliza líneas superpuestas y muestra alternativas como rango (el hallazgo de combineImpacts se documenta aparte). | Alta | La venta acumulada está por debajo de la meta; el cierre proyectado no la alcanzaría. Lectura sustentada en datos completos. | 3 de 6 / 3 de 5 | Evaluar las alternativas de recuperación; Revisar el pronóstico de cierre | sumar brecha + canal; sumar alternativas de recuperación; mezclar observado con proyectado | Cómo agregar riesgos y oportunidades en un total (netear o no) — ver DIAGNOSTICO_COMBINEIMPACTS.md. |
| E15 | señales sin evidencia / hipótesis sin confirmación | Un driver es solo una hipótesis (sin confirmar). | La hipótesis se presenta aparte, con su cómo validarla; nunca como causa ni dentro del total. | Alta | La venta acumulada está por debajo de la meta; el cierre proyectado no la alcanzaría. Lectura sustentada en datos completos. | 3 de 6 / 3 de 5 | Evaluar las alternativas de recuperación; Revisar el pronóstico de cierre | “la causa es …”; incluir la hipótesis en el total | — |
| E16 | recomendaciones no ejecutables y oportunidades sin impacto cuantificable | Se requiere un dato que falta (p. ej. margen o plan) para ejecutar una acción; la oportunidad no tiene importe. | La acción que requiere un dato faltante no se ofrece como ejecutable: se retiene (Z4 «datos primero»); la oportunidad sin importe se dice «no cuantificable», no $0. | Insuficiente · sin_plan | Hay venta registrada, pero sin plan del periodo no es posible valorar el cumplimiento. | 1 de 1 / 1 de 1 | Revisar los avisos de calidad de la carga | ofrecer una acción que no puede ejecutarse; poner $0 como impacto | — |

## Comprobaciones por escenario

**E01 — ventas > 0 y pedidos = 0**
- no hay conversión 0 % como conclusión
- la capa de datos lo señala o la confiabilidad no es Alta sin explicación

**E02 — pedidos > 0 y ventas = 0**
- Z1 no emite el veredicto de brecha como definitivo
- sin contradicción entre capas

**E03 — sesiones = 0**
- sin conversión calculada ni afirmada
- sin contradicción entre capas

**E04 — sesiones faltantes**
- no se presenta 0 sesiones
- existe un elemento de datos que pide completar

**E05 — conversiones no verificables**
- no afirma crecimiento comparable
- sin contradicción entre capas

**E06 — CR / AOV no disponible**
- Z3 lo dice (actividad no disponible)
- no hay números de CR/ticket inventados

**E07 — datos incompletos**
- confiabilidad no es Alta
- sin contradicción entre capas

**E08 — diferencias entre fuentes**
- no declara una fuente ganadora
- sin contradicción entre capas

**E09 — actividad sin productor**
- no hay hallazgo de canal cuando no hay base para atribuirlo
- sin contradicción entre capas

**E10 — ausencia de actividad (cero verificado)**
- Z1 declara sin actividad verificada o lectura limitada
- sin contradicción entre capas

**E11 — margen no configurado**
- Z1 no muestra contribución
- sin contradicción entre capas

**E12 — margen = 0 %**
- no hay contribución positiva
- sin contradicción entre capas

**E13 — margen negativo**
- no muestra contribución con margen negativo
- sin contradicción entre capas

**E14 — impactos positivos, negativos y superpuestos**
- Z3 no presenta total de líneas superpuestas
- sin contradicción entre capas

**E15 — señales sin evidencia / hipótesis sin confirmación**
- no hay lenguaje causal sobre hipótesis
- sin contradicción entre capas

**E16 — recomendaciones no ejecutables y oportunidades sin impacto cuantificable**
- Z4 ofrece primero el dato y no acciones de negocio sin respaldo
- sin contradicción entre capas

## Defectos encontrados y corregidos con esta matriz

- **C17 (corregido y probado):** la derivación Z3 ofrecía «Recuperar elevando la conversión» y «La conversión explica la mayor parte de la variación» aunque Z1 declaraba la conversión no verificable (sesiones o pedidos faltantes, venta con cero pedidos, pedidos sin sesiones). Ahora esos elementos solo se derivan con conversión verificable y el detector de coherencia tiene la regla C17.
- **Observación sobre Z1 (aceptado; no se modifica):** con sesiones faltantes y el resto completo, Z1 mantiene confiabilidad *Alta* y la frase «datos completos» aunque la conclusión de conversión sea no verificable (resolución C3 de 3.2: confianza por conclusión). Z3 ya lo dice con un elemento de datos; se registra como limitación **L-17** para que el usuario decida si la frase debe matizarse.
