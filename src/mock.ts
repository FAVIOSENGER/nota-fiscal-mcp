/**
 * Provedor de SIMULACAO (mock).
 *
 * Tem exatamente os mesmos metodos do adapter real (FocusNFe), mas nao fala com
 * ninguem: guarda as notas em memoria e devolve respostas plausiveis. Serve para
 * validar o servidor MCP de ponta a ponta sem precisar de conta, token ou
 * certificado digital.
 *
 * Ativado com a variavel de ambiente PROVIDER=mock.
 */

import type { FocusResposta } from "./focusnfe.js";

interface NotaMock {
  ref: string;
  tipo: "nfse" | "nfe";
  status: "processando_autorizacao" | "autorizado" | "cancelado";
  dados: unknown;
  numero?: string;
  criadaEm: string;
}

export class MockProvider {
  private notas = new Map<string, NotaMock>();

  private emitir(tipo: "nfse" | "nfe", ref: string, dados: unknown): FocusResposta {
    const numero = String(Math.floor(1000 + Math.random() * 9000));
    this.notas.set(ref, {
      ref,
      tipo,
      status: "autorizado", // no mock, autoriza na hora para facilitar o teste
      dados,
      numero,
      criadaEm: new Date().toISOString(),
    });
    return {
      status: 200,
      ok: true,
      body: {
        status: "autorizado",
        ref,
        numero,
        mensagem_sefaz: "[SIMULACAO] Autorizado o uso da nota",
        caminho_xml: `/simulado/${tipo}/${ref}.xml`,
        caminho_danfe: `/simulado/${tipo}/${ref}.pdf`,
      },
    };
  }

  private consultar(ref: string): FocusResposta {
    const nota = this.notas.get(ref);
    if (!nota) {
      return { status: 404, ok: false, body: { erro: `Nota com ref '${ref}' nao encontrada (simulacao).` } };
    }
    return {
      status: 200,
      ok: true,
      body: {
        status: nota.status,
        ref: nota.ref,
        numero: nota.numero,
        tipo: nota.tipo,
        caminho_xml: `/simulado/${nota.tipo}/${ref}.xml`,
        caminho_danfe: `/simulado/${nota.tipo}/${ref}.pdf`,
      },
    };
  }

  private cancelar(ref: string, justificativa?: string): FocusResposta {
    const nota = this.notas.get(ref);
    if (!nota) {
      return { status: 404, ok: false, body: { erro: `Nota com ref '${ref}' nao encontrada (simulacao).` } };
    }
    nota.status = "cancelado";
    return {
      status: 200,
      ok: true,
      body: { status: "cancelado", ref, justificativa: justificativa ?? "(nao informada)" },
    };
  }

  async emitirNfse(ref: string, dados: unknown) {
    return this.emitir("nfse", ref, dados);
  }
  async consultarNfse(ref: string) {
    return this.consultar(ref);
  }
  async cancelarNfse(ref: string, justificativa?: string) {
    return this.cancelar(ref, justificativa);
  }
  async emitirNfe(ref: string, dados: unknown) {
    return this.emitir("nfe", ref, dados);
  }
  async consultarNfe(ref: string) {
    return this.consultar(ref);
  }
  async cancelarNfe(ref: string, justificativa: string) {
    return this.cancelar(ref, justificativa);
  }
}
