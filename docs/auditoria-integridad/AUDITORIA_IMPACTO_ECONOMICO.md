# Auditoría H-03 — Impacto económico desconectado (`FP.economics`)

> Commit `625daec`. Solo lectura. **No se modificó `combineImpacts` ni ningún motor.**

## 1. Qué funciona hoy (verificado)
| Pieza | Estado | Evidencia |
|---|---|---|
| `js/economics/impactModel.js` (234 líneas, `FP.economics`) | Implementado y probado | `tools/test-economia-dual.js` 64/64; `test-fase2-contratos.js` OK; `batch_fase2_margen.py` y `batch_fase2_modelo_real.py` en verde (tarea anterior) |
| Configuración de margen (opcional) | **Operativa de extremo a extremo**: Ajustes → «Margen comercial (opcional)», `buildSetting`, `availability`, persistencia en `state.settings.economics` | `js/app.js:186, 3319–3331`, `js/ui/settings-view.js:38, 125` |
| Impacto en ventas (MXN) | Se calcula en muchos motores **sin** el contrato `cc.economic_impact` | brecha (`gap.js`), contribuciones de atribución (`attribution.js`, `driverEngine.js`), escenarios (`scenarioEngine.js`/`impactCalculator.js`), recuperación (`recoveryEngine.js`), promociones (`opportunityEngine.js`) |

## 2. Qué está implementado pero desconectado
`grep` en `js/`: **ningún archivo fuera de `impactModel.js` usa** `makeImpact`, `contributionOf`, `combineImpacts`, `fromGap`, `fromSimulation` ni `fromRecovery`. Los únicos consumidores de `FP.economics` son `app.js` y `settings-view.js`, y **solo para la configuración del margen**. Es decir: el contrato de impacto (v2) y sus adaptadores existen y están probados en `tools/`, pero **ningún cálculo mostrado en la app pasa por él**. El Home no consume `FP.economics`: sus importes (brecha, forecast de cierre, contribución de drivers) vienen de `homeSummaryEngine`/`driverEngine` en bruto.

## 3. Cálculos que se realizan más de una vez
| Cálculo | Implementaciones | Archivos |
|---|---|---|
| Brecha real − plan | 5 | `calculations/gap.js` (`calcGap`), `report/reportBuilder.js:698`, `forecast/reforecastEngine.js:225`, `analytics/planBridgeEngine.js:17`, `analytics/changeEngine.js:130` |
| Contribución de drivers | 2 vías | `diagnostics/attribution.js` (fuente) y consumidores que la reexpresan (`trafficConversionEngine.js`, `driverEngine.js`) |
| Venta incremental de una alternativa | 2 | `scenarios/scenarioEngine.js` (+`impact/impactCalculator.js`) y `scenarios/recoveryEngine.js`; el adaptador `fromRecovery` asume que **todas las alternativas cierran la misma brecha** (grupo excluyente) |
| Impacto de oportunidades de promoción | 1 propio | `promotions/opportunityEngine.js` (sin contrato) |
No se probó que estas implementaciones **diverjan numéricamente**; se documenta el riesgo, no una discrepancia confirmada.

## 4. Quién debería consumir una misma fuente de verdad
Una sola capa de «impacto» (contrato `cc.economic_impact` v2 con procedencia observado/proyectado y categoría brecha/alcanzable/potencial/en riesgo) que alimente: Home (Z1, Z3), Z4 (referencias), Z5, Recovery Center, Narrativa y Presentación. Cada importe debe tener **un** elemento propietario (regla H‑01) y las cifras derivadas (contribución bruta) calcularse **solo** con `contributionOf` sobre el impacto en ventas.

## 5. Reglas que deben preservarse
1. **Impacto en ventas es el principal** (la contribución bruta no lo sustituye).
2. **Contribución bruta = ventas × margen, opcional y complementaria**: sin margen se muestra «no configurado» (nunca 0); con margen válido, rotulada «estimada» (`impactModel.js`, D‑01 aceptada: el motor hoy **rechaza** margen < 0 y no se modificó).
3. No mezclar observado con proyectado en un mismo total; alternativas excluyentes como rango (D‑06).

## 6. Defectos conocidos y su relación con la integración
`combineImpacts` (diagnóstico previo, 22 pruebas de caracterización): B2/B3/B4 y decisiones C2/D1/D3/D6. **Hoy no afectan a nada mostrado** porque nadie lo invoca; **afectarían** a cualquier integración de totales. Por eso la integración debe conectar primero los impactos **individuales** por elemento y **no** mostrar totales consolidados hasta resolver D‑06 (subfase 4.5 propuesta).

## 7. Qué falta para conectar `FP.economics` con el Home
1) Un adaptador de entrada por motor (hoy `fromGap/fromSimulation/fromRecovery` existen sin uso) con prueba de equivalencia numérica contra el cálculo actual; 2) identificadores de elemento estables (`cc.finding`, hoy inexistente en `js/`); 3) lectura del margen (`availability`) en el Home; 4) reglas verificables de superposición (D‑06); 5) decisión sobre margen negativo (D‑01) antes de mostrar contribución negativa.
