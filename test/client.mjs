/**
 * Cliente de teste: sobe o servidor em modo simulacao e chama as ferramentas
 * exatamente como um agente de IA (Claude Desktop) faria, via protocolo MCP.
 *
 * Rodar:  node test/client.mjs
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/index.js"],
  env: { ...process.env, PROVIDER: "mock" },
});

const client = new Client({ name: "teste", version: "1.0.0" });
await client.connect(transport);

function print(titulo, res) {
  const txt = res.content?.map((c) => c.text).join("\n") ?? JSON.stringify(res);
  console.log(`\n=== ${titulo} ===\n${txt}`);
}

// 1. Lista as ferramentas disponiveis
const { tools } = await client.listTools();
console.log("Ferramentas expostas pelo servidor:");
for (const t of tools) console.log(`  - ${t.name}`);

// 2. Emite uma NFS-e
print(
  "emitir_nfse",
  await client.callTool({
    name: "emitir_nfse",
    arguments: {
      ref: "pedido-1023",
      dados: {
        prestador: { cnpj: "00000000000000" },
        servico: { discriminacao: "Consultoria em TI", valor_servicos: 500.0 },
      },
    },
  })
);

// 3. Consulta a NFS-e
print("consultar_nfse", await client.callTool({ name: "consultar_nfse", arguments: { ref: "pedido-1023" } }));

// 4. Cancela a NFS-e
print(
  "cancelar_nfse",
  await client.callTool({
    name: "cancelar_nfse",
    arguments: { ref: "pedido-1023", justificativa: "Teste de cancelamento" },
  })
);

// 5. Consulta uma ref que nao existe (para ver o tratamento de erro)
print("consultar_nfse (ref inexistente)", await client.callTool({ name: "consultar_nfse", arguments: { ref: "nao-existe" } }));

await client.close();
console.log("\nTeste concluido.");
