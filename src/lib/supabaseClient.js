import { createClient } from '@supabase/supabase-js'

// Busca do arquivo .env ou usa o valor padrão do Figma
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://flmwcwckgjphseuppcvn.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lQPyTacpz_YHkNEn6dKn2w_NSoFlYcL'

// Alerta de aviso no console caso as variáveis de ambiente não estejam configuradas
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Aviso: Variáveis .env não encontradas. Usando as credenciais padrão do Supabase.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})