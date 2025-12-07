import { calcularMetricasDiarias } from './calculations'

/**
 * Exporta lançamentos para CSV
 */
export const exportarLancamentosCSV = (lancamentos) => {
  if (!lancamentos || lancamentos.length === 0) {
    alert('Não há dados para exportar')
    return
  }

  // Headers do CSV
  const headers = [
    'Data',
    'Gasto em Ads (R$)',
    'Valor em Vendas (R$)',
    'Qtd Leads',
    'Qtd Vendas',
    'CPL (R$)',
    'CPA (R$)',
    'Ticket Médio (R$)',
    'ROI',
    'Lucro (R$)',
    'Taxa Conversão (%)'
  ]

  // Cria as linhas com os dados
  const rows = lancamentos.map(lanc => {
    const metricas = calcularMetricasDiarias(lanc)
    const taxaConversao = lanc.qtd_leads > 0
      ? ((lanc.qtd_vendas / lanc.qtd_leads) * 100).toFixed(2)
      : '0.00'

    return [
      lanc.data,
      lanc.gasto_ads.toFixed(2),
      lanc.valor_vendas.toFixed(2),
      lanc.qtd_leads,
      lanc.qtd_vendas,
      metricas.cpl.toFixed(2),
      metricas.cpa.toFixed(2),
      metricas.ticketMedio.toFixed(2),
      metricas.roi.toFixed(2),
      metricas.lucro.toFixed(2),
      taxaConversao
    ]
  })

  // Combina headers e rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Adiciona BOM para UTF-8 (suporte ao Excel)
  const BOM = '\uFEFF'
  const csvWithBOM = BOM + csvContent

  // Cria blob e faz download
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url

  // Nome do arquivo com data atual
  const dataAtual = new Date().toISOString().split('T')[0]
  link.download = `lancamentos_${dataAtual}.csv`

  // Trigger download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exporta resumo mensal para CSV
 */
export const exportarResumoMensalCSV = (resumoMensal, prolabores = {}) => {
  if (!resumoMensal || resumoMensal.length === 0) {
    alert('Não há dados mensais para exportar')
    return
  }

  // Headers do CSV
  const headers = [
    'Mês',
    'Faturamento (R$)',
    'Gasto Ads (R$)',
    'Lucro Bruto (R$)',
    'Pró-Labore (R$)',
    'Lucro Líquido (R$)',
    'ROI',
    'Total Leads',
    'Total Vendas',
    'CPL (R$)',
    'CPA (R$)',
    'Ticket Médio (R$)',
    'Taxa Conversão (%)'
  ]

  // Cria as linhas com os dados
  const rows = resumoMensal.map(mes => {
    const proLaboreDoMes = prolabores[mes.mes] || 0
    const lucroLiquido = mes.lucro - proLaboreDoMes
    const taxaConversao = mes.leads > 0
      ? ((mes.vendas / mes.leads) * 100).toFixed(2)
      : '0.00'

    return [
      mes.mesFormatado,
      mes.faturamento.toFixed(2),
      mes.gastoAds.toFixed(2),
      mes.lucro.toFixed(2),
      proLaboreDoMes.toFixed(2),
      lucroLiquido.toFixed(2),
      mes.roi.toFixed(2),
      mes.leads,
      mes.vendas,
      mes.cpl.toFixed(2),
      mes.cpa.toFixed(2),
      mes.ticketMedio.toFixed(2),
      taxaConversao
    ]
  })

  // Combina headers e rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Adiciona BOM para UTF-8
  const BOM = '\uFEFF'
  const csvWithBOM = BOM + csvContent

  // Cria blob e faz download
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url

  const dataAtual = new Date().toISOString().split('T')[0]
  link.download = `resumo_mensal_${dataAtual}.csv`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
