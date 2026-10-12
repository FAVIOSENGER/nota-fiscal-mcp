#!/usr/bin/env node
/**
 * nota-fiscal-mcp
 *
 * Servidor MCP que expoe emissao/consulta/cancelamento de NF-e e NFS-e como
 * ferramentas que qualquer agente de IA compativel com MCP (Claude Desktop,
 * Claude Code, etc.) pode chamar.
 *
 * O agente monta o JSON fiscal (que e complexo e varia por municipio/estado) e
 * este servidor cuida de autenticacao, referencia e transporte ate o provedor.
 *
 * Configuracao por variaveis de ambiente:
 *   FOCUS_NFE_TOKEN   - token da sua conta Focus NFe (obrigatorio)
 *   FOCUS_NFE_AMBIENTE - "homologacao" (padrao) ou "producao"
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { FocusNFe, type Ambiente, type FocusResposta } from "./focusnfe.js";
import { MockProvider } from "./mock.js";

/** Contrato comum: tanto a Focus real quanto o mock implementam isto. */
interface Provedor {
  emitirNfse(ref: string, dados: unknown): Promise<FocusResposta>;
  consultarNfse(ref: string): Promise<FocusResposta>;
  cancelarNfse(ref: string, justificativa?: string): Promise<FocusResposta>;
  emitirNfe(ref: string, dados: unknown): Promise<FocusResposta>;
  consultarNfe(ref: string): Promise<FocusResposta>;
  cancelarNfe(ref: string, justificativa: string): Promise<FocusResposta>;
}

const ambiente = (process.env.FOCUS_NFE_AMBIENTE as Ambiente) || "homologacao";
const usarMock = process.env.PROVIDER === "mock";

const focus: Provedor = usarMock
  ? new MockProvider()
  : new FocusNFe({ token: process.env.FOCUS_NFE_TOKEN ?? "", ambiente });

const server = new McpServer({
  name: "nota-fiscal-mcp",
  version: "0.1.0",
});

/** Formata a resposta do provedor como texto para o agente. */
function resultado(titulo: string, resp: { status: number; ok: boolean; body: unknown }) {
  const corpo = typeof resp.body === "string" ? resp.body : JSON.stringify(resp.body, null, 2);
  return {
    content: [
      {
        type: "text" as const,
        text: `${titulo}\nAmbiente: ${ambiente}\nHTTP ${resp.status} (${resp.ok ? "ok" : "erro"})\n\n${corpo}`,
      },
    ],
    isError: !resp.ok,
  };
}

// ------------------------- NFS-e -------------------------

server.tool(
  "emitir_nfse",
  "Emite uma Nota Fiscal de Servico eletronica (NFS-e). Informe uma 'ref' unica " +
    "para identificar a nota (ex.: numero do pedido) e o objeto 'dados' com o " +
    "conteudo fiscal no formato do provedor. A emissao e assincrona: use " +
    "consultar_nfse com a mesma ref para acompanhar o processamento.",
  {
    ref: z.string().describe("Identificador unico que voce escolhe para a nota (ex.: 'pedido-1023')."),
    dados: z.record(z.any()).describe("Objeto com os dados fiscais da NFS-e no formato do provedor."),
  },
  async ({ ref, dados }) => resultado(`NFS-e emitida (ref: ${ref})`, await focus.emitirNfse(ref, dados))
);

server.tool(
  "consultar_nfse",
  "Consulta o status de uma NFS-e pela sua 'ref'. Retorna se esta em processamento, " +
    "autorizada (com links de XML/PDF) ou com erro.",
  {
    ref: z.string().describe("A mesma ref usada na emissao."),
  },
  async ({ ref }) => resultado(`Consulta NFS-e (ref: ${ref})`, await focus.consultarNfse(ref))
);

server.tool(
  "cancelar_nfse",
  "Cancela uma NFS-e autorizada. O cancelamento e definitivo.",
  {
    ref: z.string().describe("A ref da nota a cancelar."),
    justificativa: z.string().optional().describe("Motivo do cancelamento (exigido por alguns municipios)."),
  },
  async ({ ref, justificativa }) =>
    resultado(`Cancelamento NFS-e (ref: ${ref})`, await focus.cancelarNfse(ref, justificativa))
);

// ------------------------- NF-e -------------------------

server.tool(
  "emitir_nfe",
  "Emite uma Nota Fiscal eletronica de produto (NF-e, modelo 55). Fluxo assincrono: " +
    "use consultar_nfe com a mesma ref para obter o resultado e os downloads.",
  {
    ref: z.string().describe("Identificador unico da nota (ex.: 'venda-5567')."),
    dados: z.record(z.any()).describe("Objeto com os dados fiscais da NF-e no formato do provedor."),
  },
  async ({ ref, dados }) => resultado(`NF-e emitida (ref: ${ref})`, await focus.emitirNfe(ref, dados))
);

server.tool(
  "consultar_nfe",
  "Consulta o status de uma NF-e pela 'ref'. Quando autorizada, retorna os caminhos " +
    "de download do XML e do DANFE.",
  {
    ref: z.string().describe("A mesma ref usada na emissao."),
  },
  async ({ ref }) => resultado(`Consulta NF-e (ref: ${ref})`, await focus.consultarNfe(ref))
);

server.tool(
  "cancelar_nfe",
  "Cancela uma NF-e autorizada (permitido ate 24h apos a emissao). A justificativa " +
    "e obrigatoria e deve ter no minimo 15 caracteres.",
  {
    ref: z.string().describe("A ref da nota a cancelar."),
    justificativa: z.string().min(15).describe("Motivo do cancelamento (minimo 15 caracteres)."),
  },
  async ({ ref, justificativa }) =>
    resultado(`Cancelamento NF-e (ref: ${ref})`, await focus.cancelarNfe(ref, justificativa))
);

// ------------------------- start -------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log no stderr para nao sujar o canal MCP (stdout).
  console.error(
    `nota-fiscal-mcp rodando (${usarMock ? "SIMULACAO (mock)" : `provedor Focus NFe, ambiente: ${ambiente}`}).`
  );
}

main().catch((err) => {
  console.error("Falha ao iniciar nota-fiscal-mcp:", err);
  process.exit(1);
});
