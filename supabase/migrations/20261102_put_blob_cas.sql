-- Cierre técnico (hallazgo 4, riesgo residual): escritura condicional en el servidor para claves con detección de conflictos (p. ej. reportPrefs).
-- put_blob_cas(clave, fecha_esperada, filas): reemplaza TODOS los trozos de la clave en una sola transacción SOLO si la fecha (updated_at del trozo 0) sigue siendo la
-- que el cliente vio (o si la clave no existe y no se esperaba ninguna). Si otra persona escribió en medio, devuelve {ok:false,current} y no cambia nada.
-- SECURITY INVOKER: rige la misma RLS de team_blobs (cada equipo solo ve y escribe lo suyo). Un bloqueo asesor por equipo+clave serializa las escrituras concurrentes.
create or replace function public.put_blob_cas(p_key text, p_expected timestamptz, p_rows jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  tid uuid := my_team_id();
  cur timestamptz;
begin
  if tid is null then return jsonb_build_object('ok', false, 'error', 'no_team'); end if;
  perform pg_advisory_xact_lock(hashtextextended(tid::text || ':' || p_key, 0));
  select updated_at into cur from team_blobs where team_id = tid and key = p_key and part = 0;
  if found and (p_expected is null or cur <> p_expected) then
    return jsonb_build_object('ok', false, 'current', cur);
  end if;
  delete from team_blobs where team_id = tid and key = p_key;
  insert into team_blobs (team_id, key, part, total, payload, bytes, updated_at)
  select tid, p_key, (r->>'part')::int, (r->>'total')::int, r->>'payload', (r->>'bytes')::int, (r->>'updated_at')::timestamptz
  from jsonb_array_elements(p_rows) r;
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.put_blob_cas(text, timestamptz, jsonb) from public, anon;
grant execute on function public.put_blob_cas(text, timestamptz, jsonb) to authenticated;
