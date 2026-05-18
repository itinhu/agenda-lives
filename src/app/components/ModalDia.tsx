"use client";
// src/app/components/ModalDia.tsx

import { useState } from "react";
import { CANAIS, LiveResumida } from "./CalendarioClient";

type Props = {
  data: string;
  lives: LiveResumida[];
  onFechar: () => void;
};

type EventoCompleto = {
  id: string; channel: string; title: string; date: string;
  start_time?: string; end_time?: string; location: string;
  description?: string; created_by?: string; created_at: string;
};

export default function ModalDia({ data, lives, onFechar }: Props) {
  const [detalhe, setDetalhe] = useState<EventoCompleto | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erroDetalhe, setErroDetalhe] = useState("");

  // BUG 6 CORRIGIDO: try/catch garante que carregando sempre volta a false
  async function abrirDetalhe(id: string) {
    setCarregando(true);
    setErroDetalhe("");
    try {
      const res  = await fetch(`/api/evento/${id}`);
      const json = await res.json();
      if (json.status === "ok") setDetalhe(json.evento);
      else setErroDetalhe("Não foi possível carregar o evento.");
    } catch {
      setErroDetalhe("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  const [a, m, d] = data.split("-");
  const dataFmt = `${d}/${m}/${a}`;

  return (
    <div style={s.overlay} onClick={onFechar} className="anim-fade-in">
      <div style={s.modal} onClick={e => e.stopPropagation()} className="anim-scale-in">
        {/* Header */}
        <div style={s.modalHead}>
          <div>
            <div style={s.headLabel}>📅 Lives do dia</div>
            <h2 style={s.headData}>{dataFmt}</h2>
          </div>
          <button style={s.btnX} onClick={onFechar}>✕</button>
        </div>

        {carregando && <div style={s.loadingMsg}>Carregando...</div>}
        {erroDetalhe && <div style={s.erroMsg}>{erroDetalhe}</div>}

        {!detalhe && !carregando && (
          <div style={s.lista}>
            {lives.map(ev => {
              const c = CANAIS[ev.canal];
              return (
                <div
                  key={ev.id}
                  style={{ ...s.card, borderLeft: `4px solid ${c.cor}` }}
                  onClick={() => abrirDetalhe(ev.id)}
                  // BUG 8 CORRIGIDO: onKeyDown adicionado para acessibilidade
                  onKeyDown={e => e.key === "Enter" && abrirDetalhe(ev.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div style={s.cardTop}>
                    <div style={{ ...s.emojiCircle, background: c.fundo }}>{ev.emoji}</div>
                    <div style={s.cardInfo}>
                      <div style={{ ...s.cardCanal, color: c.cor }}>{c.nome}</div>
                      <div style={s.cardTitulo}>{ev.titulo}</div>
                    </div>
                    {/* BUG 7 CORRIGIDO: optional chaining defensivo */}
                    <div style={s.cardHora}>{ev.hora_inicio?.slice(0, 5) ?? "--:--"}</div>
                  </div>
                  <div style={s.verDetalhes}>Ver detalhes →</div>
                </div>
              );
            })}
          </div>
        )}

        {detalhe && !carregando && (
          <DetalheEvento evento={detalhe} onVoltar={() => { setDetalhe(null); setErroDetalhe(""); }} />
        )}
      </div>
    </div>
  );
}

function DetalheEvento({ evento, onVoltar }: { evento: EventoCompleto; onVoltar: () => void }) {
  const canal = CANAIS[evento.channel as keyof typeof CANAIS] ?? { emoji: "📺", nome: evento.channel, cor: "#555", fundo: "#f3f4f6" };
  const [a, m, d] = evento.date.split("-");

  return (
    <div style={s.detalhe}>
      <button style={s.btnVoltar} onClick={onVoltar}>← Voltar</button>
      <div style={{ ...s.detalheCanal, color: canal.cor, background: canal.fundo }}>
        {canal.emoji} {canal.nome}
      </div>
      <h3 style={s.detalheTitulo}>{evento.title}</h3>
      <div style={s.detalheGrade}>
        <InfoItem label="📅 Data"    valor={`${d}/${m}/${a}`} />
        {/* BUG 7 CORRIGIDO: fallback "--:--" para campos de hora potencialmente nulos */}
        <InfoItem label="🕐 Início"  valor={evento.start_time?.slice(0, 5) ?? "--:--"} />
        {evento.end_time   && <InfoItem label="🕑 Fim"       valor={evento.end_time.slice(0, 5)} />}
        <InfoItem label="📍 Local"   valor={evento.location} fullWidth={!evento.end_time} />
        {evento.description && <InfoItem label="📝 Descrição" valor={evento.description} fullWidth />}
        {evento.created_by  && <InfoItem label="👤 Por"       valor={evento.created_by} />}
      </div>
    </div>
  );
}

// BUG 7 CORRIGIDO: valor aceita string | undefined para não crashar com dados nulos
function InfoItem({ label, valor, fullWidth }: { label: string; valor: string | undefined; fullWidth?: boolean }) {
  return (
    <div style={{ ...s.infoItem, ...(fullWidth ? { gridColumn: "1/-1" } : {}) }}>
      <div style={s.infoLabel}>{label}</div>
      <div style={s.infoValor}>{valor ?? "—"}</div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay:      { position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 },
  modal:        { background: "#fff", borderRadius: 20, width: "100%", maxWidth: 460, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.25)" },
  modalHead:    { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 20px 14px", borderBottom: "1px solid #f3f4f6" },
  headLabel:    { fontSize: 12, fontWeight: 700, color: "#9ca3af", letterSpacing: ".05em", textTransform: "uppercase" as const, marginBottom: 2 },
  headData:     { fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800 },
  btnX:         { fontSize: 18, color: "#9ca3af", padding: 4, lineHeight: 1 },
  loadingMsg:   { padding: 32, textAlign: "center" as const, color: "#9ca3af" },
  erroMsg:      { margin: "12px 16px 0", padding: "10px 14px", background: "#fef2f2", color: "#dc2626", borderRadius: 10, fontSize: 13 },
  lista:        { padding: "12px 16px 20px", display: "flex", flexDirection: "column" as const, gap: 10 },
  card:         { borderRadius: 12, border: "1.5px solid #f3f4f6", padding: "14px 14px 10px", cursor: "pointer", transition: "box-shadow .15s" },
  cardTop:      { display: "flex", alignItems: "center", gap: 12 },
  emojiCircle:  { width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 },
  cardInfo:     { flex: 1, minWidth: 0 },
  cardCanal:    { fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: ".05em" },
  cardTitulo:   { fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, marginTop: 1, lineHeight: 1.25, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" },
  cardHora:     { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "#374151", flexShrink: 0 },
  verDetalhes:  { fontSize: 12, color: "#6b7280", marginTop: 8, textAlign: "right" as const },
  detalhe:      { padding: "16px 20px 24px" },
  btnVoltar:    { color: "#3b82f6", fontSize: 13, fontWeight: 600, marginBottom: 14, padding: 0 },
  detalheCanal: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, padding: "5px 12px", borderRadius: 99, marginBottom: 12 },
  detalheTitulo:{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, lineHeight: 1.25, marginBottom: 16 },
  detalheGrade: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  infoItem:     { background: "#f9fafb", borderRadius: 10, padding: "10px 12px" },
  infoLabel:    { fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: ".04em", marginBottom: 3 },
  infoValor:    { fontSize: 14, fontWeight: 600, color: "#111827" },
};
