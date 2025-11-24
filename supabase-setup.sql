-- ============================================
-- SISTEMA DE CONTROLE X1 - SETUP DO BANCO DE DADOS
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- para criar a estrutura do banco de dados

-- Cria a tabela de lançamentos diários
CREATE TABLE IF NOT EXISTS lancamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  gasto_ads DECIMAL(10, 2) NOT NULL DEFAULT 0,
  valor_vendas DECIMAL(10, 2) NOT NULL DEFAULT 0,
  qtd_leads INTEGER NOT NULL DEFAULT 0,
  qtd_vendas INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cria índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos(data DESC);
CREATE INDEX IF NOT EXISTS idx_lancamentos_created_at ON lancamentos(created_at DESC);

-- Adiciona comentários para documentação
COMMENT ON TABLE lancamentos IS 'Armazena os lançamentos diários de marketing e vendas';
COMMENT ON COLUMN lancamentos.id IS 'Identificador único do lançamento';
COMMENT ON COLUMN lancamentos.data IS 'Data do lançamento';
COMMENT ON COLUMN lancamentos.gasto_ads IS 'Valor gasto em anúncios (Facebook Ads)';
COMMENT ON COLUMN lancamentos.valor_vendas IS 'Valor total em vendas no dia';
COMMENT ON COLUMN lancamentos.qtd_leads IS 'Quantidade de leads recebidos';
COMMENT ON COLUMN lancamentos.qtd_vendas IS 'Quantidade de vendas realizadas';

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_lancamentos_updated_at
  BEFORE UPDATE ON lancamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilita Row Level Security (RLS)
ALTER TABLE lancamentos ENABLE ROW LEVEL SECURITY;

-- Política de acesso: permitir todas as operações
-- IMPORTANTE: Para produção, configure políticas mais restritivas
-- baseadas em autenticação de usuários
CREATE POLICY "Permitir todas operações para todos" ON lancamentos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ============================================
-- Descomente as linhas abaixo para inserir dados de exemplo

-- INSERT INTO lancamentos (data, gasto_ads, valor_vendas, qtd_leads, qtd_vendas) VALUES
-- ('2025-01-15', 150.00, 800.00, 45, 3),
-- ('2025-01-16', 200.00, 1200.00, 60, 5),
-- ('2025-01-17', 180.00, 950.00, 50, 4),
-- ('2025-01-18', 220.00, 1500.00, 70, 6),
-- ('2025-01-19', 190.00, 1100.00, 55, 5);

-- ============================================
-- QUERIES ÚTEIS
-- ============================================

-- Ver todos os lançamentos ordenados por data
-- SELECT * FROM lancamentos ORDER BY data DESC;

-- Ver total de gastos e vendas
-- SELECT
--   SUM(gasto_ads) as total_gastos,
--   SUM(valor_vendas) as total_vendas,
--   SUM(valor_vendas) - SUM(gasto_ads) as lucro_total
-- FROM lancamentos;

-- Ver resumo mensal
-- SELECT
--   TO_CHAR(data, 'YYYY-MM') as mes,
--   SUM(gasto_ads) as gastos,
--   SUM(valor_vendas) as vendas,
--   SUM(valor_vendas) - SUM(gasto_ads) as lucro,
--   SUM(qtd_leads) as leads,
--   SUM(qtd_vendas) as vendas_qtd
-- FROM lancamentos
-- GROUP BY TO_CHAR(data, 'YYYY-MM')
-- ORDER BY mes DESC;
