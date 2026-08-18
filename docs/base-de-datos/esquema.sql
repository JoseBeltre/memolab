-- Esquema de la base de datos de MemoLab.
-- Se ejecuta una sola vez en el SQL Editor del proyecto de Supabase.

create table mazos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  nombre varchar(60) not null,
  descripcion text not null default '',
  creado_en timestamptz not null default now()
);

create table tarjetas (
  id uuid primary key default gen_random_uuid(),
  mazo_id uuid not null references mazos (id) on delete cascade,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  anverso text not null,
  reverso text not null,
  repeticiones integer not null default 0,
  factor_facilidad numeric(4, 2) not null default 2.5,
  intervalo integer not null default 0,
  proximo_repaso date not null default current_date,
  creado_en timestamptz not null default now()
);

create table notas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null,
  contenido text not null default '',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- Indice para la consulta de tarjetas vencidas de la sesion de repaso.
create index tarjetas_repaso_idx on tarjetas (usuario_id, proximo_repaso);
create index tarjetas_mazo_idx on tarjetas (mazo_id);
create index notas_usuario_idx on notas (usuario_id);

-- Row Level Security: cada usuario solo puede tocar sus propios registros.
alter table mazos enable row level security;
alter table tarjetas enable row level security;
alter table notas enable row level security;

create policy "ver mis mazos" on mazos for select using (auth.uid() = usuario_id);
create policy "crear mis mazos" on mazos for insert with check (auth.uid() = usuario_id);
create policy "editar mis mazos" on mazos for update using (auth.uid() = usuario_id);
create policy "eliminar mis mazos" on mazos for delete using (auth.uid() = usuario_id);

create policy "ver mis tarjetas" on tarjetas for select using (auth.uid() = usuario_id);
create policy "crear mis tarjetas" on tarjetas for insert with check (auth.uid() = usuario_id);
create policy "editar mis tarjetas" on tarjetas for update using (auth.uid() = usuario_id);
create policy "eliminar mis tarjetas" on tarjetas for delete using (auth.uid() = usuario_id);

create policy "ver mis notas" on notas for select using (auth.uid() = usuario_id);
create policy "crear mis notas" on notas for insert with check (auth.uid() = usuario_id);
create policy "editar mis notas" on notas for update using (auth.uid() = usuario_id);
create policy "eliminar mis notas" on notas for delete using (auth.uid() = usuario_id);
