# Modelo de detección de desviaciones (Subfase 2.3)

Implementación de referencia: `classifyDeviation` (`tools/audit/command-center-contracts.js`). Las desviaciones las **detectan** los motores existentes; este modelo fija cuándo una desviación se publica, con qué severidad y cuándo se descarta.

## 1. Mecanismos (qué se compara con qué)
| Mecanismo | Referencia | Motor existente |
|---|---|---|
| vs plan | Plan de los mismos días contados | `gap.js`, `pacing.js` |
| vs periodo anterior | Mes/semana previa comparable | `temporalEngine` |
| vs año anterior (YoY) | Mismo periodo del año previo | `temporalEngine` |
| vs tendencia | Línea de tendencia reciente | `trendEngine` |
| vs esperado | Forecast del método vigente | `forecastEngine`, `reforecastEngine` |
| cambio de mix | Participación por canal/producto | `shareMixEngine` |
| desviación de driver | Sesiones, CR o AOV contra su base | `attribution.js`, `signalEngine` |
| vs objetivo | Meta anual / de campaña | `campaignGoals`, `forecastEngine` |
| atípico | Día o punto fuera de patrón | `patternEngine` |
Todo hallazgo declara su mecanismo en `period.comparison` (`plan`, `previous`, `yoy`, `trend`, `expected`).

## 2. Activación
Una desviación se evalúa solo si: hay cobertura ≥ 60 % de días comparados, el indicador tiene base (> 0) y los datos no están bloqueados. Si no, **no se descarta en silencio**: se publica como brecha de datos («no hay base suficiente») con la acción para resolverla.

## 3. Severidad (4 niveles)
`normal` (no se publica) · `seguimiento` · `importante` · `crítica`.

Pasos (el orden importa):
1. **Magnitud adversa** `adv = |desvío|` (solo cuenta el signo adverso). Nivel base: `adv ≤ banda normal` → 0; `≤ banda inusual` → 1; `≤ 2× inusual` → 2; mayor → 3.
2. **Materialidad económica** `mat = |brecha $| ÷ plan del periodo`: pequeño en % pero `mat ≥ 5 %` sube de 0 a 1; `mat ≥ 15 %` sube un nivel; con nivel ≥ 2 y `mat < 2 %` baja a 1.
3. **Persistencia**: racha adversa ≥ 5 periodos/días sube un nivel (tope crítica).
4. **Punto aislado**: nivel ≥ 2 con persistencia ≤ 1, sin corroboración y sin materialidad alta → baja a 1 (posible atípico).
5. **Calidad de datos**: respaldo `bajo` nunca pasa de seguimiento; sin dato → «descartada» como brecha de datos.

Las bandas vienen de `thresholdAdvisor` (P75/P90 del historial propio) cuando hay historia suficiente y, si no, de `config` (hoy 2 % / 5 %). Las constantes de materialidad reutilizan 2 % / 5 % / 15 % de `config`.

Ejemplo real: Ecommerce −12.6 % contra plan, racha de 6 días, corroborado, $748 mil sobre un plan de $15.9 M → nivel base 3, **crítica** (F2.R10). Un −1 % aislado con 0.2 % de materialidad → `normal`, no se publica.

## 4. Relevancia, deduplicación y descarte
- **Relevancia** = severidad × materialidad; ordena la lista y limita la portada a 3 elementos.
- **Deduplicación**: misma `scope + indicador + periodo + comparación + familia` = un solo hallazgo (`MODELO_HALLAZGOS_RIESGOS_OPORTUNIDADES.md` §4). Un driver «explica» la brecha del mismo canal y periodo (relación, no suma).
- **Descarte**: desviación dentro de banda; punto atípico sin persistencia ni corroboración (baja a seguimiento y no sale en portada); hallazgo duplicado (queda como `lineage`).
- **Estado de vigencia**: `activo → vigilancia → resuelto` tras 2 corridas sin la llave, y no se resuelve nada si el dato es más viejo que el visto (misma lógica que `changeEngine.reconcile`).

## 5. Qué ya existe y qué falta
| Existe | Falta (Fase 4) |
|---|---|
| Detectores por mecanismo en motores y agentes | Un único catálogo de reglas con versión |
| Bandas P75/P90 en `thresholdAdvisor` | Que `attentionEngine` y los agentes las lean de ahí |
| Ciclo de vida en `changeEngine.reconcile` | Aplicarlo a `cc.finding` (hoy usa `alert_key`) |

## 6. Hallazgo de la auditoría: umbrales fragmentados
Hay al menos cinco conjuntos de umbrales independientes (`config`, `attentionEngine`, detectores de agentes, `signalEngine`, `thresholdAdvisor`). Ninguno se modifica en esta fase (decisión de riesgo: cambiar umbrales cambia lo que ven los usuarios hoy). El modelo exige que, al unificar, la severidad de un mismo hecho no cambie sin que se documente.
