const https = require('https');
const fs = require('fs');
const axios = require('axios');

// Configurações do certificado para a requisição
const agent = new https.Agent({
    pfx: fs.readFileSync('rest.api.pfx'),
    passphrase: 'MultiKey',
    rejectUnauthorized: false
});

// Host da API
const BASE_URL = 'https://minerva-data.il2.io:32068';

// Payload para criar a nova cadeia (ajuste os valores conforme necessário)
const newChainPayload = {
    name: "MinhaNovaCadeiaSBR-1",
    parent: "UHtrQPXaYXzUJVA4fZ_jtbSC4thGFn7YcrYnhkcvXRY",
    keysAlgorithm: "RSA",
    operatingKeyAlgorithm: "RSA",
    managementKeyStrength: "Normal",
    operatingKeyStrength: "Normal",
    emergencyClosingKeyStrength: "Normal",
    apiCertificates: [
        {
            name: "cert-cliente-api",
            permissions: ["#2,500,501"],
            purposes: ["Api"],
            description: "Certificado da API para acesso à nova cadeia.",
            certificateInX509: "COLOQUE_AQUI_O_CERTIFICADO_BASE64_DO_SEU_ARQUIVO_CER"
        }
    ],
    managementKeyPassword: "sua_senha_de_gerenciamento",
    emergencyClosingKeyPassword: "sua_senha_de_emergencia",
    additionalApps: [0],
    description: "Cadeia para testes de desenvolvimento."
};

async function createNewChain() {
    try {
        const createRes = await axios.post(
            `${BASE_URL}/chain`,
            newChainPayload,
            { httpsAgent: agent }
        );

        console.log('✅ Nova cadeia criada com sucesso!');
        console.log('🔗 Detalhes da nova cadeia:', createRes.data);

    } catch (err) {
        if (err.response) {
            console.error('❌ Erro ao criar a cadeia:', err.response.status);
            console.error('📄 Corpo da resposta:', err.response.data);
        } else {
            console.error('❌ Erro:', err.message);
        }
    }
}

createNewChain();