# Fase 4 — Formato Gerencial

## Objetivo
Segunda audiencia nueva: **Gerencial** (gerentes y líderes de área). Responde «¿cómo vamos contra la meta, qué nos separa de ella y qué decisión toca?». Menos detalle por indicador que Operativo y más conclusión. Motores comerciales y reporte actual intactos.

## Archivos
- Nuevos: `js/report/gerencial.js`, `js/ui/report-gerencial-view.js`, `tools/test-report-gerencial.js`, `tools/regression/batch_report_gerencial.py`.
- Modificados: `js/config/config.js` (`reports.gerencial`), `js/report/operativo.js` (exporta `rangeOf`, `toDateOf`), `js/app.js` (umbrales `okPct`/`alertPct`), `js/ui/report-view.js` (sensibilidad según audiencia), `css/report.css`, `index.html`, `batch_report_setup.py`, golden (escenario `gerencial` agregado; los anteriores sin cambio).

## Láminas
Reutiliza las del reporte actual (resumen, brecha y factores, pacing y forecast, quién suma y resta, recuperación, decisiones, anexos) y agrega **Cumplimiento por canal**: venta real contra plan a la fecha, brecha, brecha % y semáforo (en meta / en seguimiento / fuera de meta) con símbolo y palabra, más el total.

Profundidades: Resumen (portada, resumen, brecha, cierre, decisiones) · **Ejecutivo** (por defecto; suma pacing, cumplimiento por canal, quién suma y resta, recuperación) · Detallado (todo lo que tiene datos).

## Reglas
Sin fórmulas nuevas (real, plan, brecha salen de `toDate`). Sin margen, ROI, ROAS ni CAC. Dato ausente no entra al semáforo. Umbrales provisionales (en meta: hasta 1 % bajo el plan; fuera de meta: desde 5 %) editables en pantalla; si los escritos son inconsistentes se usan los provisionales y la lámina lo avisa.

## Limitaciones
- Las láminas reutilizadas conservan el texto del reporte actual: la diferencia de narrativa con el reporte actual viene de la selección, el orden, la profundidad y la lámina nueva, no de textos reescritos.
- «Plan a la fecha» no es la meta del cierre.
- Umbrales solo viven en la sesión (persistencia: Fase 7).
- Dependencia de `operativo.js` para leer periodo y `toDate` (se cargan en ese orden).
