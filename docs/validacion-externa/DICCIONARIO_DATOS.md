# Diccionario de datos

## `productos.csv` (E-1)
| columna | tipo | regla | notas |
|---|---|---|---|
| `fecha` | texto dd/mm/aaaa | calendario válido (31/02 se rechaza) | el nombre histórico del archivo es 2026; otros años → aviso |
| `producto` | texto | no vacío | se agrupa por nombre exacto |
| `venta` | número | `$` y `,` se ignoran; no numérico → error; negativo → aviso (se suma tal cual, como la prueba) | varias filas por producto y día son normales (se suman por mes) |
Reglas globales: **> 85 000 filas de datos**; **≥ 1 producto con ≥ 6 meses** con venta; el producto de mayor venta entre los candidatos se analiza (historia ≥ 6 periodos).

## `diario-canal.csv` (E-2)
`date` aaaa-mm-dd · `channel` ecommerce|app|whatsapp|llamadas · `sessions` entero ≥ 0 o vacío (ausente). **Unicidad:** una fila por `date`×`channel` (duplicado = error). WhatsApp y Llamadas: «sessions» son contactos.

## `segmentos-ga4.csv` (E-2)
`date`, `channel` (solo ecommerce|app), `dimension` (device, source, medium, campaign, landing_page, customer_type, …), `segment` (texto; «(not set)» permitido y se mide su peso), `sessions` entero ≥ 0 o vacío. **Unicidad:** `date`×`channel`×`dimension`×`segment` (duplicado = error por doble conteo).

## `diario-plan-real.csv` (E-3)
`date` · `channel` · `plan_revenue` (MXN; vacío = sin plan ese día) · `actual_revenue` (MXN; vacío = sin venta real ese día) · `sessions` · `orders` (vacíos = ausentes). Unicidad `date`×`channel`. Las filas posteriores al corte (p. ej. el plan futuro) se ignoran y se cuentan en un aviso.
**Cómo se construye la entrada de Z1** (sin fórmulas propias): días contados = días con venta real; `planToDate` solo si **todos** los días contados tienen plan > 0; sesiones/pedidos = suma solo si **ningún** día contado los omite (si falta alguno → `null`); brecha y cumplimiento = `FP.metrics.calcGap`; cobertura = días con plan y venta ÷ días del periodo hasta el corte; respaldo (`support`) = `FP.attentionEngine.support` con esa cobertura y la calidad declarada; **Total** = días en que TODOS los canales presentes tienen venta real.

## `config-z1.json`
`corte` aaaa-mm-dd · `periodo` `{tipo: mes|anio, clave: aaaa-mm | aaaa}` · `calidad` `{canal: ready|warnings|invalid}` · `esperados` opcional `{canal|total: {nivel: Alta|Media|Baja|Insuficiente, completitud: verificada|incompleta|no_verificable}}`.
