-- ============================================================
-- schema.sql — Cole no SQL Editor do Supabase Dashboard
-- Sistema de Lives | Mandacaru Esportes & TV Papagaio Icó
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

CREATE INDEX idx_livestreams_date    ON public.livestreams (date);
CREATE INDEX idx_livestreams_channel ON public.livestreams (channel);

-- RLS: leitura pública, escrita somente via service_role (backend)
ALTER TABLE public.livestreams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leitura_publica"
  ON public.livestreams FOR SELECT USING (true);

-- Dados de exemplo (remova em produção se quiser)
INSERT INTO public.livestreams (channel, title, date, start_time, end_time, location, description, created_by)
VALUES
  ('mandacaru', 'Mandacaru — Treino Ao Vivo',         '2026-05-20', '19:00', '21:00', 'Estádio Municipal Icó',    'Transmissão ao vivo do treino.', 'admin'),
  ('papagaio',  'TV Papagaio — Entrevista Especial',  '2026-05-22', '20:30', '22:00', 'Estúdio TV Papagaio Icó',  'Entrevista com o técnico.',      'admin'),
  ('mandacaru', 'Mandacaru — Jogo do Campeonato',     '2026-05-28', '18:00', '20:30', 'Ginásio Municipal',         'Partida pelo campeonato.',       'admin'),
  ('papagaio',  'TV Papagaio — Cobertura Pós-Jogo',  '2026-05-28', '21:00', null,    'Estúdio TV Papagaio Icó',  'Comentários e entrevistas.',     'admin');
