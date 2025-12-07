# Guia de Deploy na Vercel

## Pré-requisitos

1. Conta no GitHub (https://github.com)
2. Conta na Vercel (https://vercel.com)
3. Projeto Supabase configurado

## Passo a Passo

### 1. Preparar o Repositório no GitHub

Se ainda não tem o projeto no GitHub:

```bash
# Já está inicializado, então apenas adicione o remote
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

### 2. Fazer Deploy na Vercel

#### Opção A: Via Interface Web (Recomendado)

1. Acesse https://vercel.com e faça login
2. Clique em "Add New..." → "Project"
3. Importe seu repositório do GitHub
4. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL` - Sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` - Sua chave anônima do Supabase
5. Clique em "Deploy"

#### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Fazer deploy
vercel

# Quando perguntar sobre as configurações:
# - Set up and deploy? Yes
# - Which scope? Escolha sua conta
# - Link to existing project? No
# - Project name? sistema-controle-x1 (ou o que preferir)
# - In which directory is your code located? ./
# - Want to override the settings? No

# Adicionar variáveis de ambiente
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy para produção
vercel --prod
```

### 3. Configurar Variáveis de Ambiente na Vercel

Se usar a interface web:

1. Vá em Settings → Environment Variables
2. Adicione:
   - `VITE_SUPABASE_URL` = sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` = sua chave anônima
3. Selecione "Production", "Preview" e "Development"
4. Clique em "Save"

### 4. Redeployar (se necessário)

```bash
# Via CLI
vercel --prod

# Ou via interface web:
# Deployments → Redeploy (botão nos três pontinhos)
```

## Verificação

Após o deploy:

1. A Vercel fornecerá uma URL (ex: `https://seu-projeto.vercel.app`)
2. Acesse a URL e verifique se o sistema está funcionando
3. Teste a conexão com o Supabase

## Problemas Comuns

### Erro de CORS do Supabase

Se tiver problemas de CORS, adicione o domínio Vercel nas configurações do Supabase:

1. Supabase Dashboard → Settings → API
2. Em "URL Configuration", adicione sua URL da Vercel
3. Salve as alterações

### Variáveis de Ambiente não Carregando

- Certifique-se de que as variáveis começam com `VITE_`
- Após adicionar variáveis, faça um novo deploy
- Verifique se não há espaços extras nos valores

### Build Falhando

Verifique os logs de build na Vercel:
- Deployments → Selecione o deploy → View Function Logs

## Deploy Automático

Após configurar:
- Todo push na branch `main` fará deploy automático
- Pull requests criarão preview deployments
- Você pode ver todos os deploys no dashboard da Vercel

## Domínio Personalizado (Opcional)

1. Vercel Dashboard → Settings → Domains
2. Adicione seu domínio
3. Configure o DNS conforme instruções da Vercel
