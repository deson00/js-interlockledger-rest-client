const https = require('https');
const fs = require('fs');
const axios = require('axios');

class IL2AnalysisClient {
    constructor(baseUrl, agent) {
        this.baseUrl = baseUrl;
        this.agent = agent;
    }

    /**
     * Testa diferentes formatos para entender por que a API sempre vê tag 123
     */
    async testPayloadTagFormats(chainId, payload) {
        console.log('🧪 TESTANDO DIFERENTES FORMATOS DE PAYLOAD TAG');
        console.log('━'.repeat(60));
        
        const jsonString = JSON.stringify(payload);
        const base64Data = Buffer.from(jsonString, 'utf8').toString('base64');
        
        console.log(`📄 JSON: ${jsonString}`);
        console.log(`📏 Tamanho: ${jsonString.length} bytes`);
        console.log(`🔐 Base64: ${base64Data}`);
        console.log('');

        // Diferentes formatos numéricos para payloadTagId
        const tagFormats = [
            { name: "Tag como número inteiro", value: 300 },
            { name: "Tag como string", value: "300" },
            { name: "Tag como hex", value: 0x12C },
            { name: "Tag 128 (registro 0)", value: 128 },
            { name: "Tag 500 (registro 2)", value: 500 },
            { name: "Tag sem especificar", value: undefined }
        ];

        const appIds = [1, 2, 8];
        const dataFormats = [
            { name: "payloadBytes", key: "payloadBytes" },
            { name: "PayloadBytes", key: "PayloadBytes" },
            { name: "payload", key: "payload" },
            { name: "data", key: "data" }
        ];

        for (const appId of appIds) {
            for (const tagFormat of tagFormats) {
                for (const dataFormat of dataFormats) {
                    if (tagFormat.value === undefined && dataFormat.key === "payloadBytes") {
                        // Teste sem payloadTagId
                        const testData = {
                            applicationId: appId,
                            [dataFormat.key]: base64Data
                        };
                        
                        await this.testSingleFormat(chainId, 
                            `App ${appId} - ${dataFormat.name} - Sem Tag`, 
                            testData
                        );
                    } else if (tagFormat.value !== undefined) {
                        const testData = {
                            applicationId: appId,
                            payloadTagId: tagFormat.value,
                            [dataFormat.key]: base64Data
                        };
                        
                        await this.testSingleFormat(chainId, 
                            `App ${appId} - ${tagFormat.name} (${tagFormat.value}) - ${dataFormat.name}`, 
                            testData
                        );
                    }
                }
            }
        }
    }

    /**
     * Testa um formato específico
     */
    async testSingleFormat(chainId, formatName, data) {
        console.log(`🔄 Testando: ${formatName}`);
        console.log(`   📦 Dados: ${JSON.stringify(data, null, 2)}`);
        
        try {
            const response = await axios.post(
                `${this.baseUrl}/records@${chainId}`,
                data,
                {
                    httpsAgent: this.agent,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout: 10000
                }
            );

            console.log(`✅ SUCESSO! ${formatName}`);
            console.log(`📊 Status: ${response.status}`);
            console.log('📦 Resposta:', JSON.stringify(response.data, null, 2));
            
            return { success: true, data: response.data, format: formatName };

        } catch (error) {
            const status = error.response?.status;
            const errorData = error.response?.data;
            
            if (errorData && errorData.title) {
                console.log(`❌ ${status}: ${errorData.title}`);
            } else {
                console.log(`❌ Erro: ${status || 'Unknown'}`);
            }
        }
        
        console.log('');
        return null;
    }

    /**
     * Analisa a estrutura de dados do IL2 baseada nos registros existentes
     */
    async analyzeIL2Structure(chainId) {
        console.log('🔍 ANÁLISE DA ESTRUTURA IL2');
        console.log('━'.repeat(60));
        
        try {
            // Pegar informações da chain
            const chainResponse = await axios.get(
                `${this.baseUrl}/chain/${chainId}`,
                { httpsAgent: this.agent }
            );
            
            console.log('📋 Informações da Chain:');
            console.log(JSON.stringify(chainResponse.data, null, 2));
            console.log('');
            
        } catch (error) {
            console.log('❌ Erro ao obter info da chain:', error.message);
        }

        // Analisar registros existentes
        for (let serial = 0; serial <= 2; serial++) {
            try {
                const record = await this.getRecordDetails(chainId, serial);
                if (record) {
                    console.log(`📋 Registro ${serial} - Análise detalhada:`);
                    console.log(`   🚀 App ID: ${record.applicationId}`);
                    console.log(`   🏷️ Payload Tag ID: ${record.payloadTagId}`);
                    console.log(`   📦 Tipo: ${record.type}`);
                    console.log(`   🔢 Versão: ${record.version}`);
                    
                    if (record.payloadBytes) {
                        const payloadLength = Buffer.from(record.payloadBytes, 'base64').length;
                        console.log(`   📏 Tamanho payload: ${payloadLength} bytes`);
                        
                        // Tentar identificar padrões no payload
                        const payloadBuffer = Buffer.from(record.payloadBytes, 'base64');
                        console.log(`   🔍 Primeiros bytes: [${Array.from(payloadBuffer.slice(0, 10)).join(', ')}]`);
                        console.log(`   🔍 Últimos bytes: [${Array.from(payloadBuffer.slice(-10)).join(', ')}]`);
                    }
                    console.log('');
                }
            } catch (error) {
                console.log(`❌ Erro ao analisar registro ${serial}:`, error.message);
            }
        }
    }

    /**
     * Obtém detalhes de um registro específico
     */
    async getRecordDetails(chainId, serial) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/records@${chainId}/${serial}`,
                { httpsAgent: this.agent }
            );
            return response.data;
        } catch (error) {
            console.log(`❌ Erro ao obter registro ${serial}:`, error.message);
            return null;
        }
    }

    /**
     * Testa diferentes endpoints da API
     */
    async testAPIEndpoints(chainId) {
        console.log('🔍 TESTANDO DIFERENTES ENDPOINTS');
        console.log('━'.repeat(60));
        
        const testData = {
            applicationId: 1,
            payloadTagId: 300,
            payloadBytes: Buffer.from('{"teste": "endpoint"}', 'utf8').toString('base64')
        };

        const endpoints = [
            `records@${chainId}`,
            `records/${chainId}`,
            `chain/${chainId}/records`,
            `chains/${chainId}/records`,
            `records`
        ];

        for (const endpoint of endpoints) {
            console.log(`🔄 Testando endpoint: ${endpoint}`);
            
            try {
                const response = await axios.post(
                    `${this.baseUrl}/${endpoint}`,
                    testData,
                    {
                        httpsAgent: this.agent,
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        timeout: 10000
                    }
                );

                console.log(`✅ SUCESSO no endpoint: ${endpoint}`);
                console.log(`📊 Status: ${response.status}`);
                return { success: true, endpoint, data: response.data };

            } catch (error) {
                const status = error.response?.status;
                const errorData = error.response?.data;
                
                if (status === 404) {
                    console.log(`❌ Endpoint não encontrado: ${endpoint}`);
                } else if (errorData && errorData.title) {
                    console.log(`❌ ${status}: ${errorData.title}`);
                } else {
                    console.log(`❌ Erro: ${status || 'Unknown'}`);
                }
            }
            console.log('');
        }

        return null;
    }

    /**
     * Lista registros mais recentes
     */
    async listRecentRecords(chainId, count = 5) {
        try {
            console.log(`📋 Últimos ${count} registros:`);
            console.log('━'.repeat(40));
            
            const response = await axios.get(
                `${this.baseUrl}/records@${chainId}?page=0&pageSize=${count}`,
                { httpsAgent: this.agent }
            );

            if (response.data && response.data.items) {
                response.data.items.forEach((record, index) => {
                    console.log(`${index + 1}. Serial: ${record.serial} | App: ${record.applicationId} | Tag: ${record.payloadTagId} | Tipo: ${record.type}`);
                });
                return response.data.items;
            }
        } catch (error) {
            console.log('❌ Erro ao listar:', error.message);
        }
        return [];
    }
}

// Função principal
async function main() {
    try {
        console.log('🎯 IL2 CLIENT - ANÁLISE COMPLETA DO PROBLEMA');
        console.log('━'.repeat(70));

        // Configuração
        const agent = new https.Agent({
            pfx: fs.readFileSync('rest.api.pfx'),
            passphrase: 'MultiKey',
            rejectUnauthorized: false
        });

        const BASE_URL = 'https://minerva-data.il2.io:32068';
        const client = new IL2AnalysisClient(BASE_URL, agent);

        // Obter chain info
        const chainsRes = await axios.get(`${BASE_URL}/chain`, { httpsAgent: agent });
        const chainId = chainsRes.data[0].id;
        
        console.log(`🔗 Chain: ${chainId}`);
        console.log('');

        // Estado inicial
        const recordsBefore = await client.listRecentRecords(chainId, 3);
        console.log('');

        // Análise da estrutura IL2
        await client.analyzeIL2Structure(chainId);

        // Testar diferentes endpoints
        const endpointResult = await client.testAPIEndpoints(chainId);
        if (endpointResult && endpointResult.success) {
            console.log(`🎉 ENDPOINT FUNCIONAL ENCONTRADO: ${endpointResult.endpoint}`);
            console.log('━'.repeat(70));
            return;
        }

        // Dados de teste simples
        const testPayload = {
            nome: "Teste",
            timestamp: new Date().toISOString()
        };

        // Teste extensivo de formatos
        await client.testPayloadTagFormats(chainId, testPayload);

        console.log('\n🔍 CONCLUSÕES:');
        console.log('1. ❌ A API sempre interpreta payloadTagId como 123');
        console.log('2. 📋 Os registros existentes usam dados binários específicos do IL2');
        console.log('3. 🔑 Pode haver restrições de permissão no certificado');
        console.log('4. 📖 A documentação da API pode estar desatualizada');
        console.log('');
        console.log('🔧 RECOMENDAÇÕES:');
        console.log('• Contatar o administrador do IL2 com logs específicos');
        console.log('• Solicitar exemplo de POST funcional');
        console.log('• Verificar versão da API e documentação atualizada');
        console.log('• Testar com certificado de administrador se disponível');

    } catch (error) {
        console.error('❌ Erro durante execução:', error.message);
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📄 Dados:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

if (require.main === module) {
    main();
}

module.exports = { IL2AnalysisClient };