"use client";
// src/app/components/CalendarioClient.tsx

import { useState, useEffect, useCallback } from "react";
import ModalDia from "./ModalDia";
import TelaAdmin from "./TelaAdmin";

// ── Constantes ─────────────────────────────────────────────────────────────
export const CANAIS = {
  mandacaru: { emoji: "🌵", nome: "Mandacaru Esportes", cor: "#15803d", fundo: "#dcfce7" },
  papagaio:  { emoji: "🦜", nome: "TV Papagaio Icó",    cor: "#b91c1c", fundo: "#fee2e2" },
} as const;

export const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

// BUG 3 CORRIGIDO: `hoje` fora do componente — valor estável, não recriado a cada render
const HOJE = new Date();
const HOJE_ANO = HOJE.getFullYear();
const HOJE_MES = HOJE.getMonth() + 1;
const HOJE_DIA = HOJE.getDate();

export type LiveResumida = {
  id: string;
  canal: "mandacaru" | "papagaio";
  emoji: string;
  titulo: string;
  hora_inicio: string;
};

export type DiaComLives = {
  data: string;
  lives: LiveResumida[];
};

// ── Componente Principal ────────────────────────────────────────────────────
export default function CalendarioClient() {
  const [ano, setAno]   = useState(HOJE_ANO);
  const [mes, setMes]   = useState(HOJE_MES);
  const [diasMap, setDiasMap]   = useState<Record<string, LiveResumida[]>>({});
  const [carregando, setCarregando] = useState(false);
  const [diaSel, setDiaSel]     = useState<DiaComLives | null>(null);
  const [adminAberto, setAdminAberto] = useState(false);

  const carregarMes = useCallback(async () => {
    setCarregando(true);
    try {
      const res  = await fetch(`/api/calendario/${ano}/${mes}`);
      const json = await res.json();
      if (json.status === "ok") {
        const mapa: Record<string, LiveResumida[]> = {};
        for (const d of json.dias) mapa[d.data] = d.eventos;
        setDiasMap(mapa);
      }
    } finally {
      setCarregando(false);
    }
  }, [ano, mes]);

  useEffect(() => { carregarMes(); }, [carregarMes]);

  // BUG 4 CORRIGIDO: calcula novo ano+mês diretamente, sem setAno dentro de callback de setMes
  function navMes(delta: number) {
    setDiaSel(null);
    setAno(a => {
      const novoMesRaw = mes + delta;
      if (novoMesRaw < 1)  { setMes(12); return a - 1; }
      if (novoMesRaw > 12) { setMes(1);  return a + 1; }
      setMes(novoMesRaw);
      return a;
    });
  }

  // Grade do calendário
  const primeiroDia = new Date(ano, mes - 1, 1).getDay();
  const totalDias   = new Date(ano, mes, 0).getDate();
  const celulas     = Array.from({ length: primeiroDia }, () => null)
    .concat(Array.from({ length: totalDias }, (_, i) => i + 1));

  function dataStr(dia: number) {
    return `${ano}-${String(mes).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
  }
  // BUG 3 CORRIGIDO: usa constantes estáveis
  const ehHoje = (dia: number) =>
    HOJE_ANO === ano && HOJE_MES === mes && HOJE_DIA === dia;

  return (
    <>
      <div style={s.page}>
        {/* ── Header ───────────────────────────────────────────── */}
        <header style={s.header} className="anim-fade-up">
          <div style={s.headerInner}>
            <div style={s.logoBloco}>
              <div style={s.logoBadges}>
                <span style={{ ...s.badge, background: "#dcfce7", color: "#15803d" }}>🌵 Mandacaru</span>
                <span style={{ ...s.badge, background: "#fee2e2", color: "#b91c1c" }}>🦜 TV Papagaio</span>
              </div>
              <h1 style={s.titulo}>Agenda de Lives</h1>
              <p style={s.subtitulo}>Icó · Ceará · Brasil</p>
            </div>
            <button style={s.btnAdmin} onClick={() => setAdminAberto(true)}>
              <span>⚙</span> Admin
            </button>
          </div>
        </header>

        {/* ── Navegação de mês ─────────────────────────────────── */}
        <div style={s.navWrap} className="anim-fade-up">
          <button style={s.btnNav} onClick={() => navMes(-1)} aria-label="Mês anterior">‹</button>
          <div style={s.mesDisplay}>
            <span style={s.mesNome}>{MESES[mes - 1]}</span>
            <span style={s.mesAno}>{ano}</span>
          </div>
          <button style={s.btnNav} onClick={() => navMes(1)} aria-label="Próximo mês">›</button>
        </div>

        {/* ── Grade ────────────────────────────────────────────── */}
        <div style={s.gradeWrap}>
          {/* Cabeçalho dos dias da semana */}
          <div style={s.grade}>
            {SEMANA.map(d => (
              <div key={d} style={s.thDia}>{d}</div>
            ))}
          </div>

          {/* BUG 5 CORRIGIDO: loading fora da grade (sem gridColumn inválido) */}
          {carregando ? (
            <div style={s.loading}>
              <div style={s.spinner} />
              <span>Carregando...</span>
            </div>
          ) : (
            <div style={s.grade} className="anim-fade-in">
              {celulas.map((dia, i) => {
                if (!dia) return <div key={`v${i}`} style={s.celulaVazia} />;
                const key   = dataStr(dia);
                const lives = diasMap[key] ?? [];
                const temLive = lives.length > 0;
                const isHoje  = ehHoje(dia);

                return (
                  <div
                    key={key}
                    style={{
                      ...s.celula,
                      ...(isHoje  ? s.celulaHoje  : {}),
                      ...(temLive ? s.celulaComLive : {}),
                    }}
                    onClick={() => temLive && setDiaSel({ data: key, lives })}
                    role={temLive ? "button" : undefined}
                    tabIndex={temLive ? 0 : undefined}
                    onKeyDown={e => e.key === "Enter" && temLive && setDiaSel({ data: key, lives })}
                  >
                    <span style={{ ...s.numDia, ...(isHoje ? s.numDiaHoje : {}) }}>{dia}</span>

                    {lives.slice(0, 2).map((ev, idx) => {
                      const c = CANAIS[ev.canal];
                      return (
                        <div key={idx} style={{ ...s.pill, background: c.fundo, color: c.cor }}>
                          <span>{ev.emoji}</span>
                          <span style={s.pillHora}>{ev.hora_inicio?.slice(0, 5)}</span>
                        </div>
                      );
                    })}

                    {lives.length > 2 && (
                      <div style={s.mais}>+{lives.length - 2}</div>
                    )}

                    {temLive && <div style={s.dot} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Legenda ──────────────────────────────────────────── */}
        <div style={s.legenda}>
          {Object.entries(CANAIS).map(([k, c]) => (
            <div key={k} style={s.legendaItem}>
              <div style={{ ...s.legendaDot, background: c.cor }} />
              <span>{c.emoji} {c.nome}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modais ───────────────────────────────────────────────── */}
      {diaSel && (
        <ModalDia
          data={diaSel.data}
          lives={diaSel.lives}
          onFechar={() => setDiaSel(null)}
        />
      )}

      {adminAberto && (
        <TelaAdmin
          onFechar={() => { setAdminAberto(false); carregarMes(); }}
        />
      )}
    </>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page:         { minHeight: "100vh", padding: "0 0 60px" },
  header:       { background: "#111827", color: "#fff", padding: "28px 24px 24px", marginBottom: 0 },
  headerInner:  { maxWidth: 760, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" },
  logoBloco:    { display: "flex", flexDirection: "column", gap: 6 },
  logoBadges:   { display: "flex", gap: 8, marginBottom: 4 },
  badge:        { fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 99, fontFamily: "var(--font-display)" },
  titulo:       { fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1 },
  subtitulo:    { fontSize: 13, color: "#9ca3af", marginTop: 2 },
  btnAdmin:     { display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.1)", color: "#fff", border: "1px solid rgba(255,255,255,.15)", borderRadius: 10, padding: "9px 18px", fontSize: 14, fontWeight: 600, transition: "background .15s" },

  navWrap:      { maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 24px 8px" },
  btnNav:       { width: 42, height: 42, borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 22, color: "#374151", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s", boxShadow: "0 1px 4px rgba(0,0,0,.06)" },
  mesDisplay:   { display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  mesNome:      { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, letterSpacing: "-0.5px" },
  mesAno:       { fontSize: 13, color: "#6b7280", fontWeight: 500 },

  gradeWrap:    { maxWidth: 760, margin: "0 auto", padding: "0 16px" },
  grade:        { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 },
  thDia:        { textAlign: "center", fontSize: 11, fontWeight: 700, color: "#9ca3af", padding: "8px 0", letterSpacing: "0.05em", textTransform: "uppercase" },

  // BUG 5 CORRIGIDO: loading agora é bloco independente (sem gridColumn)
  loading:      { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "60px 0", color: "#9ca3af" },
  spinner:      { width: 32, height: 32, border: "3px solid #e5e7eb", borderTopColor: "#111827", borderRadius: "50%", animation: "spin 0.7s linear infinite" },

  celulaVazia:  { minHeight: 90, background: "transparent" },
  celula:       { minHeight: 90, borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#fff", padding: "8px 7px 6px", position: "relative", transition: "all .18s", overflow: "hidden" },
  celulaHoje:   { border: "2px solid #111827", background: "#f9fafb" },
  celulaComLive:{ boxShadow: "0 2px 12px rgba(0,0,0,.08)", cursor: "pointer" },

  numDia:       { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4, fontFamily: "var(--font-display)" },
  numDiaHoje:   { color: "#111827", fontWeight: 800 },

  pill:         { display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, padding: "2px 5px", borderRadius: 6, marginBottom: 3 },
  pillHora:     { fontSize: 10, fontWeight: 700 },

  mais:         { fontSize: 10, color: "#9ca3af", fontWeight: 600, marginTop: 2 },
  dot:          { position: "absolute", bottom: 6, right: 8, width: 6, height: 6, borderRadius: "50%", background: "#111827" },

  legenda:      { maxWidth: 760, margin: "24px auto 0", padding: "0 24px", display: "flex", gap: 24, flexWrap: "wrap" as const },
  legendaItem:  { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#4b5563", fontWeight: 500 },
  legendaDot:   { width: 8, height: 8, borderRadius: "50%" },
};
