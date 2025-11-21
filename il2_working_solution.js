const https = require('https');
const fs = require('fs');
const axios = require('axios');

class IL2WorkingClient {
    constructor(baseUrl, agent) {
        this.baseUrl = baseUrl;
        this.agent = agent;
    }

    /**
     * Adiciona um documento JSON usando o endpoint de records que sabemos que funciona
     */
    async addJsonDocument(chainId, payload) {
        console.log('📤 ADICIONANDO DOCUMENTO JSON VIA RECORDS API');
        console.log('━'.repeat(60));
        
        try {
            // Primeiro, vamos analisar os registros existentes para entender o formato
            console.log('🔍 Analisando registros existentes...');
            const existingRecords = await this.getJsonRecords(chainId, 0, 3);
            
            if (existingRecords && existingRecords.items && existingRecords.items.length > 0) {
                console.log('📋 Formato dos registros existentes:');
                const sample = existingRecords.items[0];
                console.log('   🔹 Application ID:', sample.applicationId);
                console.log('   🔹 Payload Tag ID:', sample.payloadTagId);
                console.log('   🔹 Serial:', sample.serial);
                console.log('   🔹 Type:', sample.type);
                console.log('   🔹 Has payload:', !!sample.payload);
                if (sample.payload) {
                    const payloadPreview = JSON.stringify(sample.payload).substring(0, 100);
                    console.log('   🔹 Payload preview:', payloadPreview + '...');
                }
                console.log('');
            }

            // Tentar diferentes formatos baseados no que encontramos
            const formats = [
                {
                    name: "Formato 1: Payload direto como objeto",
                    data: {
                        applicationId: 8,
                        payloadTagId: 100,
                        payload: payload
                    }
                },
                {
                    name: "Formato 2: Payload como string JSON",
                    data: {
                        applicationId: 8,
                        payloadTagId: 100,
                        payload: JSON.stringify(payload)
                    }
                },
                {
                    name: "Formato 3: Com encryption settings",
                    data: {
                        applicationId: 8,
                        payloadTagId: 100,
                        payload: payload,
                        encryptPayload: true
                    }
                },
                {
                    name: "Formato 4: Payload em bytes (base64)",
                    data: {
                        applicationId: 8,
                        payloadTagId: 100,
                        payload: Buffer.from(JSON.stringify(payload)).toString('base64')
                    }
                }
            ];

            for (let i = 0; i < formats.length; i++) {
                const format = formats[i];
                console.log(`🔄 Tentando ${format.name}...`);
                
                try {
                    const response = await axios.post(
                        `${this.baseUrl}/records@${chainId}`,
                        format.data,
                        {
                            httpsAgent: this.agent,
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            timeout: 15000
                        }
                    );

                    console.log(`✅ SUCESSO! ${format.name}`);
                    console.log(`📊 Status: ${response.status}`);
                    console.log(`🎉 DOCUMENTO ADICIONADO!`);
                    console.log('📦 Resposta:', JSON.stringify(response.data, null, 2));
                    
                    // Verificar se foi realmente adicionado
                    await this.verifyDocumentAdded(chainId, response.data);
                    
                    return {
                        success: true,
                        data: response.data,
                        format: format.name
                    };

                } catch (error) {
                    const status = error.response?.status;
                    const errorData = error.response?.data;

                    console.log(`❌ Falha: ${status || 'Sem status'}`);
                    
                    if (status === 400) {
                        console.log('   📄 Dados inválidos - tentando próximo formato...');
                        if (errorData) {
                            console.log('   🔍 Detalhes:', JSON.stringify(errorData, null, 2));
                        }
                    } else if (status === 401) {
                        console.log('   🔒 Problema de autorização - esse pode ser definitivo');
                        if (errorData && errorData.title) {
                            console.log('   📄 Título:', errorData.title);
                        }
                        if (errorData && errorData.detail) {
                            console.log('   📋 Detalhes:', errorData.detail);
                        }
                        // Para 401, não adianta tentar outros formatos
                        break;
                    } else {
                        console.log('   ⚠️ Erro:', error.message);
                        if (errorData) {
                            console.log('   🔍 Dados:', JSON.stringify(errorData, null, 2));
                        }
                    }
                    console.log('');
                }
            }

            return {
                success: false,
                error: 'Nenhum formato funcionou'
            };

        } catch (error) {
            console.error('❌ Erro geral:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Busca registros JSON existentes
     */
    async getJsonRecords(chainId, page = 0, size = 10) {
        try {
            const params = new URLSearchParams({
                applicationId: '8',
                page: page.toString(),
                pageSize: size.toString()
            });

            const response = await axios.get(
                `${this.baseUrl}/records@${chainId}?${params}`,
                { httpsAgent: this.agent }
            );

            return response.data;
        } catch (error) {
            console.log('⚠️ Erro ao buscar registros JSON:', error.message);
            return null;
        }
    }

    /**
     * Verifica se o documento foi realmente adicionado
     */
    async verifyDocumentAdded(chainId, addedRecord) {
        try {
            console.log('\n🔍 Verificando se documento foi adicionado...');
            
            if (addedRecord && addedRecord.serial) {
                // Tentar buscar o registro específico
                const recordResponse = await axios.get(
                    `${this.baseUrl}/records@${chainId}/${addedRecord.serial}`,
                    { httpsAgent: this.agent }
                );
                
                console.log('✅ Documento confirmado no serial:', addedRecord.serial);
                console.log('📋 Dados do registro:');
                console.log('   🔹 Application ID:', recordResponse.data.applicationId);
                console.log('   🔹 Payload Tag ID:', recordResponse.data.payloadTagId);
                console.log('   🔹 Created:', recordResponse.data.createdAt);
                
                return true;
            } else {
                console.log('⚠️ Não foi possível verificar - resposta sem serial');
                return false;
            }
            
        } catch (error) {
            console.log('❌ Erro ao verificar documento:', error.message);
            return false;
        }
    }

    /**
     * Lista documentos JSON recentes
     */
    async listRecentJsonDocuments(chainId, count = 5) {
        try {
            const records = await this.getJsonRecords(chainId, 0, count);
            
            if (!records || !records.items) {
                console.log('❌ Nenhum registro encontrado');
                return [];
            }

            console.log(`📋 Últimos ${records.items.length} documentos JSON:`);
            console.log('━'.repeat(60));
            
            records.items.forEach((record, index) => {
                console.log(`${index + 1}. Serial: ${record.serial}`);
                console.log(`   📅 Criado: ${record.createdAt}`);
                console.log(`   🏷️ App ID: ${record.applicationId}`);
                console.log(`   📄 Tag ID: ${record.payloadTagId}`);
                
                if (record.payload) {
                    try {
                        const payload = typeof record.payload === 'string' ? 
                            JSON.parse(record.payload) : record.payload;
                        const keys = Object.keys(payload);
                        console.log(`   🔑 Chaves: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`);
                    } catch (err) {
                        console.log(`   📦 Payload: ${JSON.stringify(record.payload).substring(0, 50)}...`);
                    }
                }
                console.log('');
            });

            return records.items;
            
        } catch (error) {
            console.log('❌ Erro ao listar documentos:', error.message);
            return [];
        }
    }
}

// Função principal
async function main() {
    try {
        console.log('🚀 IL2 CLIENT - USANDO ENDPOINT COMPROVADAMENTE FUNCIONAL');
        console.log('━'.repeat(70));

        // Configuração do certificado
        const agent = new https.Agent({
            pfx: fs.readFileSync('rest.api.pfx'),
            passphrase: 'MultiKey',
            rejectUnauthorized: false
        });

        const BASE_URL = 'https://minerva-data.il2.io:32068';
        const client = new IL2WorkingClient(BASE_URL, agent);

        // Obter lista de cadeias
        const chainsRes = await axios.get(`${BASE_URL}/chain`, { httpsAgent: agent });
        const chains = chainsRes.data;
        const chainId = chains[0].id;
        
        console.log(`🔗 Cadeia selecionada: ${chainId}`);
        console.log(`📛 Nome: ${chains[0].name}`);
        console.log('');

        // Primeiro, listar documentos existentes
        await client.listRecentJsonDocuments(chainId, 3);

        // Dados para adicionar
        const payload = {
            nome: "Ederson Silva",
            cpf: "123.456.789-00",
            email: "ederson.silva@example.com",
            timestamp: new Date().toISOString(),
            teste: "Documento usando endpoint funcional",
            versao: "JavaScript v1.0"
        };

        console.log('💾 Dados para adicionar:', JSON.stringify(payload, null, 2));
        console.log('');

        // Tentar adicionar documento
        const result = await client.addJsonDocument(chainId, payload);

        if (result.success) {
            console.log('\n🎉 DOCUMENTO ADICIONADO COM SUCESSO!');
            console.log(`🏆 Formato usado: ${result.format}`);
            console.log('━'.repeat(70));
            
            // Listar documentos atualizados
            console.log('📋 Listando documentos após adição:');
            await client.listRecentJsonDocuments(chainId, 5);
            
        } else {
            console.log('\n❌ FALHA AO ADICIONAR DOCUMENTO');
            console.log('📄 Erro:', result.error);
            console.log('');
            console.log('💡 POSSÍVEIS SOLUÇÕES:');
            console.log('1. 📞 Entrar em contato com o administrador do IL2');
            console.log('2. 🔐 Verificar se sua licença permite ADICIONAR registros');
            console.log('3. ⚖️ Confirmar permissões de escrita na cadeia');
            console.log('4. 📋 Verificar se o formato dos dados está correto');
        }

    } catch (error) {
        console.error('❌ Erro durante execução:', error.message);
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📄 Dados:', error.response.data);
        }
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = { IL2WorkingClient };