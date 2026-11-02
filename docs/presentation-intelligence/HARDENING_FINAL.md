# Fase final de hardening, seguridad y certificación — Presentation Intelligence

## A. Resumen ejecutivo
**Corregido y verificado:** control optimista de concurrencia por versión en Supabase (migración aplicada y probada contra PostgreSQL real), cliente adaptado (versión + huella de contenido, reintento idempotente), límites de frecuencia para el proxy de Cohere (código y migración listos), defectos de PDF encontrados en la auditoría (conteos nulos, cifras recortadas para dar espacio a textos, LEGACY intacto), esperas fijas de pruebas sustituidas por condiciones, prueba de fuente única de cálculo.
**Pendiente (no se pudo comprobar aquí):** concurrencia con dos conexiones *simultáneas* reales; aplicar migración de límites y redesplegar el proxy (requieren autorización); llamada real navegador → proxy → Cohere y existencia del secreto `COHERE_API_KEY`; prueba HTTP con dos usuarios reales (el entorno no tiene red hacia Supabase/Cohere).

## B. Matriz de hallazgos
| # | Hallazgo | Sev. | Evidencia | Solución | Estado |
|---|---|---|---|---|---|
| 1 | Escrituras concurrentes sin control en el servidor | P0 | SQL real (ver E) | Columna `version`, disparador, `put_blob_cas` (valida y escribe en 1 transacción con bloqueo asesor) | Aplicada y probada en secuencia; simultaneidad real pendiente |
| 2 | Cliente sin versión (carrera de lectura/escritura) | P0 | `test-sync-conflicts.js` (25 rondas simultáneas simuladas, desconexión, reintento, sesión vencida) | Base {versión, huella}, CAS por versión, reintento idempotente | Corregido (simulado) |
| 3 | Proxy sin límites de frecuencia/consumo, sin tope por mensaje | P0 | Revisión de la función desplegada (== repo) | `ai_usage_hit` + límites configurables + tope 200 mil car./mensaje, falla cerrado | Código y migración listos; **no desplegado** |
| 4 | Cohere/Supabase reales sin validar | P0 | Sin red/credenciales | — | Bloqueado, documentado |
| 5 | Conteos nulos mostraban «null» (Gerencial/Directivo) | P1 | `batch_cierre_ediciones_pdf.py` casos «nulos» | `—` cuando no es número | Corregido |
| 6 | Textos escritos recortaban cifras calculadas (tabla 5→1 filas) | P1 | PNG de evidencia | El texto se abrevia primero; filas solo si aun así no cabe | Corregido |
| 7 | Mi primer ajuste cambiaba láminas LEGACY | P1 | `batch_report_golden`, `batch_presentacion` fallaron | Solo actúa con texto escrito (`data-ed`) | Corregido |
| 8 | Fallas de batches (8) | P1 | Sección G | Clasificadas; 2 flakes con espera fija arregladas | Cerrado |
| 9 | Derivados en presentación sin contrato | P1 | `test-report-fuente-comun.js` | Contrato: solo `operativo.js` calcula «a/b−1» (Evolución, sobre días del motor); equivalencia probada | Cerrado |

## C. Arquitectura
```
Navegador ── cloudSync (base {v,huella}) ──► REST/RPC Supabase ──► put_blob_cas (txn + lock asesor por equipo+clave) ──► team_blobs (RLS: team_id = my_team_id())
Navegador ── FP.cohereProxy (JWT) ─────────► Edge Function cohere-proxy ─► valida JWT/no anónimo/equipo ─► ai_usage_hit ─► valida cuerpo ─► Cohere (COHERE_API_KEY solo en el servidor)
buildExecutiveReport(src) ─► reportBuilder ─► blocks.extend ─► composer ─► reportView(fitPages) ─► mountPrint ─► PDF (297×167 mm)
```

## D. Seguridad
Verificado: sin API key en cliente ni llamada directa (`test-cohere-key-safety.js`, `test-cohere-proxy.js`); proxy rechaza sin sesión/anónimo/sin equipo/cuerpo malformado/origen no permitido/enormes; errores sin cuerpo de Cohere ni claves; `anon` sin permiso de ejecutar `put_blob_cas` (SQL real). Nuevo: límites 10/min y 300/día por persona (secretos `AI_RATE_PER_MIN`/`AI_RATE_PER_DAY`), falla cerrado. Autorización: pertenecer a un equipo basta hoy; si se quiere restringir más, añadir una lista de usuarios permitidos (no implementado: sería funcionalidad nueva).

## E. Sincronización — evidencia contra PostgreSQL real (proyecto Revnavigator)
Ejecutada por SQL con identidad simulada (`request.jwt.claims`, rol `authenticated`), 2 equipos y 3 usuarios temporales, todo deshecho al terminar:
```
A crea → {ok, version 1}                      A reintenta crear → conflicto (v1)
B lee v1; A guarda esperando v1 → ok (v2)     B guarda esperando v1 → conflicto (v2); contenido final = A
B sin versión / versión 999 → conflicto       B reintenta con v2 → ok (v3)
C (otro equipo) ve 0 filas; su escritura no toca T1 (contenido de T1 intacto); anon → permission denied
```
**Límite:** es secuencial dentro de una transacción; la exclusión mutua entre conexiones se apoya en `pg_advisory_xact_lock` (mecanismo estándar) pero **no se demostró con dos conexiones simultáneas**. Script de dos pestañas en el apéndice. Las pruebas de cliente (25 rondas simultáneas, respuesta perdida, sesión vencida, resolución desde dos navegadores en la app) usan un servidor **simulado** y están rotuladas así.

## F. Calidad de PDF
`batch_cierre_ediciones_pdf.py`: 144 comprobaciones (mes y año × Operativo/Gerencial/Directivo/Reporte actual): hojas = láminas, 16:9, cifras de pantalla presentes en el PDF, sin null/undefined/NaN, letra ≥ 13.4 px, textos máximos (120/280/3×220), datos enormes/negativos/nulos. 16 PDF en `scratchpad/cierre_tecnico/pdf/` y PNG de muestra en `.../png/`.

## G. Pruebas y los 8 fallos de la ronda anterior
| Fallo | Clasificación | Resolución |
|---|---|---|
| batch_controles ×6 (MN-2, MN-4, CT-1 ×2, CT-2 ×2) | Falla **preexistente** (pruebas desactualizadas frente a rutas heredadas `#producto`/`#analisis` y botones de alternancia con oyente delegado) | Alias reconocidos + MN-4c comprueba la redirección real; alternancias no marcadas como decorativas |
| batch_ejemplo_conversion E11 | **Flakiness** (espera fija de 5 s) | Espera por condición |
| «1 fallas» adicional | **No atribuible**: línea-resumen de E11 | — |
| batch_cloud_s1 (de mi cambio) | **Regresión mía** (fake sin RPC) | Fake con la función |
| batch_restaurar_carga R4b | **Flakiness** (espera fija de 5 s) | Espera por condición |
Resultado: Node 93/93 archivos OK · selftest 233/233 · lint 193 (= línea base) · batches 176/176 con código 0, 3680 ✔ / 0 ✘ tras corregir R4b. Antes (ronda anterior): 3619 ✔ / 10 ✘.

## H. Riesgos residuales
1. Atomicidad con dos conexiones simultáneas sin demostrar en vivo (apéndice A).
2. Migración `20261102_ai_usage_rate_limit.sql` y redespliegue del proxy pendientes de autorización; hasta entonces el proxy desplegado no tiene límites.
3. Secreto `COHERE_API_KEY`, llamada real y error/timeout reales de Cohere sin validar.
4. Clientes antiguos que escriben por el upsert de siempre siguen funcionando: el disparador sube la versión, por lo que no se pierde la detección.
5. Sin sesión de equipo no hay IA (diseño).

## I. GitHub
PR #215 (rama `ccr-a81af632-rirtu7`). Migraciones: `20261102_put_blob_cas.sql` (**aplicada** en Revnavigator), `20261102_ai_usage_rate_limit.sql` (**pendiente**). Despliegue: (1) aplicar la migración de límites; (2) desplegar `supabase/functions/cohere-proxy` (el proxy falla cerrado sin `ai_usage_hit`, así que va en ese orden); (3) publicar la app.

## J. Dictamen: **APROBADO CON CONDICIONES**
Condiciones: apéndice A (concurrencia real), apéndice B (límites del proxy) y validación de Cohere con credenciales. No se declara APROBADO porque esas integraciones reales no están demostradas.

---
## Apéndice A — Concurrencia con DOS conexiones (SQL Editor, dos pestañas)
1. Pestaña 1, preparar (ejecutar una vez): crea usuarios/equipos temporales y la clave base.
```sql
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values
 ('aaaaaaaa-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','cas-a@test.invalid','{}','{}',now(),now()),
 ('aaaaaaaa-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','cas-b@test.invalid','{}','{}',now(),now());
insert into public.teams (id, name) values ('bbbbbbbb-0000-4000-8000-000000000001','__cas_test_T1');
insert into public.team_members (user_id, team_id) values ('aaaaaaaa-0000-4000-8000-000000000001','bbbbbbbb-0000-4000-8000-000000000001'),('aaaaaaaa-0000-4000-8000-000000000002','bbbbbbbb-0000-4000-8000-000000000001');
insert into public.team_blobs (team_id,key,part,total,payload,bytes,version) values ('bbbbbbbb-0000-4000-8000-000000000001','__cas_test__k',0,1,'base',4,10);
create table public.__cas_conc (n serial, who text, r text, at timestamptz default clock_timestamp());
alter table public.__cas_conc disable row level security;
```
2. Pestaña 1 (A): ejecutar y, **sin esperar**, pasar a la pestaña 2 (retiene el bloqueo 20 s dentro de su transacción):
```sql
do $$ begin
  execute 'set local role authenticated'; perform set_config('request.jwt.claims','{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated"}',true);
  perform pg_advisory_xact_lock(hashtextextended('bbbbbbbb-0000-4000-8000-000000000001:__cas_test__k',0));
  perform pg_sleep(20);
  execute 'reset role';
  insert into public.__cas_conc(who,r) values ('A (lee v10)', public.put_blob_cas('__cas_test__k',10,'[{"part":0,"total":1,"payload":"A","bytes":1,"updated_at":"2026-11-02T10:00:00Z"}]')::text);
end $$;
```
   (nota: tras `reset role` la función se ejecuta como propietario; para RLS use `set_config` otra vez si desea. La exclusión depende del bloqueo asesor, que es lo que se prueba.)
3. Pestaña 2 (B), dentro de los 20 s:
```sql
do $$ declare r text; begin
  execute 'set local role authenticated'; perform set_config('request.jwt.claims','{"sub":"aaaaaaaa-0000-4000-8000-000000000002","role":"authenticated"}',true);
  r := public.put_blob_cas('__cas_test__k',10,'[{"part":0,"total":1,"payload":"B","bytes":1,"updated_at":"2026-11-02T10:00:01Z"}]')::text;
  execute 'reset role'; insert into public.__cas_conc(who,r) values ('B (lee v10)', r);
end $$;
```
4. Esperado: B espera hasta que A termine; luego `select who, r, at from public.__cas_conc order by n;` muestra A `{"ok": true, "version": 11}` y B `{"ok": false, "conflict": true, "version": 11}`, con el contenido final `A`.
5. Limpieza: `drop table public.__cas_conc; delete from public.team_blobs where key like '\_\_cas\_test\_\_%' escape '\'; delete from public.team_members where team_id::text like 'bbbbbbbb-0000%'; delete from public.teams where id::text like 'bbbbbbbb-0000%'; delete from auth.users where email like 'cas-%@test.invalid';`

## Apéndice B — Límites del proxy (tras aplicar la migración de límites)
Ejecutar como el script de la ronda anterior (identidad simulada, todo con `raise exception` final para deshacer): llamar `select public.ai_usage_hit(3, 100)` cinco veces con el mismo usuario → las 3 primeras `ok:true`, la 4.ª y 5.ª `ok:false, scope:'minute'`; con `p_limit_day=2` → `scope:'day'`; como `anon` → permission denied.

## Apéndice C — Validación de Cohere (requiere credenciales)
1. Supabase → Edge Functions → Secrets: confirmar que `COHERE_API_KEY` existe (no se muestra su valor). 2. Con sesión de equipo, en Configuración → IA pulsar «Probar la conexión del servidor» (usa el proxy real). 3. Con `curl` sin `Authorization` al endpoint del proxy: debe responder 401. 4. Cuerpo malformado con sesión válida: 400. 5. Apagar/forzar error de Cohere: la app muestra el mensaje de «servicio no disponible» y el resto sigue funcionando.
