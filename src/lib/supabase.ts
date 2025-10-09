import { createClient } from '@supabase/supabase-js'

// Função para criar cliente Supabase com verificação de ambiente
function createSupabaseClient() {
  // Durante o build (server-side rendering), não inicializar o cliente
  if (typeof window === 'undefined') {
    console.log('🔧 Build mode: Supabase client não inicializado no servidor')
    return null
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validação apenas no lado do cliente (browser)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('❌ Variáveis do Supabase não configuradas. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return null
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('❌ Erro ao criar cliente Supabase:', error)
    return null
  }
}

// Exportar cliente que só é criado no browser - LAZY LOADING
let supabaseClient: any = null

export const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    return null
  }
  
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient()
  }
  
  return supabaseClient
}

// Para compatibilidade com código existente
export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      materiais: {
        Row: {
          id: string
          codigo: string
          nome: string
          descricao: string | null
          preco_unitario: number
          categoria: string | null
          created_at: string
        }
        Insert: {
          id?: string
          codigo: string
          nome: string
          descricao?: string | null
          preco_unitario: number
          categoria?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          codigo?: string
          nome?: string
          descricao?: string | null
          preco_unitario?: number
          categoria?: string | null
          created_at?: string
        }
      }
      fatores_dificuldade: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          multiplicador: number
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          multiplicador: number
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          multiplicador?: number
          created_at?: string
        }
      }
      clientes: {
        Row: {
          id: string
          nome: string
          telefone: string
          email: string | null
          endereco: string | null
          status: 'lead' | 'ativo' | 'inativo'
          observacoes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          telefone: string
          email?: string | null
          endereco?: string | null
          status?: 'lead' | 'ativo' | 'inativo'
          observacoes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          telefone?: string
          email?: string | null
          endereco?: string | null
          status?: 'lead' | 'ativo' | 'inativo'
          observacoes?: string | null
          created_at?: string
        }
      }
      projetos: {
        Row: {
          id: string
          cliente_id: string
          nome: string
          descricao: string | null
          valor_total: number
          desconto: number
          status: 'orcamento' | 'negociacao' | 'aprovado' | 'rejeitado' | 'andamento' | 'finalizado'
          data_criacao: string
          data_entrega: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cliente_id: string
          nome: string
          descricao?: string | null
          valor_total: number
          desconto?: number
          status?: 'orcamento' | 'negociacao' | 'aprovado' | 'rejeitado' | 'andamento' | 'finalizado'
          data_criacao: string
          data_entrega?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string
          nome?: string
          descricao?: string | null
          valor_total?: number
          desconto?: number
          status?: 'orcamento' | 'negociacao' | 'aprovado' | 'rejeitado' | 'andamento' | 'finalizado'
          data_criacao?: string
          data_entrega?: string | null
          created_at?: string
        }
      }
      itens_projeto: {
        Row: {
          id: string
          projeto_id: string
          material_id: string
          descricao: string
          quantidade: number
          fator_dificuldade_id: string
          dias_estimados: number
          quantidade_profissionais: number
          nivel_profissional: string
          margem_lucro: number
          custo_material: number
          custo_mao_obra: number
          subtotal: number
          impostos: number
          valor_final: number
          created_at: string
        }
        Insert: {
          id?: string
          projeto_id: string
          material_id: string
          descricao: string
          quantidade: number
          fator_dificuldade_id: string
          dias_estimados: number
          quantidade_profissionais: number
          nivel_profissional: string
          margem_lucro: number
          custo_material: number
          custo_mao_obra: number
          subtotal: number
          impostos: number
          valor_final: number
          created_at?: string
        }
        Update: {
          id?: string
          projeto_id?: string
          material_id?: string
          descricao?: string
          quantidade?: number
          fator_dificuldade_id?: string
          dias_estimados?: number
          quantidade_profissionais?: number
          nivel_profissional?: string
          margem_lucro?: number
          custo_material?: number
          custo_mao_obra?: number
          subtotal?: number
          impostos?: number
          valor_final?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type SupabaseClient = typeof supabaseClient