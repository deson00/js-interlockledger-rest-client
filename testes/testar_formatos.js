const https = require('https');
const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');

/**
 * Codifica um número em ILInt format (InterlockLedger Int format)
 * Este é o formato usado internamente pelo IL2
 */
function encodeILInt(value) {
    if (value < 0xF8) {
        return Buffer.from([value]);
    } else if (value <= 0xFFFF) {
        return Buffer.from([0xF8, value & 0xFF, (value >> 8) & 0xFF]);
    } else if (value <= 0xFFFFFF) {
        return Buffer.from([0xF9, value & 0xFF, (value >> 8) & 0xFF, (value >> 16) & 0xFF]);
    } else {
        // 32-bit
        return Buffer.from([0xFA, value & 0xFF, (value >> 8) & 0xFF, (value >> 16) & 0xFF, (value >> 24) & 0xFF]);
    }
}

/**
 * Tenta registrar documento com diferentes formatos de encoding
 */
async function testarFormatos() {
    try {
        const agent = new https.Agent({
            pfx: fs.readFileSync('rest.api.pfx'),
            passphrase: 'MultiKey',
            rejectUnauthorized: false
        });

        const BASE_URL = 'https://minerva-data.il2.io:32068';
        const chainId = 'V6Ge5NDq1oScy-05K85xEzntKHYUMh9m5G-fI0wy1gA';

        console.log('🧪 TESTANDO DIFERENTES FORMATOS DE PAYLOAD');
        console.log('='.repeat(70));

        const documento = {
            tipo: 'TESTE',
            titulo: 'Documento de Teste',
            timestamp: new Date().toISOString()
        };

        const jsonString = JSON.stringify(documento);
        const jsonBytes = Buffer.from(jsonString, 'utf8');

        // Formato 1: JSON puro em base64 (o que estávamos fazendo)
        const formato1 = jsonBytes.toString('base64');

        // Formato 2: ILInt tag + tamanho + dados
        const tagBuffer = encodeILInt(300); // Tag 300
        const sizeBuffer = encodeILInt(jsonBytes.length);
        const formato2Buffer = Buffer.concat([tagBuffer, sizeBuffer, jsonBytes]);
        const formato2 = formato2Buffer.toString('base64');

        //Formato 3: Apenas o tamanho + dados
        const formato3Buffer = Buffer.concat([sizeBuffer, jsonBytes]);
        const formato3 = formato3Buffer.toString('base64');

        const testes = [
            {
                nome: 'App 1, Tag 300, JSON puro',
                payload: {
                    applicationId: 1,
                    payloadTagId: 300,
                    payloadBytes: formato1
                }
            },
            {
                nome: 'App 1, sem tag, JSON puro',
                payload: {
                    applicationId: 1,
                    payloadBytes: formato1
                }
            },
            {
                nome: 'App 1, sem tag, ILInt prefixado',
                payload: {
                    applicationId: 1,
                    payloadBytes: formato2
                }
            },
            {
                nome: 'App 1, sem tag, apenas tamanho + dados',
                payload: {
                    applicationId: 1,
                    payloadBytes: formato3
                }
            },
            {
                nome: 'App 8, sem tag, JSON puro',
                payload: {
                    applicationId: 8,
                    payloadBytes: formato1
                }
            }
        ];

        for (const teste of testes) {
            console.log(`\n🔄 Testando: ${teste.nome}`);
            console.log(`   Payload size: ${Buffer.from(teste.payload.payloadBytes, 'base64').length} bytes`);
            
            try {
                const response = await axios.post(
                    `${BASE_URL}/records@${chainId}`,
                    teste.payload,
                    {
                        httpsAgent: agent,
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    }
                );

                console.log(`✅ SUCESSO! Serial: ${response.data.serial}`);
                console.log(`   Resposta:`, response.data);
                
                // Verificar o registro
                const record = await axios.get(
                    `${BASE_URL}/records@${chainId}/${response.data.serial}`,
                    { httpsAgent: agent }
                );
                
                console.log(`   Tag registrada: ${record.data.payloadTagId}`);
                return;

            } catch (error) {
                const status = error.response?.status;
                const msg = error.response?.data?.title || error.message;
                console.log(`❌ Falhou: ${status} - ${msg}`);
            }
        }

        console.log('\n❌ Nenhum formato funcionou');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

testarFormatos();
