# Matriz de correspondencia: prototipo 3.5 ↔ aplicación real (Home)

> Evidencia: `tools/regression/batch_fase3_correspondencia.py` (solo lee el Home real; resultado en `generated/CORRESPONDENCIA_HOME_REAL.json`) y la auditoría 3.1.
> **El Home real no se modificó en la Fase 3.** Todo lo de la columna «Prototipo» es un diseño ejecutable en `docs/command-center/prototipo/` y `tools/audit/`; ninguna pieza se publicó ni está integrada.
> Estados: *Existe* (ya está en la aplicación) · *Parcial* · *Solo prototipo* · *Solo especificación/documento* · *Solo capturas*.

| Elemento | Prototipo | Aplicación real | Estado | Acción requerida |
|---|---|---|---|---|
| Veredicto de Z1 | Texto por regla R1–R14 según confiabilidad | `[data-home-verdict]` con reglas propias del Home | Parcial | Fase 4.1–4.2: motor de lectura ejecutiva; luego integrar |
| Etiqueta de estado del negocio | «En riesgo de incumplir el plan», «En deterioro»… | No existe | Solo prototipo | Fase 4.1: `classifyBusinessState` (hoy solo en `tools/audit`) |
| Cifra protagonista con base | Brecha/venta con su base y dirección | Resumen general con cifras propias | Parcial | Fase 4.2 y aprobación funcional de la regla |
| Confiabilidad Alta/Media/Baja/Insuficiente | Pieza visible con motivos y modos de Z3/Z4 | `[data-home-trust]` con otro vocabulario | Parcial | Fase 4.2: confiabilidad por conclusión; aprobación del vocabulario |
| Respuestas rápidas (5 preguntas) | Barra con enlaces y filtro de oportunidades | No existe | Solo prototipo | Fase 5 (implementación) |
| Z2 «Qué ocurrió y por qué» | Estructura de 3.1 (contexto, desempeño, drivers) | «¿Por qué va así?» plegable | Parcial | Especificar Z2 ejecutable (limitación L-03) |
| Z3 con clases ◆ hallazgo ▲ riesgo ● oportunidad | Tarjetas con certeza, impacto, vigencia, «Nuevo» | Lista de atención `.att__list` con 6 tipos, sin riesgo/oportunidad | Parcial | Fase 4.4: contrato único de hallazgo + clasificación |
| Filtros por clase y «3 de N / Ver todos» | Presentes | No existen | Solo prototipo | Fase 5 |
| Marca «Nuevo» (Desde ayer) | Sobre cada elemento nuevo | «Desde ayer» existe como bloque aparte | Parcial | Unir ambos en 4.4/5 |
| Impacto en ventas y contribución | Con rango, supuesto y procedencia | Economía dual en `js/economics` | Parcial | Conectar el Home a `FP.economics` (hoy no lo consume) |
| Hipótesis aparte, sin causa | Panel «Hipótesis» | No existe | Solo prototipo | Fase 4.4 |
| Z4 «Qué hago» con vínculo al elemento | Acciones derivadas, destino y «Por qué y respaldo» | «¿Qué hago hoy?» / «Tu siguiente mejor paso» sin vínculo al hallazgo | Parcial | Fase 4.4: acciones con vínculo al hallazgo |
| Acciones retenidas por dato faltante | «Datos primero» | No existe | Solo prototipo | Fase 4.4 |
| Z5 «Oportunidades y visión de conjunto» (H-02) | Tres niveles: Oportunidades, Visión de conjunto y Evidencia y detalle (desplegable); especificación `z5-conjunto.js` | «Ver más» y tabla por canal (otra estructura) | Parcial | Integrar en la aplicación (Fase 5) |
| Estados: sin actividad, datos insuficientes, todo en orden | 6 situaciones | Mensajes propios, no por confiabilidad | Parcial | Fase 5 |
| Accesibilidad (h1, h2 por zona, ids únicos, salto al contenido, foco, contraste ≥ 4.5) | Verificada de forma automatizada | Sin enlace «saltar al contenido» | Solo prototipo | Fase 5 + prueba con lector de pantalla |
| Responsive 320–1440 px | Verificado en Chromium emulado | Verificado en 3 anchos en 3.1 | Parcial | Prueba en móviles reales (checklist) |
| Capturas | `prototipo/capturas_3_5`, `wireframes/capturas_3_3`, `capturas_3_4` | — | Solo capturas | Regenerar tras cada cambio |
| Reglas de comunicación (T1–T6, A1–A7, C1–C17) | Ejecutables en `tools/audit/` | No integradas | Solo especificación | Portar a `js/` en Fase 5 |

**Resumen:** de 19 elementos, 0 existen completos en la aplicación; 11 existen de forma parcial (con otra forma o vocabulario) y 8 no existen en ella (6 solo en prototipo, 1 solo en capturas, 1 solo como especificación). La aplicación de producción no cambió.
