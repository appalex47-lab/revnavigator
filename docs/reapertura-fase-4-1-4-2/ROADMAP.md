# Roadmap consolidado (reapertura de 4.1 y 4.2)

Alcance: exclusivamente RevNavigator Command Center Intelligence; RGT Execution OS excluido.

| Fase | Estado real | Dependencias | Observación |
|---|---|---|---|
| 1 Fundamentos y contratos | ✅ Aceptada | — | — |
| 2 Motores y reglas de negocio | ✅ Aceptada | 1 | — |
| 3 Diseño/UX/especificación del Command Center | ✅ Aceptada (la maqueta es referencia de diseño) | 2 | sin integrar la maqueta |
| 4.1 Fuentes y contexto | ✅ Trabajo técnico completado (reapertura); **requiere tu aceptación** | 3 | única dependencia externa: validación GA4 real (E-2) |
| 4.2 Diagnósticos | ✅ Trabajo técnico completado (reapertura); **requiere tu aceptación** | 4.1 | consumidores reales conectados |
| 4.3 Patrones y desviaciones | ⏳ NO iniciada | 4.1/4.2 aceptadas | — |
| 4.4 Prioridades | ⏳ | 4.3 | — |
| 4.5 Impacto económico | ⏳ (D-01, D-06, `impactModel`, `combineImpacts` reservados) | 4.3 | — |
| 4.6 Cierre e integración | ⏳ | 4.2–4.5 | integración visual del Home |

---

## Resultado de la validación externa real (2026-11-20)

E-1 aprobada; E-3 aprobada (calidad declarada `warnings`); E-2 ejecutada con **limitación aceptada por el usuario**: `traffic_volume` de ecommerce anterior a 2026-10-05 y de app anterior a 2026-09-25 (y app 2026-10-02) no coincide con GA4 (cambio de origen sin explicar). Detalle, alcance y condiciones: [`docs/validacion-externa/LIMITACION_E2_TRAFFIC_VOLUME.md`](../validacion-externa/LIMITACION_E2_TRAFFIC_VOLUME.md). La limitación está documentada, **no impuesta por código** (decisión pendiente). Esto no equivale a la aceptación formal de 4.1/4.2, que corresponde al usuario.
