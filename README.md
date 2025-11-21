# 🔐 Sistema de Registro Blockchain - SBR Prime

Sistema completo de registro e verificação de documentos na blockchain InterlockLedger (IL2).

## ⚡ INÍCIO RÁPIDO

### Windows
```bash
# Duplo clique no arquivo:
INICIAR.bat
```

### Ou execute manualmente:
```bash
node api_server.js
```

Acesse: **http://localhost:3000**

---

## 📚 DOCUMENTAÇÃO

| Arquivo | Descrição |
|---------|-----------|
| **[INICIAR.md](INICIAR.md)** ⭐ | **Como iniciar o sistema** |
| [COMO_USAR.md](COMO_USAR.md) | Guia de uso completo |
| [GUIA_RAPIDO.md](GUIA_RAPIDO.md) | Exemplos práticos |
| [README_SISTEMA_FUNCIONAL.md](README_SISTEMA_FUNCIONAL.md) | Documentação técnica |

---

## 🎯 O QUE FAZ

### ✅ Registrar Documentos
- Registra qualquer documento JSON na blockchain
- Gera certificado digital automaticamente
- Cria código de verificação único
- Salva arquivos de referência

### ✅ Verificar Autenticidade
- Verifica documentos com código simples
- Consulta blockchain automaticamente
- Valida integridade do documento
- Interface web amigável

---

## 📁 ARQUIVOS PRINCIPAIS

```
📦 Arquivos de Produção (USE ESTES)
├── 🚀 INICIAR.bat                    Duplo-clique para iniciar!
├── ⭐ api_server.js                  Servidor principal
├── ⭐ registro_documento_v2.js       Motor de registro
├── ⭐ verificacao_documento.js      Sistema de verificação
├── ⭐ portal_verificacao.html       Interface web
├── 📝 INICIAR.md                     Como iniciar
├── 📝 COMO_USAR.md                   Guia de uso
└── 🔐 rest.api.pfx                   Certificado (obrigatório)

📁 Pastas Geradas Automaticamente
├── certificados/                    Certificados dos documentos
└── documentos_originais/            JSON original dos documentos

📂 Desenvolvimento (pode ignorar)
└── testes/                          Arquivos de teste
```

---

## 🚀 WORKFLOW

```
1️⃣ INICIAR
   Execute: INICIAR.bat
   
2️⃣ ACESSAR
   Abra: http://localhost:3000
   
3️⃣ REGISTRAR
   • Aba "Registro de Documento"
   • Preencha o formulário JSON
   • Clique "Registrar"
   • Guarde o código: IL2-X-HASH
   
4️⃣ VERIFICAR
   • Aba "Verificação por Certificado"
   • Digite o código
   • Clique "Verificar"
   • ✅ Pronto!
```

---

## 💡 CARACTERÍSTICAS

- ✅ 100% Funcional e Testado
- ✅ Interface Web Responsiva
- ✅ Blockchain InterlockLedger (IL2)
- ✅ Criptografia Automática (AES256)
- ✅ Hash SHA-256
- ✅ Código de Verificação Único
- ✅ Salvamento Automático de Arquivos
- ✅ Documentação Completa

---

## 📊 TECNOLOGIAS

- **Backend:** Node.js + Express.js
- **Blockchain:** InterlockLedger (IL2)
- **Network:** Minerva
- **Criptografia:** AES256 + SHA-256
- **API:** REST (JSON)

---

## 🔐 SEGURANÇA

### Registros na Blockchain
- ✅ Imutável (não pode ser alterado)
- ✅ Criptografado (AES256)
- ✅ Hash SHA-256 único
- ✅ Timestamp automático
- ✅ Rastreável permanentemente

### Arquivos Locais
- 📁 Certificados salvos localmente
- 📁 JSON original como referência
- 🔐 Código único de verificação

---

## ❓ PRECISA DE AJUDA?

1. **Leia:** [INICIAR.md](INICIAR.md) - Como iniciar
2. **Consulte:** [COMO_USAR.md](COMO_USAR.md) - Como usar
3. **Exemplos:** [GUIA_RAPIDO.md](GUIA_RAPIDO.md) - Código de exemplo
4. **Técnico:** [README_SISTEMA_FUNCIONAL.md](README_SISTEMA_FUNCIONAL.md) - Detalhes

---

## ✅ STATUS

**Sistema:** Pronto para Produção  
**Versão:** 2.1.0  
**Data:** 21/11/2025  
**Testes:** 100% Passando  

---

## 🎉 INÍCIO RÁPIDO

```bash
# 1. Instalar (apenas 1ª vez)
npm install

# 2. Iniciar
node api_server.js

# 3. Acessar
http://localhost:3000
```

**É só isso!** ✨

---

**© 2025 SBR Prime - Sistema de Rastreabilidade Blockchain**