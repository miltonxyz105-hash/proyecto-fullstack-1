-- ============================================================================
-- XP LEGACY — Migración 0001
-- Catálogo global de juegos + biblioteca personal + reseñas compartidas
-- ----------------------------------------------------------------------------
-- Cómo aplicarla:
--   · Supabase Dashboard → SQL Editor → pegar y ejecutar, o
--   · `supabase db push` si se usa la CLI.
--
-- Es 100% ADITIVA: no modifica ni elimina `juegos`, `reviews`, `favoritos` o
-- `usuarios`. La API actual sigue funcionando igual mientras se migra el
-- código a las nuevas tablas. Todas las sentencias son idempotentes.
--
-- Habilita:
--   · Un catálogo de juegos compartido por todos los usuarios.
--   · Una biblioteca personal por usuario con datos reales de platino.
--   · Reseñas públicas sobre el MISMO juego (clave de la red social).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. CATÁLOGO GLOBAL DE JUEGOS (fuente única, compartida)
-- ---------------------------------------------------------------------------
create table if not exists public.catalogo_juegos (
  id                bigint generated always as identity primary key,
  nombre            text        not null,
  slug              text        not null unique,
  igdb_id           bigint      unique,
  rawg_id           bigint      unique,
  cover_url         text,
  fecha_lanzamiento date,
  generos           text[]      not null default '{}',
  plataformas       text[]      not null default '{}',
  resumen           text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint catalogo_juegos_nombre_no_vacio check (length(trim(nombre)) > 0)
);

comment on table public.catalogo_juegos is
  'Juegos compartidos por todos los usuarios. Reemplaza al catálogo hardcodeado del backend.';

-- Búsqueda por nombre sin distinguir mayúsculas
create index if not exists idx_catalogo_juegos_nombre
  on public.catalogo_juegos (lower(nombre));

create index if not exists idx_catalogo_juegos_igdb
  on public.catalogo_juegos (igdb_id)
  where igdb_id is not null;

-- ---------------------------------------------------------------------------
-- 2. BIBLIOTECA PERSONAL (una fila por usuario y juego)
-- ---------------------------------------------------------------------------
create table if not exists public.usuario_biblioteca (
  id                    bigint      generated always as identity primary key,
  usuario_id            uuid        not null references auth.users (id) on delete cascade,
  juego_id              bigint      not null references public.catalogo_juegos (id) on delete cascade,
  estado                text        not null default 'pendiente',
  horas_jugadas         integer     not null default 0,
  porcentaje_completado smallint    not null default 0,
  platinado             boolean     not null default false,
  fecha_platino         date,
  dificultad            smallint,
  logros_totales        integer,
  logros_desbloqueados  integer,
  fecha_inicio          date,
  fecha_fin             date,
  comentario_personal   text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint usuario_biblioteca_estado_valido
    check (estado in ('pendiente', 'jugando', 'jugado', 'completado', 'abandonado')),
  constraint usuario_biblioteca_horas_no_negativas
    check (horas_jugadas >= 0),
  constraint usuario_biblioteca_porcentaje_valido
    check (porcentaje_completado between 0 and 100),
  constraint usuario_biblioteca_dificultad_valida
    check (dificultad is null or dificultad between 1 and 10),
  constraint usuario_biblioteca_logros_coherentes
    check (logros_desbloqueados is null or logros_totales is null
           or logros_desbloqueados <= logros_totales),
  -- Un platino es, por definición, un 100%
  constraint usuario_biblioteca_platino_completo
    check (not platinado or porcentaje_completado = 100),
  constraint usuario_biblioteca_unico_usuario_juego
    unique (usuario_id, juego_id)
);

comment on table public.usuario_biblioteca is
  'Colección personal de cada usuario sobre el catálogo global.';

create index if not exists idx_biblioteca_usuario
  on public.usuario_biblioteca (usuario_id);

create index if not exists idx_biblioteca_platinados
  on public.usuario_biblioteca (usuario_id)
  where platinado = true;

create index if not exists idx_biblioteca_juego
  on public.usuario_biblioteca (juego_id);

-- ---------------------------------------------------------------------------
-- 3. RESEÑAS SOBRE EL CATÁLOGO (compartidas entre usuarios)
-- ---------------------------------------------------------------------------
create table if not exists public.reviews_catalogo (
  id          bigint      generated always as identity primary key,
  usuario_id  uuid        not null references auth.users (id) on delete cascade,
  juego_id    bigint      not null references public.catalogo_juegos (id) on delete cascade,
  puntuacion  smallint    not null,
  comentario  text        not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint reviews_catalogo_puntuacion_valida
    check (puntuacion between 1 and 10),
  constraint reviews_catalogo_unico_usuario_juego
    unique (usuario_id, juego_id)
);

comment on table public.reviews_catalogo is
  'Una reseña por usuario y juego del catálogo: es lo que permite comparar opiniones.';

create index if not exists idx_reviews_catalogo_juego
  on public.reviews_catalogo (juego_id);

create index if not exists idx_reviews_catalogo_usuario
  on public.reviews_catalogo (usuario_id);

-- ---------------------------------------------------------------------------
-- 4. PUENTE DESDE LA TABLA ACTUAL `reviews` (opcional, no destructivo)
--    Permite enlazar las reviews existentes con el catálogo global cuando
--    se decida migrar los datos.
-- ---------------------------------------------------------------------------
alter table public.reviews
  add column if not exists juego_catalogo_id bigint
  references public.catalogo_juegos (id) on delete set null;

create index if not exists idx_reviews_juego_catalogo
  on public.reviews (juego_catalogo_id)
  where juego_catalogo_id is not null;

-- ---------------------------------------------------------------------------
-- 5. TRIGGER `updated_at`
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_catalogo on public.catalogo_juegos;
create trigger set_updated_at_catalogo
  before update on public.catalogo_juegos
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_biblioteca on public.usuario_biblioteca;
create trigger set_updated_at_biblioteca
  before update on public.usuario_biblioteca
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_reviews_catalogo on public.reviews_catalogo;
create trigger set_updated_at_reviews_catalogo
  before update on public.reviews_catalogo
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
--    El backend usa la clave `service_role`, que BYPASEA RLS: el aislamiento
--    aquí protege contra lecturas directas con la clave anónima.
-- ---------------------------------------------------------------------------
alter table public.catalogo_juegos enable row level security;
alter table public.usuario_biblioteca enable row level security;
alter table public.reviews_catalogo enable row level security;

-- 6.1 Catálogo: lectura pública, escritura solo desde el backend.
drop policy if exists catalogo_lectura_publica on public.catalogo_juegos;
create policy catalogo_lectura_publica
  on public.catalogo_juegos
  for select
  to anon, authenticated
  using (true);
-- Sin policy de escritura: anon y authenticated NO pueden escribir.

-- 6.2 Biblioteca personal: cada usuario solo ve y edita lo suyo.
drop policy if exists biblioteca_select_propia on public.usuario_biblioteca;
create policy biblioteca_select_propia
  on public.usuario_biblioteca
  for select
  to authenticated
  using (usuario_id = (select auth.uid()));

drop policy if exists biblioteca_insert_propia on public.usuario_biblioteca;
create policy biblioteca_insert_propia
  on public.usuario_biblioteca
  for insert
  to authenticated
  with check (usuario_id = (select auth.uid()));

drop policy if exists biblioteca_update_propia on public.usuario_biblioteca;
create policy biblioteca_update_propia
  on public.usuario_biblioteca
  for update
  to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

drop policy if exists biblioteca_delete_propia on public.usuario_biblioteca;
create policy biblioteca_delete_propia
  on public.usuario_biblioteca
  for delete
  to authenticated
  using (usuario_id = (select auth.uid()));

-- 6.3 Reseñas: cualquiera puede LEER (comunidad), solo el autor escribe.
drop policy if exists reviews_catalogo_lectura_publica on public.reviews_catalogo;
create policy reviews_catalogo_lectura_publica
  on public.reviews_catalogo
  for select
  to anon, authenticated
  using (true);

drop policy if exists reviews_catalogo_insert_propia on public.reviews_catalogo;
create policy reviews_catalogo_insert_propia
  on public.reviews_catalogo
  for insert
  to authenticated
  with check (usuario_id = (select auth.uid()));

drop policy if exists reviews_catalogo_update_propia on public.reviews_catalogo;
create policy reviews_catalogo_update_propia
  on public.reviews_catalogo
  for update
  to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

drop policy if exists reviews_catalogo_delete_propia on public.reviews_catalogo;
create policy reviews_catalogo_delete_propia
  on public.reviews_catalogo
  for delete
  to authenticated
  using (usuario_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 7. PERMISOS EXPLÍCITOS
-- ---------------------------------------------------------------------------
grant select on public.catalogo_juegos to anon, authenticated;
grant select, insert, update, delete on public.usuario_biblioteca to authenticated;
grant select, insert, update, delete on public.reviews_catalogo to authenticated;

-- ---------------------------------------------------------------------------
-- ROLLBACK (ejecutar solo si hay que deshacer la migración)
-- ---------------------------------------------------------------------------
-- drop table if exists public.reviews_catalogo;
-- drop table if exists public.usuario_biblioteca;
-- drop table if exists public.catalogo_juegos;
-- drop function if exists public.set_updated_at();
-- alter table public.reviews drop column if exists juego_catalogo_id;
