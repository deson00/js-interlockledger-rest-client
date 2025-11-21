const https = require('https');
const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');

class IL2Diagnostics {
    constructor(baseUrl, agent) {
        this.baseUrl = baseUrl;
        this.agent = agent;
    }

    /**
     * Executa diagnóstico completo da conexão e permissões
     */
    async runFullDiagnostics() {
        console.log('🔍 DIAGNÓSTICO IL2 - Iniciando...\n');

        // 1. Testar conectividade básica
        await this.testConnectivity();

        // 2. Verificar informações do certificado
        await this.checkCertificateInfo();

        // 3. Listar e analisar cadeias
        await this.analyzeChainsAndPermissions();

        // 4. Verificar APIs disponíveis
        await this.checkAvailableApis();

        // 5. Testar diferentes endpoints de permissões
        await this.testPermissionEndpoints();

        console.log('\n✅ Diagnóstico concluído!');
    }

    async testConnectivity() {
        console.log('📡 1. TESTE DE CONECTIVIDADE');
        console.log('━'.repeat(50));
        
        try {
            const response = await axios.get(`${this.baseUrl}`, { 
                httpsAgent: this.agent,
                timeout: 5000
            });
            console.log('✅ Conectividade: OK');
            console.log(`📊 Status: ${response.status}`);
            console.log(`🏷️  Headers importantes:`, {
                server: response.headers.server,
                'content-type': response.headers['content-type']
            });
        } catch (error) {
            console.log('❌ Conectividade: FALHA');
            console.log(`📄 Erro: ${error.message}`);
            if (error.response) {
                console.log(`📊 Status: ${error.response.status}`);
                console.log(`📄 Dados: ${JSON.stringify(error.response.data, null, 2)}`);
            }
        }
        console.log('');
    }

    async checkCertificateInfo() {
        console.log('🔐 2. INFORMAÇÕES DO CERTIFICADO');
        console.log('━'.repeat(50));
        
        try {
            // Ler informações básicas do certificado
            const pfxBuffer = fs.readFileSync('rest.api.pfx');
            console.log('✅ Certificado carregado');
            console.log(`📏 Tamanho do arquivo: ${pfxBuffer.length} bytes`);
            
            // Tentar extrair informações do certificado (isso pode variar dependendo do formato)
            console.log('📋 Hash MD5 do certificado:', crypto.createHash('md5').update(pfxBuffer).digest('hex'));
            
        } catch (error) {
            console.log('❌ Erro ao ler certificado:', error.message);
        }
        console.log('');
    }

    async analyzeChainsAndPermissions() {
        console.log('⛓️  3. ANÁLISE DE CADEIAS E PERMISSÕES');
        console.log('━'.repeat(50));
        
        try {
            // Listar cadeias
            const chainsRes = await axios.get(`${this.baseUrl}/chain`, { httpsAgent: this.agent });
            const chains = chainsRes.data;
            
            console.log(`✅ Cadeias encontradas: ${chains.length}`);
            
            for (let i = 0; i < chains.length && i < 3; i++) {
                const chain = chains[i];
                console.log(`\n📋 Cadeia ${i + 1}:`);
                console.log(`   🆔 ID: ${chain.id}`);
                console.log(`   📛 Nome: ${chain.name || 'N/A'}`);
                console.log(`   📄 Descrição: ${chain.description || 'N/A'}`);
                
                // Tentar obter informações detalhadas da cadeia
                await this.checkChainDetails(chain.id);
                
                // Verificar permissões específicas
                await this.checkChainPermissions(chain.id);
            }
            
        } catch (error) {
            console.log('❌ Erro ao analisar cadeias:', error.message);
            if (error.response) {
                console.log(`📊 Status: ${error.response.status}`);
                console.log(`📄 Dados: ${JSON.stringify(error.response.data, null, 2)}`);
            }
        }
        console.log('');
    }

    async checkChainDetails(chainId) {
        try {
            const detailsRes = await axios.get(`${this.baseUrl}/chain/${chainId}`, { httpsAgent: this.agent });
            const details = detailsRes.data;
            
            console.log(`   📊 Estado: ${details.activeApps || 'N/A'}`);
            console.log(`   🔗 Registros: ${details.lastRecord || 'N/A'}`);
            
            // Verificar aplicações ativas
            if (details.activeApps) {
                console.log(`   🚀 Apps ativos: ${Object.keys(details.activeApps).join(', ')}`);
            }
            
        } catch (error) {
            console.log(`   ❌ Erro ao obter detalhes: ${error.response?.status || error.message}`);
        }
    }

    async checkChainPermissions(chainId) {
        // Verificar diferentes tipos de permissões
        const permissionTests = [
            { path: `records@${chainId}`, name: 'Listar registros' },
            { path: `jsonDocuments@${chainId}/allow`, name: 'Chaves permitidas' },
            { path: `apps@${chainId}`, name: 'Aplicações' }
        ];

        for (const test of permissionTests) {
            try {
                const response = await axios.get(`${this.baseUrl}/${test.path}`, { httpsAgent: this.agent });
                console.log(`   ✅ ${test.name}: OK (${response.status})`);
            } catch (error) {
                console.log(`   ❌ ${test.name}: ${error.response?.status || 'ERRO'}`);
                if (error.response?.status === 401) {
                    console.log(`      🔒 Problema de autorização/licença`);
                }
            }
        }
    }

    async checkAvailableApis() {
        console.log('🚀 4. APIS DISPONÍVEIS');
        console.log('━'.repeat(50));
        
        const commonEndpoints = [
            'chain',
            'apps',
            'documents',
            'jsonDocuments',
            'opaqueRecords',
            'mirror'
        ];

        for (const endpoint of commonEndpoints) {
            try {
                const response = await axios.get(`${this.baseUrl}/${endpoint}`, { httpsAgent: this.agent });
                console.log(`✅ ${endpoint}: Disponível (${response.status})`);
            } catch (error) {
                const status = error.response?.status;
                if (status === 404) {
                    console.log(`❌ ${endpoint}: Não encontrado`);
                } else if (status === 401) {
                    console.log(`🔒 ${endpoint}: Sem autorização`);
                } else {
                    console.log(`⚠️  ${endpoint}: ${status || 'Erro'}`);
                }
            }
        }
        console.log('');
    }

    async testPermissionEndpoints() {
        console.log('🔑 5. TESTE DE PERMISSÕES ESPECÍFICAS');
        console.log('━'.repeat(50));
        
        try {
            // Tentar obter informações sobre licenças/permissões
            const licenseTests = [
                { path: 'license', name: 'Informações de licença' },
                { path: 'node/info', name: 'Informações do nó' },
                { path: 'node/status', name: 'Status do nó' },
                { path: 'certificate', name: 'Informações do certificado' }
            ];

            for (const test of licenseTests) {
                try {
                    const response = await axios.get(`${this.baseUrl}/${test.path}`, { httpsAgent: this.agent });
                    console.log(`✅ ${test.name}: Disponível`);
                    
                    // Mostrar informações relevantes
                    if (test.path === 'license' && response.data) {
                        console.log('   📋 Detalhes da licença:', JSON.stringify(response.data, null, 4));
                    }
                    
                } catch (error) {
                    console.log(`❌ ${test.name}: ${error.response?.status || 'Erro'}`);
                }
            }
            
        } catch (error) {
            console.log('❌ Erro nos testes de permissão:', error.message);
        }
        console.log('');
    }

    /**
     * Sugere soluções baseadas nos problemas encontrados
     */
    async suggestSolutions() {
        console.log('💡 SUGESTÕES DE SOLUÇÃO');
        console.log('━'.repeat(50));
        
        console.log('Para resolver o erro 401 (License not present), tente:');
        console.log('');
        console.log('1. 🔐 VERIFICAR CERTIFICADO:');
        console.log('   • Confirme se o arquivo rest.api.pfx está correto');
        console.log('   • Verifique se a senha "MultiKey" está correta');
        console.log('   • Confirme se o certificado não expirou');
        console.log('');
        console.log('2. 🏷️  VERIFICAR LICENÇA:');
        console.log('   • Entre em contato com o administrador do IL2');
        console.log('   • Verifique se sua licença permite adicionar registros JSON');
        console.log('   • Confirme se você tem permissões na cadeia específica');
        console.log('');
        console.log('3. 🔑 TENTAR MÉTODOS ALTERNATIVOS:');
        console.log('   • Use addJsonDocumentWithChainKeys()');
        console.log('   • Configure chaves permitidas primeiro');
        console.log('   • Verifique se há aplicações ativas na cadeia');
        console.log('');
        console.log('4. 🛠️  CONFIGURAÇÃO:');
        console.log('   • Verifique se está conectado ao servidor correto');
        console.log('   • Confirme se o certificado tem as permissões necessárias');
        console.log('   • Teste com uma cadeia diferente se disponível');
        console.log('');
    }
}

// Função principal para executar diagnóstico
async function runDiagnostics() {
    try {
        // Configuração do certificado
        const agent = new https.Agent({
            pfx: fs.readFileSync('rest.api.pfx'),
            passphrase: 'MultiKey',
            rejectUnauthorized: false
        });

        const BASE_URL = 'https://minerva-data.il2.io:32068';
        const diagnostics = new IL2Diagnostics(BASE_URL, agent);

        await diagnostics.runFullDiagnostics();
        await diagnostics.suggestSolutions();

    } catch (error) {
        console.error('❌ Erro ao executar diagnóstico:', error.message);
    }
}

// Executar diagnóstico se chamado diretamente
if (require.main === module) {
    runDiagnostics();
}

module.exports = { IL2Diagnostics };