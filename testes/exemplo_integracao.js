const { RegistroDocumento } = require('./registro_documento');
const https = require('https');
const fs = require('fs');
const axios = require('axios');

/**
 * Exemplo de integração do sistema de registro de documentos
 * em um workflow empresarial
 */

class WorkflowDocumentos {
    constructor() {
        // Configurar agente HTTPS
        this.agent = new https.Agent({
            pfx: fs.readFileSync('rest.api.pfx'),
            passphrase: 'MultiKey',
            rejectUnauthorized: false
        });

        this.BASE_URL = 'https://minerva-data.il2.io:32068';
        this.registrador = new RegistroDocumento(this.BASE_URL, this.agent);
        this.chainId = null;
    }

    /**
     * Inicializa o workflow obtendo a chain
     */
    async inicializar() {
        // Usar cadeia específica
        this.chainId = 'V6Ge5NDq1oScy-05K85xEzntKHYUMh9m5G-fI0wy1gA';
        
        // Obter informações detalhadas da cadeia
        const chainInfo = await axios.get(
            `${this.BASE_URL}/chain/${this.chainId}`,
            { httpsAgent: this.agent }
        );

        console.log('✅ Workflow inicializado');
        console.log(`📋 Usando cadeia: ${chainInfo.data.name || this.chainId}`);
        console.log(`🔢 Último registro: ${chainInfo.data.lastRecord}`);
        console.log(`🚀 Aplicações ativas: ${chainInfo.data.activeApps?.join(', ') || 'N/A'}`);
        
        return {
            chainId: this.chainId,
            chainName: chainInfo.data.name || this.chainId,
            lastRecord: chainInfo.data.lastRecord
        };
    }

    /**
     * Workflow 1: Registro de Contrato
     */
    async registrarContrato(dadosContrato) {
        console.log('\n📄 WORKFLOW: Registro de Contrato');
        console.log('─'.repeat(70));

        // 1. Validar dados do contrato
        if (!dadosContrato.contratante || !dadosContrato.contratado) {
            throw new Error('Dados do contrato incompletos');
        }

        // 2. Criar documento estruturado
        const documento = {
            tipo: 'CONTRATO',
            categoria: 'PRESTACAO_SERVICOS',
            titulo: dadosContrato.titulo,
            partes: {
                contratante: dadosContrato.contratante,
                contratado: dadosContrato.contratado
            },
            termos: dadosContrato.termos,
            valor: dadosContrato.valor,
            vigencia: dadosContrato.vigencia,
            clausulas: dadosContrato.clausulas || [],
            observacoes: dadosContrato.observacoes || '',
            metadados: {
                criadoPor: dadosContrato.usuarioCriador,
                departamento: dadosContrato.departamento,
                projeto: dadosContrato.projeto
            }
        };

        console.log(`📝 Registrando: ${documento.titulo}`);

        // 3. Registrar na blockchain
        const resultado = await this.registrador.registrarDocumento(
            this.chainId, 
            documento
        );

        // 4. Gerar certificado
        const certificado = this.registrador.gerarCertificado(resultado);

        // 5. Salvar certificado
        const nomeArquivo = `certificados/contrato_${resultado.serial}_${Date.now()}.json`;
        this.registrador.salvarCertificado(certificado, nomeArquivo);

        // 6. Notificar partes (simulação)
        await this.notificarPartes(dadosContrato, certificado);

        console.log(`✅ Contrato registrado com serial: ${resultado.serial}`);
        console.log(`🎫 Código de verificação: ${certificado.codigoVerificacao}`);

        return {
            resultado,
            certificado,
            arquivoCertificado: nomeArquivo
        };
    }

    /**
     * Workflow 2: Registro de Documento de Rastreabilidade
     */
    async registrarRastreabilidade(dadosRastreamento) {
        console.log('\n📦 WORKFLOW: Registro de Rastreabilidade');
        console.log('─'.repeat(70));

        const documento = {
            tipo: 'RASTREABILIDADE',
            categoria: 'PRODUTO',
            produto: {
                codigo: dadosRastreamento.codigoProduto,
                nome: dadosRastreamento.nomeProduto,
                lote: dadosRastreamento.lote,
                dataFabricacao: dadosRastreamento.dataFabricacao,
                dataValidade: dadosRastreamento.dataValidade
            },
            origem: dadosRastreamento.origem,
            destino: dadosRastreamento.destino,
            transporte: {
                veiculo: dadosRastreamento.veiculo,
                motorista: dadosRastreamento.motorista,
                rota: dadosRastreamento.rota
            },
            qualidade: {
                temperatura: dadosRastreamento.temperatura,
                umidade: dadosRastreamento.umidade,
                condicoes: dadosRastreamento.condicoes
            },
            checkpoints: dadosRastreamento.checkpoints || []
        };

        console.log(`📦 Rastreando: ${documento.produto.nome} - Lote ${documento.produto.lote}`);

        const resultado = await this.registrador.registrarDocumento(
            this.chainId, 
            documento
        );

        const certificado = this.registrador.gerarCertificado(resultado);
        const nomeArquivo = `certificados/rastreamento_${resultado.serial}_${Date.now()}.json`;
        this.registrador.salvarCertificado(certificado, nomeArquivo);

        console.log(`✅ Rastreamento registrado: ${resultado.serial}`);
        console.log(`🎫 Código: ${certificado.codigoVerificacao}`);

        return { resultado, certificado, arquivoCertificado: nomeArquivo };
    }

    /**
     * Workflow 3: Registro de Certificação de Produto
     */
    async registrarCertificacao(dadosCertificacao) {
        console.log('\n🏆 WORKFLOW: Registro de Certificação');
        console.log('─'.repeat(70));

        const documento = {
            tipo: 'CERTIFICACAO',
            categoria: dadosCertificacao.tipoCertificacao, // Ex: ISO, ORGANICO, BPF
            produto: {
                nome: dadosCertificacao.nomeProduto,
                fabricante: dadosCertificacao.fabricante,
                cnpj: dadosCertificacao.cnpj
            },
            certificacao: {
                orgaoCertificador: dadosCertificacao.orgaoCertificador,
                numeroCertificado: dadosCertificacao.numeroCertificado,
                dataEmissao: dadosCertificacao.dataEmissao,
                dataValidade: dadosCertificacao.dataValidade,
                escopo: dadosCertificacao.escopo
            },
            analises: dadosCertificacao.analises || [],
            conformidades: dadosCertificacao.conformidades || []
        };

        console.log(`🏆 Certificando: ${documento.produto.nome}`);
        console.log(`📋 Certificação: ${documento.categoria}`);

        const resultado = await this.registrador.registrarDocumento(
            this.chainId, 
            documento
        );

        const certificado = this.registrador.gerarCertificado(resultado);
        const nomeArquivo = `certificados/certificacao_${resultado.serial}_${Date.now()}.json`;
        this.registrador.salvarCertificado(certificado, nomeArquivo);

        console.log(`✅ Certificação registrada: ${resultado.serial}`);

        return { resultado, certificado, arquivoCertificado: nomeArquivo };
    }

    /**
     * Workflow 4: Registro de Laudo/Análise
     */
    async registrarLaudo(dadosLaudo) {
        console.log('\n🔬 WORKFLOW: Registro de Laudo');
        console.log('─'.repeat(70));

        const documento = {
            tipo: 'LAUDO',
            categoria: dadosLaudo.tipoLaudo, // Ex: LABORATORIAL, TECNICO, PERICIAL
            identificacao: {
                numero: dadosLaudo.numeroLaudo,
                data: dadosLaudo.dataEmissao,
                responsavel: dadosLaudo.responsavelTecnico,
                registro: dadosLaudo.registroProfissional
            },
            amostra: {
                codigo: dadosLaudo.codigoAmostra,
                descricao: dadosLaudo.descricaoAmostra,
                dataColeta: dadosLaudo.dataColeta
            },
            analises: dadosLaudo.analises,
            resultados: dadosLaudo.resultados,
            conclusao: dadosLaudo.conclusao,
            metodologia: dadosLaudo.metodologia || '',
            referencias: dadosLaudo.referencias || []
        };

        console.log(`🔬 Registrando laudo: ${documento.identificacao.numero}`);

        const resultado = await this.registrador.registrarDocumento(
            this.chainId, 
            documento
        );

        const certificado = this.registrador.gerarCertificado(resultado);
        const nomeArquivo = `certificados/laudo_${resultado.serial}_${Date.now()}.json`;
        this.registrador.salvarCertificado(certificado, nomeArquivo);

        console.log(`✅ Laudo registrado: ${resultado.serial}`);

        return { resultado, certificado, arquivoCertificado: nomeArquivo };
    }

    /**
     * Simula notificação das partes envolvidas
     */
    async notificarPartes(dados, certificado) {
        console.log('\n📧 Notificando partes envolvidas...');
        
        // Aqui você integraria com serviço de email
        // Por exemplo: SendGrid, AWS SES, etc.
        
        const notificacoes = [];
        
        if (dados.contratante?.email) {
            notificacoes.push({
                para: dados.contratante.email,
                assunto: 'Contrato Registrado na Blockchain',
                mensagem: `Seu contrato foi registrado com sucesso. Código: ${certificado.codigoVerificacao}`
            });
        }

        if (dados.contratado?.email) {
            notificacoes.push({
                para: dados.contratado.email,
                assunto: 'Contrato Registrado na Blockchain',
                mensagem: `Seu contrato foi registrado com sucesso. Código: ${certificado.codigoVerificacao}`
            });
        }

        console.log(`✅ ${notificacoes.length} notificação(ões) enviada(s)`);
        return notificacoes;
    }

    /**
     * Gera relatório de documentos registrados
     */
    async gerarRelatorio(filtros = {}) {
        console.log('\n📊 Gerando relatório...');
        
        const certificadosDir = 'certificados';
        if (!fs.existsSync(certificadosDir)) {
            return { total: 0, documentos: [] };
        }

        const arquivos = fs.readdirSync(certificadosDir);
        const documentos = [];

        for (const arquivo of arquivos) {
            const certificado = JSON.parse(
                fs.readFileSync(`${certificadosDir}/${arquivo}`, 'utf8')
            );
            
            documentos.push({
                serial: certificado.dados.serial,
                codigo: certificado.codigoVerificacao,
                timestamp: certificado.dados.timestampRegistro,
                hash: certificado.dados.hashBlockchain
            });
        }

        return {
            total: documentos.length,
            documentos: documentos
        };
    }
}

// Exemplo de uso dos workflows
async function exemploWorkflows() {
    try {
        const workflow = new WorkflowDocumentos();
        
        // Inicializar
        await workflow.inicializar();

        // 1. Registrar Contrato
        const contrato = await workflow.registrarContrato({
            titulo: 'Contrato de Prestação de Serviços - TI',
            contratante: {
                nome: 'SBR Prime Ltda',
                cnpj: '12.345.678/0001-90',
                email: 'contato@sbrprime.com.br'
            },
            contratado: {
                nome: 'João Silva Consultoria',
                cpf: '123.456.789-00',
                email: 'joao@exemplo.com'
            },
            termos: 'Prestação de serviços de consultoria em TI',
            valor: 'R$ 10.000,00',
            vigencia: {
                inicio: '2025-11-21',
                fim: '2026-11-21'
            },
            clausulas: [
                'Pagamento em 12 parcelas mensais',
                'Suporte técnico incluído',
                'Atualização de sistemas'
            ],
            usuarioCriador: 'admin@sbrprime.com.br',
            departamento: 'TI',
            projeto: 'Modernização Sistemas'
        });

        // 2. Registrar Rastreabilidade
        const rastreamento = await workflow.registrarRastreabilidade({
            codigoProduto: 'PROD-001',
            nomeProduto: 'Ração Premium Bovina',
            lote: 'LOTE-2025-001',
            dataFabricacao: '2025-11-15',
            dataValidade: '2026-11-15',
            origem: {
                empresa: 'Fábrica ABC',
                cidade: 'Campo Grande',
                estado: 'MS'
            },
            destino: {
                empresa: 'Fazenda XYZ',
                cidade: 'Dourados',
                estado: 'MS'
            },
            veiculo: 'Caminhão ABC-1234',
            motorista: 'Pedro Santos',
            rota: 'Campo Grande - Dourados via BR-163',
            temperatura: '25°C',
            umidade: '60%',
            condicoes: 'Excelentes',
            checkpoints: [
                { local: 'Campo Grande', timestamp: '2025-11-21T08:00:00Z', status: 'Partida' },
                { local: 'Rio Brilhante', timestamp: '2025-11-21T10:30:00Z', status: 'Passagem' },
                { local: 'Dourados', timestamp: '2025-11-21T12:00:00Z', status: 'Chegada' }
            ]
        });

        // 3. Gerar Relatório
        console.log('\n' + '='.repeat(70));
        const relatorio = await workflow.gerarRelatorio();
        console.log(`📊 Total de documentos registrados: ${relatorio.total}`);
        console.log('='.repeat(70));

    } catch (error) {
        console.error('❌ Erro no workflow:', error.message);
    }
}

// Executar se for chamado diretamente
if (require.main === module) {
    exemploWorkflows();
}

module.exports = { WorkflowDocumentos };
