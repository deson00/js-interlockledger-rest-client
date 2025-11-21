# 🔐 Sistema de Registro e Verificação de Documentos - SBR Prime

## ✅ SISTEMA TOTALMENTE FUNCIONAL

Este sistema permite registrar documentos na blockchain InterlockLedger (IL2) e verificar sua autenticidade posteriormente.

## 📋 Componentes Principais

### 1. `registro_documento_v2.js` - Motor de Registro ✨
**Status: ✅ FUNCIONANDO PERFEITAMENTE**

O módulo que realmente funciona! Usa o endpoint `/jsonDocuments@{chainId}` que é compatível com a cadeia SBR Soluções Chain #3.

**Características:**
- ✅ Registra documentos JSON na blockchain IL2
- ✅ Criptografa automaticamente com AES256
- ✅ Gera certificados digitais de registro
- ✅ Calcula hash SHA-256 dos documentos
- ✅ Cria códigos de verificação únicos
- ✅ Salva certificados em arquivo JSON

**Cadeia utilizada:**
- **ID:** `V6Ge5NDq1oScy-05K85xEzntKHYUMh9m5G-fI0wy1gA`
- **Nome:** SBR Soluções Chain #3
- **Application ID:** 8
- **Payload Tag ID:** 2100 (atribuído automaticamente)
- **Network:** Minerva

### 2. `api_server.js` - API REST
**Status: ✅ ATUALIZADO E FUNCIONAL**

Servidor Express que expõe endpoints para registro e verificação de documentos.

**Endpoints principais:**
- `POST /api/registrar` - Registra documento na blockchain
- `POST /api/verificar/codigo` - Verifica documento por código
- `POST /api/verificar/serial` - Verifica documento por serial
- `GET /api/chains` - Lista cadeias disponíveis
- `GET /api/registros` - Lista registros da cadeia

### 3. `portal_verificacao.html` - Interface Web
Portal web com branding SBR Prime para registro e verificação de documentos.

### 4. `teste_sistema_completo.js` - Suite de Testes
Script completo que testa todo o fluxo:
1. Registro de documento
2. Verificação por serial
3. Verificação por código
4. Geração de certificado

## 🚀 Como Usar

### Pré-requisitos
```bash
# Instalar dependências
npm install
```

### Arquivos necessários
- `rest.api.pfx` - Certificado de autenticação (senha: "MultiKey")
- `.env` - Variáveis de ambiente (opcional, usa valores padrão)

### 1. Registrar um documento

```javascript
const { RegistroDocumentoV2 } = require('./registro_documento_v2');

const registrador = new RegistroDocumentoV2();

const documento = {
    tipo: 'CONTRATO',
    titulo: 'Meu Documento',
    conteudo: 'Dados do documento...',
    // ... outros campos
};

const resultado = await registrador.registerDocument(documento);

console.log(`Serial: ${resultado.serial}`);
console.log(`Hash: ${resultado.hash}`);
console.log(`Código: ${resultado.certificate.codigoVerificacao}`);
```

### 2. Verificar um documento

```javascript
// Por serial
const verificacao = await registrador.verifyBySerial(6);

// Por código
const verificacao = await registrador.verifyByCode('IL2-6-D200B512');

if (verificacao.found) {
    console.log('Documento encontrado!', verificacao.document);
}
```

### 3. Executar teste completo

```bash
node teste_sistema_completo.js
```

### 4. Iniciar API REST

```bash
node api_server.js
```

Acesse http://localhost:3000 para usar o portal web.

## 📊 Resultados de Testes

### ✅ Último Teste Bem-Sucedido
**Data:** 2025-11-21 19:30:07 UTC

```
Serial: 6
Hash: d200b51222acab75c862daa44fcab20eff3ab15457d03c6e406ab4819c8ed663
Código: IL2-6-D200B512
Referência: Minerva:V6Ge5NDq1oScy-05K85xEzntKHYUMh9m5G-fI0wy1gA@6

TODOS OS TESTES: ✅ PASSOU
- Registro na blockchain: ✅
- Verificação por serial: ✅
- Verificação por código: ✅
- Geração de certificado: ✅
```

## 🔑 Formato do Certificado

O certificado gerado tem a seguinte estrutura:

```json
{
  "titulo": "🔐 CERTIFICADO DE REGISTRO BLOCKCHAIN - SBR PRIME",
  "versao": "2.0",
  "emissao": "2025-11-21T19:30:07.000Z",
  "dados": {
    "serial": 6,
    "chainId": "V6Ge5NDq1oScy-05K85xEzntKHYUMh9m5G-fI0wy1gA",
    "chainName": "SBR Soluções Chain #3",
    "network": "Minerva",
    "reference": "Minerva:V6Ge5NDq1oScy-05K85xEzntKHYUMh9m5G-fI0wy1gA@6",
    "hashDocumento": "d200b51222acab...",
    "timestampRegistro": "2025-11-21T19:30:03.444Z",
    "urlVerificacao": "https://minerva-data.il2.io:32068/jsonDocuments@..."
  },
  "codigoVerificacao": "IL2-6-D200B512",
  "documentoOriginal": { /* documento registrado */ },
  "instrucoes": { /* como verificar */ },
  "assinatura_digital": {
    "algoritmo": "SHA-256",
    "hash": "d200b51222acab...",
    "blockchain": "InterlockLedger (IL2)",
    "network": "Minerva"
  }
}
```

## 🔍 Como Funciona a Verificação

1. **Usuário recebe certificado** com código de verificação (ex: `IL2-6-D200B512`)
2. **Sistema extrai o serial** do código (6)
3. **Busca o documento na blockchain** usando o serial
4. **Compara o hash** do documento fornecido com o registrado
5. **Confirma autenticidade** se os hashes coincidirem

## 🛠️ Solução Técnica

### Problema Original
Os primeiros testes falhavam com erro "Payload tagged as 123 is unsupported!" porque:
- Endpoint `/records@{chainId}` requer formato ILInt específico
- A cadeia não aceitava payloadTagId personalizado
- Formato JSON não era compatível com esse endpoint

### Solução Implementada
Usar endpoint `/jsonDocuments@{chainId}`:
- ✅ Aceita JSON diretamente
- ✅ Criptografa automaticamente (AES256)
- ✅ Atribui payloadTagId correto (2100)
- ✅ Registra na aplicação 8 (compatível com a cadeia)
- ✅ Retorna serial para verificação posterior

### Por Que Funciona
O arquivo `il2_test.js` já usava este padrão e funcionava. Adaptamos toda a solução para seguir o mesmo approach.

## 📁 Estrutura de Arquivos

```
.
├── registro_documento_v2.js      ✅ Motor de registro (FUNCIONANDO)
├── registro_documento.js          ⚠️  Versão antiga (não usar)
├── verificacao_documento.js       ✅ Sistema de verificação
├── api_server.js                  ✅ API REST (atualizada)
├── portal_verificacao.html        ✅ Portal web
├── teste_sistema_completo.js      ✅ Testes automatizados
├── il2_test.js                    📚 Referência (código original que funcionou)
├── certificados/                  📁 Certificados gerados
├── rest.api.pfx                   🔐 Certificado de autenticação
└── .env                           ⚙️  Configurações (opcional)
```

## 🎯 Próximos Passos

### Já Implementado ✅
- [x] Registro de documentos JSON
- [x] Geração de certificados
- [x] Verificação por serial
- [x] Verificação por código
- [x] API REST completa
- [x] Portal web com branding SBR Prime
- [x] Testes automatizados

### Melhorias Futuras (Opcional)
- [ ] Descriptografia dos documentos (requer chaves privadas)
- [ ] Upload de arquivos binários
- [ ] Histórico de registros por usuário
- [ ] Dashboard administrativo
- [ ] Integração com e-mail para envio de certificados
- [ ] QR Code no certificado

## 📞 Suporte

Para questões técnicas sobre a blockchain IL2:
- **API Base:** https://minerva-data.il2.io:32068
- **Network:** Minerva
- **Chain ID:** V6Ge5NDq1oScy-05K85xEzntKHYUMh9m5G-fI0wy1gA

## 📝 Licença

Este projeto é parte do sistema SBR Prime.

---

**Status do Projeto:** ✅ PRODUÇÃO - TOTALMENTE FUNCIONAL

**Última Atualização:** 21/11/2025

**Versão:** 2.0.0
