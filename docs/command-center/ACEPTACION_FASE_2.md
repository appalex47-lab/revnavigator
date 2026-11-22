# Resolución formal de aceptación — Fase 2 (Arquitectura de inteligencia comercial)

**Resolución.** El usuario aprobó expresamente, mediante la instrucción «Formalización de aceptación de Fase 2», el **Punto A** (modelo unificado de atribución) y el **Punto B** (modelo económico dual), ambos bajo la condición **COMPLETADOS CON LIMITACIONES DOCUMENTADAS**.

**Estado de la Fase 2: COMPLETADA Y FORMALMENTE ACEPTADA CON LIMITACIONES DOCUMENTADAS.**
**Fase 3: NO INICIADA** hasta recibir una instrucción independiente y expresa del usuario.

La aceptación es **metodológica y documental**. No autoriza operaciones de Git ni el inicio de la Fase 3.

## 1. Qué se aceptó

### Punto A — Atribución
- `FP.attribution.attributeSegment` como **fuente única de verdad** de la atribución por escenario.
- Los **nueve estados**: `ok`, `sin_trafico_actual`, `conversion_cero_actual`, `recuperacion_desde_cero`, `sin_base_comparable`, `cambio_de_composicion`, `sin_actividad`, `datos_insuficientes`, `no_calculable`.
- El invariante: traffic + cr + aov + sin atribuir = Δ venta.
- El tratamiento explícito de escenarios sin base comparable (sin porcentajes forzados).
- La alineación de los consumidores (`trafficConversionEngine.effects`, `homeSummaryEngine`, `funnelEngine`, `analistaStory`, `driverEngine`).
- Las pruebas y regresiones reportadas (§3).

### Punto B — Modelo económico dual
- `FP.economics` (`js/economics/impactModel.js`).
- Contrato `cc.economic_impact` v2 y compatibilidad con v1.
- Impacto en ventas siempre disponible.
- Contribución bruta estimada condicionada a la configuración del margen.
- Configuración opcional y persistente (`state.settings.economics`).
- Prevención del doble conteo (alternativas excluyentes y oportunidades superpuestas).
- Independencia de los motores comerciales.
- Pruebas de escenarios y de persistencia (§3).

## 2. Limitaciones aceptadas (documentadas; no son defectos pendientes de aceptación)

### Limitaciones del Punto A (atribución)
1. `effects()` continúa siendo **secuencial** («un factor a la vez»); unificarlo con Shapley cambiaría vistas.
2. La **mezcla de segmentos nuevos o desaparecidos conserva dos definiciones** (`driverEngine.mixEffects` y `trafficConversionEngine.analyze().mix`).
3. **No existe umbral de exceso de venta sin atribuir**: las vistas indican lo no atribuido, pero no hay un límite a partir del cual el reparto por factor se considere demasiado parcial.

### Limitaciones del Punto B (modelo económico dual)
1. **La contribución no aparece todavía en las vistas** de resultados; existen el módulo, los adaptadores, la configuración y las pruebas.
2. **No existe margen por categoría o SKU**; solo el margen general y el punto de extensión `resolveMargin`.
3. La **clasificación `estimada` no se emite sin calibración**.

### Limitaciones generales de la Fase 2 (heredadas del cierre de la fase)
- Los contratos de hallazgo, estado y severidad son especificación ejecutable (`tools/audit/command-center-contracts.js`), no código de producción; su integración visual es Fase 3/4.
- Estado y severidad se probaron con datos de demostración modificados, no con datos de producción.
- Cohere sigue sin prueba en vivo (limitación heredada de Fase 1).

> **Corrección de referencia.** En el informe de entrega del cierre metodológico, el apartado F del Punto A decía «quedan las tres limitaciones menores del punto B de este informe», lo que podía leerse como si las limitaciones del Punto B pertenecieran al Punto A. La atribución correcta es la de esta sección: tres limitaciones del Punto A (atribución) y tres del Punto B (modelo económico dual), cada una documentada en su propio documento (`ATRIBUCION_FUENTE_DE_VERDAD.md` §7 y `MODELO_CUANTIFICACION_ECONOMICA.md` §8).

## 3. Evidencia de pruebas: quién ejecutó qué
**Ejecutado por el desarrollador (Claude), en esta sesión, sobre el código final sin commit** (rama `ccr-a81af632-rirtu7`, base `a2b3863`):

| Prueba | Resultado |
|---|---|
| `tools/test-*.js` (Node) | 97 archivos, 0 fallas; incluye `test-atribucion-escenarios.js` (64), `test-economia-dual.js` (64) y `test-fase2-contratos.js` (69) |
| `tools/selftest-node.js` | 233 de 233 |
| `lint_design.py` | 193 hallazgos (igual que la línea base) |
| Baterías de navegador (`run_batch.py`) | 181 baterías, todas con código de salida 0 en la corrida completa final; incluyen `batch_fase2_modelo_real.py` (25) y `batch_fase2_margen.py` (26) y la golden del reporte |
Durante el desarrollo hubo corridas intermedias con fallas (una prueba que listaba secciones exactas de Configuración, un empate de $0.50 en la descomposición de segmentos, la golden del reporte bit a bit y un fallo no reproducible de `batch_editorial`); se corrigieron antes de la corrida final.

**Aceptación metodológica del usuario:** consiste en la revisión y aprobación expresa de los puntos A y B recogida en esta resolución. **No** consiste en que el usuario haya ejecutado esas pruebas; esta formalización documental tampoco volvió a ejecutarlas (solo modificó documentos).

## 4. Pendientes que no impiden la aceptación
- Integración visual de impacto en ventas, estado general y contribución en el Command Center (Fase 3 / Fase 4).
- Adaptadores de `cc.finding` y estado del negocio como código de producción (Fase 4).
- Productor único de `growthVsComparable`; unificación de umbrales fragmentados; movimiento de la orquestación de escenarios fuera del código de vista (Fase 4).
- Margen por categoría/SKU y calibración del impacto esperado (evolución futura, sin compromiso de fase).
- Validación en vivo de Cohere y de la concurrencia con dos conexiones en Supabase (heredadas de Fase 1).
- Operaciones de Git (commit/push) y limpieza de ramas y PRs: pendientes de autorización expresa del usuario.
