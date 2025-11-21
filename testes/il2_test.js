const https = require('https');
const fs = require('fs');
const axios = require('axios');

// Configurações do certificado
const agent = new https.Agent({
  pfx: fs.readFileSync('rest.api.pfx'),
  passphrase: 'MultiKey',
  rejectUnauthorized: false
});

// Host da API
const BASE_URL = 'https://minerva-data.il2.io:32068';

async function main() {
  try {
    // 1. Listar cadeias disponíveis
    const chainsRes = await axios.get(`${BASE_URL}/chain`, { httpsAgent: agent });
    const chains = chainsRes.data;
    // Verifique se a lista de cadeias não está vazia
        if (chains.length === 0) {
            console.log('Nenhuma cadeia disponível neste nó.');
            return;
        }

        console.log('Cadeias disponíveis:');
        // Itera sobre a lista de cadeias e imprime os detalhes de cada uma
        chains.forEach(chain => {
            console.log(`- Nome: ${chain.name} | ID: ${chain.id}`);
        });
    // Supondo que você queira a cadeia com o nome 'SBR Soluções Chain #1'
    const targetChain = chains.find(c => c.name === 'SBR Soluções Chain #1');

    if (!targetChain) {
      throw new Error('Cadeia não encontrada.');
    }

    const chainId = targetChain.id;    
    // const chainId = chains[0].id;
    // const chainId = 'lGWanNMRdfHJ4hUJi5-f04WoLhMIasYazcoxjSDq3Uk';
    console.log(`✅ Cadeia selecionada: ${chainId}`);
    const recordsRes = await axios.get(`${BASE_URL}/records@${chainId}`, { httpsAgent: agent });
    console.log('📜 Registros existentes:', recordsRes.data);

    // 2. Dados a serem enviados
    const payload = [
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Matéria-prima",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Insumos",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Produtor rural",
        "checked": false
      }
    ],
    "component": {
      "label": "Tipo de fornecedor",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Nome do fornecedor",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "CNPJ/CPF",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Insc. Estadual / Municipal",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Endereço",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Bairro",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "CEP",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Município",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Fone/fax",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "E-mail",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Contato comercial na empresa",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Fone",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "E-mail do contato",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Contato da qualidade na empresa",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Fone",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "E-mail do contato",
      "type_input": "text"
    }
  },
  {
    "type": "text-info",
    "component": {
      "label": "Prezado Fornecedor e/ou Fabricante, No processo de qualificação de fornecedores de matérias-primas e insumos, é imprescindível a apresentação da documentação exigida pelo Departamento de Garantia da Qualidade, junto ao questionário de avaliação. A aprovação ou manutenção do fornecedor dependerá da análise completa dos documentos, sendo que as compras só serão autorizadas após essa avaliação. No questionário, o fornecedor deve preencher a Autoavaliação, indicando sua conformidade, e registrar as evidências no campo correspondente.",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "Certificado de Registro do Estabelecimento no MAPA, SIF, ANVISA, ou outro Órgão Competente?",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Observação",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "Fluxograma do processo de produção do produto fornecido",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Observação",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "Alvará de Funcionamento da Prefeitura",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Observação",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "Licença Ambiental",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Observação",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "Possui certificados em BPF, HACCP ou outras certificações",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Observação",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "Utiliza e/ou produz matérias-primas/ingredientes de origem animal na mesma linha de produção",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Observação",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "ART – Anotação de responsabilidade técnica",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Observação",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "Comprovante de Inscrição no cadastro da agropecuária",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Observação",
      "type_input": "text"
    }
  },
  {
    "type": "text-info",
    "component": {
      "label": "Indique com um X as questões abaixo. Questionários enviados sem a documentação completa anexada, sem o preenchimento das evidências ou sem data e assinatura não serão considerados. O envio deve ser feito por e-mail, como anexo em arquivo JPEG.",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "1 - Os prazos de entrega e/ou serviço acordados são cumpridos? Existe controle?",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "2- A empresa possui canal de atendimento técnico pós venda com sistemática para tratamento de reclamações de clientes?",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "3 - A empresa apresenta sistema de qualificação de fornecedores?",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Se sim qual? Apresentar evidência",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "4 - Há inspeção para a aprovação de matérias-primas, embalagens e insumos no recebimento dos mesmos? São mantidos registros?",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Qual? apresentar evidências",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "5 - É realizado o sistema PVPS (Primeiro que Vence, Primeiro que Sai) para utilização das matérias-primas?",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Qual? Apresentar evidência",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "6- Os produtos possuem identificação na embalagem com nome, quantidade, lote, fabricação e validade?",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Qual? Apresentar evidência",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],"component": {
      "label": "7 - São mantidas amostras dos lotes produzidos?",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Qual? Apresentar evidências",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "8 - Os lotes dos produtos produzidos são analisados? (Descrever as análises realizadas)",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Qual? apresentar evidências",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "9 - Veículos que fazem o transporte dos produtos apresentam boas condições de higiene, são cobertos, ausentes de pragas e outros que possam comprometer a segurança do produto final?",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Qual? Apresentar evidência",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "10 - A empresa possui implementado procedimento para as ações corretivas e preventivas em caso de não conformidade do produto?",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Qual? Apresentar evidência",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "11 - As áreas foram projetadas para impedir a entrada de pragas, e os produtos usados no controle químico são aprovados pelo órgão competente?",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Qual? Apresentar evidência",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "12 - Os colaboradores são treinados para as atividades que podem afetar a qualidade do produto? Há registro destes treinamentos?",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Qual? apresentar evidência",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "13 - A empresa fornece claramente as especificações e requisitos para aquisição do produto ou serviço e se disponibiliza para a visita do cliente no processo de qualificação?",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Qual? apresentar evidência",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "14 - O produto ou serviço é inspecionado durante o processo e antes do envio?",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Qual? apresentar evidência",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "15- Há controle de rastreabilidade para os produtos, incluindo a garantia de rastreabilidade dos lotes fornecidos ou serviços prestados, bem como o controle de recolhimento, caso necessário",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Qual? Apresentar evidência",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "16 - A empresa possui política da qualidade implementada e uma sistemática para análise de defeitos, com ações corretivas e preventivas, quando necessário?",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Qual? apresentar evidência",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "17 - A empresa possui um Programa de Saúde e Segurança Ocupacional implementado e documentado e fornece EPIs aos colaboradores?",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Qual? Apresentar evidência",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "18 - A empresa possui responsabilidade socioambiental?",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Qual? apresentar evidência",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "19 - Existe manual e procedimentos da qualidade documentados?",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Qual? Apresentar evidência",
      "type_input": "text"
    }
  },
  {
    "type": "table",
    "body": [],
    "columns": [
      {
        "type": "input",
        "component": {
          "label": "Nome do produto",
          "type_input": "text"
        }
      },
      {
        "type": "input",
        "component": {
          "label": "N do registro",
          "type_input": "text"
        }
      },
      {
        "type": "input",
        "component": {
          "label": "Forma de apresentação do produto",
          "type_input": "text"
        }
      }
    ],
    "component": {
      "label": "Lista de produto (s) e/ou insumos a fornecer",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "Certificado de Registro do Produto no MAPA",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Observação",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "Relatório/Ficha técnica do produto",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Observação",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "Rótulo do Produto",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Observação",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "Modelo do Laudo de Análise que acompanha produto",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Observação",
      "type_input": "text"
    }
  },
  {
    "type": "checkbox",
    "options": [
      {
        "type": "checkbox",
        "label": "Sim",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "Não",
        "checked": false
      },
      {
        "type": "checkbox",
        "label": "NA",
        "checked": false
      }
    ],
    "component": {
      "label": "FISPQ (Ficha de segurança do produto)",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Observação",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Data",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Responsável pelo preenchimento",
      "type_input": "text"
    }
  },
  {
    "type": "input",
    "component": {
      "label": "Assinatura do Responsável pelo preenchimento",
      "type_input": "text"
    }
  }
];

    // 3. Enviar documento JSON
    const postRes = await axios.post(
      `${BASE_URL}/jsonDocuments@${chainId}`,
      payload,
      { httpsAgent: agent }
    );

    console.log('📦 Documento JSON enviado com sucesso!');
    console.log('🔐 Resposta:', postRes.data);
    // --- Passo 2: Capturar o serial da resposta ---
        const serial = postRes.data.serial;
        console.log(`🔑 Serial do documento enviado: ${serial}`);
        
        // Se a sua API retorna o serial com o formato '0x...', você precisa
        // passá-lo para a URL como um número simples, sem o prefixo '0x'
        // const cleanSerial = serial.startsWith('0x') ? serial.substring(2) : serial;

        // --- Passo 3: Recuperar o documento usando o serial ---
        const getRes = await axios.get(
            `${BASE_URL}/jsonDocuments@${chainId}/${serial}`,
            { httpsAgent: agent }
        );

        console.log('\n--- Documento Recuperado ---');
        console.log(getRes.data);

  } catch (err) {
    if (err.response) {
      console.error('❌ Erro:', err.response.status);
      console.error('📄 Corpo da resposta:', err.response.data);
    } else {
      console.error('❌ Erro:', err.message);
    }
  }
}

main();