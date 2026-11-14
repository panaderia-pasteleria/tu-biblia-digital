-- Biblioteca de contenido protegido: solo usuarios con licencia.
-- El repositorio y la PWA actuales siguen siendo publicos hasta el lanzamiento.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('tbd-biblia-protegida','tbd-biblia-protegida',false,52428800,array['application/json'])
on conflict (id) do nothing;

drop policy if exists "TBD buyers may read Bible content" on storage.objects;
create policy "TBD buyers may read Bible content" on storage.objects
for select to authenticated
using (
  bucket_id='tbd-biblia-protegida' and
  exists (
    select 1 from public.entitlements e
    where e.user_id=(select auth.uid())
  )
);
-- Upload SOLO con service_role desde una fuente con licencia comercial verificada.
-- No crear politicas de escritura para anon ni authenticated.
