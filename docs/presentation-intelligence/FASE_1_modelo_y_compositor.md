# Presentation Intelligence · Fase 1 — Modelo de contenido, contratos y compositor

Estado: terminada y verificada. Rama `ccr-a81af632-rirtu7`. Sigue la Fase 0 (`FASE_0_linea_base.md`).

## 1. Arquitectura implementada

Tres módulos independientes (ninguno calcula cifras ni redacta texto de negocio) y un único punto de integración en la vista:

```
FP.reportBuilder  (sin cambios, 964 líneas)   ← única fuente de cifras: páginas con KPIs, sellos y motivos de omisión
        │ report.pages
        ├─► FP.reportContent (contentModel.js)   describe · findings · numbersOf · validate   (lee el reporte; contrato de integridad)
        └─► FP.reportComposer (composer.js) ◄── FP.reportProfiles (profiles.js)  (perfil declarativo; hoy solo «legacy»)
                  │ plan de la presentación (láminas, orden, tipo, motivos, anexos, limitaciones)
                  ▼
        FP.reportView.units() delega en el compositor → mismo renderizado y mismo PDF 16:9 de siempre
```

- **`js/report/profiles.js` — perfiles declarativos.** Contrato `report_profile` 1.0.0 (`id`, `label`, `status enabled|planned`, `audience`, `presentationTypes`, `depths`, `slots[{block,type,embeddedIn?}]`, `annexes[{sub,title}]`, `defaultExclude`). Valida, congela y registra sin sobrescrituras silenciosas (id repetido o inválido lanza). Un perfil `planned` nunca se lista ni se compone. Hoy solo existe **LEGACY** (el reporte actual). Las audiencias nuevas no se habilitaron: ninguna puede generar todavía una presentación coherente.
- **`js/report/composer.js` — compositor determinista.** `compose(report, {profile, exclude})` devuelve el plan `deck_plan` 1.0.0: `slides` (orden, bloque, tipo, título, motivo de inclusión), `excluded` (con tipo `sin-datos`, `en-anexo` o `seleccion-persona` y su motivo), `annex` y `limitations` (avisos que el reporte ya trae: advertencia, confiabilidad, rezago, periodo parcial; no redacta ninguno). No modifica el reporte. Un perfil desconocido o no habilitado lanza un error claro (no cae en LEGACY en silencio). `units()` entrega las láminas en la forma que la vista ya usaba.
- **`js/report/contentModel.js` — modelo de contenido y contrato.** `describe(report)` → `blocks` (disponibilidad, motivo, certezas), `findings` (una conclusión por página y un indicador por KPI, con certeza observado/calculado/estimado, fuentes y cifra tal cual) y `numbers` (registro de todas las cifras citables). `validate(report)` verifica el contrato: estructura, omitidas con motivo y sin contenido, incluidas con listas, fuentes (salvo las derivadas: `closing`), sello en todo KPI numérico, y ausencia de números no finitos o textos con `null/undefined/NaN/Infinity`. Un dato ausente es `null` (el reporte lo muestra «No disponible»), nunca un cero.
- **Integración mínima:** `FP.reportView.units` pasó de ~15 líneas con el orden y los títulos de anexo embebidos a una delegación de 3 líneas. El orden y los títulos viven ahora en el perfil LEGACY (una sola fuente).

## 2. Archivos

**Modificados**
- `js/ui/report-view.js` (−11/+3 líneas de lógica): `units` delega en el compositor.
- `index.html`: 3 etiquetas `<script>` nuevas (tras `reportCopy.js`) y el sello de versión `20261101-0359`.
- `tools/test-report-builder.js`: el registro opcional agrega `RB_REPORTS_OUT` (reportes completos para pruebas); sin cambio de comportamiento.

**Nuevos**
- `js/report/profiles.js` (87 líneas), `js/report/composer.js` (86), `js/report/contentModel.js` (111).
- `tools/test-report-profiles.js`, `tools/test-report-composer.js`, `tools/test-report-content.js` (Node; corren solas en el CI chico).
- `tools/regression/batch_report_composer.py` (navegador).
- Este documento.

**No tocados:** `js/report/reportBuilder.js` (964 líneas, sin cambios), `reportCopy.js`, `brand.js`, `app.js`, `config.js`, `report.css` y todas las carpetas de motores (diff vacío).

## 3. Compatibilidad conseguida

| Criterio de la línea base | Resultado |
|---|---|
| Mismas cifras, fuentes y sellos | Idénticos (`ED-8` 110/110; golden del armador 89/89) |
| Mismas páginas y orden | Idénticos |
| Mismos títulos y textos | Idénticos (golden de navegador: 4 escenarios; golden del armador) |
| Mismos motivos de omisión | Idénticos (el plan cita el motivo del reporte textualmente) |
| Mismos anexos A, B y C | Idénticos |
| Mismo renderizado y PDF | Idéntico (`batch_presentacion` 44/44, `batch_pdf_fidelidad` 5/5) |
| Reporte anterior sigue generándose | Sí: el perfil por omisión es LEGACY |

## 4. Equivalencia con el reporte anterior

1. **Frente a una copia congelada del código anterior** (`FP.reportView.units` en el commit `39e507c`): 89 reportes del armador × 8 selecciones de la persona (por defecto, ninguna, sin pacing, sin resumen/cierre/decisiones, solo anexo fuera, todo fuera, ids inexistentes, indefinida) = **712 combinaciones, 712 idénticas** (láminas, orden, títulos, subanexos, numeración, forma del objeto y la misma página del reporte, no una copia).
2. **Frente al renderizado real:** golden de navegador idéntico en los 4 escenarios; y `batch_report_composer` confirma en esos escenarios que el plan coincide con la vista previa y con lo que el PDF imprime.
3. **Las pruebas detectan diferencias:** se probó con dos mutaciones (ignorar el orden del perfil; cambiar un título de anexo): ambas hicieron fallar la equivalencia y se revirtieron.

## 5. Pruebas ejecutadas

| Prueba | Resultado |
|---|---|
| `tools/selftest-node.js` | 233/233 |
| Todas las `tools/test-*.js` | pasan (incluye 3 nuevas y las de Fase 0) |
| `test-report-profiles` | 26 ✔ / 0 ✘ |
| `test-report-composer` | 15 ✔ / 0 ✘ (equivalencia 712/712, plan, comportamiento declarativo y errores) |
| `test-report-content` | 26 ✔ / 0 ✘ (contrato, hallazgos, disponibilidad y registro de cifras) |
| `batch_report_composer` (nuevo) | 24 ✔ / 0 ✘ |
| `batch_report_golden` | 4 ✔ / 0 ✘ |
| `batch_presentacion` / `batch_pdf_fidelidad` / `batch_branding` / `batch_quarter` | 44 / 5 / 19 / 17 sin fallas |
| `batch_editorial` (desde la raíz) | 110 ok / 0 fallas |
| Regresión completa de navegador (162 baterías) | solo las 4 fallas preexistentes ajenas al módulo (`batch_controles`, `batch_movil`, `batch_dias_excluidos`, `batch_evolucion_filtro`) |

## 6. Hallazgos del código actual (no se corrigieron: cambiarían el reporte y su línea base)

- **D1 · «Al corte del null».** `pageSummary` arma la frase con `R.cutoff` sin pasarla por `clean()`; si una corrida no trae corte, el resumen dice «Al corte del null». El contrato lo detecta (1 de 89 reportes, una prueba con corte nulo). No encontré cómo la app produzca hoy una corrida sin corte (el motor siempre fija uno), por eso lo clasifico como latente. **Solución propuesta:** omitir esa oración cuando no hay corte, como fase aparte con su cambio de línea base explícito.
- **D2 · La casilla «Confiabilidad» no hace nada.** La página `reliability` lleva `annex: true`, por lo que nunca es lámina propia; su contenido va siempre en el Anexo B. Marcar o desmarcar su casilla en «Páginas del reporte» no cambia ninguna lámina (comprobado en navegador). **Solución propuesta (Fase 2):** retirar esa casilla de la lista o explicar que su contenido va en el Anexo B; el plan ya lo describe como `en-anexo`.
- **D3 · El cierre no declara fuentes.** `closing` incluida trae `sources: []` en todos los casos (sintetiza otras páginas). El contrato lo trata como excepción declarada (`DERIVED`), no como violación.

## 7. Límites conocidos

- Las pruebas del armador trabajan con reportes copiados por JSON: no pueden ver `NaN` ni `undefined` (JSON los pierde). Lo cubre `batch_report_composer`, que valida el reporte real en memoria en 4 escenarios, y las pruebas sintéticas de `validate`.
- El render de las láminas de tráfico, campañas y estacionalidad con datos sigue sin golden de navegador (brecha de la Fase 0). Su contenido sí está cubierto por el golden del armador.
- El verificador de «ninguna cifra en un texto fuera del registro» **no** se implementó aún: el registro de cifras existe, pero comparar texto libre con cifras (formatos como «$15.9M» o «99.9 %») es trabajo de la Fase 4 (narrativa por audiencia), donde se necesita.

## 8. Pendientes para continuar (Fase 2 y siguientes)

1. Selector de audiencia, tipo y profundidad, y propuesta de composición en pantalla (Fase 2). Depende de que existan perfiles habilitados: hoy solo LEGACY.
2. Resolver D2 en la lista de páginas.
3. Cerrar la brecha de render de tráfico, campañas y estacionalidad.
4. Decidir si `rp.exclude` por defecto pasa a leerse de `profile.defaultExclude` (hoy coinciden y una prueba lo vigila).
