const https = require('https');
const fs = require('fs');
const axios = require('axios');

class JsonApi {
    constructor(baseUrl, agent) {
        this.baseUrl = baseUrl;
        this.agent = agent;
        this.jsonDocumentsPath = 'jsonDocuments@';
    }

    /**
     * Get a JSON document record by serial number.
     * @param {string} chainId - Chain ID
     * @param {number} serial - Record serial number
     * @returns {Promise<Object>} JSON document details
     */
    async getJsonDocument(chainId, serial) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/${this.jsonDocumentsPath}${chainId}/${serial}`,
                { httpsAgent: this.agent }
            );
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Add a JSON document record encrypted with the client certificate used in the request.
     * @param {string} chainId - Chain ID
     * @param {Object} payload - A valid JSON object
     * @returns {Promise<Object>} Added JSON document details
     */
    async addJsonDocument(chainId, payload) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/${this.jsonDocumentsPath}${chainId}`,
                payload,
                { 
                    httpsAgent: this.agent,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Add a JSON document record encrypted with a given key.
     * @param {string} chainId - Chain ID
     * @param {Object} payload - A valid JSON object
     * @param {string} publicKey - IL2 text representation of a public key
     * @param {string} publicKeyId - IL2 text representation of the key ID
     * @returns {Promise<Object>} Added JSON document details
     */
    async addJsonDocumentWithKey(chainId, payload, publicKey, publicKeyId) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/${this.jsonDocumentsPath}${chainId}/withKey`,
                payload,
                { 
                    httpsAgent: this.agent,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-PubKey': publicKey,
                        'X-PubKeyId': publicKeyId
                    }
                }
            );
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Add a JSON document record encrypted with public keys from indirect key references.
     * @param {string} chainId - Chain ID
     * @param {Object} payload - A valid JSON object
     * @param {string[]} keysReferences - List of references in format 'chainId@serial'
     * @returns {Promise<Object>} Added JSON document details
     */
    async addJsonDocumentWithIndirectKeys(chainId, payload, keysReferences) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/${this.jsonDocumentsPath}${chainId}/withIndirectKeys`,
                payload,
                { 
                    httpsAgent: this.agent,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-PubKeyReferences': keysReferences.join(',')
                    }
                }
            );
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Add a JSON document record encrypted with public keys from given chain IDs.
     * @param {string} chainId - Chain ID
     * @param {Object} payload - A valid JSON object
     * @param {string[]} keysChainIds - List of chain IDs
     * @returns {Promise<Object>} Added JSON document details
     */
    async addJsonDocumentWithChainKeys(chainId, payload, keysChainIds) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/${this.jsonDocumentsPath}${chainId}/withChainKeys`,
                payload,
                { 
                    httpsAgent: this.agent,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-PubKeyChains': keysChainIds.join(',')
                    }
                }
            );
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get a list of JSON document allowed reader keys.
     * @param {string} chainId - Chain ID
     * @param {string|null} contextId - Filter by context ID name
     * @param {boolean} lastToFirst - If true, return items in reverse order
     * @param {number} page - Page to return
     * @param {number} size - Number of items per page
     * @returns {Promise<Object>} List of allowed reader keys
     */
    async listJsonDocumentAllowedReaders(chainId, contextId = null, lastToFirst = false, page = 0, size = 10) {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: size.toString(),
                lastToFirst: lastToFirst.toString()
            });

            if (contextId) {
                params.append('contextId', contextId);
            }

            const response = await axios.get(
                `${this.baseUrl}/${this.jsonDocumentsPath}${chainId}/allow?${params}`,
                { httpsAgent: this.agent }
            );
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Create a new list of allowed readers to encrypt JSON documents.
     * @param {string} chainId - Chain ID
     * @param {Object} allowedReaders - List of reader keys to be allowed
     * @returns {Promise<string>} Record reference in format chainId@recordSerial
     */
    async allowJsonDocumentReaders(chainId, allowedReaders) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/${this.jsonDocumentsPath}${chainId}/allow`,
                allowedReaders,
                { 
                    httpsAgent: this.agent,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Handle errors from API responses
     * @param {Error} error - Axios error object
     * @returns {Object} Error details
     */
    handleError(error) {
        if (error.response) {
            return {
                error: true,
                status: error.response.status,
                message: error.response.data?.title || error.message,
                details: error.response.data
            };
        }
        return {
            error: true,
            message: error.message
        };
    }
}

// Exemplo de uso
async function main() {
    // Configuração do certificado
    const agent = new https.Agent({
        pfx: fs.readFileSync('rest.api.pfx'),
        passphrase: 'MultiKey',
        rejectUnauthorized: false
    });

    const BASE_URL = 'https://minerva-data.il2.io:32068';
    const jsonApi = new JsonApi(BASE_URL, agent);

    try {
        // 1. Listar cadeias disponíveis
        const chainsRes = await axios.get(`${BASE_URL}/chain`, { httpsAgent: agent });
        const chains = chainsRes.data;
        
        if (!chains || chains.length === 0) {
            console.log('❌ Nenhuma cadeia encontrada');
            return;
        }

        const chainId = chains[0].id;
        console.log(`✅ Cadeia selecionada: ${chainId}`);

        // 2. Verificar registros existentes
        try {
            const recordsRes = await axios.get(`${BASE_URL}/records@${chainId}`, { httpsAgent: agent });
            console.log('📜 Registros existentes:', recordsRes.data);
        } catch (err) {
            console.log('⚠️ Não foi possível listar registros:', err.response?.data || err.message);
        }

        // 3. Dados a serem enviados
        const payload = {
            nome: "Ederson Silva",
            cpf: "123.456.789-00",
            email: "ederson.silva@example.com",
            timestamp: new Date().toISOString()
        };

        // 4. Tentar diferentes métodos de envio
        console.log('\n🔄 Tentando enviar documento JSON...');

        // Método 1: Envio padrão
        console.log('📤 Método 1: Envio padrão');
        let result = await jsonApi.addJsonDocument(chainId, payload);
        
        if (result.error) {
            console.log('❌ Método 1 falhou:', result.message);
            
            // Método 2: Com chaves da cadeia (se disponível)
            console.log('📤 Método 2: Com chaves da cadeia');
            result = await jsonApi.addJsonDocumentWithChainKeys(chainId, payload, [chainId]);
            
            if (result.error) {
                console.log('❌ Método 2 falhou:', result.message);
                console.log('📋 Detalhes do erro:', result.details);
                
                // Verificar se há chaves permitidas
                console.log('\n🔍 Verificando chaves permitidas...');
                const allowedReaders = await jsonApi.listJsonDocumentAllowedReaders(chainId);
                if (allowedReaders.error) {
                    console.log('❌ Não foi possível verificar chaves permitidas:', allowedReaders.message);
                } else {
                    console.log('🔑 Chaves permitidas:', allowedReaders);
                }
            } else {
                console.log('✅ Documento enviado com sucesso (Método 2)!');
                console.log('📦 Resposta:', result);
            }
        } else {
            console.log('✅ Documento enviado com sucesso (Método 1)!');
            console.log('📦 Resposta:', result);
        }

    } catch (err) {
        console.error('❌ Erro geral:', err.message);
        if (err.response) {
            console.error('📄 Status:', err.response.status);
            console.error('📄 Dados da resposta:', err.response.data);
        }
    }
}

// Executar se for chamado diretamente
if (require.main === module) {
    main();
}

module.exports = { JsonApi };