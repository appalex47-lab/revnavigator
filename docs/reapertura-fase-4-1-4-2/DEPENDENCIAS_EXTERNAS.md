# Dependencias externas auténticas (no se simulan ni se aceptan como fase aprobada)

Se agotaron las alternativas de validación local; lo que sigue **no** puede cerrarse sin un insumo externo real.

| # | Qué falta | Por qué es indispensable | Qué se preparó | Requisito exacto |
|---|---|---|---|---|
| E-1 | `test-phase21-real.js` sigue **OMITIDO** | valida el forecast de tendencias con el export real de ventas por producto (>85 000 filas) | `test-phase21-simulado-grande.js` ejecuta las MISMAS aserciones con datos SIMULADOS y el código actual (7/7); **no sustituye** la validación real | archivo `/mnt/data/analisis/Venta Productos 2026.csv` (columnas `fecha` dd/mm/aaaa, `producto`, `venta`) |
| E-2 | Tolerancia entre serie diaria por canal y segmentos GA4 | solo la diferencia real entre ambas fuentes permite proponer una tolerancia defendible; inventarla violaría la regla de no suponer | `reconcileSessionsReport` + `tools/audit/validar-sesiones-ga4.js` (alerta de doble conteo, días distintos, ausencia ≠ cero) | export diario por canal (`date,channel,sessions`) y export GA4 por dimensión del MISMO periodo y canales (`date,channel,dimension,segment,sessions`), con el periodo explícito; ejecutar el CLI y revisar el informe |
| E-3 | Comportamiento de Z1 / confiabilidad con datos de producción | los escenarios y los datos de demostración son simulados | `batch_reapertura_consumidores.py` ejerce la cadena completa con datos de demostración | autorización para cargar un extracto real (sin credenciales) en un entorno de prueba |
Ninguna de las tres impide el cierre técnico de 4.1/4.2 **dentro de lo ejecutable**, pero ninguna se declara validada.

---

## Resultado de la validación externa real (2026-11-20)

E-1 aprobada; E-3 aprobada (calidad declarada `warnings`); E-2 ejecutada con **limitación aceptada por el usuario**: `traffic_volume` de ecommerce anterior a 2026-10-05 y de app anterior a 2026-09-25 (y app 2026-10-02) no coincide con GA4 (cambio de origen sin explicar). Detalle, alcance y condiciones: [`docs/validacion-externa/LIMITACION_E2_TRAFFIC_VOLUME.md`](../validacion-externa/LIMITACION_E2_TRAFFIC_VOLUME.md). La limitación está documentada, **no impuesta por código** (decisión pendiente). Esto no equivale a la aceptación formal de 4.1/4.2, que corresponde al usuario.
