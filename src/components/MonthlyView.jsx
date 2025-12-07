import { useState, useEffect } from 'react'
import { Calendar, DollarSign, TrendingUp, Users, ShoppingCart, Target, Activity, Award, Download } from 'lucide-react'
import { calcularResumoMensal, formatarMoeda, formatarMultiplicador, formatarNumero, calcularROI, calcularCPL, calcularCPA, calcularTicketMedio } from '../utils/calculations'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { supabase } from '../services/supabase'
import { exportarResumoMensalCSV } from '../utils/export'

export default function MonthlyView({ lancamentos }) {
  const [prolabores, setProlabores] = useState({})

  useEffect(() => {
    carregarProlabores()
  }, [])

  const carregarProlabores = async () => {
    try {
      const { data, error } = await supabase
        .from('prolabore')
        .select('*')

      if (error) throw error

      // Converte array em objeto com mes_ano como chave
      const prolaboresMap = {}
      data?.forEach(p => {
        prolaboresMap[p.mes_ano] = parseFloat(p.valor)
      })
      setProlabores(prolaboresMap)
    } catch (error) {
      console.error('Erro ao carregar pró-labores:', error)
    }
  }

  if (!lancamentos || lancamentos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Visão Mensal
        </h2>
        <p className="text-gray-500 text-center">Nenhum lançamento cadastrado ainda.</p>
      </div>
    )
  }

  const resumoMensal = calcularResumoMensal(lancamentos)

  const formatarMesAno = (mesAno) => {
    const [ano, mes] = mesAno.split('-')
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${meses[parseInt(mes) - 1]}/${ano}`
  }

  // Dados para gráficos
  const dadosGrafico = resumoMensal.map(mes => {
    const proLaboreDoMes = prolabores[mes.mes] || 0
    return {
      mes: formatarMesAno(mes.mes),
      faturamento: mes.totalValorVendas,
      gastoAds: mes.totalGastoAds,
      lucro: mes.lucroTotal,
      lucroLiquido: mes.lucroTotal - proLaboreDoMes,
      roi: mes.roiTotal,
      leads: mes.totalLeads,
      vendas: mes.totalVendas,
      cpl: mes.cplMedio,
      cpa: mes.cpaMedio,
      ticketMedio: mes.ticketMedioGeral,
      proLabore: proLaboreDoMes
    }
  })

  // Calcula totais
  const totais = resumoMensal.reduce((acc, mes) => {
    const proLaboreDoMes = prolabores[mes.mes] || 0
    return {
      faturamento: acc.faturamento + mes.totalValorVendas,
      gastoAds: acc.gastoAds + mes.totalGastoAds,
      lucro: acc.lucro + mes.lucroTotal,
      leads: acc.leads + mes.totalLeads,
      vendas: acc.vendas + mes.totalVendas,
      proLabore: acc.proLabore + proLaboreDoMes
    }
  }, { faturamento: 0, gastoAds: 0, lucro: 0, leads: 0, vendas: 0, proLabore: 0 })

  const totalLucroLiquido = totais.lucro - totais.proLabore

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Calendar className="w-8 h-8" />
              Visão Mensal Detalhada
            </h2>
            <p className="text-blue-100">Análise completa por mês com todas as métricas</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm font-medium text-white mb-1">Total Pró-Labore</p>
            <p className="text-2xl font-bold text-white">{formatarMoeda(totais.proLabore)}</p>
            <p className="text-xs text-blue-100 mt-1">Gerencie na aba "Pró-Labore"</p>
          </div>
        </div>
      </div>

      {/* Cards de Resumo Total */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Faturamento Total</p>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{formatarMoeda(totais.faturamento)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Gasto Total Ads</p>
            <TrendingUp className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{formatarMoeda(totais.gastoAds)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Lucro Líquido</p>
            <Award className="w-5 h-5 text-blue-500" />
          </div>
          <p className={`text-2xl font-bold ${totalLucroLiquido >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatarMoeda(totalLucroLiquido)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Leads</p>
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{totais.leads.toLocaleString('pt-BR')}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Vendas</p>
            <ShoppingCart className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-indigo-600">{totais.vendas.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Faturamento vs Gasto */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Faturamento vs Gasto Ads
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => formatarMoeda(value)}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="faturamento" fill="#10b981" radius={[4, 4, 0, 0]} name="Faturamento" />
              <Bar dataKey="gastoAds" fill="#ef4444" radius={[4, 4, 0, 0]} name="Gasto Ads" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Lucro */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Evolução do Lucro
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => formatarMoeda(value)}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="lucro" stroke="#3b82f6" strokeWidth={3} name="Lucro Bruto" />
              <Line type="monotone" dataKey="lucroLiquido" stroke="#10b981" strokeWidth={3} name="Lucro Líquido" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Leads e Vendas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Leads e Vendas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="leads" fill="#a855f7" radius={[4, 4, 0, 0]} name="Leads" />
              <Bar dataKey="vendas" fill="#6366f1" radius={[4, 4, 0, 0]} name="Vendas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de ROI */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            ROI por Mês
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => `${formatarNumero(value)}x`}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="roi" stroke="#10b981" strokeWidth={3} name="ROI" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela Completa */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Tabela Detalhada por Mês
          </h3>
          <button
            onClick={() => exportarResumoMensalCSV(resumoMensal, prolabores)}
            className="bg-white text-gray-800 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            aria-label="Exportar resumo mensal para CSV"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <caption className="sr-only">Resumo mensal de métricas de marketing e vendas</caption>
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Mês</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Faturamento</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Gasto Ads</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Lucro Bruto</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Pró-Labore</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Lucro Líquido</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">ROI</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Leads</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Vendas</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">CPL</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">CPA</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Ticket Médio</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Conv. %</th>
              </tr>
            </thead>
            <tbody>
              {resumoMensal.map((mes, index) => {
                const proLaboreDoMes = prolabores[mes.mes] || 0
                const lucroLiquido = mes.lucroTotal - proLaboreDoMes
                const taxaConversao = (mes.totalVendas / mes.totalLeads) * 100
                return (
                  <tr key={index} className="border-b hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                      {formatarMesAno(mes.mes)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">
                      {formatarMoeda(mes.totalValorVendas)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600 font-semibold">
                      {formatarMoeda(mes.totalGastoAds)}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-bold ${mes.lucroTotal >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatarMoeda(mes.lucroTotal)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {formatarMoeda(proLaboreDoMes)}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-bold ${lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatarMoeda(lucroLiquido)}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-bold ${mes.roiTotal >= 1 ? 'text-green-600' : 'text-orange-600'}`}>
                      {formatarMultiplicador(mes.roiTotal)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-purple-600 font-semibold">
                      {mes.totalLeads}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-indigo-600 font-semibold">
                      {mes.totalVendas}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {formatarMoeda(mes.cplMedio)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {formatarMoeda(mes.cpaMedio)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-cyan-600 font-semibold">
                      {formatarMoeda(mes.ticketMedioGeral)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-emerald-600 font-semibold">
                      {formatarNumero(taxaConversao)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-gray-800 text-white font-bold">
              <tr>
                <td className="px-4 py-4 text-sm">TOTAL</td>
                <td className="px-4 py-4 text-sm text-right">{formatarMoeda(totais.faturamento)}</td>
                <td className="px-4 py-4 text-sm text-right">{formatarMoeda(totais.gastoAds)}</td>
                <td className="px-4 py-4 text-sm text-right">{formatarMoeda(totais.lucro)}</td>
                <td className="px-4 py-4 text-sm text-right">{formatarMoeda(totais.proLabore)}</td>
                <td className="px-4 py-4 text-sm text-right">{formatarMoeda(totalLucroLiquido)}</td>
                <td className="px-4 py-4 text-sm text-right">{formatarMultiplicador(calcularROI(totais.faturamento, totais.gastoAds))}</td>
                <td className="px-4 py-4 text-sm text-right">{totais.leads}</td>
                <td className="px-4 py-4 text-sm text-right">{totais.vendas}</td>
                <td className="px-4 py-4 text-sm text-right">{formatarMoeda(calcularCPL(totais.gastoAds, totais.leads))}</td>
                <td className="px-4 py-4 text-sm text-right">{formatarMoeda(calcularCPA(totais.gastoAds, totais.vendas))}</td>
                <td className="px-4 py-4 text-sm text-right">{formatarMoeda(calcularTicketMedio(totais.faturamento, totais.vendas))}</td>
                <td className="px-4 py-4 text-sm text-right">{totais.leads > 0 ? formatarNumero((totais.vendas / totais.leads) * 100) : '0,00'}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {resumoMensal.length === 0 && (
        <p className="text-gray-500 text-center py-8">Nenhum dado mensal disponível.</p>
      )}
    </div>
  )
}
