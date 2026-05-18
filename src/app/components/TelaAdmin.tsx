"use client";
// src/app/components/TelaAdmin.tsx

import { useState } from "react";
import { CANAIS } from "./CalendarioClient";

type Props = { onFechar: () => void };

type Erros = Record<string, string>;

// BUG 9 CORRIGIDO: removido "lista" que nunca era usado
type Fase = "senha" | "form";

const CAMPO_VAZIO = {
  canal: "mandacaru" as "mandacaru" | "papagaio",
  titulo: "", data: "", hora_inicio: "",
  hora_fim: "", local: "", descricao: "", criado_por: "",
};

export default function TelaAdmin({ onFechar }: Props) {
  const [fase, setFase]         = useState<Fase>("senha");
  const [senha, setSenha]       = useState("");
  const [errSenha, setErrSenha] = useState("");
  const [form, setForm]         = useState(CAMPO_VAZIO);
  const [erros, setErros]       = useState<Erros>({});
  const [sucesso, setSucesso]   = useState("");
  const [enviando, setEnviando] = useState(false);

  // Verificar senha
  async function verificar() {
    setErrSenha("");
    try {
      const res  = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });
      const json = await res.json();
      if (json.ok) setFase("form");
      else setErrSenha("Senha incorreta.");
    } catch {
      setErrSenha("Erro de conexão. Tente novamente.");
    }
  }

  // BUG 10 CORRIGIDO: try/catch garante que enviando volta a false em qualquer falha de rede
  async function salvar() {
    setEnviando(true); setSucesso(""); setErros({});
    try {
      const res  = await fetch("/api/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha, ...form }),
      });
      const json = await res.json();
      if (json.status === "ok") {
        setSucesso("Live cadastrada com sucesso! ✅");
        setForm(CAMPO_VAZIO);
      } else if (json.erros) {
        setErros(json.erros);
      } else {
        setErros({ geral: json.mensagem ?? "Erro desconhecido." });
      }
    } catch {
      setErros({ geral: "Erro de conexão. Verifique sua internet e tente novamente." });
    } finally {
      setEnviando(false);
    }
  }

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={s.overlay} onClick={onFechar} className="anim-fade-in">
      <div style={s.panel} onClick={e => e.stopPropagation()} className="anim-scale-in">

        {/* Header */}
        <div style={s.panelHead}>
          <div>
            <div style={s.headLabel}>Painel</div>
            <h2 style={s.headTitulo}>Administração</h2>
          </div>
          <button style={s.btnX} onClick={onFechar}>✕</button>
        </div>

        {/* ── Fase: Senha ─────────────────────────────────────── */}
        {fase === "senha" && (
          <div style={s.body}>
            <p style={s.instrucao}>Digite a senha para acessar o painel:</p>
            <Campo label="🔒 Senha" erro={errSenha}>
              <input
                type="password"
                value={senha}
                placeholder="••••••••"
                onChange={e => setSenha(e.target.value)}
                onKeyDown={e => e.key === "Enter" && verificar()}
                style={s.input}
                autoFocus
              />
            </Campo>
            <Btn onClick={verificar}>Entrar →</Btn>
          </div>
        )}

        {/* ── Fase: Formulário ────────────────────────────────── */}
        {fase === "form" && (
          <div style={s.body}>
            <div style={s.tabs}>
              <TabBtn ativo onClick={() => {}}>+ Nova Live</TabBtn>
            </div>

            {/* BUG 11 CORRIGIDO: canal usa onChange tipado diretamente como "mandacaru"|"papagaio" */}
            <Campo label="Canal" erro={erros.canal}>
              <div style={s.canalGrid}>
                {(Object.entries(CANAIS) as [("mandacaru"|"papagaio"), typeof CANAIS[keyof typeof CANAIS]][]).map(([k, c]) => (
                  <label key={k} style={{ ...s.canalOpcao, ...(form.canal === k ? { ...s.canalSel, borderColor: c.cor, background: c.fundo } : {}) }}>
                    <input
                      type="radio"
                      name="canal"
                      value={k}
                      checked={form.canal === k}
                      onChange={() => setForm(f => ({ ...f, canal: k }))}
                      style={{ display: "none" }}
                    />
                    <span style={{ fontSize: 22 }}>{c.emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: form.canal === k ? c.cor : "#374151" }}>{c.nome}</span>
                  </label>
                ))}
              </div>
            </Campo>

            <Campo label="Título da Live" erro={erros.titulo}>
              <input type="text" value={form.titulo} placeholder="Ex: Jogo do Campeonato Regional" onChange={upd("titulo")} style={{ ...s.input, ...(erros.titulo ? s.inputErr : {}) }} />
            </Campo>

            <div style={s.grid2}>
              <Campo label="Data" erro={erros.data}>
                <input type="date" value={form.data} onChange={upd("data")} style={{ ...s.input, ...(erros.data ? s.inputErr : {}) }} />
              </Campo>
              <Campo label="Hora início" erro={erros.hora_inicio}>
                <input type="time" value={form.hora_inicio} onChange={upd("hora_inicio")} style={{ ...s.input, ...(erros.hora_inicio ? s.inputErr : {}) }} />
              </Campo>
              <Campo label="Hora fim (opcional)" erro={erros.hora_fim}>
                <input type="time" value={form.hora_fim} onChange={upd("hora_fim")} style={{ ...s.input, ...(erros.hora_fim ? s.inputErr : {}) }} />
              </Campo>
              <Campo label="Criado por" erro={erros.criado_por}>
                <input type="text" value={form.criado_por} placeholder="Seu nome" onChange={upd("criado_por")} style={s.input} />
              </Campo>
            </div>

            <Campo label="Local" erro={erros.local}>
              <input type="text" value={form.local} placeholder="Ex: Estádio Municipal Icó" onChange={upd("local")} style={{ ...s.input, ...(erros.local ? s.inputErr : {}) }} />
            </Campo>

            <Campo label="Descrição (opcional)">
              <textarea value={form.descricao} placeholder="Informações adicionais..." onChange={upd("descricao")} style={{ ...s.input, minHeight: 80, resize: "vertical" as const }} />
            </Campo>

            {erros.geral  && <div style={s.msgErro}>{erros.geral}</div>}
            {sucesso      && <div style={s.msgOk}>{sucesso}</div>}

            <Btn onClick={salvar} disabled={enviando}>
              {enviando ? "Salvando..." : "💾 Salvar Live"}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-componentes ─────────────────────────────────────────────────────────
function Campo({ label, erro, children }: { label: string; erro?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" as const, letterSpacing: ".04em" }}>{label}</label>
      {children}
      {erro && <span style={{ fontSize: 12, color: "#dc2626" }}>{erro}</span>}
    </div>
  );
}

function Btn({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ width: "100%", background: "#111827", color: "#fff", border: "none", borderRadius: 12, padding: "13px 0", fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .65 : 1, marginTop: 4, letterSpacing: ".02em" }}
    >
      {children}
    </button>
  );
}

function TabBtn({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{ fontSize: 13, fontWeight: 700, padding: "6px 16px", borderRadius: 8, background: ativo ? "#111827" : "transparent", color: ativo ? "#fff" : "#6b7280", border: "none" }}
    >
      {children}
    </button>
  );
}

// ── Estilos ─────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  overlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 },
  panel:      { background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.28)" },
  panelHead:  { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 20px 16px", borderBottom: "1px solid #f3f4f6" },
  headLabel:  { fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: ".06em", textTransform: "uppercase" as const },
  headTitulo: { fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800 },
  btnX:       { fontSize: 18, color: "#9ca3af", padding: 4, lineHeight: 1 },
  body:       { padding: "20px 20px 24px" },
  instrucao:  { fontSize: 14, color: "#6b7280", marginBottom: 16 },
  tabs:       { display: "flex", gap: 4, background: "#f9fafb", borderRadius: 10, padding: 4, marginBottom: 16 },
  input:      { border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none", width: "100%", color: "#111827" },
  inputErr:   { borderColor: "#dc2626" },
  grid2:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" },
  canalGrid:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  canalOpcao: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, padding: "12px 8px", borderRadius: 12, border: "2px solid #e5e7eb", cursor: "pointer", transition: "all .15s" },
  canalSel:   { border: "2px solid" },
  msgErro:    { background: "#fef2f2", color: "#dc2626", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 8 },
  msgOk:      { background: "#f0fdf4", color: "#15803d", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600, marginBottom: 8 },
};
