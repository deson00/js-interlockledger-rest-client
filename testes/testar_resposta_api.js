const axios = require('axios');
const https = require('https');
const fs = require('fs');

const agent = new https.Agent({
    pfx: fs.readFileSync('rest.api.pfx'),
    passphrase: 'MultiKey',
    rejectUnauthorized: false
});

async function testarResposta() {
    try {
        console.log('🔍 Buscando documento serial 9...\n');
        
        const response = await axios.get(
            'https://minerva-data.il2.io:32068/jsonDocuments@V6Ge5NDq1oScy-05K85xEzntKHYUMh9m5G-fI0wy1gA/9',
            { httpsAgent: agent }
        );

        console.log('📋 RESPOSTA DA API:');
        console.log('='.repeat(70));
        console.log(JSON.stringify(response.data, null, 2));
        console.log('='.repeat(70));
        
        console.log('\n🔑 Propriedades disponíveis:');
        Object.keys(response.data).forEach(key => {
            console.log(`  - ${key}: ${typeof response.data[key]}`);
        });

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

testarResposta();
