# Cambio autorizado D-05 en Z1 — afirmación «datos completos»

> Autorización: instrucción del usuario del 12 de noviembre de 2026 («Autorizo modificar el documento aceptado de Z1 estrictamente para corregir esta afirmación y sus condiciones de uso»). Alcance **cerrado** a 5 archivos de Z1; registro de hashes en `generated/MODIFICACIONES_AUTORIZADAS.json`. Estado: **corregido y probado con datos simulados; sin validación externa; sin integración en la aplicación real**.

## 1. Problema
La especificación de Z1 cerraba todo veredicto de confiabilidad *Alta* con «Lectura sustentada en datos completos.», aunque la regla aceptada C3 (confianza por conclusión) permite *Alta* con sesiones o pedidos faltantes, cobertura de días menor que 100 % o actividad ausente. Resultado: una afirmación positiva de completitud sin comprobación (escenario A7: pedidos no disponibles). D-05 exige no declarar datos completos sin comprobarlo.

## 2. Dónde estaba la frase y variantes
| Ubicación | Texto |
|---|---|
| `z1-lectura-ejecutiva.js` (veredicto, 2 puntos) | «Lectura sustentada en datos completos.» |
| `FASE_3_2_RESUMEN_EJECUTIVO.md` §5.4 y ejemplos de escenarios 2 y 14 | misma frase |
| `FASE_3_2_ESCENARIOS_Z1.md`, `generated/ESCENARIOS_Z1.json`, `wireframes/z1_3_2_wireframe.html` | generados desde la especificación |
| Variantes semánticas revisadas (no son afirmación de completitud, se conservan) | «Se apoya en N días contados y en datos sin avisos.» · «La lectura se apoya en datos sin avisos.» · «Sin limitaciones relevantes en los datos de este periodo.» |
Una pieza adicional, la sección «Confiabilidad y cobertura» (Z5) del prototipo, decía «Sin motivos que advertir» sin mencionar la completitud; ahora muestra su estado.

## 2b. Condiciones antes y después
| | Antes | Después |
|---|---|---|
| Cuándo aparecía | Siempre que la confiabilidad fuera *Alta* | Solo con completitud **verificada**: cobertura de días = 100 %, sesiones, pedidos y venta de actividad presentes, sin avisos ni errores de calidad |
| Faltan datos conocidos | Igual «datos completos» | «Lectura calculable; la información disponible está incompleta.» y, en limitaciones (narrativa ampliada, Alta), «Falta información: …» con lo que falta |
| No se puede comprobar (sin medida de actividad) | Igual «datos completos» | «No es posible confirmar que la información esté completa.» |
| Métricas calculables | Se mostraban | **Se siguen mostrando** (sin cambios) |
| Confiabilidad, estado, cifras, visibilidad | — | **Sin cambios** (probado en 4 030 entradas) |
| Causa de la ausencia | No se inventaba | No se interpreta |

## 3. Diferencias exactas (especificación)
Salida nueva `completeness` { status, missing[], note, evidence[] }; función `completenessOf`; cierre del veredicto condicionado; nota en limitaciones (solo con confiabilidad *Alta* y completitud no verificada). Diff (`diff` de la versión aceptada contra la actual):
```diff
98a99,110
>   /* ===== D-05 (12-nov-2026): la completitud de los datos solo se afirma si se puede comprobar. Estados: verificada · incompleta (se dice qué falta) · no_verificable.
>      No cambia la confiabilidad ni invalida ninguna métrica calculable: solo gobierna lo que el texto afirma sobre la integridad del conjunto. ===== */
>   function completenessOf(i, act) {
>     const r = i.reliability || {}, missing = [];
>     if (act.known) { if (!fin(act.sessions)) missing.push('sesiones'); if (!fin(act.orders)) missing.push('pedidos'); if (!fin(act.revenue)) missing.push('venta del agregado de actividad'); }
>     if (fin(r.coverage) && r.coverage < 1) missing.push('días sin comparar');
>     if (r.dataErrors || r.support === 'bajo' || (r.warnings || []).length || (r.blocking || []).length) missing.push('datos con avisos de calidad');
>     const status = missing.length ? 'incompleta' : (!act.known || !fin(r.coverage)) ? 'no_verificable' : 'verificada';
>     const note = status === 'incompleta' ? `Falta información: ${missing.map((m) => (m === 'días sin comparar' ? `${m} (${Math.round((1 - r.coverage) * 100)} %)` : m)).join(', ')}. Las métricas calculables se muestran; no se interpreta el motivo.`
>       : status === 'no_verificable' ? 'No es posible confirmar que la información del periodo esté completa.' : 'Se verificaron los días comparados y las tres medidas de actividad.';
>     return { status, missing, note, evidence: status === 'verificada' ? ['cobertura de días = 100 %', 'sesiones, pedidos y venta de actividad presentes', 'sin avisos ni errores de calidad'] : [] };
>   }
184a197
>     const cpl = completenessOf(i, ev.act), closing = cpl.status === 'verificada' ? ' Lectura sustentada en datos completos.' : cpl.status === 'incompleta' ? ' Lectura calculable; la información disponible está incompleta.' : ' No es posible confirmar que la información esté completa.';
264c277
<       verdict = mode === 'con_avisos' ? `Con avisos: ${lowerFirst(s)} Conclusión con reservas.` : `${s} Lectura sustentada en datos completos.`;
---
>       verdict = mode === 'con_avisos' ? `Con avisos: ${lowerFirst(s)} Conclusión con reservas.` : `${s}${closing}`;
266c279
<       if (mode === 'definitiva') verdict = `${s} Lectura sustentada en datos completos.`;
---
>       if (mode === 'definitiva') verdict = `${s}${closing}`;
287c300
<     const limit = [...ev.reasons]; if (eco.contribution.status === 'no_configurado') limit.push('No se estima contribución: el margen no está configurado.'); if (eco.contribution.status === 'invalido') limit.push('No se estima contribución: el margen guardado no es válido.'); if (eco.contribution.status === 'no_confirmado') limit.push('No se estima contribución: el margen de 0 % no está confirmado.');
---
>     const limit = [...ev.reasons]; if (level === 'Alta' && cpl.status !== 'verificada') limit.push(cpl.note); if (eco.contribution.status === 'no_configurado') limit.push('No se estima contribución: el margen no está configurado.'); if (eco.contribution.status === 'invalido') limit.push('No se estima contribución: el margen guardado no es válido.'); if (eco.contribution.status === 'no_confirmado') limit.push('No se estima contribución: el margen de 0 % no está confirmado.');
320a334
>       completeness: cpl,
```
Documentos y artefactos: `FASE_3_2_RESUMEN_EJECUTIVO.md` (fila «Definitiva (Alta)» de §5.4 y nueva §5.5); `FASE_3_2_ESCENARIOS_Z1.md` y `generated/ESCENARIOS_Z1.json` y `wireframes/z1_3_2_wireframe.html` regenerados con `tools/audit/z1-generar-artefactos.js` **sin modificar el generador**: el único escenario con texto distinto es **A7** (veredicto y limitaciones); los otros 29 conservan su texto y el JSON añade el campo `completeness`.

## 4. Lo que NO se tocó
Fórmula de ventas, motor de cálculos y atribución, contratos de Fase 2, `impactModel.js`/`combineImpacts`, `command-center-contracts.js`, el generador, las demás reglas de Z1 y su arquitectura, `index.html`, `js/` y `css/`.

## 5. Verificación (ejecutada)
- `tools/test-fase3-d05-completitud.js`: regresión contra la copia de la especificación aceptada (`tools/audit/_historico/z1-lectura-ejecutiva.v3.2-aceptada.js`, mismo hash que la línea base de 3.3): nivel, modo, estado, economía, conclusiones, alcance y visibilidad **idénticos** en 4 030 entradas; el único cambio del veredicto es su frase final; «datos completos» solo con completitud verificada; escenarios con sesiones/pedidos faltantes, cobertura parcial y sin actividad; 4 mutaciones detectadas.
- `tools/test-fase3-2-z1.js` (91 invariantes sobre 4 000 entradas aleatorias): sin fallas; el veredicto sigue cumpliendo R1–R14.
- Verificadores documentales 3.1–3.5: consistentes (con el registro de hashes de la modificación autorizada; cualquier otro cambio a esos archivos se sigue detectando).
- Efecto en otras capas: detector C18 (completitud no comprobada) y C19 (Z1 dice incompleta y Z3 no lo dice) añadidos a `coherencia-zonas.js`.

## 6. Pendiente
Implementación en la aplicación real (Fase 4.2/5), validación con datos reales y con usuarios, y la decisión de si la frase «sin avisos» de la narrativa corta debe matizarse (no se cambió: describe avisos, no completitud).
