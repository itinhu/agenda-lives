// src/app/api/criar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase, verificarSenha, validarData, validarHora, CANAIS_VALIDOS } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { senha, canal, titulo, data, hora_inicio, hora_fim, local, descricao, criado_por } = body;

  // 1. Autenticação
  if (!verificarSenha(senha)) {
    return NextResponse.json({ status: "erro", codigo: 401, mensagem: "Senha inválida." }, { status: 401 });
  }

  // 2. Validação
  const erros: Record<string, string> = {};
  if (!canal || !CANAIS_VALIDOS.includes(canal))
    erros.canal = 'Canal deve ser "mandacaru" ou "papagaio".';
  if (!titulo?.trim())
    erros.titulo = "Título é obrigatório.";
  if (!data || !validarData(data))
    erros.data = "Data inválida. Use AAAA-MM-DD.";
  if (!hora_inicio || !validarHora(hora_inicio))
    erros.hora_inicio = "Hora de início inválida. Use HH:MM.";
  if (hora_fim && !validarHora(hora_fim))
    erros.hora_fim = "Hora de fim inválida. Use HH:MM.";
  if (!local?.trim())
    erros.local = "Local é obrigatório.";

  if (Object.keys(erros).length > 0) {
    return NextResponse.json({ status: "erro", codigo: 400, erros }, { status: 400 });
  }

  // 3. Inserção
  const { data: evento, error } = await supabase
    .from("livestreams")
    .insert([{
      channel:     canal,
      title:       titulo.trim(),
      date:        data,
      start_time:  hora_inicio,
      end_time:    hora_fim || null,
      location:    local.trim(),
      description: descricao?.trim() || null,
      created_by:  criado_por?.trim() || null,
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ status: "erro", codigo: 500, mensagem: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: "ok", codigo: 201, evento }, { status: 201 });
}
