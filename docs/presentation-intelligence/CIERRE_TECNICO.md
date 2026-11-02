# Cierre técnico — Presentation Intelligence (ronda de correcciones del dictamen del 2 nov 2026)

## Hallazgos y solución
| # | Hallazgo | Solución | Prueba |
|---|---|---|---|
| 1 | Desborde de «Factores» en Operativo·año | El titular de voz usa los 2 factores que más pesan (el resto sigue en la tabla) — `js/report/voice.js` | `batch_integral_anio.py`, `test-report-voice.js` |
| 2 | Navegador → Cohere directo | Se eliminó la llamada directa, el respaldo con key local y `diagnostics.cohere.endpoint`. Todo pasa por `FP.cohereProxy` (Edge Function). `apiKey` ya no existe en estado, UI ni llamadas | `test-cohere-proxy.js`, `test-cohere-key-safety.js`, 10 batches adaptados (`sim_proxy.py`) |
| 3 | Key al cerrar sesión | `cohereApiKey` fuera de `SIGNOUT_KEEP`; una key heredada se borra al arrancar y al cerrar sesión; Configuración ya no tiene campo ni «recordar» | `test-cohere-key-safety.js`, `batch_cierre_sesion.py` (S1g), `batch_cierre_auditoria.py` |
| 4 | Pisado silencioso de `reportPrefs` | Detección de conflictos con «base» por navegador (`cloud.conflictKeys`) en `pushKeys` y `pullNewer`; nada se escribe hasta que la persona elige Combinar / Conservar la mía / Usar la del equipo; el cierre de sesión lo cuenta como «sin respaldar» | `test-sync-conflicts.js`, `batch_cierre_sync_dos_usuarios.py` |
| 5 | Portada obligatoria solo protegida en la UI | `compose()`/`units()` ignoran quitar una lámina `required`; `normalize` descarta una portada guardada como quitada | `test-report-composer.js`, `test-report-prefs.js` |
| 6 | Láminas duplicadas | `compose()` usa solo la primera aparición y registra `duplicada` | `test-report-composer.js` |
| 7 | Inversión «por debajo/por encima» en Directivo | Pruebas de ambas ramas de la frase (±0.5 %) y de la voz; verificadas con mutaciones | `test-report-directivo.js` |
| 8 | Títulos, notas e hipótesis largos | `fitPages`: compactar → abreviar con aviso visible → quitar hipótesis desde la última → título a 18 px; anexo «Ediciones e IA» a una línea y recorta filas con aviso. Letra ≥ 13.5 px | `batch_cierre_ediciones_pdf.py` (máximos 120/280/3×220 en todas las láminas) |
| 9 | Fidelidad del PDF | PDF real (`page.pdf`) en Operativo, Gerencial, Directivo y Reporte actual × mes/año: hojas = láminas, 16:9, cifras de pantalla presentes en el texto del PDF, sin null/NaN, texto no vacío | `batch_cierre_ediciones_pdf.py` (120 comprobaciones) |

## Justificación de cambios de comportamiento existente
- `compose`: la selección que quitaba la portada ya no la quita (la UI nunca lo permitía). Las pruebas de equivalencia con `units` congelado se ajustaron solo en ese caso; no se eliminó ninguna.
- Voz Operativo·Factores: 3 → 2 factores en el titular (ningún cálculo cambia).
- Pruebas que simulaban Cohere directo ahora simulan el servidor del equipo: validan cliente, validaciones y flujos de la app, **no** el servidor ni Cohere reales.

## Validación de servicios reales
- Supabase (proyecto `Revnavigator`, consulta de solo lectura): proyecto ACTIVE_HEALTHY; Edge Function `cohere-proxy` ACTIVE v2 con `verify_jwt: true`; `team_blobs` con RLS activo.
- **No validado** (bloqueo: sin JWT de usuario de equipo, sin acceso a secretos y sin red del entorno hacia Cohere): existencia del secreto `COHERE_API_KEY`, una llamada real navegador → proxy → Cohere, y la sincronización con dos sesiones reales de Supabase. Esas pruebas son simuladas y están rotuladas así.

## Riesgos residuales
1. Sin escritura condicional en el servidor: dos subidas casi simultáneas de `reportPrefs` aún pueden cruzarse (ventana de una consulta + una subida).
2. Las demás claves sincronizadas conservan «gana la última escritura».
3. Sin sesión de equipo no hay IA (decisión de diseño).
4. `batch_controles.py` conserva 6 fallas previas (vistas `producto`/`analisis`, botones sin acción); no se introdujeron en esta ronda.
5. `batch_ejemplo_conversion.py` E11 puede fallar bajo carga (espera fija de 5 s); pasa sola.

## Resultado antes / después
Node: 91 → 92 archivos, todos OK; selftest 233/233; lint 193 (igual). Batches: 3619 ✔ / 10 ✘ → 3648 ✔ / 8 ✘ (6 previas de `controles` + 1 flake de carga + 1 no atribuible; ver informe).

## Conclusión: APROBADO CON CONDICIONES
Condiciones: (a) validar con credenciales reales el proxy/Cohere y la sincronización de dos usuarios; (b) decidir si se acepta el riesgo residual 1.
