const https = require('https');
const fs = require('fs');
const axios = require('axios');

class IL2Client {
    constructor(baseUrl, agent) {
        this.baseUrl = baseUrl;
        this.agent = agent;
    }

    /**
     * Adiciona um documento JSON usando a aplicação específica
     * @param {string} chainId - ID da cadeia
     * @param {Object} payload - Dados JSON para adicionar
     * @param {number} appId - ID da aplicação (padrão: 8 para JSON)
     * @returns {Promise<Object>} Resultado da operação
     */
    async addJsonDocument(chainId, payload, appId = 8) {
        try {
            // Tentar diferentes endpoints baseados no diagnóstico
            const endpoints = [
                `jsonDocuments@${chainId}`,
                `apps@${chainId}/${appId}`,
                `apps@${chainId}/${appId}/records`,
                `records@${chainId}?application=${appId}`,
                `chain/${chainId}/apps/${appId}/records`
            ];

            let lastError = null;

            for (const endpoint of endpoints) {
                try {
                    console.log(`🔄 Tentando endpoint: ${endpoint}`);
                    
                    const response = await axios.post(
                        `${this.baseUrl}/${endpoint}`,
                        payload,
                        {
                            httpsAgent: this.agent,
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            }
                        }
                    );

                    console.log(`✅ Sucesso com endpoint: ${endpoint}`);
                    return {
                        success: true,
                        data: response.data,
                        endpoint: endpoint
                    };

                } catch (error) {
                    lastError = error;
                    console.log(`❌ Falha no endpoint ${endpoint}: ${error.response?.status || error.message}`);
                    
                    // Se é 404, continuar tentando outros endpoints
                    // Se é 401, pode ser problema de licença específico
                    if (error.response?.status === 401) {
                        console.log(`🔒 Problema de autorização em: ${endpoint}`);
                    }
                }
            }

            // Se chegou aqui, nenhum endpoint funcionou
            return {
                success: false,
                error: lastError.response?.data || lastError.message,
                status: lastError.response?.status
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Tenta adicionar documento JSON usando aplicação específica com dados detalhados
     */
    async addJsonDocumentDetailed(chainId, payload) {
        try {
            // Primeiro, verificar quais aplicações estão disponíveis
            const appsResponse = await axios.get(`${this.baseUrl}/apps@${chainId}`, { httpsAgent: this.agent });
            console.log('📱 Aplicações disponíveis:', appsResponse.data);

            // Tentar diferentes IDs de aplicação para JSON
            const jsonAppIds = [8, 2, 100]; // IDs comuns para aplicações JSON
            
            for (const appId of jsonAppIds) {
                console.log(`\n🔄 Tentando aplicação ID: ${appId}`);
                
                // Verificar detalhes da aplicação
                try {
                    const appDetails = await axios.get(`${this.baseUrl}/apps@${chainId}/${appId}`, { httpsAgent: this.agent });
                    console.log(`📋 Detalhes da aplicação ${appId}:`, appDetails.data);
                } catch (err) {
                    console.log(`⚠️ Não foi possível obter detalhes da aplicação ${appId}`);
                }

                // Tentar adicionar o documento
                const result = await this.addJsonDocument(chainId, payload, appId);
                if (result.success) {
                    return result;
                }
            }

            // Se nenhuma aplicação funcionou, tentar método alternativo
            return await this.addJsonDocumentAlternative(chainId, payload);

        } catch (error) {
            return {
                success: false,
                error: error.message,
                details: error.response?.data
            };
        }
    }

    /**
     * Método alternativo usando records genérico
     */
    async addJsonDocumentAlternative(chainId, payload) {
        try {
            console.log('\n🔄 Tentando método alternativo...');
            
            // Criar um record genérico com o payload JSON
            const record = {
                applicationId: 8, // ID para aplicação JSON
                payload: JSON.stringify(payload),
                payloadTagId: 100 // Tag para JSON
            };

            const response = await axios.post(
                `${this.baseUrl}/records@${chainId}`,
                record,
                {
                    httpsAgent: this.agent,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            return {
                success: true,
                data: response.data,
                method: 'alternative'
            };

        } catch (error) {
            return {
                success: false,
                error: error.response?.data || error.message,
                status: error.response?.status
            };
        }
    }

    /**
     * Lista todos os registros de uma cadeia
     */
    async listRecords(chainId, page = 0, size = 10) {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: size.toString()
            });

            const response = await axios.get(
                `${this.baseUrl}/records@${chainId}?${params}`,
                { httpsAgent: this.agent }
            );

            return response.data;
        } catch (error) {
            throw new Error(`Erro ao listar registros: ${error.message}`);
        }
    }

    /**
     * Obtém informações detalhadas de uma cadeia
     */
    async getChainInfo(chainId) {
        try {
            const response = await axios.get(`${this.baseUrl}/chain/${chainId}`, { httpsAgent: this.agent });
            return response.data;
        } catch (error) {
            throw new Error(`Erro ao obter informações da cadeia: ${error.message}`);
        }
    }

    /**
     * Lista aplicações ativas em uma cadeia
     */
    async listActiveApps(chainId) {
        try {
            const response = await axios.get(`${this.baseUrl}/apps@${chainId}`, { httpsAgent: this.agent });
            return response.data;
        } catch (error) {
            throw new Error(`Erro ao listar aplicações: ${error.message}`);
        }
    }
}

// Exemplo de uso principal
async function main() {
    try {
        // Configuração do certificado
        const agent = new https.Agent({
            pfx: fs.readFileSync('rest.api.pfx'),
            passphrase: 'MultiKey',
            rejectUnauthorized: false
        });

        const BASE_URL = 'https://minerva-data.il2.io:32068';
        const client = new IL2Client(BASE_URL, agent);

        // Listar cadeias disponíveis
        const chainsRes = await axios.get(`${BASE_URL}/chain`, { httpsAgent: agent });
        const chains = chainsRes.data;
        
        console.log(`📋 Cadeias disponíveis: ${chains.length}`);
        
        // Usar a primeira cadeia
        const chainId = chains[0].id;
        console.log(`✅ Usando cadeia: ${chainId} (${chains[0].name})`);

        // Verificar informações da cadeia
        const chainInfo = await client.getChainInfo(chainId);
        console.log(`📊 Info da cadeia:`, {
            lastRecord: chainInfo.lastRecord,
            activeApps: chainInfo.activeApps
        });

        // Listar aplicações ativas
        try {
            const activeApps = await client.listActiveApps(chainId);
            console.log('🚀 Aplicações ativas:', activeApps);
        } catch (err) {
            console.log('⚠️ Não foi possível listar aplicações ativas');
        }

        // Dados para enviar
        const payload = {
            nome: "Ederson Silva",
            cpf: "123.456.789-00", 
            email: "ederson.silva@example.com",
            timestamp: new Date().toISOString(),
            teste: "Documento de teste via JavaScript"
        };

        console.log('\n📤 TENTANDO ADICIONAR DOCUMENTO JSON...');
        console.log('━'.repeat(50));

        // Tentar adicionar documento JSON
        const result = await client.addJsonDocumentDetailed(chainId, payload);

        if (result.success) {
            console.log('\n🎉 DOCUMENTO ADICIONADO COM SUCESSO!');
            console.log('📦 Resultado:', JSON.stringify(result.data, null, 2));
            console.log(`🔗 Endpoint usado: ${result.endpoint || result.method}`);
            
            // Verificar se o documento foi realmente adicionado
            console.log('\n🔍 Verificando registros atualizados...');
            const records = await client.listRecords(chainId, 0, 5);
            console.log('📜 Últimos registros:', records);
            
        } else {
            console.log('\n❌ FALHA AO ADICIONAR DOCUMENTO');
            console.log('📄 Erro:', result.error);
            console.log('📊 Status:', result.status);
            
            if (result.status === 401) {
                console.log('\n💡 POSSÍVEIS SOLUÇÕES:');
                console.log('1. Verificar se sua licença permite adicionar registros JSON');
                console.log('2. Entrar em contato com o administrador do IL2');
                console.log('3. Verificar se o certificado tem as permissões corretas');
                console.log('4. Tentar uma cadeia diferente');
            }
        }

    } catch (error) {
        console.error('❌ Erro geral:', error.message);
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📄 Dados da resposta:', error.response.data);
        }
    }
}

// Executar se for chamado diretamente
if (require.main === module) {
    main();
}

module.exports = { IL2Client };