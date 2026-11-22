# Qué archivos necesito y en qué formato

Todo va en **`tools/validacion-externa/entrada-real/`** (carpeta excluida de Git). Plantillas en `tools/validacion-externa/plantillas/`. UTF-8, separador coma, primera fila = encabezado, nombres de columna exactos (minúsculas). Sin credenciales ni datos personales.

| # | Archivo | Para | Contenido | Formato |
|---|---|---|---|---|
| 0 | `MANIFIESTO.json` | los tres | origen y procedencia | `{ "origen":"real", "extraido_por", "fecha_extraccion":"aaaa-mm-dd", "descripcion" }` (plantilla `MANIFIESTO.plantilla.json`) |
| 1 | `productos.csv` | **E-1** | ventas por producto (export de «Venta Productos 2026», > 85 000 filas) | columnas `fecha,producto,venta` · `fecha` = dd/mm/aaaa · `venta` numérico (admite `$` y comas de miles) |
| 2 | `diario-canal.csv` | **E-2** | sesiones diarias por canal (la serie diaria de RevNavigator) | `date,channel,sessions` · `date` aaaa-mm-dd · `channel` ∈ ecommerce, app, whatsapp, llamadas · `sessions` entero ≥ 0 (vacío = ausente) |
| 3 | `segmentos-ga4.csv` | **E-2** | export GA4 por dimensión, **mismo periodo y canales** | `date,channel,dimension,segment,sessions` · `channel` ∈ ecommerce, app (GA4 no mide WhatsApp/Llamadas) · una fila por fecha × canal × dimensión × segmento |
| 4 | `diario-plan-real.csv` | **E-3** | plan y venta real diarios por canal, con sesiones y pedidos | `date,channel,plan_revenue,actual_revenue,sessions,orders` · vacío = ausente (nunca 0 por ausencia) |
| 5 | `config-z1.json` | **E-3** | corte, periodo, calidad por canal y (opcional) lo que TÚ esperas | ver `config-z1.plantilla.json` |

**Además necesito saber:** (a) el periodo de E-2 (`--from`/`--to`) y que ambos exports cubran exactamente el mismo; (b) para E-3, el estado de «Calidad de datos» que muestra la app por canal (ready / warnings / invalid); (c) si tienes una expectativa del nivel de confiabilidad por canal (A8), indícala en `esperados`.

**Antes de entregarlos:** ejecuta (o déjame ejecutar) los validadores; si un archivo no pasa la estructura, el reporte dice qué línea corregir. No hace falta limpiar datos: los duplicados y negativos se reportan, no se «arreglan».
