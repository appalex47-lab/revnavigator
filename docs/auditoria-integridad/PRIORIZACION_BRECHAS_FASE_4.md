# Priorización de brechas para la Fase 4

> Propuesta. Criterios: exactitud de indicadores, confianza del usuario, decisiones comerciales, integridad de cálculos, experiencia, complejidad. **Bloqueante** = impide integrar el elemento de Fase 3 que depende de él; **no** se eleva a bloqueante un defecto solo por ser visible.

| Id | Brecha | Estado de la evidencia | Severidad | Impacto principal | Complejidad | ¿Antes de integrar el Home? |
|---|---|---|---|---|---|---|
| D‑1 | **Estado frente al plan con dos reglas** (±2 % vs 0.05 %): el titular y el chip se contradicen | **Confirmada** (código + observación) | **Bloqueante** para Z1 | Exactitud y confianza | Baja | **Sí** |
| D‑5 | `FP.economics`/`cc.economic_impact` **sin consumidores**; importes en bruto | Confirmada (barrido de `js/`) | **Bloqueante** para impacto en Z3/Z5 | Decisiones comerciales | Media | **Sí** (impactos individuales) |
| D‑6 | Sin contrato de hallazgo (`cc.finding`) ni clases riesgo/oportunidad en `js/`; `riskOpportunityEngine` sin consumidores | Confirmada | **Bloqueante** para Z3/Z5 | Integridad | Media‑alta | **Sí** |
| D‑7 | `combineImpacts` (3 defectos + 6 decisiones D‑06) | Caracterizada (22 pruebas) | **Alto**; bloquea solo **totales consolidados** | Integridad de cálculos | Media | Antes de mostrar totales; **no** antes de elementos individuales |
| D‑2 | Brecha (5), CR (≥ 4), AOV (≥ 4) con múltiples implementaciones | Riesgo; **divergencia no probada** | **Alto** | Integridad | Media | Parcial: pruebas de equivalencia antes de consumir; redirección durante |
| D‑3 | Sesiones con dos fuentes (real vs Segmentos) | Confirmada por lectura | **Alto** | Exactitud/CR | Media | Declarar fuente y regla (D‑02, $0.01) antes de Z2/Z5 |
| — | Confiabilidad sin contrato único ni por conclusión | Confirmada | **Alto** | Confianza | Media | **Sí** (Z1/Z3/Z4 dependen de ella) |
| D‑4 | Página Plan no reconoce el plan cargado | Confirmada | **Medio** | Confianza | Baja | No |
| D‑8 | Estados vacíos sin «pendiente de confirmar/importando» (Clientes, Tráfico, Cross‑sell) | Confirmada | **Medio** | Experiencia | Baja | No (durante integración) |
| D‑9a | Móvil: jerarquía y longitud (Home 5 400 px, Pacing 16 400 px, catálogo de Recovery 7 500 px) | Confirmada | **Medio** | Experiencia | Media‑alta | No: se resuelve **con** la integración (Z1–Z5 «3 de N») |
| D‑9b | Móvil: `link-btn` 20 px, enlaces en línea 19 px, modal de bienvenida y botón «Asistentes» superpuestos | Confirmada | **Bajo/Medio** (accesibilidad) | Experiencia | Baja | No |
| D‑10 | Z2 sin especificación ejecutable (limitación L‑03) | Documentada | **Medio** | Cobertura del diseño | Media | Antes de integrar Z2 |
| D‑11 | Home incorpora ninguna pieza de Fase 3; D‑01…D‑07 sin implementar | Documentada | Alto (alcance) | — | — | Es el objetivo de la Fase 4 |

**Resolver antes de integrar el Home:** D‑1, D‑5 (adaptadores individuales), D‑6, el contrato de confiabilidad y la regla de fuente de sesiones. **Pueden resolverse durante la integración:** D‑2 (con pruebas de equivalencia), D‑4, D‑8, D‑9. **Antes de mostrar totales:** D‑7/D‑06.
