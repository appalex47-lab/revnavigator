# Auditoría final de aceptación — Subfase 3.2 · Z1 Resumen ejecutivo
## Resolución final de los criterios C1 a C5

Este informe sustituye al dictamen anterior («aprobada con condiciones»). Las cinco condiciones eran los criterios C1 a C5, que el usuario ya decidió; aquí se documenta cómo se implementaron, con qué evidencia y qué queda pendiente. No se modificó código funcional, ni documentos aceptados, ni las decisiones D-01 a D-06. No se inició la subfase 3.3.

**Tipos de evidencia usados:** *Verificado* (lo comprobé yo leyendo o ejecutando), *Reportado* (lo afirma una prueba automatizada que ejecuté), *Documentado* (escrito, no se ejecuta), *Pendiente* (requiere datos reales, usuarios o una revisión independiente).

---

## A. Resumen ejecutivo

**Qué se corrigió.** Dos de mis criterios de la auditoría anterior eran reglas arbitrarias y se retiraron: la invalidación automática de pedidos y venta que no cuadran (C1) y la tolerancia del 1 % (C2). Otro se precisó: una medida ausente ya no baja por sí sola la confiabilidad (C3). Y las reglas de margen se anclaron al contrato real del motor en lugar de a un rango escrito por mí (C4, C5).

**Qué se decidió para C1 a C5** (decisiones del usuario, implementadas sin sustituirlas):
- **C1.** Pedidos y venta que no cuadran **no invalidan el dato**: quedan como «dato inconsistente, pendiente de interpretación», con las cifras visibles.
- **C2.** **Sin tolerancia de conciliación.** Cualquier diferencia queda pendiente; la igualdad no se declara «conciliada».
- **C3.** **Confiabilidad por conclusión:** un dato faltante solo afecta a la conclusión que lo necesita.
- **C4.** «Margen no válido» es **exactamente lo que rechaza la validación del motor**; Z1 no define rangos.
- **C5.** Tres situaciones distintas: margen vacío, 0 % explícito (válido, $0 estimado) y 0 % sin evidencia de configuración (sin importe).

**Qué quedó pendiente.** Las seis limitaciones de la sección F siguen abiertas; en particular, **no hay ninguna validación con datos reales de FESA** y la regla de conciliación de C2 queda sin definir porque no existe evidencia para definirla.

**Dictamen técnico propuesto: APROBADA CON LIMITACIONES DOCUMENTADAS.** Es una recomendación; la aceptación formal corresponde exclusivamente al usuario.

---

## B. Matriz de resolución

Antes de editar inspeccioné el contrato real del motor (solo lectura). Lo que encontré decide cada criterio:

| Criterio | Decisión | Implementación en la especificación de Z1 | Evidencia | Estado |
|---|---|---|---|---|
| **C1** | No invalidar automáticamente | Pedidos con venta cero, venta con cero pedidos, pedidos sin sesiones y más pedidos que sesiones son **dato inconsistente**: cifras visibles, aviso a la vista, confiabilidad no puede ser Alta, sin conclusión comercial y nunca «conversión cero» con venta positiva. Cuatro clases que no se confunden: **válido, inconsistente, no verificable, no calculable**. «No calculable» queda solo para valores negativos. | *Contrato (Verificado):* `js/quality/validation.js` marca estas combinaciones como `MATHEMATICAL_INCONSISTENCY` y `rules.js` les da acción «flag» («no se excluye nada»); solo los negativos van a cuarentena y «no se suman»; en WhatsApp y Llamadas el volumen son contactos, no sesiones. *Pruebas (Reportado):* A8, A13; I47–I52; M14, M17; 4 mutaciones. | **Resuelto** |
| **C2** | No usar 1 % arbitrario | Sin tolerancia (`tolerance: null`). Diferencia mayor que un centavo → conciliación **pendiente** y aviso; sin diferencia → «sin diferencia observada», nunca «conciliada». La brecha siempre sale de la venta del periodo. | *Contrato (Verificado):* no existe tolerancia documentada; el agregado de actividad no tiene productor y `config.tolerances` aplica a CR y AOV cargados contra calculados. *Pruebas (Reportado):* A14 (diferencia de 0.4 %, inferior al 1 % retirado); I53, I54; M18, M19; 2 mutaciones. | **Resuelto en la especificación; la regla de negocio queda pendiente de definición con datos reales** |
| **C3** | Confiabilidad contextual | Cada conclusión (venta observada, cumplimiento, evolución, conversión, contribución) tiene su propio estado. Con venta positiva, sesiones o pedidos sin medir dejan la conversión «no verificable» (visible en el alcance) sin tocar la confiabilidad del cumplimiento. Con venta cero falta información secundaria relevante → Baja. Sin evidencia de actividad → Insuficiente. | *Contrato (Verificado):* `rules.js`, «Celda vacía: no se trata como cero». *Pruebas (Reportado):* A7, A15, A6; I55–I57; M12, M16; 3 mutaciones. | **Resuelto** |
| **C4** | Validación según definición real | Z1 delega en `validateMarginInput` y muestra su motivo; se eliminó el rango que había escrito yo en el texto visible. Vacío o nulo → «no configurado»; guardado y apagado → «desactivado»; rechazado por el motor → «Margen no válido · Revisar». | *Contrato (Verificado):* `js/economics/impactModel.js` define **margen bruto sobre venta** = (venta − costo) ÷ venta, en %, 0 ≤ m < 100; rechaza negativos y ≥ 100 (que trata como probable markup). Es el contrato aceptado en Fase 2. *Pruebas (Reportado):* A11; I43, I58; M15, M20; 1 mutación. | **Resuelto.** Si finanzas necesita un margen bruto negativo, es una decisión de 4.5 sobre el contrato de Fase 2; Z1 no la toma. |
| **C5** | Distinguir cero explícito | 0 % explícito = activado y con fecha de configuración → válido, contribución estimada de $0, declarada como estimación que no indica un margen real de 0 %. 0 % sin esa evidencia → «Margen sin confirmar · Revisar», sin importe. Vacío → «no configurado». Siempre sobre una brecha válida. | *Contrato (Verificado):* `buildSetting` deja `marginEnabled`, `updatedAt` y `source` al configurar; el valor predeterminado (`DEFAULT_SETTING`) es nulo, no 0. *Pruebas (Reportado):* A12, A16; I59–I61; M21; 2 mutaciones. | **Resuelto** |

**Ningún criterio requirió modificar código funcional.** No hubo bloqueo.

**Decisiones de implementación que conviene que conozcas** (no cambian C1–C5, pero las elegí yo al implementarlas):
1. Una inconsistencia pendiente o una conciliación pendiente **impiden la confiabilidad Alta** (tope Media). Es una regla cualitativa, sin umbral numérico, coherente con «avisos → Media».
2. La conciliación compara con precisión de **un centavo**: es la unidad mínima de la moneda, no una tolerancia de negocio.
3. Para un margen distinto de cero sin fecha de configuración, la contribución se estima y se declara «sin fecha de actualización»; solo el 0 % exige evidencia, porque el valor predeterminado del motor es nulo y un valor no nulo ya demuestra una captura.

---

## C. Archivos modificados en esta ejecución

| Ruta | Motivo | Criterio | Tipo de cambio |
|---|---|---|---|
| `tools/audit/z1-lectura-ejecutiva.js` | Reglas de clasificación, conciliación, conclusiones y margen | C1–C5 | Especificación ejecutable |
| `tools/audit/z1-escenarios.js` | A7 y A8 reformulados; A13–A16 nuevos | C1, C2, C3, C5 | Matriz de escenarios |
| `tools/test-fase3-2-z1.js` | 15 invariantes, 6 propiedades y 11 mutaciones nuevas; 2 mutaciones obsoletas retiradas | C1–C5 | Pruebas de especificación |
| `tools/audit/z1-generar-artefactos.js` | Filas de clasificación y conclusiones; textos de margen | C1–C5 | Generador documental |
| `tools/audit/verificar_consistencia_3_2.py` | Oráculo en Python actualizado; comprobación de veredictos por escenario | C1–C5 | Verificador documental |
| `tools/audit/probar_verificador_3_2.py` | 10 mutaciones nuevas del verificador | C1–C5 | Pruebas del verificador |
| `tools/regression/batch_fase3_2_z1_wireframe.py`, `capturas_fase3_2.py` | Contadores (30 escenarios, 29 requisitos, 38 capturas) | Derivado | Verificación visual |
| `docs/command-center/FASE_3_2_RESUMEN_EJECUTIVO.md` | Tabla de resolución C1–C5, pasos 2 y 4, limitaciones | C1–C5 | Documento de Z1 |
| `docs/command-center/generated/MATRIZ_TRAZABILIDAD_Z1.json` (y su `.md`) | Z1-12, Z1-27, Z1-28 actualizados; Z1-29 nuevo | C1–C5 | Trazabilidad |
| `docs/command-center/ESTADO.md` | Registro de la resolución; 3.2 sigue no aceptada | Todos | Estado del proyecto |
| `FASE_3_2_ESCENARIOS_Z1.md`, `generated/ESCENARIOS_Z1.json`, `wireframes/z1_3_2_wireframe.html`, capturas | Regenerados desde la especificación | Derivado | Artefactos generados |
| `docs/command-center/AUDITORIA_FINAL_ACEPTACION_3_2_Z1.md` | Este informe | Todos | Informe |

No se modificó `index.html`, `js/`, `css/`, el motor de cálculo, integraciones, persistencia ni ningún documento aceptado.

---

## D. Resultados de pruebas (ejecutadas por mí)

| Prueba | Tipo | Resultado | Total | Fallidas |
|---|---|---|---|---|
| `node tools/test-fase3-2-z1.js` | Lógica, matemática y especificación, con datos simulados | Aprobada | 91 | 0 |
| `python3 tools/audit/verificar_consistencia_3_2.py` | Consistencia documental con oráculo independiente | Aprobada | 41 | 0 |
| `python3 tools/audit/probar_verificador_3_2.py` | Mutaciones del verificador | Aprobada | 46 | 0 |
| `python3 tools/audit/verificar_consistencia_3_1.py` | Consistencia documental y roadmap | Aprobada | 36 | 0 |
| `python3 tools/audit/probar_verificador_3_1.py` | Casos negativos del verificador | Aprobada | 26 | 0 |
| `batch_fase3_2_z1_wireframe.py` | Visual y de navegador (Chromium emulado) e integración con rutas reales | Aprobada | 48 | 0 |
| `batch_fase3_1_home_auditoria.py` | Navegador, regresión | Aprobada | 58 | 0 |
| `batch_fase2_margen.py` / `batch_fase2_modelo_real.py` | Integración con datos de demostración | Aprobadas | 26 / 25 | 0 |
| `batch_home_summary.py` | Navegador, regresión | Aprobada | — | 0 |
| `tools/test-*.js` (98 archivos) | Lógica y matemática | Aprobadas | 98 archivos | 0 |
| `node tools/selftest-node.js` | Matemática del motor | Aprobada | 233 | 0 |
| `lint_design.py` | Estática | 193 hallazgos, igual a la línea base | — | — |

**Qué contiene la prueba de Z1:** 30 escenarios; 61 invariantes sobre 4 000 entradas aleatorias; 21 propiedades sobre 1 500; 15 ejemplos incorrectos; **38 mutaciones de la especificación, 38 detectadas y 0 sobreviven**. Incluye casos negativos, límites, nulos, ceros explícitos y combinaciones inconsistentes.

**Incidencias durante la ejecución (no ocultadas):**
- Las entradas aleatorias encontraron un caso que yo no había previsto: la comparación reporta «conversión cero» pero hay venta positiva. Lo traté como inconsistencia pendiente (C1).
- Dos casos del probador del verificador dejaron de detectar su mutación (uno porque un veredicto aparecía dos veces en el documento; otro porque cambió el texto de `ESTADO.md`). Reforcé el verificador para comparar los veredictos por escenario y corregí el caso.

**Limitaciones de estas pruebas:**
- **Ninguna usa datos reales de FESA.** Todo es lógica, matemática, especificación o datos simulados; solo el escenario 2 y los lotes de Fase 2 usan datos de demostración del motor.
- No se repitió la regresión completa de 181 baterías porque no cambió ningún archivo de la aplicación (comprobado por hash).
- Sin pruebas en dispositivo móvil real, con usuarios ni con lector de pantalla.

---

## E. Integridad

**Línea base de esta ejecución (registrada antes de editar):** rama `ccr-a81af632-rirtu7`, commit `a2b38630bb9c0183b920e619567b950953eba31e`; 41 entradas en `git status --short` (24 modificados, 17 sin seguimiento); 112 archivos con `-uall`, todos con su hash guardado.

| Comparación | Resultado |
|---|---|
| 13 documentos aceptados | **13 de 13 con el mismo hash** |
| 249 archivos funcionales protegidos | **249 de 249 con el mismo hash** |
| `git status --short` al final | **Idéntico** a la línea base (41 entradas) |
| Archivos presentes al inicio que cambiaron | 26: los de la tabla C, más 10 capturas regeneradas porque cambió el contenido de sus escenarios |
| Archivos nuevos | 4 capturas (A13 a A16), dentro de un directorio que ya estaba sin seguimiento |
| Rama, commit, stash | Sin cambios |

Todas las diferencias corresponden a archivos de Z1 dentro del alcance autorizado.

---

## F. Limitaciones y riesgos

**Las seis limitaciones permanecen abiertas; el cierre documental de C1–C5 no resuelve ninguna:**
1. **No se ha realizado validación con datos reales de FESA.**
2. **El agregado de actividad no tiene todavía un productor conectado en la aplicación** (requisito Z1-28).
3. **La diferencia entre el motor (`sin_trafico_actual`, que trata como caída de volumen) y la lectura de Z1 debe reconciliarse en 4.1 y 4.2.**
4. **El motor dispone de margen promedio general, no de margen real por canal, producto o pedido.**
5. **La contribución es una estimación sobre la brecha contra el plan**, nunca un margen o una contribución real observada.
6. **La especificación y varios verificadores se desarrollaron en la misma sesión;** se requiere una revisión independiente posterior.

**Pendientes derivados de C1–C5 (necesitan evidencia que hoy no existe):**
- **C2:** qué diferencia entre las dos ventas es aceptable. Falta conocer el origen, el universo de pedidos y los filtros del agregado de actividad, que aún no existe.
- **C1:** cómo interpretar comercialmente pedidos sin importe o venta sin pedidos. Requiere datos reales y criterio del negocio.
- **C4:** si debe admitirse un margen bruto negativo. Requiere decisión de finanzas sobre el contrato de Fase 2.

**Riesgos:** los nombres visibles pueden no coincidir con el vocabulario de los usuarios (se valida en 3.5); el tope Media por inconsistencia pendiente puede resultar frecuente con datos reales si las fuentes atribuyen pedidos y sesiones a días distintos.

---

## G. Dictamen

**APROBADA CON LIMITACIONES DOCUMENTADAS** (recomendación técnica).

- No uso «APROBADA» porque las limitaciones 1, 2 y 6 impiden afirmar que Z1 funciona con datos reales, y la regla de conciliación de C2 queda sin definir.
- No es «NO APROBADA» porque los cinco criterios tienen resolución documentada y probada, la especificación, los escenarios, las pruebas y el documento son consistentes entre sí, y la integridad está comprobada.

**La aceptación formal corresponde exclusivamente al usuario.** La subfase actual sigue siendo 3.2. No se inició 3.3 ni se adelantó trabajo de las Fases 4 o 5.

**Control de Git:** no hice commit, push, merge, creación o cambio de rama, eliminación de ramas, cierre de pull requests, cambios de configuración en GitHub ni despliegues.

---

## Anexo — Hallazgos de la auditoría anterior (se mantienen corregidos)
H1 falta de dato tratada como «sin actividad» · H2 un cero medido descrito como «Hay venta registrada» · H4 lectura definitiva con información incompleta (reformulado ahora por C3) · H5 aviso de conversión cero que insinuaba una causa · H6 conversión cero con errores de datos que perdía el hecho observado · H7 margen no válido mostrado como «no configurado» (reformulado ahora por C4) · H8 precisión y declaración de la contribución · H11 separación entre prueba lógica y validación real. **H3 (invalidación de pedidos y venta que no cuadran) quedó revertido por la decisión C1.**

## Roadmap consolidado
| Fase | Subfase | Estado |
|---|---|---|
| Fase 1 | 1.1–1.5 | Aceptada con limitaciones documentadas |
| Fase 2 | 2.1–2.5 | Aceptada |
| Fase 3 | 3.1 | Aceptada con limitaciones documentadas |
| Fase 3 | 3.2 Z1 | Criterios C1–C5 resueltos; dictamen técnico «aprobada con limitaciones documentadas»; **pendiente de aceptación formal** |
| Fase 3 | 3.3 Hallazgos, riesgos y oportunidades | No iniciada |
| Fase 3 | 3.4 Prioridades y recomendaciones | No iniciada |
| Fase 3 | 3.5 Prototipo y validación UX | No iniciada |
| Fase 4 | 4.1–4.5 | No iniciada |
| Fase 5 | 5.1–5.5 | No iniciada |
| Fase 6 | 6.1–6.5 | No iniciada |
