# Checklist de móviles reales, lector de pantalla y navegadores

> Entregable externo: **requiere dispositivos y herramientas que no hay en este entorno**. Lo automatizado (Chromium emulado, 9 anchos, contraste, ids, encabezados, foco) está en `tools/regression/batch_fase3_calidad_ux.py` (62 comprobaciones) y **no sustituye** esta lista. Estado: **Pendiente de datos o acceso**.

## A. Dispositivos (prototipo `home_3_5_prototipo.html`)
| Dispositivo / navegador | Anchos de referencia | Comprobar | Resultado |
|---|---|---|---|
| iPhone SE (Safari iOS) | 320–375 | Sin desplazamiento horizontal; primer pantallazo con estado, veredicto, cifra y confiabilidad; botones táctiles cómodos | ☐ |
| iPhone 14/15 (Safari iOS) | 390–414 | Igual; barra de direcciones no oculta contenido | ☐ |
| Android gama media (Chrome) | 360–412 | Igual; texto ≥ 11 px legible; teclado no tapa campos | ☐ |
| Tableta (iPad / Android) | 768–1024 | Columnas de Z3/Z4 en filas, sin recortes | ☐ |
| Laptop (Chrome, Edge, Firefox, Safari) | 1366–1440 | Orden de lectura y foco | ☐ |
| Zoom 200 % y texto grande del sistema | — | Nada se pierde ni se superpone | ☐ |
| Orientación horizontal en móvil | — | Sin recortes | ☐ |
| Modo oscuro / alto contraste del sistema | — | Contraste conservado (el prototipo no define tema oscuro) | ☐ |

## B. Lector de pantalla (no ejecutado)
| Herramienta | Comprobar | Resultado |
|---|---|---|
| NVDA + Firefox/Chrome (Windows) | Orden: h1 → zonas (h2) → tarjetas (h3); enlace «saltar al contenido»; nombres de botones de filtro y de los plegables | ☐ |
| VoiceOver (macOS / iOS) | Igual; los «Evidencia y límites» se anuncian como expandibles | ☐ |
| TalkBack (Android) | Igual; objetivos táctiles | ☐ |
Qué sabemos ya (automatizado): un solo h1, h2 por zona, sin saltos de nivel, ids únicos, referencias `aria-labelledby` resueltas, idioma `es`, indicador de foco visible, orden de tabulación coherente, contraste ≥ 4.5:1. Qué **no** se sabe: cómo se *anuncia* (verbosidad, símbolos ◆▲●, abreviaturas) y si el orden es comprensible al oído.

## C. Registro
Anotar dispositivo, versión del sistema/navegador, captura y severidad. Los defectos se corrigen en el prototipo/especificación y se repite este checklist.
