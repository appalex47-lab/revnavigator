# Contrato de hallazgos `cc.finding/1.1` (consolidado, P-05)

**Módulo:** `js/commandCenter/findings.js` (no cargado por `index.html`, sin consumidores). **Base aceptada:** `tools/audit/command-center-contracts.js` (Fase 2). **Extensión:** `tools/audit/hallazgos-extension.js`. **Pruebas:** `test-fase4-1-hallazgos.js` (23), `test-fase4-1-contratos-js.js` (30).

## Un solo contrato, versionado, sin duplicar
- `findings.js` es el **port** del contrato aceptado + la extensión aditiva. Las funciones `validateFinding`, `dedupKey`, `mergeFindings`, `reconcileValidity`, `familyOf`, `kindOf`, `validateExtension`, `validate`, `fromAttentionItem` tienen **texto idéntico** al de las especificaciones (la prueba lo compara y detecta una mutación).
- **Comportamiento idéntico** sobre los hallazgos reales de `attentionEngine` (JSON igual), mismos veredictos de validación en 7 casos (válido + 6 inválidos), misma deduplicación y reconciliación.
- **Versionado:** `schema: "cc.finding"`, `version: 1` se conserva (un hallazgo v1 de Fase 2 sigue válido); la v1.1 **añade** campos opcionales (`kind`, `causality`, `dataReliability`, `recommendation`, `actionRef`, `detectedAt`, `updatedAt`, `difference`). El módulo expone `contract: 'cc.finding/1.1'`.
- **Dependencias explícitas:** `FP.economics.validateImpact` (se carga antes; falla con mensaje claro si falta). **No** redefine el estado del negocio (`classifyBusinessState` **no** se portó: lo sustituye `FP.planStatus`), ni la economía, ni la confiabilidad.

## Reglas (hecho · desviación · hipótesis · causa · oportunidad · riesgo · recomendación)
- Causa comprobada exige evidencia clase *hecho* con `proves:'cause'`, fuente y certeza ≥ cálculo; una hipótesis/señal nunca se declara causa; la IA (`ia`, `cohere`, `narrativa_ia`) nunca eleva causalidad.
- Sin evidencia o sin fuente → rechazo. Sin impacto cuantificable: `economics: null` + razón (jamás un impacto inventado). Repeticiones se fusionan; el id es estable.
- Recomendación y acción son campos del hallazgo (`actionRef` = `null` hasta 4.4).

## Trazabilidad (verificada con los hallazgos reales)
Cada hallazgo de `attentionEngine` (brecha, driver, forecast, calidad de datos) se expresa en el contrato con evidencia `módulo/campo`, periodo, canal, indicador, observado/referencia, certeza, confiabilidad de datos, linaje (`rule`, `lineage`) y razón de ausencia de impacto.

## Estado
Preparado para consumo en 4.3 (no integrado). No se implementaron tarjetas del Home.
