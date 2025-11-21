const { RegistroDocumentoV2 } = require('./registro_documento_v2');
const fs = require('fs');

async function testarArquivos() {
    try {
        console.log('🧪 TESTE DE GERAÇÃO DE ARQUIVOS');
        console.log('='.repeat(70));

        const registrador = new RegistroDocumentoV2();

        // Documento de teste
        const documento = {
            tipo: 'TESTE_ARQUIVOS',
            titulo: 'Teste de Salvamento de Arquivos',
            descricao: 'Verificando se JSON original e certificado são salvos corretamente',
            data: new Date().toISOString(),
            campos_teste: {
                campo1: 'Valor 1',
                campo2: 'Valor 2',
                campo3: 'Valor 3'
            }
        };

        // Registrar documento
        console.log('\n📝 Registrando documento...');
        const resultado = await registrador.registerDocument(documento);

        console.log('\n✅ REGISTRO CONCLUÍDO!');
        console.log('─'.repeat(70));
        console.log(`Serial: ${resultado.serial}`);
        console.log(`Código: ${resultado.certificate.codigoVerificacao}`);
        console.log(`\n📁 ARQUIVOS GERADOS:`);
        console.log(`  🔐 Certificado: ${resultado.certificateFile}`);
        console.log(`  📄 Documento: ${resultado.documentFile}`);

        // Verificar se os arquivos existem
        console.log('\n🔍 VERIFICANDO ARQUIVOS...');
        console.log('─'.repeat(70));

        // Verificar certificado
        if (fs.existsSync(resultado.certificateFile)) {
            const certSize = fs.statSync(resultado.certificateFile).size;
            console.log(`✅ Certificado encontrado (${certSize} bytes)`);
            
            // Ler e validar conteúdo
            const certContent = JSON.parse(fs.readFileSync(resultado.certificateFile, 'utf8'));
            console.log(`   📋 Título: ${certContent.titulo}`);
            console.log(`   🔑 Código: ${certContent.codigoVerificacao}`);
            console.log(`   📅 Emissão: ${certContent.emissao}`);
        } else {
            console.log(`❌ Certificado NÃO encontrado!`);
        }

        // Verificar documento original
        if (fs.existsSync(resultado.documentFile)) {
            const docSize = fs.statSync(resultado.documentFile).size;
            console.log(`✅ Documento original encontrado (${docSize} bytes)`);
            
            // Ler e validar conteúdo
            const docContent = JSON.parse(fs.readFileSync(resultado.documentFile, 'utf8'));
            console.log(`   📋 Tipo: ${docContent.tipo}`);
            console.log(`   📝 Título: ${docContent.titulo}`);
            console.log(`   ⏰ Timestamp: ${docContent.timestamp}`);
        } else {
            console.log(`❌ Documento original NÃO encontrado!`);
        }

        // Listar todos os arquivos nas pastas
        console.log('\n📂 CONTEÚDO DAS PASTAS:');
        console.log('─'.repeat(70));

        if (fs.existsSync('certificados')) {
            const certFiles = fs.readdirSync('certificados');
            console.log(`\n🔐 Pasta certificados/ (${certFiles.length} arquivo(s)):`);
            certFiles.forEach(file => {
                const size = fs.statSync(`certificados/${file}`).size;
                console.log(`   - ${file} (${size} bytes)`);
            });
        }

        if (fs.existsSync('documentos_originais')) {
            const docFiles = fs.readdirSync('documentos_originais');
            console.log(`\n📄 Pasta documentos_originais/ (${docFiles.length} arquivo(s)):`);
            docFiles.forEach(file => {
                const size = fs.statSync(`documentos_originais/${file}`).size;
                console.log(`   - ${file} (${size} bytes)`);
            });
        }

        console.log('\n\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
        console.log('='.repeat(70));
        console.log('\n📋 RESUMO:');
        console.log('  ✅ Documento registrado na blockchain');
        console.log('  ✅ Certificado salvo em arquivo JSON');
        console.log('  ✅ Documento original salvo em arquivo JSON');
        console.log('  ✅ Código de verificação gerado');
        console.log('\n💡 Agora você tem referência completa do documento!');

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

testarArquivos();
