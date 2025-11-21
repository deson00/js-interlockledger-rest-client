const https = require('https');
const fs = require('fs');
const axios = require('axios');

async function analisarRegistrosExistentes() {
    try {
        const agent = new https.Agent({
            pfx: fs.readFileSync('rest.api.pfx'),
            passphrase: 'MultiKey',
            rejectUnauthorized: false
        });

        const BASE_URL = 'https://minerva-data.il2.io:32068';
        const chainId = 'V6Ge5NDq1oScy-05K85xEzntKHYUMh9m5G-fI0wy1gA';

        console.log('🔍 ANALISANDO REGISTROS EXISTENTES DA CADEIA');
        console.log('='.repeat(70));

        // Obter informações da cadeia
        const chainInfo = await axios.get(
            `${BASE_URL}/chain/${chainId}`,
            { httpsAgent: agent }
        );

        console.log('📋 Informações da Cadeia:');
        console.log(`   Nome: ${chainInfo.data.name}`);
        console.log(`   Último Registro: ${chainInfo.data.lastRecord}`);
        console.log(`   Apps Ativos: ${chainInfo.data.activeApps?.join(', ') || 'N/A'}`);

        // Analisar primeiros 5 registros
        console.log('\n📊 Analisando estrutura dos registros existentes...');
        console.log('─'.repeat(70));

        for (let serial = 0; serial <= Math.min(5, chainInfo.data.lastRecord); serial++) {
            try {
                const record = await axios.get(
                    `${BASE_URL}/records@${chainId}/${serial}`,
                    { httpsAgent: agent }
                );

                const reg = record.data;
                console.log(`\n📄 Registro ${serial}:`);
                console.log(`   App ID: ${reg.applicationId}`);
                console.log(`   Payload Tag ID: ${reg.payloadTagId}`);
                console.log(`   Type: ${reg.type}`);
                console.log(`   Network: ${reg.network}`);
                
                if (reg.payloadBytes) {
                    const payloadSize = Buffer.from(reg.payloadBytes, 'base64').length;
                    console.log(`   Payload Size: ${payloadSize} bytes`);
                    
                    // Tentar decodificar
                    try {
                        const decoded = Buffer.from(reg.payloadBytes, 'base64').toString('utf8');
                        if (decoded.startsWith('{')) {
                            const json = JSON.parse(decoded);
                            console.log(`   Conteúdo: JSON - ${Object.keys(json).join(', ')}`);
                        } else {
                            console.log(`   Conteúdo: Texto - ${decoded.substring(0, 50)}...`);
                        }
                    } catch {
                        console.log(`   Conteúdo: Binário/Não decodificável`);
                    }
                }

            } catch (error) {
                console.log(`\n❌ Erro ao ler registro ${serial}: ${error.message}`);
            }
        }

        // Listar aplicações permitidas
        console.log('\n\n🚀 APLICAÇÕES DISPONÍVEIS:');
        console.log('─'.repeat(70));
        
        try {
            const apps = await axios.get(
                `${BASE_URL}/apps@${chainId}`,
                { httpsAgent: agent }
            );
            
            console.log('Apps encontrados:', JSON.stringify(apps.data, null, 2));
        } catch (error) {
            console.log('Não foi possível listar aplicações:', error.message);
        }

        // Tentar obter permissões
        console.log('\n\n🔐 TESTANDO PERMISSÕES:');
        console.log('─'.repeat(70));

        const testPayload = Buffer.from('teste', 'utf8').toString('base64');
        
        for (const appId of [1, 2, 3, 8, 10]) {
            try {
                await axios.post(
                    `${BASE_URL}/records@${chainId}`,
                    {
                        applicationId: appId,
                        payloadBytes: testPayload
                    },
                    {
                        httpsAgent: agent,
                        headers: { 'Content-Type': 'application/json' },
                        validateStatus: () => true // Aceitar qualquer status
                    }
                );
                console.log(`✅ App ${appId}: Permitido`);
            } catch (error) {
                const status = error.response?.status;
                const msg = error.response?.data?.title || error.message;
                console.log(`❌ App ${appId}: ${status} - ${msg}`);
            }
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

analisarRegistrosExistentes();
