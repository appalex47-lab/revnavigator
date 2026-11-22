# Auditoría de las pruebas (¿se debilitó algo para ponerlo en verde?)

## 1. Pruebas preexistentes modificadas en 4.1/4.2 — revisadas línea por línea contra Git (`git diff`)
| Archivo | Cambio | Veredicto |
|---|---|---|
| `test-traffic-all`, `test-traffic-conversion`, `test-report-builder`, `test-change-engine` | solo **cargan** el módulo nuevo del que ahora dependen el motor (`sampleSufficiency`, `metrics`); `test-report-builder` lee el mínimo de la configuración **real** en lugar de copiar constantes | no debilitan: mismas aserciones |
| `test-change-engine` (cierre) | **+1 aserción** (brecha total y por canal) | **reforzada** (detectó una laguna: mutación M5) |
| `batch_inicio_chip` (C1) | la prueba fijaba la regla vieja (0.05 %); ahora verifica el chip contra `FP.gap.pacingStatus` con los umbrales efectivos y exige «en línea» cuando corresponde | cambio de comportamiento **autorizado** (P-01); sigue verificando % y sentido fuera de la banda |
| `batch_fase3_1_home_auditoria` (F31.3), `batch_fase3_2_z1_wireframe` (F32.3) | afirmaban «Z1/classifyBusinessState/mergeFindings no existen en `js/`»; ahora «existen **solo** en `js/commandCenter/`, sin consumidores y sin carga» | el límite que protegían (no-integración) **se sigue verificando** (y F32.3 añade que `index.html` no carga `z1`/`businessState`) |
| `test-fase4-1-estado-comercial` (B4, E1), `…estado-consumidores` (C1, C4), `…contratos-js` (D5), `…metricas-y-fuentes` (B1, B3), `…reimplementaciones` (anclas GAP-3/6), `…impacto-conceptual` (C5) | alineadas con el estado nuevo / sustitución de una aserción constante | B3 pasó de «≥3 de 4 sitios» a «≥3 de 3» tras migrar changeEngine (sin pérdida de cobertura real); C5 **era** la aserción constante `true` → ahora real |

**Hallazgo:** una aserción constante (`C5`) y dos aserciones auto-satisfechas de mi propio trabajo de 4.1 ya se habían corregido (`E7`, `E6`) o se corrigieron aquí. `F1` del cierre busca patrones triviales (`|| true`, `t('…', true)`) en las 17 pruebas de 4.1/4.2/cierre: ninguno.

## 2. Pruebas de mutación (se modificó el código real, se ejecutó la prueba, se restauró el archivo)
| # | Mutación | Detectada por |
|---|---|---|
| M1 | exportación ignora los umbrales efectivos | `batch_fase4_2_contratos` ✔ |
| M2 | `segmentInsights` vuelve a copiar 500/1 % | `p16-minimo-sesiones`, `cierre` ✔ |
| M3 | Inicio clasifica con umbrales fijos | `estado-consumidores` ✔ |
| M4 | `driverEngine` invierte el signo del delta | `paridad-consumidores`, `p13-migracion` ✔ |
| M5 | `changeEngine` brecha invertida | `paridad-consumidores` ✔ · **`test-change-engine` original: NO detectada** → reforzada y ahora ✔ |
| M6 | `planStatus` ignora los umbrales | `estado-comercial`, `cierre` ✔ |
| M7 | texto de `segments-view` vuelve a ser fijo | `cierre` ✔ |
| M8 | `reliability` deja de usar Z1 | `z1-evaluador` ✔ |
| M9 | `businessState` vuelve a una constante propia | `cierre` ✔ |
| M10 | `attentionEngine` vuelve a un respaldo fijo | `cierre` ✔ |
| M11 | mínimo de sesiones con `floor` en vez de `ceil` | `p16-minimo-sesiones` ✔ |
Resultado: 11/11 detectadas (10 a la primera; M5 tras reforzar). Además, en 4.1/4.2: mutaciones de Z1 (F1, F2), de `reliability` (D1–D4), de `findings` (E1–E3) y de `planStatus` (E1–E5), todas detectadas.

## 3. ¿Qué significa «121 scripts, 0 fallas»? (corrección)
Se ejecutó cada `tools/test-*.js` + `selftest-node.js` y se contaron las líneas de resultado: **123 scripts → 120 ejecutados con aserciones y 3 omitidos**. Los 3 omitidos terminan con código 0 pero imprimen «OMITIDA: requiere archivos externos que no están en este entorno»: `test-phase20-diagnostic`, `test-phase21-forecast`, `test-phase21-real`. **No se cuentan como aprobados.** (Preexistentes en `HEAD`; clase T-05.) Las ~2 160 líneas ✔ de los 120 restantes no incluyen ninguna ✘.

## 4. Pruebas nuevas de este cierre (33 comprobaciones)
`test-cierre-4-1-4-2.js` (28): Z1 generado, textos=configuración, umbrales únicos, mecanismo de sesiones, calidad de pruebas · `test-cierre-paridad-consumidores.js` (5): paridad de `changeEngine`/`driverEngine` contra la **versión original de Git**, con igualdad exacta (`Object.is`).

## 5. No ejecutado / límites
Validación visual real; datos reales; 136 lotes de navegador no vinculados con los archivos modificados; los 3 scripts omitidos.
