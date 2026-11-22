# Reporte de validación externa (E-1, E-2, E-3)

Generado: 2026-11-13T12:46:53.490Z

> Los resultados **SIMULADOS** solo demuestran que el paquete funciona. **Únicamente los resultados REALES cuentan** para aceptar las Fases 4.1 y 4.2.

## Resultados REALES
| validación | veredicto | generado | sha256 de entradas (12) |
|---|---|---|---|
| E-1 productos / forecast | APROBADA | 2026-11-13 12:45:32 | 27e535fce8f4 |
| E-2 sesiones GA4 | CONCILIACIÓN EJECUTADA (tolerancia no fijada por el paquete) | 2026-11-13 12:45:38 | 5eca9bc38b78, 027046f084dd |
| E-3 Z1 / reliability | APROBADA | 2026-11-13 12:46:53 | 8abfb07241b6, 43a49bdc8d4f |

## Resultados SIMULADOS (no son validación)
| validación | veredicto | generado | sha256 de entradas (12) |
|---|---|---|---|
| E-1 productos / forecast | APROBADA | 2026-11-13 04:11:13 | cff41fd7e544 |
| E-2 sesiones GA4 | CONCILIACIÓN EJECUTADA (tolerancia no fijada por el paquete) | 2026-11-13 04:11:13 | 9233d4eead4f, 559bfc9146b2 |
| E-3 Z1 / reliability | APROBADA | 2026-11-13 04:11:13 | 4fb7440a546e, 318686b8cf38 |

## Estado de la validación externa
**E-1 y E-3 REALES aprobadas; E-2 REAL ejecutada pero con 12 pares canal×dimensión en «discrepancia_sin_criterio» (sin tolerancia aprobada): NO es un verde. La aceptación de 4.1/4.2 no puede evaluarse hasta que el usuario clasifique y resuelva esa discrepancia.**

Detalle por validación: `salida/real/*.md` y `salida/simulado/*.md`.
