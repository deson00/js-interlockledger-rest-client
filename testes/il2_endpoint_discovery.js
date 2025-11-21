const https = require('https');
const fs = require('fs');
const axios = require('axios');

class EndpointDiscovery {
    constructor(baseUrl, agent) {
        this.baseUrl = baseUrl;
        this.agent = agent;
    }

    /**
     * Descobre todos os endpoints disponíveis
     */
    async discoverEndpoints(chainId) {
        console.log('🔍 DESCOBRINDO ENDPOINTS PARA DOCUMENTOS JSON');
        console.log('━'.repeat(60));
        console.log(`🔗 Cadeia: ${chainId}\n`);

        // Lista de possíveis endpoints baseado na documentação IL2
        const testEndpoints = [
            // Endpoints diretos de documentos JSON
            { path: `jsonDocuments@${chainId}`, method: 'GET', description: 'Listar docs JSON' },
            { path: `jsonDocuments@${chainId}`, method: 'POST', description: 'Adicionar doc JSON' },
            
            // Endpoints via aplicações
            { path: `apps@${chainId}/8`, method: 'GET', description: 'App JSON (ID 8)' },
            { path: `apps@${chainId}/8/records`, method: 'GET', description: 'Records da app JSON' },
            { path: `apps@${chainId}/8/records`, method: 'POST', description: 'Adicionar via app JSON' },
            
            // Endpoints via records com filtro
            { path: `records@${chainId}?applicationId=8`, method: 'GET', description: 'Records filtrados por app' },
            
            // Outros IDs de aplicação comuns
            { path: `apps@${chainId}/2`, method: 'GET', description: 'App ID 2' },
            { path: `apps@${chainId}/100`, method: 'GET', description: 'App ID 100' },
            
            // Endpoints de sistema
            { path: `chain/${chainId}/documents`, method: 'GET', description: 'Documentos da cadeia' },
            { path: `chain/${chainId}/json`, method: 'GET', description: 'JSON da cadeia' },
        ];

        const results = [];

        for (const endpoint of testEndpoints) {
            try {
                let response;
                const config = { 
                    httpsAgent: this.agent,
                    timeout: 5000,
                    headers: {
                        'Accept': 'application/json'
                    }
                };

                if (endpoint.method === 'GET') {
                    response = await axios.get(`${this.baseUrl}/${endpoint.path}`, config);
                } else if (endpoint.method === 'POST') {
                    // Para POST, usar dados de teste simples
                    const testData = { 
                        teste: "discovery", 
                        timestamp: new Date().toISOString() 
                    };
                    
                    config.headers['Content-Type'] = 'application/json';
                    response = await axios.post(`${this.baseUrl}/${endpoint.path}`, testData, config);
                }

                results.push({
                    ...endpoint,
                    status: response.status,
                    success: true,
                    data: response.data,
                    size: JSON.stringify(response.data).length
                });

                console.log(`✅ ${endpoint.method} ${endpoint.path}`);
                console.log(`   📊 Status: ${response.status}`);
                console.log(`   📄 Descrição: ${endpoint.description}`);
                console.log(`   📏 Tamanho resposta: ${JSON.stringify(response.data).length} chars`);
                
                // Se é POST e teve sucesso, foi adicionado!
                if (endpoint.method === 'POST') {
                    console.log(`   🎉 DOCUMENTO ADICIONADO COM SUCESSO!`);
                    console.log(`   📦 Resposta:`, JSON.stringify(response.data, null, 2));
                }
                
                console.log('');

            } catch (error) {
                const status = error.response?.status;
                const errorData = error.response?.data;
                
                results.push({
                    ...endpoint,
                    status: status,
                    success: false,
                    error: errorData || error.message
                });

                if (status === 401) {
                    console.log(`🔒 ${endpoint.method} ${endpoint.path} - SEM AUTORIZAÇÃO`);
                    console.log(`   📄 ${endpoint.description}`);
                    console.log(`   ❌ Erro 401: Possível problema de licença`);
                } else if (status === 404) {
                    console.log(`❌ ${endpoint.method} ${endpoint.path} - NÃO ENCONTRADO`);
                } else if (status === 405) {
                    console.log(`⚠️  ${endpoint.method} ${endpoint.path} - MÉTODO NÃO PERMITIDO`);
                } else {
                    console.log(`❌ ${endpoint.method} ${endpoint.path} - ERRO ${status || 'DESCONHECIDO'}`);
                    if (errorData) {
                        console.log(`   📄 Detalhes:`, JSON.stringify(errorData, null, 2));
                    }
                }
                console.log('');
            }
        }

        return results;
    }

    /**
     * Testa especificamente os endpoints de aplicação
     */
    async testApplicationEndpoints(chainId) {
        console.log('\n🚀 TESTANDO ENDPOINTS DE APLICAÇÃO');
        console.log('━'.repeat(60));

        try {
            // Primeiro, listar todas as aplicações disponíveis
            const appsResponse = await axios.get(`${this.baseUrl}/apps@${chainId}`, { httpsAgent: this.agent });
            const apps = appsResponse.data;
            
            console.log(`📱 Aplicações encontradas: ${apps.length}`);
            
            for (const app of apps.slice(0, 5)) { // Testar apenas as primeiras 5
                console.log(`\n🔍 Testando aplicação: ${app.id}`);
                console.log(`   📛 Nome: ${app.name || 'N/A'}`);
                console.log(`   📄 Descrição: ${app.description || 'N/A'}`);
                
                // Testar diferentes endpoints para esta aplicação
                const appEndpoints = [
                    `apps@${chainId}/${app.id}`,
                    `apps@${chainId}/${app.id}/records`,
                    `apps@${chainId}/${app.id}/documents`,
                    `apps@${chainId}/${app.id}/json`
                ];

                for (const endpoint of appEndpoints) {
                    try {
                        const response = await axios.get(`${this.baseUrl}/${endpoint}`, { httpsAgent: this.agent });
                        console.log(`   ✅ GET ${endpoint} - OK (${response.status})`);
                        
                        // Se retornou dados, mostrar uma amostra
                        if (response.data && typeof response.data === 'object') {
                            const keys = Object.keys(response.data);
                            if (keys.length > 0) {
                                console.log(`      🔑 Chaves: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`);
                            }
                        }
                        
                    } catch (error) {
                        const status = error.response?.status;
                        if (status === 404) {
                            console.log(`   ❌ GET ${endpoint} - Não encontrado`);
                        } else if (status === 401) {
                            console.log(`   🔒 GET ${endpoint} - Sem autorização`);
                        } else {
                            console.log(`   ⚠️  GET ${endpoint} - Erro ${status}`);
                        }
                    }
                }
            }

        } catch (error) {
            console.log('❌ Erro ao testar aplicações:', error.message);
        }
    }

    /**
     * Analisa os resultados e sugere o melhor endpoint
     */
    analyzeResults(results) {
        console.log('\n📊 ANÁLISE DOS RESULTADOS');
        console.log('━'.repeat(60));

        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        console.log(`✅ Endpoints funcionais: ${successful.length}`);
        console.log(`❌ Endpoints com falha: ${failed.length}`);

        // Endpoints que funcionaram para GET
        const workingGets = successful.filter(r => r.method === 'GET');
        console.log(`\n📖 Endpoints GET funcionais: ${workingGets.length}`);
        workingGets.forEach(endpoint => {
            console.log(`   • ${endpoint.path} - ${endpoint.description}`);
        });

        // Endpoints que funcionaram para POST (sucesso real!)
        const workingPosts = successful.filter(r => r.method === 'POST');
        console.log(`\n📝 Endpoints POST funcionais: ${workingPosts.length}`);
        workingPosts.forEach(endpoint => {
            console.log(`   🎯 ${endpoint.path} - ${endpoint.description}`);
            console.log(`      Status: ${endpoint.status}, Dados retornados: ${endpoint.size} chars`);
        });

        // Analisar erros 401 (problemas de licença)
        const authErrors = failed.filter(r => r.status === 401);
        console.log(`\n🔒 Problemas de autorização (401): ${authErrors.length}`);
        authErrors.forEach(endpoint => {
            console.log(`   • ${endpoint.path} - ${endpoint.description}`);
        });

        // Sugestões
        console.log('\n💡 SUGESTÕES:');
        if (workingPosts.length > 0) {
            console.log('✅ Encontrados endpoints funcionais para POST!');
            console.log(`   Usar: ${workingPosts[0].path}`);
        } else if (authErrors.length > 0) {
            console.log('🔒 Problema principal é de autorização/licença');
            console.log('   Contate o administrador do IL2 para verificar suas permissões');
        } else {
            console.log('❌ Nenhum endpoint POST funcional encontrado');
            console.log('   Verifique a documentação da API ou contate o suporte');
        }
    }
}

// Função principal
async function discoverEndpoints() {
    try {
        // Configuração do certificado
        const agent = new https.Agent({
            pfx: fs.readFileSync('rest.api.pfx'),
            passphrase: 'MultiKey',
            rejectUnauthorized: false
        });

        const BASE_URL = 'https://minerva-data.il2.io:32068';
        const discovery = new EndpointDiscovery(BASE_URL, agent);

        // Obter lista de cadeias
        const chainsRes = await axios.get(`${BASE_URL}/chain`, { httpsAgent: agent });
        const chains = chainsRes.data;

        // Usar a primeira cadeia para testes
        const chainId = chains[0].id;
        console.log(`🔗 Testando com cadeia: ${chainId} (${chains[0].name})\n`);

        // Descobrir endpoints
        const results = await discovery.discoverEndpoints(chainId);

        // Testar aplicações específicas
        await discovery.testApplicationEndpoints(chainId);

        // Analisar resultados
        discovery.analyzeResults(results);

    } catch (error) {
        console.error('❌ Erro durante descoberta:', error.message);
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📄 Dados:', error.response.data);
        }
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    discoverEndpoints();
}

module.exports = { EndpointDiscovery };