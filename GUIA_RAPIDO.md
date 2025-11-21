# 🚀 Guia Rápido - Sistema SBR Prime Blockchain

## ⚡ Começar Agora (3 passos)

### 1️⃣ Testar o Sistema
```bash
node teste_sistema_completo.js
```
**Resultado esperado:** ✅ TODOS OS TESTES PASSARAM

### 2️⃣ Iniciar a API
```bash
node api_server.js
```
**Acesse:** http://localhost:3000

### 3️⃣ Usar o Portal Web
1. Abra http://localhost:3000 no navegador
2. Preencha o formulário de registro
3. Clique em "Registrar Documento"
4. Receba o código de verificação
5. Use o código para verificar posteriormente

## 📝 Exemplos de Código

### Registrar Documento (Node.js)
```javascript
const { RegistroDocumentoV2 } = require('./registro_documento_v2');
const registrador = new RegistroDocumentoV2();

const doc = {
    tipo: 'NOTA_FISCAL',
    numero: 'NF-12345',
    valor: 'R$ 1.500,00',
    cliente: 'João da Silva'
};

const resultado = await registrador.registerDocument(doc);
console.log('Código:', resultado.certificate.codigoVerificacao);
// Saída: IL2-7-ABC12345
```

### Verificar Documento (Node.js)
```javascript
const verificacao = await registrador.verifyByCode('IL2-7-ABC12345');

if (verificacao.found) {
    console.log('✅ Documento válido!');
} else {
    console.log('❌ Documento não encontrado');
}
```

### Registrar via API (HTTP)
```bash
curl -X POST http://localhost:3000/api/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "documento": {
      "tipo": "CONTRATO",
      "numero": "CNTR-001",
      "valor": "R$ 10.000,00"
    }
  }'
```

### Verificar via API (HTTP)
```bash
curl -X POST http://localhost:3000/api/verificar/codigo \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "IL2-7-ABC12345"
  }'
```

## 🎯 Casos de Uso

### 1. Contratos
```javascript
const contrato = {
    tipo: 'CONTRATO_PRESTACAO_SERVICOS',
    numero: 'CNTR-2025-001',
    partes: {
        contratante: 'Empresa ABC Ltda',
        contratado: 'Fornecedor XYZ'
    },
    valor: 'R$ 50.000,00',
    vigencia: '12 meses'
};

await registrador.registerDocument(contrato);
```

### 2. Notas Fiscais
```javascript
const notaFiscal = {
    tipo: 'NOTA_FISCAL',
    numero: 'NF-12345',
    serie: '001',
    emissao: '2025-11-21',
    valor_total: 'R$ 15.000,00',
    itens: [
        { descricao: 'Produto A', valor: 'R$ 10.000,00' },
        { descricao: 'Produto B', valor: 'R$ 5.000,00' }
    ]
};

await registrador.registerDocument(notaFiscal);
```

### 3. Certificados
```javascript
const certificado = {
    tipo: 'CERTIFICADO_CONCLUSAO',
    aluno: 'Maria Santos',
    curso: 'Blockchain e Segurança',
    carga_horaria: '40 horas',
    data_conclusao: '2025-11-21'
};

await registrador.registerDocument(certificado);
```

### 4. Atas de Reunião
```javascript
const ata = {
    tipo: 'ATA_REUNIAO',
    data: '2025-11-21',
    participantes: ['João', 'Maria', 'Pedro'],
    assuntos: [
        'Aprovação do orçamento',
        'Planejamento 2026'
    ],
    decisoes: [
        'Aprovado orçamento de R$ 100.000,00',
        'Definido início do projeto para janeiro/2026'
    ]
};

await registrador.registerDocument(ata);
```

## 🔐 Segurança

### Hash SHA-256
Cada documento gera um hash único:
```
d200b51222acab75c862daa44fcab20eff3ab15457d03c6e406ab4819c8ed663
```

### Código de Verificação
Formato: `IL2-{SERIAL}-{HASH_PARCIAL}`
```
IL2-6-D200B512
```

### Criptografia
Documentos são automaticamente criptografados com AES256 pela blockchain IL2.

## 📊 Informações do Registro

Cada registro retorna:
```json
{
  "serial": 6,
  "hash": "d200b51222acab...",
  "chainId": "V6Ge5NDq1oScy-05K85xEzntKHYUMh9m5G-fI0wy1gA",
  "chainName": "SBR Soluções Chain #3",
  "network": "Minerva",
  "reference": "Minerva:V6Ge5NDq1oScy-05K85xEzntKHYUMh9m5G-fI0wy1gA@6",
  "timestamp": "2025-11-21T19:30:03.444Z",
  "codigoVerificacao": "IL2-6-D200B512"
}
```

## 🌐 Endpoints da API

### Registro
- **POST** `/api/registrar`
  - Body: `{ "documento": {...} }`
  - Response: Certificado completo + código

### Verificação
- **POST** `/api/verificar/codigo`
  - Body: `{ "codigo": "IL2-6-D200B512" }`
  - Response: Documento encontrado ou não

- **POST** `/api/verificar/serial`
  - Body: `{ "serial": 6 }`
  - Response: Documento encontrado ou não

### Consultas
- **GET** `/api/chains` - Lista cadeias
- **GET** `/api/chains/:chainId` - Info da cadeia
- **GET** `/api/registros` - Lista registros
- **GET** `/api/health` - Status da API

## ❓ Perguntas Frequentes

### Quanto tempo leva para registrar?
Aproximadamente 3-5 segundos.

### O documento fica público?
Não, ele é criptografado com AES256. Apenas quem tem as chaves pode ler o conteúdo completo.

### Posso deletar um registro?
Não, a blockchain é imutável. Uma vez registrado, o documento fica permanentemente gravado.

### Qual o tamanho máximo do documento?
Recomendado até 10MB. Documentos maiores podem falhar ou levar muito tempo.

### O código de verificação expira?
Não, ele é válido permanentemente enquanto a blockchain existir.

### Posso registrar o mesmo documento duas vezes?
Sim, mas cada registro terá um serial e hash diferentes (devido ao timestamp).

## 🐛 Resolução de Problemas

### Erro: "Cadeia não encontrada"
**Solução:** Verifique se o certificado `rest.api.pfx` está presente e correto.

### Erro: "License not present"
**Solução:** Este erro não ocorre mais com o endpoint `/jsonDocuments@`. Se ocorrer, verifique o certificado.

### Documento não aparece na verificação
**Solução:** Aguarde alguns segundos. A blockchain pode levar um tempo para sincronizar.

### API não inicia
**Solução:** 
1. Verifique se a porta 3000 está livre
2. Execute `npm install` novamente
3. Verifique se o arquivo `rest.api.pfx` existe

## 📞 Suporte

### Logs
Os logs detalhados aparecem no console quando você executa os scripts.

### Testes
Execute `node teste_sistema_completo.js` para validar se tudo está funcionando.

### Documentação Completa
Consulte `README_SISTEMA_FUNCIONAL.md` para detalhes técnicos completos.

---

**Status:** ✅ FUNCIONANDO 100%

**Última Atualização:** 21/11/2025
