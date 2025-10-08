"use client"

import { useState } from 'react'
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
import { Calculator, Users, BarChart3, Package, Plus, Search, Edit, Trash2, Copy, Settings, FileText, AlertTriangle, Database, Code } from 'lucide-react'
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

✅ Garantia de qualidade
✅ Profissionais especializados
✅ Materiais premium

📞 Entre em contato para mais informações!`

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
  const [itemEditando, setItemEditando] = useState<ItemProjeto | null>(null)
  
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
  const [showItemModal, setShowItemModal] = useState(false)
  const [showPropostaModal, setShowPropostaModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [projetoProposta, setProjetoProposta] = useState<Projeto | null>(null)

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
    const maxTentativas = 1000 // Evitar loop infinito
    
    while (calcularSomaDigitos(valorAjustado) !== 8 && tentativas < maxTentativas) {
      const somaAtual = calcularSomaDigitos(valorAjustado)
      
      if (somaAtual < 8) {
        // Se a soma é menor que 8, aumentar ligeiramente o valor
        valorAjustado += 0.01
      } else {
        // Se a soma é maior que 8, diminuir ligeiramente o valor
        valorAjustado -= 0.01
      }
      
      tentativas++
    }
    
    // Se não conseguiu ajustar, fazer um ajuste mais direto
    if (calcularSomaDigitos(valorAjustado) !== 8) {
      const valorString = valorAjustado.toFixed(2).replace('.', '')
      const digitos = valorString.split('').map(d => parseInt(d))
      const somaAtual = digitos.reduce((acc, d) => acc + d, 0)
      
      if (somaAtual !== 8) {
        // Ajustar o último dígito para fazer a soma dar 8
        const diferenca = 8 - (somaAtual % 9 || 9)
        const ultimoDigito = digitos[digitos.length - 1]
        const novoUltimoDigito = (ultimoDigito + diferenca) % 10
        
        digitos[digitos.length - 1] = novoUltimoDigito
        const novoValorString = digitos.join('')
        valorAjustado = parseFloat(novoValorString.slice(0, -2) + '.' + novoValorString.slice(-2))
      }
    }
    
    return Math.max(valorAjustado, 0.01) // Garantir que o valor seja positivo
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
  const adicionarItemProjeto = () => {
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

    if (projetoSelecionado) {
      // Adicionar a projeto existente
      setProjetos(projetos.map(p => {
        if (p.id === projetoSelecionado) {
          const novosItens = [...p.itens, novoItem]
          const valorTotal = novosItens.reduce((acc, item) => acc + item.valorFinal, 0)
          return {
            ...p,
            itens: novosItens,
            valorTotal: valorTotal - (valorTotal * p.desconto / 100)
          }
        }
        return p
      }))
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
        dataCreacao: new Date().toLocaleDateString('pt-BR')
      }
      setProjetos([...projetos, novoProjeto])
      toast.success('Projeto criado com sucesso!')
    } else {
      toast.error('Selecione um projeto existente ou preencha os dados para criar um novo')
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
  const adicionarCliente = () => {
    if (!novoCliente.nome || !novoCliente.telefone) {
      toast.error('Nome e telefone são obrigatórios')
      return
    }

    const cliente: Cliente = {
      id: Date.now().toString(),
      ...novoCliente
    }

    setClientes([...clientes, cliente])
    setNovoCliente({ nome: '', telefone: '', email: '', endereco: '', status: 'lead', observacoes: '' })
    toast.success('Cliente criado com sucesso!')
  }

  // Função para editar cliente
  const editarCliente = (cliente: Cliente) => {
    setClienteEditando(cliente)
    setShowClienteModal(true)
  }

  // Função para salvar edição do cliente
  const salvarEdicaoCliente = () => {
    if (!clienteEditando || !clienteEditando.nome || !clienteEditando.telefone) {
      toast.error('Nome e telefone são obrigatórios')
      return
    }

    setClientes(clientes.map(c => c.id === clienteEditando.id ? clienteEditando : c))
    setClienteEditando(null)
    setShowClienteModal(false)
    toast.success('Cliente atualizado com sucesso!')
  }

  // Função para deletar cliente
  const deletarCliente = (clienteId: string) => {
    // Verificar se cliente tem projetos
    const temProjetos = projetos.some(p => p.clienteId === clienteId)
    if (temProjetos) {
      toast.error('Não é possível deletar cliente com projetos associados')
      return
    }

    if (confirm('Tem certeza que deseja deletar este cliente?')) {
      setClientes(clientes.filter(c => c.id !== clienteId))
      toast.success('Cliente deletado com sucesso!')
    }
  }

  // Função para editar projeto
  const editarProjeto = (projeto: Projeto) => {
    setProjetoEditando(projeto)
    setShowProjetoModal(true)
  }

  // Função para salvar edição do projeto
  const salvarEdicaoProjeto = () => {
    if (!projetoEditando) return

    const valorItens = projetoEditando.itens.reduce((acc, item) => acc + item.valorFinal, 0)
    const valorComDesconto = valorItens - (valorItens * projetoEditando.desconto / 100)

    setProjetos(projetos.map(p => p.id === projetoEditando.id ? {
      ...projetoEditando,
      valorTotal: valorComDesconto
    } : p))
    
    setProjetoEditando(null)
    setShowProjetoModal(false)
    toast.success('Projeto atualizado com sucesso!')
  }

  // Função para deletar projeto
  const deletarProjeto = (projetoId: string) => {
    if (confirm('Tem certeza que deseja deletar este projeto?')) {
      setProjetos(projetos.filter(p => p.id !== projetoId))
      toast.success('Projeto deletado com sucesso!')
    }
  }

  // Função para deletar item do projeto
  const deletarItemProjeto = (projetoId: string, itemId: string) => {
    if (confirm('Tem certeza que deseja deletar este item?')) {
      setProjetos(projetos.map(p => {
        if (p.id === projetoId) {
          const novosItens = p.itens.filter(i => i.id !== itemId)
          const valorItens = novosItens.reduce((acc, item) => acc + item.valorFinal, 0)
          const valorComDesconto = valorItens - (valorItens * p.desconto / 100)
          return {
            ...p,
            itens: novosItens,
            valorTotal: valorComDesconto
          }
        }
        return p
      }))
      toast.success('Item deletado com sucesso!')
    }
  }

  // Função para adicionar material
  const adicionarMaterial = () => {
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

    setMateriais([...materiais, material])
    setNovoMaterial({ codigo: '', nome: '', descricao: '', precoUnitario: '', categoria: '' })
    setShowMaterialModal(false)
    toast.success('Material adicionado com sucesso!')
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
  const salvarEdicaoMaterial = () => {
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

    setMateriais(materiais.map(m => m.id === materialEditando.id ? materialAtualizado : m))
    setMaterialEditando(null)
    setNovoMaterial({ codigo: '', nome: '', descricao: '', precoUnitario: '', categoria: '' })
    setShowMaterialModal(false)
    toast.success('Material atualizado com sucesso!')
  }

  // Função para deletar material
  const deletarMaterial = (materialId: string) => {
    // Verificar se material está sendo usado em projetos
    const emUso = projetos.some(p => p.itens.some(i => i.materialId === materialId))
    if (emUso) {
      toast.error('Não é possível deletar material que está sendo usado em projetos')
      return
    }

    if (confirm('Tem certeza que deseja deletar este material?')) {
      setMateriais(materiais.filter(m => m.id !== materialId))
      toast.success('Material deletado com sucesso!')
    }
  }

  // Função para adicionar fator de dificuldade
  const adicionarFator = () => {
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

    setFatoresDificuldade([...fatoresDificuldade, fator])
    setNovoFator({ nome: '', descricao: '', multiplicador: '' })
    setShowFatorModal(false)
    toast.success('Fator de dificuldade adicionado com sucesso!')
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
  const salvarEdicaoFator = () => {
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

    setFatoresDificuldade(fatoresDificuldade.map(f => f.id === fatorEditando.id ? fatorAtualizado : f))
    setFatorEditando(null)
    setNovoFator({ nome: '', descricao: '', multiplicador: '' })
    setShowFatorModal(false)
    toast.success('Fator de dificuldade atualizado com sucesso!')
  }

  // Função para deletar fator de dificuldade
  const deletarFator = (fatorId: string) => {
    // Verificar se fator está sendo usado em projetos
    const emUso = projetos.some(p => p.itens.some(i => i.fatorDificuldadeId === fatorId))
    if (emUso) {
      toast.error('Não é possível deletar fator que está sendo usado em projetos')
      return
    }

    if (confirm('Tem certeza que deseja deletar este fator de dificuldade?')) {
      setFatoresDificuldade(fatoresDificuldade.filter(f => f.id !== fatorId))
      toast.success('Fator de dificuldade deletado com sucesso!')
    }
  }

  // Função para gerar proposta para WhatsApp
  const gerarPropostaWhatsApp = (projeto: Projeto) => {
    const cliente = clientes.find(c => c.id === projeto.clienteId)
    const valorItens = projeto.itens.reduce((acc, item) => acc + item.valorFinal, 0)
    
    // Gerar lista de itens
    let itensLista = ''
    projeto.itens.forEach((item, index) => {
      const material = materiais.find(m => m.id === item.materialId)
      itensLista += `*${index + 1}. ${item.descricao}*\n   Material: ${material?.nome}\n   Valor: *${formatarMoeda(item.valorFinal)}*\n\n`
    })

    // Linha de desconto (se houver)
    let descontoLinha = ''
    if (projeto.desconto > 0) {
      descontoLinha = `🎯 *DESCONTO (${projeto.desconto}%): -${formatarMoeda(valorItens * projeto.desconto / 100)}*\n`
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

    // Substituir \n por quebras de linha reais
    proposta = proposta.replace(/\\n/g, '\n')

    return proposta
  }

  // Função para copiar proposta
  const copiarProposta = (projeto: Projeto) => {
    const proposta = gerarPropostaWhatsApp(projeto)
    
    // Tentar usar a Clipboard API moderna primeiro
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(proposta).then(() => {
        toast.success('Proposta copiada para a área de transferência!')
      }).catch(() => {
        // Fallback para método alternativo
        copiarTextoFallback(proposta)
      })
    } else {
      // Fallback para navegadores que não suportam ou ambientes não seguros
      copiarTextoFallback(proposta)
    }
  }

  // Função alternativa para copiar texto
  const copiarTextoFallback = (texto: string) => {
    try {
      // Criar elemento temporário
      const textArea = document.createElement('textarea')
      textArea.value = texto
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      // Tentar copiar usando execCommand (método legado)
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        toast.success('Proposta copiada para a área de transferência!')
      } else {
        // Se tudo falhar, mostrar o texto para cópia manual
        mostrarTextoParaCopia(texto)
      }
    } catch (err) {
      // Se tudo falhar, mostrar o texto para cópia manual
      mostrarTextoParaCopia(texto)
    }
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

  // Template do sistema para copiar
  const templateSistema = `# Sistema de Precificação - Artn Envelopamento

## Estrutura de Dados

### Materiais
- ID, Código, Nome, Descrição, Preço Unitário, Categoria

### Fatores de Dificuldade
- ID, Nome, Descrição, Multiplicador (2.3x - 3.3x)

### Clientes
- ID, Nome, Telefone, Email, Endereço, Status (lead/ativo/inativo), Observações

### Projetos
- ID, Cliente ID, Nome, Descrição, Itens[], Valor Total, Desconto, Status, Data Criação, Data Entrega

### Itens do Projeto
- ID, Material ID, Descrição, Quantidade, Fator Dificuldade ID, Dias Estimados, Quantidade Profissionais, Nível Profissional, Margem Lucro, Custos Calculados

## Regras de Negócio

### Cálculo de Precificação
1. Custo Material = Quantidade × Preço Unitário × Fator Dificuldade
2. Custo Mão de Obra = Dias × Quantidade Profissionais × Valor Diário
3. Subtotal = Custo Material + Custo Mão de Obra
4. Impostos = Subtotal × 7%
5. Base = Subtotal + Impostos
6. Preço Final = Base × (1 + Margem de Lucro)
7. **REGRA ESPECIAL**: Ajustar preço final para que soma dos dígitos = 8

### Níveis Profissionais
- Ajudante: R$ 150/dia
- Pleno: R$ 250/dia
- Sênior: R$ 380/dia

### Margem de Lucro
- Mínima: 15%
- Máxima: 100%

### Status do Projeto
- Orçamento, Em Negociação, Aprovado, Rejeitado, Em Andamento, Finalizado

## Funcionalidades

### Calculadora
- Seleção de material e fator de dificuldade
- Cálculo automático com regra numerológica (soma = 8)
- Associação a projeto existente ou criação de novo

### CRM
- CRUD completo de clientes
- Proteção contra deleção de clientes com projetos
- Pipeline de vendas

### Gestão de Projetos
- Múltiplos itens por projeto
- Sistema de desconto
- Geração de proposta para WhatsApp
- Controle de status

### Dashboard
- Métricas de clientes e projetos
- Gráficos de status
- Informações sobre armazenamento

## Tecnologias
- Next.js 15 + React 19
- TypeScript
- Tailwind CSS v4
- Shadcn/ui
- Sonner (toasts)
- Lucide Icons

## Armazenamento
- Atual: localStorage (dados locais)
- Futuro: Banco de dados na nuvem (Supabase recomendado)
`

  // Função para copiar template
  const copiarTemplate = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(templateSistema).then(() => {
        toast.success('Template copiado para a área de transferência!')
      }).catch(() => {
        copiarTextoFallback(templateSistema)
      })
    } else {
      copiarTextoFallback(templateSistema)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header com Logo */}
        <div className="mb-8 flex items-center gap-6">
          <img 
            src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/1d2c3491-878e-47c4-8fa1-214a5282302a.png" 
            alt="Logo Artn Envelopamento" 
            className="h-16 w-auto"
          />
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Sistema de Precificação</h1>
            <p className="text-xl text-gray-600">Artn Envelopamento - Gestão de Franquias</p>
          </div>
        </div>

        {/* Navegação */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="calculadora" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Calculadora
            </TabsTrigger>
            <TabsTrigger value="clientes" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="projetos" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Projetos
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Cards de Métricas */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Clientes</p>
                      <p className="text-3xl font-bold">{clientes.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Projetos</p>
                      <p className="text-3xl font-bold">{projetos.length}</p>
                    </div>
                    <Package className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Clientes Ativos</p>
                      <p className="text-3xl font-bold">{clientes.filter(c => c.status === 'ativo').length}</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pipeline Total</p>
                      <p className="text-3xl font-bold">
                        {formatarMoeda(projetos.reduce((acc, p) => acc + p.valorTotal, 0)).replace('R$', 'R$').replace(',00', '')}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos e Relatórios */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['lead', 'ativo', 'inativo'].map(status => {
                      const count = clientes.filter(c => c.status === status).length
                      const percentage = clientes.length > 0 ? (count / clientes.length) * 100 : 0
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <span className="capitalize">{status}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status dos Projetos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(statusProjeto).map(([key, status]) => {
                      const count = projetos.filter(p => p.status === key).length
                      const percentage = projetos.length > 0 ? (count / projetos.length) * 100 : 0
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <span>{status.nome}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Informação sobre dados */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Sobre o Armazenamento de Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-amber-800 mb-2">
                    <strong>Dados Locais:</strong> Atualmente, todos os dados (clientes, projetos, materiais) são salvos localmente no seu navegador.
                  </p>
                  <p className="text-sm text-amber-800 mb-2">
                    <strong>Ao publicar o app:</strong> Os dados poderão ser migrados para um banco de dados na nuvem (como Supabase) para acesso de qualquer dispositivo e backup automático.
                  </p>
                  <p className="text-sm text-amber-800">
                    <strong>Recomendação:</strong> Faça backup regular dos seus dados importantes até a implementação do banco de dados definitivo.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calculadora de Preços */}
          <TabsContent value="calculadora">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Formulário de Cálculo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Calculadora de Preços
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Descrição do Item */}
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição do Item *</Label>
                    <Textarea
                      id="descricao"
                      value={descricaoItem}
                      onChange={(e) => setDescricaoItem(e.target.value)}
                      placeholder="Ex: Envelopamento completo do capô com película premium"
                      rows={2}
                    />
                  </div>

                  {/* Seleção de Material */}
                  <div className="space-y-2">
                    <Label htmlFor="material">Material *</Label>
                    <Select value={materialSelecionado} onValueChange={setMaterialSelecionado}>
                      <SelectTrigger>
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
                    <Label htmlFor="quantidade">Quantidade (m²) *</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      step="0.01"
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value)}
                      placeholder="Ex: 10.5"
                    />
                  </div>

                  {/* Fator de Dificuldade */}
                  <div className="space-y-2">
                    <Label htmlFor="dificuldade">Fator de Dificuldade *</Label>
                    <Select value={fatorDificuldadeSelecionado} onValueChange={setFatorDificuldadeSelecionado}>
                      <SelectTrigger>
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
                      <Label htmlFor="dias">Dias Estimados *</Label>
                      <Input
                        id="dias"
                        type="number"
                        value={diasEstimados}
                        onChange={(e) => setDiasEstimados(e.target.value)}
                        placeholder="Ex: 3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profissionais">Nº Profissionais *</Label>
                      <Input
                        id="profissionais"
                        type="number"
                        value={quantidadeProfissionais}
                        onChange={(e) => setQuantidadeProfissionais(e.target.value)}
                        placeholder="Ex: 2"
                      />
                    </div>
                  </div>

                  {/* Nível Profissional */}
                  <div className="space-y-2">
                    <Label htmlFor="nivel">Nível Profissional *</Label>
                    <Select value={nivelProfissional} onValueChange={setNivelProfissional}>
                      <SelectTrigger>
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
                    <Label htmlFor="margem">Margem de Lucro (%)</Label>
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
                      <span className="font-semibold text-lg w-12">{margemLucro}%</span>
                    </div>
                    <p className="text-sm text-gray-500">Faixa permitida: 15% - 100%</p>
                  </div>

                  {/* Projeto */}
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="font-semibold">Associar a Projeto</h3>
                    
                    {/* Projeto Existente */}
                    <div className="space-y-2">
                      <Label htmlFor="projeto-existente">Projeto Existente</Label>
                      <Select value={projetoSelecionado} onValueChange={setProjetoSelecionado}>
                        <SelectTrigger>
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
                        <Label htmlFor="nome-projeto">Nome do Novo Projeto</Label>
                        <Input
                          id="nome-projeto"
                          value={nomeNovoProjeto}
                          onChange={(e) => setNomeNovoProjeto(e.target.value)}
                          placeholder="Ex: Envelopamento Veículo João"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cliente-projeto">Cliente</Label>
                        <Select value={clienteNovoProjeto} onValueChange={setClienteNovoProjeto}>
                          <SelectTrigger>
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
              <Card>
                <CardHeader>
                  <CardTitle>Resultado da Precificação</CardTitle>
                </CardHeader>
                <CardContent>
                  {resultado ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">{resultado.material}</h3>
                        <p className="text-sm text-gray-600 mb-4">Fator: {resultado.fator}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Custo Material:</span>
                            <span>{formatarMoeda(resultado.custoMaterial)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Custo Mão de Obra:</span>
                            <span>{formatarMoeda(resultado.custoMaoObra)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-medium">
                            <span>Subtotal:</span>
                            <span>{formatarMoeda(resultado.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Impostos (7%):</span>
                            <span>{formatarMoeda(resultado.impostos)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Base:</span>
                            <span>{formatarMoeda(resultado.base)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Margem de Lucro ({margemLucro}%):</span>
                            <span>{formatarMoeda(resultado.margemLucro)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between text-xl font-bold text-green-600">
                            <span>PREÇO FINAL:</span>
                            <span>{formatarMoeda(resultado.valorFinal)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-purple-600 bg-purple-50 p-2 rounded">
                            <span>✨ Soma dos dígitos:</span>
                            <span>{resultado.somaDigitos} (Regra numerológica aplicada)</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button onClick={adicionarItemProjeto} className="w-full" size="lg">
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Novo Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={novoCliente.nome}
                      onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})}
                      placeholder="Nome completo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      value={novoCliente.telefone}
                      onChange={(e) => setNovoCliente({...novoCliente, telefone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={novoCliente.email}
                      onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={novoCliente.endereco}
                      onChange={(e) => setNovoCliente({...novoCliente, endereco: e.target.value})}
                      placeholder="Endereço completo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={novoCliente.status} onValueChange={(value: 'lead' | 'ativo' | 'inativo') => setNovoCliente({...novoCliente, status: value})}>
                      <SelectTrigger>
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
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={novoCliente.observacoes}
                      onChange={(e) => setNovoCliente({...novoCliente, observacoes: e.target.value})}
                      placeholder="Observações sobre o cliente"
                    />
                  </div>
                  
                  <Button onClick={adicionarCliente} className="w-full">
                    Adicionar Cliente
                  </Button>
                </CardContent>
              </Card>

              {/* Lista de Clientes */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Clientes ({clientes.length})
                      </span>
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        <Input placeholder="Buscar cliente..." className="w-64" />
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {clientes.map(cliente => (
                        <div key={cliente.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{cliente.nome}</h3>
                                <Badge variant={cliente.status === 'ativo' ? 'default' : cliente.status === 'lead' ? 'secondary' : 'outline'}>
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
                              <Button variant="outline" size="sm" onClick={() => editarCliente(cliente)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => deletarCliente(cliente.id)}>
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Cliente</DialogTitle>
                </DialogHeader>
                {clienteEditando && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nome *</Label>
                      <Input
                        value={clienteEditando.nome}
                        onChange={(e) => setClienteEditando({...clienteEditando, nome: e.target.value})}
                        placeholder="Nome completo"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Telefone *</Label>
                      <Input
                        value={clienteEditando.telefone}
                        onChange={(e) => setClienteEditando({...clienteEditando, telefone: e.target.value})}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={clienteEditando.email}
                        onChange={(e) => setClienteEditando({...clienteEditando, email: e.target.value})}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Endereço</Label>
                      <Input
                        value={clienteEditando.endereco}
                        onChange={(e) => setClienteEditando({...clienteEditando, endereco: e.target.value})}
                        placeholder="Endereço completo"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={clienteEditando.status} onValueChange={(value: 'lead' | 'ativo' | 'inativo') => setClienteEditando({...clienteEditando, status: value})}>
                        <SelectTrigger>
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
                      <Label>Observações</Label>
                      <Textarea
                        value={clienteEditando.observacoes}
                        onChange={(e) => setClienteEditando({...clienteEditando, observacoes: e.target.value})}
                        placeholder="Observações sobre o cliente"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={salvarEdicaoCliente} className="flex-1">
                        Salvar Alterações
                      </Button>
                      <Button variant="outline" onClick={() => setShowClienteModal(false)}>
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
                    <Card key={projeto.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Package className="w-5 h-5" />
                              {projeto.nome}
                            </CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                              Cliente: {cliente?.nome} | Criado em: {projeto.dataCreacao}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={statusProjeto[projeto.status].cor}>
                              {statusProjeto[projeto.status].nome}
                            </Badge>
                            <Button variant="outline" size="sm" onClick={() => editarProjeto(projeto)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => deletarProjeto(projeto.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copiarProposta(projeto)}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Proposta
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Itens do Projeto */}
                          <div className="space-y-3">
                            <h4 className="font-semibold">Itens do Projeto:</h4>
                            {projeto.itens.map((item, index) => {
                              const material = materiais.find(m => m.id === item.materialId)
                              return (
                                <div key={item.id} className="bg-gray-50 p-3 rounded-lg">
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-medium">{index + 1}. {item.descricao}</h5>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-green-600">
                                        {formatarMoeda(item.valorFinal)}
                                      </span>
                                      <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                        ✨{calcularSomaDigitos(item.valorFinal)}
                                      </span>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => deletarItemProjeto(projeto.id, item.id)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-600 grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <div>Material: {material?.nome}</div>
                                    <div>Qtd: {item.quantidade} m²</div>
                                    <div>Dias: {item.diasEstimados}</div>
                                    <div>Margem: {item.margemLucro}%</div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          
                          {/* Total do Projeto */}
                          <div className="border-t pt-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Subtotal dos Itens:</span>
                                <span>{formatarMoeda(valorItens)}</span>
                              </div>
                              {projeto.desconto > 0 && (
                                <div className="flex justify-between items-center text-red-600">
                                  <span>Desconto ({projeto.desconto}%):</span>
                                  <span>-{formatarMoeda(valorItens * projeto.desconto / 100)}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center text-xl font-bold">
                                <span>VALOR TOTAL DO PROJETO:</span>
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
                <Card>
                  <CardContent className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum projeto criado</h3>
                    <p className="text-gray-500 mb-4">Use a calculadora para criar seu primeiro projeto</p>
                    <Button onClick={() => setActiveTab('calculadora')}>
                      Ir para Calculadora
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Modal de Edição de Projeto */}
            <Dialog open={showProjetoModal} onOpenChange={setShowProjetoModal}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Editar Projeto</DialogTitle>
                </DialogHeader>
                {projetoEditando && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome do Projeto</Label>
                        <Input
                          value={projetoEditando.nome}
                          onChange={(e) => setProjetoEditando({...projetoEditando, nome: e.target.value})}
                          placeholder="Nome do projeto"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select 
                          value={projetoEditando.status} 
                          onValueChange={(value: any) => setProjetoEditando({...projetoEditando, status: value})}
                        >
                          <SelectTrigger>
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
                      <Label>Descrição</Label>
                      <Textarea
                        value={projetoEditando.descricao}
                        onChange={(e) => setProjetoEditando({...projetoEditando, descricao: e.target.value})}
                        placeholder="Descrição do projeto"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Desconto (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={projetoEditando.desconto}
                          onChange={(e) => setProjetoEditando({...projetoEditando, desconto: parseFloat(e.target.value) || 0})}
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Data de Entrega</Label>
                        <Input
                          type="date"
                          value={projetoEditando.dataEntrega || ''}
                          onChange={(e) => setProjetoEditando({...projetoEditando, dataEntrega: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={salvarEdicaoProjeto} className="flex-1">
                        Salvar Alterações
                      </Button>
                      <Button variant="outline" onClick={() => setShowProjetoModal(false)}>
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Template de Proposta para WhatsApp
                    </span>
                    <Button onClick={salvarTemplate} variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Salvar Template
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
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
                      <Label>Template da Proposta</Label>
                      <Textarea
                        value={templateProposta}
                        onChange={(e) => setTemplateProposta(e.target.value)}
                        placeholder="Digite seu template personalizado..."
                        rows={15}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>💡 Dica:</strong> Use as variáveis entre chaves duplas para inserir dados dinâmicos. 
                        O template será aplicado automaticamente quando você copiar uma proposta.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Template do Sistema */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Template do Sistema
                    </span>
                    <Button onClick={copiarTemplate} variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Template
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 mb-4">
                      <strong>Template completo do sistema</strong> - Inclui estrutura de dados, regras de negócio, 
                      funcionalidades e tecnologias utilizadas. Use este template para documentação, 
                      atualizações ou migração do sistema.
                    </p>
                    <div className="bg-white p-3 rounded border text-xs font-mono max-h-32 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-gray-600">
{templateSistema.substring(0, 500)}...
                      </pre>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Clique em "Copiar Template" para obter o template completo
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Migração para Banco de Dados */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Migração para Banco de Dados na Nuvem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">📋 Opções Recomendadas:</h4>
                      <div className="space-y-3 text-sm text-blue-700">
                        <div>
                          <strong>1. Supabase (Recomendado)</strong>
                          <ul className="list-disc list-inside ml-4 mt-1">
                            <li>PostgreSQL gerenciado na nuvem</li>
                            <li>API REST automática</li>
                            <li>Autenticação integrada</li>
                            <li>Plano gratuito generoso</li>
                            <li>Interface web para gerenciar dados</li>
                          </ul>
                        </div>
                        
                        <div>
                          <strong>2. PlanetScale</strong>
                          <ul className="list-disc list-inside ml-4 mt-1">
                            <li>MySQL serverless</li>
                            <li>Branching de banco de dados</li>
                            <li>Escala automática</li>
                          </ul>
                        </div>
                        
                        <div>
                          <strong>3. Vercel Postgres</strong>
                          <ul className="list-disc list-inside ml-4 mt-1">
                            <li>Integração perfeita com Vercel</li>
                            <li>PostgreSQL serverless</li>
                            <li>Deploy automático</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">🚀 Passos para Migração (Supabase):</h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-green-700">
                        <li>Criar conta no <strong>supabase.com</strong></li>
                        <li>Criar novo projeto</li>
                        <li>Executar SQL para criar tabelas:
                          <ul className="list-disc list-inside ml-4 mt-1">
                            <li>materiais (id, codigo, nome, descricao, preco_unitario, categoria)</li>
                            <li>fatores_dificuldade (id, nome, descricao, multiplicador)</li>
                            <li>clientes (id, nome, telefone, email, endereco, status, observacoes)</li>
                            <li>projetos (id, cliente_id, nome, descricao, valor_total, desconto, status, data_criacao, data_entrega)</li>
                            <li>itens_projeto (id, projeto_id, material_id, descricao, quantidade, fator_dificuldade_id, dias_estimados, quantidade_profissionais, nivel_profissional, margem_lucro, custo_material, custo_mao_obra, subtotal, impostos, valor_final)</li>
                          </ul>
                        </li>
                        <li>Instalar cliente Supabase: <code>npm install @supabase/supabase-js</code></li>
                        <li>Configurar variáveis de ambiente (.env.local)</li>
                        <li>Substituir localStorage por chamadas da API Supabase</li>
                        <li>Migrar dados existentes (export/import)</li>
                      </ol>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-amber-800 mb-2">⚠️ Considerações Importantes:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-amber-700">
                        <li><strong>Backup:</strong> Exporte dados atuais antes da migração</li>
                        <li><strong>Testes:</strong> Teste em ambiente de desenvolvimento primeiro</li>
                        <li><strong>Performance:</strong> Configure índices adequados nas tabelas</li>
                        <li><strong>Segurança:</strong> Configure Row Level Security (RLS) no Supabase</li>
                        <li><strong>Custos:</strong> Monitore uso para evitar surpresas na fatura</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">🔧 Código de Exemplo (Supabase):</h4>
                      <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
{`// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Exemplo de uso
const { data: clientes, error } = await supabase
  .from('clientes')
  .select('*')
  .order('nome')`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gestão de Materiais e Fatores */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gestão de Materiais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Materiais ({materiais.length})
                      </span>
                      <Dialog open={showMaterialModal} onOpenChange={setShowMaterialModal}>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => {
                            setMaterialEditando(null)
                            setNovoMaterial({ codigo: '', nome: '', descricao: '', precoUnitario: '', categoria: '' })
                          }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Material
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{materialEditando ? 'Editar Material' : 'Novo Material'}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Código *</Label>
                              <Input
                                value={novoMaterial.codigo}
                                onChange={(e) => setNovoMaterial({...novoMaterial, codigo: e.target.value})}
                                placeholder="ENV001"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Nome *</Label>
                              <Input
                                value={novoMaterial.nome}
                                onChange={(e) => setNovoMaterial({...novoMaterial, nome: e.target.value})}
                                placeholder="Nome do material"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Descrição</Label>
                              <Textarea
                                value={novoMaterial.descricao}
                                onChange={(e) => setNovoMaterial({...novoMaterial, descricao: e.target.value})}
                                placeholder="Descrição detalhada"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Preço Unitário (R$) *</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={novoMaterial.precoUnitario}
                                onChange={(e) => setNovoMaterial({...novoMaterial, precoUnitario: e.target.value})}
                                placeholder="45.00"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Categoria</Label>
                              <Input
                                value={novoMaterial.categoria}
                                onChange={(e) => setNovoMaterial({...novoMaterial, categoria: e.target.value})}
                                placeholder="Automotivo"
                              />
                            </div>
                            <Button 
                              onClick={materialEditando ? salvarEdicaoMaterial : adicionarMaterial} 
                              className="w-full"
                            >
                              {materialEditando ? 'Salvar Alterações' : 'Adicionar Material'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {materiais.map(material => (
                        <div key={material.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{material.codigo} - {material.nome}</h4>
                              <p className="text-sm text-gray-600">{material.descricao}</p>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm font-medium text-green-600">
                                  {formatarMoeda(material.precoUnitario)}/m²
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {material.categoria}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" onClick={() => editarMaterial(material)}>
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => deletarMaterial(material.id)}>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Fatores de Dificuldade ({fatoresDificuldade.length})
                      </span>
                      <Dialog open={showFatorModal} onOpenChange={setShowFatorModal}>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => {
                            setFatorEditando(null)
                            setNovoFator({ nome: '', descricao: '', multiplicador: '' })
                          }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Fator
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{fatorEditando ? 'Editar Fator de Dificuldade' : 'Novo Fator de Dificuldade'}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Nome *</Label>
                              <Input
                                value={novoFator.nome}
                                onChange={(e) => setNovoFator({...novoFator, nome: e.target.value})}
                                placeholder="Extremo"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Descrição</Label>
                              <Textarea
                                value={novoFator.descricao}
                                onChange={(e) => setNovoFator({...novoFator, descricao: e.target.value})}
                                placeholder="Descrição da dificuldade"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Multiplicador *</Label>
                              <Input
                                type="number"
                                step="0.1"
                                value={novoFator.multiplicador}
                                onChange={(e) => setNovoFator({...novoFator, multiplicador: e.target.value})}
                                placeholder="3.5"
                              />
                            </div>
                            <Button 
                              onClick={fatorEditando ? salvarEdicaoFator : adicionarFator} 
                              className="w-full"
                            >
                              {fatorEditando ? 'Salvar Alterações' : 'Adicionar Fator'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {fatoresDificuldade.map(fator => (
                        <div key={fator.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{fator.nome}</h4>
                              <p className="text-sm text-gray-600">{fator.descricao}</p>
                              <span className="text-sm font-medium text-blue-600">
                                Multiplicador: {fator.multiplicador}x
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" onClick={() => editarFator(fator)}>
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => deletarFator(fator.id)}>
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