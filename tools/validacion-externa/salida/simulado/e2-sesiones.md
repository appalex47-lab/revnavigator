# E-2 · Conciliación serie diaria ↔ segmentos GA4

**ORIGEN: SIMULADO (no cuenta como validación externa)** · veredicto: **CONCILIACIÓN EJECUTADA (tolerancia no fijada por el paquete)**

Periodo: 2026-09-01 → 2026-09-30 · tolerancia declarada: ninguna (no se aplica)
- diario: `tools/validacion-externa/fixtures-simulados/diario-canal.csv` sha256 `9233d4eead4f3b7d2179727b1173a03a860727283fd6f2dc70965324d4700484`
- segmentos: `tools/validacion-externa/fixtures-simulados/segmentos-ga4.csv` sha256 `559bfc9146b21970eead406b16270e58090c62c52a62f5508397429e94c700ba`

## Estructura
- errores: 0 · advertencias: 2
  - aviso segmentos ecommerce/campaign: 30.0 % del tráfico «(not set)»
  - aviso segmentos app/campaign: 30.0 % del tráfico «(not set)»

## Conciliación por canal × dimensión (periodo completo)
| canal | dimensión | total diario | total segmentos | diferencia | % | estado | días diario/seg |
|---|---|---|---|---|---|---|---|
| app | campaign | 240074 | 240074 | 0 | 0.00 % | sin_diferencia_observada | 30/30 |
| app | device | 240074 | 240074 | 0 | 0.00 % | sin_diferencia_observada | 30/30 |
| app | source | 240074 | 240074 | 0 | 0.00 % | sin_diferencia_observada | 30/30 |
| ecommerce | campaign | 594589 | 594589 | 0 | 0.00 % | sin_diferencia_observada | 30/30 |
| ecommerce | device | 594589 | 594589 | 0 | 0.00 % | sin_diferencia_observada | 30/30 |
| ecommerce | source | 594589 | 594589 | 0 | 0.00 % | sin_diferencia_observada | 30/30 |
| llamadas | — | 8923 | — | — | — | datos_faltantes | 30/0 |
| whatsapp | — | 17971 | — | — | — | datos_faltantes | 30/0 |

## Evidencia por día (para decidir una tolerancia; el paquete NO la fija)
| canal | dimensión | días comparados | días con diferencia | mediana abs % | p95 abs % | máx abs % |
|---|---|---|---|---|---|---|
| app | campaign | 30 | 0 | 0.00 % | 0.00 % | 0.00 % |
| app | device | 30 | 0 | 0.00 % | 0.00 % | 0.00 % |
| app | source | 30 | 0 | 0.00 % | 0.00 % | 0.00 % |
| ecommerce | campaign | 30 | 0 | 0.00 % | 0.00 % | 0.00 % |
| ecommerce | device | 30 | 0 | 0.00 % | 0.00 % | 0.00 % |
| ecommerce | source | 30 | 0 | 0.00 % | 0.00 % | 0.00 % |

## Advertencias de doble conteo
- app: la suma de 3 dimensiones es 3.00 × el total diario: las dimensiones NO son particiones sumables del universo (un visitante cuenta en cada una); no sumarlas.
- ecommerce: la suma de 3 dimensiones es 3.00 × el total diario: las dimensiones NO son particiones sumables del universo (un visitante cuenta en cada una); no sumarlas.

## Lectura
- Las dimensiones NO se suman entre sí (un visitante cuenta en cada una).
- Si el estado es «discrepancia_sin_criterio» no existe una tolerancia aprobada: la diferencia se reporta, no se oculta.
- «sin_diferencia_observada» no equivale a conciliación formal (D-02).
