const https = require('https');
const fs = require('fs');
const axios = require('axios');

const agent = new https.Agent({
    pfx: fs.readFileSync('rest.api.pfx'),
    passphrase: 'MultiKey',
    rejectUnauthorized: false
});

const BASE_URL = 'https://minerva-data.il2.io:32068';
const chainId = 'lGWanNMRdfHJ4hUJi5-f04WoLhMIasYazcoxjSDq3Uk'; 

async function getRecordHash(serial) {
    try {
        console.log(`\nBuscando registro para o serial ${serial}...`);
        
        // Use o endpoint /records@{chain}/{serial} para obter o hash
        const response = await axios.get(
            `${BASE_URL}/records@${chainId}/${serial}`,
            { httpsAgent: agent }
        );

        const record = response.data;
        
        console.log(`✅ Registro do serial ${serial} encontrado!`);
        console.log('📄 Detalhes do Registro:', record);
        
        // O hash está no campo 'hash' do objeto de resposta.
        if (record.hash) {
            console.log(`🔐 Hash do registro: ${record.hash}`);
        } else {
            console.log('⚠️ Hash não encontrado no registro.');
        }

    } catch (err) {
        if (err.response) {
            console.error('❌ Erro:', err.response.status);
            console.error('📄 Corpo da resposta:', err.response.data);
        } else {
            console.error('❌ Erro:', err.message);
        }
    }
}

// Chame a função para cada serial
getRecordHash(9);
getRecordHash(10);