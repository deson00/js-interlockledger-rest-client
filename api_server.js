const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const { RegistroDocumentoV2 } = require('./registro_documento_v2');
const { VerificacaoDocumento } = require('./verificacao_documento');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do agente HTTPS para IL2
const agent = new https.Agent({
    pfx: fs.readFileSync('rest.api.pfx'),
    passphrase: process.env.API_CERTIFICATE_PASSWORD || 'MultiKey',
    rejectUnauthorized: false
});

const BASE_URL = process.env.API_BASE_URL || 'https://minerva-data.il2.io:32068';

// Instâncias dos clientes
const registrador = new RegistroDocumentoV2();
const verificador = new VerificacaoDocumento(BASE_URL, agent);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Servir o portal de verificação
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'portal_verificacao.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        service: 'SBR Prime - IL2 Blockchain API',
        version: '1.0.0'
    });
});

// Listar cadeias disponíveis
app.get('/api/chains', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/chain`, { httpsAgent: agent });
        const chains = response.data;

        res.json({
            success: true,
            count: chains.length,
            chains: chains.map(chain => ({
                id: chain.id,
                name: chain.name,
                description: chain.description,
                lastRecord: chain.lastRecord
            }))
        });
    } catch (error) {
        console.error('Erro ao listar cadeias:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erro ao listar cadeias disponíveis',
            details: error.message
        });
    }
});

// Obter informações de uma cadeia específica
app.get('/api/chains/:chainId', async (req, res) => {
    try {
        const { chainId } = req.params;
        
        const response = await axios.get(
            `${BASE_URL}/chain/${chainId}`,
            { httpsAgent: agent }
        );

        res.json({
            success: true,
            chain: response.data
        });
    } catch (error) {
        console.error('Erro ao obter informações da cadeia:', error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            error: 'Erro ao obter informações da cadeia',
            details: error.message
        });
    }
});

// Registrar um documento
app.post('/api/registrar', async (req, res) => {
    try {
        const { documento } = req.body;

        if (!documento) {
            return res.status(400).json({
                success: false,
                error: 'Documento não fornecido'
            });
        }

        console.log(`📝 Registrando documento na blockchain...`);

        // Registrar documento usando V2 (método que funcionou)
        const resultado = await registrador.registerDocument(documento);

        res.json({
            success: true,
            resultado: {
                serial: resultado.serial,
                hash: resultado.hash,
                timestamp: resultado.timestamp,
                chainId: resultado.chainId,
                chainName: resultado.chainName,
                network: resultado.network,
                reference: resultado.reference
            },
            certificado: resultado.certificate,
            arquivoCertificado: resultado.certificateFile,
            arquivoDocumento: resultado.documentFile,
            codigoVerificacao: resultado.certificate.codigoVerificacao,
            mensagem: '✅ Documento registrado! Salve o código de verificação e os arquivos gerados.'
        });

    } catch (error) {
        console.error('Erro ao registrar documento:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erro ao registrar documento',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Verificar documento por código
app.post('/api/verificar/codigo', async (req, res) => {
    try {
        const { codigo } = req.body;

        if (!codigo) {
            return res.status(400).json({
                success: false,
                error: 'Código de verificação não fornecido'
            });
        }

        console.log(`🔍 Verificando documento com código: ${codigo}`);

        // Extrair serial do código (formato: IL2-SERIAL-HASH)
        const parts = codigo.split('-');
        if (parts.length !== 3 || parts[0] !== 'IL2') {
            return res.status(400).json({
                success: false,
                error: 'Código de verificação inválido. Formato esperado: IL2-SERIAL-HASH'
            });
        }

        const serial = parseInt(parts[1]);
        
        // Usar o registrador V2 para verificar
        const verificacao = await registrador.verifyBySerial(serial);
        
        if (verificacao.found) {
            res.json({
                success: true,
                resultado: {
                    valido: true,
                    encontrado: true,
                    serial: verificacao.document.serial,
                    chainId: verificacao.document.chainId,
                    network: verificacao.document.network,
                    hashBlockchain: verificacao.document.hash,
                    codigoVerificado: codigo,
                    timestamp: {
                        registro: verificacao.document.createdAt,
                        verificacao: new Date().toISOString()
                    },
                    documentoBlockchain: verificacao.document,
                    metadados: {
                        applicationId: verificacao.document.applicationId,
                        payloadTagId: verificacao.document.payloadTagId,
                        reference: verificacao.document.reference
                    }
                },
                mensagem: '✅ Documento encontrado e verificado na blockchain!'
            });
        } else {
            res.json({
                success: true,
                resultado: {
                    valido: false,
                    encontrado: false,
                    erro: 'Documento não encontrado',
                    detalhes: 'Nenhum registro encontrado com este código'
                },
                mensagem: '❌ Documento não encontrado na blockchain'
            });
        }

    } catch (error) {
        console.error('Erro ao verificar documento:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erro ao verificar documento',
            details: error.message
        });
    }
});

// Verificar documento por serial
app.post('/api/verificar/serial', async (req, res) => {
    try {
        const { serial, documento, chainId } = req.body;

        if (!serial || !documento) {
            return res.status(400).json({
                success: false,
                error: 'Serial e documento são obrigatórios'
            });
        }

        console.log(`🔍 Verificando documento com serial: ${serial}`);

        // Se chainId não for fornecido, buscar em todas as cadeias
        let resultado;
        if (chainId) {
            const response = await axios.get(
                `${BASE_URL}/records@${chainId}/${serial}`,
                { httpsAgent: agent }
            );
            resultado = await verificador.verificarPorSerial(serial, documento);
        } else {
            resultado = await verificador.verificarPorSerial(serial, documento);
        }

        res.json({
            success: true,
            resultado: resultado
        });

    } catch (error) {
        console.error('Erro ao verificar documento:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erro ao verificar documento',
            details: error.message
        });
    }
});

// Obter certificado por serial
app.get('/api/certificado/:serial', async (req, res) => {
    try {
        const { serial } = req.params;

        // Buscar arquivo de certificado
        const certificadosDir = 'certificados';
        if (!fs.existsSync(certificadosDir)) {
            return res.status(404).json({
                success: false,
                error: 'Nenhum certificado encontrado'
            });
        }

        const arquivos = fs.readdirSync(certificadosDir);
        const certificadoArquivo = arquivos.find(f => f.includes(`_${serial}_`));

        if (!certificadoArquivo) {
            return res.status(404).json({
                success: false,
                error: `Certificado não encontrado para serial ${serial}`
            });
        }

        const certificado = JSON.parse(
            fs.readFileSync(path.join(certificadosDir, certificadoArquivo), 'utf8')
        );

        res.json({
            success: true,
            certificado: certificado
        });

    } catch (error) {
        console.error('Erro ao obter certificado:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erro ao obter certificado',
            details: error.message
        });
    }
});

// Download de certificado
app.get('/api/certificado/:serial/download', async (req, res) => {
    try {
        const { serial } = req.params;

        const certificadosDir = 'certificados';
        if (!fs.existsSync(certificadosDir)) {
            return res.status(404).json({
                success: false,
                error: 'Nenhum certificado encontrado'
            });
        }

        const arquivos = fs.readdirSync(certificadosDir);
        const certificadoArquivo = arquivos.find(f => f.includes(`_${serial}_`));

        if (!certificadoArquivo) {
            return res.status(404).json({
                success: false,
                error: `Certificado não encontrado para serial ${serial}`
            });
        }

        const filePath = path.join(certificadosDir, certificadoArquivo);
        res.download(filePath, `certificado_${serial}.json`);

    } catch (error) {
        console.error('Erro ao fazer download do certificado:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erro ao fazer download do certificado',
            details: error.message
        });
    }
});

// Listar últimos registros
app.get('/api/registros', async (req, res) => {
    try {
        const { chainId, page = 0, pageSize = 10 } = req.query;

        let targetChainId = chainId;
        if (!targetChainId) {
            const chainsRes = await axios.get(`${BASE_URL}/chain`, { httpsAgent: agent });
            targetChainId = chainsRes.data[0].id;
        }

        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString()
        });

        const response = await axios.get(
            `${BASE_URL}/records@${targetChainId}?${params}`,
            { httpsAgent: agent }
        );

        res.json({
            success: true,
            chainId: targetChainId,
            registros: response.data
        });

    } catch (error) {
        console.error('Erro ao listar registros:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erro ao listar registros',
            details: error.message
        });
    }
});

// Obter registro específico
app.get('/api/registros/:chainId/:serial', async (req, res) => {
    try {
        const { chainId, serial } = req.params;

        const response = await axios.get(
            `${BASE_URL}/records@${chainId}/${serial}`,
            { httpsAgent: agent }
        );

        res.json({
            success: true,
            registro: response.data
        });

    } catch (error) {
        console.error('Erro ao obter registro:', error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            error: 'Erro ao obter registro',
            details: error.message
        });
    }
});

// Estatísticas
app.get('/api/estatisticas', async (req, res) => {
    try {
        const certificadosDir = 'certificados';
        let totalCertificados = 0;

        if (fs.existsSync(certificadosDir)) {
            totalCertificados = fs.readdirSync(certificadosDir).length;
        }

        const chainsRes = await axios.get(`${BASE_URL}/chain`, { httpsAgent: agent });
        const chains = chainsRes.data;

        res.json({
            success: true,
            estatisticas: {
                totalCadeias: chains.length,
                totalCertificadosEmitidos: totalCertificados,
                timestamp: new Date().toISOString()
            },
            cadeias: chains.map(chain => ({
                id: chain.id,
                name: chain.name,
                lastRecord: chain.lastRecord
            }))
        });

    } catch (error) {
        console.error('Erro ao obter estatísticas:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erro ao obter estatísticas',
            details: error.message
        });
    }
});

// Tratamento de erros global
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('='.repeat(70));
    console.log('🚀 API REST SBR PRIME - IL2 BLOCKCHAIN');
    console.log('='.repeat(70));
    console.log(`✅ Servidor rodando na porta ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📋 API Base URL: ${BASE_URL}`);
    console.log('\n📚 Endpoints Disponíveis:');
    console.log('─'.repeat(70));
    console.log('GET    /                           - Portal de Verificação');
    console.log('GET    /api/health                 - Status da API');
    console.log('GET    /api/chains                 - Listar cadeias');
    console.log('GET    /api/chains/:chainId        - Info da cadeia');
    console.log('POST   /api/registrar              - Registrar documento');
    console.log('POST   /api/verificar/codigo       - Verificar por código');
    console.log('POST   /api/verificar/serial       - Verificar por serial');
    console.log('GET    /api/certificado/:serial    - Obter certificado');
    console.log('GET    /api/registros              - Listar registros');
    console.log('GET    /api/estatisticas           - Estatísticas');
    console.log('='.repeat(70));
});

module.exports = app;
