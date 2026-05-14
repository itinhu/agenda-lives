# 📺 Sistema de Lives — Mandacaru Esportes & TV Papagaio Icó

Sistema completo para agendamento e exibição de transmissões ao vivo dos dois canais.

---

## 🗂️ Estrutura dos arquivos

```
livestream-project/
├── schema.sql        ← Cole no SQL Editor do Supabase
├── servidor.js       ← Backend Node/Express
├── Calendario.jsx    ← Componente React do calendário
├── .env              ← Variáveis de ambiente (NÃO envie para o Git!)
└── README.md
```

---

## 🚀 Passo a passo de instalação

### 1. Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **SQL Editor** e cole todo o conteúdo de `schema.sql`
3. Execute — a tabela `livestreams` será criada com os dados de exemplo

### 2. Configurar o Backend

**Instalar dependências:**
```bash
npm install express @supabase/supabase-js cors dotenv
```

**Criar o arquivo `.env`** na mesma pasta de `servidor.js`:
```env
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_SERVICE_KEY=sua_service_role_key_aqui
ADMIN_PASSWORD=sua_senha_segura_aqui
PORT=3001
```

> ⚠️ **IMPORTANTE:** Use a `service_role key` (não a `anon key`) no backend.
> Nunca exponha essa chave no frontend!

**Iniciar o servidor:**
```bash
node servidor.js
```

O servidor estará disponível em `http://localhost:3001`

### 3. Usar o componente React

Instale no seu projeto React e importe:
```jsx
import Calendario from "./Calendario";

function App() {
  return <Calendario apiUrl="http://localhost:3001" />;
}
```

---

## 🔌 Rotas do Backend

| Método | Rota                         | Descrição                        | Auth   |
|--------|------------------------------|----------------------------------|--------|
| POST   | `/api/auth`                  | Verifica senha do admin          | Não    |
| GET    | `/api/listar`                | Lista eventos (com filtros)      | Não    |
| GET    | `/api/evento/:id`            | Detalhes de um evento            | Não    |
| GET    | `/api/calendario/:ano/:mes`  | Calendário do mês                | Não    |
| POST   | `/api/criar`                 | Cria nova live                   | Senha  |
| DELETE | `/api/deletar/:id`           | Remove uma live                  | Senha  |

### Exemplos de uso (fetch / curl)

**Listar todas as lives de maio/2026:**
```bash
curl "http://localhost:3001/api/listar?data_inicio=2026-05-01&data_fim=2026-05-31"
```

**Listar apenas Mandacaru:**
```bash
curl "http://localhost:3001/api/listar?canal=mandacaru"
```

**Calendário de maio/2026:**
```bash
curl "http://localhost:3001/api/calendario/2026/5"
```

**Criar evento (admin):**
```bash
curl -X POST http://localhost:3001/api/criar \
  -H "Content-Type: application/json" \
  -d '{
    "senha": "sua_senha",
    "canal": "mandacaru",
    "titulo": "Jogo do Campeonato",
    "data": "2026-06-10",
    "hora_inicio": "19:00",
    "hora_fim": "21:00",
    "local": "Estádio Municipal Icó",
    "descricao": "Final do campeonato regional",
    "criado_por": "Admin"
  }'
```

---

## 🎨 Emojis dos canais

| Canal               | Emoji |
|---------------------|-------|
| Mandacaru Esportes  | 🌵    |
| TV Papagaio Icó     | 🦜    |

---

## 🔒 Segurança

- A `service_role key` do Supabase **nunca** deve aparecer no frontend
- A senha do admin é verificada no backend antes de qualquer escrita
- O frontend usa somente leitura pública (via RLS configurado no `schema.sql`)
- Adicione HTTPS em produção (use um proxy como Nginx ou um serviço como Railway/Render)

---

## 📦 Implantação em produção

Opções gratuitas/baratas recomendadas:
- **Backend:** [Railway](https://railway.app), [Render](https://render.com), ou [Fly.io](https://fly.io)
- **Frontend:** [Vercel](https://vercel.com) ou [Netlify](https://netlify.com)
- **Banco de dados:** Supabase (já configurado)

Configure as variáveis de ambiente na plataforma escolhida (não use o `.env` em produção).
