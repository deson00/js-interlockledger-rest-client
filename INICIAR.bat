@echo off
chcp 65001 >nul
cls
echo.
echo ═══════════════════════════════════════════════════════════════════════
echo            🚀 SBR PRIME - SISTEMA BLOCKCHAIN IL2
echo ═══════════════════════════════════════════════════════════════════════
echo.
echo 📋 Verificando requisitos...
echo.

REM Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado! Por favor, instale Node.js primeiro.
    echo    Download: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js instalado

REM Verificar certificado
if not exist "rest.api.pfx" (
    echo ❌ Certificado rest.api.pfx não encontrado!
    echo    Verifique se o arquivo está na pasta raiz.
    pause
    exit /b 1
)
echo ✅ Certificado encontrado

REM Verificar dependências
if not exist "node_modules" (
    echo.
    echo 📦 Instalando dependências...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependências!
        pause
        exit /b 1
    )
    echo ✅ Dependências instaladas
)

echo.
echo ═══════════════════════════════════════════════════════════════════════
echo.
echo ✅ Sistema pronto para iniciar!
echo.
echo 🌐 O servidor será iniciado em: http://localhost:3000
echo.
echo 💡 Para usar o sistema:
echo    1. Aguarde a mensagem "Servidor rodando"
echo    2. Abra seu navegador em: http://localhost:3000
echo    3. Use as abas "Registro" e "Verificação"
echo.
echo ⚠️  Mantenha esta janela aberta enquanto usa o sistema!
echo.
echo ═══════════════════════════════════════════════════════════════════════
echo.
echo 🚀 Iniciando servidor...
echo.

node api_server.js
