# Plan de validación con datos reales de FESA

> Entregable externo. **No se usó ningún dato real** ni se solicitó acceso: requiere autorización expresa del usuario y de FESA. Estado: **Pendiente de datos o acceso**.

## 1. Para qué
Validar con datos reales lo que hoy solo se probó con datos simulados: frecuencia de cada clase (hallazgo/riesgo/oportunidad), umbrales de severidad, orden de destacados, significado de «conversión 0», cobertura habitual, diferencias entre fuentes y utilidad de las acciones.

## 2. Datos mínimos que se pedirían (lectura únicamente)
| Dato | Detalle | Para qué escenario |
|---|---|---|
| Venta, pedidos y sesiones por día y canal | Últimos 3–6 meses, mismo formato de carga actual | E01–E06, E10 |
| Plan del periodo por día/canal | Incluye periodos sin plan | E16 |
| Dos fuentes de venta (si existen) | Para medir diferencias reales | E08 |
| Margen bruto vigente (y su historia) | Si existe y cómo se captura | E11–E13 |
| Casos conocidos | Días con caídas/picos explicados por el negocio | Calibración de hallazgos |

## 3. Condiciones
1. Autorización expresa del usuario (y de FESA) antes de cualquier acceso.
2. Solo lectura, en una copia local fuera del repositorio; nada de datos reales dentro de `docs/` ni de capturas publicadas.
3. Anonimizar productor/cliente cuando no sea necesario.
4. Resultados agregados en el informe; sin cifras reales en archivos versionados salvo aprobación.

## 4. Procedimiento
1. Cargar la copia en el entorno de pruebas (sin producción).
2. Ejecutar la derivación Z1→Z3→Z4 sobre cada día/periodo y registrar: confiabilidad, clases emitidas, contradicciones (detector C1–C17).
3. Comparar con el juicio de analistas en 10–20 casos.
4. Medir: porcentaje de días en cada nivel de confiabilidad, número de elementos por día, falsos positivos reportados.
5. Proponer ajustes de umbrales como **decisiones pendientes** (no cambiar reglas sin aprobación funcional).

## 5. Criterios de éxito
Cero contradicciones entre capas; ≥ 80 % de acuerdo con analistas en la prioridad; ningún caso de «cero» presentado donde hubo falta de dato.
