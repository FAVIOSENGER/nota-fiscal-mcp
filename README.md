# nota-fiscal-mcp

Servidor **MCP (Model Context Protocol)** que dá a qualquer agente de IA — Claude Desktop, Claude Code, Cursor, etc. — a capacidade de **emitir, consultar e cancelar NF-e e NFS-e** no Brasil, conversando com um provedor fiscal (Focus NFe) que resolve a parte chata de certificado e SEFAZ.

> Diga ao seu agente: *"emita uma NFS-e de R$ 500 de consultoria para o cliente X"* — e ele chama a ferramenta certa.

## Ferramentas expostas

| Ferramenta | O que faz |
|---|---|
| `emitir_nfse` | Emite uma NFS-e (serviço) |
| `consultar_nfse` | Consulta status / links de uma NFS-e |
| `cancelar_nfse` | Cancela uma NFS-e autorizada |
| `emitir_nfe` | Emite uma NF-e (produto, modelo 55) |
| `consultar_nfe` | Consulta status / downloads de uma NF-e |
| `cancelar_nfe` | Cancela uma NF-e (até 24h) |

## Instalação (desenvolvimento)

```bash
npm install
npm run build
```

Crie um arquivo `.env` a partir do `.env.example` e preencha com o token da sua
conta Focus NFe (comece em **homologação** / sandbox).

## Configurar no Claude Desktop

No arquivo de configuração do Claude Desktop, adicione:

```json
{
  "mcpServers": {
    "nota-fiscal": {
      "command": "node",
      "args": ["CAMINHO/ABSOLUTO/nota-fiscal-mcp/dist/index.js"],
      "env": {
        "FOCUS_NFE_TOKEN": "seu_token",
        "FOCUS_NFE_AMBIENTE": "homologacao"
      }
    }
  }
}
```

## Status

v0.1 — primeira versão, apenas homologação recomendada. Os endpoints seguem o
padrão REST da Focus NFe; confirme os campos do payload na documentação da sua
conta em https://doc.focusnfe.com.br antes de usar em produção.

## Licença

MIT
