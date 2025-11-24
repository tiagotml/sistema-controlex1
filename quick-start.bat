@echo off
echo ========================================
echo TRANSCRIPTOR - Quick Start
echo ========================================
echo.

REM Verifica se o Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale o Node.js em: https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js encontrado
echo.

REM Verifica se o arquivo .env existe
if not exist .env (
    echo [AVISO] Arquivo .env nao encontrado!
    echo.
    echo Criando arquivo .env a partir do .env.example...
    copy .env.example .env
    echo.
    echo [IMPORTANTE] Edite o arquivo .env com suas credenciais do Supabase
    echo antes de continuar.
    echo.
    echo Pressione qualquer tecla apos configurar o .env...
    pause
)

echo [OK] Arquivo .env encontrado
echo.

REM Verifica se node_modules existe
if not exist node_modules (
    echo Instalando dependencias...
    echo Isso pode levar alguns minutos...
    echo.
    call npm install
    echo.
    echo [OK] Dependencias instaladas!
    echo.
)

echo ========================================
echo Iniciando servidor de desenvolvimento...
echo ========================================
echo.
echo O navegador abrira automaticamente em:
echo http://localhost:5173
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

call npm run dev
