const https = require('https');
const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');

// Configurações do certificado
const agent = new https.Agent({
    pfx: fs.readFileSync('rest.api.pfx'),
    passphrase: 'MultiKey',
    rejectUnauthorized: false
});

// Host da API
const BASE_URL = 'https://minerva-data.il2.io:32068';

class RegistroDocumentoV2 {
    constructor() {
        this.baseUrl = BASE_URL;
        this.agent = agent;
        // Usar a cadeia SBR Soluções Chain #3
        this.chainId = 'V6Ge5NDq1oScy-05K85xEzntKHYUMh9m5G-fI0wy1gA';
    }

    /**
     * Calcula o hash SHA256 de um documento
     */
    calculateHash(documento) {
        const conteudo = typeof documento === 'string' 
            ? documento 
            : JSON.stringify(documento);
        
        return crypto.createHash('sha256')
            .update(conteudo)
            .digest('hex');
    }

    /**
     * Registra um documento na blockchain IL2
     * Usa o mesmo padrão do il2_test.js que funcionou
     */
    async registerDocument(documentData) {
        try {
            console.log('\n🚀 REGISTRO DE DOCUMENTO NA BLOCKCHAIN IL2');
            console.log('='.repeat(70));

            // 1. Verificar se a cadeia existe
            const chainsRes = await axios.get(`${this.baseUrl}/chain`, { httpsAgent: this.agent });
            const chains = chainsRes.data;
            const targetChain = chains.find(c => c.id === this.chainId);

            if (!targetChain) {
                throw new Error(`Cadeia ${this.chainId} não encontrada`);
            }

            console.log(`✅ Cadeia encontrada: ${targetChain.name} (${targetChain.id})`);

            // 2. Listar registros existentes
            const recordsRes = await axios.get(`${this.baseUrl}/records@${this.chainId}`, { httpsAgent: this.agent });
            console.log(`📊 Registros existentes na cadeia: ${recordsRes.data.items.length}`);

            // 3. Preparar documento com timestamp e informações adicionais
            const documentoCompleto = {
                ...documentData,
                timestamp: new Date().toISOString(),
                source: 'SBR_PRIME_VERIFICATION_SYSTEM',
                version: '1.0'
            };

            // Calcular hash do documento antes de enviar
            const hashDocumento = this.calculateHash(documentoCompleto);
            console.log('🔐 Hash do documento:', hashDocumento);
            console.log('📄 Documento a ser enviado:', JSON.stringify(documentoCompleto, null, 2));

            // 4. Enviar documento JSON usando o endpoint que funcionou no il2_test.js
            console.log('\n📤 Enviando documento para blockchain...');
            const postRes = await axios.post(
                `${this.baseUrl}/jsonDocuments@${this.chainId}`,
                documentoCompleto,
                { httpsAgent: this.agent }
            );

            console.log('✅ Documento JSON enviado com sucesso!');
            console.log('📋 Resposta da blockchain:', JSON.stringify(postRes.data, null, 2));

            // 5. Capturar o serial da resposta
            const serial = postRes.data.serial;
            console.log(`\n🔑 Serial do documento: ${serial}`);

            // 6. Recuperar o documento usando o serial
            const getRes = await axios.get(
                `${this.baseUrl}/jsonDocuments@${this.chainId}/${serial}`,
                { httpsAgent: this.agent }
            );

            console.log('\n📥 Documento recuperado da blockchain:');
            console.log(JSON.stringify(getRes.data, null, 2));

            // 7. Gerar certificado de registro
            const certificado = this.generateCertificate({
                serial: serial,
                hash: hashDocumento,
                chainId: this.chainId,
                chainName: targetChain.name,
                timestamp: documentoCompleto.timestamp,
                network: postRes.data.network || 'Minerva',
                reference: postRes.data.reference,
                documentoOriginal: documentData
            });

            console.log('\n📜 CERTIFICADO DE REGISTRO GERADO:');
            console.log('─'.repeat(70));
            console.log(`🎫 Código de Verificação: ${certificado.codigoVerificacao}`);
            console.log(`🔗 Referência Blockchain: ${certificado.dados.reference}`);

            // 8. Salvar certificado
            const timestamp = Date.now();
            const nomeArquivo = `certificados/certificado_${serial}_${timestamp}.json`;
            this.saveCertificate(certificado, nomeArquivo);

            // 9. Salvar JSON original
            const jsonOriginalFile = this.saveOriginalDocument(documentoCompleto, serial, timestamp);

            return {
                success: true,
                serial: serial,
                hash: hashDocumento,
                chainId: this.chainId,
                chainName: targetChain.name,
                network: postRes.data.network || 'Minerva',
                reference: postRes.data.reference,
                timestamp: documentoCompleto.timestamp,
                certificate: certificado,
                certificateFile: nomeArquivo,
                documentFile: jsonOriginalFile
            };

        } catch (error) {
            console.error('\n❌ ERRO AO REGISTRAR DOCUMENTO:');
            console.error('─'.repeat(70));
            if (error.response) {
                console.error('📊 Status HTTP:', error.response.status);
                console.error('📄 Detalhes do erro:', JSON.stringify(error.response.data, null, 2));
                console.error('🔍 Headers da resposta:', error.response.headers);
            } else {
                console.error('📄 Mensagem:', error.message);
            }
            throw error;
        }
    }

    /**
     * Gera um certificado de registro
     */
    generateCertificate(info) {
        const certificado = {
            titulo: '🔐 CERTIFICADO DE REGISTRO BLOCKCHAIN - SBR PRIME',
            versao: '2.0',
            emissao: new Date().toISOString(),
            dados: {
                serial: info.serial,
                chainId: info.chainId,
                chainName: info.chainName,
                network: info.network,
                reference: info.reference,
                hashDocumento: info.hash,
                timestampRegistro: info.timestamp,
                urlVerificacao: `${this.baseUrl}/jsonDocuments@${info.chainId}/${info.serial}`
            },
            codigoVerificacao: this.generateVerificationCode(info),
            documentoOriginal: info.documentoOriginal,
            instrucoes: {
                titulo: 'Como verificar a autenticidade deste documento:',
                passos: [
                    '1. Acesse o portal de verificação SBR Prime',
                    '2. Insira o código de verificação ou o número serial',
                    '3. Envie o documento original para validação',
                    '4. O sistema comparará o hash do documento com o registrado na blockchain',
                    '5. A verificação confirmará se o documento é autêntico e inalterado'
                ],
                observacoes: [
                    'Este certificado é uma prova criptográfica de registro',
                    'O documento está registrado permanentemente na blockchain InterlockLedger',
                    'Qualquer alteração no documento original resultará em hash diferente'
                ]
            },
            assinatura_digital: {
                algoritmo: 'SHA-256',
                hash: info.hash,
                blockchain: 'InterlockLedger (IL2)',
                network: info.network
            }
        };

        return certificado;
    }

    /**
     * Gera código de verificação legível
     */
    generateVerificationCode(info) {
        // Formato: IL2-SERIAL-HASH_PARCIAL
        const hashParcial = info.hash.substring(0, 8).toUpperCase();
        return `IL2-${info.serial}-${hashParcial}`;
    }

    /**
     * Salva o certificado em arquivo JSON
     */
    saveCertificate(certificado, nomeArquivo) {
        // Criar diretório se não existir
        const dir = nomeArquivo.split('/')[0];
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(
            nomeArquivo,
            JSON.stringify(certificado, null, 2),
            'utf8'
        );
        console.log(`\n💾 Certificado salvo em: ${nomeArquivo}`);
    }

    /**
     * Salva o JSON original do documento
     */
    saveOriginalDocument(documento, serial, timestamp) {
        const dir = 'documentos_originais';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const nomeArquivo = `${dir}/documento_${serial}_${timestamp}.json`;
        fs.writeFileSync(
            nomeArquivo,
            JSON.stringify(documento, null, 2),
            'utf8'
        );
        console.log(`📄 JSON original salvo em: ${nomeArquivo}`);
        return nomeArquivo;
    }

    /**
     * Verifica um documento pelo serial
     */
    async verifyBySerial(serial) {
        try {
            // Buscar documento
            const docResponse = await axios.get(
                `${this.baseUrl}/jsonDocuments@${this.chainId}/${serial}`,
                { httpsAgent: this.agent }
            );

            // Buscar registro para obter payloadBytes
            const recordResponse = await axios.get(
                `${this.baseUrl}/records@${this.chainId}/${serial}`,
                { httpsAgent: this.agent }
            );

            // Calcular hash do payload (SHA-256)
            const payloadBuffer = Buffer.from(recordResponse.data.payloadBytes, 'base64');
            const hash = crypto.createHash('sha256').update(payloadBuffer).digest('hex').toUpperCase();

            return {
                found: true,
                document: {
                    ...docResponse.data,
                    hash: hash,
                    payloadBytes: recordResponse.data.payloadBytes
                }
            };
        } catch (error) {
            if (error.response?.status === 404) {
                return { found: false };
            }
            throw error;
        }
    }

    /**
     * Verifica um documento pelo código de verificação
     */
    async verifyByCode(code) {
        try {
            // Formato: IL2-SERIAL-HASH
            const parts = code.split('-');
            if (parts.length !== 3 || parts[0] !== 'IL2') {
                throw new Error('Código de verificação inválido');
            }

            const serial = parts[1];
            return await this.verifyBySerial(serial);
        } catch (error) {
            throw new Error(`Erro ao verificar código: ${error.message}`);
        }
    }
}

// Exemplo de uso
async function exemplo() {
    try {
        const registrador = new RegistroDocumentoV2();

        // Documento de exemplo
        const documento = {
            tipo: 'CONTRATO',
            titulo: 'Contrato de Prestação de Serviços - Teste V2',
            numero: 'CNTR-2025-001',
            partes: {
                contratante: {
                    razaoSocial: 'SBR Prime Soluções Empresariais Ltda',
                    cnpj: '12.345.678/0001-90',
                    endereco: 'Rua Exemplo, 123 - São Paulo/SP'
                },
                contratado: {
                    nome: 'João da Silva',
                    cpf: '123.456.789-00',
                    endereco: 'Av. Teste, 456 - São Paulo/SP'
                }
            },
            objeto: 'Prestação de serviços de consultoria em tecnologia da informação',
            valor: 'R$ 15.000,00',
            vigencia: {
                inicio: '2025-11-21',
                fim: '2026-11-21',
                prazo_dias: 365
            },
            clausulas: [
                'Confidencialidade das informações',
                'Propriedade intelectual',
                'Rescisão e multas'
            ],
            observacoes: 'Documento registrado via sistema SBR Prime utilizando blockchain IL2'
        };

        // Registrar documento
        const resultado = await registrador.registerDocument(documento);

        console.log('\n\n✨ PROCESSO CONCLUÍDO COM SUCESSO!');
        console.log('='.repeat(70));
        console.log(`✅ Status: ${resultado.success ? 'Sucesso' : 'Falha'}`);
        console.log(`🔢 Serial: ${resultado.serial}`);
        console.log(`🔐 Hash: ${resultado.hash}`);
        console.log(`🏷️  Cadeia: ${resultado.chainName}`);
        console.log(`🌐 Network: ${resultado.network}`);
        console.log(`📄 Certificado: ${resultado.certificateFile}`);
        console.log(`🎫 Código: ${resultado.certificate.codigoVerificacao}`);

        // Testar verificação
        console.log('\n🔍 TESTANDO VERIFICAÇÃO...');
        const verificacao = await registrador.verifyBySerial(resultado.serial);
        if (verificacao.found) {
            console.log('✅ Documento verificado com sucesso!');
            console.log('📋 Dados recuperados da blockchain:', JSON.stringify(verificacao.document, null, 2));
        } else {
            console.log('❌ Documento não encontrado');
        }

    } catch (error) {
        console.error('❌ Erro no exemplo:', error.message);
        process.exit(1);
    }
}

// Executar exemplo se chamado diretamente
if (require.main === module) {
    exemplo();
}

module.exports = { RegistroDocumentoV2 };
