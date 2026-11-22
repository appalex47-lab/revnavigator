# Limitaciones y deuda técnica (consolidado)

> **Actualización del cierre técnico (ver `docs/cierre-fase-4-1-4-2/`).** Lo siguiente supera a lo escrito más abajo si hay contradicción: (1) `planStatus`, `businessState` y `attentionEngine` ya **no** contienen umbrales de respaldo (solo `FP.config.forecast.pacingThresholds`); (2) `js/commandCenter/z1.js` es un archivo **generado** desde la especificación (`tools/build-z1-port.js`), no una copia manual; (3) los textos de `segments-view` salen de la configuración (P-21 resuelto, límite «textos fijos» cerrado); (4) «121 scripts, 0 fallas» (y «117») incluía **3 scripts omitidos** (requieren archivos externos): son 120 ejecutados + 3 omitidos; (5) existe `reconcileSessionsReport` y `tools/audit/validar-sesiones-ga4.js` para validar sesiones con datos reales; (6) `index.html` carga solo `planStatus.js` y `sampleSufficiency.js` desde `js/commandCenter/`.


## Limitaciones
| ID | Limitación |
|---|---|
| L-01 | Los contratos de `js/commandCenter/` están **preparados pero no integrados**: `index.html` no los carga y ningún módulo los consume (verificado por prueba). La única parte activa de P-01 son los dos sitios que ahora usan `FP.gap.pacingStatus`. |
| L-02 | La relación serie diaria ↔ GA4 no se pudo validar: faltan datos reales y una tolerancia aprobada. |
| L-03 | Datos simulados únicamente; sin Supabase real ni FESA. |
| L-04 | `reliability.js` necesita la evaluación de Z1, que sigue siendo especificación (sin port). |
| L-05 | Cinco sitios de estado frente al plan conservan escala propia (concepto distinto o golden del reporte). |
| L-06 | `pacing_status` de la exportación y `summarizePeriod.pacingStatus` usan el umbral por defecto (P-12). |
| L-07 | Vigencia, trazabilidad y muestra solo se evalúan si quien llama aporta el dato/criterio. |
| L-08 | Lotes de navegador bajo Chromium con CSP omitida por el lanzador (limitación de la herramienta). |

## Deuda técnica
- **21 reimplementaciones** de brecha/CR/AOV (8+7+6); 13 de 15 de CR/AOV convertirían un numerador ausente en 0 sin guardas aguas arriba; 4 sin guarda de denominador cero; GAP-5 redondea a centavos.
- Mínimo de sesiones por segmento copiado **3 veces** (`500` / `1 %`).
- **Numeración de decisiones ambigua**: las «D-01…D-04» de 3.1 (p. ej. «D-02 una sola experiencia de atención») y las «D-01…D-07» aceptadas el 12-nov-2026 (D-02 = conciliación $0.01) comparten nombre: citar siempre con su fecha/registro.
- `combineImpacts` consolida y, con pérdidas superpuestas, elige la de menor magnitud (defecto B2); margen negativo → «no configurado» (D-01): 4.5.
- `app.js` (~6 000 líneas) con estado compartido.
- La auditoría previa citaba `planningEngine.js` y líneas de `px-ficha/px-view` que no son reimplementaciones: corregido aquí.
