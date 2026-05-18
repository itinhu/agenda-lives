// src/app/api/calendario/[ano]/[mes]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const EMOJI: Record<string, string> = { mandacaru: "🌵", papagaio: "🦜" };

export async function GET(
  _req: NextRequest,
  { params }: { params: { ano: string; mes: string } }
) {
  const ano = parseInt(params.ano, 10);
  const mes = parseInt(params.mes, 10);

  if (isNaN(ano) || isNaN(mes) || mes < 1 || mes > 12) {
    return NextResponse.json({ status: "erro", codigo: 400, mensagem: "Ano ou mês inválido." }, { status: 400 });
  }

  const mesStr     = String(mes).padStart(2, "0");
  const dataInicio = `${ano}-${mesStr}-01`;
  const ultimoDia  = new Date(ano, mes, 0).getDate();
  const dataFim    = `${ano}-${mesStr}-${ultimoDia}`;

  const { data: eventos, error } = await supabase
    .from("livestreams")
    .select("id, channel, title, date, start_time")
    .gte("date", dataInicio)
    .lte("date", dataFim)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    return NextResponse.json({ status: "erro", codigo: 500, mensagem: error.message }, { status: 500 });
  }

  // Agrupa por data
  const diasMap: Record<string, any[]> = {};
  for (const ev of eventos ?? []) {
    if (!diasMap[ev.date]) diasMap[ev.date] = [];
    diasMap[ev.date].push({
      id:          ev.id,
      canal:       ev.channel,
      emoji:       EMOJI[ev.channel] ?? "📺",
      titulo:      ev.title,
      hora_inicio: ev.start_time,
    });
  }

  const dias = Object.entries(diasMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, eventos]) => ({ data, eventos }));

  return NextResponse.json({
    status: "ok",
    codigo: 200,
    mes:    `${ano}-${mesStr}`,
    dias,
  });
}
