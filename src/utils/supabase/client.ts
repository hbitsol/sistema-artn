import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = () => {
  // Validação das variáveis de ambiente
  if (!supabaseUrl || !supabaseKey) {
    console.warn('❌ Variáveis do Supabase não configuradas no cliente. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY');
    // Retornar um cliente mock para evitar erro durante o build
    return {
      from: () => ({
        select: () => ({ data: null, error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null })
      })
    } as any;
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
};