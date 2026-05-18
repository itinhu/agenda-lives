# 📺 Sistema de Lives — Mandacaru Esportes & TV Papagaio Icó

Next.js 14 · App Router · TypeScript · Supabase · Deploy na Vercel

---

## 🗂 Estrutura do projeto

```
lives-nextjs/
├── schema.sql                         ← Cole no Supabase SQL Editor
├── .env.local.example                 ← Renomeie para .env.local
├── next.config.js
├── package.json
└── src/
    ├── app/
    │   ├── layout.tsx                 ← Layout raiz (fontes, metadata)
    │   ├── globals.css                ← Variáveis CSS e animações
    │   ├── page.tsx                   ← Página principal
    │   ├── components/
    │   │   ├── CalendarioClient.tsx   ← Grade do calendário
    │   │   ├── ModalDia.tsx           ← Modal de detalhes do dia
    │   │   └── TelaAdmin.tsx          ← Painel admin (senha + formulário)
    │   └── api/
    │       ├── auth/route.ts          ← POST /api/auth
    │       ├── criar/route.ts         ← POST /api/criar
    │       ├── listar/route.ts        ← GET  /api/listar
    │       ├── evento/[id]/route.ts   ← GET  /api/evento/:id
    │       └── calendario/[ano]/[mes]/route.ts  ← GET /api/calendario/:ano/:mes
    └── lib/
        └── supabase.ts                ← Cliente Supabase (server-only)
```

---

## 🚀 Deploy na Vercel (passo a passo)

### 1. Preparar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** → cole e execute o conteúdo de `schema.sql`
3. Anote as credenciais em **Settings → API**:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` (secret) → `SUPABASE_SERVICE_KEY`

### 2. Subir para o GitHub

```bash
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

> Certifique-se que `.env.local` está no `.gitignore` (o Next.js já faz isso por padrão).

### 3. Importar na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new) e importe o repositório
2. Em **Environment Variables**, adicione:

| Nome                  | Valor                                    |
|-----------------------|------------------------------------------|
| `SUPABASE_URL`        | `https://SEU_PROJETO.supabase.co`        |
| `SUPABASE_SERVICE_KEY`| `sua_service_role_key`                   |
| `ADMIN_PASSWORD`      | `sua_senha_forte_aqui`                   |

3. Clique em **Deploy** — pronto! 🎉

### 4. Desenvolvimento local

```bash
# Renomear o arquivo de exemplo
cp .env.local.example .env.local
# Preencher com suas credenciais reais

npm install
npm run dev
# Acesse http://localhost:3000
```

---

## 🔌 Rotas da API

| Método   | Rota                            | Descrição                     | Auth   |
|----------|---------------------------------|-------------------------------|--------|
| `POST`   | `/api/auth`                     | Verifica senha do admin       | —      |
| `GET`    | `/api/listar`                   | Lista eventos (com filtros)   | —      |
| `GET`    | `/api/evento/:id`               | Detalhes de um evento         | —      |
| `GET`    | `/api/calendario/:ano/:mes`     | Dias com lives no mês         | —      |
| `POST`   | `/api/criar`                    | Cria nova live                | Senha  |
| `DELETE` | `/api/evento/:id`               | Remove uma live               | Senha  |

---

## 🎨 Canais

| Canal               | Emoji | Cor      |
|---------------------|-------|----------|
| Mandacaru Esportes  | 🌵    | Verde    |
| TV Papagaio Icó     | 🦜    | Vermelho |

---

## 🔒 Segurança

- A `service_role key` fica **somente no servidor** (variável de ambiente da Vercel)
- O frontend nunca tem acesso a essa chave
- O RLS do Supabase bloqueia escrita direta pelo cliente
- Todas as escritas passam pelo backend com verificação de senha
