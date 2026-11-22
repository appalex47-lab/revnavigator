# Informe ejecutivo — preparación para la Fase 4

> Rama `ccr-a81af632-rirtu7`, commit `625daecc0969f9cd6e9db5d93a41eb652040d506`. Auditoría **solo de lectura y pruebas no destructivas** en navegador aislado, sin sesión ni nube. No se implementó nada, no se modificó código, motores, contratos, documentos aceptados ni `docs/revision-visual/`; no hubo commit, push ni merge. Estos 11 documentos están **sin versionar** en `docs/auditoria-integridad/`.
> Documentos: `AUDITORIA_INTEGRIDAD_DATOS_Y_MOTORES` · `INVESTIGACION_CLIENTES_Y_LTV` · `INVESTIGACION_TRAFICO_Y_CONVERSION` · `AUDITORIA_IMPACTO_ECONOMICO` · `MAPA_FUENTES_DE_VERDAD` · `MAPA_DEPENDENCIAS_MOTORES` · `TRAZABILIDAD_COMMAND_CENTER_FASE_3` · `PROPUESTA_INTEGRACION_COMMAND_CENTER` · `PRIORIZACION_BRECHAS_FASE_4` · `PROPUESTA_SUBFASES_FASE_4`.

## Dictamen: **PREPARADO CON CONDICIONES**
Los motores de cálculo son sólidos y están probados (233 de 233 del motor, 64 de atribución, 64 de economía, contratos de Fase 2 en verde; identidad Venta = Volumen × CR × Ticket con suma exacta). **Ninguno de los hallazgos de la revisión visual resultó ser un defecto de cálculo.** Pero **no se puede integrar el Command Center directamente sobre el Home**: hay una contradicción confirmada en el estado frente al plan, el contrato de impacto no tiene consumidores, no existe el contrato de hallazgo ni la confiabilidad por conclusión en `js/`, y hay duplicidad de fórmulas. Por eso: **preparado para iniciar la Fase 4 (contratos e integridad), no preparado para una integración visual inmediata**. Las condiciones están en la respuesta 9.

## Respuestas
1. **Motores confiables hoy:** `metrics`, `gap`, `pacing`, `planningEngine`, `forecastEngine` (+ confianza), `reforecastEngine`, `attribution`, `driverEngine`, `diagnosticEngine`, `trafficConversionEngine`, `scenarioEngine`/`recoveryEngine`, `actionPlan`, `customerEngine` (evidencia en `MAPA_DEPENDENCIAS_MOTORES.md`).
2. **Fuentes de verdad inconsistentes:** estado frente al plan (**2 reglas**: ±2 % vs 0.05 %, **confirmada**); sesiones (2 fuentes: dataset real vs Segmentos); «plan» (cargado vs generado); brecha (5 implementaciones), CR (≥ 4), AOV (≥ 4) — riesgo, **divergencia no probada**; confiabilidad sin contrato único.
3. **Clientes y LTV vacío:** la demo solo *prepara* el archivo; hay que **confirmarlo** y la importación tarda ~13 s; con eso aparecen 8 827 pedidos y 3 000 clientes. No es defecto del motor; **corrige mi revisión visual anterior**. Falta UX («archivo pendiente»).
4. **Tráfico y conversión «inconsistente»:** depende de cuántos de los 6 archivos generados se confirmaron (segmentos 0 vs 1 814). Determinista, sin carrera; reproducido 2/2.
5. **Para conectar `FP.economics` con el Home:** adaptadores a `cc.economic_impact` (existen y no se usan), ids estables de elementos, lectura de `availability` del margen, pruebas de equivalencia, y resolver D‑06/D‑01 antes de totales y de margen negativo.
6. **Listos para reutilizar:** los motores de la respuesta 1; `attentionEngine` y `actionPlan`/`actionLibrary` como base de Z3/Z4; `recoveryEngine` (alternativas excluyentes) para Z5; `quality/*` para confiabilidad; `impactModel.js` como contrato; plegables y componentes del Home.
7. **Por construir:** contrato y módulo de confiabilidad (4 niveles, por conclusión), estado de negocio único, adaptadores `cc.finding`, vínculo acción↔elemento, Z5 (oportunidades y visión de conjunto), read model, respuestas rápidas, Z2 ejecutable, estados «pendiente de confirmar».
8. **Bloqueantes (para integrar el elemento que dependen):** D‑1 (estado único), D‑5 (impacto sin consumidores), D‑6 (sin contrato de hallazgo). **Altos:** `combineImpacts` (solo totales), duplicidad de fórmulas, fuente de sesiones, confiabilidad sin contrato.
9. **Resolver primero (condiciones):** D‑1, contrato de confiabilidad, regla de fuente de sesiones/conciliación (D‑02), contratos de hallazgo e impacto, y pruebas de equivalencia numérica.
10. **Riesgos de integrar ahora:** cifras contradictorias en el Home; importes duplicados o sin respaldo; confianza mal comunicada; totales con defectos conocidos; regresiones en un `app.js` de ≈ 6 000 líneas; páginas ya muy largas en móvil.
11. **Secuencia recomendada:** 4.1 integridad y fuentes → 4.2 motores y confiabilidad → 4.3 hallazgos → 4.4 priorización y acciones → 4.5 impacto económico (con `combineImpacts`) → 4.6 integración controlada (opcional). Detalle en `PROPUESTA_SUBFASES_FASE_4.md`.
12. **Decisiones que requieren tu autorización:** iniciar la Fase 4 y cada subfase; la regla única de estado frente al plan; la fuente de sesiones y la regla de conciliación ($0.01); portar a `js/` el contrato de confiabilidad y la corrección D‑05 de Z1; la corrección de agregación de `combineImpacts` y el tratamiento del margen negativo (D‑01); ampliar la integración al Home (4.6) y su interruptor; usar datos reales de FESA; y conservar en Git estos documentos.

## Correcciones a la revisión visual anterior
Clientes y LTV **sí funciona**; Recovery mide ≈ 11 100 px (no > 15 000 px); los «?»/«¿Por qué?» tienen área táctil ampliada a 44 px en móvil (los realmente pequeños son los botones de canal de 20 px y enlaces de 19 px). Los documentos de `docs/revision-visual/` no se modificaron.

## Límites de esta auditoría
Sin sesión/nube, Cohere, PDF, exportaciones, dispositivo real ni datos reales; persistencia de segmentos tras recargar no verificada; la creación de una acción en el Recovery Center no se pudo probar con los datos de demo (no hay brecha). Las divergencias numéricas entre implementaciones duplicadas son un **riesgo**, no un defecto probado.

## Roadmap consolidado
| Etapa | Estado |
|---|---|
| Fase 1 | Aceptada con limitaciones documentadas |
| Fase 2 | Aceptada con limitaciones documentadas |
| Fase 3.1 a 3.5 | Aceptadas con limitaciones documentadas |
| Revisión visual | Completada en entorno de trabajo |
| **Auditoría de integridad** | **Completada (este informe)** |
| Preparación de integración | **Pendiente: espera tu revisión y autorización** (subfase actual) |
| Fase 4 | **No iniciada** |
| 4.1 Integridad y fuentes de verdad | Propuesta, **no autorizada** |
| 4.2 Motores y confiabilidad | Propuesta, **no autorizada** |
| 4.3 Hallazgos, patrones y desviaciones | Propuesta, **no autorizada** |
| 4.4 Priorización y acciones | Propuesta, **no autorizada** |
| 4.5 Impacto económico | Propuesta, **no autorizada** |
| 4.6 Integración controlada del Command Center | Propuesta opcional, **no autorizada** |
| Fase 5 | No iniciada |
| Fase 6 | No iniciada |
