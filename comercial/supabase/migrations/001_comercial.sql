-- Tu Biblia Digital: esquema comercial. Ejecutar en Supabase SQL Editor en un proyecto NUEVO.
create table if not exists public.entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  access_kind text not null check (access_kind in ('stripe','gift','admin')),
  stripe_checkout_session_id text unique,
  activated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.gift_codes (
  id bigint generated always as identity primary key,
  code_hash text not null unique,
  label text not null,
  created_at timestamptz not null default now(),
  redeemed_by uuid unique references auth.users(id),
  redeemed_at timestamptz,
  expires_at timestamptz,
  disabled boolean not null default false
);
create table if not exists public.stripe_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);
create index if not exists gift_codes_available_idx on public.gift_codes (disabled, expires_at) where redeemed_by is null;

alter table public.entitlements enable row level security;
alter table public.gift_codes enable row level security;
alter table public.stripe_events enable row level security;
revoke all on public.entitlements from anon, authenticated;
grant select on public.entitlements to authenticated;
revoke all on public.gift_codes from anon, authenticated;
revoke all on public.stripe_events from anon, authenticated;

drop policy if exists "Read only own access" on public.entitlements;
create policy "Read only own access" on public.entitlements
for select to authenticated using ((select auth.uid()) = user_id);
-- Nadie accede ni modifica gift_codes ni stripe_events por API publica.
-- Solo la cuenta service_role / el SQL Editor pueden insertar y administrar codigos.

create or replace function public.redeem_gift(p_user uuid, p_code_hash text) returns boolean
language plpgsql security invoker set search_path = ''
as $$
declare v_code_id bigint;
begin
 if p_user is null then return false; end if;
 if exists (select 1 from public.entitlements where user_id=p_user) then return false; end if;
 select id into v_code_id from public.gift_codes where code_hash=p_code_hash
   and redeemed_by is null and disabled=false and (expires_at is null or expires_at>now())
   for update skip locked limit 1;
 if v_code_id is null then return false; end if;
 update public.gift_codes set redeemed_by=p_user,redeemed_at=now()
   where id=v_code_id and redeemed_by is null;
 insert into public.entitlements(user_id,access_kind) values(p_user,'gift')
   on conflict(user_id) do nothing;
 return true;
end $$;
revoke all on function public.redeem_gift(uuid,text) from PUBLIC,anon,authenticated;
grant execute on function public.redeem_gift(uuid,text) to service_role;

-- Solo el servidor autenticado por SUPABASE_SERVICE_ROLE_KEY puede ejecutar el canje.
-- Los clientes nunca deben tener acceso directo a la funcion ni a gift_codes.
