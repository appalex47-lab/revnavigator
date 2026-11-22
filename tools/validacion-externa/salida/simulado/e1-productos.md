# E-1 · Forecast de tendencias con ventas por producto

**ORIGEN: SIMULADO (no cuenta como validación externa)** · veredicto: **APROBADA**

Archivo: `tools/validacion-externa/fixtures-simulados/productos.csv` · sha256 `cff41fd7e5449d20eb0153ef19592010fef9d7b94120bb9aefe18f7121f4ae59` · 2830152 bytes

## Estructura
- filas de datos: 95192 · productos: 60 · periodos (mes): 2026-01, 2026-02, 2026-03, 2026-04, 2026-05, 2026-06, 2026-07, 2026-08
- productos con ≥ 6 periodos: 60
- errores: 0 · advertencias: 0

## Aserciones de tools/test-phase21-real.js (7 esperadas)
| aserción | resultado |
|---|---|
| CSV tiene 85k+ filas | PASS |
| hay productos con >=6 periodos | PASS |
| entidad real tiene historia suficiente | PASS |
| forecast real disponible | PASS |
| forecast real conserva patrón | PASS |
| backtest real calculado | PASS |
| periodos futuros son posteriores | PASS |

Entidad analizada: Producto 42 HISTORY 8 PATTERN growth_sustained START 2026-08 DURATION 1 FORECAST 2026-09,2026-10,2026-11
