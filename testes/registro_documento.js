const https = require('https');
const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');

class RegistroDocumento {
    constructor(baseUrl, agent) {
        this.baseUrl = baseUrl;
        this.agent = agent;
    }

    /**
     * Calcula o hash SHA256 de um documento
     * @param {Object|String} documento - Documento para calcular hash
     * @returns {string} Hash SHA256 em hexadecimal
     */
    calcularHashDocumento(documento) {
        const conteudo = typeof documento === 'string' 
            ? documento 
            : JSON.stringify(documento);
        
        return crypto.createHash('sha256')
            .update(conteudo)
            .digest('hex');
    }

    /**
     * Registra um documento na blockchain IL2
     * @param {string} chainId - ID da cadeia
     * @param {Object} documento - Dados do documento  
     * @returns {Promise<Object>} Informações do registro incluindo hash e serial
     */
    async registrarDocumento(chainId, documento) {
        try {
            // 1. Adicionar timestamp e hash do documento original
            const documentoCompleto = {
                ...documento,
                timestampRegistro: new Date().toISOString(),
                hashDocumento: this.calcularHashDocumento(documento)
            };

            console.log('📝 Preparando documento para registro...');
            console.log('🔐 Hash do documento:', documentoCompleto.hashDocumento);

            // 2. Converter JSON para bytes
            const jsonString = JSON.stringify(documentoCompleto);
            const base64Data = Buffer.from(jsonString, 'utf8').toString('base64');

            console.log(`📊 Tamanho do documento: ${jsonString.length} bytes`);
            console.log(`📤 Enviando para blockchain (sem tags permitidas nesta cadeia)...`);
            console.log(`⚠️  NOTA: Esta cadeia não permite payloadTagId personalizado`);
            console.log(`    O sistema usará apenas applicationId sem especificar tag`);

            // 3. Simplesmente enviar com applicationId, sem payloadTagId
            // A API do IL2 nesta cadeia não aceita tags personalizadas
            const payload = {
                applicationId: 1, // Usar App 1 como padrão
                payloadBytes: base64Data
            };

            const response = await axios.post(
                `${this.baseUrl}/records@${chainId}`,
                payload,
                {
                    httpsAgent: this.agent,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            const resultado = response.data;
            console.log('✅ Documento registrado com sucesso!');
            console.log(`📊 Serial: ${resultado.serial}`);

            // 4. Buscar hash da blockchain
            const registroBlockchain = await this.obterRegistro(chainId, resultado.serial);

            console.log(`🏷️  Tag atribuída automaticamente: ${registroBlockchain.payloadTagId}`);

            return {
                sucesso: true,
                serial: resultado.serial,
                hashBlockchain: registroBlockchain.hash,
                hashDocumento: documentoCompleto.hashDocumento,
                timestamp: documentoCompleto.timestampRegistro,
                chainId: chainId,
                documentoOriginal: documento,
                applicationId: 1,
                payloadTagId: registroBlockchain.payloadTagId
            };

        } catch (error) {
            console.error('❌ Erro ao registrar documento:', error.message);
            if (error.response) {
                console.error('📊 Status:', error.response.status);
                console.error('📄 Detalhes:', error.response.data);
            }
            throw error;
        }
    }

    /**
     * Obtém um registro específico da blockchain
     * @param {string} chainId - ID da cadeia
     * @param {number} serial - Número serial do registro
     * @returns {Promise<Object>} Dados do registro
     */
    async obterRegistro(chainId, serial) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/records@${chainId}/${serial}`,
                { httpsAgent: this.agent }
            );

            return response.data;
        } catch (error) {
            throw new Error(`Erro ao obter registro ${serial}: ${error.message}`);
        }
    }

    /**
     * Gera um certificado de registro para o usuário
     * @param {Object} infoRegistro - Informações do registro
     * @returns {Object} Certificado digital
     */
    gerarCertificado(infoRegistro) {
        const certificado = {
            titulo: '🔐 CERTIFICADO DE REGISTRO BLOCKCHAIN',
            versao: '1.0',
            dados: {
                serial: infoRegistro.serial,
                chainId: infoRegistro.chainId,
                hashBlockchain: infoRegistro.hashBlockchain,
                hashDocumento: infoRegistro.hashDocumento,
                timestampRegistro: infoRegistro.timestamp,
                urlVerificacao: `${this.baseUrl}/records@${infoRegistro.chainId}/${infoRegistro.serial}`
            },
            codigoVerificacao: this.gerarCodigoVerificacao(infoRegistro),
            instrucoes: {
                como_verificar: [
                    '1. Acesse o portal de verificação',
                    '2. Insira o código de verificação ou o serial',
                    '3. Envie o documento original para validação',
                    '4. O sistema comparará o hash do documento com o registrado na blockchain'
                ]
            }
        };

        return certificado;
    }

    /**
     * Gera um código de verificação único e legível
     * @param {Object} infoRegistro - Informações do registro
     * @returns {string} Código de verificação
     */
    gerarCodigoVerificacao(infoRegistro) {
        // Formato: CHAIN-SERIAL-HASH_PARCIAL
        const hashParcial = infoRegistro.hashBlockchain.substring(0, 8).toUpperCase();
        return `IL2-${infoRegistro.serial}-${hashParcial}`;
    }

    /**
     * Salva o certificado em um arquivo JSON
     * @param {Object} certificado - Certificado a ser salvo
     * @param {string} nomeArquivo - Nome do arquivo de saída
     */
    salvarCertificado(certificado, nomeArquivo) {
        fs.writeFileSync(
            nomeArquivo,
            JSON.stringify(certificado, null, 2),
            'utf8'
        );
        console.log(`💾 Certificado salvo em: ${nomeArquivo}`);
    }
}

// Exemplo de uso
async function exemplo() {
    try {
        // Configuração
        const agent = new https.Agent({
            pfx: fs.readFileSync('rest.api.pfx'),
            passphrase: 'MultiKey',
            rejectUnauthorized: false
        });

        const BASE_URL = 'https://minerva-data.il2.io:32068';
        const registrador = new RegistroDocumento(BASE_URL, agent);

        // Usar chain específica
        const chainId = 'V6Ge5NDq1oScy-05K85xEzntKHYUMh9m5G-fI0wy1gA';

        // Documento de exemplo
        const documento = {
            tipo: 'CONTRATO',
            titulo: 'Contrato de Prestação de Serviços',
            partes: {
                contratante: {
                    nome: 'Empresa XYZ Ltda',
                    cnpj: '12.345.678/0001-90'
                },
                contratado: {
                    nome: 'João da Silva',
                    cpf: '123.456.789-00'
                }
            },
            valor: 'R$ 10.000,00',
            vigencia: {
                inicio: '2025-11-21',
                fim: '2026-11-21'
            },
            descricao: 'Prestação de serviços de consultoria em TI'
        };

        console.log('=' .repeat(70));
        console.log('🚀 REGISTRO DE DOCUMENTO NA BLOCKCHAIN IL2');
        console.log('='.repeat(70));

        // Registrar documento
        const resultado = await registrador.registrarDocumento(chainId, documento);

        console.log('\n📋 RESULTADO DO REGISTRO:');
        console.log('─'.repeat(70));
        console.log(`✅ Sucesso: ${resultado.sucesso}`);
        console.log(`🔢 Serial: ${resultado.serial}`);
        console.log(`🔐 Hash Blockchain: ${resultado.hashBlockchain}`);
        console.log(`📄 Hash Documento: ${resultado.hashDocumento}`);
        console.log(`⏰ Timestamp: ${resultado.timestamp}`);
        console.log(`🔗 Chain ID: ${resultado.chainId}`);

        // Gerar certificado
        const certificado = registrador.gerarCertificado(resultado);
        console.log('\n📜 CERTIFICADO GERADO:');
        console.log('─'.repeat(70));
        console.log(`🎫 Código de Verificação: ${certificado.codigoVerificacao}`);
        console.log(`🌐 URL de Verificação: ${certificado.dados.urlVerificacao}`);

        // Salvar certificado
        const nomeArquivo = `certificado_${resultado.serial}_${Date.now()}.json`;
        registrador.salvarCertificado(certificado, nomeArquivo);

        console.log('\n✨ PROCESSO CONCLUÍDO COM SUCESSO!');
        console.log('─'.repeat(70));
        console.log('👉 O usuário pode usar o código de verificação ou o arquivo');
        console.log('   do certificado para validar a autenticidade do documento.');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📄 Detalhes:', error.response.data);
        }
    }
}

// Executar exemplo
if (require.main === module) {
    exemplo();
}

module.exports = { RegistroDocumento };
