import { useState, useEffect } from 'react'
import { supabase } from './services/supabase'
import DailyForm from './components/DailyForm'
import Dashboard from './components/Dashboard'
import MonthlyView from './components/MonthlyView'
import HistoryTable from './components/HistoryTable'
import DateFilter from './components/DateFilter'
import ProLaboreManager from './components/ProLaboreManager'
import { BarChart3 } from 'lucide-react'

// Dados fake para demonstração
const dadosFake = [
  { id: '1', data: '2025-01-15', gasto_ads: 150.00, valor_vendas: 800.00, qtd_leads: 45, qtd_vendas: 3 },
  { id: '2', data: '2025-01-16', gasto_ads: 200.00, valor_vendas: 1200.00, qtd_leads: 60, qtd_vendas: 5 },
  { id: '3', data: '2025-01-17', gasto_ads: 180.00, valor_vendas: 950.00, qtd_leads: 50, qtd_vendas: 4 },
  { id: '4', data: '2025-01-18', gasto_ads: 220.00, valor_vendas: 1500.00, qtd_leads: 70, qtd_vendas: 6 },
  { id: '5', data: '2025-01-19', gasto_ads: 190.00, valor_vendas: 1100.00, qtd_leads: 55, qtd_vendas: 5 },
  { id: '6', data: '2025-02-01', gasto_ads: 250.00, valor_vendas: 1800.00, qtd_leads: 80, qtd_vendas: 7 },
  { id: '7', data: '2025-02-02', gasto_ads: 210.00, valor_vendas: 1300.00, qtd_leads: 65, qtd_vendas: 6 },
  { id: '8', data: '2025-02-03', gasto_ads: 180.00, valor_vendas: 1000.00, qtd_leads: 58, qtd_vendas: 4 },
  { id: '9', data: '2025-02-04', gasto_ads: 300.00, valor_vendas: 2100.00, qtd_leads: 95, qtd_vendas: 8 },
  { id: '10', data: '2025-02-05', gasto_ads: 270.00, valor_vendas: 1650.00, qtd_leads: 85, qtd_vendas: 7 },
  { id: '11', data: '2025-03-01', gasto_ads: 320.00, valor_vendas: 2500.00, qtd_leads: 100, qtd_vendas: 10 },
  { id: '12', data: '2025-03-02', gasto_ads: 280.00, valor_vendas: 1900.00, qtd_leads: 90, qtd_vendas: 8 },
  { id: '13', data: '2025-03-03', gasto_ads: 250.00, valor_vendas: 1600.00, qtd_leads: 75, qtd_vendas: 6 },
  { id: '14', data: '2025-03-04', gasto_ads: 290.00, valor_vendas: 2000.00, qtd_leads: 88, qtd_vendas: 9 },
  { id: '15', data: '2025-03-05', gasto_ads: 310.00, valor_vendas: 2300.00, qtd_leads: 95, qtd_vendas: 10 }
]

function App() {
  const [lancamentos, setLancamentos] = useState([])
  const [lancamentosFiltrados, setLancamentosFiltrados] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [usandoDadosFake, setUsandoDadosFake] = useState(false)
  const [filtroAtual, setFiltroAtual] = useState({ tipo: 'todos', inicio: null, fim: null })

  // Carrega lançamentos do Supabase
  const carregarLancamentos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('lancamentos')
        .select('*')
        .order('data', { ascending: false })

      if (error) throw error

      setLancamentos(data || [])
      setUsandoDadosFake(false)
    } catch (error) {
      console.error('Erro ao carregar lançamentos:', error)

      // Só usa dados fake em modo de desenvolvimento
      if (import.meta.env.DEV) {
        console.log('⚠️  Modo desenvolvimento: usando dados fake para demonstração')
        setLancamentos(dadosFake)
        setUsandoDadosFake(true)
      } else {
        // Em produção, mostra erro e não carrega dados fake
        console.error('❌ Erro ao conectar ao banco de dados. Verifique sua configuração do Supabase.')
        setLancamentos([])
        setUsandoDadosFake(false)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarLancamentos()
  }, [])

  useEffect(() => {
    if (filtroAtual.tipo === 'todos' || !filtroAtual.inicio) {
      setLancamentosFiltrados(lancamentos)
      return
    }

    const filtrados = lancamentos.filter(lanc => {
      const dataLanc = new Date(lanc.data + 'T00:00:00')
      const dataInicio = new Date(filtroAtual.inicio + 'T00:00:00')
      const dataFim = new Date(filtroAtual.fim + 'T00:00:00')

      return dataLanc >= dataInicio && dataLanc <= dataFim
    })

    setLancamentosFiltrados(filtrados)
  }, [lancamentos, filtroAtual])

  const handleFilterChange = (filtro) => {
    setFiltroAtual(filtro)
  }

  const handleNovoLancamento = () => {
    carregarLancamentos()
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'novo', label: 'Novo Lançamento' },
    { id: 'historico', label: 'Histórico' },
    { id: 'mensal', label: 'Visão Mensal' },
    { id: 'prolabore', label: 'Pró-Labore' }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banner de Modo Demonstração */}
      {usandoDadosFake && (
        <div className="bg-yellow-500 text-gray-900 px-4 py-2 text-center font-medium">
          Modo Demonstração - Usando dados fake. Configure o Supabase para usar dados reais.
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold">Sistema de Controle X1</h1>
              <p className="text-blue-100 text-sm">Gestão de Marketing e Vendas</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4">
          <nav className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Filtros (exceto na aba de novo lançamento e pró-labore) */}
            {activeTab !== 'novo' && activeTab !== 'prolabore' && (
              <div className="mb-6">
                <DateFilter onFilterChange={handleFilterChange} />
              </div>
            )}

            {activeTab === 'dashboard' && (
              <Dashboard lancamentos={lancamentosFiltrados} />
            )}

            {activeTab === 'novo' && (
              <DailyForm onLancamentoAdded={handleNovoLancamento} />
            )}

            {activeTab === 'historico' && (
              <HistoryTable lancamentos={lancamentosFiltrados} onUpdate={carregarLancamentos} />
            )}

            {activeTab === 'mensal' && (
              <MonthlyView lancamentos={lancamentosFiltrados} />
            )}

            {activeTab === 'prolabore' && (
              <ProLaboreManager />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>Sistema de Controle X1 © 2025</p>
        </div>
      </footer>
    </div>
  )
}

export default App
