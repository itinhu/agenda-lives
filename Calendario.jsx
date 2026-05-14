// ============================================================
// FRONTEND - Calendario.jsx
// Sistema de Lives | Mandacaru Esportes & TV Papagaio Icó
//
// Dependências: React, Tailwind CSS (ou configure CSS-in-JS)
// Props:
//   apiUrl   - URL base do backend, ex: "http://localhost:3001"
//
// Uso:
//   <Calendario apiUrl="http://localhost:3001" />
// ============================================================

import { useState, useEffect, useCallback } from "react";

// ── Constantes ─────────────────────────────────────────────
const CANAIS = {
  mandacaru: { emoji: "🌵", nome: "Mandacaru Esportes",   cor: "#16a34a" },
  papagaio:  { emoji: "🦜", nome: "TV Papagaio Icó",      cor: "#dc2626" },
};

const MESES_PT = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

const DIAS_SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

// ── Componente principal ────────────────────────────────────
export default function Calendario({ apiUrl = "http://localhost:3001" }) {
  const hoje       = new Date();
  const [ano, setAno]   = useState(hoje.getFullYear());
  const [mes, setMes]   = useState(hoje.getMonth() + 1);
  const [diasComLives, setDiasComLives] = useState({});
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [carregando, setCarregando]    = useState(false);
  const [telaAdmin, setTelaAdmin]      = useState(false);

  // ── Carrega o calendário do mês ───────────────────────────
  const carregarCalendario = useCallback(async () => {
    setCarregando(true);
    try {
      const res  = await fetch(`${apiUrl}/api/calendario/${ano}/${mes}`);
      const json = await res.json();
      if (json.status === "ok") {
        const mapa = {};
        for (const dia of json.dias) mapa[dia.data] = dia.eventos;
        setDiasComLives(mapa);
      }
    } catch (e) {
      console.error("Erro ao carregar calendário:", e);
    } finally {
      setCarregando(false);
    }
  }, [ano, mes, apiUrl]);

  useEffect(() => { carregarCalendario(); }, [carregarCalendario]);

  // ── Navega entre meses ────────────────────────────────────
  function mesAnterior() {
    if (mes === 1) { setAno(a => a - 1); setMes(12); }
    else setMes(m => m - 1);
    setEventoSelecionado(null);
  }
  function proximoMes() {
    if (mes === 12) { setAno(a => a + 1); setMes(1); }
    else setMes(m => m + 1);
    setEventoSelecionado(null);
  }

  // ── Monta a grade do calendário ───────────────────────────
  const primeiroDia   = new Date(ano, mes - 1, 1).getDay();
  const ultimoDia     = new Date(ano, mes, 0).getDate();
  const celulas       = [];

  for (let i = 0; i < primeiroDia; i++) celulas.push(null);
  for (let d = 1; d <= ultimoDia; d++) celulas.push(d);

  function dataStr(dia) {
    return `${ano}-${String(mes).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
  }

  const ehHoje = (dia) => {
    const h = new Date();
    return h.getFullYear() === ano && h.getMonth() + 1 === mes && h.getDate() === dia;
  };

  // ── Renderização ──────────────────────────────────────────
  return (
    <div style={estilos.container}>
      {/* Cabeçalho */}
      <div style={estilos.header}>
        <div style={estilos.logoArea}>
          <span style={estilos.logoEmoji}>🌵</span>
          <div>
            <h1 style={estilos.titulo}>Agenda de Lives</h1>
            <p style={estilos.subtitulo}>Mandacaru Esportes & TV Papagaio Icó</p>
          </div>
          <span style={estilos.logoEmoji}>🦜</span>
        </div>
        <button style={estilos.btnAdmin} onClick={() => setTelaAdmin(true)}>
          ⚙️ Admin
        </button>
      </div>

      {/* Legenda dos canais */}
      <div style={estilos.legenda}>
        {Object.entries(CANAIS).map(([key, c]) => (
          <div key={key} style={estilos.legendaItem}>
            <span>{c.emoji}</span>
            <span style={{ color: c.cor, fontWeight: 600 }}>{c.nome}</span>
          </div>
        ))}
      </div>

      {/* Navegação de mês */}
      <div style={estilos.navMes}>
        <button style={estilos.btnNav} onClick={mesAnterior}>◀</button>
        <h2 style={estilos.mesAno}>{MESES_PT[mes - 1]} {ano}</h2>
        <button style={estilos.btnNav} onClick={proximoMes}>▶</button>
      </div>

      {/* Grade do calendário */}
      {carregando ? (
        <div style={estilos.loading}>Carregando... ⏳</div>
      ) : (
        <div style={estilos.grade}>
          {DIAS_SEMANA.map(d => (
            <div key={d} style={estilos.cabecalhoDia}>{d}</div>
          ))}
          {celulas.map((dia, i) => {
            if (!dia) return <div key={`v-${i}`} />;
            const key  = dataStr(dia);
            const lives = diasComLives[key] || [];
            const temLive = lives.length > 0;
            return (
              <div
                key={key}
                style={{
                  ...estilos.celulaDia,
                  ...(ehHoje(dia) ? estilos.hoje : {}),
                  ...(temLive ? estilos.temLive : {}),
                  cursor: temLive ? "pointer" : "default",
                }}
                onClick={() => temLive && setEventoSelecionado({ data: key, lives })}
              >
                <span style={estilos.numeroDia}>{dia}</span>
                {lives.slice(0, 2).map((ev, idx) => (
                  <div key={idx} style={{
                    ...estilos.badgeLive,
                    backgroundColor: CANAIS[ev.canal]?.cor + "22",
                    borderLeft: `3px solid ${CANAIS[ev.canal]?.cor || "#888"}`,
                  }}>
                    {ev.emoji} <span style={estilos.badgeHora}>{ev.hora_inicio?.slice(0,5)}</span>
                  </div>
                ))}
                {lives.length > 2 && (
                  <div style={estilos.maisLives}>+{lives.length - 2} mais</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de detalhes do dia */}
      {eventoSelecionado && (
        <ModalDia
          data={eventoSelecionado.data}
          lives={eventoSelecionado.lives}
          apiUrl={apiUrl}
          onFechar={() => setEventoSelecionado(null)}
          onAtualizar={carregarCalendario}
        />
      )}

      {/* Tela Admin */}
      {telaAdmin && (
        <TelaAdmin
          apiUrl={apiUrl}
          onFechar={() => { setTelaAdmin(false); carregarCalendario(); }}
        />
      )}
    </div>
  );
}

// ── Modal de detalhes do dia ────────────────────────────────
function ModalDia({ data, lives, apiUrl, onFechar, onAtualizar }) {
  const [detalhe, setDetalhe] = useState(null);

  async function verDetalhes(id) {
    const res  = await fetch(`${apiUrl}/api/evento/${id}`);
    const json = await res.json();
    if (json.status === "ok") setDetalhe(json.evento);
  }

  const [d, m, a] = data.split("-").reverse();
  const dataFormatada = `${d}/${m}/${a}`;

  return (
    <div style={estilos.overlay} onClick={onFechar}>
      <div style={estilos.modal} onClick={e => e.stopPropagation()}>
        <div style={estilos.modalHeader}>
          <h3 style={estilos.modalTitulo}>📅 Lives em {dataFormatada}</h3>
          <button style={estilos.btnFechar} onClick={onFechar}>✕</button>
        </div>

        {!detalhe ? (
          <div style={estilos.listaLives}>
            {lives.map(ev => (
              <div
                key={ev.id}
                style={{
                  ...estilos.cardLive,
                  borderLeft: `4px solid ${CANAIS[ev.canal]?.cor || "#888"}`,
                }}
                onClick={() => verDetalhes(ev.id)}
              >
                <div style={estilos.cardLiveTop}>
                  <span style={estilos.cardEmoji}>{ev.emoji}</span>
                  <div>
                    <div style={estilos.cardNomeCanal}>{CANAIS[ev.canal]?.nome}</div>
                    <div style={estilos.cardTituloLive}>{ev.titulo}</div>
                  </div>
                  <div style={estilos.cardHora}>{ev.hora_inicio?.slice(0,5)}</div>
                </div>
                <div style={estilos.verMais}>Ver detalhes →</div>
              </div>
            ))}
          </div>
        ) : (
          <DetalheEvento evento={detalhe} onVoltar={() => setDetalhe(null)} />
        )}
      </div>
    </div>
  );
}

// ── Detalhe de um evento ────────────────────────────────────
function DetalheEvento({ evento, onVoltar }) {
  const canal = CANAIS[evento.channel] || { emoji: "📺", nome: evento.channel, cor: "#888" };
  return (
    <div style={estilos.detalhe}>
      <button style={estilos.btnVoltar} onClick={onVoltar}>← Voltar</button>
      <div style={{ ...estilos.detalheCanal, color: canal.cor }}>
        {canal.emoji} {canal.nome}
      </div>
      <h2 style={estilos.detalheTitulo}>{evento.title}</h2>
      <div style={estilos.detalheGrade}>
        <Item label="📅 Data"    valor={evento.date?.split("-").reverse().join("/")} />
        <Item label="🕐 Início"  valor={evento.start_time?.slice(0,5)} />
        {evento.end_time && <Item label="🕐 Fim" valor={evento.end_time?.slice(0,5)} />}
        <Item label="📍 Local"   valor={evento.location} />
        {evento.description && <Item label="📝 Descrição" valor={evento.description} fullWidth />}
        {evento.created_by  && <Item label="👤 Criado por" valor={evento.created_by} />}
      </div>
    </div>
  );
}

function Item({ label, valor, fullWidth }) {
  return (
    <div style={{ ...estilos.detalheItem, ...(fullWidth ? { gridColumn: "1/-1" } : {}) }}>
      <span style={estilos.detalheLabel}>{label}</span>
      <span style={estilos.detalheValor}>{valor}</span>
    </div>
  );
}

// ── Tela Admin ──────────────────────────────────────────────
function TelaAdmin({ apiUrl, onFechar }) {
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha]             = useState("");
  const [errSenha, setErrSenha]       = useState("");
  const [form, setForm]               = useState({
    canal: "mandacaru", titulo: "", data: "", hora_inicio: "",
    hora_fim: "", local: "", descricao: "", criado_por: ""
  });
  const [erros, setErros]   = useState({});
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function verificarSenha() {
    const res  = await fetch(`${apiUrl}/api/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha })
    });
    const json = await res.json();
    if (json.ok) { setAutenticado(true); setErrSenha(""); }
    else setErrSenha("Senha incorreta. Tente novamente.");
  }

  async function salvarEvento() {
    setEnviando(true); setSucesso(""); setErros({});
    try {
      const res  = await fetch(`${apiUrl}/api/criar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha, ...form })
      });
      const json = await res.json();
      if (json.status === "ok") {
        setSucesso("✅ Live cadastrada com sucesso!");
        setForm({ canal: "mandacaru", titulo: "", data: "", hora_inicio: "",
                  hora_fim: "", local: "", descricao: "", criado_por: "" });
      } else if (json.erros) {
        setErros(json.erros);
      } else {
        setErros({ geral: json.mensagem || "Erro desconhecido." });
      }
    } catch (e) {
      setErros({ geral: "Erro de conexão com o servidor." });
    } finally {
      setEnviando(false);
    }
  }

  const campo = (key, label, tipo = "text", placeholder = "") => (
    <div style={estilos.campo}>
      <label style={estilos.label}>{label}</label>
      <input
        type={tipo}
        value={form[key]}
        placeholder={placeholder}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        style={{ ...estilos.input, ...(erros[key] ? estilos.inputErro : {}) }}
      />
      {erros[key] && <span style={estilos.textoErro}>{erros[key]}</span>}
    </div>
  );

  return (
    <div style={estilos.overlay} onClick={onFechar}>
      <div style={{ ...estilos.modal, maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div style={estilos.modalHeader}>
          <h3 style={estilos.modalTitulo}>⚙️ Painel Admin</h3>
          <button style={estilos.btnFechar} onClick={onFechar}>✕</button>
        </div>

        {!autenticado ? (
          <div style={estilos.formSenha}>
            <p style={{ marginBottom: 12, color: "#555" }}>Digite a senha de administrador:</p>
            <input
              type="password"
              value={senha}
              placeholder="••••••••"
              onChange={e => setSenha(e.target.value)}
              onKeyDown={e => e.key === "Enter" && verificarSenha()}
              style={estilos.input}
            />
            {errSenha && <div style={estilos.textoErro}>{errSenha}</div>}
            <button style={estilos.btnPrimario} onClick={verificarSenha}>
              Entrar
            </button>
          </div>
        ) : (
          <div style={estilos.formAdmin}>
            <div style={estilos.campo}>
              <label style={estilos.label}>Canal</label>
              <select
                value={form.canal}
                onChange={e => setForm(f => ({ ...f, canal: e.target.value }))}
                style={estilos.input}
              >
                <option value="mandacaru">🌵 Mandacaru Esportes</option>
                <option value="papagaio">🦜 TV Papagaio Icó</option>
              </select>
            </div>
            {campo("titulo",      "Título da Live",   "text",   "Ex: Jogo do Campeonato Regional")}
            {campo("data",        "Data",             "date")}
            {campo("hora_inicio", "Hora de Início",   "time")}
            {campo("hora_fim",    "Hora de Fim",      "time")}
            {campo("local",       "Local",            "text",   "Ex: Estádio Municipal Icó")}
            <div style={estilos.campo}>
              <label style={estilos.label}>Descrição</label>
              <textarea
                value={form.descricao}
                placeholder="Descrição opcional..."
                onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                style={{ ...estilos.input, height: 80, resize: "vertical" }}
              />
            </div>
            {campo("criado_por", "Criado por", "text", "Seu nome")}

            {erros.geral  && <div style={{ ...estilos.textoErro, marginBottom: 8 }}>{erros.geral}</div>}
            {sucesso      && <div style={estilos.textoSucesso}>{sucesso}</div>}

            <button
              style={{ ...estilos.btnPrimario, opacity: enviando ? 0.7 : 1 }}
              onClick={salvarEvento}
              disabled={enviando}
            >
              {enviando ? "Salvando..." : "💾 Salvar Live"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Estilos (CSS-in-JS) ─────────────────────────────────────
const estilos = {
  container:     { fontFamily: "'Segoe UI', sans-serif", maxWidth: 900, margin: "0 auto", padding: 16, color: "#1a1a1a" },
  header:        { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  logoArea:      { display: "flex", alignItems: "center", gap: 12 },
  logoEmoji:     { fontSize: 32 },
  titulo:        { fontSize: 22, fontWeight: 700, margin: 0 },
  subtitulo:     { fontSize: 13, color: "#666", margin: 0 },
  btnAdmin:      { background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 14 },
  legenda:       { display: "flex", gap: 24, marginBottom: 16 },
  legendaItem:   { display: "flex", gap: 6, alignItems: "center", fontSize: 14 },
  navMes:        { display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginBottom: 16 },
  btnNav:        { background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 18 },
  mesAno:        { fontSize: 20, fontWeight: 700, margin: 0, minWidth: 180, textAlign: "center" },
  loading:       { textAlign: "center", padding: 40, fontSize: 18, color: "#888" },
  grade:         { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 },
  cabecalhoDia:  { textAlign: "center", fontWeight: 600, fontSize: 12, color: "#888", padding: "4px 0" },
  celulaDia:     { minHeight: 80, border: "1px solid #e5e7eb", borderRadius: 8, padding: 6, background: "#fafafa", transition: "all 0.15s" },
  hoje:          { border: "2px solid #2563eb", background: "#eff6ff" },
  temLive:       { background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" },
  numeroDia:     { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 2 },
  badgeLive:     { fontSize: 11, padding: "1px 4px", borderRadius: 4, marginBottom: 2, display: "flex", alignItems: "center", gap: 3 },
  badgeHora:     { fontWeight: 600, fontSize: 10 },
  maisLives:     { fontSize: 10, color: "#888", marginTop: 2 },
  overlay:       { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal:         { background: "#fff", borderRadius: 16, padding: 24, width: "90%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" },
  modalHeader:   { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitulo:   { fontSize: 18, fontWeight: 700, margin: 0 },
  btnFechar:     { background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888" },
  listaLives:    { display: "flex", flexDirection: "column", gap: 12 },
  cardLive:      { padding: 14, borderRadius: 12, background: "#f9fafb", cursor: "pointer", transition: "all 0.15s" },
  cardLiveTop:   { display: "flex", alignItems: "center", gap: 12 },
  cardEmoji:     { fontSize: 28 },
  cardNomeCanal: { fontSize: 12, color: "#888", fontWeight: 600 },
  cardTituloLive:{ fontSize: 15, fontWeight: 700 },
  cardHora:      { marginLeft: "auto", fontWeight: 700, fontSize: 16, color: "#444" },
  verMais:       { fontSize: 12, color: "#2563eb", marginTop: 6, textAlign: "right" },
  detalhe:       { padding: 4 },
  btnVoltar:     { background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: 14, marginBottom: 12, padding: 0 },
  detalheCanal:  { fontWeight: 700, fontSize: 14, marginBottom: 8 },
  detalheTitulo: { fontSize: 20, fontWeight: 800, marginBottom: 16, lineHeight: 1.3 },
  detalheGrade:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  detalheItem:   { background: "#f9fafb", borderRadius: 10, padding: 12 },
  detalheLabel:  { display: "block", fontSize: 11, color: "#888", marginBottom: 4, fontWeight: 600 },
  detalheValor:  { fontSize: 14, fontWeight: 600 },
  formSenha:     { display: "flex", flexDirection: "column", gap: 12 },
  formAdmin:     { display: "flex", flexDirection: "column", gap: 12 },
  campo:         { display: "flex", flexDirection: "column", gap: 4 },
  label:         { fontSize: 13, fontWeight: 600, color: "#444" },
  input:         { border: "1px solid #d1d5db", borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none", fontFamily: "inherit" },
  inputErro:     { borderColor: "#dc2626" },
  textoErro:     { fontSize: 12, color: "#dc2626" },
  textoSucesso:  { fontSize: 14, color: "#16a34a", fontWeight: 600, padding: "8px 12px", background: "#f0fdf4", borderRadius: 8 },
  btnPrimario:   { background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4 },
};
