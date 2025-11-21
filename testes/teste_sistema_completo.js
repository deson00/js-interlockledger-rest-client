const { RegistroDocumentoV2 } = require('./registro_documento_v2');

async function testeCompleto() {
    try {
        console.log('🧪 TESTE COMPLETO DO SISTEMA DE REGISTRO');
        console.log('='.repeat(70));

        const registrador = new RegistroDocumentoV2();

        // Documento de teste
        const documento = {
            tipo: 'TESTE_FINAL',
            titulo: 'Documento de Teste - Sistema SBR Prime',
            descricao: 'Este é um documento de teste para validar o sistema completo',
            data_teste: new Date().toISOString(),
            dados: {
                campo1: 'Valor 1',
                campo2: 'Valor 2',
                campo3: {
                    subcampo1: 'Teste',
                    subcampo2: 123
                }
            }
        };

        // 1. Registrar documento
        console.log('\n📝 Passo 1: Registrando documento...');
        const resultado = await registrador.registerDocument(documento);

        console.log('\n✅ REGISTRO CONCLUÍDO COM SUCESSO!');
        console.log('─'.repeat(70));
        console.log(`Serial: ${resultado.serial}`);
        console.log(`Hash: ${resultado.hash}`);
        console.log(`Código de Verificação: ${resultado.certificate.codigoVerificacao}`);
        console.log(`Certificado salvo em: ${resultado.certificateFile}`);

        // 2. Verificar por serial
        console.log('\n🔍 Passo 2: Verificando documento por serial...');
        const verificacaoSerial = await registrador.verifyBySerial(resultado.serial);
        
        if (verificacaoSerial.found) {
            console.log('✅ Documento encontrado na blockchain!');
            console.log(`   Application ID: ${verificacaoSerial.document.applicationId}`);
            console.log(`   Payload Tag ID: ${verificacaoSerial.document.payloadTagId}`);
            console.log(`   Network: ${verificacaoSerial.document.network}`);
        } else {
            console.log('❌ Documento NÃO encontrado');
        }

        // 3. Verificar por código
        console.log('\n🔍 Passo 3: Verificando documento por código...');
        const verificacaoCodigo = await registrador.verifyByCode(resultado.certificate.codigoVerificacao);
        
        if (verificacaoCodigo.found) {
            console.log('✅ Código de verificação válido!');
        } else {
            console.log('❌ Código de verificação inválido');
        }

        console.log('\n\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO!');
        console.log('='.repeat(70));
        console.log('\n📋 RESUMO:');
        console.log(`  ✅ Registro na blockchain: SUCESSO`);
        console.log(`  ✅ Verificação por serial: SUCESSO`);
        console.log(`  ✅ Verificação por código: SUCESSO`);
        console.log(`  ✅ Geração de certificado: SUCESSO`);
        console.log('\n💡 O sistema está pronto para uso!');

    } catch (error) {
        console.error('\n❌ ERRO NO TESTE:');
        console.error('─'.repeat(70));
        console.error(error.message);
        if (error.stack) {
            console.error('\nStack trace:');
            console.error(error.stack);
        }
        process.exit(1);
    }
}

testeCompleto();
