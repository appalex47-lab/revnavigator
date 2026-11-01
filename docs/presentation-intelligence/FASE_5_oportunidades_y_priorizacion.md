# Fase 5 — Economía de oportunidades y priorización

## Objetivo
Dar a Gerencial una lámina que une lo que la herramienta ya sabe: **dónde está la brecha** (Observado) y **qué se puede recuperar** (Estimado), ordenado por monto. Sin inventar economía que no hay datos para calcular.

## Alcance real (y por qué)
La herramienta no tiene costos, márgenes, inversión ni atribución. Por eso **no se calcula margen, ROI, ROAS ni CAC**; los montos son venta, no utilidad, y la lámina lo dice. La «priorización» es por monto; la urgencia y la evidencia son la prioridad descriptiva que ya guarda Recuperar, no una puntuación propia.

## Archivos
- Nuevos: `js/report/oportunidades.js`, `js/ui/report-oportunidades-view.js`, `tools/test-report-oportunidades.js`.
- Modificados: `js/report/gerencial.js` (slot `opportunities`, Ejecutivo), `index.html`, `css/report.css`, `tools/test-report-gerencial.js`, `tools/regression/batch_report_gerencial.py`, golden (solo `gerencial`).

## Lámina «Oportunidades priorizadas»
- **Dónde está la brecha (Observado):** canales por debajo del plan a la fecha, de mayor a menor, con su brecha del forecast, % vs plan y su parte de la suma de brechas negativas (cociente). Total digital tomado de la serie total (no es la suma de canales). Máximo 4.
- **Qué se puede recuperar (Estimado):** acciones de Recuperar que cruzan el periodo, de mayor a menor impacto simulado; sin escenario = «Sin escenario» al final; responsable «Por asignar» si falta. Máximo 5.
- Los impactos simulados **no se suman** entre acciones. Sin brecha y sin acciones, la lámina se omite con motivo.

## Limitaciones
- Valor en venta, no en utilidad. Con costos/márgenes cargados en el futuro se podría ampliar.
- La «parte de la brecha» ignora los canales sobre el plan, por eso la suma de brechas por canal puede ser mayor que la brecha del total digital (la lámina muestra ambas).
- Solo está en Gerencial; Directivo la reutilizará en la Fase 6 con otra redacción.
