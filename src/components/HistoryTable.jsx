import { useState, useMemo } from 'react'
import { History, Trash2, Edit2, X, Save, TrendingUp, TrendingDown, Loader2, Download } from 'lucide-react'
import { supabase } from '../services/supabase'
import { formatarMoeda, formatarNumero, formatarMultiplicador, calcularMetricasDiarias } from '../utils/calculations'
import { validarLancamento, interpretarErroSupabase } from '../utils/validation'
import { exportarLancamentosCSV } from '../utils/export'

export default function HistoryTable({ lancamentos, onUpdate }) {
  const [editando, setEditando] = useState(null)
  const [formEdit, setFormEdit] = useState({})
  const [deletingId, setDeletingId] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [mensagemErro, setMensagemErro] = useState('')

  if (!lancamentos || lancamentos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <History className="w-6 h-6 text-blue-600" />
          Histórico de Lançamentos
        </h2>
        <p className="text-gray-500 text-center">Nenhum lançamento cadastrado ainda.</p>
      </div>
    )
  }

  const handleEdit = (lancamento) => {
    setEditando(lancamento.id)
    setMensagemErro('')
    setFormEdit({
      data: lancamento.data,
      gasto_ads: lancamento.gasto_ads,
      valor_vendas: lancamento.valor_vendas,
      qtd_leads: lancamento.qtd_leads,
      qtd_vendas: lancamento.qtd_vendas
    })
  }

  const handleCancelEdit = () => {
    setEditando(null)
    setFormEdit({})
    setMensagemErro('')
  }

  const handleSaveEdit = async (id) => {
    setMensagemErro('')
    setSavingId(id)

    try {
      // Valida os dados antes de enviar
      const erros = validarLancamento(formEdit)
      if (erros.length > 0) {
        setMensagemErro(erros.join(' • '))
        setSavingId(null)
        return
      }

      const dadosLimpos = {
        data: formEdit.data,
        gasto_ads: parseFloat(formEdit.gasto_ads),
        valor_vendas: parseFloat(formEdit.valor_vendas),
        qtd_leads: parseInt(formEdit.qtd_leads),
        qtd_vendas: parseInt(formEdit.qtd_vendas)
      }

      const { error } = await supabase
        .from('lancamentos')
        .update(dadosLimpos)
        .eq('id', id)

      if (error) throw error

      setEditando(null)
      setFormEdit({})
      setMensagemErro('')
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Erro ao editar:', error)
      setMensagemErro(interpretarErroSupabase(error))
    } finally {
      setSavingId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return

    setDeletingId(id)
    try {
      const { error } = await supabase
        .from('lancamentos')
        .delete()
        .eq('id', id)

      if (error) throw error

      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Erro ao deletar:', error)
      alert(interpretarErroSupabase(error))
    } finally {
      setDeletingId(null)
    }
  }

  const formatarData = (data) => {
    const d = new Date(data + 'T00:00:00')
    return d.toLocaleDateString('pt-BR')
  }

  // Ordena por data (mais recente primeiro) - memoizado para evitar recalcular
  const lancamentosOrdenados = useMemo(() => {
    return [...lancamentos].sort((a, b) => new Date(b.data) - new Date(a.data))
  }, [lancamentos])

  // Calcula médias para comparação - memoizado para performance
  const { mediaROI, mediaLucro } = useMemo(() => {
    if (lancamentos.length === 0) return { mediaROI: 0, mediaLucro: 0 }

    let totalROI = 0
    let totalLucro = 0

    lancamentos.forEach(lanc => {
      const metricas = calcularMetricasDiarias(lanc)
      totalROI += metricas.roi
      totalLucro += metricas.lucro
    })

    return {
      mediaROI: totalROI / lancamentos.length,
      mediaLucro: totalLucro / lancamentos.length
    }
  }, [lancamentos])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <History className="w-8 h-8" />
            Histórico de Lançamentos
          </h2>
          <button
            onClick={() => exportarLancamentosCSV(lancamentos)}
            className="bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            aria-label="Exportar para CSV"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
        <p className="text-purple-100">Todos os seus lançamentos diários com métricas detalhadas</p>
      </div>

      {/* Tabela Melhorada */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <caption className="sr-only">Histórico de lançamentos diários com métricas de marketing</caption>
            <thead>
              <tr className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <th className="px-4 py-4 text-left text-xs font-bold uppercase">Data</th>
                <th className="px-4 py-4 text-right text-xs font-bold uppercase">Gasto Ads</th>
                <th className="px-4 py-4 text-right text-xs font-bold uppercase">Vendas</th>
                <th className="px-4 py-4 text-right text-xs font-bold uppercase">Lucro</th>
                <th className="px-4 py-4 text-right text-xs font-bold uppercase">ROI</th>
                <th className="px-4 py-4 text-right text-xs font-bold uppercase">Leads</th>
                <th className="px-4 py-4 text-right text-xs font-bold uppercase">Qtd Vendas</th>
                <th className="px-4 py-4 text-right text-xs font-bold uppercase">CPL</th>
                <th className="px-4 py-4 text-right text-xs font-bold uppercase">CPA</th>
                <th className="px-4 py-4 text-right text-xs font-bold uppercase">Ticket Médio</th>
                <th className="px-4 py-4 text-right text-xs font-bold uppercase">Conv. %</th>
                <th className="px-4 py-4 text-center text-xs font-bold uppercase">Performance</th>
                <th className="px-4 py-4 text-center text-xs font-bold uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lancamentosOrdenados.map((lancamento) => {
                const metricas = calcularMetricasDiarias(lancamento)
                const isEditando = editando === lancamento.id
                const taxaConversao = (lancamento.qtd_vendas / lancamento.qtd_leads) * 100

                // Indicadores de performance
                const roiAcimaDaMedia = metricas.roi >= mediaROI
                const lucroAcimaDaMedia = metricas.lucro >= mediaLucro

                if (isEditando) {
                  return (
                    <tr key={lancamento.id} className="border-b bg-blue-50">
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={formEdit.data}
                          onChange={(e) => setFormEdit({ ...formEdit, data: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={formEdit.gasto_ads}
                          onChange={(e) => setFormEdit({ ...formEdit, gasto_ads: e.target.value })}
                          step="0.01"
                          className="w-full px-2 py-1 border rounded text-sm text-right"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={formEdit.valor_vendas}
                          onChange={(e) => setFormEdit({ ...formEdit, valor_vendas: e.target.value })}
                          step="0.01"
                          className="w-full px-2 py-1 border rounded text-sm text-right"
                        />
                      </td>
                      <td colSpan="8" className="px-4 py-3">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="text-xs text-gray-600">Leads</label>
                            <input
                              type="number"
                              value={formEdit.qtd_leads}
                              onChange={(e) => setFormEdit({ ...formEdit, qtd_leads: e.target.value })}
                              className="w-full px-2 py-1 border rounded text-sm text-right"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs text-gray-600">Vendas</label>
                            <input
                              type="number"
                              value={formEdit.qtd_vendas}
                              onChange={(e) => setFormEdit({ ...formEdit, qtd_vendas: e.target.value })}
                              className="w-full px-2 py-1 border rounded text-sm text-right"
                            />
                          </div>
                        </div>
                      </td>
                      <td colSpan="2" className="px-4 py-3">
                        {mensagemErro && (
                          <div className="text-xs text-red-600 font-medium mb-2 px-2 py-1 bg-red-50 rounded">
                            {mensagemErro}
                          </div>
                        )}
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleSaveEdit(lancamento.id)}
                            disabled={savingId === lancamento.id}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Salvar alterações"
                            title="Salvar"
                          >
                            {savingId === lancamento.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            {savingId === lancamento.id ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={savingId === lancamento.id}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                            aria-label="Cancelar edição"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                }

                return (
                  <tr key={lancamento.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-medium text-gray-800">
                      {formatarData(lancamento.data)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        {formatarMoeda(lancamento.gasto_ads)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        {formatarMoeda(lancamento.valor_vendas)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${metricas.lucro >= 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {formatarMoeda(metricas.lucro)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${metricas.roi >= 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                        {formatarMultiplicador(metricas.roi)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                        {lancamento.qtd_leads}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                        {lancamento.qtd_vendas}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-right text-gray-700 font-medium">
                      {formatarMoeda(metricas.cpl)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right text-gray-700 font-medium">
                      {formatarMoeda(metricas.cpa)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700">
                        {formatarMoeda(metricas.ticketMedio)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                        {formatarNumero(taxaConversao)}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {roiAcimaDaMedia && (
                          <div className="group relative">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              ROI acima da média
                            </span>
                          </div>
                        )}
                        {!roiAcimaDaMedia && (
                          <div className="group relative">
                            <TrendingDown className="w-5 h-5 text-red-500" />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              ROI abaixo da média
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(lancamento)}
                          disabled={deletingId === lancamento.id}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                          aria-label="Editar lançamento"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lancamento.id)}
                          disabled={deletingId === lancamento.id}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                          aria-label="Excluir lançamento"
                          title="Excluir"
                        >
                          {deletingId === lancamento.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-700 font-medium mb-1">Média de ROI</p>
          <p className="text-2xl font-bold text-green-600">{formatarMultiplicador(mediaROI)}</p>
          <p className="text-xs text-green-600 mt-1">Baseado em {lancamentos.length} lançamentos</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium mb-1">Média de Lucro</p>
          <p className="text-2xl font-bold text-blue-600">{formatarMoeda(mediaLucro)}</p>
          <p className="text-xs text-blue-600 mt-1">Por lançamento</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-700 font-medium mb-1">Total de Lançamentos</p>
          <p className="text-2xl font-bold text-purple-600">{lancamentos.length}</p>
          <p className="text-xs text-purple-600 mt-1">Dias registrados</p>
        </div>
      </div>
    </div>
  )
}
