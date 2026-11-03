-- Control optimista de concurrencia para team_blobs (Fase final de hardening, P0).
-- Cada documento (clave) tiene una VERSIÓN entera creciente (en el trozo 0). El cliente declara qué versión leyó; el servidor acepta la escritura solo si
-- coincide, y lo hace dentro de UNA transacción serializada por equipo+clave (bloqueo asesor). Si cambió, devuelve {ok:false, conflict:true, version} y no toca nada.
--
-- Compatibilidad:
--  * Filas existentes reciben version = 1 (default).
--  * Clientes anteriores siguen escribiendo con el upsert de siempre: el disparador sube la versión en cada UPDATE del trozo 0, así que un cliente nuevo que
--    leyó antes de esa escritura recibirá conflicto (no se pierde la detección).
--  * SECURITY INVOKER: rige la misma RLS (blobs_all: team_id = my_team_id()).
alter table public.team_blobs add column if not exists version bigint not null default 1;

create or replace function public.team_blobs_bump_version()
returns trigger language plpgsql as $$
begin
  if new.part = 0 and new.version is not distinct from old.version then
    new.version := old.version + 1;
  end if;
  return new;
end $$;

drop trigger if exists team_blobs_bump_version on public.team_blobs;
create trigger team_blobs_bump_version before update on public.team_blobs
  for each row execute function public.team_blobs_bump_version();

create or replace function public.put_blob_cas(p_key text, p_expected_version bigint, p_rows jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  tid uuid := my_team_id();
  cur bigint;
  nv bigint;
begin
  if tid is null then return jsonb_build_object('ok', false, 'error', 'no_team'); end if;
  if jsonb_typeof(p_rows) is distinct from 'array' or jsonb_array_length(p_rows) = 0 then
    return jsonb_build_object('ok', false, 'error', 'bad_rows');
  end if;
  perform pg_advisory_xact_lock(hashtextextended(tid::text || ':' || p_key, 0));
  select version into cur from team_blobs where team_id = tid and key = p_key and part = 0;
  if found then
    if p_expected_version is null or p_expected_version <> cur then
      return jsonb_build_object('ok', false, 'conflict', true, 'version', cur);
    end if;
    nv := cur + 1;
  else
    if coalesce(p_expected_version, 0) <> 0 then
      return jsonb_build_object('ok', false, 'conflict', true, 'version', 0);
    end if;
    nv := 1;
  end if;
  delete from team_blobs where team_id = tid and key = p_key;
  insert into team_blobs (team_id, key, part, total, payload, bytes, updated_at, version)
  select tid, p_key, (r->>'part')::int, (r->>'total')::int, r->>'payload', (r->>'bytes')::int, (r->>'updated_at')::timestamptz, nv
  from jsonb_array_elements(p_rows) r;
  return jsonb_build_object('ok', true, 'version', nv);
end;
$$;
revoke all on function public.put_blob_cas(text, bigint, jsonb) from public, anon;
grant execute on function public.put_blob_cas(text, bigint, jsonb) to authenticated;
