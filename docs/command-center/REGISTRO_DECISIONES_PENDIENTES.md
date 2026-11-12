# Registro de decisiones funcionales de la ronda de calidad de la Fase 3 (D-01 a D-07)

> Registro oficial único (no se duplica): sustituye al «registro de decisiones pendientes» anterior. Los identificadores D-01 a D-07 de **este** registro son distintos de los D-01 a D-06 de la Subfase 3.2 y de los D-01 a D-04 de la 3.1, que siguen vigentes en sus documentos.
> **Estado de las siete: ACEPTADAS POR EL USUARIO · fecha de aprobación: 12 de noviembre de 2026.**
> **Actualización (12-nov-2026):** el usuario aceptó formalmente las subfases 3.3, 3.4 y 3.5 con limitaciones documentadas y cerró la Fase 3 como diseño y especificación; **ninguna de D-01 a D-07 está implementada** (ver §2).
> Una decisión aceptada **no** implica especificación ejecutable, implementación, pruebas, validación externa, integración en la aplicación real ni publicación. Esos niveles se registran por separado más abajo.

## 1. Decisiones aceptadas

### D-01 · Tratamiento de márgenes negativos
- **Criterio aprobado:** mostrar márgenes negativos cuando estén respaldados por información válida; distinguirlos de un margen no configurado; no ocultar automáticamente pérdidas reales; mantener diferenciados datos observados, calculados y estimados.
- **Consecuencias para el producto:** un margen negativo válido deja de rechazarse y se presenta como tal (con su procedencia y como estimación); «no configurado», «0 % explícito» y «negativo» son tres estados distintos con mensaje propio; la contribución negativa no se omite.
- **Fase de implementación/validación:** implementar en **4.5** (cálculo del impacto económico; hoy `impactModel.js` rechaza márgenes < 0 y **no se modificó**) con captura de margen en **4.1**; validar con Finanzas/FESA en **6.2**.
- **Dependencias y limitaciones:** definir qué hace válida la información de respaldo (fuente, vigencia, alcance); la fórmula y los textos de «contribución bruta estimada» deberán revisarse; no existe margen por canal o producto.

### D-02 · Conciliación entre fuentes
- **Criterio aprobado:** toda diferencia superior a **$0.01** queda pendiente de conciliación; la ausencia de diferencia observada no equivale a conciliación formal; no declarar conciliadas las fuentes sin evidencia ni reglas de validación suficientes.
- **Consecuencias:** nunca se muestra «conciliado» solo porque no se vea diferencia; el estado por defecto es «sin conciliar formalmente»; el umbral es absoluto, no un porcentaje (se descarta cualquier tolerancia del 1 %).
- **Fase:** especificar y implementar en **4.1** (integración de fuentes) y **4.2**; validar con datos reales en **6.2**.
- **Dependencias y limitaciones:** hay que definir las «reglas de validación suficientes» y qué evidencia permite declarar una conciliación formal; la especificación de Z1 ya marca la conciliación como pendiente y no aplica tolerancia porcentual, pero **no está verificada contra el umbral de $0.01**. Requiere una segunda fuente (FESA).

### D-03 · Actividad mínima
- **Criterio aprobado:** evaluar la confiabilidad considerando el volumen de actividad disponible; no inventar un umbral universal; mostrar cuándo una muestra es insuficiente para interpretaciones sólidas; diferenciar ausencia de actividad de ausencia de información.
- **Consecuencias:** la confiabilidad incorpora el tamaño de la muestra y lo dice; no hay un número mágico único; «sin actividad» (cero verificado) y «sin dato» siguen siendo estados distintos.
- **Fase:** **4.2** (motor de diagnósticos: confiabilidad por conclusión) y **4.3**; calibrar con datos reales en **6.2**.
- **Dependencias y limitaciones:** el método para evaluar la suficiencia de la muestra (por conclusión y por escala) está **sin definir ni probar**; hoy Z1 solo distingue cero/no cero y cobertura de días.

### D-04 · Priorización
- **Criterio aprobado:** considerar conjuntamente impacto potencial en ventas, confiabilidad de la información y capacidad real de ejecutar una acción; la rentabilidad complementa cuando exista información configurada y confiable, sin ser requisito para priorizar oportunidades de crecimiento. **No se inventan ponderaciones ni fórmulas definitivas sin documentar y probar su fundamento.**
- **Consecuencias:** el orden de destacados (Z3) y de acciones (Z4) deja de ser puramente cualitativo; una oportunidad sin margen configurado sigue siendo priorizable.
- **Fase:** **4.4** (priorización de riesgos y oportunidades); validar con usuarios en **6.4**.
- **Dependencias y limitaciones:** ponderaciones y fórmula **pendientes** (no se fijan aquí); requiere medir «capacidad real de ejecutar» (contrato de acción con vínculo al hallazgo, hoy inexistente en el motor) y D-06 para el impacto.

### D-05 · Interpretaciones
- **Criterio aprobado:** no afirmar causas que los datos no demuestren; no presentar hipótesis como hechos; no declarar datos completos sin comprobarlo; comunicar qué se conoce, qué no y qué falta; mantener diferenciadas observaciones, cálculos, estimaciones, hipótesis y recomendaciones.
- **Consecuencias:** la frase «datos completos» de Z1 debe condicionarse a una comprobación real (hoy puede aparecer con sesiones faltantes aunque la conversión sea no verificable: limitación L-17); venta con cero pedidos, pedidos sin sesiones y similares siguen sin concluir.
- **Fase:** especificación en **4.2/4.3** (reglas de comunicación y comprobación de completitud); **5.3** y **5.5** (IA: sin causas inventadas); validar con usuarios en **6.4**.
- **Resolución (12-nov-2026, autorización específica del usuario):** la afirmación «datos completos» de Z1 se condiciona a completitud **verificable** (cobertura 100 %, sesiones, pedidos y venta de actividad presentes, sin avisos); con datos faltantes se informa que la información está incompleta y qué falta; sin forma de comprobarlo se dice que no es posible confirmarlo; las métricas calculables no se invalidan. Detalle y diff exacto: `CAMBIO_AUTORIZADO_D05_Z1.md`. **Implementado solo en la especificación y el prototipo; falta la aplicación real (4.2/5) y la validación externa.**
- **Dependencias y limitaciones:** las reglas T1–T6, A1–A7 y C1–C20 cubren gran parte en el diseño, pero **no están integradas**; la frase «sin avisos» de la narrativa corta no se cambió (describe avisos, no completitud).

### D-06 · Agregación de impactos
- **Criterio aprobado:** no consolidar automáticamente impactos superpuestos; evitar duplicidad de oportunidades; evitar pérdida de magnitud o incertidumbre; exigir reglas verificables de identificación, relación, periodo, fuente y superposición; no presentar como confiable un impacto consolidado cuando la metodología no lo permita. **El problema de `combineImpacts` se conserva como asunto técnico prioritario.**
- **Consecuencias:** sin reglas verificables no hay total consolidado (Z3 ya omite la cifra en líneas superpuestas); una cifra consolidada lleva su nivel de confiabilidad o no se muestra.
- **Fase:** **4.5** (resolución técnica y pruebas de `combineImpacts`, con regresión de la Fase 2); validar en **6.2**.
- **Dependencias y limitaciones:** `DIAGNOSTICO_COMBINEIMPACTS.md` (3 defectos y 6 comportamientos dudosos, 22 pruebas de caracterización); **el motor no se ha modificado**; necesita las reglas de identificación/relación/periodo/fuente, aún sin diseñar.

### D-07 · Nomenclatura de zonas
- **Criterio aprobado:** mantener la arquitectura previamente aceptada: Z1 «Qué está pasando», Z2 «Contexto y desempeño», Z3 «Qué merece atención», Z4 «Qué puedo hacer», Z5 «Oportunidades y visión de conjunto»; no modificar la arquitectura funcional por diferencias de nomenclatura en documentos posteriores.
- **Consecuencias:** la arquitectura funcional (NAV · BC · Z1–Z5) no cambia; los nombres de arriba son la nomenclatura aprobada de las zonas.
- **Fase:** conciliar rótulos en documentos y prototipo durante **5.x** (implementación visual); sin cambio funcional.
- **Resolución (12-nov-2026, autorización formal del usuario):** H-01 y H-02 se resolvieron como **aclaraciones funcionales derivadas de D-07** (no se crea D-08): **H-01** cada elemento tiene una única zona propietaria y fuente de verdad, y las demás zonas lo referencian, resumen o proponen acciones (se aclaró la frase de 3.1 §3.1, único cambio al documento aceptado); **H-02** Z5 «Oportunidades y visión de conjunto» se organiza en Oportunidades, Visión de conjunto y, como apartado secundario desplegable, Evidencia y detalle (sin sexta zona, sin trasladar la evidencia a Z2, con las advertencias críticas fuera del desplegable). Detalle: `ACLARACION_H01_H02_PROPIEDAD_Z5.md`; equivalencias: `EQUIVALENCIAS_ZONAS_D07.md`. **Implementado en la especificación ejecutable (`z5-conjunto.js`) y el prototipo, probado con datos simulados; no en la aplicación real.
- **Dependencias y limitaciones (a tu atención):** los documentos de la Subfase 3.1 (aceptados) y los de 3.3–3.5 usan otros rótulos (Z1 «Lectura ejecutiva», Z2 «Qué ocurrió y por qué», Z4 «Qué hago», Z5 «Evidencia y detalle»; las oportunidades viven dentro de Z3). **No los modifiqué** (protegidos). Registro la diferencia como **equivalencia de rótulos** y dejo sin resolver si Z5 «Oportunidades y visión de conjunto» implica mover las oportunidades fuera de Z3: eso sería un cambio funcional que esta decisión excluye; si es lo que pretendes, requiere una instrucción específica.

## 2. Separación de estados (ninguna decisión está implementada)
| Id | Decisión aceptada | Especificación documentada | Implementación | Pruebas técnicas | Validación externa | Integración en la app | Producción |
|---|---|---|---|---|---|---|---|
| D-01 | Sí | No (el motor la contradice hoy) | No | No | No | No | No |
| D-02 | Sí | Parcial (sin tolerancia %, falta $0.01) | No | No | No | No | No |
| D-03 | Sí | Parcial (solo cero/no cero y cobertura) | No | No | No | No | No |
| D-04 | Sí | Parcial (criterio cualitativo) | No | No | No | No | No |
| D-05 | Sí | **Sí** para la afirmación «datos completos» (Z1, `CAMBIO_AUTORIZADO_D05_Z1.md`); reglas T/A/C del resto | En la **especificación ejecutable** de Z1 y el prototipo; no en la aplicación | **Sí**, con datos simulados (`test-fase3-d05-completitud.js` 21, `test-fase3-transversal-d05-d07.js`) | No | No | No |
| D-06 | Sí | Diagnóstico y alternativas | No (mitigación de presentación en Z3) | Caracterización (22) | No | No | No |
| D-07 | Sí | **Sí**: `EQUIVALENCIAS_ZONAS_D07.md` y `ACLARACION_H01_H02_PROPIEDAD_Z5.md` (propiedad única, referencias, Z5 en tres niveles) | **En la especificación (`z5-conjunto.js`) y el prototipo**; no en la aplicación | **Sí**, datos simulados (`test-fase3-propiedad-z5.js` 28, transversal 18) | No | No | No |

## 3. Pendientes que se conservan (ninguno completado)
1. Resolución técnica y pruebas de `combineImpacts` (4.5; prioritario).
2. Implementación de los criterios aprobados D-01 a D-06 aún no integrados.
3. Validación con datos reales de FESA (requiere autorización; `PLAN_DATOS_REALES_FESA.md`).
4. Pruebas con usuarios (`PROTOCOLO_PRUEBAS_CON_USUARIOS.md`).
5. Validación en móviles reales y con lectores de pantalla reales (`CHECKLIST_MOVIL_REAL_Y_ACCESIBILIDAD.md`).
6. Validación independiente de las reglas comerciales.
7. Integración del diseño de la Fase 3 en la aplicación funcional (`MATRIZ_CORRESPONDENCIA_PROTOTIPO_APP.md`).
8. Aceptación formal de las Subfases 3.3, 3.4 y 3.5.
