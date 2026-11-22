# Propuesta de arquitectura de integración del Command Center

> **Propuesta, no implementada ni autorizada.** Commit `625daec`. Distingue A (existente), B (aprobada documentalmente), C (propuesta) y D (cambios necesarios).

## A. Arquitectura existente (verificada)
Aplicación **estática** sin compilación: `index.html` carga ≈ 233 módulos `FP.*` en el espacio global; estado compartido `FP.app.state` en `js/app.js` (≈ 6 000 líneas); motores puros (`calculations/`, `forecast/`, `diagnostics/`, `analytics/`, `scenarios/`) que consumen `state.store` (registros canónicos); vistas en `ui/` que escriben HTML; Home = `home-view` + `home-resumen` + `homeSummaryEngine` + `attentionEngine` + `contextEngine`. Persistencia: localStorage + IndexedDB; nube con sesión.

## B. Arquitectura aprobada (Fase 3)
NAV · BC · Z1 Qué está pasando · Z2 Contexto y desempeño · Z3 Qué merece atención · Z4 Qué puedo hacer · Z5 Oportunidades y visión de conjunto (evidencia secundaria). Contratos `cc.finding` y `cc.economic_impact` v2; confiabilidad de 4 niveles; reglas de comunicación T1–T6, A1–A7, C1–C20, P0–P12; decisiones D‑01…D‑07 (aceptadas, sin implementar).

## C. Arquitectura propuesta para integración
**Principio:** una **capa de lectura (read model)** entre motores y vistas, sin tocar los motores ni reescribir el Home de golpe.
```
state.store ─▶ motores existentes (sin cambios) ─▶ ADAPTADORES (nuevos, puros) ─▶ READ MODEL «command-center» ─▶ vistas Z1–Z5 (presentación)
```
1. **Adaptadores puros** (`js/commandCenter/adapters/*.js`, nuevos): convierten la salida de cada motor existente en elementos con identidad (`cc.finding`, `cc.economic_impact`). No recalculan: **leen** (`gap`, `forecastEngine`, `driverEngine`, `recoveryEngine`, `attentionEngine`, `actionPlan`, `quality`). Cada adaptador lleva una **prueba de equivalencia numérica** contra el cálculo actual.
2. **Una sola función por concepto** consumida por todos: estado frente al plan (resuelve D‑1), confiabilidad (nivel + completitud + causas), impacto. Los duplicados (brecha, CR, AOV) se **redirigen** a `metrics`/`derivations`/`gap` **solo** donde la prueba de equivalencia lo permita; no se borran en bloque.
3. **Read model inmutable por corrida** (`buildCommandCenter(state)` → `{ z1, z3, z4, z5, evidence, warnings }`): trazable (cada elemento con id, fuente, periodo, motor), sin importes duplicados (propiedad única, H‑01), con totales **solo** cuando D‑06 los permita.
4. **Estados:** vacío / cargando / sin confirmar (nuevo: «archivos pendientes de confirmar», resuelve D‑8) / parcial / completo; cada estado expresa qué falta (D‑05).
5. **Confiabilidad:** el read model calcula el nivel y **gobierna** qué se muestra (modos de Z3/Z4); la narrativa recibe el nivel y no puede afirmar más.
6. **Narrativa/IA:** consume el read model; solo redacta; validadores (T/A/C) rechazan causas no comprobadas; hipótesis siempre aparte.
7. **Desacople:** vistas nuevas (`ui/commandCenter/*`) leen el read model; el Home actual **coexiste** detrás de un interruptor (`state.ux.homeVersion`) hasta que la prueba de equivalencia y la validación UX se cumplan. Los módulos existentes no cambian.
8. **Extensibilidad:** un adaptador nuevo = un motor nuevo conectado sin tocar las vistas; los contratos versionados (`cc.*` v1/v2).

## D. Componentes que necesitan cambios
| Componente | Cambio | Tipo |
|---|---|---|
| `home-resumen.js` / `contextEngine.js` | Usar una sola clasificación de estado | Corrección |
| `attentionEngine.js` | Emitir elementos `cc.finding` con clase y vigencia (o un adaptador encima) | Extensión |
| `FP.economics` | Conectar adaptadores `fromGap/fromSimulation/fromRecovery` (ya existen) | Integración |
| `planning-view.js` | Reconocer el plan cargado | Corrección/UX |
| `customers-view`, `crosssell-view`, `segments-view` | Estado «archivo pendiente de confirmar» | UX |
| `js/commandCenter/*` (nuevo) | adaptadores, read model, vistas Z1–Z5 | **Nuevo** |
| `combineImpacts` | Resolver D‑06 (alternativas A–D de `DIAGNOSTICO_COMBINEIMPACTS.md`) | **Corrección prioritaria (4.5)** |
No se propone tocar: `attribution.js`, `metrics.js`, `forecastEngine`, `reforecastEngine`, `driverEngine` (salvo hallazgos probados).
