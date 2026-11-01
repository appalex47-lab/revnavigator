# Fase 3 — Formato Operativo

## Objetivo
Primera audiencia nueva de Presentation Intelligence: **Operativo** (analistas y coordinadores). Responde «¿dónde está la desviación, qué indicador la explica y qué se va a ejecutar?». Reutiliza 12 láminas del reporte actual y agrega 3 propias. Los motores comerciales no se tocan y el reporte actual (perfil LEGACY) sigue idéntico.

## Archivos nuevos
| Archivo | Papel |
|---|---|
| `js/report/blocks.js` | Registro de constructores de bloques adicionales. `extend(report, src, profile)` agrega al reporte solo los bloques que el perfil pide y el reporte no trae. Con LEGACY devuelve el mismo reporte sin tocarlo. |
| `js/report/operativo.js` | Perfil `operativo` (profundidades Resumen / Ejecutivo / Detallado) y los constructores `channelPacing`, `evolution`, `actions`. |
| `js/ui/report-operativo-view.js` | Dibujo de las 3 láminas y del gráfico de barras agrupadas (real contra plan). |
| `tools/test-report-operativo.js` | 43 pruebas de Node. |
| `tools/regression/batch_report_operativo.py` | 18 pruebas en la pantalla real (selección, láminas, impresión 16:9, profundidades, casillas, volver a «Reporte actual»). |

## Archivos modificados
`js/config/config.js` (umbrales provisionales `reports.operativo`), `js/ui/report-view.js` (registro `EXT` de láminas nuevas; eyebrow de portada según perfil), `js/app.js` (`buildExecutiveReport` extiende con el perfil; cambiar audiencia/tipo descarta el reporte generado), `index.html`, `css/report.css`, `tools/regression/batch_report_setup.py` (Operativo ya está habilitado), `tools/regression/batch_report_golden.py` y `data/report_golden.json` (escenario `operativo` agregado; los 4 anteriores son idénticos byte a byte).

## Láminas
- **Pacing por canal** — por canal y total: venta, pedidos, volumen (sesiones/conversaciones/llamadas según canal), conversión (variación en pp) y ticket, cada uno real y vs plan. Cifras tomadas tal cual de `toDate` de cada serie. Titular determinista: canal que más resta y el que más suma, con indicadores bajo el plan.
- **Evolución de venta y pedidos** — por semana (mes), día (semana) o mes (trimestre/año): real contra plan de los mismos días contados; semanas parciales marcadas; ticket = venta ÷ pedidos del grupo.
- **Acciones, responsables y fechas** — acciones ya registradas en Recuperar que cruzan el periodo; responsable vacío = «Por asignar»; impacto simulado rotulado *Estimado* y sin sumar entre acciones; prioridad descriptiva, no ranking.

Profundidades: Resumen = portada, pacing por canal, acciones; Ejecutivo suma pacing, evolución, factores, suma/resta, recuperación; Detallado = todo con datos.

## Reglas respetadas
Sin fórmulas nuevas (solo suma de días contados de la propia serie y venta ÷ pedidos). Dato ausente = `null` → «No disponible», nunca cero. Sin datos suficientes la lámina se omite con motivo (aparece en la propuesta y en el Anexo A). Umbrales (0.5 % bajo plan, 1 % «más floja») en `FP.config.reports.operativo`, provisionales y congelados. Sin dependencias nuevas; `reportBuilder.js` no cambió.

## Limitaciones conocidas
- Embudo diferido (no hay etapas de funnel por canal en las series; se revisará con el análisis de productos).
- `recoveryPercent` de las acciones tiene unidad ambigua: no se muestra.
- Los textos son plantillas; no explican causas.
- D1 («Al corte del null») sigue abierto, documentado en Fase 2.

## Criterios de aceptación y resultado
Ver el reporte de fase entregado con esta rama: pruebas Node (todas), batch_report_operativo / setup / golden / composer, regresión completa, lint ≤ 193.
