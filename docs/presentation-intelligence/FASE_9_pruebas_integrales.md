# Fase 9 — Pruebas integrales

## Objetivo
Verificar el conjunto, no cada pieza: que los cuatro formatos (reporte actual, Operativo, Gerencial, Directivo) se comporten de forma coherente en la aplicación real, con distintos periodos y alcances, y que ninguna cifra, regla o geometría se rompa al combinarlos.

## Qué se agregó
- `tools/regression/integral_common.py` y cuatro batches: `batch_integral_mes.py`, `batch_integral_q3.py`, `batch_integral_anio.py`, `batch_integral_canal.py`.
- Cada batch recorre **formato × profundidad (4 × 3 = 12 combinaciones)** con venta, plan, acciones, un escenario guardado y un embudo GA4 importado por el camino real. Cuatro escenarios: mes, trimestre (Q3), año completo y un solo canal → **48 combinaciones**.

## Qué se revisa en cada combinación
1. Se genera sin error y el reporte queda marcado con el formato.
2. La vista previa tiene exactamente las láminas de la propuesta del compositor, en el mismo orden y con la portada primero.
3. Ninguna lámina contiene «null», «undefined», «NaN» ni «Infinity».
4. Todas las láminas, en impresión, son 1122×630, sin desborde y sin tablas fuera del marco; texto ≥ 13.4 px (salvo portada).
5. **Toda cifra de las láminas nuevas existe en los datos del reporte** (se comparan los números del texto contra todas las hojas numéricas del reporte, con sus variantes de formato: K, M, %). Se excluyen fechas, etiquetas, identificadores y conteos pequeños.
6. Las cifras repetidas entre láminas coinciden (venta real y plan del pacing por canal y del semáforo).
7. Directivo no habla de margen, ROI, ROAS ni CAC (salvo para decir que no se calculan) y solo trae láminas de su formato.
8. Sin errores de página.

## Cómo se verificó que las pruebas detectan fallas (mutaciones)
- Forzar relleno en las tablas de Operativo → falla la geometría.
- Mostrar en el semáforo una venta multiplicada por 1.5 → falla «nada inventado».
- (Durante el desarrollo) una prueba inicial era vacía porque `innerText` de un elemento oculto es «»; se corrigió y se repitió la mutación.

## Limitaciones
- Datos de ejemplo (generados), no un archivo real del negocio.
- El filtro de cifras es tolerante (0.6 % o 0.05) y excluye enteros pequeños (1–19): un entero pequeño inventado no se detecta.
- No prueba contra Cohere real ni contra el servidor real de cierre de sesión.
- Tardan ≈ 3 minutos por escenario.
