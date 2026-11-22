# Contrato `cc.reliability/1` integrado con Z1

> **Actualización del cierre técnico (ver `docs/cierre-fase-4-1-4-2/`).** Lo siguiente supera a lo escrito más abajo si hay contradicción: (1) `planStatus`, `businessState` y `attentionEngine` ya **no** contienen umbrales de respaldo (solo `FP.config.forecast.pacingThresholds`); (2) `js/commandCenter/z1.js` es un archivo **generado** desde la especificación (`tools/build-z1-port.js`), no una copia manual; (3) los textos de `segments-view` salen de la configuración (P-21 resuelto, límite «textos fijos» cerrado); (4) «121 scripts, 0 fallas» (y «117») incluía **3 scripts omitidos** (requieren archivos externos): son 120 ejecutados + 3 omitidos; (5) existe `reconcileSessionsReport` y `tools/audit/validar-sesiones-ga4.js` para validar sesiones con datos reales; (6) `index.html` carga solo `planStatus.js` y `sampleSufficiency.js` desde `js/commandCenter/`.


**Módulos:** `js/commandCenter/z1.js` → `js/commandCenter/reliability.js`. **Pruebas:** `test-fase4-2-z1-evaluador.js` (D1–D3), `test-fase4-1-confiabilidad.js` (23), `test-fase4-1-contratos-js.js`, `test-fase4-2-escenarios-integracion.js`.

## Flujo
`entrada de los motores (i)` → `FP.z1.build(i)` (evaluación) → `FP.reliability.assess(i)` = { nivel, modo, causas, **dimensiones**, **usos**, explicación (ok/falta/limita), completitud }.
`assess(i, o1)` acepta una evaluación ya calculada; sin `FP.z1` cargado y sin `o1` falla con un mensaje claro.

## Trazabilidad resultado Z1 → confiabilidad
Nivel, modo, causas y completitud de `assess` son **exactamente** los de `FP.z1.build(i).reliability/completeness` (4 000 entradas, prueba D2). El contrato no recalcula el nivel y no contiene reglas de nivel (D3).

## Qué dice el contrato por uso (6 operaciones)
mostrar métrica · clasificar estado · diagnosticar · recomendar · estimar impacto · conclusión ejecutiva, cada una `none` / `con_reservas` / `preliminar` / `solo_datos` / `bloqueado` con su razón. **La venta observada válida se muestra siempre** (D-01); sin plan se bloquea clasificar el estado, no mostrar la venta (escenario T1).

## Dimensiones y suficiencia de muestra
`completeness`, `coverage`, `freshness`, `consistency`, `traceability`, `comparability`, `sample` con tipos `valido/parcial/insuficiente/inconsistente/no_disponible/desactualizado/no_evaluado`. La dimensión `sample` usa el criterio aportado; el criterio contextual vive en `cc.sample/1` (ver `CONTRATO_SAMPLE_SUFFICIENCY.md`). **Pendiente (decisión P-17):** conectar `sampleSufficiency.evaluate` con la dimensión `sample` (hoy `sample` recibe `{n, min}` de quien llama).

## Estado de integración (honesto)
**Productor** (Z1) y **contrato** están integrados y probados entre sí. **Consumidores en la aplicación: ninguno**: ni Inicio ni Pacing leen `reliability` (lo harán las zonas del Command Center, 4.6). `index.html` no los carga.
