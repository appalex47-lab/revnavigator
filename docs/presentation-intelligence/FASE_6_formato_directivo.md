# Fase 6 — Formato Directivo

## Objetivo
Tercera audiencia: **Directivo**. Responde «¿cómo va el canal digital, dónde está el riesgo y qué decisión toca?». Pocas láminas, una idea por lámina, casi sin tablas. Motores y reporte actual intactos.

## Archivos
- Nuevos: `js/report/directivo.js`, `js/ui/report-directivo-view.js`, `tools/test-report-directivo.js`, `tools/regression/batch_report_directivo.py`.
- Modificados: `js/report/profiles.js` (bandera opcional `strict`), `js/report/composer.js` (motivo `fuera-de-perfil` solo en perfiles estrictos), `js/report/operativo.js` (exporta `rowOf`), `js/ui/report-setup-view.js`, `js/ui/report-view.js` (sensibilidad para Directivo), `css/report.css`, `index.html`, `batch_report_setup.py` (las 4 audiencias ya están habilitadas), golden (escenario `directivo` agregado; los demás idénticos).

## Láminas
Portada · **Veredicto** (nueva: frase + venta real, plan a la fecha y cierre estimado del periodo, con sellos y la confiabilidad que el reporte ya calculó) · **Riesgo y oportunidad** (nueva: semáforo de Gerencial en conteos y quién resta/suma) · Oportunidades priorizadas (Fase 5) · Decisiones · Pacing y forecast y quién suma y resta (Detallado) · Anexo (apagado por defecto).

Profundidades: Resumen (portada, veredicto, decisiones) · **Ejecutivo** (por defecto; + riesgo y oportunidades) · Detallado (+ pacing y quién suma y resta).

## Perfil estricto
Directivo declara `strict: true`: las páginas del reporte que no lista (resumen, factores, tendencias, cierre…) quedan fuera con el motivo «No forma parte del formato «Directivo»», sin casilla para agregarlas. Los demás perfiles no cambian.

## Reglas
Nada de cifras que no estén ya en el reporte (toDate, fila del periodo, páginas ya armadas). **Sin la contribución del digital sobre la venta total de la empresa** (no hay esos datos) y sin margen, ROI, ROAS ni CAC. Cierre estimado con sello Estimado; dato ausente = «No disponible».

## Limitaciones
- La portada conserva el titular del reporte actual (no dice «Canal digital» en todos los casos); el veredicto sí.
- «Oportunidades priorizadas» usa la misma lámina de Gerencial (no hay variante con menos columnas).
- Comparte los umbrales del semáforo de Gerencial; viven en la sesión (persistencia: Fase 7).
- El veredicto con un filtro de producto sigue la serie del canal/periodo, no el filtro.
