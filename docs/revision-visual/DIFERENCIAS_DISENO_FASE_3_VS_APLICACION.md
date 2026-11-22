# Diferencias entre el diseño de la Fase 3 y la aplicación real

> Fase 3 aceptada con limitaciones documentadas **como diseño y especificación**: no está integrada en el Home real. Las capturas históricas (`docs/command-center/**/capturas_*`) **no son** una versión ejecutable actual; lo ejecutable es la aplicación (`/index.html`) y el prototipo (`/docs/command-center/prototipo/home_3_5_prototipo.html`, datos simulados). La captura `diseno_propuesto_escenario_A7.png` está desactualizada (anterior a D-05).

## Cómo ver cada cosa
| Qué | Dónde | Naturaleza |
|---|---|---|
| Aplicación real (Home actual) | `http://127.0.0.1:8765/index.html#inicio` | Ejecutable, estructura **anterior** a Fase 3 |
| Prototipo del Home inteligente | `http://127.0.0.1:8765/docs/command-center/prototipo/home_3_5_prototipo.html` | Prototipo navegable, 6 situaciones simuladas |
| Wireframes de Z1, Z3, Z4 | `docs/command-center/wireframes/*.html` | Diseño estático |
| Capturas | `docs/command-center/**/capturas_*` y `docs/revision-visual/capturas/` | Evidencia (las de `command-center` son históricas) |

## Comparación (verificada en esta revisión)
| Elemento de la arquitectura aprobada | Prototipo | Aplicación real | Diferencia |
|---|---|---|---|
| Z1 «Qué está pasando»: veredicto | Sí (reglas R1–R14, estado «En riesgo de incumplir el plan», completitud D-05) | Sí, con otro texto («Vas en plan: 99.9 %…») y sin etiqueta de estado | Redacción y estado distintos; sin la frase de completitud |
| Confiabilidad Alta/Media/Baja/Insuficiente | Pieza visible con motivos y modos | Chip «Confiabilidad: 2 con aviso» (otro vocabulario) | Vocabulario y modos de Z3/Z4 no existen |
| Barra de respuestas rápidas (5 preguntas) | Sí | **No existe** | Falta |
| Z2 «Contexto y desempeño» | Estructura simple | «¿Por qué va así?» plegable | Parcial |
| Z3 «Qué merece atención» con ◆ hallazgo ▲ riesgo ● oportunidad, filtros, «Nuevo» | Sí | «Qué necesita atención» con 3 hallazgos (datos, venta, avisos), sin riesgos ni oportunidades | Falta clasificación, filtros e importes por elemento |
| Z4 «Qué puedo hacer» (acciones que citan un elemento) | Sí | «Tu siguiente mejor paso» (ruta de 5 pasos) | Otra lógica; sin vínculo al hallazgo |
| Z5 «Oportunidades y visión de conjunto» (tres niveles, evidencia desplegable) | Sí | «Ver más» (¿Cómo voy en detalle?, ¿Por qué…?, ¿Qué tan confiable es?) | Estructura distinta; sin visión de conjunto de oportunidades |
| «Desde ayer» | Marca «Nuevo» sobre elementos | Bloque aparte | Parcial |
| Impacto económico y contribución | Con rango y supuestos | Solo configuración de margen en Ajustes; el Home no lo consume | Falta integrar |
| Accesibilidad (h1/h2, salto al contenido, contraste) | Verificada de forma automatizada | Enlace «Saltar al contenido» presente; resto no auditado aquí | No comparable |
| Responsive 375–430 | Verificado en el prototipo | Sin desborde; Home ≈ 5 700 px; 16–18 controles < 24 px | La app real es más larga |
Detalle formal en `docs/command-center/MATRIZ_CORRESPONDENCIA_PROTOTIPO_APP.md` (19 elementos: 0 completos en la app, 11 parciales, 8 inexistentes).

## Qué es real y qué es prototipo
- **Real y operativo:** todo el inventario de `INVENTARIO_MODULOS_VISUALIZABLES.md`.
- **Solo prototipo / especificación:** Z1 con estado y completitud, respuestas rápidas, Z3 con clases y filtros, Z4 con acciones vinculadas, Z5 en tres niveles, relaciones de inclusión (la brecha del canal no se suma a la total), reglas de coherencia C1–C20.
- **Pendiente de integración:** todo lo anterior (Fases 4–5 según el roadmap) y la implementación de D‑01 a D‑07.
