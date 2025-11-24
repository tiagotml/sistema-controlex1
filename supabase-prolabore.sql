-- ============================================
-- SISTEMA DE CONTROLE X1 - TABELA PRÓ-LABORE
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- após executar o supabase-setup.sql

-- Tabela para armazenar pró-labore e distribuição de lucros mensal
CREATE TABLE IF NOT EXISTS prolabore (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mes_ano VARCHAR(7) NOT NULL UNIQUE, -- formato: 2025-01
  valor DECIMAL(10, 2) NOT NULL DEFAULT 0,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilita RLS
ALTER TABLE prolabore ENABLE ROW LEVEL SECURITY;

-- Política de acesso: permitir todas as operações
-- IMPORTANTE: Para produção, configure políticas mais restritivas
-- baseadas em autenticação de usuários
CREATE POLICY "Permitir todas operações para todos" ON prolabore
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_prolabore_mes_ano ON prolabore(mes_ano);
CREATE INDEX IF NOT EXISTS idx_prolabore_created_at ON prolabore(created_at DESC);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_prolabore_updated_at
  BEFORE UPDATE ON prolabore
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE prolabore IS 'Armazena pró-labore e distribuição de lucros mensal';
COMMENT ON COLUMN prolabore.mes_ano IS 'Mês e ano no formato YYYY-MM (ex: 2025-01)';
COMMENT ON COLUMN prolabore.valor IS 'Valor do pró-labore retirado no mês';
COMMENT ON COLUMN prolabore.descricao IS 'Descrição opcional (ex: Pró-labore + Dividendos)';
