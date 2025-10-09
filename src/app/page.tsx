"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calculator, Users, BarChart3, Package, Plus, Search, Edit, Trash2, Copy, Settings, FileText } from 'lucide-react'
import { toast } from 'sonner'

// Tipos de dados
interface Material {
  id: string
  codigo: string
  nome: string
  descricao: string
  precoUnitario: number
  categoria: string
}

interface FatorDificuldade {
  id: string
  nome: string
  descricao: string
  multiplicador: number
}

interface Cliente {
  id: string
  nome: string
  telefone: string
  email: string
  endereco: string
  status: 'lead' | 'ativo' | 'inativo'
  observacoes: string
}

interface ItemProjeto {
  id: string
  materialId: string
  descricao: string
  quantidade: number
  fatorDificuldadeId: string
  diasEstimados: number
  quantidadeProfissionais: number
  nivelProfissional: string
  margemLucro: number
  custoMaterial: number
  custoMaoObra: number
  subtotal: number
  impostos: number
  valorFinal: number
}

interface Projeto {
  id: string
  clienteId: string
  nome: string
  descricao: string
  itens: ItemProjeto[]
  valorTotal: number
  desconto: number
  status: 'orcamento' | 'negociacao' | 'aprovado' | 'rejeitado' | 'andamento' | 'finalizado'
  dataCreacao: string
  dataEntrega?: string
}

// Dados mock
const materiaisIniciais: Material[] = [
  { id: '1', codigo: 'ENV001', nome: 'Película Automotiva Premium', descricao: 'Película de alta qualidade para veículos', precoUnitario: 45.00, categoria: 'Automotivo' },
  { id: '2', codigo: 'ENV002', nome: 'Película Arquitetônica', descricao: 'Película para aplicação em vidros residenciais', precoUnitario: 35.00, categoria: 'Arquitetônico' },
  { id: '3', codigo: 'ENV003', nome: 'Adesivo Decorativo', descricao: 'Adesivo para decoração de ambientes', precoUnitario: 25.00, categoria: 'Decorativo' },
  { id: '4', codigo: 'ENV004', nome: 'Película de Segurança', descricao: 'Película anti-vandalismo', precoUnitario: 65.00, categoria: 'Segurança' },
  { id: '5', codigo: 'ENV005', nome: 'Película Solar', descricao: 'Película com proteção UV', precoUnitario: 55.00, categoria: 'Solar' }
]

const fatoresDificuldadeIniciais: FatorDificuldade[] = [
  { id: '1', nome: 'Baixo', descricao: 'Superfícies planas, fácil acesso', multiplicador: 2.3 },
  { id: '2', nome: 'Médio', descricao: 'Superfícies com detalhes, acesso moderado', multiplicador: 2.5 },
  { id: '3', nome: 'Alto', descricao: 'Superfícies complexas, acesso difícil', multiplicador: 2.8 },
  { id: '4', nome: 'Muito Alto', descricao: 'Superfícies muito complexas, acesso restrito', multiplicador: 3.3 }
]

const clientesIniciais: Cliente[] = [
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', nome: 'João Silva', telefone: '(11) 99999-9999', email: 'joao@email.com', endereco: 'Rua A, 123', status: 'ativo', observacoes: 'Cliente preferencial' },
  { id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012', nome: 'Maria Santos', telefone: '(11) 88888-8888', email: 'maria@email.com', endereco: 'Rua B, 456', status: 'lead', observacoes: 'Interessada em película automotiva' },
  { id: 'c3d4e5f6-g7h8-9012-cdef-345678901234', nome: 'Pedro Costa', telefone: '(11) 77777-7777', email: 'pedro@email.com', endereco: 'Rua C, 789', status: 'ativo', observacoes: 'Projetos recorrentes' }
]

// Template padrão para proposta
const templatePropostaPadrao = `🎯 *PROPOSTA COMERCIAL - ARTN ENVELOPAMENTO*

👤 *Cliente:* {{CLIENTE_NOME}}
📋 *Projeto:* {{PROJETO_NOME}}
📅 *Data:* {{DATA_ATUAL}}
⏰ *Prazo de Entrega:* {{DATA_ENTREGA}}

📊 *DETALHAMENTO DOS SERVIÇOS:*
{{ITENS_DETALHADOS}}

💰 *RESUMO FINANCEIRO:*
• Subtotal: {{SUBTOTAL}}
• Desconto: {{DESCONTO}}
• *VALOR TOTAL: {{VALOR_TOTAL}}*

✅ *CONDIÇÕES:*
• Pagamento: 50% entrada + 50% na entrega
• Garantia: 12 meses contra defeitos de aplicação
• Material incluso no valor
• Mão de obra especializada

📞 *CONTATO:*
ARTN Envelopamento
WhatsApp: (11) 99999-9999
Email: contato@artn.com.br

*Proposta válida por 15 dias*`

// Níveis profissionais
const niveisProfissionais = {
  junior: { nome: 'Júnior', valorDia: 150, descricao: 'Até 2 anos' },
  pleno: { nome: 'Pleno', valorDia: 250, descricao: '2-5 anos' },
  senior: { nome: 'Sênior', valorDia: 350, descricao: '5+ anos' },
  especialista: { nome: 'Especialista', valorDia: 450, descricao: '10+ anos' }
}

export default function PrecificacaoCRM() {
  // Estados para dados
  const [materiais, setMateriais] = useState<Material[]>(materiaisIniciais)
  const [fatoresDificuldade, setFatoresDificuldade] = useState<FatorDificuldade[]>(fatoresDificuldadeIniciais)
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciais)
  const [projetos, setProjetos] = useState<Projeto[]>([])

  // Estados para formulário de cálculo
  const [materialSelecionado, setMaterialSelecionado] = useState('')
  const [descricaoItem, setDescricaoItem] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [fatorDificuldadeSelecionado, setFatorDificuldadeSelecionado] = useState('')
  const [diasEstimados, setDiasEstimados] = useState('')
  const [quantidadeProfissionais, setQuantidadeProfissionais] = useState('')
  const [nivelProfissional, setNivelProfissional] = useState('')
  const [margemLucro, setMargemLucro] = useState('30')

  // Estados para projetos
  const [projetoSelecionado, setProjetoSelecionado] = useState('')
  const [nomeNovoProjeto, setNomeNovoProjeto] = useState('')
  const [clienteNovoProjeto, setClienteNovoProjeto] = useState('')

  // Estados para modais e formulários
  const [showMaterialModal, setShowMaterialModal] = useState(false)
  const [showFatorModal, setShowFatorModal] = useState(false)
  const [showClienteModal, setShowClienteModal] = useState(false)
  const [showProjetoModal, setShowProjetoModal] = useState(false)
  const [showPropostaModal, setShowPropostaModal] = useState(false)

  // Estados para edição
  const [materialEditando, setMaterialEditando] = useState<Material | null>(null)
  const [fatorEditando, setFatorEditando] = useState<FatorDificuldade | null>(null)
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)
  const [projetoEditando, setProjetoEditando] = useState<Projeto | null>(null)

  // Estados para novos registros
  const [novoMaterial, setNovoMaterial] = useState({ codigo: '', nome: '', descricao: '', precoUnitario: '', categoria: '' })
  const [novoFator, setNovoFator] = useState({ nome: '', descricao: '', multiplicador: '' })
  const [novoCliente, setNovoCliente] = useState({ nome: '', telefone: '', email: '', endereco: '', status: 'lead' as 'lead' | 'ativo' | 'inativo', observacoes: '' })

  // Estados para proposta
  const [projetoProposta, setProjetoProposta] = useState<Projeto | null>(null)
  const [templateProposta, setTemplateProposta] = useState(templatePropostaPadrao)

  // Estados para busca
  const [buscaCliente, setBuscaCliente] = useState('')
  const [buscaProjeto, setBuscaProjeto] = useState('')

  // Carregar dados do Supabase ao montar o componente
  useEffect(() => {
    carregarDados()
  }, [])

  // Função para carregar dados do Supabase
  const carregarDados = async () => {
    try {
      // Verificar se estamos no lado do cliente
      if (typeof window === 'undefined') {
        console.warn('Tentativa de carregar dados do Supabase no servidor. Ignorando.')
        return
      }

      // Import dinâmico do supabase
      const { getSupabaseClient } = await import('@/lib/supabase')
      const supabaseClient = getSupabaseClient()

      // Verificar se o cliente Supabase está disponível
      if (!supabaseClient) {
        console.warn('Cliente Supabase não está configurado. Usando dados locais.')
        return
      }

      // Carregar materiais
      const { data: materiaisData } = await supabaseClient
        .from('materiais')
        .select('*')
        .order('codigo')
      
      if (materiaisData && materiaisData.length > 0) {
        setMateriais(materiaisData.map((m: any) => ({
          id: m.id,
          codigo: m.codigo,
          nome: m.nome,
          descricao: m.descricao || '',
          precoUnitario: m.preco_unitario,
          categoria: m.categoria || ''
        })))
      }

      // Carregar fatores de dificuldade
      const { data: fatoresData } = await supabaseClient
        .from('fatores_dificuldade')
        .select('*')
        .order('multiplicador')
      
      if (fatoresData && fatoresData.length > 0) {
        setFatoresDificuldade(fatoresData.map((f: any) => ({
          id: f.id,
          nome: f.nome,
          descricao: f.descricao || '',
          multiplicador: f.multiplicador
        })))
      }

      // Carregar clientes
      const { data: clientesData } = await supabaseClient
        .from('clientes')
        .select('*')
        .order('nome')
      
      if (clientesData && clientesData.length > 0) {
        setClientes(clientesData.map((c: any) => ({
          id: c.id,
          nome: c.nome,
          telefone: c.telefone,
          email: c.email || '',
          endereco: c.endereco || '',
          status: c.status,
          observacoes: c.observacoes || ''
        })))
      }

      // Carregar projetos com itens
      const { data: projetosData } = await supabaseClient
        .from('projetos')
        .select(`
          *,
          itens_projeto (*)
        `)
        .order('data_criacao', { ascending: false })
      
      if (projetosData && projetosData.length > 0) {
        setProjetos(projetosData.map((p: any) => ({
          id: p.id,
          clienteId: p.cliente_id,
          nome: p.nome,
          descricao: p.descricao || '',
          itens: (p.itens_projeto || []).map((i: any) => ({
            id: i.id,
            materialId: i.material_id,
            descricao: i.descricao,
            quantidade: i.quantidade,
            fatorDificuldadeId: i.fator_dificuldade_id,
            diasEstimados: i.dias_estimados,
            quantidadeProfissionais: i.quantidade_profissionais,
            nivelProfissional: i.nivel_profissional,
            margemLucro: i.margem_lucro,
            custoMaterial: i.custo_material,
            custoMaoObra: i.custo_mao_obra,
            subtotal: i.subtotal,
            impostos: i.impostos,
            valorFinal: i.valor_final
          })),
          valorTotal: p.valor_total,
          desconto: p.desconto || 0,
          status: p.status,
          dataCreacao: new Date(p.data_criacao).toLocaleDateString('pt-BR'),
          dataEntrega: p.data_entrega ? new Date(p.data_entrega).toLocaleDateString('pt-BR') : undefined
        })))
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      // Continuar com dados locais se houver erro
    }
  }

  // Função para salvar dados no Supabase
  const salvarNoSupabase = async (tabela: string, dados: any, operacao: 'insert' | 'update' | 'delete' = 'insert') => {
    try {
      // Import dinâmico do supabase
      const { getSupabaseClient } = await import('@/lib/supabase')
      const supabaseClient = getSupabaseClient()

      // Verificar se o cliente Supabase está disponível
      if (!supabaseClient) {
        throw new Error('Cliente Supabase não está configurado. Verifique as variáveis de ambiente.')
      }

      let result
      
      if (operacao === 'insert') {
        result = await supabaseClient.from(tabela).insert(dados)
      } else if (operacao === 'update') {
        result = await supabaseClient.from(tabela).update(dados).eq('id', dados.id)
      } else if (operacao === 'delete') {
        result = await supabaseClient.from(tabela).delete().eq('id', dados.id)
      }
      
      if (result?.error) {
        console.error(`Erro detalhado ao ${operacao} em ${tabela}:`, {
          message: result.error.message,
          details: result.error.details,
          hint: result.error.hint,
          code: result.error.code,
          dados: dados
        })
        throw new Error(`Erro ao ${operacao} em ${tabela}: ${result.error.message}`)
      }
      
      return result?.data
    } catch (error: any) {
      console.error(`Erro completo na operação ${operacao} em ${tabela}:`, {
        error: error,
        message: error?.message || 'Erro desconhecido',
        stack: error?.stack,
        dados: dados
      })
      throw error
    }
  }

  // Função para formatar moeda no padrão brasileiro
  const formatarMoeda = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // Função para calcular soma dos dígitos até chegar a um único dígito
  const calcularSomaDigitos = (numero: number): number => {
    let soma = numero.toString().replace(/[.,]/g, '').split('').reduce((acc, digit) => acc + parseInt(digit), 0)
    
    while (soma >= 10) {
      soma = soma.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0)
    }
    
    return soma
  }

  // Função para ajustar valor para que a soma dos dígitos seja 8
  const ajustarParaSoma8 = (valorBase: number): number => {
    let valorAjustado = valorBase
    let tentativas = 0
    const maxTentativas = 10000
    
    while (calcularSomaDigitos(valorAjustado) !== 8 && tentativas < maxTentativas) {
      const somaAtual = calcularSomaDigitos(valorAjustado)
      
      if (somaAtual < 8) {
        valorAjustado += 0.01
      } else {
        valorAjustado -= 0.01
      }
      
      tentativas++
    }
    
    if (calcularSomaDigitos(valorAjustado) !== 8) {
      const valorString = Math.round(valorAjustado * 100).toString().padStart(4, '0')
      const digitos = valorString.split('').map(d => parseInt(d))
      
      let somaAtual = digitos.reduce((acc, d) => acc + d, 0)
      while (somaAtual >= 10) {
        somaAtual = somaAtual.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0)
      }
      
      if (somaAtual !== 8) {
        const diferenca = 8 - somaAtual
        let novoUltimoDigito = digitos[digitos.length - 1] + diferenca
        
        if (novoUltimoDigito < 0 || novoUltimoDigito > 9) {
          if (digitos.length > 1) {
            const ajustePenultimo = Math.floor(diferenca / 2)
            const ajusteUltimo = diferenca - ajustePenultimo
            
            digitos[digitos.length - 2] = Math.max(0, Math.min(9, digitos[digitos.length - 2] + ajustePenultimo))
            digitos[digitos.length - 1] = Math.max(0, Math.min(9, digitos[digitos.length - 1] + ajusteUltimo))
          }
        } else {
          digitos[digitos.length - 1] = novoUltimoDigito
        }
        
        const novoValorString = digitos.join('')
        valorAjustado = parseFloat(novoValorString.slice(0, -2) + '.' + novoValorString.slice(-2))
      }
    }
    
    return Math.max(valorAjustado, 0.01)
  }

  // Função de cálculo de preço para um item
  const calcularPrecoItem = () => {
    if (!materialSelecionado || !quantidade || !fatorDificuldadeSelecionado || !diasEstimados || !quantidadeProfissionais || !nivelProfissional) {
      return null
    }

    const material = materiais.find(m => m.id === materialSelecionado)
    const fator = fatoresDificuldade.find(f => f.id === fatorDificuldadeSelecionado)
    if (!material || !fator) return null

    const qtd = parseFloat(quantidade)
    const dias = parseInt(diasEstimados)
    const qtdProf = parseInt(quantidadeProfissionais)
    const margem = parseFloat(margemLucro) / 100

    // Cálculo do material
    const custoMaterial = qtd * material.precoUnitario * fator.multiplicador

    // Cálculo da mão de obra
    const custoMaoObra = dias * qtdProf * niveisProfissionais[nivelProfissional as keyof typeof niveisProfissionais].valorDia

    // Subtotal
    const subtotal = custoMaterial + custoMaoObra

    // Impostos (7%)
    const impostos = subtotal * 0.07

    // Base para margem
    const base = subtotal + impostos

    // Preço final inicial
    const valorFinalBase = base * (1 + margem)

    // Ajustar para que a soma dos dígitos seja 8
    const valorFinal = ajustarParaSoma8(valorFinalBase)

    return {
      material: material.nome,
      fator: fator.nome,
      custoMaterial,
      custoMaoObra,
      subtotal,
      impostos,
      base,
      margemLucro: base * margem,
      valorFinal,
      somaDigitos: calcularSomaDigitos(valorFinal)
    }
  }

  const resultado = calcularPrecoItem()

  // Função para gerar UUID v4
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Função para adicionar item ao projeto
  const adicionarItemProjeto = async () => {
    if (!resultado || !descricaoItem.trim()) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    const novoItem: ItemProjeto = {
      id: generateUUID(),
      materialId: materialSelecionado,
      descricao: descricaoItem,
      quantidade: parseFloat(quantidade),
      fatorDificuldadeId: fatorDificuldadeSelecionado,
      diasEstimados: parseInt(diasEstimados),
      quantidadeProfissionais: parseInt(quantidadeProfissionais),
      nivelProfissional,
      margemLucro: parseFloat(margemLucro),
      custoMaterial: resultado.custoMaterial,
      custoMaoObra: resultado.custoMaoObra,
      subtotal: resultado.subtotal,
      impostos: resultado.impostos,
      valorFinal: resultado.valorFinal
    }

    try {
      if (projetoSelecionado) {
        // Adicionar a projeto existente
        const projeto = projetos.find(p => p.id === projetoSelecionado)
        if (projeto) {
          const novosItens = [...projeto.itens, novoItem]
          const valorTotal = novosItens.reduce((acc, item) => acc + item.valorFinal, 0)
          const projetoAtualizado = {
            ...projeto,
            itens: novosItens,
            valorTotal: valorTotal - (valorTotal * projeto.desconto / 100)
          }

          // Salvar item no Supabase
          await salvarNoSupabase('itens_projeto', {
            id: novoItem.id,
            projeto_id: projetoSelecionado,
            material_id: novoItem.materialId,
            descricao: novoItem.descricao,
            quantidade: novoItem.quantidade,
            fator_dificuldade_id: novoItem.fatorDificuldadeId,
            dias_estimados: novoItem.diasEstimados,
            quantidade_profissionais: novoItem.quantidadeProfissionais,
            nivel_profissional: novoItem.nivelProfissional,
            margem_lucro: novoItem.margemLucro,
            custo_material: novoItem.custoMaterial,
            custo_mao_obra: novoItem.custoMaoObra,
            subtotal: novoItem.subtotal,
            impostos: novoItem.impostos,
            valor_final: novoItem.valorFinal
          })

          // Atualizar projeto no Supabase
          await salvarNoSupabase('projetos', {
            id: projetoSelecionado,
            valor_total: projetoAtualizado.valorTotal
          }, 'update')

          setProjetos(projetos.map(p => p.id === projetoSelecionado ? projetoAtualizado : p))
        }
        toast.success('Item adicionado ao projeto com sucesso!')
      } else if (nomeNovoProjeto.trim() && clienteNovoProjeto) {
        // Criar novo projeto
        const novoProjeto: Projeto = {
          id: generateUUID(),
          clienteId: clienteNovoProjeto,
          nome: nomeNovoProjeto,
          descricao: '',
          itens: [novoItem],
          valorTotal: novoItem.valorFinal,
          desconto: 0,
          status: 'orcamento',
          dataCreacao: new Date().toLocaleDateString('pt-BR'),
          dataEntrega: new Date(Date.now() + (parseInt(diasEstimados) * 24 * 60 * 60 * 1000)).toLocaleDateString('pt-BR')
        }

        // Salvar projeto no Supabase
        await salvarNoSupabase('projetos', {
          id: novoProjeto.id,
          cliente_id: novoProjeto.clienteId,
          nome: novoProjeto.nome,
          descricao: novoProjeto.descricao,
          valor_total: novoProjeto.valorTotal,
          desconto: novoProjeto.desconto,
          status: novoProjeto.status,
          data_criacao: new Date().toISOString(),
          data_entrega: new Date(Date.now() + (parseInt(diasEstimados) * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
        })

        // Salvar item no Supabase
        await salvarNoSupabase('itens_projeto', {
          id: novoItem.id,
          projeto_id: novoProjeto.id,
          material_id: novoItem.materialId,
          descricao: novoItem.descricao,
          quantidade: novoItem.quantidade,
          fator_dificuldade_id: novoItem.fatorDificuldadeId,
          dias_estimados: novoItem.diasEstimados,
          quantidade_profissionais: novoItem.quantidadeProfissionais,
          nivel_profissional: novoItem.nivelProfissional,
          margem_lucro: novoItem.margemLucro,
          custo_material: novoItem.custoMaterial,
          custo_mao_obra: novoItem.custoMaoObra,
          subtotal: novoItem.subtotal,
          impostos: novoItem.impostos,
          valor_final: novoItem.valorFinal
        })

        setProjetos([...projetos, novoProjeto])
        toast.success('Projeto criado com sucesso!')
      } else {
        toast.error('Selecione um projeto existente ou preencha os dados para criar um novo')
        return
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar no banco de dados')
      return
    }

    // Limpar formulário
    setMaterialSelecionado('')
    setDescricaoItem('')
    setQuantidade('')
    setFatorDificuldadeSelecionado('')
    setDiasEstimados('')
    setQuantidadeProfissionais('')
    setNivelProfissional('')
    setMargemLucro('30')
    setNomeNovoProjeto('')
    setClienteNovoProjeto('')
  }

  // Função para adicionar cliente
  const adicionarCliente = async () => {
    if (!novoCliente.nome || !novoCliente.telefone) {
      toast.error('Nome e telefone são obrigatórios')
      return
    }

    const cliente: Cliente = {
      id: generateUUID(),
      ...novoCliente
    }

    try {
      await salvarNoSupabase('clientes', {
        id: cliente.id,
        nome: cliente.nome,
        telefone: cliente.telefone,
        email: cliente.email,
        endereco: cliente.endereco,
        status: cliente.status,
        observacoes: cliente.observacoes
      })

      setClientes([...clientes, cliente])
      setNovoCliente({ nome: '', telefone: '', email: '', endereco: '', status: 'lead', observacoes: '' })
      toast.success('Cliente criado com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar cliente')
    }
  }

  // Função para editar cliente
  const editarCliente = (cliente: Cliente) => {
    setClienteEditando(cliente)
    setShowClienteModal(true)
  }

  // Função para salvar edição do cliente
  const salvarEdicaoCliente = async () => {
    if (!clienteEditando || !clienteEditando.nome || !clienteEditando.telefone) {
      toast.error('Nome e telefone são obrigatórios')
      return
    }

    try {
      await salvarNoSupabase('clientes', {
        id: clienteEditando.id,
        nome: clienteEditando.nome,
        telefone: clienteEditando.telefone,
        email: clienteEditando.email,
        endereco: clienteEditando.endereco,
        status: clienteEditando.status,
        observacoes: clienteEditando.observacoes
      }, 'update')

      setClientes(clientes.map(c => c.id === clienteEditando.id ? clienteEditando : c))
      setClienteEditando(null)
      setShowClienteModal(false)
      toast.success('Cliente atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar cliente')
    }
  }

  // Função para deletar cliente
  const deletarCliente = async (clienteId: string) => {
    // Verificar se cliente tem projetos
    const temProjetos = projetos.some(p => p.clienteId === clienteId)
    if (temProjetos) {
      toast.error('Não é possível deletar cliente com projetos associados')
      return
    }

    if (confirm('Tem certeza que deseja deletar este cliente?')) {
      try {
        await salvarNoSupabase('clientes', { id: clienteId }, 'delete')
        setClientes(clientes.filter(c => c.id !== clienteId))
        toast.success('Cliente deletado com sucesso!')
      } catch (error) {
        toast.error('Erro ao deletar cliente')
      }
    }
  }

  // Função para editar projeto
  const editarProjeto = (projeto: Projeto) => {
    setProjetoEditando(projeto)
    setShowProjetoModal(true)
  }

  // Função para salvar edição do projeto
  const salvarEdicaoProjeto = async () => {
    if (!projetoEditando) return

    const valorItens = projetoEditando.itens.reduce((acc, item) => acc + item.valorFinal, 0)
    const valorComDesconto = valorItens - (valorItens * projetoEditando.desconto / 100)

    try {
      await salvarNoSupabase('projetos', {
        id: projetoEditando.id,
        nome: projetoEditando.nome,
        descricao: projetoEditando.descricao,
        valor_total: valorComDesconto,
        desconto: projetoEditando.desconto,
        status: projetoEditando.status,
        data_entrega: projetoEditando.dataEntrega ? new Date(projetoEditando.dataEntrega.split('/').reverse().join('-')).toISOString().split('T')[0] : null
      }, 'update')

      setProjetos(projetos.map(p => p.id === projetoEditando.id ? {
        ...projetoEditando,
        valorTotal: valorComDesconto
      } : p))
      
      setProjetoEditando(null)
      setShowProjetoModal(false)
      toast.success('Projeto atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar projeto')
    }
  }

  // Função para deletar projeto
  const deletarProjeto = async (projetoId: string) => {
    if (confirm('Tem certeza que deseja deletar este projeto?')) {
      try {
        // Import dinâmico do supabase
        const { getSupabaseClient } = await import('@/lib/supabase')
        const supabaseClient = getSupabaseClient()

        // Verificar se o cliente existe e deletar itens primeiro
        if (supabaseClient) {
          // Deletar itens do projeto primeiro
          const { error: deleteItemsError } = await supabaseClient
            .from('itens_projeto')
            .delete()
            .eq('projeto_id', projetoId)
          
          if (deleteItemsError) {
            console.warn('Erro ao deletar itens do projeto:', deleteItemsError)
          }
        }
        
        // Deletar projeto
        await salvarNoSupabase('projetos', { id: projetoId }, 'delete')
        
        setProjetos(projetos.filter(p => p.id !== projetoId))
        toast.success('Projeto deletado com sucesso!')
      } catch (error) {
        console.error('Erro ao deletar projeto:', error)
        toast.error('Erro ao deletar projeto')
      }
    }
  }

  // Função para deletar item do projeto
  const deletarItemProjeto = async (projetoId: string, itemId: string) => {
    if (confirm('Tem certeza que deseja deletar este item?')) {
      try {
        await salvarNoSupabase('itens_projeto', { id: itemId }, 'delete')

        setProjetos(projetos.map(p => {
          if (p.id === projetoId) {
            const novosItens = p.itens.filter(i => i.id !== itemId)
            const valorItens = novosItens.reduce((acc, item) => acc + item.valorFinal, 0)
            const valorComDesconto = valorItens - (valorItens * p.desconto / 100)
            
            // Atualizar valor total no Supabase
            salvarNoSupabase('projetos', {
              id: projetoId,
              valor_total: valorComDesconto
            }, 'update')

            return {
              ...p,
              itens: novosItens,
              valorTotal: valorComDesconto
            }
          }
          return p
        }))
        toast.success('Item deletado com sucesso!')
      } catch (error) {
        toast.error('Erro ao deletar item')
      }
    }
  }

  // Função para adicionar material
  const adicionarMaterial = async () => {
    if (!novoMaterial.codigo || !novoMaterial.nome || !novoMaterial.precoUnitario) {
      toast.error('Código, nome e preço são obrigatórios')
      return
    }

    const material: Material = {
      id: generateUUID(),
      codigo: novoMaterial.codigo,
      nome: novoMaterial.nome,
      descricao: novoMaterial.descricao,
      precoUnitario: parseFloat(novoMaterial.precoUnitario),
      categoria: novoMaterial.categoria
    }

    try {
      await salvarNoSupabase('materiais', {
        id: material.id,
        codigo: material.codigo,
        nome: material.nome,
        descricao: material.descricao,
        preco_unitario: material.precoUnitario,
        categoria: material.categoria
      })

      setMateriais([...materiais, material])
      setNovoMaterial({ codigo: '', nome: '', descricao: '', precoUnitario: '', categoria: '' })
      setShowMaterialModal(false)
      toast.success('Material adicionado com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar material')
    }
  }

  // Função para editar material
  const editarMaterial = (material: Material) => {
    setMaterialEditando(material)
    setNovoMaterial({
      codigo: material.codigo,
      nome: material.nome,
      descricao: material.descricao,
      precoUnitario: material.precoUnitario.toString(),
      categoria: material.categoria
    })
    setShowMaterialModal(true)
  }

  // Função para salvar edição do material
  const salvarEdicaoMaterial = async () => {
    if (!materialEditando || !novoMaterial.codigo || !novoMaterial.nome || !novoMaterial.precoUnitario) {
      toast.error('Código, nome e preço são obrigatórios')
      return
    }

    const materialAtualizado: Material = {
      ...materialEditando,
      codigo: novoMaterial.codigo,
      nome: novoMaterial.nome,
      descricao: novoMaterial.descricao,
      precoUnitario: parseFloat(novoMaterial.precoUnitario),
      categoria: novoMaterial.categoria
    }

    try {
      await salvarNoSupabase('materiais', {
        id: materialAtualizado.id,
        codigo: materialAtualizado.codigo,
        nome: materialAtualizado.nome,
        descricao: materialAtualizado.descricao,
        preco_unitario: materialAtualizado.precoUnitario,
        categoria: materialAtualizado.categoria
      }, 'update')

      setMateriais(materiais.map(m => m.id === materialEditando.id ? materialAtualizado : m))
      setMaterialEditando(null)
      setNovoMaterial({ codigo: '', nome: '', descricao: '', precoUnitario: '', categoria: '' })
      setShowMaterialModal(false)
      toast.success('Material atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar material')
    }
  }

  // Função para deletar material
  const deletarMaterial = async (materialId: string) => {
    // Verificar se material está sendo usado em projetos
    const emUso = projetos.some(p => p.itens.some(i => i.materialId === materialId))
    if (emUso) {
      toast.error('Não é possível deletar material que está sendo usado em projetos')
      return
    }

    if (confirm('Tem certeza que deseja deletar este material?')) {
      try {
        await salvarNoSupabase('materiais', { id: materialId }, 'delete')
        setMateriais(materiais.filter(m => m.id !== materialId))
        toast.success('Material deletado com sucesso!')
      } catch (error) {
        toast.error('Erro ao deletar material')
      }
    }
  }

  // Função para adicionar fator de dificuldade
  const adicionarFator = async () => {
    if (!novoFator.nome || !novoFator.multiplicador) {
      toast.error('Nome e multiplicador são obrigatórios')
      return
    }

    const fator: FatorDificuldade = {
      id: generateUUID(),
      nome: novoFator.nome,
      descricao: novoFator.descricao,
      multiplicador: parseFloat(novoFator.multiplicador)
    }

    try {
      await salvarNoSupabase('fatores_dificuldade', {
        id: fator.id,
        nome: fator.nome,
        descricao: fator.descricao,
        multiplicador: fator.multiplicador
      })

      setFatoresDificuldade([...fatoresDificuldade, fator])
      setNovoFator({ nome: '', descricao: '', multiplicador: '' })
      setShowFatorModal(false)
      toast.success('Fator de dificuldade adicionado com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar fator')
    }
  }

  // Função para editar fator de dificuldade
  const editarFator = (fator: FatorDificuldade) => {
    setFatorEditando(fator)
    setNovoFator({
      nome: fator.nome,
      descricao: fator.descricao,
      multiplicador: fator.multiplicador.toString()
    })
    setShowFatorModal(true)
  }

  // Função para salvar edição do fator
  const salvarEdicaoFator = async () => {
    if (!fatorEditando || !novoFator.nome || !novoFator.multiplicador) {
      toast.error('Nome e multiplicador são obrigatórios')
      return
    }

    const fatorAtualizado: FatorDificuldade = {
      ...fatorEditando,
      nome: novoFator.nome,
      descricao: novoFator.descricao,
      multiplicador: parseFloat(novoFator.multiplicador)
    }

    try {
      await salvarNoSupabase('fatores_dificuldade', {
        id: fatorAtualizado.id,
        nome: fatorAtualizado.nome,
        descricao: fatorAtualizado.descricao,
        multiplicador: fatorAtualizado.multiplicador
      }, 'update')

      setFatoresDificuldade(fatoresDificuldade.map(f => f.id === fatorEditando.id ? fatorAtualizado : f))
      setFatorEditando(null)
      setNovoFator({ nome: '', descricao: '', multiplicador: '' })
      setShowFatorModal(false)
      toast.success('Fator de dificuldade atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar fator')
    }
  }

  // Função para deletar fator de dificuldade
  const deletarFator = async (fatorId: string) => {
    // Verificar se fator está sendo usado em projetos
    const emUso = projetos.some(p => p.itens.some(i => i.fatorDificuldadeId === fatorId))
    if (emUso) {
      toast.error('Não é possível deletar fator que está sendo usado em projetos')
      return
    }

    if (confirm('Tem certeza que deseja deletar este fator de dificuldade?')) {
      try {
        await salvarNoSupabase('fatores_dificuldade', { id: fatorId }, 'delete')
        setFatoresDificuldade(fatoresDificuldade.filter(f => f.id !== fatorId))
        toast.success('Fator de dificuldade deletado com sucesso!')
      } catch (error) {
        toast.error('Erro ao deletar fator')
      }
    }
  }

  // Função para gerar proposta
  const gerarProposta = (projeto: Projeto) => {
    const cliente = clientes.find(c => c.id === projeto.clienteId)
    if (!cliente) return

    let itensDetalhados = ''
    projeto.itens.forEach((item, index) => {
      const material = materiais.find(m => m.id === item.materialId)
      const fator = fatoresDificuldade.find(f => f.id === item.fatorDificuldadeId)
      
      itensDetalhados += `${index + 1}. ${item.descricao}\n`
      itensDetalhados += `   • Material: ${material?.nome || 'N/A'}\n`
      itensDetalhados += `   • Quantidade: ${item.quantidade}\n`
      itensDetalhados += `   • Dificuldade: ${fator?.nome || 'N/A'}\n`
      itensDetalhados += `   • Valor: ${formatarMoeda(item.valorFinal)}\n\n`
    })

    const subtotal = projeto.itens.reduce((acc, item) => acc + item.valorFinal, 0)
    const desconto = subtotal * projeto.desconto / 100

    const propostaGerada = templateProposta
      .replace('{{CLIENTE_NOME}}', cliente.nome)
      .replace('{{PROJETO_NOME}}', projeto.nome)
      .replace('{{DATA_ATUAL}}', new Date().toLocaleDateString('pt-BR'))
      .replace('{{DATA_ENTREGA}}', projeto.dataEntrega || 'A definir')
      .replace('{{ITENS_DETALHADOS}}', itensDetalhados)
      .replace('{{SUBTOTAL}}', formatarMoeda(subtotal))
      .replace('{{DESCONTO}}', projeto.desconto > 0 ? `${projeto.desconto}% (${formatarMoeda(desconto)})` : 'Não aplicado')
      .replace('{{VALOR_TOTAL}}', formatarMoeda(projeto.valorTotal))

    setProjetoProposta(projeto)
    setTemplateProposta(propostaGerada)
    setShowPropostaModal(true)
  }

  // Função para copiar proposta
  const copiarProposta = () => {
    navigator.clipboard.writeText(templateProposta)
    toast.success('Proposta copiada para a área de transferência!')
  }

  // Filtros
  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
    cliente.telefone.includes(buscaCliente) ||
    cliente.email.toLowerCase().includes(buscaCliente.toLowerCase())
  )

  const projetosFiltrados = projetos.filter(projeto => {
    const cliente = clientes.find(c => c.id === projeto.clienteId)
    return projeto.nome.toLowerCase().includes(buscaProjeto.toLowerCase()) ||
           cliente?.nome.toLowerCase().includes(buscaProjeto.toLowerCase()) ||
           projeto.status.toLowerCase().includes(buscaProjeto.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Sistema de Precificação CRM</h1>
          <p className="text-gray-600">ARTN Envelopamento - Gestão Completa de Projetos</p>
        </div>

        {/* Tabs principais */}
        <Tabs defaultValue="calculadora" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white shadow-lg rounded-2xl p-2">
            <TabsTrigger value="calculadora" className="flex items-center gap-2 rounded-xl">
              <Calculator className="w-4 h-4" />
              Calculadora
            </TabsTrigger>
            <TabsTrigger value="clientes" className="flex items-center gap-2 rounded-xl">
              <Users className="w-4 h-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="projetos" className="flex items-center gap-2 rounded-xl">
              <BarChart3 className="w-4 h-4" />
              Projetos
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="flex items-center gap-2 rounded-xl">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Calculadora de Preços */}
          <TabsContent value="calculadora">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Formulário de Cálculo */}
              <Card className="bg-white shadow-lg border border-blue-100 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Calculator className="w-5 h-5" />
                    Calculadora de Preços
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Material */}
                  <div className="space-y-2">
                    <Label htmlFor="material" className="text-gray-700 font-medium">Material *</Label>
                    <Select value={materialSelecionado} onValueChange={setMaterialSelecionado}>
                      <SelectTrigger className="border-blue-200 focus:border-blue-500 rounded-lg">
                        <SelectValue placeholder="Selecione o material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materiais.map(material => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.codigo} - {material.nome} ({formatarMoeda(material.precoUnitario)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Descrição do Item */}
                  <div className="space-y-2">
                    <Label htmlFor="descricao" className="text-gray-700 font-medium">Descrição do Item *</Label>
                    <Input
                      id="descricao"
                      value={descricaoItem}
                      onChange={(e) => setDescricaoItem(e.target.value)}
                      placeholder="Ex: Envelopamento completo do capô"
                      className="border-blue-200 focus:border-blue-500 rounded-lg"
                    />
                  </div>

                  {/* Quantidade */}
                  <div className="space-y-2">
                    <Label htmlFor="quantidade" className="text-gray-700 font-medium">Quantidade (m²) *</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      step="0.01"
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value)}
                      placeholder="Ex: 2.5"
                      className="border-blue-200 focus:border-blue-500 rounded-lg"
                    />
                  </div>

                  {/* Fator de Dificuldade */}
                  <div className="space-y-2">
                    <Label htmlFor="fator" className="text-gray-700 font-medium">Fator de Dificuldade *</Label>
                    <Select value={fatorDificuldadeSelecionado} onValueChange={setFatorDificuldadeSelecionado}>
                      <SelectTrigger className="border-blue-200 focus:border-blue-500 rounded-lg">
                        <SelectValue placeholder="Selecione a dificuldade" />
                      </SelectTrigger>
                      <SelectContent>
                        {fatoresDificuldade.map(fator => (
                          <SelectItem key={fator.id} value={fator.id}>
                            {fator.nome} - {fator.multiplicador}x ({fator.descricao})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Estimativas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dias" className="text-gray-700 font-medium">Dias Estimados *</Label>
                      <Input
                        id="dias"
                        type="number"
                        value={diasEstimados}
                        onChange={(e) => setDiasEstimados(e.target.value)}
                        placeholder="Ex: 3"
                        className="border-blue-200 focus:border-blue-500 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profissionais" className="text-gray-700 font-medium">Nº Profissionais *</Label>
                      <Input
                        id="profissionais"
                        type="number"
                        value={quantidadeProfissionais}
                        onChange={(e) => setQuantidadeProfissionais(e.target.value)}
                        placeholder="Ex: 2"
                        className="border-blue-200 focus:border-blue-500 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Nível Profissional */}
                  <div className="space-y-2">
                    <Label htmlFor="nivel" className="text-gray-700 font-medium">Nível Profissional *</Label>
                    <Select value={nivelProfissional} onValueChange={setNivelProfissional}>
                      <SelectTrigger className="border-blue-200 focus:border-blue-500 rounded-lg">
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(niveisProfissionais).map(([key, nivel]) => (
                          <SelectItem key={key} value={key}>
                            {nivel.nome} - {formatarMoeda(nivel.valorDia)}/dia ({nivel.descricao})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Margem de Lucro */}
                  <div className="space-y-2">
                    <Label htmlFor="margem" className="text-gray-700 font-medium">Margem de Lucro (%)</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="margem"
                        type="range"
                        min="15"
                        max="100"
                        value={margemLucro}
                        onChange={(e) => setMargemLucro(e.target.value)}
                        className="flex-1"
                      />
                      <span className="font-semibold text-lg w-12 text-blue-600">{margemLucro}%</span>
                    </div>
                    <p className="text-sm text-gray-500">Faixa permitida: 15% - 100%</p>
                  </div>

                  {/* Projeto */}
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700">Associar a Projeto</h3>
                    
                    {/* Projeto Existente */}
                    <div className="space-y-2">
                      <Label htmlFor="projeto-existente" className="text-gray-700 font-medium">Projeto Existente</Label>
                      <Select value={projetoSelecionado} onValueChange={setProjetoSelecionado}>
                        <SelectTrigger className="border-blue-200 focus:border-blue-500 rounded-lg">
                          <SelectValue placeholder="Selecione um projeto existente" />
                        </SelectTrigger>
                        <SelectContent>
                          {projetos.map(projeto => {
                            const cliente = clientes.find(c => c.id === projeto.clienteId)
                            return (
                              <SelectItem key={projeto.id} value={projeto.id}>
                                {projeto.nome} - {cliente?.nome}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="text-center text-sm text-gray-500">OU</div>

                    {/* Novo Projeto */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome-projeto" className="text-gray-700 font-medium">Nome do Novo Projeto</Label>
                        <Input
                          id="nome-projeto"
                          value={nomeNovoProjeto}
                          onChange={(e) => setNomeNovoProjeto(e.target.value)}
                          placeholder="Ex: Envelopamento Veículo João"
                          className="border-blue-200 focus:border-blue-500 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cliente-projeto" className="text-gray-700 font-medium">Cliente</Label>
                        <Select value={clienteNovoProjeto} onValueChange={setClienteNovoProjeto}>
                          <SelectTrigger className="border-blue-200 focus:border-blue-500 rounded-lg">
                            <SelectValue placeholder="Selecione o cliente" />
                          </SelectTrigger>
                          <SelectContent>
                            {clientes.map(cliente => (
                              <SelectItem key={cliente.id} value={cliente.id}>
                                {cliente.nome} - {cliente.telefone}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resultado do Cálculo */}
              <Card className="bg-white shadow-lg border border-green-100 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <BarChart3 className="w-5 h-5" />
                    Resultado do Cálculo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {resultado ? (
                    <div className="space-y-6">
                      {/* Informações do Material */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-700 mb-2">Material e Dificuldade</h4>
                        <p className="text-sm text-blue-600">Material: {resultado.material}</p>
                        <p className="text-sm text-blue-600">Fator: {resultado.fator}</p>
                      </div>

                      {/* Breakdown de Custos */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Custo Material:</span>
                          <span className="font-medium">{formatarMoeda(resultado.custoMaterial)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Custo Mão de Obra:</span>
                          <span className="font-medium">{formatarMoeda(resultado.custoMaoObra)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">{formatarMoeda(resultado.subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Impostos (7%):</span>
                          <span className="font-medium">{formatarMoeda(resultado.impostos)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Margem de Lucro ({margemLucro}%):</span>
                          <span className="font-medium">{formatarMoeda(resultado.margemLucro)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span className="text-green-700">Valor Final:</span>
                          <span className="text-green-700">{formatarMoeda(resultado.valorFinal)}</span>
                        </div>
                        <div className="text-center">
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Soma dos dígitos: {resultado.somaDigitos} ✨
                          </Badge>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={adicionarItemProjeto} 
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg" 
                        size="lg"
                      >
                        Adicionar Item ao Projeto
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Preencha todos os campos para ver o resultado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Gestão de Clientes */}
          <TabsContent value="clientes">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Formulário de Novo Cliente */}
              <Card className="bg-white shadow-lg border border-blue-100 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Plus className="w-5 h-5" />
                    Novo Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-gray-700 font-medium">Nome *</Label>
                    <Input
                      id="nome"
                      value={novoCliente.nome}
                      onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})}
                      placeholder="Nome completo"
                      className="border-blue-200 focus:border-blue-500 rounded-lg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-gray-700 font-medium">Telefone *</Label>
                    <Input
                      id="telefone"
                      value={novoCliente.telefone}
                      onChange={(e) => setNovoCliente({...novoCliente, telefone: e.target.value})}
                      placeholder="(11) 99999-9999"
                      className="border-blue-200 focus:border-blue-500 rounded-lg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={novoCliente.email}
                      onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
                      placeholder="email@exemplo.com"
                      className="border-blue-200 focus:border-blue-500 rounded-lg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endereco" className="text-gray-700 font-medium">Endereço</Label>
                    <Input
                      id="endereco"
                      value={novoCliente.endereco}
                      onChange={(e) => setNovoCliente({...novoCliente, endereco: e.target.value})}
                      placeholder="Endereço completo"
                      className="border-blue-200 focus:border-blue-500 rounded-lg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-gray-700 font-medium">Status</Label>
                    <Select value={novoCliente.status} onValueChange={(value) => setNovoCliente({...novoCliente, status: value as 'lead' | 'ativo' | 'inativo'})}>
                      <SelectTrigger className="border-blue-200 focus:border-blue-500 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="observacoes" className="text-gray-700 font-medium">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={novoCliente.observacoes}
                      onChange={(e) => setNovoCliente({...novoCliente, observacoes: e.target.value})}
                      placeholder="Observações sobre o cliente"
                      className="border-blue-200 focus:border-blue-500 rounded-lg"
                    />
                  </div>
                  
                  <Button 
                    onClick={adicionarCliente} 
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg"
                  >
                    Adicionar Cliente
                  </Button>
                </CardContent>
              </Card>

              {/* Lista de Clientes */}
              <div className="lg:col-span-2">
                <Card className="bg-white shadow-lg border border-gray-100 rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-2xl">
                    <CardTitle className="flex items-center gap-2 text-gray-700">
                      <Users className="w-5 h-5" />
                      Clientes Cadastrados
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-4">
                      <Search className="w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Buscar cliente..."
                        value={buscaCliente}
                        onChange={(e) => setBuscaCliente(e.target.value)}
                        className="border-gray-200 focus:border-gray-400 rounded-lg"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {clientesFiltrados.map(cliente => (
                        <div key={cliente.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-800">{cliente.nome}</h3>
                                <Badge variant={cliente.status === 'ativo' ? 'default' : cliente.status === 'lead' ? 'secondary' : 'outline'}>
                                  {cliente.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">📞 {cliente.telefone}</p>
                              {cliente.email && <p className="text-sm text-gray-600">✉️ {cliente.email}</p>}
                              {cliente.endereco && <p className="text-sm text-gray-600">📍 {cliente.endereco}</p>}
                              {cliente.observacoes && <p className="text-sm text-gray-500 mt-2">{cliente.observacoes}</p>}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => editarCliente(cliente)}
                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => deletarCliente(cliente.id)}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Modal de Edição de Cliente */}
            <Dialog open={showClienteModal} onOpenChange={setShowClienteModal}>
              <DialogContent className="bg-white rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-blue-700">Editar Cliente</DialogTitle>
                </DialogHeader>
                {clienteEditando && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Nome *</Label>
                      <Input
                        value={clienteEditando.nome}
                        onChange={(e) => setClienteEditando({...clienteEditando, nome: e.target.value})}
                        placeholder="Nome completo"
                        className="border-blue-200 focus:border-blue-500 rounded-lg"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Telefone *</Label>
                      <Input
                        value={clienteEditando.telefone}
                        onChange={(e) => setClienteEditando({...clienteEditando, telefone: e.target.value})}
                        placeholder="(11) 99999-9999"
                        className="border-blue-200 focus:border-blue-500 rounded-lg"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Email</Label>
                      <Input
                        type="email"
                        value={clienteEditando.email}
                        onChange={(e) => setClienteEditando({...clienteEditando, email: e.target.value})}
                        placeholder="email@exemplo.com"
                        className="border-blue-200 focus:border-blue-500 rounded-lg"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Endereço</Label>
                      <Input
                        value={clienteEditando.endereco}
                        onChange={(e) => setClienteEditando({...clienteEditando, endereco: e.target.value})}
                        placeholder="Endereço completo"
                        className="border-blue-200 focus:border-blue-500 rounded-lg"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Status</Label>
                      <Select value={clienteEditando.status} onValueChange={(value: 'lead' | 'ativo' | 'inativo') => setClienteEditando({...clienteEditando, status: value})}>
                        <SelectTrigger className="border-blue-200 focus:border-blue-500 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Observações</Label>
                      <Textarea
                        value={clienteEditando.observacoes}
                        onChange={(e) => setClienteEditando({...clienteEditando, observacoes: e.target.value})}
                        placeholder="Observações sobre o cliente"
                        className="border-blue-200 focus:border-blue-500 rounded-lg"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={salvarEdicaoCliente}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg"
                      >
                        Salvar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setClienteEditando(null)
                          setShowClienteModal(false)
                        }}
                        className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Gestão de Projetos */}
          <TabsContent value="projetos">
            <div className="space-y-6">
              {/* Header com busca */}
              <Card className="bg-white shadow-lg border border-gray-100 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-2xl">
                  <CardTitle className="flex items-center gap-2 text-gray-700">
                    <BarChart3 className="w-5 h-5" />
                    Projetos
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-4">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar projeto..."
                      value={buscaProjeto}
                      onChange={(e) => setBuscaProjeto(e.target.value)}
                      className="border-gray-200 focus:border-gray-400 rounded-lg"
                    />
                  </div>
                </CardHeader>
              </Card>

              {/* Lista de Projetos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {projetosFiltrados.map(projeto => {
                  const cliente = clientes.find(c => c.id === projeto.clienteId)
                  return (
                    <Card key={projeto.id} className="bg-white shadow-lg border border-gray-100 rounded-2xl hover:shadow-xl transition-shadow">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-blue-700 text-lg">{projeto.nome}</CardTitle>
                            <p className="text-sm text-blue-600 mt-1">{cliente?.nome || 'Cliente não encontrado'}</p>
                          </div>
                          <Badge variant={
                            projeto.status === 'finalizado' ? 'default' :
                            projeto.status === 'aprovado' || projeto.status === 'andamento' ? 'secondary' :
                            projeto.status === 'rejeitado' ? 'destructive' : 'outline'
                          }>
                            {projeto.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Valor Total:</span>
                            <span className="font-bold text-green-600">{formatarMoeda(projeto.valorTotal)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Itens:</span>
                            <span className="font-medium">{projeto.itens.length}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Criado em:</span>
                            <span className="text-sm">{projeto.dataCreacao}</span>
                          </div>
                          
                          {projeto.dataEntrega && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Data de Entrega:</span>
                              <span className="text-sm">{projeto.dataEntrega}</span>
                            </div>
                          )}
                          
                          {projeto.desconto > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Desconto:</span>
                              <span className="text-orange-600">{projeto.desconto}%</span>
                            </div>
                          )}
                        </div>

                        {/* Itens do Projeto */}
                        {projeto.itens.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-2">Itens:</h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {projeto.itens.map(item => {
                                const material = materiais.find(m => m.id === item.materialId)
                                return (
                                  <div key={item.id} className="flex justify-between items-center text-sm">
                                    <div className="flex-1">
                                      <p className="font-medium">{item.descricao}</p>
                                      <p className="text-gray-500">{material?.nome} - {item.quantidade}m²</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{formatarMoeda(item.valorFinal)}</span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => deletarItemProjeto(projeto.id, item.id)}
                                        className="border-red-200 text-red-600 hover:bg-red-50 p-1 h-6 w-6"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Ações */}
                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editarProjeto(projeto)}
                            className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => gerarProposta(projeto)}
                            className="flex-1 border-green-200 text-green-600 hover:bg-green-50"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Proposta
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deletarProjeto(projeto.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {projetosFiltrados.length === 0 && (
                <Card className="bg-white shadow-lg border border-gray-100 rounded-2xl">
                  <CardContent className="text-center py-12">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Nenhum projeto encontrado</p>
                    <p className="text-sm text-gray-400 mt-2">Crie seu primeiro projeto na aba Calculadora</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Modal de Edição de Projeto */}
            <Dialog open={showProjetoModal} onOpenChange={setShowProjetoModal}>
              <DialogContent className="bg-white rounded-2xl max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-blue-700">Editar Projeto</DialogTitle>
                </DialogHeader>
                {projetoEditando && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Nome do Projeto *</Label>
                      <Input
                        value={projetoEditando.nome}
                        onChange={(e) => setProjetoEditando({...projetoEditando, nome: e.target.value})}
                        placeholder="Nome do projeto"
                        className="border-blue-200 focus:border-blue-500 rounded-lg"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Descrição</Label>
                      <Textarea
                        value={projetoEditando.descricao}
                        onChange={(e) => setProjetoEditando({...projetoEditando, descricao: e.target.value})}
                        placeholder="Descrição do projeto"
                        className="border-blue-200 focus:border-blue-500 rounded-lg"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Status</Label>
                        <Select 
                          value={projetoEditando.status} 
                          onValueChange={(value: 'orcamento' | 'negociacao' | 'aprovado' | 'rejeitado' | 'andamento' | 'finalizado') => 
                            setProjetoEditando({...projetoEditando, status: value})
                          }
                        >
                          <SelectTrigger className="border-blue-200 focus:border-blue-500 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="orcamento">Orçamento</SelectItem>
                            <SelectItem value="negociacao">Negociação</SelectItem>
                            <SelectItem value="aprovado">Aprovado</SelectItem>
                            <SelectItem value="rejeitado">Rejeitado</SelectItem>
                            <SelectItem value="andamento">Em Andamento</SelectItem>
                            <SelectItem value="finalizado">Finalizado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Desconto (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={projetoEditando.desconto}
                          onChange={(e) => setProjetoEditando({...projetoEditando, desconto: parseFloat(e.target.value) || 0})}
                          placeholder="0"
                          className="border-blue-200 focus:border-blue-500 rounded-lg"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Data de Entrega</Label>
                      <Input
                        type="date"
                        value={projetoEditando.dataEntrega ? projetoEditando.dataEntrega.split('/').reverse().join('-') : ''}
                        onChange={(e) => setProjetoEditando({
                          ...projetoEditando, 
                          dataEntrega: e.target.value ? new Date(e.target.value).toLocaleDateString('pt-BR') : undefined
                        })}
                        className="border-blue-200 focus:border-blue-500 rounded-lg"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={salvarEdicaoProjeto}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg"
                      >
                        Salvar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setProjetoEditando(null)
                          setShowProjetoModal(false)
                        }}
                        className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Modal de Proposta */}
            <Dialog open={showPropostaModal} onOpenChange={setShowPropostaModal}>
              <DialogContent className="bg-white rounded-2xl max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-green-700">Proposta Comercial</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Label className="text-gray-700 font-medium">Template da Proposta</Label>
                    <Textarea
                      value={templateProposta}
                      onChange={(e) => setTemplateProposta(e.target.value)}
                      className="mt-2 min-h-[400px] font-mono text-sm border-gray-200 focus:border-gray-400 rounded-lg"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={copiarProposta}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Proposta
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPropostaModal(false)}
                      className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="configuracoes">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Materiais */}
              <Card className="bg-white shadow-lg border border-blue-100 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <Package className="w-5 h-5" />
                      Materiais
                    </CardTitle>
                    <Dialog open={showMaterialModal} onOpenChange={setShowMaterialModal}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                          onClick={() => {
                            setMaterialEditando(null)
                            setNovoMaterial({ codigo: '', nome: '', descricao: '', precoUnitario: '', categoria: '' })
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-blue-700">
                            {materialEditando ? 'Editar Material' : 'Novo Material'}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Código *</Label>
                            <Input
                              value={novoMaterial.codigo}
                              onChange={(e) => setNovoMaterial({...novoMaterial, codigo: e.target.value})}
                              placeholder="Ex: ENV001"
                              className="border-blue-200 focus:border-blue-500 rounded-lg"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Nome *</Label>
                            <Input
                              value={novoMaterial.nome}
                              onChange={(e) => setNovoMaterial({...novoMaterial, nome: e.target.value})}
                              placeholder="Nome do material"
                              className="border-blue-200 focus:border-blue-500 rounded-lg"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Descrição</Label>
                            <Input
                              value={novoMaterial.descricao}
                              onChange={(e) => setNovoMaterial({...novoMaterial, descricao: e.target.value})}
                              placeholder="Descrição do material"
                              className="border-blue-200 focus:border-blue-500 rounded-lg"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Preço Unitário *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={novoMaterial.precoUnitario}
                              onChange={(e) => setNovoMaterial({...novoMaterial, precoUnitario: e.target.value})}
                              placeholder="0.00"
                              className="border-blue-200 focus:border-blue-500 rounded-lg"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Categoria</Label>
                            <Input
                              value={novoMaterial.categoria}
                              onChange={(e) => setNovoMaterial({...novoMaterial, categoria: e.target.value})}
                              placeholder="Ex: Automotivo"
                              className="border-blue-200 focus:border-blue-500 rounded-lg"
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              onClick={materialEditando ? salvarEdicaoMaterial : adicionarMaterial}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg"
                            >
                              {materialEditando ? 'Salvar' : 'Adicionar'}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setShowMaterialModal(false)
                                setMaterialEditando(null)
                                setNovoMaterial({ codigo: '', nome: '', descricao: '', precoUnitario: '', categoria: '' })
                              }}
                              className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {materiais.map(material => (
                      <div key={material.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium">{material.codigo} - {material.nome}</p>
                          <p className="text-sm text-gray-500">{formatarMoeda(material.precoUnitario)} - {material.categoria}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => editarMaterial(material)}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deletarMaterial(material.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Fatores de Dificuldade */}
              <Card className="bg-white shadow-lg border border-green-100 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <Settings className="w-5 h-5" />
                      Fatores de Dificuldade
                    </CardTitle>
                    <Dialog open={showFatorModal} onOpenChange={setShowFatorModal}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          className="bg-green-500 hover:bg-green-600 text-white rounded-lg"
                          onClick={() => {
                            setFatorEditando(null)
                            setNovoFator({ nome: '', descricao: '', multiplicador: '' })
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-green-700">
                            {fatorEditando ? 'Editar Fator' : 'Novo Fator de Dificuldade'}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Nome *</Label>
                            <Input
                              value={novoFator.nome}
                              onChange={(e) => setNovoFator({...novoFator, nome: e.target.value})}
                              placeholder="Ex: Baixo"
                              className="border-green-200 focus:border-green-500 rounded-lg"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Descrição</Label>
                            <Input
                              value={novoFator.descricao}
                              onChange={(e) => setNovoFator({...novoFator, descricao: e.target.value})}
                              placeholder="Descrição do fator"
                              className="border-green-200 focus:border-green-500 rounded-lg"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Multiplicador *</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={novoFator.multiplicador}
                              onChange={(e) => setNovoFator({...novoFator, multiplicador: e.target.value})}
                              placeholder="Ex: 2.3"
                              className="border-green-200 focus:border-green-500 rounded-lg"
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              onClick={fatorEditando ? salvarEdicaoFator : adicionarFator}
                              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg"
                            >
                              {fatorEditando ? 'Salvar' : 'Adicionar'}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setShowFatorModal(false)
                                setFatorEditando(null)
                                setNovoFator({ nome: '', descricao: '', multiplicador: '' })
                              }}
                              className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {fatoresDificuldade.map(fator => (
                      <div key={fator.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium">{fator.nome} - {fator.multiplicador}x</p>
                          <p className="text-sm text-gray-500">{fator.descricao}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => editarFator(fator)}
                            className="border-green-200 text-green-600 hover:bg-green-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deletarFator(fator.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}