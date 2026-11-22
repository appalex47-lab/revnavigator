-- Límite de frecuencia y consumo por persona para el proxy de Cohere (Edge Function cohere-proxy).
-- ai_usage_hit cuenta cada solicitud por minuto y por día de la persona autenticada (auth.uid()) y responde {ok:false, scope, retry_after} al pasar el límite.
-- La tabla no tiene políticas RLS: nadie la lee ni la escribe directamente; solo la función (SECURITY DEFINER) la toca.
create table if not exists public.ai_usage (
  user_id uuid not null,
  bucket timestamptz not null,
  n integer not null default 0,
  primary key (user_id, bucket)
);
alter table public.ai_usage enable row level security;
revoke all on public.ai_usage from public, anon, authenticated;

create or replace function public.ai_usage_hit(p_limit_min integer, p_limit_day integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  b timestamptz := date_trunc('minute', now());
  nmin integer; nday integer;
begin
  if uid is null or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    return jsonb_build_object('ok', false, 'scope', 'auth', 'retry_after', 60);
  end if;
  if p_limit_min is null or p_limit_min < 1 or p_limit_day is null or p_limit_day < 1 then
    return jsonb_build_object('ok', false, 'scope', 'config', 'retry_after', 60);
  end if;
  insert into ai_usage (user_id, bucket, n) values (uid, b, 1)
  on conflict (user_id, bucket) do update set n = ai_usage.n + 1
  returning n into nmin;
  select coalesce(sum(n), 0) into nday from ai_usage where user_id = uid and bucket > now() - interval '1 day';
  delete from ai_usage where user_id = uid and bucket < now() - interval '2 days';
  if nmin > p_limit_min then return jsonb_build_object('ok', false, 'scope', 'minute', 'retry_after', 60); end if;
  if nday > p_limit_day then return jsonb_build_object('ok', false, 'scope', 'day', 'retry_after', 3600); end if;
  return jsonb_build_object('ok', true, 'minute', nmin, 'day', nday);
end;
$$;
revoke all on function public.ai_usage_hit(integer, integer) from public, anon;
grant execute on function public.ai_usage_hit(integer, integer) to authenticated;
