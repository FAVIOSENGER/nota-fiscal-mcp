# 🧾 nota-fiscal-mcp

[![npm version](https://img.shields.io/npm/v/nota-fiscal-mcp.svg)](https://www.npmjs.com/package/nota-fiscal-mcp)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![MCP Registry](https://img.shields.io/badge/MCP-registry-7C3AED.svg)](https://registry.modelcontextprotocol.io)

**Deixe a IA emitir suas notas fiscais.**

`nota-fiscal-mcp` é um servidor [MCP](https://modelcontextprotocol.io) que dá a qualquer agente de IA — **Claude Desktop, Claude Code, Cursor** e outros — o poder de **emitir, consultar e cancelar NF-e e NFS-e** no Brasil. Ele conversa com um provedor fiscal (Focus NFe) que já resolve a parte difícil: certificado digital, comunicação com a SEFAZ e com as prefeituras.

Você conversa. A IA emite.

```
Você:   emita uma NFS-e de R$ 500 de consultoria em TI para o cliente ACME
Claude: ✅ NFS-e emitida — nota nº 3070, autorizada. Aqui está o PDF e o XML.
```

Sem abrir sistema, sem preencher formulário, sem decorar campo de ISS.

---

## ✨ O que ele faz

| Ferramenta | O que faz |
|---|---|
| `emitir_nfse` | Emite uma Nota Fiscal de Serviço (NFS-e) |
| `consultar_nfse` | Consulta o status e os links (XML/PDF) de uma NFS-e |
| `cancelar_nfse` | Cancela uma NFS-e autorizada |
| `emitir_nfe` | Emite uma Nota Fiscal de produto (NF-e, modelo 55) |
| `consultar_nfe` | Consulta status e downloads de uma NF-e |
| `cancelar_nfe` | Cancela uma NF-e (até 24h após a emissão) |

A IA monta o conteúdo fiscal da nota; o servidor cuida de autenticação, referência e comunicação com o provedor.

---

## 🚀 Instalação

Não precisa clonar nem compilar nada — o pacote roda direto via `npx`.

### Claude Desktop

Abra o arquivo de configuração (`claude_desktop_config.json`) e adicione:

```json
{
  "mcpServers": {
    "nota-fiscal": {
      "command": "npx",
      "args": ["-y", "nota-fiscal-mcp"],
      "env": {
        "FOCUS_NFE_TOKEN": "seu_token_aqui",
        "FOCUS_NFE_AMBIENTE": "homologacao"
      }
    }
  }
}
```

Reinicie o Claude Desktop. Pronto — as 6 ferramentas aparecem para o agente.

> Funciona do mesmo jeito em qualquer cliente MCP (Claude Code, Cursor, etc.): é só apontar o comando `npx -y nota-fiscal-mcp` com as variáveis de ambiente.

---

## 🔑 Pré-requisito: uma conta de provedor fiscal

Para emitir de verdade você precisa de um token de um provedor fiscal. Hoje o `nota-fiscal-mcp` usa a **[Focus NFe](https://focusnfe.com.br)**, que oferece ambiente de testes (homologação) e cuida de certificado + SEFAZ por você.

1. Crie sua conta na [Focus NFe](https://focusnfe.com.br/cadastro/) <!-- afiliado: trocar por link de afiliado quando o cadastro estiver aprovado -->
2. Cadastre sua empresa e pegue o **token de homologação** (em *Painel API → Tokens*).
3. Coloque o token na configuração acima e teste à vontade — homologação **não** emite nota com valor fiscal.
4. Quando tudo estiver certo, troque `FOCUS_NFE_AMBIENTE` para `producao` e use o token de produção.

---

## ⚙️ Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `FOCUS_NFE_TOKEN` | sim | Token da sua conta Focus NFe |
| `FOCUS_NFE_AMBIENTE` | não | `homologacao` (padrão) ou `producao` |

---

## 🧪 Modo simulação (sem provedor)

Quer testar o fluxo sem token nenhum? Rode em modo simulação — ele finge as respostas e deixa você exercitar as 6 ferramentas de ponta a ponta:

```json
"env": { "PROVIDER": "mock" }
```

---

## 🔒 Segurança

- Seu token vai nas variáveis de ambiente — **nunca** o coloque dentro do código nem suba num repositório.
- Comece sempre em **homologação**. Só vá para produção depois de validar.
- O projeto é open-source: você roda com a **sua** conta e o **seu** token. Nada passa por servidores de terceiros.

---

## 🛠️ Desenvolvimento

```bash
git clone https://github.com/FAVIOSENGER/nota-fiscal-mcp.git
cd nota-fiscal-mcp
npm install
npm run build
PROVIDER=mock node test/client.mjs   # testa as 6 ferramentas em simulação
```

---

## 📍 Status

**v0.1.2** — primeira geração pública. Suporte a NF-e e NFS-e via Focus NFe.
Os campos do payload seguem o padrão da [documentação da Focus NFe](https://doc.focusnfe.com.br); confirme os dados do seu município antes de produção.

📖 **Artigo / tutorial:** [Como fazer a IA emitir sua nota fiscal (NF-e e NFS-e) usando MCP](https://dev.to/favio/como-fazer-a-ia-emitir-sua-nota-fiscal-nf-e-e-nfs-e-usando-mcp-3o3e)

Ideias, bugs e sugestões: [abra uma issue](https://github.com/FAVIOSENGER/nota-fiscal-mcp/issues).

## 📄 Licença

MIT © Favio Senger
