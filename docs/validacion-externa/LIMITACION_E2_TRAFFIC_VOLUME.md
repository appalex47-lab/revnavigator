# Limitación aceptada de E-2: `traffic_volume` anterior al cambio de origen

**Estado:** limitación ACEPTADA por el usuario (decisión del 2026-11-20). No es una aprobación de E-2 ni de las Fases 4.1/4.2.

## Qué se comprobó
Conciliación de la serie diaria (`traffic_volume` de `Venta_Real.csv`, 1 256 filas, 2026-01-01 → 2026-11-10) contra el export GA4 multidimensional (1 041 823 filas, mismo periodo).

- Mapa de canales usado (supuesto declarado, confirmado empíricamente en el tramo reciente): plataforma `web` = ecommerce; `iOS` + `Android` = app.
- Evidencia reproducible: `tools/validacion-externa/salida/real/e2-sesiones.md` y `tools/validacion-externa/salida/real/e2-subperiodos/` (con `COMO_REPRODUCIR.md`).
- Conversores: `convertir-actual.js`, `convertir-ga4.js` (solo reformatean; el vacío de origen se etiqueta «(vacío en origen)», no se descarta).

## Hallazgo
| Tramo | Ecommerce (serie ÷ GA4 web) | App (serie ÷ GA4 iOS+Android) |
|---|---|---|
| 01/01 → 24/09 | +19.0 % en total (mediana diaria 23 %) | −63.9 % en total (mediana diaria 63 %) |
| 25/09 → 04/10 | +35 % a +56 % | ≈ 1.00 |
| 05/10 → 10/11 | −0.36 % en total (mediana diaria 1.03 %, máx. 11.7 %) | −1.07 % en total (mediana diaria 0.75 %, máx. 8.3 %) |

- Quiebre de origen: app desde 2026-09-25; ecommerce desde 2026-10-05.
- Día anómalo: 2026-10-02, app: serie 226 sesiones vs GA4 2 249.
- Respuestas del usuario: la serie y el export vienen de GA4, sin filtros, todo 2026, misma zona horaria, misma fuente para ecommerce y app, y «no cambió nada» en el origen. La causa del cambio queda **sin explicar**.

## Clasificación
- **No** es un error de código (los validadores y conversores se comportan igual en todo el periodo y concilian donde los datos son consistentes).
- **No** es una diferencia comercial legítima.
- **Sí** es un problema de calidad/procedencia de datos: «cambio de origen sin explicar».

## Alcance de la limitación (qué NO es confiable)
- `traffic_volume` (sesiones) de **ecommerce anterior a 2026-10-05** y de **app anterior a 2026-09-25**, y el valor de app del 2026-10-02.
- Todo lo derivado de ese tráfico en esos días: `conversion_rate` (pedidos ÷ sesiones). En app queda sobreestimada y en ecommerce subestimada.

## Qué NO está afectado
Venta, pedidos, plan y la validación E-3 (venta contra plan). WhatsApp y Llamadas no se miden en GA4 y quedan fuera de E-2.

## Condiciones de la aceptación
1. No se fija ni se aplica tolerancia alguna entre ambas fuentes (sin evidencia ni autorización).
2. Las sesiones y la conversión de esos tramos no deben usarse como base de diagnóstico de tráfico/conversión.
3. La aceptación de 4.1/4.2 que se base en E-2 debe citar esta limitación.
4. Se levanta si el usuario re-exporta/corrige `traffic_volume` de los tramos afectados y E-2 se vuelve a ejecutar sobre el periodo completo.

## Pendiente (no implementado)
Inventario de los cálculos que todavía pueden consumir esos periodos: [`CONSUMIDORES_AFECTADOS_E2.md`](CONSUMIDORES_AFECTADOS_E2.md). Esta limitación está **documentada**, no impuesta por código: la aplicación todavía no excluye esos tramos de sus cálculos de tráfico/conversión. Hacerlo sería un cambio de producto y requiere decisión expresa del usuario.
