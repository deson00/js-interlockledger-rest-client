const axios = require('axios');
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');

const agent = new https.Agent({
    pfx: fs.readFileSync('rest.api.pfx'),
    passphrase: 'MultiKey',
    rejectUnauthorized: false
});

async function testarEndpoints() {
    try {
        console.log('🔍 Testando cálculo de hash...\n');
        
        const recordResponse = await axios.get(
            'https://minerva-data.il2.io:32068/records@V6Ge5NDq1oScy-05K85xEzntKHYUMh9m5G-fI0wy1gA/9',
            { httpsAgent: agent }
        );

        console.log('📋 RESPOSTA /records (payloadBytes):');
        console.log('Base64:', recordResponse.data.payloadBytes.substring(0, 100) + '...\n');
        
        // Calcular hash
        const payloadBuffer = Buffer.from(recordResponse.data.payloadBytes, 'base64');
        const hash = crypto.createHash('sha256').update(payloadBuffer).digest('hex').toUpperCase();
        
        console.log('🔑 Hash Calculado:', hash);
        console.log('🔑 Hash Parcial (8 chars):', hash.substring(0, 8));
        console.log('🎫 Código Esperado: IL2-9-5C318D90');
        console.log('✅ Hash Corresponde:', hash.substring(0, 8) === '5C318D90' ? 'SIM' : 'NÃO');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
        }
    }
}

testarEndpoints();
