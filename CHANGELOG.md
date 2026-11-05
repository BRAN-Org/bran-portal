# Descrição Detalhada das Mudanças — BRAN Web Database Template

Este documento detalha a arquitetura, arquivos criados e funcionalidades implementadas no **`bran-web-database-template`**, alinhada aos padrões da **BRAN Org** e inspirada no projeto **EBBC-OpenData**.

---

## [1.6.0] - 2026-11-05 (Exportação Bibliográfica Avançada, Correção de Paginação e Priorização de Identificadores)

### Feat
- **Exportação Bibliográfica Completa (RIS e BibTeX)**: Inclusão da tag `L1` (link direto para PDF) e `UR` no exportador RIS, e tags `eprint` e `url` no gerador BibTeX em `src/exportEngine.js`.
- **Contrato OpenAPI 3.0 Machine-Readable**: Endpoint `/api/v1/openapi.json` gerando especificação OpenAPI 3.0.3 dinâmica a partir das configurações do dataset.
- **Playground Interativo Aprimorado**: Suporte a todos os endpoints analíticos, tratamento nativo de formatos de texto (CSV, BibTeX, RIS) e geração dinâmica de snippets em cURL, Python, R, JavaScript e Node.js.

### Fix
- **Priorização de Correspondência Exata em `getItemByKey`**: Refatoração da busca individual em `src/dataManager.js` para priorizar correspondência estrita em ID, DOI e Título antes de recorrer ao fallback difuso, eliminando colisões por substring em prefixos de identificadores.
- **Exportação Despaginada com `limit: 0`**: Correção na checagem de parâmetros de paginação em `src/dataManager.js`, permitindo que `/api/v1/articles/export?format=json` e `limit=0` exportem 100% dos registros sem truncamento.
- **Validação de DOI com Notação por Ponto**: Sincronização do schema canônico `schemas/article.v1.schema.json` para permitir separadores por ponto (`10.22477.xxx`) comuns em periódicos OJS brasileiros.

### Docs
- **Guia Técnico da API (`docs/API.md`)**: Criação de manual de referência técnica completo para desenvolvedores e cienciometristas.
- **Interface Web de Documentação Aprimorada**: Documentação interativa em `public/index.html` com tabelas detalhadas de parâmetros, schemas e códigos de status.
- **Governança e Citação**: Adição de `CITATION.cff`, `.editorconfig` e `.gitattributes` para padronização de quebra de linhas e metadados de citação acadêmica.

### Chore / Test
- **Testes de Integração de Exportação e OpenAPI**: Validação de 25 testes cobrindo rotas da API, exportação integral sem limites e contrato OpenAPI 3.0.

---

## [1.5.0] - 2026-09-18 (Formatos de Intercâmbio Bibliográfico: BibTeX e RIS)

### Novas Funcionalidades (Feat)
- **Exportação BibTeX (`format=bibtex` / `format=bib`)**: Geração dinâmica de entradas `@inproceedings{...}` formatadas para citação acadêmica em LaTeX e importação no Zotero.
- **Exportação RIS (`format=ris`)**: Suporte ao padrão internacional Research Information Systems (`TY - CONF ... ER - `) para integração direta com VOSviewer, Mendeley, EndNote e Bibliometrix (R).
- **Interface & Explorer**: Adicionados botões dedicados de exportação rápida para BibTeX e RIS no painel de busca do Explorador de Dados.

### Documentação (Docs)
- Atualização da aba de Documentação da API com os novos formatos de exportação bibliográfica suportados.

### Infraestrutura & Testes (Chore/Test)
- Adicionados testes de integração no `tests/api.test.js` para validação de cabeçalhos e sintaxe de BibTeX e RIS.

---

## [1.4.0] - 2026-09-11 (Reestruturação da Tela Inicial, Barra Superior & Footer Institucional - Branch `feat/redesign-ui`)

### Tela Inicial (Landing Overview)
- **Apresentação Institucional**: Adicionada a aba **"Início"** com o nome da Organização / Periódico / Faculdade / Evento em destaque.
- **Espaço para Descrição**: Área expansível para apresentação do acervo, missão de Ciência Aberta e escopo dos dados.
- **Atalhos Rápidos**: Cards de navegação para o Explorador, Painel Geral e Sandbox de API.

### Barra Superior (Top Header / Navbar)
- **Esquerda**: Logo genérica substituível (`.svg`) + Nome do Evento / Faculdade / Periódico.
- **Centro**: Barra de navegação em pílulas para as telas do portal (`Início`, `Explorador de Dados`, `Painel Geral`, `Análises & Correlações`, `Documentação da API`).
- **Direita**:
 - **Barra de Busca Rápida**: Campo de pesquisa direta no topo que redireciona automaticamente para os registros do Explorador de Dados.
 - **Links Externos de Destaque**: Botões com ícones diretos para o **GitHub** do repositório e o **DOI** do Zenodo.

### Footer Institucional & Suporte
- Créditos de desenvolvimento e marca da **BRAN Org**.
- **Seção de Suporte / Reportar Problemas**: Link direto para **Reportar Problemas / Issues no GitHub**.

---

## [1.3.0] - 2026-09-11 (Redesign Fiel Focado no EBBC OpenData - Branch `feat/redesign-ui`)

### Painel de Estatísticas & Explorador em Cartões
- Painel com 4 Cards de Estatísticas e Toolbar de Personalização de Gráficos (Paletas e Tipos).
- Explorador com Cartões de Artigos, badges coloridos e Modal de Detalhes.

---

## [1.2.0] - 2026-09-11 (Redesign Visual Minimalista & Corporativo - Branch `feat/redesign-ui`)

### Design & Interface de Usuário (UI/UX)
- Identidade visual minimalista com paleta Slate Navy e Plus Jakarta Sans.

---

## [1.1.0] - 2026-09-11 (Módulo de Correlações Cientométricas & Skill de Automação)

### Novas Funcionalidades (Feat)
- Skill customizada `changelog-generator`.
- Análises de coocorrência 2D, dispersão e novos endpoints REST.

---

## [1.0.0] - 2026-09-11 (Lançamento Inicial do Template)

### Novas Funcionalidades (Feat)
- Estrutura de configuração agnóstica, busca em memória, REST API e deploy Vercel.
