import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('sua-url-do-supabase') && 
  !supabaseAnonKey.includes('sua-chave-anon-key-aqui')

if (!isConfigured) {
  console.warn(
    '⚠️ Supabase: Credenciais ausentes ou não configuradas no arquivo .env. O site funcionará no modo de demonstração local.'
  )
}

// Inicializa o cliente com credenciais reais ou placeholders defensivos para evitar quebras
export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://placeholder-project-url.supabase.co',
  isConfigured ? supabaseAnonKey : 'placeholder-anon-key'
)

// Exporta auxiliar para saber se estamos rodando com banco de dados real ativo
export const isSupabaseConfigured = isConfigured
