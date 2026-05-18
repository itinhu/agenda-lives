// src/lib/supabase.ts
// Cliente Supabase com service_role — usado SOMENTE nas API Routes (servidor)
// Nunca importe este arquivo em componentes do lado do cliente

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Helpers de validação
export function validarData(str: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(Date.parse(str));
}

export function validarHora(str: string) {
  return /^\d{2}:\d{2}$/.test(str);
}

export function verificarSenha(senha: string) {
  return senha === process.env.ADMIN_PASSWORD;
}

export const CANAIS_VALIDOS = ["mandacaru", "papagaio"] as const;
export type Canal = (typeof CANAIS_VALIDOS)[number];
