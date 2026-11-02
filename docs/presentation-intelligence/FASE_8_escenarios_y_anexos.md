# Fase 8 — Escenarios y anexos del formato

## Objetivo
Mostrar los escenarios de recuperación guardados con sus supuestos, y dejar constancia (anexos propios del formato) de las reglas y umbrales usados y de qué texto no salió del motor.

## Verificación previa (forma de los datos del motor)
Se leyó `scenarioEngine.saveScenario`: el escenario guardado trae `inputs` (cambios: `trafficPct`, `crValue`/`crMode`, `aovValue`/`aovMode`, en fracciones), `assumptions` (lista de textos), `warnings` (lista de textos), `context.period/channel` y `expectedImpact` con `incrementalValue`, `gapBefore` y `recoveryPercent` (= impacto ÷ brecha **de ese escenario**, fracción). El reporte solo recibía nombre, tipo, canal e impacto; se amplió ese paso en `app.js` (campos nuevos, aditivos; el armador los ignora). Se comprobó con datos reales de la herramienta (el escenario de ejemplo trae el supuesto «Base de días no cerrados: forecast del método A…»).

## Archivos
- Nuevos: `js/report/escenarios.js`, `js/ui/report-escenarios-view.js`, `tools/test-report-escenarios.js`, `tools/regression/batch_report_escenarios.py`.
- Modificados: `js/app.js` (escenarios con más campos), `js/report/blocks.js` (el constructor recibe el perfil; las páginas con `needs` no cuentan en el total), `js/report/composer.js` (opción `edits`; páginas `needs:'edits'`), `js/ui/report-setup-view.js` (`selectionOf` incluye `edits`), perfiles Operativo/Gerencial/Directivo (slots), `css/report.css`, `index.html`, goldens `operativo`, `gerencial` y `directivo` (páginas nuevas; reporte actual y demás escenarios idénticos).

## Lámina «Escenarios de recuperación»
Hasta 5 escenarios, de mayor a menor impacto simulado (Estimado), con el cambio simulado, canal, «% de la brecha», primer supuesto y primera advertencia (copiados tal cual y recortados a 110 caracteres; «Supuestos completos en Recuperar»). Sin impacto calculable = «Sin escenario» (null). **«% de la brecha»**: se muestra el número hasta 1000 %; por encima se escribe **«Supera la brecha»**; sin brecha, «Sin brecha en el periodo». Aviso informativo «Revisa los supuestos» cuando supera 100 %. No se suman impactos. Entra en Operativo (Ejecutivo) y en Gerencial y Directivo (Detallado).

## Anexos del formato
- **Reglas y umbrales:** umbrales en uso con su origen («Valor provisional» o «Cambiado por la persona»), sellos y límites comunes y propios del formato. Solo configuración.
- **Ediciones e IA:** texto de la persona e hipótesis de IA aceptadas por lámina. Se decide al componer: solo entra si hay ediciones del formato (no hace falta regenerar) y no cuenta en el total del reporte.
- En Directivo ambos anexos vienen apagados por defecto; en Gerencial y Operativo aparecen en Detallado, antes del anexo técnico A–C.

## Limitaciones
- Solo se muestra el primer supuesto y la primera advertencia por escenario.
- Si el motor de escenarios cambia la forma de `assumptions`/`warnings`, la lámina muestra «Sin supuestos guardados» (no inventa texto).
- El anexo de reglas toma los umbrales de lo generado; si se cambian hay que volver a generar (la vista previa avisa).
- Los escenarios son los vinculados al periodo en Recuperar; escenarios de otros periodos no aparecen.
