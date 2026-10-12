/**
 * Emissao de teste de uma NFS-e em HOMOLOGACAO (nao tem valor fiscal).
 * Emite e, em seguida, consulta o resultado do processamento.
 */
import { readFileSync } from "node:fs";
import { FocusNFe } from "../dist/focusnfe.js";

for (const linha of readFileSync(new URL("../.env", import.meta.url), "utf8").split("\n")) {
  const m = linha.match(/^([^=#]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const focus = new FocusNFe({
  token: process.env.FOCUS_NFE_TOKEN,
  ambiente: process.env.FOCUS_NFE_AMBIENTE || "homologacao",
});

const ref = "teste-saoroque-" + Date.now();

// Codigo IBGE de Sao Roque/SP = 3550605
const dados = {
  data_emissao: new Date().toISOString(),
  prestador: {
    cpf: "23317938838",
    codigo_municipio: "3550605",
  },
  tomador: {
    cpf: "11144477735",
    razao_social: "Cliente de Teste",
    email: "teste@exemplo.com",
    endereco: {
      logradouro: "Rua Teste",
      numero: "100",
      bairro: "Centro",
      codigo_municipio: "3550605",
      uf: "SP",
      cep: "18130000",
    },
  },
  servico: {
    aliquota: 2,
    discriminacao: "Servico de suporte tecnico em informatica (TESTE HOMOLOGACAO)",
    iss_retido: false,
    item_lista_servico: "0107",
    valor_servicos: 100.0,
  },
};

console.log(`Emitindo NFS-e de teste (ref: ${ref})...`);
const emissao = await focus.emitirNfse(ref, dados);
console.log(`\n--- EMISSAO: HTTP ${emissao.status} ---`);
console.log(typeof emissao.body === "string" ? emissao.body : JSON.stringify(emissao.body, null, 2));

// aguarda o processamento assincrono e consulta
await new Promise((r) => setTimeout(r, 4000));
console.log(`\nConsultando resultado...`);
const consulta = await focus.consultarNfse(ref);
console.log(`\n--- CONSULTA: HTTP ${consulta.status} ---`);
console.log(typeof consulta.body === "string" ? consulta.body : JSON.stringify(consulta.body, null, 2));
