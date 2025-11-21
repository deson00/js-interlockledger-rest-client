# 🔐 Sistema de Verificação de Documentos IL2

## 📋 Visão Geral

Este sistema permite que documentos sejam registrados na blockchain InterlockLedger (IL2) e posteriormente verificados por qualquer pessoa, garantindo autenticidade e imutabilidade.

## 🎯 Como Funciona

### 1️⃣ Registro de Documentos

Quando um documento é registrado:

```javascript
const { RegistroDocumento } = require('./registro_documento');

// 1. Sistema calcula hash SHA-256 do documento
// 2. Adiciona timestamp e metadados
// 3. Envia para blockchain IL2
// 4. Recebe serial e hash da blockchain
// 5. Gera certificado com código de verificação
```

**O que o usuário recebe:**
- 📜 Certificado digital (JSON)
- 🎫 Código de verificação único (Ex: `IL2-123-ABCD1234`)
- 🔐 Hash do documento original
- 🔢 Número serial do registro

### 2️⃣ Verificação de Documentos

Qualquer pessoa pode verificar um documento:

```javascript
const { VerificacaoDocumento } = require('./verificacao_documento');

// 1. Usuário fornece código de verificação ou serial
// 2. Sistema busca registro na blockchain
// 3. Calcula hash do documento fornecido
// 4. Compara com hash registrado
// 5. Confirma autenticidade
```

## 🚀 Uso Prático

### Registrar um Documento

```javascript
const { RegistroDocumento } = require('./registro_documento');
const https = require('https');
const fs = require('fs');

// Configurar cliente
const agent = new https.Agent({
    pfx: fs.readFileSync('rest.api.pfx'),
    passphrase: 'MultiKey',
    rejectUnauthorized: false
});

const registrador = new RegistroDocumento('https://minerva-data.il2.io:32068', agent);

// Documento para registrar
const documento = {
    tipo: 'CONTRATO',
    titulo: 'Contrato de Prestação de Serviços',
    partes: {
        contratante: { nome: 'Empresa XYZ', cnpj: '12.345.678/0001-90' },
        contratado: { nome: 'João Silva', cpf: '123.456.789-00' }
    },
    valor: 'R$ 10.000,00'
};

// Registrar
const resultado = await registrador.registrarDocumento(chainId, documento);

// Gerar certificado
const certificado = registrador.gerarCertificado(resultado);
registrador.salvarCertificado(certificado, 'certificado.json');

console.log(`Código de verificação: ${certificado.codigoVerificacao}`);
// Saída: IL2-123-ABCD1234
```

### Verificar um Documento

#### Opção 1: Por Código de Verificação

```javascript
const { VerificacaoDocumento } = require('./verificacao_documento');

const verificador = new VerificacaoDocumento('https://minerva-data.il2.io:32068', agent);

// Documento que o usuário quer verificar (deve ser EXATAMENTE o mesmo)
const documentoParaVerificar = {
    tipo: 'CONTRATO',
    titulo: 'Contrato de Prestação de Serviços',
    // ... resto do documento
};

// Verificar usando código
const resultado = await verificador.verificarPorCodigo(
    'IL2-123-ABCD1234',
    documentoParaVerificar
);

if (resultado.valido) {
    console.log('✅ Documento AUTÊNTICO!');
} else {
    console.log('❌ Documento NÃO autêntico!');
}
```

#### Opção 2: Por Arquivo de Certificado

```javascript
const resultado = await verificador.verificarPorCertificado(
    './certificado.json',
    documentoParaVerificar
);
```

#### Opção 3: Por Serial

```javascript
const resultado = await verificador.verificarPorSerial(
    123, // serial do registro
    documentoParaVerificar
);
```

## 🌐 Portal Web de Verificação

Incluso um portal HTML (`portal_verificacao.html`) que permite verificação via navegador:

### Recursos do Portal:
- ✅ Interface amigável e intuitiva
- 📤 Upload de certificados JSON
- 🔍 Verificação em tempo real
- 📊 Resultados detalhados
- 📱 Responsivo (mobile-friendly)

### Como Usar o Portal:

1. Abra `portal_verificacao.html` no navegador
2. Insira o código de verificação (Ex: `IL2-123-ABCD1234`)
3. Cole o JSON do documento original
4. OU carregue o arquivo de certificado JSON
5. Clique em "Verificar Documento"

**Nota:** Para produção, conecte o portal a uma API Node.js que faça as chamadas à blockchain.

## 🔒 Segurança e Garantias

### O que o Sistema Garante:

✅ **Imutabilidade**: Uma vez registrado, o documento não pode ser alterado  
✅ **Timestamp**: Data e hora exata do registro  
✅ **Autenticidade**: Hash criptográfico garante integridade  
✅ **Transparência**: Qualquer um pode verificar usando o código  
✅ **Descentralização**: Registrado em blockchain distribuída  

### O que Não Garante:

❌ Não valida se o conteúdo do documento é verdadeiro  
❌ Não garante identidade das partes (precisa de PKI adicional)  
❌ Não impede cópias do documento (só prova qual é o original registrado)  

## 📊 Fluxo Completo

```
┌─────────────────┐
│  1. REGISTRO    │
│                 │
│ Documento       │
│      ↓          │
│ Calcular Hash   │
│      ↓          │
│ Enviar IL2      │
│      ↓          │
│ Receber Serial  │
│      ↓          │
│ Gerar Cert.     │
└─────────────────┘
         │
         ↓
┌─────────────────┐
│  CERTIFICADO    │
│                 │
│ • Serial: 123   │
│ • Código: IL2-  │
│   123-ABCD1234  │
│ • Hash: abc...  │
│ • Timestamp     │
└─────────────────┘
         │
         ↓
┌─────────────────┐
│  2. VERIFICAÇÃO │
│                 │
│ Documento +     │
│ Código          │
│      ↓          │
│ Buscar IL2      │
│      ↓          │
│ Calcular Hash   │
│      ↓          │
│ Comparar        │
│      ↓          │
│ ✅ ou ❌        │
└─────────────────┘
```

## 💡 Casos de Uso

### 1. Contratos
- Registrar contratos antes da assinatura
- Provar que termos não foram alterados
- Verificar autenticidade de cópias

### 2. Diplomas e Certificados
- Instituições registram diplomas
- Empregadores verificam autenticidade
- Elimina fraudes

### 3. Documentos Legais
- Testamentos
- Procurações
- Atas de reunião

### 4. Propriedade Intelectual
- Registro de criação (timestamp)
- Prova de autoria
- Proteção de ideias

### 5. Registros Médicos
- Laudos
- Prescrições
- Histórico de tratamentos

## 🛠️ Integração em Sistemas

### API REST (Exemplo)

```javascript
const express = require('express');
const app = express();

app.post('/api/registrar', async (req, res) => {
    const documento = req.body.documento;
    const resultado = await registrador.registrarDocumento(chainId, documento);
    const certificado = registrador.gerarCertificado(resultado);
    res.json(certificado);
});

app.post('/api/verificar', async (req, res) => {
    const { codigo, documento } = req.body;
    const resultado = await verificador.verificarPorCodigo(codigo, documento);
    res.json(resultado);
});

app.listen(3000);
```

### Webhooks (Notificações)

```javascript
// Notificar quando documento for registrado
async function notificarRegistro(resultado) {
    await axios.post('https://seu-sistema.com/webhook/registro', {
        evento: 'documento_registrado',
        serial: resultado.serial,
        hash: resultado.hashBlockchain,
        timestamp: resultado.timestamp
    });
}
```

## 📱 Aplicação Mobile

O sistema pode ser adaptado para apps mobile:

- React Native
- Flutter
- Ionic

Permitindo:
- Escanear QR Code com código de verificação
- Fotografar documento e verificar
- Notificações push de novos registros

## 🔄 Melhorias Futuras

### Curto Prazo:
- [ ] QR Code no certificado
- [ ] PDF do certificado
- [ ] Email automático com certificado
- [ ] API REST completa

### Médio Prazo:
- [ ] Assinatura digital (PKI)
- [ ] Multi-party signatures
- [ ] Controle de acesso (quem pode verificar)
- [ ] Dashboard de gestão

### Longo Prazo:
- [ ] Smart contracts para workflows
- [ ] Integração com cartórios
- [ ] App mobile nativo
- [ ] Blockchain própria

## 🐛 Troubleshooting

### Erro: "Registro não encontrado"
- Verifique se o serial está correto
- Confirme que está usando a chain correta
- Aguarde alguns segundos (propagação)

### Erro: "Hashes não correspondem"
- Documento foi modificado
- Formatação JSON diferente (espaços, ordem)
- Encoding diferente (UTF-8 vs outros)

### Solução: Normalizar JSON
```javascript
// Sempre normalizar antes de calcular hash
const normalizado = JSON.stringify(JSON.parse(jsonString));
```

## 📞 Suporte

Para dúvidas ou problemas:
- 📧 Email: suporte@seudominio.com
- 📚 Docs: https://il2.io/docs
- 💬 Discord: https://discord.gg/il2

## 📄 Licença

ISC License

---

**Desenvolvido com ❤️ para garantir autenticidade e confiança em documentos digitais.**
