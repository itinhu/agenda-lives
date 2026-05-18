// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verificarSenha } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { senha } = await req.json();
  if (!senha) {
    return NextResponse.json({ ok: false, mensagem: "Senha não informada." }, { status: 400 });
  }
  return NextResponse.json({ ok: verificarSenha(senha) });
}
