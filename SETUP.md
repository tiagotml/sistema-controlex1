# Guia de Configuração Rápida - Transcriptor

Este guia vai te ajudar a configurar o Transcriptor passo a passo.

## Passo 1: Instalar Dependências

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

## Passo 2: Configurar Supabase

### 2.1. Criar conta no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em **"Start your project"**
3. Faça login com GitHub, Google ou email

### 2.2. Criar novo projeto

1. No dashboard, clique em **"New Project"**
2. Preencha:
   - **Name:** transcriptor (ou outro nome de sua preferência)
   - **Database Password:** Crie uma senha forte (anote em local seguro)
   - **Region:** Escolha South America (São Paulo) para melhor performance
   - **Pricing Plan:** Free (gratuito)
3. Clique em **"Create new project"**
4. Aguarde 1-2 minutos enquanto o projeto é criado

### 2.3. Criar a tabela no banco de dados

1. No menu lateral esquerdo, clique em **"SQL Editor"** (ícone <>)
2. Clique em **"New query"**
3. Copie todo o conteúdo do arquivo `supabase-setup.sql` deste projeto
4. Cole no editor SQL
5. Clique em **"Run"** (ou pressione Ctrl+Enter)
6. Você verá a mensagem "Success. No rows returned"

### 2.4. Obter as credenciais

1. No menu lateral, clique em **"Settings"** (ícone de engrenagem)
2. Clique em **"API"**
3. Na seção **"Project URL"**, copie a URL (algo como `https://xxxxxxxx.supabase.co`)
4. Na seção **"Project API keys"**, copie a chave **"anon public"** (chave longa que começa com `eyJ...`)

### 2.5. Configurar variáveis de ambiente

1. Na pasta do projeto, copie o arquivo `.env.example` para `.env`:

**Windows (CMD):**
```cmd
copy .env.example .env
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

2. Abra o arquivo `.env` com seu editor de texto
3. Substitua os valores:

```env
VITE_SUPABASE_URL=cole_sua_url_aqui
VITE_SUPABASE_ANON_KEY=cole_sua_chave_aqui
```

Exemplo:
```env
VITE_SUPABASE_URL=https://abcdefgh12345678.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Salve o arquivo

## Passo 3: Iniciar o projeto

No terminal, execute:

```bash
npm run dev
```

Aguarde alguns segundos e você verá:

```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Abra seu navegador e acesse: **http://localhost:5173**

## Passo 4: Testar o sistema

1. Clique na aba **"Novo Lançamento"**
2. Preencha os dados de teste:
   - Data: hoje
   - Gasto em Anúncios: 100
   - Valor em Vendas: 500
   - Quantidade de Leads: 30
   - Quantidade de Vendas: 2
3. Clique em **"Salvar Lançamento"**
4. Vá para a aba **"Dashboard"** e veja as métricas calculadas

## Problemas Comuns

### Erro: "Erro ao carregar dados. Verifique a conexão com o Supabase"

**Solução:**
- Verifique se o arquivo `.env` foi criado corretamente
- Verifique se as credenciais estão corretas (sem espaços extras)
- Certifique-se de que executou o script SQL no Supabase

### Erro: "Failed to fetch"

**Solução:**
- Verifique sua conexão com internet
- Confirme que o projeto no Supabase está ativo (acesse o dashboard)
- Tente pausar e reiniciar o servidor de desenvolvimento (Ctrl+C e depois `npm run dev`)

### A página não abre no navegador

**Solução:**
- Verifique se a porta 5173 não está sendo usada por outro programa
- Tente fechar e abrir o terminal novamente
- Execute `npm run dev` novamente

## Próximos Passos

Após configurar e testar localmente, você pode:

1. **Fazer deploy gratuito no Vercel ou Netlify** (veja instruções no README.md)
2. **Adicionar dados reais** da sua empresa
3. **Personalizar** cores e layout conforme sua marca

## Precisa de Ajuda?

- Revise o arquivo `README.md` para mais detalhes
- Verifique a documentação do Supabase: [https://supabase.com/docs](https://supabase.com/docs)
- Verifique os logs no console do navegador (F12 > Console)
