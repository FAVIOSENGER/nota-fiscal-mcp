/**
 * Teste de autenticacao: faz uma consulta a uma ref que nao existe.
 * - Se o token for valido: a Focus responde 404 (nota nao encontrada) -> AUTH OK.
 * - Se o token for invalido: responde 401/403 -> AUTH FALHOU.
 * Nao emite nada.
 */
import { readFileSync } from "node:fs";
import { FocusNFe } from "../dist/focusnfe.js";

// carrega .env simples
for (const linha of readFileSync(new URL("../.env", import.meta.url), "utf8").split("\n")) {
  const m = linha.match(/^([^=#]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const focus = new FocusNFe({
  token: process.env.FOCUS_NFE_TOKEN,
  ambiente: process.env.FOCUS_NFE_AMBIENTE || "homologacao",
});

const refTeste = "ping-auth-" + Date.now();
console.log(`Consultando ref inexistente '${refTeste}' em homologacao...`);
const resp = await focus.consultarNfse(refTeste);

console.log(`\nHTTP ${resp.status}`);
console.log(typeof resp.body === "string" ? resp.body : JSON.stringify(resp.body, null, 2));

if (resp.status === 401 || resp.status === 403) {
  console.log("\n>> TOKEN INVALIDO ou sem permissao.");
} else {
  console.log("\n>> Autenticacao OK (o token conversa com a Focus NFe).");
}
