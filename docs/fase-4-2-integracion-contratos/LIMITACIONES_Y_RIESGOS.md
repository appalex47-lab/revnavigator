# Limitaciones y riesgos — Fase 4.2

> **Actualización del cierre técnico (ver `docs/cierre-fase-4-1-4-2/`).** Lo siguiente supera a lo escrito más abajo si hay contradicción: (1) `planStatus`, `businessState` y `attentionEngine` ya **no** contienen umbrales de respaldo (solo `FP.config.forecast.pacingThresholds`); (2) `js/commandCenter/z1.js` es un archivo **generado** desde la especificación (`tools/build-z1-port.js`), no una copia manual; (3) los textos de `segments-view` salen de la configuración (P-21 resuelto, límite «textos fijos» cerrado); (4) «121 scripts, 0 fallas» (y «117») incluía **3 scripts omitidos** (requieren archivos externos): son 120 ejecutados + 3 omitidos; (5) existe `reconcileSessionsReport` y `tools/audit/validar-sesiones-ga4.js` para validar sesiones con datos reales; (6) `index.html` carga solo `planStatus.js` y `sampleSufficiency.js` desde `js/commandCenter/`.


## Limitaciones
| ID | Limitación |
|---|---|
| L-01 | `z1`, `businessState`, `reliability`, `findings` y el catálogo **no están cargados ni consumidos** por la aplicación. La integración Z1 → reliability es **de pruebas** (Node y contexto limpio), no funcional en la interfaz. |
| L-02 | De los consumidores de `planStatus` solo el titular del Inicio usa el **contrato**; el resto usa la regla central que el contrato delega. |
| L-03 | `sampleSufficiency.evaluate` no tiene consumidores; la dimensión `sample` de `reliability` aún no lo usa (P-17). |
| L-04 | Z1 existe como **dos copias idénticas** (especificación aceptada y port) comparadas por prueba; no se puede modificar la especificación sin autorización. |
| L-05 | Relación serie diaria ↔ GA4 no validada (sin datos reales ni tolerancia aprobada). |
| L-06 | Datos simulados únicamente; no hay validación visual real del Command Center (no existe). |
| L-07 | Cinco sitios de estado frente al plan conservan escala propia (P-11 de 4.1). |
| L-08 | Textos de ayuda de `segments-view` con «500 / 1 %» escritos a mano. |
| L-09 | 17 + 2 fórmulas aún sin migrar (17 en dominio válido, GAP-4 no idéntico, GAP-5 redondea). |
| L-10 | Lotes de navegador con CSP omitida por el lanzador (limitación de la herramienta). |

## Riesgos abiertos
| # | Riesgo | Mitigación |
|---|---|---|
| R1 | Divergencia futura entre Z1 aceptada y su port | prueba de texto idéntico + 4 000 entradas en cada corrida |
| R2 | El titular del Inicio ahora clasifica con el contrato: un cambio en `planStatus` afecta a la vista | 15 pruebas de paridad con la regla anterior (1.01/0.99) y batch de navegador |
| R3 | Faltante tratado como 0 en 13 de 15 sitios de CR/AOV (guardas aguas arriba) | oleadas de migración con guarda canónica |
| R4 | GAP-4 no es idéntico: quien lo migre podría alterar redondeos en empates | queda fuera hasta decidir el redondeo (P-18) |
| R5 | `impactModel` (D-01/D-06) | 4.5 |
| R6 | Dependencia de `FP.metrics` y de `FP.sampleSufficiency` en orden de carga (index.html) y en tests aislados | pruebas actualizadas; error claro si falta |
| R7 | Datos reales aún no probados | Fase 5 |
