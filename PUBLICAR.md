# Como publicar o nota-fiscal-mcp

Guia passo a passo. Os comandos marcados com 👤 precisam do SEU login (não dá pra
automatizar por você). Tempo total: ~20-30 min na primeira vez.

## Pré-requisitos (contas gratuitas)

1. 👤 Conta no **GitHub** — https://github.com/signup
2. 👤 Conta no **npm** — https://www.npmjs.com/signup
3. Node.js instalado ✅ (você já tem — v24)

> Os arquivos `package.json` e `server.json` já estão com seu usuário (FAVIOSENGER)
> preenchido. Nada a trocar.

---

## Parte 1 — Subir o código pro GitHub

```bash
# dentro da pasta do projeto
git init
git add .
git commit -m "nota-fiscal-mcp v0.1.0"
```

👤 Crie um repositório vazio chamado `nota-fiscal-mcp` em https://github.com/new
(público, sem README/licença — já temos). Depois:

```bash
git remote add origin https://github.com/FAVIOSENGER/nota-fiscal-mcp.git
git branch -M main
git push -u origin main
```

---

## Parte 2 — Publicar no npm (é o que o MCP instala)

```bash
npm login          # 👤 abre o navegador para autenticar
npm publish --access public
```

Se o nome `nota-fiscal-mcp` já existir no npm, a gente troca para
`@FAVIOSENGER/nota-fiscal-mcp` (me avisa que ajusto).

Teste rápido depois de publicar:

```bash
npx nota-fiscal-mcp     # deve imprimir "nota-fiscal-mcp rodando..."
```

---

## Parte 3 — Registrar no registro oficial de MCP

Instala a CLI de publicação do MCP:

```bash
# baixe o mcp-publisher do GitHub oficial do Model Context Protocol
# (https://github.com/modelcontextprotocol/registry - secao Releases)
```

Depois:

```bash
mcp-publisher login github     # 👤 autentica com sua conta GitHub
mcp-publisher publish          # lê o server.json e registra
```

Pronto: quem procurar "nota fiscal" / "nfe" no registro de MCP acha o seu.

---

## Checklist final

- [ ] git push pro GitHub
- [ ] npm publish
- [ ] mcp-publisher publish
- [ ] Testar `npx nota-fiscal-mcp`

> Observação honesta: o registro de MCP ainda está em *preview*. Pode haver
> ajustes de schema. Se algum comando reclamar do server.json, me manda o erro
> que eu corrijo.
