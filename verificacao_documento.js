const https = require('https');
const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');

class VerificacaoDocumento {
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
     * Verifica a autenticidade de um documento usando o código de verificação
     * @param {string} codigoVerificacao - Código no formato IL2-SERIAL-HASH
     * @param {Object} documentoOriginal - Documento a ser verificado
     * @returns {Promise<Object>} Resultado da verificação
     */
    async verificarPorCodigo(codigoVerificacao, documentoOriginal) {
        try {
            console.log('🔍 Iniciando verificação por código...');
            console.log('🎫 Código:', codigoVerificacao);

            // Parse do código
            const partes = codigoVerificacao.split('-');
            if (partes.length !== 3 || partes[0] !== 'IL2') {
                throw new Error('Código de verificação inválido');
            }

            const serial = parseInt(partes[1]);
            const hashParcial = partes[2].toLowerCase();

            console.log('📊 Serial extraído:', serial);
            console.log('🔐 Hash parcial:', hashParcial);

            // Buscar registro na blockchain
            return await this.verificarPorSerial(serial, documentoOriginal, hashParcial);

        } catch (error) {
            return {
                valido: false,
                erro: error.message,
                detalhes: 'Não foi possível verificar o documento com o código fornecido'
            };
        }
    }

    /**
     * Verifica a autenticidade de um documento usando o serial
     * @param {number} serial - Número serial do registro
     * @param {Object} documentoOriginal - Documento a ser verificado
     * @param {string} hashParcialEsperado - Hash parcial opcional para validação extra
     * @returns {Promise<Object>} Resultado da verificação
     */
    async verificarPorSerial(serial, documentoOriginal, hashParcialEsperado = null) {
        try {
            console.log('\n🔍 VERIFICAÇÃO DE AUTENTICIDADE');
            console.log('='.repeat(70));

            // 1. Obter todas as chains disponíveis
            const chainsRes = await axios.get(`${this.baseUrl}/chain`, { httpsAgent: this.agent });
            const chains = chainsRes.data;

            console.log(`📋 Buscando em ${chains.length} cadeia(s)...`);

            // 2. Tentar encontrar o registro em alguma chain
            let registroEncontrado = null;
            let chainEncontrada = null;

            for (const chain of chains) {
                try {
                    const response = await axios.get(
                        `${this.baseUrl}/records@${chain.id}/${serial}`,
                        { httpsAgent: this.agent }
                    );

                    registroEncontrado = response.data;
                    chainEncontrada = chain.id;
                    console.log(`✅ Registro encontrado na chain: ${chain.name}`);
                    break;

                } catch (error) {
                    // Registro não encontrado nesta chain, tentar próxima
                    continue;
                }
            }

            if (!registroEncontrado) {
                return {
                    valido: false,
                    erro: 'Registro não encontrado',
                    detalhes: `Nenhum registro com serial ${serial} foi encontrado em nenhuma cadeia`
                };
            }

            // 3. Validar hash parcial se fornecido
            if (hashParcialEsperado) {
                const hashParcialReal = registroEncontrado.hash.substring(0, 8).toLowerCase();
                if (hashParcialReal !== hashParcialEsperado) {
                    return {
                        valido: false,
                        erro: 'Hash da blockchain não corresponde',
                        detalhes: 'O código de verificação não corresponde ao registro encontrado'
                    };
                }
            }

            // 4. Decodificar payload
            const payloadBuffer = Buffer.from(registroEncontrado.payloadBytes, 'base64');
            const payloadString = payloadBuffer.toString('utf8');
            const documentoBlockchain = JSON.parse(payloadString);

            console.log('\n📄 Documento recuperado da blockchain');
            console.log('─'.repeat(70));

            // 5. Calcular hash do documento fornecido
            const hashDocumentoFornecido = this.calcularHashDocumento(documentoOriginal);
            const hashDocumentoBlockchain = documentoBlockchain.hashDocumento;

            console.log('🔐 Hash do documento fornecido:', hashDocumentoFornecido);
            console.log('🔐 Hash registrado na blockchain:', hashDocumentoBlockchain);

            // 6. Comparar hashes
            const hashesCorrespondem = hashDocumentoFornecido === hashDocumentoBlockchain;

            // 7. Informações adicionais
            const timestampRegistro = new Date(documentoBlockchain.timestampRegistro);
            const diferencaTempo = this.calcularDiferencaTempo(timestampRegistro);

            // 8. Resultado da verificação
            const resultado = {
                valido: hashesCorrespondem,
                serial: serial,
                chainId: chainEncontrada,
                hashBlockchain: registroEncontrado.hash,
                hashDocumento: {
                    fornecido: hashDocumentoFornecido,
                    registrado: hashDocumentoBlockchain,
                    corresponde: hashesCorrespondem
                },
                timestamp: {
                    registro: documentoBlockchain.timestampRegistro,
                    verificacao: new Date().toISOString(),
                    diferencaTempo: diferencaTempo
                },
                documentoBlockchain: documentoBlockchain,
                metadados: {
                    applicationId: registroEncontrado.applicationId,
                    payloadTagId: registroEncontrado.payloadTagId,
                    type: registroEncontrado.type,
                    version: registroEncontrado.version
                }
            };

            // 9. Exibir resultado
            this.exibirResultado(resultado);

            return resultado;

        } catch (error) {
            console.error('❌ Erro durante verificação:', error.message);
            return {
                valido: false,
                erro: error.message,
                detalhes: 'Erro ao acessar a blockchain ou processar os dados'
            };
        }
    }

    /**
     * Verifica usando um arquivo de certificado
     * @param {string} caminhoArquivo - Caminho do arquivo de certificado JSON
     * @param {Object} documentoOriginal - Documento a ser verificado
     * @returns {Promise<Object>} Resultado da verificação
     */
    async verificarPorCertificado(caminhoArquivo, documentoOriginal) {
        try {
            console.log('📜 Carregando certificado...');
            const certificado = JSON.parse(fs.readFileSync(caminhoArquivo, 'utf8'));

            const serial = certificado.dados.serial;
            const hashParcial = certificado.codigoVerificacao.split('-')[2].toLowerCase();

            return await this.verificarPorSerial(serial, documentoOriginal, hashParcial);

        } catch (error) {
            return {
                valido: false,
                erro: error.message,
                detalhes: 'Não foi possível ler ou processar o certificado'
            };
        }
    }

    /**
     * Calcula a diferença de tempo desde o registro
     * @param {Date} dataRegistro - Data do registro
     * @returns {string} Descrição da diferença de tempo
     */
    calcularDiferencaTempo(dataRegistro) {
        const agora = new Date();
        const diff = agora - dataRegistro;
        
        const segundos = Math.floor(diff / 1000);
        const minutos = Math.floor(segundos / 60);
        const horas = Math.floor(minutos / 60);
        const dias = Math.floor(horas / 24);

        if (dias > 0) return `${dias} dia(s) atrás`;
        if (horas > 0) return `${horas} hora(s) atrás`;
        if (minutos > 0) return `${minutos} minuto(s) atrás`;
        return `${segundos} segundo(s) atrás`;
    }

    /**
     * Exibe o resultado da verificação de forma formatada
     * @param {Object} resultado - Resultado da verificação
     */
    exibirResultado(resultado) {
        console.log('\n📊 RESULTADO DA VERIFICAÇÃO');
        console.log('='.repeat(70));

        if (resultado.valido) {
            console.log('✅ DOCUMENTO AUTÊNTICO');
            console.log('   O documento fornecido corresponde exatamente ao registrado');
            console.log('   na blockchain IL2.');
        } else {
            console.log('❌ DOCUMENTO NÃO AUTÊNTICO');
            console.log('   O documento fornecido NÃO corresponde ao registro');
            console.log('   na blockchain.');
        }

        console.log('\n📋 Detalhes do Registro:');
        console.log('─'.repeat(70));
        console.log(`🔢 Serial: ${resultado.serial}`);
        console.log(`🔗 Chain ID: ${resultado.chainId}`);
        console.log(`🔐 Hash Blockchain: ${resultado.hashBlockchain}`);
        console.log(`⏰ Registrado em: ${resultado.timestamp.registro}`);
        console.log(`📅 Tempo decorrido: ${resultado.timestamp.diferencaTempo}`);

        console.log('\n🔍 Comparação de Hashes:');
        console.log('─'.repeat(70));
        console.log(`📄 Hash do documento fornecido: ${resultado.hashDocumento.fornecido}`);
        console.log(`💾 Hash registrado na blockchain: ${resultado.hashDocumento.registrado}`);
        console.log(`${resultado.hashDocumento.corresponde ? '✅' : '❌'} Hashes correspondem: ${resultado.hashDocumento.corresponde}`);
    }

    /**
     * Gera um relatório de verificação em formato JSON
     * @param {Object} resultado - Resultado da verificação
     * @param {string} nomeArquivo - Nome do arquivo de saída
     */
    gerarRelatorio(resultado, nomeArquivo) {
        const relatorio = {
            titulo: 'RELATÓRIO DE VERIFICAÇÃO DE AUTENTICIDADE',
            dataVerificacao: new Date().toISOString(),
            resultado: resultado.valido ? 'AUTÊNTICO' : 'NÃO AUTÊNTICO',
            detalhes: resultado
        };

        fs.writeFileSync(
            nomeArquivo,
            JSON.stringify(relatorio, null, 2),
            'utf8'
        );

        console.log(`\n💾 Relatório salvo em: ${nomeArquivo}`);
    }
}

// Exemplos de uso
async function exemploVerificacaoPorSerial() {
    try {
        // Configuração
        const agent = new https.Agent({
            pfx: fs.readFileSync('rest.api.pfx'),
            passphrase: 'MultiKey',
            rejectUnauthorized: false
        });

        const BASE_URL = 'https://minerva-data.il2.io:32068';
        const verificador = new VerificacaoDocumento(BASE_URL, agent);

        // Documento que o usuário quer verificar
        const documentoParaVerificar = {
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

        // Serial do registro (fornecido pelo certificado)
        const serial = 10; // Substitua pelo serial real

        // Verificar
        const resultado = await verificador.verificarPorSerial(serial, documentoParaVerificar);

        // Gerar relatório
        if (resultado.valido !== undefined) {
            const nomeRelatorio = `relatorio_verificacao_${serial}_${Date.now()}.json`;
            verificador.gerarRelatorio(resultado, nomeRelatorio);
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

async function exemploVerificacaoPorCodigo() {
    try {
        // Configuração
        const agent = new https.Agent({
            pfx: fs.readFileSync('rest.api.pfx'),
            passphrase: 'MultiKey',
            rejectUnauthorized: false
        });

        const BASE_URL = 'https://minerva-data.il2.io:32068';
        const verificador = new VerificacaoDocumento(BASE_URL, agent);

        // Documento para verificar
        const documento = {
            nome: "Teste",
            cpf: "123.456.789-00"
        };

        // Código de verificação (fornecido ao usuário)
        const codigo = 'IL2-10-ABCD1234'; // Substitua pelo código real

        // Verificar
        const resultado = await verificador.verificarPorCodigo(codigo, documento);

        console.log('\n' + '='.repeat(70));
        console.log(resultado.valido ? '✅ VERIFICAÇÃO CONCLUÍDA' : '❌ VERIFICAÇÃO FALHOU');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

// Executar exemplo
if (require.main === module) {
    // Descomentar o exemplo desejado:
    exemploVerificacaoPorSerial();
    // exemploVerificacaoPorCodigo();
}

module.exports = { VerificacaoDocumento };
