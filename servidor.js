// ============================================================
// BACKEND - servidor.js
// Sistema de Lives | Mandacaru Esportes & TV Papagaio Icó
//
// Instalação:
//   npm install express @supabase/supabase-js cors dotenv
//
// Variáveis de ambiente (.env):
//   SUPABASE_URL=https://xxxx.supabase.co
//   SUPABASE_SERVICE_KEY=sua_service_role_key  ← NUNCA expor no frontend
//   ADMIN_PASSWORD=sua_senha_admin
//   PORT=3001
//
// Iniciar:
//   node servidor.js
// ============================================================

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app  = express();
app.use(cors());
app.use(express.json());

// ── Supabase com service_role (escrita segura no backend) ──────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY   // service_role key — somente no servidor!
);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// ── Helpers ────────────────────────────────────────────────────────────────

function validarData(str) {
  return /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(Date.parse(str));
}

function validarHora(str) {
  return /^\d{2}:\d{2}$/.test(str);
}

function verificarSenha(senha) {
  return senha === ADMIN_PASSWORD;
}

// ── POST /api/auth ─────────────────────────────────────────────────────────
// Verifica a senha do administrador
app.post('/api/auth', (req, res) => {
  const { senha } = req.body;
  if (!senha) {
    return res.status(400).json({ ok: false, mensagem: 'Senha não informada.' });
  }
  return res.json({ ok: verificarSenha(senha) });
});

// ── POST /api/criar ────────────────────────────────────────────────────────
// Cria um novo evento de live (requer senha de admin)
app.post('/api/criar', async (req, res) => {
  const {
    senha, canal, titulo, data, hora_inicio, hora_fim,
    local, descricao, criado_por
  } = req.body;

  // 1. Verifica senha
  if (!verificarSenha(senha)) {
    return res.status(401).json({ status: 'erro', codigo: 401, mensagem: 'Senha inválida.' });
  }

  // 2. Validações
  const erros = {};
  if (!canal || !['mandacaru', 'papagaio'].includes(canal))
    erros.canal = 'Canal deve ser "mandacaru" ou "papagaio".';
  if (!titulo || titulo.trim().length === 0)
    erros.titulo = 'Título é obrigatório.';
  if (!data || !validarData(data))
    erros.data = 'Data inválida. Use o formato AAAA-MM-DD.';
  if (!hora_inicio || !validarHora(hora_inicio))
    erros.hora_inicio = 'Hora de início inválida. Use o formato HH:MM.';
  if (hora_fim && !validarHora(hora_fim))
    erros.hora_fim = 'Hora de fim inválida. Use o formato HH:MM.';
  if (!local || local.trim().length === 0)
    erros.local = 'Local é obrigatório.';

  if (Object.keys(erros).length > 0) {
    return res.status(400).json({ status: 'erro', codigo: 400, erros });
  }

  // 3. Insere no Supabase
  const { data: evento, error } = await supabase
    .from('livestreams')
    .insert([{
      channel:     canal,
      title:       titulo.trim(),
      date:        data,
      start_time:  hora_inicio,
      end_time:    hora_fim || null,
      location:    local.trim(),
      description: descricao?.trim() || null,
      created_by:  criado_por?.trim() || null
    }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao inserir:', error);
    return res.status(500).json({ status: 'erro', codigo: 500, mensagem: error.message });
  }

  return res.status(201).json({ status: 'ok', codigo: 201, evento });
});

// ── GET /api/listar ────────────────────────────────────────────────────────
// Lista eventos com filtros opcionais: ?canal=mandacaru&data_inicio=&data_fim=
app.get('/api/listar', async (req, res) => {
  const { canal, data_inicio, data_fim } = req.query;

  let query = supabase.from('livestreams').select('*');

  if (canal && ['mandacaru', 'papagaio'].includes(canal)) {
    query = query.eq('channel', canal);
  }
  if (data_inicio && validarData(data_inicio)) {
    query = query.gte('date', data_inicio);
  }
  if (data_fim && validarData(data_fim)) {
    query = query.lte('date', data_fim);
  }

  query = query.order('date', { ascending: true }).order('start_time', { ascending: true });

  const { data: eventos, error } = await query;

  if (error) {
    return res.status(500).json({ status: 'erro', codigo: 500, mensagem: error.message });
  }

  return res.json({ status: 'ok', codigo: 200, eventos });
});

// ── GET /api/evento/:id ────────────────────────────────────────────────────
// Retorna um evento específico pelo UUID
app.get('/api/evento/:id', async (req, res) => {
  const { id } = req.params;

  const { data: evento, error } = await supabase
    .from('livestreams')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !evento) {
    return res.status(404).json({ status: 'erro', codigo: 404, mensagem: 'Evento não encontrado.' });
  }

  return res.json({ status: 'ok', codigo: 200, evento });
});

// ── GET /api/calendario/:ano/:mes ──────────────────────────────────────────
// Retorna os dias do mês que possuem eventos, com lista por dia
app.get('/api/calendario/:ano/:mes', async (req, res) => {
  const { ano, mes } = req.params;
  const anoNum = parseInt(ano, 10);
  const mesNum = parseInt(mes, 10);

  if (isNaN(anoNum) || isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
    return res.status(400).json({ status: 'erro', codigo: 400, mensagem: 'Ano ou mês inválido.' });
  }

  const dataInicio = `${ano}-${String(mesNum).padStart(2, '0')}-01`;
  const ultimoDia  = new Date(anoNum, mesNum, 0).getDate();
  const dataFim    = `${ano}-${String(mesNum).padStart(2, '0')}-${ultimoDia}`;

  const { data: eventos, error } = await supabase
    .from('livestreams')
    .select('id, channel, title, date, start_time')
    .gte('date', dataInicio)
    .lte('date', dataFim)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    return res.status(500).json({ status: 'erro', codigo: 500, mensagem: error.message });
  }

  const emoji = { mandacaru: '🌵', papagaio: '🦜' };

  // Agrupa por data
  const diasMap = {};
  for (const ev of eventos) {
    if (!diasMap[ev.date]) diasMap[ev.date] = [];
    diasMap[ev.date].push({
      id:         ev.id,
      canal:      ev.channel,
      emoji:      emoji[ev.channel] || '📺',
      titulo:     ev.title,
      hora_inicio: ev.start_time
    });
  }

  const dias = Object.entries(diasMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, eventos]) => ({ data, eventos }));

  return res.json({
    status: 'ok',
    codigo: 200,
    mes: `${ano}-${String(mesNum).padStart(2, '0')}`,
    dias
  });
});

// ── DELETE /api/deletar/:id ────────────────────────────────────────────────
// Remove um evento (requer senha no body)
app.delete('/api/deletar/:id', async (req, res) => {
  const { id }   = req.params;
  const { senha } = req.body;

  if (!verificarSenha(senha)) {
    return res.status(401).json({ status: 'erro', codigo: 401, mensagem: 'Senha inválida.' });
  }

  const { error } = await supabase
    .from('livestreams')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ status: 'erro', codigo: 500, mensagem: error.message });
  }

  return res.json({ status: 'ok', codigo: 200, mensagem: 'Evento removido com sucesso.' });
});

// ── Inicia o servidor ──────────────────────────────────────────────────────
const PORTA = process.env.PORT || 3001;
app.listen(PORTA, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORTA}`);
  console.log(`   Mandacaru 🌵 & TV Papagaio 🦜 — Sistema de Lives`);
});
