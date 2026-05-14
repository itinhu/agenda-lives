-- ============================================================
-- SCHEMA - Sistema de Lives | Mandacaru Esportes & TV Papagaio
-- Cole este SQL no editor SQL do Supabase Dashboard
-- ============================================================

-- Habilita a extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela principal de lives
CREATE TABLE public.livestreams (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel     text        NOT NULL CHECK (channel IN ('mandacaru', 'papagaio')),
  title       text        NOT NULL,
  date        date        NOT NULL,
  start_time  time        NOT NULL,
  end_time    time,
  location    text        NOT NULL,
  description text,
  created_by  text,
  created_at  timestamptz DEFAULT now()
);

-- Índices para performance em consultas por data e canal
CREATE INDEX idx_livestreams_date    ON public.livestreams (date);
CREATE INDEX idx_livestreams_channel ON public.livestreams (channel);

-- ============================================================
-- RLS (Row Level Security) - RECOMENDADO EM PRODUÇÃO
-- ============================================================

-- Habilita RLS na tabela
ALTER TABLE public.livestreams ENABLE ROW LEVEL SECURITY;

-- Leitura pública (anon key pode ler)
CREATE POLICY "Leitura pública"
  ON public.livestreams
  FOR SELECT
  USING (true);

-- Escrita somente via service_role (backend autenticado)
-- O INSERT/UPDATE/DELETE deve ser feito pelo backend com a service_role key
-- Não exponha a service_role key no frontend!

-- ============================================================
-- DADOS DE EXEMPLO (opcional, remova em produção)
-- ============================================================
INSERT INTO public.livestreams (channel, title, date, start_time, end_time, location, description, created_by)
VALUES
  ('mandacaru', 'Mandacaru Esportes - Treino Ao Vivo',    '2026-05-20', '19:00', '21:00', 'Estádio Municipal Icó',     'Transmissão ao vivo do treino do time local.',           'admin'),
  ('papagaio',  'TV Papagaio - Entrevista com o Técnico', '2026-05-22', '20:30', '22:00', 'Estúdio TV Papagaio Icó',   'Entrevista exclusiva com o técnico da equipe.',          'admin'),
  ('mandacaru', 'Mandacaru - Jogo do Campeonato',         '2026-05-28', '18:00', '20:30', 'Ginásio Municipal',         'Partida válida pelo campeonato regional.',               'admin'),
  ('papagaio',  'TV Papagaio - Cobertura Especial',       '2026-05-28', '21:00', null,    'Estúdio TV Papagaio Icó',   'Cobertura pós-jogo com comentários e entrevistas.',     'admin');
