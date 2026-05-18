// src/app/api/evento/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase, verificarSenha } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { data: evento, error } = await supabase
    .from("livestreams")
    .select("*")
    .eq("id", params.id)
    .single();

  // BUG CORRIGIDO: distingue 404 real (PGRST116 = row not found) de erros de banco (500)
  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ status: "erro", codigo: 404, mensagem: "Evento não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ status: "erro", codigo: 500, mensagem: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: "ok", codigo: 200, evento });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // BUG CORRIGIDO: removido import dinâmico desnecessário — verificarSenha já importado no topo
  const { senha } = await req.json();

  if (!verificarSenha(senha)) {
    return NextResponse.json({ status: "erro", codigo: 401, mensagem: "Senha inválida." }, { status: 401 });
  }

  const { error } = await supabase.from("livestreams").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ status: "erro", codigo: 500, mensagem: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: "ok", codigo: 200, mensagem: "Evento removido." });
}

