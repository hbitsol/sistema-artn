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
  dataSugerida?: string
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
  { id: '1', nome: 'João Silva', telefone: '(11) 99999-9999', email: 'joao@email.com', endereco: 'Rua A, 123', status: 'ativo', observacoes: 'Cliente preferencial' },
  { id: '2', nome: 'Maria Santos', telefone: '(11) 88888-8888', email: 'maria@email.com', endereco: 'Rua B, 456', status: 'lead', observacoes: 'Interessada em película automotiva' },
  { id: '3', nome: 'Pedro Costa', telefone: '(11) 77777-7777', email: 'pedro@email.com', endereco: 'Rua C, 789', status: 'ativo', observacoes: 'Projetos recorrentes' }
]

// Template padrão para proposta
const templatePropostaPadrao = `🎯 *PROPOSTA COMERCIAL - ARTN ENVELOPAMENTO*

👤 *Cliente:* {{CLIENTE_NOME}}
📋 *Projeto:* {{PROJETO_NOME}}
📅 *Data:* {{DATA_CRIACAO}}
📊 *Status:* {{STATUS_PROJETO}}

📝 *ITENS DO PROJETO:*

{{ITENS_LISTA}}

💰 *SUBTOTAL: {{SUBTOTAL}}*
{{DESCONTO_LINHA}}
💰 *VALOR TOTAL: {{VALOR_TOTAL}}*

❗ OBS.: Baseado em fotos enviadas/visita técnica no local. Não inclui serviços de marcenaria/marmoaria/alvenaria ou outros serviços que se façam necessários.

💰 Forma de pagamento: Entrada de 50% via Pix e o saldo parcelado em até 2x s/juros no cartão de crédito.
🕖 Proposta válida por 7 dias. Valores sujeitos a alterações.

📆 Agendamento sujeito a disponibilidade de data e horário.
🏡 Projeto e execução no local.

💰Valores para ABC e SP, outras regiões sob consulta.
_⚠ Caro cliente, valorize um bom profissional que estudou para levar a excelência para seu lar. Envelopar não é somente o preço da película, é técnica e dedicação._`

// Configurações do sistema
const niveisProfissionais = {
  'ajudante': { nome: 'Ajudante', descricao: 'Auxiliar de envelopamento', valorDia: 150 },
  'pleno': { nome: 'Pleno', descricao: 'Envelopador experiente', valorDia: 250 },
  'senior': { nome: 'Sênior', descricao: 'Envelopador especialista', valorDia: 380 }
}

const statusProjeto = {
  'orcamento': { nome: 'Orçamento', cor: 'bg-gray-100 text-gray-800' },
  'negociacao': { nome: 'Em Negociação', cor: 'bg-yellow-100 text-yellow-800' },
  'aprovado': { nome: 'Aprovado', cor: 'bg-green-100 text-green-800' },
  'rejeitado': { nome: 'Rejeitado', cor: 'bg-red-100 text-red-800' },
  'andamento': { nome: 'Em Andamento', cor: 'bg-blue-100 text-blue-800' },
  'finalizado': { nome: 'Finalizado', cor: 'bg-purple-100 text-purple-800' }
}

export default function SistemaPrecificacao() {
  // Estados principais
  const [activeTab, setActiveTab] = useState('dashboard')
  const [materiais, setMateriais] = useState<Material[]>(materiaisIniciais)
  const [fatoresDificuldade, setFatoresDificuldade] = useState<FatorDificuldade[]>(fatoresDificuldadeIniciais)
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciais)
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [templateProposta, setTemplateProposta] = useState(templatePropostaPadrao)
  
  // Estados da calculadora
  const [materialSelecionado, setMaterialSelecionado] = useState('')
  const [descricaoItem, setDescricaoItem] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [fatorDificuldadeSelecionado, setFatorDificuldadeSelecionado] = useState('')
  const [diasEstimados, setDiasEstimados] = useState('')
  const [quantidadeProfissionais, setQuantidadeProfissionais] = useState('')
  const [nivelProfissional, setNivelProfissional] = useState('')
  const [margemLucro, setMargemLucro] = useState('30')
  const [projetoSelecionado, setProjetoSelecionado] = useState('')
  const [nomeNovoProjeto, setNomeNovoProjeto] = useState('')
  const [clienteNovoProjeto, setClienteNovoProjeto] = useState('')
  
  // Estados dos formulários
  const [novoCliente, setNovoCliente] = useState({
    nome: '', telefone: '', email: '', endereco: '', status: 'lead' as const, observacoes: ''
  })
  
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)
  const [projetoEditando, setProjetoEditando] = useState<Projeto | null>(null)
  
  const [novoMaterial, setNovoMaterial] = useState({
    codigo: '', nome: '', descricao: '', precoUnitario: '', categoria: ''
  })
  
  const [novoFator, setNovoFator] = useState({
    nome: '', descricao: '', multiplicador: ''
  })

  // Estados de edição para configurações
  const [materialEditando, setMaterialEditando] = useState<Material | null>(null)
  const [fatorEditando, setFatorEditando] = useState<FatorDificuldade | null>(null)

  // Estados de modais
  const [showMaterialModal, setShowMaterialModal] = useState(false)
  const [showFatorModal, setShowFatorModal] = useState(false)
  const [showClienteModal, setShowClienteModal] = useState(false)
  const [showProjetoModal, setShowProjetoModal] = useState(false)

  // Carregar dados do Supabase na inicialização
  useEffect(() => {
    // Só carregar dados no lado do cliente
    if (typeof window !== 'undefined') {
      carregarDados()
    }
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
          dataEntrega: p.data_entrega ? new Date(p.data_entrega).toLocaleDateString('pt-BR') : undefined,
          dataSugerida: p.data_sugerida ? new Date(p.data_sugerida).toLocaleDateString('pt-BR') : undefined
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

  // Função para adicionar item ao projeto
  const adicionarItemProjeto = async () => {
    if (!resultado || !descricaoItem.trim()) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    const novoItem: ItemProjeto = {
      id: Date.now().toString(),
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
          id: Date.now().toString(),
          clienteId: clienteNovoProjeto,
          nome: nomeNovoProjeto,
          descricao: '',
          itens: [novoItem],
          valorTotal: novoItem.valorFinal,
          desconto: 0,
          status: 'orcamento',
          dataCreacao: new Date().toLocaleDateString('pt-BR'),
          dataSugerida: new Date(Date.now() + (parseInt(diasEstimados) * 24 * 60 * 60 * 1000)).toLocaleDateString('pt-BR')
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
          data_sugerida: new Date(Date.now() + (parseInt(diasEstimados) * 24 * 60 * 60 * 1000)).toISOString()
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
      id: Date.now().toString(),
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
        data_entrega: projetoEditando.dataEntrega ? new Date(projetoEditando.dataEntrega.split('/').reverse().join('-')).toISOString() : null
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

        if (supabaseClient) {
          // Deletar itens do projeto primeiro
          await supabaseClient.from('itens_projeto').delete().eq('projeto_id', projetoId)
        }
        
        // Deletar projeto
        await salvarNoSupabase('projetos', { id: projetoId }, 'delete')
        
        setProjetos(projetos.filter(p => p.id !== projetoId))
        toast.success('Projeto deletado com sucesso!')
      } catch (error) {
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
      id: Date.now().toString(),
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
      id: Date.now().toString(),
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

  // Função para gerar proposta para WhatsApp
  const gerarPropostaWhatsApp = (projeto: Projeto) => {
    const cliente = clientes.find(c => c.id === projeto.clienteId)
    const valorItens = projeto.itens.reduce((acc, item) => acc + item.valorFinal, 0)
    
    // Gerar lista de itens
    let itensLista = ''
    projeto.itens.forEach((item, index) => {
      itensLista += `*${index + 1}. ${item.descricao}*\\\\n   Valor: *${formatarMoeda(item.valorFinal)}*\\\\n\\\\n`
    })

    // Linha de desconto (se houver)
    let descontoLinha = ''
    if (projeto.desconto > 0) {
      descontoLinha = `🎯 *DESCONTO (${projeto.desconto}%): -${formatarMoeda(valorItens * projeto.desconto / 100)}*\\\\n`
    }

    // Substituir variáveis no template
    let proposta = templateProposta
      .replace('{{CLIENTE_NOME}}', cliente?.nome || 'N/A')
      .replace('{{PROJETO_NOME}}', projeto.nome)
      .replace('{{DATA_CRIACAO}}', projeto.dataCreacao)
      .replace('{{STATUS_PROJETO}}', statusProjeto[projeto.status].nome)
      .replace('{{ITENS_LISTA}}', itensLista.trim())
      .replace('{{SUBTOTAL}}', formatarMoeda(valorItens))
      .replace('{{DESCONTO_LINHA}}', descontoLinha)
      .replace('{{VALOR_TOTAL}}', formatarMoeda(projeto.valorTotal))

    // Substituir \\\\n por quebras de linha reais
    proposta = proposta.replace(/\\\\\\\\n/g, '\\n')

    return proposta
  }

  // Função para copiar proposta
  const copiarProposta = async (projeto: Projeto) => {
    const proposta = gerarPropostaWhatsApp(projeto)
    
    try {
      // Tentar usar a Clipboard API moderna primeiro
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(proposta)
        toast.success('Proposta copiada para a área de transferência!')
        return
      }
    } catch (clipboardError) {
      console.log('Clipboard API não disponível, usando método alternativo')
    }
    
    // Fallback: usar método de seleção de texto
    try {
      const textArea = document.createElement('textarea')
      textArea.value = proposta
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        toast.success('Proposta copiada para a área de transferência!')
        return
      }
    } catch (execCommandError) {
      console.log('execCommand não funcionou, mostrando modal')
    }
    
    // Se tudo falhar, mostrar modal com texto para cópia manual
    mostrarTextoParaCopia(proposta)
  }

  // Função para mostrar texto em modal para cópia manual
  const mostrarTextoParaCopia = (texto: string) => {
    // Criar modal simples para mostrar o texto
    const modal = document.createElement('div')
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `
    
    const content = document.createElement('div')
    content.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 90%;
      max-height: 80%;
      overflow: auto;
    `
    
    const title = document.createElement('h3')
    title.textContent = 'Copie o texto abaixo:'
    title.style.marginBottom = '10px'
    
    const textArea = document.createElement('textarea')
    textArea.value = texto
    textArea.style.cssText = `
      width: 100%;
      height: 300px;
      margin-bottom: 10px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
    `
    textArea.readOnly = true
    
    const closeButton = document.createElement('button')
    closeButton.textContent = 'Fechar'
    closeButton.style.cssText = `
      background: #007bff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    `
    
    closeButton.onclick = () => document.body.removeChild(modal)
    
    content.appendChild(title)
    content.appendChild(textArea)
    content.appendChild(closeButton)
    modal.appendChild(content)
    document.body.appendChild(modal)
    
    // Selecionar o texto automaticamente
    textArea.select()
    textArea.focus()
  }

  // Função para salvar template
  const salvarTemplate = () => {
    toast.success('Template de proposta atualizado com sucesso!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header com Logo */}
        <div className="mb-8 flex items-center gap-6 bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <img 
            src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/1d2c3491-878e-47c4-8fa1-214a5282302a.png" 
            alt="Logo Artn Envelopamento" 
            className="h-16 w-auto"
          />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Sistema de Precificação
            </h1>
            <p className="text-xl text-blue-600 font-medium">Artn Envelopamento - Gestão de Franquias</p>
          </div>
        </div>

        {/* Navegação */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-white rounded-xl shadow-md border border-blue-100 p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg transition-all">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="calculadora" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg transition-all">
              <Calculator className="w-4 h-4" />
              Calculadora
            </TabsTrigger>
            <TabsTrigger value="clientes" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg transition-all">
              <Users className="w-4 h-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="projetos" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg transition-all">
              <Package className="w-4 h-4" />
              Projetos
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg transition-all">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Cards de Métricas */}
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Clientes</p>
                      <p className="text-3xl font-bold">{clientes.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Projetos</p>
                      <p className="text-3xl font-bold">{projetos.length}</p>
                    </div>
                    <Package className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Clientes Ativos</p>
                      <p className="text-3xl font-bold">{clientes.filter(c => c.status === 'ativo').length}</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Pipeline Total</p>
                      <p className="text-3xl font-bold">
                        {formatarMoeda(projetos.reduce((acc, p) => acc + p.valorTotal, 0)).replace('R$', 'R$').replace(',00', '')}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos e Relatórios */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white shadow-lg border border-blue-100 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                  <CardTitle className="text-blue-700">Status dos Clientes</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {['lead', 'ativo', 'inativo'].map(status => {
                      const count = clientes.filter(c => c.status === status).length
                      const percentage = clientes.length > 0 ? (count / clientes.length) * 100 : 0
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <span className="capitalize font-medium text-gray-700">{status}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-blue-100 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-blue-600 w-8">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border border-blue-100 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                  <CardTitle className="text-blue-700">Status dos Projetos</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {Object.entries(statusProjeto).map(([key, status]) => {
                      const count = projetos.filter(p => p.status === key).length
                      const percentage = projetos.length > 0 ? (count / projetos.length) * 100 : 0
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">{status.nome}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-green-100 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-green-600 w-8">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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
                  {/* Descrição do Item */}
                  <div className="space-y-2">
                    <Label htmlFor="descricao" className="text-gray-700 font-medium">Descrição do Item *</Label>
                    <Textarea
                      id="descricao"
                      value={descricaoItem}
                      onChange={(e) => setDescricaoItem(e.target.value)}
                      placeholder="Ex: Envelopamento completo do capô com película premium"
                      rows={2}
                      className="border-blue-200 focus:border-blue-500 rounded-lg"
                    />
                  </div>

                  {/* Seleção de Material */}
                  <div className="space-y-2">
                    <Label htmlFor="material" className="text-gray-700 font-medium">Material *</Label>
                    <Select value={materialSelecionado} onValueChange={setMaterialSelecionado}>
                      <SelectTrigger className="border-blue-200 focus:border-blue-500 rounded-lg">
                        <SelectValue placeholder="Selecione um material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materiais.map(material => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.codigo} - {material.nome} ({formatarMoeda(material.precoUnitario)}/m²)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      placeholder="Ex: 10.5"
                      className="border-blue-200 focus:border-blue-500 rounded-lg"
                    />
                  </div>

                  {/* Fator de Dificuldade */}
                  <div className="space-y-2">
                    <Label htmlFor="dificuldade" className="text-gray-700 font-medium">Fator de Dificuldade *</Label>
                    <Select value={fatorDificuldadeSelecionado} onValueChange={setFatorDificuldadeSelecionado}>
                      <SelectTrigger className="border-blue-200 focus:border-blue-500 rounded-lg">
                        <SelectValue placeholder="Selecione a dificuldade" />
                      </SelectTrigger>
                      <SelectContent>
                        {fatoresDificuldade.map(fator => (
                          <SelectItem key={fator.id} value={fator.id}>
                            {fator.nome} ({fator.multiplicador}x) - {fator.descricao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Mão de Obra */}
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
              <Card className="bg-white shadow-lg border border-blue-100 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                  <CardTitle className="text-blue-700">Resultado da Precificação</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {resultado ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                        <h3 className="font-semibold text-lg mb-2 text-blue-800">{resultado.material}</h3>
                        <p className="text-sm text-blue-600 mb-4">Fator: {resultado.fator}</p>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-700">Custo Material:</span>
                            <span className="font-medium">{formatarMoeda(resultado.custoMaterial)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Custo Mão de Obra:</span>
                            <span className="font-medium">{formatarMoeda(resultado.custoMaoObra)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-medium">
                            <span className="text-gray-700">Subtotal:</span>
                            <span>{formatarMoeda(resultado.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Impostos (7%):</span>
                            <span className="font-medium">{formatarMoeda(resultado.impostos)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Base:</span>
                            <span className="font-medium">{formatarMoeda(resultado.base)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Margem de Lucro ({margemLucro}%):</span>
                            <span className="font-medium">{formatarMoeda(resultado.margemLucro)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between text-xl font-bold text-green-600 bg-green-50 p-3 rounded-lg">
                            <span>PREÇO FINAL:</span>
                            <span>{formatarMoeda(resultado.valorFinal)}</span>
                          </div>
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
                    <Select value={novoCliente.status} onValueChange={(value: 'lead' | 'ativo' | 'inativo') => setNovoCliente({...novoCliente, status: value})}>
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
                <Card className="bg-white shadow-lg border border-blue-100 rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-blue-700">
                        <Users className="w-5 h-5" />
                        Clientes ({clientes.length})
                      </span>
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-blue-500" />
                        <Input placeholder="Buscar cliente..." className="w-64 border-blue-200 focus:border-blue-500 rounded-lg" />
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {clientes.map(cliente => (
                        <div key={cliente.id} className="border border-blue-100 rounded-xl p-4 hover:bg-blue-50 transition-all duration-200 hover:shadow-md">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-800">{cliente.nome}</h3>
                                <Badge 
                                  variant={cliente.status === 'ativo' ? 'default' : cliente.status === 'lead' ? 'secondary' : 'outline'}
                                  className={cliente.status === 'ativo' ? 'bg-green-100 text-green-800' : cliente.status === 'lead' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}
                                >
                                  {cliente.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>📞 {cliente.telefone}</p>
                                {cliente.email && <p>✉️ {cliente.email}</p>}
                                {cliente.endereco && <p>📍 {cliente.endereco}</p>}
                                {cliente.observacoes && <p>💬 {cliente.observacoes}</p>}
                              </div>
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
                        Salvar Alterações
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowClienteModal(false)}
                        className="border-gray-300 rounded-lg"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Projetos */}
          <TabsContent value="projetos">
            <div className="space-y-6">
              {projetos.length > 0 ? (
                projetos.map(projeto => {
                  const cliente = clientes.find(c => c.id === projeto.clienteId)
                  const valorItens = projeto.itens.reduce((acc, item) => acc + item.valorFinal, 0)
                  return (
                    <Card key={projeto.id} className="bg-white shadow-lg border border-blue-100 rounded-2xl">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-blue-700">
                              <Package className="w-5 h-5" />
                              {projeto.nome}
                            </CardTitle>
                            <p className="text-sm text-blue-600 mt-1">
                              Cliente: {cliente?.nome} | Criado em: {projeto.dataCreacao}
                              {projeto.dataSugerida && ` | Data Sugerida: ${projeto.dataSugerida}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={statusProjeto[projeto.status].cor}>
                              {statusProjeto[projeto.status].nome}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => editarProjeto(projeto)}
                              className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => deletarProjeto(projeto.id)}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copiarProposta(projeto)}
                              className="border-green-200 text-green-600 hover:bg-green-50"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Proposta
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Itens do Projeto */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-700">Itens do Projeto:</h4>
                            {projeto.itens.map((item, index) => {
                              const material = materiais.find(m => m.id === item.materialId)
                              const fator = fatoresDificuldade.find(f => f.id === item.fatorDificuldadeId)
                              return (
                                <div key={item.id} className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-blue-100">
                                  <div className="flex justify-between items-start mb-3">
                                    <h5 className="font-medium text-gray-800">{index + 1}. {item.descricao}</h5>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-green-600 text-lg">
                                        {formatarMoeda(item.valorFinal)}
                                      </span>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => deletarItemProjeto(projeto.id, item.id)}
                                        className="border-red-200 text-red-600 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  {/* Dados completos do item */}
                                  <div className="text-sm text-gray-600 grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div><strong>Material:</strong> {material?.nome}</div>
                                    <div><strong>Qtd Material:</strong> {item.quantidade} m²</div>
                                    <div><strong>Duração:</strong> {item.diasEstimados} dias</div>
                                    <div><strong>Envelopadores:</strong> {item.quantidadeProfissionais}</div>
                                    <div><strong>Nível:</strong> {niveisProfissionais[item.nivelProfissional as keyof typeof niveisProfissionais]?.nome}</div>
                                    <div><strong>Fator:</strong> {fator?.nome} ({fator?.multiplicador}x)</div>
                                    <div><strong>Margem:</strong> {item.margemLucro}%</div>
                                    <div><strong>Status:</strong> {statusProjeto[projeto.status].nome}</div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          
                          {/* Total do Projeto */}
                          <div className="border-t border-blue-200 pt-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Subtotal dos Itens:</span>
                                <span className="font-medium">{formatarMoeda(valorItens)}</span>
                              </div>
                              {projeto.desconto > 0 && (
                                <div className="flex justify-between items-center text-red-600">
                                  <span>Desconto ({projeto.desconto}%):</span>
                                  <span>-{formatarMoeda(valorItens * projeto.desconto / 100)}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center text-xl font-bold bg-green-50 p-3 rounded-lg">
                                <span className="text-gray-800">VALOR TOTAL DO PROJETO:</span>
                                <span className="text-green-600">{formatarMoeda(projeto.valorTotal)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <Card className="bg-white shadow-lg border border-blue-100 rounded-2xl">
                  <CardContent className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50 text-blue-400" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum projeto criado</h3>
                    <p className="text-gray-500 mb-4">Use a calculadora para criar seu primeiro projeto</p>
                    <Button 
                      onClick={() => setActiveTab('calculadora')}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg"
                    >
                      Ir para Calculadora
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Modal de Edição de Projeto */}
            <Dialog open={showProjetoModal} onOpenChange={setShowProjetoModal}>
              <DialogContent className="max-w-2xl bg-white rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-blue-700">Editar Projeto</DialogTitle>
                </DialogHeader>
                {projetoEditando && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Nome do Projeto</Label>
                        <Input
                          value={projetoEditando.nome}
                          onChange={(e) => setProjetoEditando({...projetoEditando, nome: e.target.value})}
                          placeholder="Nome do projeto"
                          className="border-blue-200 focus:border-blue-500 rounded-lg"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Status</Label>
                        <Select 
                          value={projetoEditando.status} 
                          onValueChange={(value: any) => setProjetoEditando({...projetoEditando, status: value})}
                        >
                          <SelectTrigger className="border-blue-200 focus:border-blue-500 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="orcamento">Orçamento</SelectItem>
                            <SelectItem value="negociacao">Em Negociação</SelectItem>
                            <SelectItem value="aprovado">Aprovado</SelectItem>
                            <SelectItem value="rejeitado">Rejeitado</SelectItem>
                            <SelectItem value="andamento">Em Andamento</SelectItem>
                            <SelectItem value="finalizado">Finalizado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Descrição</Label>
                      <Textarea
                        value={projetoEditando.descricao}
                        onChange={(e) => setProjetoEditando({...projetoEditando, descricao: e.target.value})}
                        placeholder="Descrição do projeto"
                        rows={3}
                        className="border-blue-200 focus:border-blue-500 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Desconto (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={projetoEditando.desconto}
                          onChange={(e) => setProjetoEditando({...projetoEditando, desconto: parseFloat(e.target.value) || 0})}
                          placeholder="0"
                          className="border-blue-200 focus:border-blue-500 rounded-lg"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Data de Entrega</Label>
                        <Input
                          type="date"
                          value={projetoEditando.dataEntrega || ''}
                          onChange={(e) => setProjetoEditando({...projetoEditando, dataEntrega: e.target.value})}
                          className="border-blue-200 focus:border-blue-500 rounded-lg"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={salvarEdicaoProjeto} 
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg"
                      >
                        Salvar Alterações
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowProjetoModal(false)}
                        className="border-gray-300 rounded-lg"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="configuracoes">
            <div className="space-y-8">
              {/* Template de Proposta Editável */}
              <Card className="bg-white shadow-lg border border-blue-100 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-blue-700">
                      <FileText className="w-5 h-5" />
                      Template de Proposta para WhatsApp
                    </span>
                    <Button 
                      onClick={salvarTemplate} 
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Salvar Template
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">📝 Variáveis Disponíveis:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                        <div><code>{'{{CLIENTE_NOME}}'}</code> - Nome do cliente</div>
                        <div><code>{'{{PROJETO_NOME}}'}</code> - Nome do projeto</div>
                        <div><code>{'{{DATA_CRIACAO}}'}</code> - Data de criação</div>
                        <div><code>{'{{STATUS_PROJETO}}'}</code> - Status atual</div>
                        <div><code>{'{{ITENS_LISTA}}'}</code> - Lista de itens formatada</div>
                        <div><code>{'{{SUBTOTAL}}'}</code> - Valor subtotal</div>
                        <div><code>{'{{DESCONTO_LINHA}}'}</code> - Linha de desconto (se houver)</div>
                        <div><code>{'{{VALOR_TOTAL}}'}</code> - Valor total final</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Template da Proposta</Label>
                      <Textarea
                        value={templateProposta}
                        onChange={(e) => setTemplateProposta(e.target.value)}
                        placeholder="Digite seu template personalizado..."
                        rows={15}
                        className="font-mono text-sm border-blue-200 focus:border-blue-500 rounded-lg"
                      />
                    </div>
                    
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-800">
                        <strong>💡 Dica:</strong> Use as variáveis entre chaves duplas para inserir dados dinâmicos. 
                        O template será aplicado automaticamente quando você copiar uma proposta.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gestão de Materiais e Fatores */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gestão de Materiais */}
                <Card className="bg-white shadow-lg border border-blue-100 rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-blue-700">
                        <Package className="w-5 h-5" />
                        Materiais ({materiais.length})
                      </span>
                      <Dialog open={showMaterialModal} onOpenChange={setShowMaterialModal}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setMaterialEditando(null)
                              setNovoMaterial({ codigo: '', nome: '', descricao: '', precoUnitario: '', categoria: '' })
                            }}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Material
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white rounded-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-blue-700">{materialEditando ? 'Editar Material' : 'Novo Material'}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-gray-700 font-medium">Código *</Label>
                              <Input
                                value={novoMaterial.codigo}
                                onChange={(e) => setNovoMaterial({...novoMaterial, codigo: e.target.value})}
                                placeholder="ENV001"
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
                              <Textarea
                                value={novoMaterial.descricao}
                                onChange={(e) => setNovoMaterial({...novoMaterial, descricao: e.target.value})}
                                placeholder="Descrição detalhada"
                                className="border-blue-200 focus:border-blue-500 rounded-lg"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-gray-700 font-medium">Preço Unitário (R$) *</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={novoMaterial.precoUnitario}
                                onChange={(e) => setNovoMaterial({...novoMaterial, precoUnitario: e.target.value})}
                                placeholder="45.00"
                                className="border-blue-200 focus:border-blue-500 rounded-lg"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-gray-700 font-medium">Categoria</Label>
                              <Input
                                value={novoMaterial.categoria}
                                onChange={(e) => setNovoMaterial({...novoMaterial, categoria: e.target.value})}
                                placeholder="Automotivo"
                                className="border-blue-200 focus:border-blue-500 rounded-lg"
                              />
                            </div>
                            <Button 
                              onClick={materialEditando ? salvarEdicaoMaterial : adicionarMaterial} 
                              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg"
                            >
                              {materialEditando ? 'Salvar Alterações' : 'Adicionar Material'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {materiais.map(material => (
                        <div key={material.id} className="border border-blue-100 rounded-lg p-3 hover:bg-blue-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{material.codigo} - {material.nome}</h4>
                              <p className="text-sm text-gray-600">{material.descricao}</p>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm font-medium text-green-600">
                                  {formatarMoeda(material.precoUnitario)}/m²
                                </span>
                                <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
                                  {material.categoria}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => editarMaterial(material)}
                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => deletarMaterial(material.id)}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Gestão de Fatores de Dificuldade */}
                <Card className="bg-white shadow-lg border border-blue-100 rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-blue-700">
                        <Settings className="w-5 h-5" />
                        Fatores de Dificuldade ({fatoresDificuldade.length})
                      </span>
                      <Dialog open={showFatorModal} onOpenChange={setShowFatorModal}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setFatorEditando(null)
                              setNovoFator({ nome: '', descricao: '', multiplicador: '' })
                            }}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Fator
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white rounded-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-blue-700">{fatorEditando ? 'Editar Fator de Dificuldade' : 'Novo Fator de Dificuldade'}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-gray-700 font-medium">Nome *</Label>
                              <Input
                                value={novoFator.nome}
                                onChange={(e) => setNovoFator({...novoFator, nome: e.target.value})}
                                placeholder="Extremo"
                                className="border-blue-200 focus:border-blue-500 rounded-lg"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-gray-700 font-medium">Descrição</Label>
                              <Textarea
                                value={novoFator.descricao}
                                onChange={(e) => setNovoFator({...novoFator, descricao: e.target.value})}
                                placeholder="Descrição da dificuldade"
                                className="border-blue-200 focus:border-blue-500 rounded-lg"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-gray-700 font-medium">Multiplicador *</Label>
                              <Input
                                type="number"
                                step="0.1"
                                value={novoFator.multiplicador}
                                onChange={(e) => setNovoFator({...novoFator, multiplicador: e.target.value})}
                                placeholder="3.5"
                                className="border-blue-200 focus:border-blue-500 rounded-lg"
                              />
                            </div>
                            <Button 
                              onClick={fatorEditando ? salvarEdicaoFator : adicionarFator} 
                              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg"
                            >
                              {fatorEditando ? 'Salvar Alterações' : 'Adicionar Fator'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {fatoresDificuldade.map(fator => (
                        <div key={fator.id} className="border border-blue-100 rounded-lg p-3 hover:bg-blue-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{fator.nome}</h4>
                              <p className="text-sm text-gray-600">{fator.descricao}</p>
                              <span className="text-sm font-medium text-blue-600">
                                Multiplicador: {fator.multiplicador}x
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => editarFator(fator)}
                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => deletarFator(fator.id)}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3" />
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}