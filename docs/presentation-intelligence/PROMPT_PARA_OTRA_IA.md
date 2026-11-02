# PROMPT PARA OTRA IA — Auditoría independiente de «Presentation Intelligence» en RevNavigator

Pega todo este documento como instrucción a la otra IA. Está escrito para que pueda revisar el trabajo sin haber visto la conversación en la que se construyó.

---

## 1. Tu rol
Eres un auditor técnico independiente (ingeniería de software + análisis comercial). Vas a **revisar, no a construir**. Tu objetivo es encontrar defectos, riesgos y suposiciones falsas en lo que otra IA construyó, y decir con evidencia qué es seguro, qué es dudoso y qué hay que corregir.

Reglas para ti:
- No modifiques archivos, no hagas commits ni PRs, no ejecutes acciones destructivas. Si necesitas ejecutar pruebas, hazlo en una copia.
- No aceptes afirmaciones de este documento como ciertas: **verifícalas** contra el código y las pruebas. Donde digo «verificado» quiero que lo compruebes tú.
- No pegues ni pidas credenciales (Cohere, Supabase). Lo que requiere credenciales está marcado como *no probado*.
- Cada hallazgo debe traer: severidad (crítica/alta/media/baja), evidencia (`archivo:línea` o comando y salida), cómo reproducirlo y recomendación concreta. Si no puedes demostrarlo, márcalo «sospecha».

## 2. El proyecto
**RevNavigator** («digital_sales_forecast_-_pacing», repositorio `appalex47-lab/revnavigator`, rama `main`): herramienta web de pacing y forecast de ventas de canal digital (ecommerce, app, WhatsApp, llamadas). JavaScript vanilla en módulos IIFE sobre `window.FP`, **sin dependencias de build ni de runtime**, se sirve como archivos estáticos. Los motores comerciales (forecast, diagnóstico, escenarios, recuperación) ya existían y **no se tocaron**.

El módulo de presentación genera un **PDF 16:9 horizontal** con `window.print()` (láminas de 1122×630 px, `@page 297mm 167mm`).

## 3. Qué se pidió (prompt maestro «Presentation Intelligence»)
Convertir el generador de reportes en una plataforma con **un generador y tres perfiles de audiencia** (Operativo, Gerencial, Directivo) con distinta narrativa, indicadores, profundidad, secuencia y diseño, más el reporte actual intacto como perfil «legacy».

No negociables: no modificar motores comerciales; no duplicar cálculos; no inventar cifras; estimados etiquetados «Estimado»; el reporte actual debe seguir reproducible; PDF 16:9; sin dependencias nuevas; `reportBuilder.js` (≈960 líneas) no debe crecer; no borrar pruebas que fallan; no ocultar errores de datos con valores por defecto; documentar limitaciones. Directivo no debe inventar la contribución del digital sobre la venta total de la empresa; sin margen/ROI/ROAS/CAC sin datos.

Se trabajó por fases con autorización de la persona antes de cada una.

## 4. Qué se construyó (por fase)
| Fase | Resultado | Archivos principales |
|---|---|---|
| 0 | Líneas base («golden») del reporte actual | `tools/regression/data/report_golden.json`, `report_builder_golden.json`, `tools/test-report-golden.js`, `batch_report_golden.py` |
| 1 | Perfiles declarativos, compositor determinista, modelo de contenido, catálogo | `js/report/profiles.js`, `composer.js`, `contentModel.js`, `catalog.js` |
| 2 | Pantalla de configuración (audiencia, tipo, profundidad) y propuesta de láminas con casillas | `js/ui/report-setup-view.js`, edits en `js/ui/report-view.js`, `js/app.js` |
| 3 | **Operativo**: pacing por canal, evolución, acciones y embudo de fichas GA4 | `js/report/operativo.js`, `blocks.js`, `js/ui/report-operativo-view.js` |
| 4 | **Gerencial**: cumplimiento por canal con semáforo (símbolo + palabra) | `js/report/gerencial.js`, `js/ui/report-gerencial-view.js` |
| 5 | Oportunidades priorizadas (brecha observada + acciones estimadas) y aviso de supuestos | `js/report/oportunidades.js`, `js/ui/report-oportunidades-view.js` |
| 6 | **Directivo** (veredicto, riesgo y oportunidad) y perfil «estricto» | `js/report/directivo.js`, `js/ui/report-directivo-view.js` |
| 7 | Preferencias persistentes y sincronizadas, editor de lámina, hipótesis de IA opcionales | `js/report/presentationPrefs.js`, `presentationAI.js` |
| 8 | Escenarios de recuperación y anexos «Reglas y umbrales» y «Ediciones e IA» | `js/report/escenarios.js`, `js/ui/report-escenarios-view.js` |
| Endurecimiento | Corrección de riesgos, pruebas de integridad y contraste, preferencias sincronizadas, tres pruebas desactualizadas adaptadas | `tools/test-report-integrity.js` y otros |
| Extras | Sugerencia de umbrales según el historial (automática); voz propia por formato | `js/forecast/thresholdAdvisor.js`, `js/ui/threshold-view.js`, `js/report/voice.js` |
| 9 | Pruebas integrales: 48 combinaciones de formato × profundidad × {mes, Q3, año, canal} | `tools/regression/integral_common.py`, `batch_integral_*.py` |

Documentación por fase: `docs/presentation-intelligence/FASE_*.md` y `REGISTRO_DE_RIESGOS.md` (léelo completo).

## 5. Arquitectura (léela antes de revisar)
```
motores (forecast, diagnóstico, escenarios, recuperación)  ← NO modificados
  → app.js buildExecutiveReport(src) → FP.reportBuilder.build(src)   [páginas del reporte actual]
  → FP.reportBlocks.extend(report, src, perfil)                      [páginas nuevas del formato elegido]
  → FP.reportComposer.compose(report, {perfil, profundidad, exclude, include, edits}) → plan de láminas
  → FP.reportView (BODY/EXT por id de página; títulos: edición de la persona > voz del formato > reportCopy > neutro)
  → mountPrint / window.print()  (PDF 16:9)
```
Ideas clave:
- **Perfil** = declaración (slots con tipo y profundidad mínima, anexos, defaultExclude, bandera `strict`). `strict:true` (Directivo) excluye páginas del reporte que el perfil no lista.
- **Bloques** (`blocks.js`): registro de constructores de páginas nuevas. `extend` solo agrega los que el perfil pide; con el perfil legacy devuelve el reporte sin tocarlo. Las páginas con `needs:'edits'` no cuentan en el total; el compositor decide si entran.
- **Cifras**: las páginas nuevas leen bloques ya calculados (`toDate`, `expectedImpact`, etc.). Lo único calculado es sumar días contados, cociente de participación y orden.
- **Persistencia**: `reportPrefs` (selección, umbrales, ediciones) en `localStorage` vía `storage.save`, se sincroniza con el equipo; se borra al cerrar sesión; `thresholdSuggestion` es local y derivada.

## 6. Cómo ejecutar las pruebas
```bash
node tools/test-*.js            # cada archivo imprime ✔/✘ y «TODO OK»; ~1000 comprobaciones
node tools/selftest-node.js     # motor: 233/233
python3 tools/regression/lint_design.py   # línea base: 193 hallazgos (no es 0)
python3 tools/regression/batch_<nombre>.py <raíz del repo>   # pruebas en navegador (Playwright + Chromium)
# regresión completa: los 174 batch_*.py (se corrieron 5 en paralelo; ~25 min)
```
Estado al cierre: pruebas de Node todas OK; selftest 233/233; lint 193 (igual que la línea base); regresión completa sin fallos (170 batches en la última corrida completa; después se agregaron los 4 batches integrales, que pasan por separado).

Cómo se validó que las pruebas sirven: se hicieron **mutaciones** (romper una regla a propósito y ver que la prueba falla). Revisa si te convence; busca pruebas triviales (siempre verdaderas) — ya se encontraron y retiraron varias durante el desarrollo.

## 7. Riesgos conocidos (estado honesto)
Leyenda: **Cerrado** (corregido con prueba) · **Mitigado** (reducido, el riesgo de fondo sigue) · **Abierto**.

### Cifras y honestidad de los datos
1. **Venta ≠ utilidad.** No hay costos, márgenes, inversión ni atribución; no se calcula margen, ROI, ROAS ni CAC. Las columnas dicen «Impacto simulado (venta)». *Mitigado.* Un lector puede leer «+$1.09M» como ganancia.
2. **El impacto simulado puede superar la brecha** (en el ejemplo, +$1.09M frente a $13.1K). Aviso «Revisa los supuestos» (>100 %) y «Supera la brecha» (>1000 %). Sigue siendo un escenario. *Mitigado.*
3. **La suma de brechas por canal ≠ brecha del total digital** (los canales sobre el plan no restan). Se muestran ambas. *Mitigado.*
4. **Directivo habla del canal digital, no de la empresa** (no hay venta total de la empresa). La portada lo dice. *Cerrado.*
5. **Cierre estimado** depende del método y su confiabilidad; el veredicto la muestra si el reporte ya la calculó. *Mitigado.*
6. **Embudo GA4**: es por producto, no por canal; «compras» son artículos, no pedidos. Probado con venta y embudo generados que entran por el importador real, **no con un archivo GA4 real**. *Mitigado.*

### Decisiones de negocio
7. **Umbrales provisionales** (0.5 %/1 % Operativo; 1 %/5 % semáforo). Editables. Existe una **sugerencia según el historial** (percentiles 75 y 90 de la desviación semanal, ≥ 8 semanas completas; no inventa sin historia; se recalcula sola al llegar datos y una vez al día; nunca se aplica sola). **Abierto:** el criterio estadístico no está validado por el negocio; no distingue semanas de campaña. Los datos de ejemplo tienen 4 semanas (insuficiente).
8. **Aplicar la sugerencia de Pacing cambia los semáforos de Pacing e Inicio** para todo el equipo (los ajustes se sincronizan). *Abierto por diseño.*

### Narrativa
9. **Textos reutilizados** conservan el titular del reporte actual salvo las láminas con «voz» propia (Resumen, Pacing, Factores y Quién suma y resta en Gerencial y Directivo; plantillas sobre campos de la página). El anexo «Reglas y umbrales» lista qué titulares salieron con voz propia y cuáles no; una prueba sobre 89 reportes reales exige que no haya caídas silenciosas ni números inexistentes ni lenguaje causal. *Mitigado.* **Abierto:** Operativo y el resto de láminas.

### IA opcional (hipótesis)
10. **Apagada por defecto**, permiso por sesión, solo al pulsar el botón; envía solo el texto y cifras de esa lámina; se registra en `FP.aiAudit`. Validación local: 1–3 hipótesis, ≤ 220 caracteres, lenguaje de posibilidad obligatorio, sin lenguaje causal, sin margen/ROI/ROAS/CAC, **solo cifras que la IA recibió** (tolerancia 0.5 %), sin nombrar canales que la lámina no menciona. **Abierto:** probado solo con un cliente simulado (no con Cohere real); no detecta afirmaciones falsas sin números; lo enviado no se puede retirar.

### Persistencia y privacidad
11. `reportPrefs` se **sincroniza con el equipo** (última escritura gana, sin fusión) y las ediciones de texto viajan con ella. Al cerrar sesión se borra de ese navegador (probado con un Supabase **simulado**; la copia de la nube se conserva). **Abierto:** no probado contra el servicio real. Botón «Borrar mis ediciones y preferencias» guarda el estado vacío para que el borrado también se sincronice.
12. Texto de la persona se escapa (probado con `<b>` e `<img onerror>`).

### Arquitectura y compatibilidad
13. **Cambios al reporte actual aprobados:** D1 («Al corte del null» corregido); ya no repite el periodo arriba a la derecha si el subtítulo lo trae (solo cambió Clientes). Cada cambio exigió reescribir las líneas base con una diferencia identificada.
14. **Acoplamiento:** Gerencial depende de Operativo; Directivo de Operativo, Oportunidades, Gerencial y Escenarios. `test-report-integrity.js` verifica el orden de scripts de `index.html`, que todos los módulos estén cargados, que los perfiles no estrictos listen todas las páginas del armador, que Directivo decida cada página nueva y que las clases CSS nuevas no pisen las anteriores; y el contraste AA de los colores de estado. *Cerrado.*
15. **Contrato interno compartido** modificado en Fase 8: `blocks.extend` entrega el perfil a los constructores y excluye del total las páginas `needs`. Probado; si falla afecta a todos los formatos. *Mitigado.*
16. **Cabida:** ediciones largas pueden desbordar láminas densas; la pantalla avisa cuál (probado forzando el desborde). *Cerrado* (aviso), no hay recorte automático.

### Pruebas y proceso
17. Se adaptaron 3 pruebas desactualizadas por rediseños de pantalla (`batch_dias_excluidos` X3, `batch_evolucion_filtro`, `batch_movil` M-11): **verifica que lo que comprueban sigue siendo equivalente** (las aserciones de motor no se tocaron; cambiaron selectores y la forma de abrir el dato).
18. `batch_drill` y `batch_restaurar_carga` esperaban tiempos fijos; ahora esperan la condición.
19. **Las pruebas integrales usan datos de ejemplo** y un solo escenario guardado. El filtro «nada inventado» excluye enteros de 1 a 19 y tolera 0.6 %: no detecta un entero pequeño inventado. **Abierto.**
20. No medidos: accesibilidad con lector de pantalla, rendimiento con volúmenes grandes (generar Gerencial·Detallado tarda ≈ 7 s con datos de ejemplo), celular con todos los paneles.
21. Lint de diseño en 193 hallazgos (vistas antiguas, ajenas al reporte).

### Fuera de alcance / pendiente
- **PPTX**: se planeó (imagen por lámina, nativo o híbrido) y está en espera; los formatos nuevos solo salen en PDF.
- Higiene del repositorio: ramas viejas por borrar, 8 PRs de Jules obsoletos, activar borrado automático de ramas.

## 8. Qué quiero que revises (en este orden)
1. **Cifras inventadas o inconsistentes.** Busca cualquier número que una lámina nueva muestre y que no salga de un campo calculado. Revisa `js/report/operativo.js`, `gerencial.js`, `oportunidades.js`, `directivo.js`, `escenarios.js`, `voice.js` y sus vistas. ¿Hay fórmulas nuevas escondidas (cocientes, sumas) que deberían venir de un motor?
2. **Unidades.** `recoveryPercent` (fracción de la brecha), conversión en pp frente a %, pct vs fracción en umbrales (`0.005` = 0.5 %). Busca confusiones.
3. **Estados vacíos y datos ausentes.** ¿Algún `null` se vuelve 0 o texto «null»? ¿Algún promedio sobre vacío? ¿Algún caso que lance en lugar de omitir con motivo?
4. **Reporte actual intacto.** Comprueba que con el perfil legacy el resultado es idéntico a las líneas base (`node tools/test-report-golden.js`, `batch_report_golden.py`) y que los cambios aprobados (D1, fecha única) son los únicos.
5. **Seguridad y privacidad.** XSS (todo texto que sale a HTML pasa por `esc`), qué se envía a Cohere, qué se guarda y sincroniza (`reportPrefs`), qué se borra al cerrar sesión (`wipeLocalData`, `SIGNOUT_KEEP`), escrituras tardías (`storage.save` con `wiping`).
6. **Validación de IA.** Intenta romper `js/report/presentationAI.js` con hipótesis que pasen la validación pero engañen (cifras con otro formato, causalidad disfrazada, nombres de productos, «podría» seguido de una afirmación).
7. **Sugerencia de umbrales.** `js/forecast/thresholdAdvisor.js`: ¿los percentiles y el redondeo producen valores razonables con series pequeñas, con ceros, con semanas atípicas? ¿Puede aplicarse algo sin que la persona lo decida? ¿El «tick» puede recalcular de más o escribir tras cerrar sesión?
8. **Compositor y perfiles.** Casos borde: página repetida, perfil estricto con página nueva, `include`/`exclude` contradictorios, profundidad inexistente, edición de portada/anexo, preferencias guardadas de una versión anterior.
9. **Pruebas.** ¿Hay aserciones triviales (`|| true`, comparaciones tautológicas)? ¿Qué mutaciones sobreviven? ¿Qué rutas no están cubiertas (filtro de producto, semana, varios escenarios, acciones sin canal)?
10. **Geometría del PDF.** ¿Qué combinación real podría desbordar 1122×630 que las pruebas no cubren (nombres largos de canal/acción, muchos canales, 5 escenarios con advertencias largas)?
11. **Narrativa.** ¿Algún titular con voz propia puede afirmar algo que la lámina no sostiene (p. ej. «canales en meta» con umbrales cambiados, «va a la par» con compliance cercano al borde)?
12. **Cosas que nadie preguntó.** Lo que no esté en esta lista y te preocupe.

## 9. Formato de tu respuesta
1. **Resumen ejecutivo** (máx. 10 líneas): ¿se puede confiar en este módulo para presentar cifras a dirección? ¿bajo qué condiciones?
2. **Hallazgos** en una tabla: `#`, severidad, categoría, evidencia, reproducción, recomendación, confianza (alta/media/sospecha).
3. **Riesgos de este documento que consideras mal clasificados** (p. ej. algo que figura «cerrado» y no lo está).
4. **Lo que no pudiste verificar** y por qué.
5. **Las 5 correcciones que harías primero**, en orden.

No resumas el código; evalúalo. Si algo es correcto, dilo en una línea y sigue.
