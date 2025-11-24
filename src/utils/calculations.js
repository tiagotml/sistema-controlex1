// Funções de cálculo para métricas de negócio

// Calcula o lucro (Vendas - Gastos em Ads)
export const calcularLucro = (valorVendas, gastoAds) => {
  return valorVendas - gastoAds
}

// Calcula o Custo Por Lead (CPL)
export const calcularCPL = (gastoAds, qtdLeads) => {
  if (qtdLeads === 0) return 0
  return gastoAds / qtdLeads
}

// Calcula o Ticket Médio
export const calcularTicketMedio = (valorVendas, qtdVendas) => {
  if (qtdVendas === 0) return 0
  return valorVendas / qtdVendas
}

// Calcula o CPA (Custo Por Aquisição/Venda)
export const calcularCPA = (gastoAds, qtdVendas) => {
  if (qtdVendas === 0) return 0
  return gastoAds / qtdVendas
}

// Calcula o ROI (Return on Investment) como multiplicador
// Ex: Se investiu 100 e voltou 200, ROI = 2.0x
export const calcularROI = (valorVendas, gastoAds) => {
  if (gastoAds === 0) return 0
  return valorVendas / gastoAds
}

// Calcula quantos leads são necessários para uma venda
export const calcularLeadsPorVenda = (totalLeads, totalVendas) => {
  if (totalVendas === 0) return 0
  return totalLeads / totalVendas
}

// Formata valor para moeda brasileira
export const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

// Formata número decimal com 2 casas
export const formatarNumero = (valor) => {
  return Number(valor).toFixed(2)
}

// Formata percentual
export const formatarPercentual = (valor) => {
  return `${formatarNumero(valor)}%`
}

// Formata multiplicador (ROI)
export const formatarMultiplicador = (valor) => {
  return `${formatarNumero(valor)}x`
}

// Calcula métricas diárias de um lançamento
export const calcularMetricasDiarias = (lancamento) => {
  const { gasto_ads, valor_vendas, qtd_leads, qtd_vendas } = lancamento

  return {
    lucro: calcularLucro(valor_vendas, gasto_ads),
    cpl: calcularCPL(gasto_ads, qtd_leads),
    ticketMedio: calcularTicketMedio(valor_vendas, qtd_vendas),
    cpa: calcularCPA(gasto_ads, qtd_vendas),
    roi: calcularROI(valor_vendas, gasto_ads)
  }
}

// Calcula métricas totais de múltiplos lançamentos
export const calcularMetricasTotais = (lancamentos) => {
  const totais = lancamentos.reduce((acc, lanc) => {
    return {
      gastoAds: acc.gastoAds + parseFloat(lanc.gasto_ads || 0),
      valorVendas: acc.valorVendas + parseFloat(lanc.valor_vendas || 0),
      qtdLeads: acc.qtdLeads + parseInt(lanc.qtd_leads || 0),
      qtdVendas: acc.qtdVendas + parseInt(lanc.qtd_vendas || 0)
    }
  }, { gastoAds: 0, valorVendas: 0, qtdLeads: 0, qtdVendas: 0 })

  return {
    totalGastoAds: totais.gastoAds,
    totalValorVendas: totais.valorVendas,
    totalLeads: totais.qtdLeads,
    totalVendas: totais.qtdVendas,
    lucroTotal: calcularLucro(totais.valorVendas, totais.gastoAds),
    cplMedio: calcularCPL(totais.gastoAds, totais.qtdLeads),
    ticketMedioGeral: calcularTicketMedio(totais.valorVendas, totais.qtdVendas),
    cpaMedio: calcularCPA(totais.gastoAds, totais.qtdVendas),
    roiTotal: calcularROI(totais.valorVendas, totais.gastoAds),
    leadsPorVenda: calcularLeadsPorVenda(totais.qtdLeads, totais.qtdVendas)
  }
}

// Agrupa lançamentos por mês
export const agruparPorMes = (lancamentos) => {
  const meses = {}

  lancamentos.forEach(lanc => {
    // Adiciona 'T00:00:00' para evitar problemas de timezone
    const data = new Date(lanc.data + 'T00:00:00')
    const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`

    if (!meses[mesAno]) {
      meses[mesAno] = []
    }
    meses[mesAno].push(lanc)
  })

  return meses
}

// Calcula resumo mensal
export const calcularResumoMensal = (lancamentos) => {
  const lancamentosPorMes = agruparPorMes(lancamentos)
  const resumo = []

  Object.keys(lancamentosPorMes).sort().forEach(mesAno => {
    const lancamentosMes = lancamentosPorMes[mesAno]
    const metricas = calcularMetricasTotais(lancamentosMes)

    resumo.push({
      mes: mesAno,
      ...metricas
    })
  })

  return resumo
}
