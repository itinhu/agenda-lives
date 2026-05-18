// src/app/api/listar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase, validarData, CANAIS_VALIDOS } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const canal       = searchParams.get("canal") ?? undefined;
  const data_inicio = searchParams.get("data_inicio") ?? undefined;
  const data_fim    = searchParams.get("data_fim") ?? undefined;

  let query = supabase.from("livestreams").select("*");

  if (canal && CANAIS_VALIDOS.includes(canal as any)) {
    query = query.eq("channel", canal) as any;
  }
  if (data_inicio && validarData(data_inicio)) {
    query = query.gte("date", data_inicio) as any;
  }
  if (data_fim && validarData(data_fim)) {
    query = query.lte("date", data_fim) as any;
  }

  const { data: eventos, error } = await (query as any)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    return NextResponse.json({ status: "erro", codigo: 500, mensagem: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: "ok", codigo: 200, eventos });
}
