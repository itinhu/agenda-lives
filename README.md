# 📺 Sistema de Agendamento de Lives - TV Mandacaru & TV Papagaio Icó

Sistema robusto com calendário visual para agendamento de lives esportivas.

## 🌟 Recursos

- ✅ Calendário interativo (mês/semana/dia)
- ✅ Emojis: 🌴 TV Mandacaru | 🦜 TV Papagaio Icó
- ✅ Link direto para a live
- ✅ Embed da live ao vivo
- ✅ Supabase (banco + realtime)
- ✅ Responsivo (mobile/desktop)

## 🚀 Instalação

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Criar novo projeto
3. Anote: **URL** e **Anon Key** (Settings → API)

### 2. Configurar Banco de Dados

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie e cole todo conteúdo de `supabase/schema.sql`
4. Clique em **Run**

### 3. Configurar Frontend

```bash
# Criar pasta do projeto
mkdir tv-mandacaru-schedule
cd tv-mandacaru-schedule

# Criar estrutura de pastas
mkdir -p supabase frontend/src/components

# Criar arquivos (copie o conteúdo de cada arquivo acima)

# Configurar variáveis de ambiente
cd frontend
cp .env.local.example .env.local

# Editar .env.local:
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon

# Instalar dependências
npm install

# Rodar projeto
npm run dev
```

### 4. Acessar

Abra: http://localhost:5173

## 📅 Adicionar Lives

### Via SQL (Supabase):

```sql
INSERT INTO events (
  channel_id, 
  title, 
  start_time, 
  end_time, 
  live_url,
  event_type_id,
  description
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', -- TV Mandacaru (🌴)
  'Jogo Ceará vs Fortaleza',
  '2026-05-20 19:00:00-03',
  '2026-05-20 21:30:00-03',
  'https://youtube.com/watch?v=SEU_VIDEO_ID',
  'c3d4e5f6-a7b8-9012-cdef-123456789012', -- Jogo Esportivo
  'Transmissão ao vivo do jogo do вере'
);
```

### Para TV Papagaio Icó (🦜), use:
`channel_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901'`

## 🎯 Canais

| Canal | Emoji | ID |
|-------|-------|----|
| TV Mandacaru | 🌴 | a1b2c3d4-e5f6-7890-abcd-ef1234567890 |
| TV Papagaio Icó | 🦜 | b2c3d4e5-f6a7-8901-bcde-f12345678901 |

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Calendar**: react-big-calendar
- **Backend**: Supabase (PostgreSQL)
- **Realtime**: Supabase Realtime
- **Styling**: CSS3

## 📱 Hospedagem

### Opção 1: Vercel (Recomendado)
```bash
npm run build
# Deploy na Vercel apontando para pasta frontend
```

### Opção 2: Netlify
```bash
npm run build
# Deploy na Netlify apontando para frontend/dist
```