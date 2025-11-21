const axios = require('axios');

async function testarVerificacao() {
    try {
        console.log('🔍 Testando verificação do documento serial 9...\n');
        
        const response = await axios.post('http://localhost:3000/api/verificar/codigo', {
            codigo: 'IL2-9-5C318D90'
        });

        console.log('📋 RESPOSTA DA VERIFICAÇÃO:');
        console.log('='.repeat(70));
        console.log(JSON.stringify(response.data, null, 2));
        console.log('='.repeat(70));

        if (response.data.success && response.data.resultado) {
            const r = response.data.resultado;
            console.log('\n✅ RESULTADO:');
            console.log(`   Serial: ${r.serial}`);
            console.log(`   Chain: ${r.chainId}`);
            console.log(`   Network: ${r.network}`);
            console.log(`   Hash: ${r.hashBlockchain || 'undefined'}`);
            console.log(`   Hash Verificado: ${r.hashVerificado ? '✅ Sim' : '❌ Não'}`);
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
        if (error.response) {
            console.error('Resposta:', error.response.data);
        }
    }
}

testarVerificacao();
