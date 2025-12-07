import { useState, useEffect } from 'react'
import { DollarSign, Plus, Edit2, Trash2, Save, X, Loader2 } from 'lucide-react'
import { supabase } from '../services/supabase'
import { formatarMoeda } from '../utils/calculations'
import { validarProLabore, interpretarErroSupabase } from '../utils/validation'

export default function ProLaboreManager() {
  const [prolabores, setProlabores] = useState([])
  const [editando, setEditando] = useState(null)
  const [adicionando, setAdicionando] = useState(false)
  const [formData, setFormData] = useState({ mes_ano: '', valor: '', descricao: '' })
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [mensagemErro, setMensagemErro] = useState('')

  useEffect(() => {
    carregarProlabores()
  }, [])

  const carregarProlabores = async () => {
    try {
      const { data, error } = await supabase
        .from('prolabore')
        .select('*')
        .order('mes_ano', { ascending: false })

      if (error) throw error
      setProlabores(data || [])
    } catch (error) {
      console.error('Erro ao carregar pró-labores:', error)
    }
  }

  const handleAdicionar = async () => {
    setMensagemErro('')

    // Valida os dados antes de enviar
    const erros = validarProLabore(formData)
    if (erros.length > 0) {
      setMensagemErro(erros.join(' • '))
      return
    }

    setLoading(true)
    try {
      const dadosLimpos = {
        mes_ano: formData.mes_ano,
        valor: parseFloat(formData.valor),
        descricao: formData.descricao
      }

      const { error } = await supabase
        .from('prolabore')
        .insert([dadosLimpos])

      if (error) throw error

      setAdicionando(false)
      setFormData({ mes_ano: '', valor: '', descricao: '' })
      setMensagemErro('')
      carregarProlabores()
    } catch (error) {
      console.error('Erro ao adicionar:', error)
      setMensagemErro(interpretarErroSupabase(error))
    } finally {
      setLoading(false)
    }
  }

  const handleEditar = async (id) => {
    setMensagemErro('')

    // Valida os dados antes de enviar
    const erros = validarProLabore(formData)
    if (erros.length > 0) {
      setMensagemErro(erros.join(' • '))
      return
    }

    setLoading(true)
    try {
      const dadosLimpos = {
        mes_ano: formData.mes_ano,
        valor: parseFloat(formData.valor),
        descricao: formData.descricao
      }

      const { error } = await supabase
        .from('prolabore')
        .update(dadosLimpos)
        .eq('id', id)

      if (error) throw error

      setEditando(null)
      setFormData({ mes_ano: '', valor: '', descricao: '' })
      setMensagemErro('')
      carregarProlabores()
    } catch (error) {
      console.error('Erro ao editar:', error)
      setMensagemErro(interpretarErroSupabase(error))
    } finally {
      setLoading(false)
    }
  }

  const handleExcluir = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este pró-labore?')) return

    setDeletingId(id)
    try {
      const { error } = await supabase
        .from('prolabore')
        .delete()
        .eq('id', id)

      if (error) throw error
      carregarProlabores()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert(interpretarErroSupabase(error))
    } finally {
      setDeletingId(null)
    }
  }

  const iniciarEdicao = (prolabore) => {
    setEditando(prolabore.id)
    setMensagemErro('')
    setFormData({
      mes_ano: prolabore.mes_ano,
      valor: prolabore.valor,
      descricao: prolabore.descricao || ''
    })
  }

  const cancelar = () => {
    setEditando(null)
    setAdicionando(false)
    setFormData({ mes_ano: '', valor: '', descricao: '' })
    setMensagemErro('')
  }

  const formatarMesAno = (mesAno) => {
    const [ano, mes] = mesAno.split('-')
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    return `${meses[parseInt(mes) - 1]}/${ano}`
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-bold text-gray-800">Pró-Labore e Distribuição de Lucros</h3>
        </div>
        <button
          onClick={() => setAdicionando(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      {/* Formulário de Adicionar */}
      {adicionando && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4 border-2 border-blue-200">
          <h4 className="font-semibold text-gray-800 mb-3">Novo Pró-Labore</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Mês/Ano</label>
              <input
                type="month"
                value={formData.mes_ano}
                onChange={(e) => setFormData({ ...formData, mes_ano: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Descrição (opcional)</label>
              <input
                type="text"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Pró-labore + Dividendos"
              />
            </div>
          </div>
          {mensagemErro && (
            <div className="text-sm text-red-600 font-medium mt-3 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
              {mensagemErro}
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAdicionar}
              disabled={loading || !formData.mes_ano || !formData.valor}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Salvar pró-labore"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              onClick={cancelar}
              disabled={loading}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              aria-label="Cancelar"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de Pró-Labores */}
      <div className="space-y-3">
        {prolabores.length === 0 && !adicionando && (
          <p className="text-gray-500 text-center py-8">Nenhum pró-labore cadastrado ainda.</p>
        )}

        {prolabores.map((prolabore) => {
          const isEditando = editando === prolabore.id

          if (isEditando) {
            return (
              <div key={prolabore.id} className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-3">Editar Pró-Labore</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Mês/Ano</label>
                    <input
                      type="month"
                      value={formData.mes_ano}
                      onChange={(e) => setFormData({ ...formData, mes_ano: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Descrição (opcional)</label>
                    <input
                      type="text"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                {mensagemErro && (
                  <div className="text-sm text-red-600 font-medium mt-3 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
                    {mensagemErro}
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEditar(prolabore.id)}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Salvar alterações"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={cancelar}
                    disabled={loading}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    aria-label="Cancelar edição"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            )
          }

          return (
            <div
              key={prolabore.id}
              className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-800">
                      {formatarMesAno(prolabore.mes_ano)}
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatarMoeda(prolabore.valor)}
                    </span>
                  </div>
                  {prolabore.descricao && (
                    <p className="text-sm text-gray-600 mt-1">{prolabore.descricao}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => iniciarEdicao(prolabore)}
                    disabled={deletingId === prolabore.id}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                    aria-label="Editar pró-labore"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleExcluir(prolabore.id)}
                    disabled={deletingId === prolabore.id}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                    aria-label="Excluir pró-labore"
                    title="Excluir"
                  >
                    {deletingId === prolabore.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
