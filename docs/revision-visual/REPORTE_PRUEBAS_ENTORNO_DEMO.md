# Reporte de pruebas del entorno de demostración

> Rama `ccr-a81af632-rirtu7`, commit `625daec`. Servidor estático `python3 -m http.server 8765` (puerto 8765). Navegador Chromium **emulado**, sin `bypass` de la política de seguridad de contenido (CSP), contextos **aislados**, datos de prueba generados por la propia app. **No se modificó el código ni ningún dato real; no se inició sesión.** Solo lo que dice «verificado» se probó de verdad.

## 1. Pruebas ejecutadas y resultado
| Prueba | Resultado |
|---|---|
| Inicio de la aplicación (`/index.html`) | **Pasó**: HTTP 200, título «Inicio · RevNavigator», pantalla de arranque retirada, 2 623 caracteres iniciales |
| Errores de consola / excepciones / peticiones fallidas | **0** en el arranque, en las 24 pantallas y en 3 anchos móviles |
| Servicios externos | **Ninguno**: todas las peticiones fueron a `127.0.0.1:8765` (sin sesión no hay Supabase ni Cohere) |
| Navegación: 24 rutas del menú (`#inicio` … `#ayuda`) | **Pasó**: las 24 cargan y su vista queda visible |
| Datos de prueba (Metas y motor → «Datos de prueba») | **Pasó**: 88 registros reales y 120 de plan; el Inicio muestra «Vas en plan: 99.9 %…» |
| Carga de datasets generados + confirmar | **Pasó**: alimenta Proyección, Estacionalidad y (en una ejecución) Tráfico y conversión |
| Interacción del Inicio: cambiar Canal | **Pasó**: el veredicto cambia (Total → Ecommerce: 99.4 %); 15 plegables abren |
| Persistencia con datos aislados: recargar la página | **Pasó**: tras recargar, 88 reales / 120 plan siguen en el Inicio |
| Prototipo 3.5 independiente | **Pasó**: carga; 6 situaciones; Z5 «Oportunidades y visión de conjunto» |
| Pruebas automáticas existentes (tarea anterior, mismo commit) | Verificadores 3.1–3.5, 106 archivos Node, motor 233/233, lotes de navegador: **pasan** (no se repitieron en esta tarea) |

## 2. Lo que **no** se verificó (no se afirma que funcione)
Botones de los módulos más allá de los listados (p. ej. recálculo de Pacing, Recovery, generar PDF, exportaciones); «Plan → Generar vista previa»; Cohere/IA; sincronización en la nube; inicio de sesión; Turnstile; importación con archivos reales; Sheets; teléfono real o lector de pantalla.

## 3. Errores y hallazgos de funcionamiento (no corregidos)
1. **Clientes y LTV** siguió vacío tras «Probar con datos de ejemplo» y confirmar la carga (no diagnosticado: puede ser un paso faltante o un defecto).
2. **Tráfico y conversión** apareció poblado en una ejecución y como índice en otra con el mismo flujo: comportamiento no determinista o dependiente del orden de carga (no diagnosticado).
3. La tarjeta «Producto y evolución» del índice no navegó con el clic de mi script (la sub‑vista sí se abre por otra vía): posible diferencia de elemento clicable.
4. **Inicio**: el rótulo superior dice «Venta acumulada 0.2 % por debajo del plan» mientras el titular dice «Vas en plan: 99.8 %» (coherente numéricamente, pero con tonos distintos).
5. **Primera visita**: aparece una ventana «Bienvenido a RevNavigator · ¿Con qué datos cuentas hoy?» **encima** del contenido del Inicio.
6. El Inicio calcula «51 días antes» porque la fecha del entorno (12‑nov‑2026) no coincide con los datos de prueba (22‑sep‑2026): artefacto de la demo.

## 4. Revisión móvil (375, 390 y 430 px; Chromium emulado)
| Pantalla | Desborde horizontal | Altura de la página (375 / 390 / 430) | Objetivos < 24 px |
|---|---|---|---|
| Inicio | **No** (0 px) | 5 841 / 5 716 / 5 555 px | **17 / 16 / 18** |
| Pacing & Forecast | No | 16 970 / 16 805 / 16 331 px | 0 |
| Diagnóstico | No | 7 310 / 6 928 / 6 678 px | 0 |
| Recovery & Reforecast | No | 15 533 / 15 361 / 14 970 px | 0 |
| Carga de datos | No | 4 791 / 4 444 / 4 255 px | 0 |
| Configuración | No | 3 215 / 3 160 / 2 789 px | 0 |
Hallazgos visuales (capturas en `capturas/movil*_*.png`): sin elementos desbordados; el botón flotante **«Asistentes»** se superpone al texto de la tarjeta «Por revisar» a 390 px; el Inicio mide ≈ 5 700 px (muy largo) y Pacing y Recovery superan los 15 000 px; 16–18 controles del Inicio miden menos de 24 px; en escritorio, la ventana de bienvenida tapa parte de «Tu siguiente mejor paso». No se evaluaron modales ni el menú lateral en móvil más allá del arranque.

## 5. Estado
Servidor en marcha en el puerto 8765 (no detenido). `main`, producción y los seis commits **no se tocaron**; no hubo commit, push ni merge. Los archivos de esta revisión quedan **sin versionar** en `docs/revision-visual/` (incluye 55 capturas, 12 MB).
