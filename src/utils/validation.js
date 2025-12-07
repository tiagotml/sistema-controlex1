/**
 * Validações para lançamentos e pró-labore
 * Retorna array de erros (vazio se válido)
 */

const MAX_VALOR_SEGURO = 10000000 // 10 milhões

/**
 * Valida dados de um lançamento diário
 */
export const validarLancamento = (dados) => {
  const erros = []

  // Validação de data
  if (!dados.data) {
    erros.push('Data é obrigatória')
  }

  // Validação de gasto_ads
  const gastoAds = parseFloat(dados.gasto_ads)
  if (isNaN(gastoAds)) {
    erros.push('Gasto em Ads deve ser um número válido')
  } else if (gastoAds < 0) {
    erros.push('Gasto em Ads não pode ser negativo')
  } else if (gastoAds > MAX_VALOR_SEGURO) {
    erros.push('Gasto em Ads muito alto (máximo: R$ 10.000.000,00). Verifique o valor.')
  }

  // Validação de valor_vendas
  const valorVendas = parseFloat(dados.valor_vendas)
  if (isNaN(valorVendas)) {
    erros.push('Valor de Vendas deve ser um número válido')
  } else if (valorVendas < 0) {
    erros.push('Valor de Vendas não pode ser negativo')
  } else if (valorVendas > MAX_VALOR_SEGURO) {
    erros.push('Valor de Vendas muito alto (máximo: R$ 10.000.000,00). Verifique o valor.')
  }

  // Validação de qtd_leads
  const qtdLeads = parseInt(dados.qtd_leads)
  if (isNaN(qtdLeads)) {
    erros.push('Quantidade de Leads deve ser um número inteiro válido')
  } else if (qtdLeads < 0) {
    erros.push('Quantidade de Leads não pode ser negativa')
  } else if (qtdLeads > 1000000) {
    erros.push('Quantidade de Leads muito alta (máximo: 1.000.000). Verifique o valor.')
  }

  // Validação de qtd_vendas
  const qtdVendas = parseInt(dados.qtd_vendas)
  if (isNaN(qtdVendas)) {
    erros.push('Quantidade de Vendas deve ser um número inteiro válido')
  } else if (qtdVendas < 0) {
    erros.push('Quantidade de Vendas não pode ser negativa')
  } else if (qtdVendas > 1000000) {
    erros.push('Quantidade de Vendas muito alta (máximo: 1.000.000). Verifique o valor.')
  }

  // Validação lógica: vendas não podem ser maiores que leads
  if (!isNaN(qtdLeads) && !isNaN(qtdVendas) && qtdVendas > qtdLeads) {
    erros.push('Quantidade de Vendas não pode ser maior que Quantidade de Leads')
  }

  return erros
}

/**
 * Valida dados de pró-labore
 */
export const validarProLabore = (dados) => {
  const erros = []

  // Validação de mes_ano
  if (!dados.mes_ano) {
    erros.push('Mês/Ano é obrigatório')
  } else {
    // Valida formato YYYY-MM
    const regex = /^\d{4}-\d{2}$/
    if (!regex.test(dados.mes_ano)) {
      erros.push('Formato de Mês/Ano inválido (esperado: YYYY-MM)')
    } else {
      const [ano, mes] = dados.mes_ano.split('-').map(Number)
      if (mes < 1 || mes > 12) {
        erros.push('Mês deve estar entre 01 e 12')
      }
      if (ano < 2000 || ano > 2100) {
        erros.push('Ano deve estar entre 2000 e 2100')
      }
    }
  }

  // Validação de valor
  const valor = parseFloat(dados.valor)
  if (isNaN(valor)) {
    erros.push('Valor deve ser um número válido')
  } else if (valor < 0) {
    erros.push('Valor não pode ser negativo')
  } else if (valor > MAX_VALOR_SEGURO) {
    erros.push('Valor muito alto (máximo: R$ 10.000.000,00). Verifique o valor.')
  } else if (valor === 0) {
    erros.push('Valor deve ser maior que zero')
  }

  return erros
}

/**
 * Interpreta erro do Supabase e retorna mensagem amigável
 */
export const interpretarErroSupabase = (error) => {
  if (!error) return 'Erro desconhecido'

  const errorMessage = error.message?.toLowerCase() || ''
  const errorCode = error.code

  // Erros de duplicidade
  if (errorCode === '23505' || errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
    if (errorMessage.includes('lancamentos_data_key')) {
      return 'Já existe um lançamento para esta data. Use a opção de editar.'
    }
    if (errorMessage.includes('prolabore_mes_ano_key')) {
      return 'Já existe um pró-labore para este mês. Use a opção de editar.'
    }
    return 'Registro duplicado. Tente editar o registro existente.'
  }

  // Erros de conexão
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Sem conexão com a internet. Verifique sua conexão e tente novamente.'
  }

  // Erros de autenticação
  if (errorCode === 'PGRST301' || errorMessage.includes('jwt') || errorMessage.includes('auth')) {
    return 'Erro de autenticação. Verifique suas credenciais do Supabase.'
  }

  // Erros de permissão
  if (errorMessage.includes('permission') || errorMessage.includes('policy')) {
    return 'Você não tem permissão para realizar esta operação.'
  }

  // Erro genérico com mensagem específica
  if (error.message) {
    return `Erro: ${error.message}`
  }

  return 'Erro ao processar requisição. Tente novamente.'
}
