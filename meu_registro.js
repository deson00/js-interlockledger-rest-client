const { RegistroDocumentoV2 } = require('./registro_documento_v2');

async function registrarMeuDocumento() {
    try {
        console.log('📝 Registrando documento na blockchain...\n');

        // SEU DOCUMENTO JSON AQUI
        const meuDocumento = {
            tipo: "NOTA_FISCAL",
            numero: "NF-2025-12345",
            empresa: {
                razaoSocial: "SBR Prime Ltda",
                cnpj: "12.345.678/0001-90"
            },
            cliente: {
                nome: "Maria Santos",
                cpf: "123.456.789-00"
            },
            itens: [
                {
                    descricao: "Produto A",
                    quantidade: 2,
                    valor: 100.00
                },
                {
                    descricao: "Produto B",
                    quantidade: 1,
                    valor: 250.00
                }
            ],
            total: 450.00,
            data_emissao: new Date().toISOString(),
            observacoes: "Documento registrado na blockchain IL2"
        };

        // Registrar na blockchain
        const registrador = new RegistroDocumentoV2();
        const resultado = await registrador.registerDocument(meuDocumento);

        // Exibir resultado
        console.log('✅ REGISTRO CONCLUÍDO COM SUCESSO!\n');
        console.log('='.repeat(70));
        console.log(`🔢 Serial: ${resultado.serial}`);
        console.log(`🎫 Código de Verificação: ${resultado.certificate.codigoVerificacao}`);
        console.log(`🔗 Chain: ${resultado.chainName}`);
        console.log(`🌐 Network: ${resultado.network}`);
        console.log(`⏰ Timestamp: ${resultado.timestamp}`);
        console.log('='.repeat(70));
        console.log(`\n📁 Arquivos salvos:`);
        console.log(`   📜 Certificado: ${resultado.certificateFile}`);
        console.log(`   📄 JSON Original: ${resultado.documentFile}`);
        console.log('\n💡 Use o código de verificação para consultar este documento!');
        console.log(`   Portal: http://localhost:3000`);

    } catch (error) {
        console.error('❌ Erro ao registrar documento:', error.message);
    }
}

// Executar
registrarMeuDocumento();
