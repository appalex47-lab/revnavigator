# Presentation Intelligence · Fase 2 — Audiencia, tipo, profundidad y propuesta de composición

Estado: terminada y verificada. Rama `ccr-a81af632-rirtu7`, sobre `main` (`0782fd8`). Continúa `FASE_1_modelo_y_compositor.md`.

## 1. Objetivo

Que la persona elija para quién es la presentación, de qué tipo y con qué profundidad, y vea la **propuesta del compositor** (qué láminas van y por qué, qué no va y por qué, anexos y limitaciones) antes de exportar. Corrige además el hallazgo **D2** (la casilla «Confiabilidad» no tenía efecto).

## 2. Qué se construyó

**Pasos de la pantalla «Presentación (PDF)»**: 1 ¿Para quién es? · 2 ¿Qué tipo de presentación? · 3 ¿Con qué profundidad? · 4 Periodo, canal y filtros (los controles de siempre) · 5 Propuesta de presentación (tras generar la vista previa).

**Qué está habilitado hoy.** Solo lo que un perfil habilitado puede generar: audiencia «Reporte actual», tipo «Desempeño comercial» y las tres profundidades. Operativo, gerencial y directivo, y los otros cinco tipos, se **muestran** como «Próximamente» con su motivo y **no se pueden elegir** (`aria-disabled`; hacer clic no cambia nada). No se habilitó nada que no pueda generar una presentación coherente.

**Catálogo sin banderas propias** (`js/report/catalog.js`): una audiencia o tipo está habilitado si y solo si existe un perfil habilitado que lo sirve. Habilitar un formato nuevo = registrar su perfil; nada se ofrece antes. Un perfil `planned` no habilita nada.

**Profundidad** (declarada en el perfil, no en el código): cada bloque indica desde qué profundidad entra.
- *Resumen*: portada, resumen, cierre y decisiones.
- *Ejecutivo*: suma desempeño contra el plan, factores, quién suma y resta, y recuperación.
- *Detallado*: todo lo que tiene datos, **idéntico al reporte de siempre**.
La profundidad solo **elige entre las mismas páginas**: no cambia su letra ni su contenido (se respeta el tamaño mínimo de letra). La asignación de bloques a profundidades es una **decisión de producto mía**, revisable en `profiles.js`.

**Propuesta (paso 5)**: tabla con número, lámina, tipo y motivo; «No incluidas» con su motivo (sin datos —el del reporte—, dentro del anexo, fuera de la selección, fuera de la profundidad elegida); «Limitaciones detectadas» (las que el reporte ya trae, sin redactar texto nuevo); botón «Restablecer la selección». La portada es obligatoria. Cada lámina tiene casilla para quitarla; lo no incluido por selección o por profundidad tiene casilla para agregarlo.

## 3. Hallazgo D2: resuelto

Antes, la lista «Páginas del reporte» mostraba una casilla «Confiabilidad» que no cambiaba nada (su contenido va siempre dentro del Anexo B). Ahora ese bloque aparece en «No incluidas» como «Dentro del anexo — Su contenido va dentro de «Anexo técnico y calidad»», sin casilla. D1 («Al corte del null») **no se tocó**, por decisión tuya.

## 4. Archivos

**Modificados**
- `js/report/profiles.js` (+37/−…): `depths` como objetos, `defaultDepth`, `depth` y `required` por bloque, `presentationTypes` validados. Solo cambió el perfil nuevo de la Fase 1.
- `js/report/composer.js`: opciones `depth` e `include`; tipo de exclusión `profundidad`; `toggle()` (alternar con la regla de quitar, agregar, obligatoria y sin efecto); esquema `deck_plan` 1.1.0 (campo `depth`). El motivo de lo que va dentro del anexo usa el título del anexo.
- `js/ui/report-view.js`: `units`/`docHtml` reciben la selección; el panel «Páginas del reporte» se sustituye por la propuesta; pasos 1 a 3 insertados.
- `js/app.js`: estado `rp` con `audience`, `type`, `depth`, `include` y 5 acciones (`rp-audience`, `rp-type`, `rp-depth`, `rp-toggle-page`, `rp-reset-selection`); `rp-print` pasa la selección.
- `css/report.css`: estilos de los pasos y de la propuesta con los tokens del sistema de diseño (el lint de diseño sigue en 193 hallazgos, sin nuevos).
- `index.html`: 2 etiquetas `<script>` nuevas y sello de versión.
- Pruebas ampliadas: `tools/test-report-profiles.js`, `tools/test-report-composer.js`.

**Nuevos**: `js/report/catalog.js` (53 líneas), `js/ui/report-setup-view.js` (67), `tools/test-report-catalog.js`, `tools/regression/batch_report_setup.py`, este documento.

**Sin cambios**: `reportBuilder.js` (964 líneas), `reportCopy.js`, `brand.js`, `config.js` y todas las carpetas de motores (diff vacío).

## 5. Compatibilidad

Con la elección inicial (reporte actual · desempeño comercial · detallado) el reporte es **idéntico** al de antes: línea base de navegador (4 escenarios) y del armador (89) sin diferencias, `batch_report_composer` 24/24, equivalencia de láminas con el código anterior 712/712, `batch_presentacion` 44/44, `batch_pdf_fidelidad` 5/5. «Detallado» da exactamente las mismas láminas que no tener profundidad, en los 89 reportes.

## 6. Pruebas ejecutadas y resultados

| Prueba | Resultado |
|---|---|
| `selftest-node` | 233/233 |
| Todas las `tools/test-*.js` | pasan |
| `test-report-profiles` | 38 ✔ / 0 ✘ |
| `test-report-composer` | 32 ✔ / 0 ✘ (profundidad en 89 reportes, agregar, quitar, alternar, errores) |
| `test-report-catalog` (nuevo) | 11 ✔ / 0 ✘ |
| `test-report-content` | 26 ✔ / 0 ✘ |
| `batch_report_setup` (nuevo, navegador) | 24 ✔ / 0 ✘ |
| `batch_report_composer` / `batch_report_golden` | 24 / 4 sin fallas |
| `batch_presentacion` / `batch_pdf_fidelidad` / `batch_quarter` | 44 / 5 / 17 sin fallas |
| `batch_editorial` (desde la raíz) | 110 ok / 0 fallas |
| Regresión completa de navegador (163 baterías) | solo las 4 fallas preexistentes ajenas al módulo |

`batch_report_setup` recorre la pantalla real: opciones no habilitadas que no se pueden elegir, propuesta idéntica a la vista previa, profundidades (Resumen = 4 láminas, Ejecutivo, Detallado), agregar y quitar contra la profundidad, restablecer, PDF 16:9 de 4 hojas sin `undefined/NaN/null`, accesibilidad (nombres, grupos con leyenda, casillas etiquetadas, título de tabla) y celular de 390 px sin desborde. Las pruebas nuevas detectan mutaciones (se probaron dos).

## 7. Riesgos y límites

- **La selección no se persiste** (se pierde al recargar; el estado `rp` ya era así). La persistencia segura y su limpieza al cerrar sesión son de la Fase 7.
- **Las profundidades son una decisión de producto**: «Resumen» y «Ejecutivo» son subconjuntos de páginas existentes. Cuando existan los perfiles nuevos, cada uno declarará las suyas.
- **Los textos «Próximamente»** prometen formatos que aún no existen; solo se muestran, no se pueden elegir.
- **Brecha heredada**: el dibujo de las láminas de tráfico, campañas y estacionalidad con datos sigue sin golden de navegador (su contenido sí está cubierto).
- **D1 sigue abierto** (documentado).

## 8. Criterios de aceptación

| Criterio | Estado |
|---|---|
| Elegir audiencia, tipo y profundidad; solo lo habilitado es elegible | Cumplido |
| Propuesta con láminas, orden, tipo, motivo de inclusión y de exclusión, anexos y limitaciones | Cumplido |
| Reutiliza los controles de periodo, canal y filtros | Cumplido |
| La profundidad no reduce la letra | Cumplido (solo elige páginas) |
| El reporte actual sigue idéntico | Cumplido |
| D2 resuelto | Cumplido |
| Sin cambios en motores, `reportBuilder.js` ni `reportCopy.js` | Cumplido |
