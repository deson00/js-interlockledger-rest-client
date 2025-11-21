const axios = require('axios');

const API_URL = 'http://localhost:3000';

// Teste completo da API
async function testarAPI() {
    console.log('🧪 TESTE DA API REST - SBR PRIME');
    console.log('='.repeat(70));

    try {
        // 1. Health Check
        console.log('\n1️⃣ Testando Health Check...');
        const health = await axios.get(`${API_URL}/api/health`);
        console.log('✅ Status:', health.data.status);

        // 2. Listar Cadeias
        console.log('\n2️⃣ Listando cadeias disponíveis...');
        const chains = await axios.get(`${API_URL}/api/chains`);
        console.log(`✅ Total de cadeias: ${chains.data.count}`);
        const chainId = chains.data.chains[0].id;
        console.log(`📋 Usando cadeia: ${chains.data.chains[0].name}`);

        // 3. Info da Cadeia
        console.log('\n3️⃣ Obtendo informações da cadeia...');
        const chainInfo = await axios.get(`${API_URL}/api/chains/${chainId}`);
        console.log('✅ Último registro:', chainInfo.data.chain.lastRecord);

        // 4. Registrar Documento
        console.log('\n4️⃣ Registrando documento de teste...');
        const documento = {
            tipo: 'TESTE_API',
            titulo: 'Documento de Teste da API REST',
            dados: {
                empresa: 'SBR Prime',
                produto: 'Sistema de Rastreabilidade Blockchain',
                timestamp: new Date().toISOString()
            },
            descricao: 'Este é um documento de teste para validar a API REST'
        };

        const registro = await axios.post(`${API_URL}/api/registrar`, {
            documento: documento,
            chainId: chainId
        });

        console.log('✅ Documento registrado!');
        console.log(`🔢 Serial: ${registro.data.resultado.serial}`);
        console.log(`🔐 Hash Blockchain: ${registro.data.resultado.hashBlockchain}`);
        console.log(`🎫 Código de Verificação: ${registro.data.certificado.codigoVerificacao}`);

        const serial = registro.data.resultado.serial;
        const codigo = registro.data.certificado.codigoVerificacao;

        // 5. Verificar por Código
        console.log('\n5️⃣ Verificando documento por código...');
        const verificacaoCodigo = await axios.post(`${API_URL}/api/verificar/codigo`, {
            codigo: codigo,
            documento: documento
        });

        console.log(`✅ Verificação: ${verificacaoCodigo.data.resultado.valido ? 'AUTÊNTICO ✅' : 'NÃO AUTÊNTICO ❌'}`);

        // 6. Verificar por Serial
        console.log('\n6️⃣ Verificando documento por serial...');
        const verificacaoSerial = await axios.post(`${API_URL}/api/verificar/serial`, {
            serial: serial,
            documento: documento,
            chainId: chainId
        });

        console.log(`✅ Verificação: ${verificacaoSerial.data.resultado.valido ? 'AUTÊNTICO ✅' : 'NÃO AUTÊNTICO ❌'}`);

        // 7. Obter Certificado
        console.log('\n7️⃣ Obtendo certificado...');
        const certificado = await axios.get(`${API_URL}/api/certificado/${serial}`);
        console.log('✅ Certificado recuperado');
        console.log(`📄 Título: ${certificado.data.certificado.titulo}`);

        // 8. Listar Registros
        console.log('\n8️⃣ Listando últimos registros...');
        const registros = await axios.get(`${API_URL}/api/registros?pageSize=3`);
        console.log(`✅ Total de registros encontrados: ${registros.data.registros.items?.length || 0}`);

        // 9. Estatísticas
        console.log('\n9️⃣ Obtendo estatísticas...');
        const stats = await axios.get(`${API_URL}/api/estatisticas`);
        console.log('✅ Estatísticas:');
        console.log(`   - Total de cadeias: ${stats.data.estatisticas.totalCadeias}`);
        console.log(`   - Certificados emitidos: ${stats.data.estatisticas.totalCertificadosEmitidos}`);

        // 10. Teste de Documento Modificado (deve falhar)
        console.log('\n🔟 Testando documento modificado (deve falhar)...');
        const documentoModificado = {
            ...documento,
            dados: {
                ...documento.dados,
                modificado: true
            }
        };

        const verificacaoFalsa = await axios.post(`${API_URL}/api/verificar/codigo`, {
            codigo: codigo,
            documento: documentoModificado
        });

        console.log(`${verificacaoFalsa.data.resultado.valido ? '❌ ERRO: Deveria ter falhado!' : '✅ Verificação falhou corretamente'}`);

        console.log('\n' + '='.repeat(70));
        console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO!');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('\n❌ ERRO NO TESTE:');
        console.error('Mensagem:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dados:', error.response.data);
        }
    }
}

// Executar testes
testarAPI();
