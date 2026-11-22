# Auditoría de pruebas y mutación (reapertura)

## Regresión final (reproducible, datos simulados)
| Conjunto | Resultado |
|---|---|
| Scripts Node (`tools/test-*.js` + `selftest-node.js`) | **128 scripts: 127 ejecutados, 0 fallas, 1 omitido** (`test-phase21-real`: requiere el CSV real; ver `DEPENDENCIAS_EXTERNAS.md`) |
| Pruebas nuevas de 4.1 + 4.2 + cierre + reapertura | **356 comprobaciones, todas bien** |
| Verificadores de Fase 3 (documentos aceptados) | 5/5 OK |
| Sintaxis `js/` | 251 archivos, 0 errores |
| `build-z1-port.js --check` | z1.js coincide con la especificación |
| Lotes de navegador (57 + reejecución de los que tocó el último cambio) | todos OK (golden del reporte, formatos del reporte, consumidores, contratos incluidos) |

## Mutaciones sobre código real (12 nuevas en la reapertura): 12/12 detectadas
M12 `safeRate` sin guarda · M13 `calcRelativeChange` con otra fórmula · M14 muestra no inyectada en la confiabilidad · M15 Inicio sin chip de confiabilidad · M16 vista sin hallazgo del contrato (navegador) · M17 reporte con escala ±2 % · M18 sesiones ausentes → 0 · M19 literal 0.01 en el catálogo · M20 `segmentInsights` sin guarda · M21 voz del reporte ±0.5 % · M22 atribución sin función canónica · M23 confiabilidad que recalcula el nivel. (Se suman las 11 del cierre.)

## Pruebas existentes tocadas en la reapertura y por qué (ninguna debilitada)
- Cargas de dependencias (`metrics.js`, `gap.js`, `sampleSufficiency`) en `test-projection-calibration`, `test-pvm-bridge`, `test-report-*`; las configuraciones simuladas del reporte leen la configuración REAL (sin copiar valores).
- `test-report-directivo` (3 aserciones): el borde de «a la par» pasó de ±0.5 % a la regla central (±1 %), con las mismas comprobaciones de borde y signo en el nuevo límite.
- `test-phase20-diagnostic` y `test-phase21-forecast`: antes se omitían sin instantánea externa; ahora prueban el código ACTUAL (en `phase21` dos aserciones de etiquetas retiradas por el rediseño `68b4aef` se verifican contra la instantánea si existe y, si no, se reemplazan por las que la UI vigente sí cumple).
- Caracterización de 4.1/4.2 (`reimplementaciones`, `metricas-y-fuentes`, `p13`, `paridad`, `estado-*`, `contratos-js`, `cierre`): pasaron de «los sitios existen» a «los sitios están migrados / los módulos tienen consumidor».
- Lotes: `batch_fase3_1/3_2` (no-integración → integración vía contrato), `batch_fase4_2_contratos` A1.
