# Procedimiento reproducible (comandos exactos)

Desde la raíz del repositorio. Requisito: Node.js. Ninguna dependencia externa.

## 0 · Preparación
```bash
node tools/test-validacion-externa.js            # autoprueba del paquete (26 comprobaciones, datos SIMULADOS)
cp tools/validacion-externa/plantillas/MANIFIESTO.plantilla.json tools/validacion-externa/entrada-real/MANIFIESTO.json   # y edítalo
# coloca productos.csv, diario-canal.csv, segmentos-ga4.csv, diario-plan-real.csv y config-z1.json en tools/validacion-externa/entrada-real/
```
## 1 · Todo en un comando
```bash
node tools/validacion-externa/ejecutar.js --origen real --from 2026-09-01 --to 2026-09-30            # sin tolerancia (recomendado la primera vez)
node tools/validacion-externa/ejecutar.js --origen real --from 2026-09-01 --to 2026-09-30 --tolerance 0.05   # solo si el negocio ya declaró esa tolerancia
cat tools/validacion-externa/salida/REPORTE_VALIDACION_EXTERNA.md
```
## 2 · Validación por validación
| ID | Comando | Qué hace | Éxito |
|---|---|---|---|
| E-1 | `node tools/validacion-externa/e1-productos.js --origen real` | valida estructura y ejecuta `tools/test-phase21-real.js` sobre ese CSV (`REAL_PRODUCT_CSV`) | código 0, veredicto APROBADA, **7/7 PASS** |
| E-2 | `node tools/validacion-externa/e2-sesiones.js --origen real --from F --to T [--tolerance X]` | valida estructura, concilia cada canal × dimensión, evidencia por día | código 0 «CONCILIACIÓN EJECUTADA»; **el paquete no decide la tolerancia** |
| E-3 | `node tools/validacion-externa/e3-z1.js --origen real` | arma la entrada de Z1, ejecuta Z1 + reliability y comprueba A1–A8 | código 0, APROBADA (o «DIFERENCIAS CON LO ESPERADO» = revisión analítica) |
Códigos de salida: 0 ok · 1 falla/estructura inválida · 2 pendiente (faltan datos).

## 3 · Separación real / simulado (garantías verificadas por `test-validacion-externa.js`)
- `--origen real` **solo** lee de `entrada-real/`, exige `MANIFIESTO.json` con `origen: "real"`, y rechaza archivos cuyo sha256 coincida con un fixture.
- `--origen simulado` solo lee fixtures (`generar-fixtures.js`) o temporales y rechaza `entrada-real/`.
- Los reportes viven en `salida/real/` y `salida/simulado/` (la primera, excluida de Git) y cada uno lleva el encabezado **ORIGEN: REAL** o **ORIGEN: SIMULADO (no cuenta como validación externa)**.
- `REPORTE_VALIDACION_EXTERNA.md` tiene dos secciones separadas y solo da por completa la validación cuando las tres REALES están en verde.

## 4 · Evidencias reproducibles
Cada reporte `.json` incluye ruta y **sha256** de cada entrada, fecha de ejecución, manifiesto, estructura (errores/avisos con línea), resultados y veredicto. Para reproducir: mismos archivos (mismo sha) + mismo comando = mismo resultado (las funciones son deterministas).
