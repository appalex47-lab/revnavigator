# Guía del entorno de revisión visual de RevNavigator

> Rama `ccr-a81af632-rirtu7` · commit `625daecc0969f9cd6e9db5d93a41eb652040d506` (los seis commits de conservación). **No se modificó `main`, ni producción, ni el código, ni se creó ningún commit.** Estos cuatro documentos y las capturas (`capturas/`) están **sin versionar** en `docs/revision-visual/`.

## 1. Qué es y cómo funciona
RevNavigator es una **aplicación web estática** (HTML + CSS + JavaScript, sin compilación ni `npm`). Se abre con cualquier servidor de archivos; no necesita instalar dependencias. Sin iniciar sesión **no contacta ningún servicio externo** (verificado: todas las peticiones fueron a `127.0.0.1`). Los datos de la demo viven solo en **el almacenamiento de tu navegador**.

## 2. Cómo abrirla
**Estado actual (verificado):** el servidor ya está en marcha en el entorno de trabajo, puerto **8765**:
- Aplicación: `http://127.0.0.1:8765/index.html` — responde 200 y carga sin errores (probado con un navegador real, con la política de seguridad de contenido activa).
- Prototipo de Fase 3 (independiente): `http://127.0.0.1:8765/docs/command-center/prototipo/home_3_5_prototipo.html` — responde 200.

**Para iniciarlo tú** (desde la carpeta del repositorio, en la rama `ccr-a81af632-rirtu7`):
```
cd digital_sales_forecast_-_pacing
git checkout ccr-a81af632-rirtu7
python3 -m http.server 8765 --bind 127.0.0.1
```
Luego abre `http://127.0.0.1:8765/index.html` en tu navegador. Para **detenerlo**: `Ctrl + C` en esa terminal (en este entorno: `kill $(cat /tmp/q/http8765.pid)`).

## 3. Acceso desde tu computadora y tu celular
- **Esta URL es `127.0.0.1` (la máquina donde corre el servidor).** Yo la probé **desde el propio entorno**; **no he podido comprobar** que sea accesible desde tu computadora o tu celular, y **no la afirmo**. Informé el puerto 8765 a la app de Claude por si ofrece un panel de vista previa; no sé si lo muestra en tu cliente.
- **Si corres el servidor en tu computadora** (clonando la rama), abre la URL ahí. Para el **celular en la misma red Wi‑Fi**: inicia con `--bind 0.0.0.0`, averigua la IP de tu computadora (p. ej. `192.168.1.20`) y abre `http://192.168.1.20:8765/index.html`. Requisitos: misma red, el firewall debe permitir el puerto, y **nunca** expongas el puerto a Internet (sirve todo el repositorio).
- **No** se usó GitHub Pages ni ningún despliegue.

## 4. Cómo ver datos (la app abre vacía)
1. Abre **Metas y motor** (`#resumen`) → abre los plegables → **«Datos de prueba»** → botón de generar datos de prueba. Con esto el **Inicio**, **Pacing & Forecast**, **Diagnóstico**, **Recovery** y **Narrativa** ya muestran información.
2. Para más módulos: **Carga de datos** → «Revisar todos los datasets generados» → confirmar la carga (alimenta Tráfico y conversión, Proyección y Estacionalidad).
3. Para **Producto y evolución** y **Cross‑sell**: en Producto «Probar con archivo generado» y luego confirmar en Carga de datos.
**No inicies sesión con tu equipo durante la demo:** la configuración apunta al proyecto Supabase real y la sesión sincronizaría datos en la nube.

## 5. Qué mirar primero
1. **Inicio** (`#inicio`): veredicto, confiabilidad, «Tu siguiente mejor paso», «Qué necesita atención», «Desde ayer», tabla por canal.
2. **Pacing & Forecast**, **Diagnóstico**, **Recovery Center**.
3. **El prototipo de Fase 3** (abajo): es el diseño aprobado, **no** la aplicación.
Para comparar: `DIFERENCIAS_DISENO_FASE_3_VS_APLICACION.md`. Inventario de pantallas: `INVENTARIO_MODULOS_VISUALIZABLES.md`. Resultados de las pruebas: `REPORTE_PRUEBAS_ENTORNO_DEMO.md`.

## 6. Requisitos y limitaciones
- Requiere `python3` (o cualquier servidor de archivos estático) y un navegador moderno. No se instaló nada.
- La IA (Cohere) y la sincronización requieren inicio de sesión con el equipo y servicios externos: **no probados**.
- Las pruebas se hicieron con Chromium emulado; no hay pruebas en un móvil real.
- La hora del entorno es 12‑nov‑2026 y los datos de prueba son de septiembre 2026, por eso el Home dice «51 días antes».
