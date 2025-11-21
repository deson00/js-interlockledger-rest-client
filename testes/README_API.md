# 🚀 API REST - SBR Prime IL2 Blockchain

API REST completa para registro e verificação de documentos na blockchain InterlockLedger (IL2).

## 📋 Índice

- [Instalação](#instalação)
- [Configuração](#configuração)
- [Iniciando o Servidor](#iniciando-o-servidor)
- [Endpoints](#endpoints)
- [Exemplos de Uso](#exemplos-de-uso)
- [Integração](#integração)

## 🔧 Instalação

```bash
npm install express cors axios
```

## ⚙️ Configuração

1. **Arquivo `.env`** (opcional):

```env
API_BASE_URL=https://minerva-data.il2.io:32068
API_CERTIFICATE_PATH=./rest.api.pfx
API_CERTIFICATE_PASSWORD=MultiKey
PORT=3000
NODE_ENV=production
```

2. **Certificado**: Certifique-se de que o arquivo `rest.api.pfx` está no diretório raiz.

## 🚀 Iniciando o Servidor

```bash
node api_server.js
```

O servidor estará disponível em: `http://localhost:3000`

## 📚 Endpoints

### 1. Portal de Verificação
```
GET /
```
Serve o portal HTML de verificação de documentos.

---

### 2. Health Check
```
GET /api/health
```

**Resposta:**
```json
{
  "status": "online",
  "timestamp": "2025-11-21T10:00:00.000Z",
  "service": "SBR Prime - IL2 Blockchain API",
  "version": "1.0.0"
}
```

---

### 3. Listar Cadeias
```
GET /api/chains
```

**Resposta:**
```json
{
  "success": true,
  "count": 1,
  "chains": [
    {
      "id": "lGWanNMRdfHJ4hUJi5-f04WoLhMIasYazcoxjSDq3Uk",
      "name": "Main Chain",
      "description": "Cadeia principal",
      "lastRecord": 150
    }
  ]
}
```

---

### 4. Informações da Cadeia
```
GET /api/chains/:chainId
```

**Parâmetros:**
- `chainId`: ID da cadeia

**Resposta:**
```json
{
  "success": true,
  "chain": {
    "id": "lGWanNMRdfHJ4hUJi5-f04WoLhMIasYazcoxjSDq3Uk",
    "name": "Main Chain",
    "lastRecord": 150,
    "activeApps": [1, 2, 8]
  }
}
```

---

### 5. Registrar Documento
```
POST /api/registrar
```

**Body:**
```json
{
  "documento": {
    "tipo": "CONTRATO",
    "titulo": "Contrato de Prestação de Serviços",
    "partes": {
      "contratante": {
        "nome": "Empresa XYZ",
        "cnpj": "12.345.678/0001-90"
      },
      "contratado": {
        "nome": "João Silva",
        "cpf": "123.456.789-00"
      }
    },
    "valor": "R$ 10.000,00"
  },
  "chainId": "lGWanNMRdfHJ4hUJi5-f04WoLhMIasYazcoxjSDq3Uk" // Opcional
}
```

**Resposta:**
```json
{
  "success": true,
  "resultado": {
    "serial": 151,
    "hashBlockchain": "F1NcvMZkJi-rnETX-M4YrCJIwUTQ7vP_QmWuQXdHyX8",
    "hashDocumento": "abc123...",
    "timestamp": "2025-11-21T10:00:00.000Z",
    "chainId": "lGWanNMRdfHJ4hUJi5-f04WoLhMIasYazcoxjSDq3Uk"
  },
  "certificado": {
    "titulo": "🔐 CERTIFICADO DE REGISTRO BLOCKCHAIN",
    "codigoVerificacao": "IL2-151-F1NCVMZK",
    "dados": {
      "serial": 151,
      "hashBlockchain": "F1NcvMZkJi-rnETX-M4YrCJIwUTQ7vP_QmWuQXdHyX8",
      "timestampRegistro": "2025-11-21T10:00:00.000Z"
    }
  },
  "arquivoCertificado": "certificados/certificado_151_1732186800000.json"
}
```

---

### 6. Verificar por Código
```
POST /api/verificar/codigo
```

**Body:**
```json
{
  "codigo": "IL2-151-F1NCVMZK",
  "documento": {
    "tipo": "CONTRATO",
    "titulo": "Contrato de Prestação de Serviços",
    ...
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "resultado": {
    "valido": true,
    "serial": 151,
    "chainId": "lGWanNMRdfHJ4hUJi5-f04WoLhMIasYazcoxjSDq3Uk",
    "hashBlockchain": "F1NcvMZkJi-rnETX-M4YrCJIwUTQ7vP_QmWuQXdHyX8",
    "hashDocumento": {
      "fornecido": "abc123...",
      "registrado": "abc123...",
      "corresponde": true
    },
    "timestamp": {
      "registro": "2025-11-21T10:00:00.000Z",
      "verificacao": "2025-11-21T11:00:00.000Z",
      "diferencaTempo": "1 hora(s) atrás"
    }
  }
}
```

---

### 7. Verificar por Serial
```
POST /api/verificar/serial
```

**Body:**
```json
{
  "serial": 151,
  "documento": { ... },
  "chainId": "lGWanNMRdfHJ4hUJi5-f04WoLhMIasYazcoxjSDq3Uk" // Opcional
}
```

**Resposta:** Igual ao endpoint de verificação por código.

---

### 8. Obter Certificado
```
GET /api/certificado/:serial
```

**Parâmetros:**
- `serial`: Número serial do registro

**Resposta:**
```json
{
  "success": true,
  "certificado": {
    "titulo": "🔐 CERTIFICADO DE REGISTRO BLOCKCHAIN",
    "codigoVerificacao": "IL2-151-F1NCVMZK",
    ...
  }
}
```

---

### 9. Download de Certificado
```
GET /api/certificado/:serial/download
```

Faz download do arquivo JSON do certificado.

---

### 10. Listar Registros
```
GET /api/registros?chainId=xxx&page=0&pageSize=10
```

**Query Parameters:**
- `chainId`: ID da cadeia (opcional)
- `page`: Número da página (padrão: 0)
- `pageSize`: Itens por página (padrão: 10)

**Resposta:**
```json
{
  "success": true,
  "chainId": "lGWanNMRdfHJ4hUJi5-f04WoLhMIasYazcoxjSDq3Uk",
  "registros": {
    "items": [
      {
        "serial": 151,
        "applicationId": 8,
        "hash": "F1NcvMZkJi-rnETX-M4YrCJIwUTQ7vP_QmWuQXdHyX8",
        ...
      }
    ]
  }
}
```

---

### 11. Obter Registro Específico
```
GET /api/registros/:chainId/:serial
```

**Parâmetros:**
- `chainId`: ID da cadeia
- `serial`: Número serial

**Resposta:**
```json
{
  "success": true,
  "registro": {
    "serial": 151,
    "hash": "F1NcvMZkJi-rnETX-M4YrCJIwUTQ7vP_QmWuQXdHyX8",
    "applicationId": 8,
    "payloadBytes": "eyJ0aXBvIjoiQ09OVFJBVE8iLCJ0aXR1bG8iOiJDb250...",
    ...
  }
}
```

---

### 12. Estatísticas
```
GET /api/estatisticas
```

**Resposta:**
```json
{
  "success": true,
  "estatisticas": {
    "totalCadeias": 1,
    "totalCertificadosEmitidos": 25,
    "timestamp": "2025-11-21T11:00:00.000Z"
  },
  "cadeias": [
    {
      "id": "lGWanNMRdfHJ4hUJi5-f04WoLhMIasYazcoxjSDq3Uk",
      "name": "Main Chain",
      "lastRecord": 151
    }
  ]
}
```

---

## 💡 Exemplos de Uso

### JavaScript/Node.js

```javascript
const axios = require('axios');

// Registrar documento
async function registrarDocumento() {
    const response = await axios.post('http://localhost:3000/api/registrar', {
        documento: {
            tipo: 'CONTRATO',
            titulo: 'Meu Contrato',
            partes: {
                contratante: 'Empresa A',
                contratado: 'Pessoa B'
            }
        }
    });

    console.log('Código de verificação:', response.data.certificado.codigoVerificacao);
    return response.data;
}

// Verificar documento
async function verificarDocumento(codigo, documento) {
    const response = await axios.post('http://localhost:3000/api/verificar/codigo', {
        codigo: codigo,
        documento: documento
    });

    console.log('Válido?', response.data.resultado.valido);
    return response.data;
}
```

### cURL

```bash
# Registrar documento
curl -X POST http://localhost:3000/api/registrar \
  -H "Content-Type: application/json" \
  -d '{"documento":{"tipo":"TESTE","titulo":"Documento Teste"}}'

# Verificar documento
curl -X POST http://localhost:3000/api/verificar/codigo \
  -H "Content-Type: application/json" \
  -d '{"codigo":"IL2-151-F1NCVMZK","documento":{"tipo":"TESTE","titulo":"Documento Teste"}}'
```

### Python

```python
import requests

# Registrar documento
def registrar_documento():
    url = 'http://localhost:3000/api/registrar'
    documento = {
        'documento': {
            'tipo': 'CONTRATO',
            'titulo': 'Meu Contrato'
        }
    }
    
    response = requests.post(url, json=documento)
    data = response.json()
    
    print(f"Código: {data['certificado']['codigoVerificacao']}")
    return data

# Verificar documento
def verificar_documento(codigo, documento):
    url = 'http://localhost:3000/api/verificar/codigo'
    payload = {
        'codigo': codigo,
        'documento': documento
    }
    
    response = requests.post(url, json=payload)
    data = response.json()
    
    print(f"Válido: {data['resultado']['valido']}")
    return data
```

---

## 🔗 Integração

### Frontend (React/Vue/Angular)

```javascript
// services/blockchainService.js
const API_URL = 'http://localhost:3000/api';

export const blockchainService = {
    async registrarDocumento(documento, chainId = null) {
        const response = await fetch(`${API_URL}/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documento, chainId })
        });
        return response.json();
    },

    async verificarDocumento(codigo, documento) {
        const response = await fetch(`${API_URL}/verificar/codigo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo, documento })
        });
        return response.json();
    },

    async obterCertificado(serial) {
        const response = await fetch(`${API_URL}/certificado/${serial}`);
        return response.json();
    }
};
```

### Webhooks

```javascript
// Adicionar notificação após registro
app.post('/api/registrar', async (req, res) => {
    // ... código de registro ...
    
    // Notificar sistema externo
    await axios.post('https://seu-sistema.com/webhook/documento-registrado', {
        serial: resultado.serial,
        codigo: certificado.codigoVerificacao,
        timestamp: resultado.timestamp
    });
    
    res.json({ ... });
});
```

---

## 🧪 Testes

Execute o script de testes:

```bash
node test_api.js
```

Isso testará todos os endpoints automaticamente.

---

## 🔒 Segurança

### Recomendações para Produção:

1. **HTTPS**: Use HTTPS em produção
2. **Autenticação**: Implemente JWT ou API Keys
3. **Rate Limiting**: Limite requisições por IP
4. **CORS**: Configure CORS adequadamente
5. **Validação**: Valide todos os inputs

### Exemplo com Autenticação:

```javascript
const jwt = require('jsonwebtoken');

// Middleware de autenticação
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        req.user = user;
        next();
    });
}

// Proteger endpoints
app.post('/api/registrar', authenticateToken, async (req, res) => {
    // ...
});
```

---

## 📊 Monitoramento

### Logs

Adicione logging estruturado:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

app.post('/api/registrar', async (req, res) => {
    logger.info('Registro iniciado', { 
        documento: req.body.documento.tipo,
        timestamp: new Date()
    });
    // ...
});
```

---

## 🐛 Troubleshooting

### Erro: "ENOENT: no such file or directory"
- Verifique se o arquivo `rest.api.pfx` existe
- Verifique se o diretório `certificados/` foi criado

### Erro: "Connection refused"
- Verifique se o servidor IL2 está acessível
- Confirme a URL base no `.env`

### Erro: "Certificate error"
- Verifique a senha do certificado
- Confirme que o certificado é válido

---

## 📞 Suporte

Para dúvidas ou problemas:
- 📧 Email: contato@sbrprime.com.br
- 📱 WhatsApp: +55 (67) 9 9281-1680
- 🌐 Website: https://www.sbrprime.com.br

---

**Desenvolvido com ❤️ pela SBR Prime**
