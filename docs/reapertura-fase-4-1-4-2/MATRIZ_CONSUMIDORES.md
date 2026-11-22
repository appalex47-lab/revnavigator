# Matriz de consumidores (estado real tras la reapertura)

| Contrato | Cargado | Consumidores funcionales | Evidencia |
|---|---|---|---|
| `planStatus` | sí | `home-resumen` (titular), `contextEngine` (frase de Inicio) | `estado-consumidores`, navegador D3 |
| `sampleSufficiency` | sí | motores de segmentos (3) y su texto, `attentionContract` (suficiencia del forecast → Inicio «estimación preliminar») | `p16`, `reapertura-consumidores` D2 |
| `z1Input` | sí | `attentionContract` | `reapertura-consumidores` B1–B4 |
| `z1` (+ `businessState`) | sí | `reliability` | `z1-evaluador`, navegador B2 |
| `reliability` | sí | `attentionContract` → `attention-view`, `home-resumen` (chip) | navegador C2/D2 |
| `findings` | sí | `attentionContract` → `attention-view` (id estable, naturaleza, causalidad) | navegador C1 |
| `attentionContract` | sí | `attention-view` | navegador B1–B4 |
| `FP.metrics` (CR/AOV/brecha/cambio relativo) | sí | 11 archivos migrados | `reapertura-formulas` |
| `metricCatalog` | **no** (referencia) | CLI `validar-sesiones-ga4.js` y pruebas | `cierre` E8 |
| `FP.gap.pacingStatus` + `pacingThresholds` | sí | todas las vistas, exportación, reporte (4 sitios) | `cierre` C, `reapertura-reporte` |
