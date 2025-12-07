-- ================================================================
-- MIGRATION: Implementação de Autenticação e Row Level Security (RLS)
-- ================================================================
--
-- IMPORTANTE: Este arquivo documenta como implementar autenticação
-- e políticas RLS adequadas para produção.
--
-- ⚠️  ATENÇÃO: As políticas atuais permitem acesso TOTAL a TODOS os dados
-- sem autenticação. Isso é aceitável para desenvolvimento/demonstração,
-- mas CRÍTICO para corrigir antes de produção.
--
-- ================================================================

-- ================================================================
-- PASSO 1: Adicionar coluna user_id nas tabelas
-- ================================================================

-- Adiciona coluna user_id na tabela lancamentos
ALTER TABLE lancamentos
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Adiciona coluna user_id na tabela prolabore
ALTER TABLE prolabore
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ================================================================
-- PASSO 2: Atualizar dados existentes (opcional)
-- ================================================================
-- Se você já tem dados na tabela e quer associá-los a um usuário específico:
--
-- UPDATE lancamentos SET user_id = 'SEU_USER_ID_AQUI' WHERE user_id IS NULL;
-- UPDATE prolabore SET user_id = 'SEU_USER_ID_AQUI' WHERE user_id IS NULL;

-- ================================================================
-- PASSO 3: Remover políticas permissivas antigas
-- ================================================================

-- Remove as políticas antigas que permitem acesso total
DROP POLICY IF EXISTS "Permitir todas operações para todos" ON lancamentos;
DROP POLICY IF EXISTS "Permitir todas operações para todos" ON prolabore;

-- ================================================================
-- PASSO 4: Criar políticas RLS seguras para LANCAMENTOS
-- ================================================================

-- Habilita RLS (já está habilitado, mas garantindo)
ALTER TABLE lancamentos ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios lançamentos
CREATE POLICY "Usuários podem ver apenas seus próprios lançamentos"
  ON lancamentos
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem inserir apenas lançamentos para si mesmos
CREATE POLICY "Usuários podem inserir apenas para si mesmos"
  ON lancamentos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar apenas seus próprios lançamentos
CREATE POLICY "Usuários podem atualizar apenas seus próprios lançamentos"
  ON lancamentos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar apenas seus próprios lançamentos
CREATE POLICY "Usuários podem deletar apenas seus próprios lançamentos"
  ON lancamentos
  FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- PASSO 5: Criar políticas RLS seguras para PROLABORE
-- ================================================================

-- Habilita RLS (já está habilitado, mas garantindo)
ALTER TABLE prolabore ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios pró-labores
CREATE POLICY "Usuários podem ver apenas seus próprios pró-labores"
  ON prolabore
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem inserir apenas pró-labores para si mesmos
CREATE POLICY "Usuários podem inserir apenas para si mesmos"
  ON prolabore
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar apenas seus próprios pró-labores
CREATE POLICY "Usuários podem atualizar apenas seus próprios pró-labores"
  ON prolabore
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar apenas seus próprios pró-labores
CREATE POLICY "Usuários podem deletar apenas seus próprios pró-labores"
  ON prolabore
  FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- PASSO 6: Criar índices para performance
-- ================================================================

-- Índice na coluna user_id para melhorar performance das queries
CREATE INDEX IF NOT EXISTS idx_lancamentos_user_id ON lancamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_prolabore_user_id ON prolabore(user_id);

-- Índice composto para queries por usuário e data
CREATE INDEX IF NOT EXISTS idx_lancamentos_user_data ON lancamentos(user_id, data DESC);

-- ================================================================
-- IMPLEMENTAÇÃO NO FRONTEND
-- ================================================================
--
-- Após executar esta migration, você precisa atualizar o código React:
--
-- 1. Instalar Supabase Auth:
--    npm install @supabase/auth-ui-react @supabase/auth-ui-shared
--
-- 2. Criar componente de Login/Signup
--
-- 3. Adicionar user_id ao inserir dados:
--    const { data: { user } } = await supabase.auth.getUser()
--    const { error } = await supabase
--      .from('lancamentos')
--      .insert([{
--        ...dados,
--        user_id: user.id  // ✅ Adiciona user_id
--      }])
--
-- 4. Proteger rotas com autenticação
--
-- 5. Adicionar logout
--
-- ================================================================
-- VERIFICAÇÃO
-- ================================================================
--
-- Para verificar se as políticas estão funcionando:
--
-- 1. No Supabase Dashboard, vá em Authentication > Policies
-- 2. Verifique se as políticas aparecem listadas
-- 3. Teste fazendo login com diferentes usuários
-- 4. Verifique que cada usuário vê apenas seus próprios dados
--
-- ================================================================
-- ROLLBACK (caso precise voltar)
-- ================================================================
--
-- Se precisar reverter esta migration:
--
-- DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios lançamentos" ON lancamentos;
-- DROP POLICY IF EXISTS "Usuários podem inserir apenas para si mesmos" ON lancamentos;
-- DROP POLICY IF EXISTS "Usuários podem atualizar apenas seus próprios lançamentos" ON lancamentos;
-- DROP POLICY IF EXISTS "Usuários podem deletar apenas seus próprios lançamentos" ON lancamentos;
-- DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios pró-labores" ON prolabore;
-- DROP POLICY IF EXISTS "Usuários podem inserir apenas para si mesmos" ON prolabore;
-- DROP POLICY IF EXISTS "Usuários podem atualizar apenas seus próprios pró-labores" ON prolabore;
-- DROP POLICY IF EXISTS "Usuários podem deletar apenas seus próprios pró-labores" ON prolabore;
--
-- -- Restaura políticas antigas (NÃO RECOMENDADO PARA PRODUÇÃO)
-- CREATE POLICY "Permitir todas operações para todos" ON lancamentos FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Permitir todas operações para todos" ON prolabore FOR ALL USING (true) WITH CHECK (true);
--
-- -- Remove colunas user_id
-- ALTER TABLE lancamentos DROP COLUMN user_id;
-- ALTER TABLE prolabore DROP COLUMN user_id;
--
-- ================================================================
