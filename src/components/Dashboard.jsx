import { TrendingUp, DollarSign, Users, ShoppingCart, Target, Award, Activity } from 'lucide-react'
import { formatarMoeda, formatarNumero, formatarMultiplicador, calcularMetricasTotais, calcularResumoMensal } from '../utils/calculations'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'

export default function Dashboard({ lancamentos }) {
  if (!lancamentos || lancamentos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center">Nenhum lançamento cadastrado ainda.</p>
      </div>
    )
  }

  const metricas = calcularMetricasTotais(lancamentos)
  const resumoMensal = calcularResumoMensal(lancamentos)

  // Dados para gráfico de evolução temporal
  const dadosTemporais = resumoMensal.map(mes => {
    const [ano, mesNum] = mes.mes.split('-')
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return {
      mes: `${meses[parseInt(mesNum) - 1]}/${ano.slice(2)}`,
      faturamento: mes.totalValorVendas,
      gastoAds: mes.totalGastoAds,
      lucro: mes.lucroTotal,
      roi: mes.roiTotal
    }
  })

  // Dados para gráfico de pizza (distribuição)
  const dadosDistribuicao = [
    { name: 'Lucro', value: Math.max(0, metricas.lucroTotal), color: '#10b981' },
    { name: 'Gasto Ads', value: metricas.totalGastoAds, color: '#ef4444' }
  ]

  const cards = [
    {
      titulo: 'Faturamento Total',
      valor: formatarMoeda(metricas.totalValorVendas),
      icone: DollarSign,
      cor: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      titulo: 'Gasto em Ads',
      valor: formatarMoeda(metricas.totalGastoAds),
      icone: TrendingUp,
      cor: 'bg-gradient-to-br from-red-500 to-red-600'
    },
    {
      titulo: 'Lucro Total',
      valor: formatarMoeda(metricas.lucroTotal),
      icone: Award,
      cor: metricas.lucroTotal >= 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-red-500 to-red-600'
    },
    {
      titulo: 'ROI Total',
      valor: formatarMultiplicador(metricas.roiTotal),
      icone: Target,
      cor: metricas.roiTotal >= 1 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'
    },
    {
      titulo: 'Total de Leads',
      valor: metricas.totalLeads.toLocaleString('pt-BR'),
      icone: Users,
      cor: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      titulo: 'Total de Vendas',
      valor: metricas.totalVendas.toLocaleString('pt-BR'),
      icone: ShoppingCart,
      cor: 'bg-gradient-to-br from-indigo-500 to-indigo-600'
    },
    {
      titulo: 'CPL Médio',
      valor: formatarMoeda(metricas.cplMedio),
      icone: Activity,
      cor: 'bg-gradient-to-br from-cyan-500 to-cyan-600'
    },
    {
      titulo: 'Ticket Médio',
      valor: formatarMoeda(metricas.ticketMedioGeral),
      icone: DollarSign,
      cor: 'bg-gradient-to-br from-pink-500 to-pink-600'
    }
  ]

  const metricas2 = [
    {
      label: 'CPA Médio',
      valor: formatarMoeda(metricas.cpaMedio),
      descricao: 'Custo por aquisição',
      cor: 'text-blue-600'
    },
    {
      label: 'Leads por Venda',
      valor: formatarNumero(metricas.leadsPorVenda),
      descricao: 'Taxa de conversão',
      cor: 'text-purple-600'
    },
    {
      label: 'Taxa de Conversão',
      valor: `${formatarNumero((metricas.totalVendas / metricas.totalLeads) * 100)}%`,
      descricao: 'Vendas / Leads',
      cor: 'text-green-600'
    },
    {
      label: 'Margem de Lucro',
      valor: `${formatarNumero((metricas.lucroTotal / metricas.totalValorVendas) * 100)}%`,
      descricao: 'Lucro / Faturamento',
      cor: 'text-orange-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icone
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className={`${card.cor} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white/80 text-xs font-medium mb-1">{card.titulo}</p>
                    <p className="text-white text-2xl font-bold">{card.valor}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Evolução Temporal */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Evolução Temporal
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dadosTemporais}>
              <defs>
                <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => formatarMoeda(value)}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="faturamento" stroke="#10b981" fillOpacity={1} fill="url(#colorFaturamento)" name="Faturamento" />
              <Area type="monotone" dataKey="gastoAds" stroke="#ef4444" fillOpacity={1} fill="url(#colorGasto)" name="Gasto Ads" />
              <Area type="monotone" dataKey="lucro" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLucro)" name="Lucro" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de ROI Temporal */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            ROI por Mês
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosTemporais}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => `${formatarNumero(value)}x`}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="roi" fill="#10b981" radius={[8, 8, 0, 0]} name="ROI" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Métricas Detalhadas */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          Métricas Detalhadas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricas2.map((metrica, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600 mb-1">{metrica.label}</p>
              <p className={`text-3xl font-bold ${metrica.cor} mb-1`}>{metrica.valor}</p>
              <p className="text-xs text-gray-500">{metrica.descricao}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Resumo Comparativo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição Financeira */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Distribuição Financeira
          </h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dadosDistribuicao}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosDistribuicao.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatarMoeda(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Análise de Performance */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Análise de Performance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Melhor ROI Mensal</p>
                <p className="text-xl font-bold text-green-600">
                  {formatarMultiplicador(Math.max(...resumoMensal.map(m => m.roiTotal)))}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Maior Faturamento</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatarMoeda(Math.max(...resumoMensal.map(m => m.totalValorVendas)))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total de Conversões</p>
                <p className="text-xl font-bold text-purple-600">
                  {metricas.totalVendas} vendas de {metricas.totalLeads} leads
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-purple-500" />
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Eficiência de Gastos</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatarNumero((metricas.totalGastoAds / metricas.totalValorVendas) * 100)}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
