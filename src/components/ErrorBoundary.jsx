import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error)
    console.error('Error info:', errorInfo)

    this.setState({
      error,
      errorInfo
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Algo deu errado</h1>
                <p className="text-gray-600">A aplicação encontrou um erro inesperado</p>
              </div>
            </div>

            {this.state.error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                <p className="text-sm font-mono text-red-800 mb-2">
                  <strong>Erro:</strong> {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-red-700 hover:text-red-800">
                      Detalhes técnicos
                    </summary>
                    <pre className="mt-2 text-xs bg-white p-3 rounded border border-red-200 overflow-auto max-h-48">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Recarregar Página
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Tentar Novamente
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Dica:</strong> Se o problema persistir, tente:
              </p>
              <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>Limpar o cache do navegador</li>
                <li>Verificar sua conexão com a internet</li>
                <li>Verificar as configurações do Supabase no arquivo .env</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
