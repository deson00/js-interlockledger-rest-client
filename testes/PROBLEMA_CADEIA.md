# ⚠️ IMPORTANTE: Limitações da Cadeia Atual

## Problema Identificado

A cadeia `V6Ge5NDq1oScy-05K85xEzntKHYUMh9m5G-fI0wy1gA` (SBR Soluções Chain #3) está retornando erro:

```
Payload tagged as 123 is unsupported!
```

## Análise Técnica

- **Tag 123** corresponde ao caractere `{` (início de JSON)
- A API do IL2 está interpretando o primeiro byte do payload como uma "tag"
- Esta cadeia específica **NÃO aceita payloads JSON arbitrários**

## Registros Existentes na Cadeia

Análise dos registros 0-3 mostra:
- Registro 0: App 0, Tag 128 (Root/Genesis)
- Registro 1: App 1, Tag 300 (16 bytes binários)
- Registro 2: App 2, Tag 500 (1161 bytes binários)
- Registro 3: App 5, Tag 701 (1776 bytes binários)

**Todos os registros existentes usam dados binários específicos, NÃO JSON.**

## Soluções Possíveis

### Opção 1: Usar Outra Cadeia ✅ RECOMENDADO

Solicite ao administrador do IL2 uma cadeia que:
- Aceite **applicationId 8** (JSON Document)
- Permita payloads JSON arbitrários
- Tenha tags configuradas para documentos (300, 400, etc.)

### Opção 2: Configurar a Cadeia Atual

Entre em contato com o administrador e solicite:
```
- Habilitar suporte para tag 123 (JSON bruto)
- OU configurar applicationId 8 para aceitar JSON
- OU fornecer especificação do formato de payload aceito
```

### Opção 3: Usar Formato Binário Proprietário

Se a cadeia exige formato binário específico:
1. Obter especificação do formato da InterlockLedger
2. Implementar serialização customizada
3. Converter JSON → Binário IL2

## Testes Realizados

✅ Tentativas com diferentes applicationId: 1, 2, 3, 8, 10  
✅ Tentativas com payloadTagId: 300, 500, 701  
✅ Tentativas com encoding ILInt  
✅ Tentativas sem tag especificada  
❌ **Todas falharam com "tag 123 não suportada"**

## Recomendação Imediata

**Solicite ao suporte da SBR Prime/InterlockLedger:**

```
Olá,

Estou tentando registrar documentos JSON na cadeia:
V6Ge5NDq1oScy-05K85xEzntKHYUMh9m5G-fI0wy1gA

Mas recebo erro: "Payload tagged as 123 is unsupported!"

Questões:
1. Esta cadeia aceita payloads JSON?
2. Qual applicationId devo usar para documentos JSON?
3. Existe outra cadeia disponível para este propósito?
4. Qual é o formato de payload aceito?

Certificado: rest.api.pfx
Endpoint: https://minerva-data.il2.io:32068
```

## Workaround Temporário

Enquanto não resolve com o suporte, você pode:

1. **Codificar JSON como texto** (não recomendado):
   - Converter JSON para texto plano
   - Registrar como string UTF-8
   - Mas ainda terá problema com a tag

2. **Usar campo de metadados** (se disponível):
   - Alguns apps IL2 têm campos de metadados
   - Armazenar JSON lá em vez do payload principal

3. **Registrar hash apenas**:
   - Registrar apenas o hash do documento
   - Armazenar documento completo fora da blockchain
   - Blockchain serve como prova de integridade

## Contatos de Suporte

- 📧 Email: contato@sbrprime.com.br
- 📱 WhatsApp: +55 (67) 9 9281-1680
- 🌐 Website: https://www.sbrprime.com.br

---

**Data da Análise:** 21 de novembro de 2025  
**Status:** ⏳ Aguardando configuração da cadeia ou indicação de cadeia alternativa
