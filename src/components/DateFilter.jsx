import { Calendar, Filter } from 'lucide-react'
import { useState } from 'react'

export default function DateFilter({ onFilterChange }) {
  const [filtroAtivo, setFiltroAtivo] = useState('todos')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const calcularDatas = (tipo) => {
    const hoje = new Date()
    let inicio = null
    let fim = hoje.toISOString().split('T')[0]

    switch(tipo) {
      case 'hoje':
        inicio = hoje.toISOString().split('T')[0]
        break
      case '7dias':
        const data7dias = new Date()
        data7dias.setDate(data7dias.getDate() - 7)
        inicio = data7dias.toISOString().split('T')[0]
        break
      case '15dias':
        const data15dias = new Date()
        data15dias.setDate(data15dias.getDate() - 15)
        inicio = data15dias.toISOString().split('T')[0]
        break
      case '30dias':
        const data30dias = new Date()
        data30dias.setDate(data30dias.getDate() - 30)
        inicio = data30dias.toISOString().split('T')[0]
        break
      case 'todos':
        inicio = null
        fim = null
        break
    }

    return { inicio, fim }
  }

  const handleFiltroClick = (tipo) => {
    setFiltroAtivo(tipo)
    const { inicio, fim } = calcularDatas(tipo)
    onFilterChange({ tipo, inicio, fim })
  }

  const handlePersonalizado = () => {
    setFiltroAtivo('personalizado')
    onFilterChange({ tipo: 'personalizado', inicio: dataInicio, fim: dataFim })
  }

  const botoes = [
    { id: 'todos', label: 'Todos' },
    { id: 'hoje', label: 'Hoje' },
    { id: '7dias', label: '7 dias' },
    { id: '15dias', label: '15 dias' },
    { id: '30dias', label: '30 dias' }
  ]

  const getButtonClasses = (id) => {
    const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all'
    if (filtroAtivo === id) {
      return `${baseClasses} bg-blue-500 text-white shadow-md hover:bg-blue-600`
    }
    return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200`
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-bold text-gray-800">Filtros de Período</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {botoes.map(btn => (
          <button
            key={btn.id}
            onClick={() => handleFiltroClick(btn.id)}
            className={getButtonClasses(btn.id)}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Período Personalizado</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-gray-600 block mb-1">Data Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-gray-600 block mb-1">Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handlePersonalizado}
              disabled={!dataInicio || !dataFim}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                filtroAtivo === 'personalizado'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
