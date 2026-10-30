-- Obra Conecta: estrutura inicial do banco de dados
-- Cole este arquivo no SQL Editor do seu projeto Supabase e execute.
create table if not exists public.professionals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  category text not null,
  location text not null,
  description text not null,
  phone text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.budget_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  service text not null,
  location text not null,
  description text not null,
  created_at timestamptz not null default now()
);

alter table public.professionals enable row level security;
alter table public.budget_requests enable row level security;

-- Público pode ver somente profissionais aprovados.
create policy "Public can view approved professionals"
on public.professionals for select
to anon, authenticated
using (approved = true);

-- Cadastro público de profissionais entra pendente de aprovação.
create policy "Anyone can submit professional profile"
on public.professionals for insert
to anon, authenticated
with check (approved = false);

-- Qualquer visitante pode enviar pedido de orçamento.
create policy "Anyone can submit budget request"
on public.budget_requests for insert
to anon, authenticated
with check (true);
