# Decisiones pendientes (tras 4.2)

> **Actualización del cierre técnico (ver `docs/cierre-fase-4-1-4-2/`).** Lo siguiente supera a lo escrito más abajo si hay contradicción: (1) `planStatus`, `businessState` y `attentionEngine` ya **no** contienen umbrales de respaldo (solo `FP.config.forecast.pacingThresholds`); (2) `js/commandCenter/z1.js` es un archivo **generado** desde la especificación (`tools/build-z1-port.js`), no una copia manual; (3) los textos de `segments-view` salen de la configuración (P-21 resuelto, límite «textos fijos» cerrado); (4) «121 scripts, 0 fallas» (y «117») incluía **3 scripts omitidos** (requieren archivos externos): son 120 ejecutados + 3 omitidos; (5) existe `reconcileSessionsReport` y `tools/audit/validar-sesiones-ga4.js` para validar sesiones con datos reales; (6) `index.html` carga solo `planStatus.js` y `sampleSufficiency.js` desde `js/commandCenter/`.


## Resueltas dentro del alcance autorizado
P-12 exportación con umbral efectivo · P-13 (solo GAP-3 y GAP-6; GAP-4 excluido por no ser idéntico) · P-16 mínimo de sesiones centralizado · Z1 portado.

## Siguen reservadas (no se tocaron)
P-04 (0.005 vs $0.01), P-06/P-07 (`impactModel`, `combineImpacts`, D-01, D-06 → 4.5), P-09 (Command Center en el Home real), P-10 (commits/push/merge/PR/deploy), tolerancia serie diaria ↔ GA4 (P-14).

## Nuevas
| ID | Pregunta | Recomendación |
|---|---|---|
| **P-17** | ¿Conectar `sampleSufficiency.evaluate` a la dimensión `sample` de `reliability` y a los diagnósticos? | Sí, en 4.3 junto con los hallazgos |
| **P-18** | ¿Qué hacer con GAP-4 (`a/b − 1`) y GAP-5 (centavos)? Decidir un criterio de redondeo/último bit | Migrar GAP-4 solo si se acepta el cambio en el último bit; GAP-5 requiere política de centavos (D-02) |
| **P-19** | ¿Cargar `z1`/`reliability`/`businessState` en `index.html`? Hoy sin consumidores (se cargaría código sin uso) | Cargarlos cuando exista el primer consumidor (4.3/4.6) |
| **P-20** | ¿Hacer que `contextEngine` y el resto de consumidores usen `FP.planStatus` en lugar de `FP.gap.pacingStatus`? | No hay beneficio hasta que necesiten los estados `plan_unavailable/no_activity/not_comparable` (4.3) |
| **P-21** | Textos de ayuda «500 / 1 %» de `segments-view` derivados de la configuración | Sí (cambio menor de texto) |
| P-11, P-13 (oleadas 2–4), P-14 | heredadas de 4.1 | sin cambio |
