# Registro de limitaciones de la Fase 3 (ronda de calidad)

> **Aceptación (12-nov-2026):** el usuario aceptó formalmente 3.3, 3.4 y 3.5 **con estas limitaciones**; todas se conservan: usuarios, móviles reales, lectores de pantalla y datos reales de FESA pendientes (L-01, L-08, L-09); integración en la aplicación real pendiente (L-14); implementación de D-01 a D-07 pendiente (L-04, L-10…L-13, L-17, L-18, L-20, L-21). Ninguna se presenta como completada.

Clases: **CP** Corregido y probado · **CN** Corregido pero no validado externamente · **PD** Pendiente de decisión · **PA** Pendiente de datos o acceso · **PI** Pendiente de integración · **PU** Pendiente de aprobación del usuario.
Responsables: **C** Claude · **U** decisión del usuario · **F** FESA/Finanzas · **S** usuarios finales · **I** dispositivos/infraestructura.

| Id | Limitación | Responsable | Clase |
|---|---|---|---|
| L-01 | Ninguna prueba usa datos reales de FESA | F | PA |
| L-02 | Diseño de baja fidelidad, sin estilo visual ni copy final | C/U | PU |
| L-03 | Z2 y Z5 solo como estructura de 3.1, sin especificación ejecutable propia | C | PU |
| L-04 | Criterio de priorización cualitativo; criterio funcional aceptado (D-04), sin ponderaciones ni fórmula definidas | C | PI (4.4) |
| L-05 | El contrato de acción y la clasificación de hallazgos no existen en el motor | C | PI |
| L-06 | Sin productor de actividad agregada, sin margen por canal/producto, `sin_trafico_actual` sin reconciliar | C/F | PI / PA |
| L-07 | Revisión heurística hecha por el autor; requiere revisión independiente | U | PU |
| L-08 | Pruebas con usuarios no realizadas (protocolo listo) | S | PA |
| L-09 | Móviles reales, lector de pantalla y otros navegadores no probados (checklist listo) | I | PA |
| L-10 | Conciliación: criterio aceptado ($0.01, sin conciliación formal por ausencia de diferencia); faltan reglas de validación y la segunda fuente | C/F | PI (4.1) / PA |
| L-11 | Margen negativo: criterio aceptado (D-01); el motor aún lo rechaza (sin modificar) | C/F | PI (4.5) |
| L-12 | Actividad mínima: criterio aceptado (D-03), sin umbral universal; falta el método de suficiencia de muestra | C | PI (4.2) |
| L-13 | `combineImpacts`: B2/B3/B4 y decisiones C2/D1 (motor sin modificar; Z3 mitiga en pantalla) | C/U | PI (4.5, prioritario; D-06 aceptada) / CN (mitigación) |
| L-14 | El Home real no tiene ninguna pieza del prototipo integrada (matriz de correspondencia) | C | PI |
| L-15 | Contraste, tamaños, objetivos táctiles, encabezados, ids, foco y orden de tabulación verificados solo de forma automatizada en Chromium emulado | I/S | CN |
| L-16 | Longitud percibida en móvil: la página alta mide ≈ 3 670 px a 390 px (antes 3 636 px, con la barra de respuestas rápidas añadida); no se redujo el diseño aceptado de Z1; la compactación de supuesto/contribución sí se aplica en ≤ 700 px | C/S | CN |
| L-17 | «Datos completos» en Z1: **corregido en la especificación** con autorización (`CAMBIO_AUTORIZADO_D05_Z1.md`; probado con datos simulados); falta la aplicación real y validación externa | C | CP (especificación) / PI (4.2) / PA |
| L-18 | Rótulos de zonas: equivalencias documentadas (`EQUIVALENCIAS_ZONAS_D07.md`); no se renombró nada | C | CP (documental) / PI (5.x) |
| L-20 | H-01 y H-02 (D-07): **resueltos** como aclaraciones derivadas de D-07 (`ACLARACION_H01_H02_PROPIEDAD_Z5.md`); implementados en especificación y prototipo; la aplicación real no los incorpora | C | CP (especificación y prototipo) / PI |
| L-21 | Z5 «Oportunidades y visión de conjunto»: especificada y probada con datos simulados; la visión de conjunto es cualitativa (sin cifras, D-06) y falta integrarla en la aplicación, validarla con usuarios y definir el orden de prioridad (4.4) | C | PI / PA |
| L-22 | La captura `wireframes/capturas_3_2/diseno_propuesto_escenario_A7.png` muestra el veredicto anterior a D-05: se conserva como **evidencia histórica desactualizada** (identificada en `wireframes/capturas_3_2/LEEME_CAPTURAS_3_2_A7_HISTORICA.md`); no representa el diseño vigente; no se regeneró | C/U | CP (identificada) / PU (regenerarla) |
| L-19 | Derivación Z1→Z3→Z4 es una simulación (supone, p. ej., la parte de la brecha del canal); con datos reales deberá venir de los motores | C | PI |

## Corregido y probado en esta ronda (CP)
Z3 «Nuevo»; Z4 acciones retenidas por dato faltante; derivación coherente entre capas (C1–C20, 3 000 + 2 000 lecturas aleatorias); doble conteo de la brecha total y la del canal (C20); C17 (conversión no verificable); encabezados h1/h2/h3, ids únicos, `aria-labelledby` de Z3/Z4; botones de destino de Z4 a ancho completo en móvil; compactación móvil; barra de respuestas rápidas.
