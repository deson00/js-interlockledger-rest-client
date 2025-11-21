const axios = require('axios');
const https = require('https');
const fs = require('fs');

const agent = new https.Agent({
    pfx: fs.readFileSync('rest.api.pfx'),
    passphrase: 'MultiKey',
    rejectUnauthorized: false
});

const BASE_URL = 'https://minerva-data.il2.io:32068';

async function listSBRChainRecords() {
    try {
        // 1. Listar todas as cadeias disponíveis
        const chainsRes = await axios.get(`${BASE_URL}/chain`, { httpsAgent: agent });
        const allChains = chainsRes.data;

        // 2. Filtrar apenas as cadeias que começam com "SBR"
        const sbrChains = allChains.filter(chain => chain.name.startsWith('SBR'));

        if (sbrChains.length === 0) {
            console.log('Nenhuma cadeia "SBR" encontrada.');
            return;
        }

        console.log('✅ Cadeias SBR encontradas e seus registros:');

        // 3. Iterar sobre as cadeias SBR e listar os registros de cada uma
        for (const chain of sbrChains) {
            console.log(`\n--- Registros para a cadeia "${chain.name}" (ID: ${chain.id}) ---`);
            
            const recordsRes = await axios.get(`${BASE_URL}/records@${chain.id}`, { httpsAgent: agent });
            const records = recordsRes.data;

            if (records.length === 0) {
                console.log('Nenhum registro encontrado nesta cadeia.');
            } else {
                console.log('📜 Registros:', records);
            }
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

listSBRChainRecords();