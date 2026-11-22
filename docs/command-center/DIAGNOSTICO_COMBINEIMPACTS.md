# Diagnóstico de `combineImpacts` (ronda de calidad, Fase 3)

> Estado: **diagnóstico y propuesta para la Fase 4.5**. El motor (`js/economics/impactModel.js`) y los contratos **no se modificaron**.
> Reproducible: `node tools/test-fase3-combineimpacts.js` (22 pruebas de caracterización; los defectos están *fijados*, no corregidos).

## 1. Implementación (resumen)
`combineImpacts(items, setting)` agrupa los impactos por `categoría|procedencia` y, dentro de cada grupo, aplica:
1. **Independientes** (sin grupo): se suman (punto, bajo, alto).
2. **`overlapGroup`** (mismo dinero dicho por varios elementos): se toma **el de mayor `point`** (`sort((a,b)=>b.point-a.point)[0]`) y se avisa.
3. **`exclusiveGroup`** (alternativas): punto = **mínimo** de los puntos; rango = [mínimo de los bajos, máximo de los altos]; nunca la suma.
4. `insufficient_data` se excluye y el total queda `incomplete` (no aporta cero).
5. El total de contribución = total de ventas × margen (misma cuenta lineal); sin margen → `null`.

## 2. Usos
| Consumidor | Uso | ¿Afecta a un cálculo mostrado? |
|---|---|---|
| `tools/audit/z3-atencion.js` (`totalsOf`) | Totales por clase en el encabezado de Z3 | **Sí**, pero con la mitigación descrita abajo |
| `tools/test-fase2-contratos.js`, `tools/test-economia-dual.js` | Pruebas del contrato | No |
| Z1, Z2, Z4, Z5, aplicación real (`js/`) | No llaman a `combineImpacts` | No |

En la aplicación real **ningún módulo** de `js/` lo consume hoy (solo se define en `impactModel.js`); el único consumidor funcional es la especificación de Z3.

## 3. Escenarios reproducibles
| Id | Escenario | Resultado actual | Juicio |
|---|---|---|---|
| B1 | +100 y +90 superpuestos | +100 | Correcto |
| **B2** | **−100 y −90 superpuestos** (pérdidas del mismo dinero) | **−90** | **DEFECTO**: «el mayor» por valor es la pérdida de *menor magnitud*; el total subestima la pérdida mayor |
| **B3** | El mismo par en positivo y en negativo | +100 / −90 | **DEFECTO**: regla asimétrica según el signo |
| **B4** | Superpuestos con rangos [95,105] y [40,200] | alto = 105 | **DEFECTO**: la incertidumbre de los demás miembros se descarta (b llega a 200) |
| B5 | +100 y −150 en el mismo grupo | +100 | **DECISIÓN**: ¿puede un mismo dinero ser ganancia y pérdida? El −150 desaparece sin aviso |
| C1 | +100 y +70 excluyentes | punto 70, rango 56–120 | Correcto (conservador para oportunidades) |
| C2 | −100 y −70 excluyentes | punto −100 | **DECISIÓN**: el «mínimo» no distingue signo; lo conservador para una pérdida sería lo contrario |
| D1 | +100 y −30 independientes de la misma categoría | +70 | **DECISIÓN**: se netean; un riesgo puede quedar oculto por una oportunidad |
| D3 | Elemento con `exclusiveGroup` y `overlapGroup` | solo cuenta el excluyente | **DECISIÓN**: el otro grupo se ignora en silencio |
| D6 | Claves de grupo distintas para el mismo dinero | se suman (190) | **DECISIÓN**: la asignación correcta de grupos depende del llamador y no se valida |

## 4. Cálculos afectados
- **Hoy, ninguno mostrado.** Z3 ya evita B2/B4 en pantalla: cuando una línea tiene elementos superpuestos **no muestra cifra** (`low/point/high/display = null`) y dice «no se suman ni se totalizan; el importe está en cada tarjeta». Las alternativas de recuperación (positivas) usan C1, que es correcto.
- **En potencia:** cualquier consumidor futuro (p. ej. un total de riesgos o la priorización de 4.4) que combine pérdidas superpuestas heredaría B2/B3/B4.

## 5. Alternativas de corrección (para decidir en 4.5)
| Alternativa | Qué hace | Ventaja | Costo / riesgo |
|---|---|---|---|
| **A. Magnitud** (recomendada) | En `overlapGroup`, elegir por `|point|` y devolver el rango envolvente [mín low, máx high] de todos los miembros | Simétrica en signo; conserva la incertidumbre | Cambia cifras de totales superpuestos; requiere regresión de Fase 2 |
| **B. No totalizar** | Un grupo superpuesto devuelve `null` y la nota «mismo dinero» (lo que hoy hace Z3) | Nunca subestima; cero riesgo numérico | Menos información en el total |
| **C. Rechazar signos mixtos** | Error si un grupo mezcla signos | Evita B5 | Obliga a quien llama a separar grupos |
| **D. Total separado por clase** | No netear riesgos y oportunidades (D1): totales «a favor» y «en contra» | Evita ocultar riesgos | Cambia el contrato de la salida |

**Recomendación técnica:** A + C + D en la Fase 4.5 (con B como comportamiento por defecto mientras tanto). Requiere aprobación funcional (cambia cómo se agregan indicadores económicos) y regresión completa de Fase 2.

## 6. Pruebas de regresión que deben existir antes del cambio
Las 22 de `tools/test-fase3-combineimpacts.js` (caracterización) más las de `tools/test-fase2-contratos.js` y `tools/test-economia-dual.js`. Al aplicar una alternativa, las pruebas B2/B3/B4/C2/D1 **deben cambiar de forma deliberada** (y documentarse), no por accidente.

## 7. Estado
**Criterio funcional aceptado (D-06, 12 de noviembre de 2026):** no consolidar automáticamente impactos superpuestos, evitar duplicidad y pérdida de magnitud o incertidumbre, exigir reglas verificables de identificación, relación, periodo, fuente y superposición, y no presentar como confiable un consolidado que la metodología no permita. **La corrección técnica sigue pendiente (asunto prioritario de 4.5)**; las alternativas A–D de §5 deben evaluarse contra ese criterio (B es la más cercana mientras no existan las reglas). Motor sin modificar · mitigación de presentación en Z3 probada.
