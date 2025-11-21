# 🚀 INICIAR SISTEMA - SBR Prime Blockchain

## ⚡ INÍCIO RÁPIDO (3 PASSOS)

### 1️⃣ Instalar Dependências (Apenas 1ª vez)
```bash
npm install
```

### 2️⃣ Iniciar o Servidor
```bash
node api_server.js
```

**Você verá:**
```
======================================================================
🚀 API REST SBR PRIME - IL2 BLOCKCHAIN
======================================================================
✅ Servidor rodando na porta 3000
🌐 URL: http://localhost:3000
```

### 3️⃣ Acessar o Portal
Abra no navegador:
```
http://localhost:3000
```

🎉 **PRONTO! Sistema funcionando!**

---

## 📋 SERVIÇOS NECESSÁRIOS

### ✅ Serviço Principal

**1. API Server** (OBRIGATÓRIO)
```bash
node api_server.js
```
- Inicia na porta 3000
- Serve o portal web
- Conecta com blockchain IL2
- **Mantenha este terminal aberto!**

### ℹ️ Serviços Externos

**Blockchain IL2** (já está rodando)
- URL: https://minerva-data.il2.io:32068
- Network: Minerva
- ✅ Não precisa configurar nada!

---

## 🎯 COMO USAR

### 📝 Registrar Documento

**No navegador (http://localhost:3000):**

1. Clique na aba **"Registro de Documento"**
2. Preencha o formulário:
   ```json
   {
     "tipo": "CONTRATO",
     "numero": "CNTR-001",
     "cliente": "João Silva",
     "valor": "R$ 10.000,00"
   }
   ```
3. Clique em **"Registrar Documento"**
4. **Guarde o código** gerado: `IL2-10-ABC12345`

**Arquivos gerados automaticamente:**
- 📁 `certificados/certificado_10_*.json` - Certificado
- 📁 `documentos_originais/documento_10_*.json` - JSON original

### 🔍 Verificar Documento

**No navegador (http://localhost:3000):**

1. Clique na aba **"Verificação por Certificado"**
2. Digite o código: `IL2-10-ABC12345`
3. Campo JSON: **deixe em branco** (opcional)
4. Clique em **"Verificar Documento"**
5. ✅ Veja o resultado!

---

## 📁 ESTRUTURA DE ARQUIVOS

### ✅ Arquivos Principais (Usar)

```
js-interlockledger-rest-client/
├── api_server.js                    ⭐ SERVIDOR PRINCIPAL
├── registro_documento_v2.js         ⭐ Motor de registro
├── verificacao_documento.js         ⭐ Sistema de verificação
├── portal_verificacao.html          ⭐ Interface web
├── package.json                     ⭐ Dependências
├── rest.api.pfx                     ⭐ Certificado (obrigatório)
├── .env                             ⭐ Configurações
│
├── certificados/                    📁 Certificados gerados
├── documentos_originais/            📁 JSON dos documentos
│
├── INICIAR.md                       📖 Este arquivo
├── COMO_USAR.md                     📖 Guia detalhado
├── README_SISTEMA_FUNCIONAL.md      📖 Documentação técnica
└── GUIA_RAPIDO.md                   📖 Exemplos de código
```

### 🗂️ Arquivos Organizados (Não usar diretamente)

```
├── testes/                          📁 Arquivos de desenvolvimento
│   ├── il2_test.js
│   ├── teste_sistema_completo.js
│   ├── teste_arquivos.js
│   └── ... (outros arquivos de teste)
```

---

## 🧪 TESTES (Opcional)

### Testar Sistema Completo
```bash
node testes/teste_sistema_completo.js
```

**Resultado esperado:**
```
🎉 TODOS OS TESTES PASSARAM COM SUCESSO!
✅ Registro na blockchain: SUCESSO
✅ Verificação por serial: SUCESSO
✅ Verificação por código: SUCESSO
✅ Geração de certificado: SUCESSO
```

### Testar Geração de Arquivos
```bash
node testes/teste_arquivos.js
```

**Verifica:**
- ✅ Criação do certificado
- ✅ Criação do JSON original
- ✅ Salvamento em pastas corretas

---

## ❓ PROBLEMAS COMUNS

### Erro: "Cannot find module 'express'"
**Solução:**
```bash
npm install
```

### Erro: "Port 3000 is already in use"
**Solução:**
```bash
# Encerre o processo na porta 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Ou use outra porta
$env:PORT=3001; node api_server.js
```

### Erro: "rest.api.pfx not found"
**Solução:**
- Verifique se o arquivo `rest.api.pfx` está na pasta raiz
- Senha do certificado: `MultiKey`

### Portal não abre
**Solução:**
1. Verifique se o servidor está rodando: `node api_server.js`
2. Aguarde a mensagem: "✅ Servidor rodando na porta 3000"
3. Acesse: http://localhost:3000

---

## 🎮 WORKFLOW COMPLETO

```
1. INICIAR SERVIDOR
   ├─> node api_server.js
   └─> Aguardar: "✅ Servidor rodando"

2. ACESSAR PORTAL
   ├─> http://localhost:3000
   └─> Portal carrega

3. REGISTRAR DOCUMENTO
   ├─> Preencher formulário
   ├─> Clicar "Registrar"
   ├─> Aguardar 3-5 segundos
   └─> ✅ Código gerado: IL2-X-HASH

4. VERIFICAR DOCUMENTO
   ├─> Clicar em "Verificação"
   ├─> Digite código: IL2-X-HASH
   ├─> Campo JSON: [vazio]
   └─> ✅ Documento verificado!
```

---

## 📊 ENDPOINTS DA API (Para desenvolvedores)

Se precisar integrar com outro sistema:

```bash
# Registrar documento
POST http://localhost:3000/api/registrar
Body: { "documento": {...} }

# Verificar por código
POST http://localhost:3000/api/verificar/codigo
Body: { "codigo": "IL2-10-ABC12345" }

# Listar cadeias
GET http://localhost:3000/api/chains

# Status da API
GET http://localhost:3000/api/health
```

Documentação completa: `GUIA_RAPIDO.md`

---

## 🔐 SEGURANÇA

### Arquivos Sensíveis (NÃO compartilhar)
- ❌ `rest.api.pfx` - Certificado privado
- ❌ `.env` - Configurações sensíveis
- ❌ `certificados/*` - Certificados gerados

### Arquivos Seguros (Pode compartilhar)
- ✅ Código de verificação (IL2-X-HASH)
- ✅ Documentação (*.md)
- ✅ Portal HTML

---

## 📞 SUPORTE

### Documentação Disponível

1. **INICIAR.md** (este arquivo) - Como iniciar o sistema
2. **COMO_USAR.md** - Guia de uso detalhado
3. **GUIA_RAPIDO.md** - Exemplos de código
4. **README_SISTEMA_FUNCIONAL.md** - Documentação técnica

### Informações Técnicas

- **Blockchain:** InterlockLedger (IL2)
- **Network:** Minerva
- **Chain ID:** V6Ge5NDq1oScy-05K85xEzntKHYUMh9m5G-fI0wy1gA
- **Chain Name:** SBR Soluções Chain #3
- **Application ID:** 8
- **Payload Tag ID:** 2100

---

## ✅ CHECKLIST DE INÍCIO

Antes de começar, verifique:

- [ ] Node.js instalado (versão 14+)
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `rest.api.pfx` presente
- [ ] Arquivo `.env` presente (ou usar valores padrão)
- [ ] Porta 3000 livre

**Tudo OK?** Execute: `node api_server.js` 🚀

---

## 🎯 RESUMO EXECUTIVO

### Para Iniciar:
```bash
node api_server.js
```

### Para Acessar:
```
http://localhost:3000
```

### Para Registrar:
- Aba "Registro" → Preencher formulário → Registrar

### Para Verificar:
- Aba "Verificação" → Digite código → Verificar

**Simples assim!** ✨

---

**Status:** ✅ Sistema Pronto para Produção  
**Versão:** 2.1.0  
**Data:** 21/11/2025
