/**
 * Adapter do provedor Focus NFe.
 *
 * Toda a conversa com a API fiscal fica isolada aqui. Se um dia quisermos trocar
 * de provedor (NFe.io, Nuvem Fiscal, etc.), criamos outro adapter com os mesmos
 * metodos e nada no index.ts precisa mudar.
 *
 * Padrao da Focus NFe (confirme na doc da sua conta: https://doc.focusnfe.com.br):
 *  - Autenticacao: HTTP Basic, token como usuario e senha vazia.
 *  - Base URL homologacao (sandbox): https://homologacao.focusnfe.com.br
 *  - Base URL producao:              https://api.focusnfe.com.br
 *  - A "ref" (referencia) e um identificador unico que VOCE escolhe para a nota.
 *    E por ela que se consulta e cancela. Guarde-a.
 */

export type Ambiente = "homologacao" | "producao";

const BASE_URLS: Record<Ambiente, string> = {
  homologacao: "https://homologacao.focusnfe.com.br",
  producao: "https://api.focusnfe.com.br",
};

export interface FocusConfig {
  token: string;
  ambiente: Ambiente;
}

export interface FocusResposta {
  status: number;
  ok: boolean;
  body: unknown;
}

export class FocusNFe {
  private token: string;
  private baseUrl: string;

  constructor(config: FocusConfig) {
    if (!config.token) {
      throw new Error("Token da Focus NFe nao configurado (FOCUS_NFE_TOKEN).");
    }
    this.token = config.token;
    this.baseUrl = BASE_URLS[config.ambiente];
  }

  private authHeader(): string {
    // Basic auth: token como usuario, senha vazia -> base64("token:")
    const encoded = Buffer.from(`${this.token}:`).toString("base64");
    return `Basic ${encoded}`;
  }

  private async request(
    method: string,
    path: string,
    body?: unknown
  ): Promise<FocusResposta> {
    const resp = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: this.authHeader(),
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    let parsed: unknown;
    const text = await resp.text();
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }

    return { status: resp.status, ok: resp.ok, body: parsed };
  }

  // ---- NFS-e (nota fiscal de servico) ----

  emitirNfse(ref: string, dados: unknown): Promise<FocusResposta> {
    return this.request("POST", `/v2/nfse?ref=${encodeURIComponent(ref)}`, dados);
  }

  consultarNfse(ref: string): Promise<FocusResposta> {
    return this.request("GET", `/v2/nfse/${encodeURIComponent(ref)}`);
  }

  cancelarNfse(ref: string, justificativa?: string): Promise<FocusResposta> {
    const body = justificativa ? { justificativa } : undefined;
    return this.request("DELETE", `/v2/nfse/${encodeURIComponent(ref)}`, body);
  }

  // ---- NF-e (modelo 55, nota fiscal de produto) ----

  emitirNfe(ref: string, dados: unknown): Promise<FocusResposta> {
    return this.request("POST", `/v2/nfe?ref=${encodeURIComponent(ref)}`, dados);
  }

  consultarNfe(ref: string): Promise<FocusResposta> {
    // completa=1 traz os caminhos de download do XML e do DANFE
    return this.request("GET", `/v2/nfe/${encodeURIComponent(ref)}?completa=1`);
  }

  cancelarNfe(ref: string, justificativa: string): Promise<FocusResposta> {
    return this.request("DELETE", `/v2/nfe/${encodeURIComponent(ref)}`, {
      justificativa,
    });
  }
}
