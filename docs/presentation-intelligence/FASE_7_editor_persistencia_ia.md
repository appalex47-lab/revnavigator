# Fase 7 — Editor, persistencia e IA opcional

## Objetivo
(1) Que la selección de la presentación (formato, profundidad, láminas, umbrales) sobreviva entre sesiones. (2) Poder ajustar el texto de una lámina sin tocar sus cifras. (3) Ofrecer, de forma opcional y apagada por defecto, hipótesis de IA validadas. Todo local, limpio al cerrar sesión.

## Archivos
- Nuevos: `js/report/presentationPrefs.js` (validación y serialización, pura), `js/report/presentationAI.js` (hipótesis y su validación), `tools/test-report-prefs.js`, `tools/test-report-ai.js`, `tools/regression/batch_report_editor.py`.
- Modificados: `js/config/config.js` (clave `reportPrefs`, solo local), `js/app.js` (estado, carga al iniciar, guardado solo si cambia, acciones del editor y de IA), `js/ui/report-view.js` (aplica ediciones en la lámina y en el PDF), `js/ui/report-setup-view.js` (botón Editar y panel del editor), `css/report.css`, `index.html`.

## Persistencia
- Se guarda en `localStorage` con la clave `reportPrefs`: formato, tipo, profundidad, láminas agregadas/quitadas, etiquetas, nombre en portada, umbrales y ediciones de texto. **No** se guarda el reporte generado, la IA ni su permiso.
- Se escribe solo cuando algo cambia (comparación del contenido). Al cerrar sesión la clave se borra con el resto de los datos del equipo (no está entre las que se conservan) y mientras se borra `storage.save` no escribe nada (sin escrituras tardías). Se sincroniza con el equipo como el resto de los ajustes (no está en `skipKeys`); al traer una copia más nueva se aplica en caliente. «Borrar mis ediciones…» guarda el estado vacío para que el borrado también se sincronice.
- Al leer se valida contra el catálogo vigente: audiencia, tipo o profundidad que ya no existen, láminas desconocidas y umbrales fuera de 0.1 %–20 % se descartan **con aviso en pantalla** y rige el valor por defecto; otra versión del esquema se rechaza completa.

## Editor
- Botón **Editar** en cada fila de la propuesta (menos portada y anexos): título propio (máx. 120) y nota (máx. 280). El título reemplaza al generado; la nota sale al pie como «Nota.». Siempre texto (se escapa), nunca una cifra calculada. «Restaurar el texto original» quita la edición. La edición es por formato (`formato|lámina`).

## IA opcional (hipótesis)
- Apagada por defecto; cada sesión hay que permitirla. Solo se llama al pulsar «Pedir hipótesis a la IA» y se envía únicamente el texto y las cifras de esa lámina (misma conexión Cohere y mismo registro de transparencia).
- Validación local antes de mostrar: JSON con forma, 1–3 hipótesis de ≤ 220 caracteres, lenguaje de posibilidad obligatorio, sin lenguaje causal o de certeza, sin margen/ROI/ROAS/CAC y **sin cifras que no estén en la lámina**. Si falla algo, no se muestra nada y se explica por qué.
- La persona acepta cada hipótesis una por una; sale en la lámina rotulada «Hipótesis (IA), por validar».

## Limitaciones
- Las ediciones largas pueden no caber en láminas muy densas (se probó con el máximo en Pacing; no se recorta automáticamente otra lámina).
- La whitelist de cifras es tolerante (formato, K/M, %, redondeo): una cifra inventada que coincida por casualidad con otra de la lámina pasaría.
- Las ediciones de texto se comparten con el equipo (última escritura gana, sin fusión).
- La validación frena números y lenguaje causal, no afirmaciones falsas sin números.
