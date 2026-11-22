# Roadmap consolidado tras el cierre técnico

**Subfase actual: cierre técnico 4.1/4.2 completado (pendiente de tu aceptación). 4.3 NO iniciada.**

| Fase | Estado | Alcance | Limitaciones | Dependencias | Autorización pendiente |
|---|---|---|---|---|---|
| 1 Auditoría/línea base | ✅ Aceptada | — | — | — | — |
| 2 Contratos Command Center | ✅ Aceptada | — | — | 1 | — |
| 3 (3.1–3.5) Diseño/spec | ✅ Aceptada (la maqueta es referencia de diseño, no integración) | — | — | 2 | — |
| 4.1 Integridad y contraste | ✅ Entregada y **cerrada técnicamente** | regla de estado, sesiones, catálogo, contratos | ver `MATRIZ_LIMITACIONES.md` | 3 | aceptación |
| 4.2 Integración de contratos | ✅ Entregada y **cerrada técnicamente** | Z1, confiabilidad, P-12, P-13 (2/3), P-16 | ídem | 4.1 | aceptación |
| **Cierre técnico 4.1/4.2** | 🛠 Completado | umbrales únicos, textos=config, Z1 generado, paridad real, mecanismo de sesiones, auditoría de pruebas | T-01…T-06, R-01…R-03, B-01…B-04 | 4.2 | aceptación |
| 4.3 Hallazgos y consumo de confiabilidad | ⏳ **No iniciada, no autorizada** | primer consumidor real de `reliability`/`z1`/`findings`/`sampleSufficiency.evaluate` | T-01…T-03 | cierre aceptado; P-17, P-19, P-20 | Sí |
| 4.4 Acciones | ⏳ | `actionRef` | — | 4.3 | Sí |
| 4.5 Impacto económico | ⏳ | D-01, D-06 | — | 4.3 | Sí |
| 4.6 Integración Home / Command Center | ⏳ | visual | — | 4.2–4.5 | Sí |
| 5 Validación con datos reales | ⏳ | tolerancias, Z1 con producción | R-01…R-03 | 4.x | Sí |
| 6 Operación | ⏳ | — | — | 5 | Sí |

---

## Resultado de la validación externa real (2026-11-20)

E-1 aprobada; E-3 aprobada (calidad declarada `warnings`); E-2 ejecutada con **limitación aceptada por el usuario**: `traffic_volume` de ecommerce anterior a 2026-10-05 y de app anterior a 2026-09-25 (y app 2026-10-02) no coincide con GA4 (cambio de origen sin explicar). Detalle, alcance y condiciones: [`docs/validacion-externa/LIMITACION_E2_TRAFFIC_VOLUME.md`](../validacion-externa/LIMITACION_E2_TRAFFIC_VOLUME.md). La limitación está documentada, **no impuesta por código** (decisión pendiente). Esto no equivale a la aceptación formal de 4.1/4.2, que corresponde al usuario.
