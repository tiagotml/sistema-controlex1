import { useState } from 'react'
import { supabase } from '../services/supabase'
import { PlusCircle, Save } from 'lucide-react'
import { validarLancamento, interpretarErroSupabase } from '../utils/validation'

export default function DailyForm({ onLancamentoAdded }) {
  const hoje = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    data: hoje,
    gasto_ads: '',
    valor_vendas: '',
    qtd_leads: '',
    qtd_vendas: ''
  })

  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMensagem({ tipo: '', texto: '' })

    try {
      // Converte strings para números
      const dados = {
        data: formData.data,
        gasto_ads: formData.gasto_ads,
        valor_vendas: formData.valor_vendas,
        qtd_leads: formData.qtd_leads,
        qtd_vendas: formData.qtd_vendas
      }

      // Valida os dados antes de enviar
      const erros = validarLancamento(dados)
      if (erros.length > 0) {
        setMensagem({ tipo: 'erro', texto: erros.join(' • ') })
        setLoading(false)
        return
      }

      // Converte para tipos corretos após validação
      const dadosLimpos = {
        data: dados.data,
        gasto_ads: parseFloat(dados.gasto_ads),
        valor_vendas: parseFloat(dados.valor_vendas),
        qtd_leads: parseInt(dados.qtd_leads),
        qtd_vendas: parseInt(dados.qtd_vendas)
      }

      const { data, error } = await supabase
        .from('lancamentos')
        .insert([dadosLimpos])
        .select()

      if (error) throw error

      setMensagem({ tipo: 'sucesso', texto: 'Lançamento salvo com sucesso!' })

      // Limpa o formulário
      setFormData({
        data: hoje,
        gasto_ads: '',
        valor_vendas: '',
        qtd_leads: '',
        qtd_vendas: ''
      })

      // Notifica o componente pai
      if (onLancamentoAdded) {
        onLancamentoAdded(data[0])
      }

    } catch (error) {
      console.error('Erro ao salvar:', error)
      setMensagem({ tipo: 'erro', texto: interpretarErroSupabase(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <PlusCircle className="w-6 h-6 text-blue-600" />
        Novo Lançamento Diário
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>
            <input
              id="data"
              type="date"
              name="data"
              value={formData.data}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="gasto_ads" className="block text-sm font-medium text-gray-700 mb-1">
              Gasto em Anúncios (R$)
            </label>
            <input
              id="gasto_ads"
              type="number"
              name="gasto_ads"
              value={formData.gasto_ads}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="valor_vendas" className="block text-sm font-medium text-gray-700 mb-1">
              Valor em Vendas (R$)
            </label>
            <input
              id="valor_vendas"
              type="number"
              name="valor_vendas"
              value={formData.valor_vendas}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="qtd_leads" className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade de Leads
            </label>
            <input
              id="qtd_leads"
              type="number"
              name="qtd_leads"
              value={formData.qtd_leads}
              onChange={handleChange}
              min="0"
              required
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="qtd_vendas" className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade de Vendas
            </label>
            <input
              id="qtd_vendas"
              type="number"
              name="qtd_vendas"
              value={formData.qtd_vendas}
              onChange={handleChange}
              min="0"
              required
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Salvando...' : 'Salvar Lançamento'}
          </button>

          {mensagem.texto && (
            <div className={`text-sm font-medium ${mensagem.tipo === 'sucesso' ? 'text-green-600' : 'text-red-600'}`}>
              {mensagem.texto}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
