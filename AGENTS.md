# AGENTS.md — Protocolo Operacional para Agentes e Desenvolvedores BRAN

Este documento estabelece o fluxo de trabalho obrigatório, arquitetura e convenções para agentes autônomos de IA e desenvolvedores que atuam nos repositórios da organização **BRAN Org**.

---

## 1. Topologia do Ecossistema

O ecossistema é dividido em duas categorias de repositórios:

1. **Repositório Central (Upstream)**:
   - `BRAN-Org/bran-web-database-template`: Fonte canônica do código da engine Express (`src/`), interface estática (`public/`), esquemas de validação (`schemas/`), testes automatizados (`tests/`), documentação técnica (`docs/`) e workflows globais.
2. **Repositórios Filhos de Eventos e Periódicos (Downstream)**:
   - `BRAN-Org/ebbc-open-database` (EBBC)
   - `BRAN-Org/abec-open-database` (ABEC)
   - `BRAN-Org/cbbd-open-database` (CBBD)
   - `BRAN-Org/datagramazero-open-database` (Datagramazero)
   - `BRAN-Org/enancib-open-database` (ENANCIB)

Cada repositório filho possui dados específicos (`data/`), configurações de facetas (`config/dataset.config.json`), governança própria (`provenance.json`, `README.md`, `.zenodo.json`, `CITATION.cff`, `CHANGELOG.md`), mas **deve compartilhar 100% da engine do template central**.

---

## 2. Ciclo Padrão de Atualização do Template (Lifecycle Obrigatório)

Para alterar a engine, rotas, interface, exportadores ou documentação da API, o fluxo abaixo **deve ser seguido estritamente**:

```
[dev/feature branch] 
       │
       ▼ (validação local com testes)
[PR para main no template] 
       │
       ▼ (CI passa e merge na main)
[Actions: dispatch-sync.yml] 
       │
       ▼ (envia repository_dispatch 'template_updated')
[Repositórios Filhos: template-sync.yml] 
       │
       ▼ (actions-template-sync abre PR preservando .templatesyncignore)
[Sync Guard roda e valida integridade] 
       │
       ▼ (merge do PR nos filhos)
[Deploy em Produção / Vercel]
```

### Passo 1: Criar branch de desenvolvimento no Template
Nunca commite mudanças de infraestrutura diretamente na branch `main` do template sem antes testar em branch isolada:

```bash
cd /home/gabrielgama/Documents/BRAN/bran-web-database-template
git checkout -b dev
# Ou para uma funcionalidade específica:
# git checkout -b feat/nome-da-feature
```

Aplique as mudanças em `src/`, `public/`, `tests/` ou `docs/`.

Valide localmente antes de qualquer commit:
```bash
# Bateria completa de testes unitários e de integração
npm test

# Validação do dataset de mock contra o schema
npm run data:validate
```

Faça commit seguindo estritamente Conventional Commits:
```bash
git add .
git commit -m "feat(api): descricao concisa da alteracao"
git push -u origin dev
```

---

### Passo 2: Abrir Pull Request para a `main` do Template
Abra o PR da branch de desenvolvimento para a `main` e aguarde a validação do CI (`ci.yml`):

```bash
gh pr create --repo BRAN-Org/bran-web-database-template \
  --base main \
  --head dev \
  --title "feat: descricao das melhorias no template" \
  --body "Resumo tecnico das alteracoes para sincronizacao downstream."
```

Após os checks do CI passarem, realize o merge:
```bash
gh pr merge --repo BRAN-Org/bran-web-database-template --merge --delete-branch
```

---

### Passo 3: Propagação via GitHub Actions

Ao realizar o merge na `main` do template, o workflow `.github/workflows/dispatch-sync.yml` é disparado automaticamente. Ele notifica os 5 repositórios filhos enviando o evento `template_updated`.

#### Disparo Manual (quando necessário)
Caso queira forçar a sincronização imediatamente sem esperar o cron semanal:

```bash
# Disparo individual em um repositório filho:
gh workflow run template-sync.yml --repo BRAN-Org/ebbc-open-database

# Disparo em lote para todos os repositórios filhos da organização:
for repo in ebbc-open-database abec-open-database datagramazero-open-database enancib-open-database cbbd-open-database; do
  echo "Disparando sync em BRAN-Org/$repo..."
  gh workflow run template-sync.yml --repo "BRAN-Org/$repo"
done
```

---

### Passo 4: Proteção de Dados nos Repositórios Filhos (`.templatesyncignore`)

O action `template-sync.yml` nos repositórios filhos cria automaticamente uma branch e um Pull Request (ex: `chore(sync): Atualizações automáticas do BRAN Web Database Template`).

O arquivo `.templatesyncignore` em cada repositório filho **impede que dados locais sejam sobrescritos**:

Arquivos blindados contra substituição:
- `data/` (banco de dados real do evento)
- `config/dataset.config.json` (configuração do evento)
- `provenance.json` (hash e rastreabilidade da extração)
- `README.md` (síntese do acervo)
- `package.json` (nome e versão específica do evento)
- `CITATION.cff` e `.zenodo.json` (identificadores e DOIs do acervo)
- `CHANGELOG.md` (histórico de versões do evento)
- `mock/` e `.github/workflows/`

O workflow **`sync-guard.yml`** roda automaticamente no PR aberto, comparando a branch do sync com a branch base (`node scripts/sync_guard.js compare ../base .`), garantindo que nenhum contrato de API ou registro seja corrompido.

---

### Passo 5: Merge nos Repositórios Filhos e Deploy

Após a aprovação do `Sync Guard`, faça o merge do PR de sincronização:

```bash
# Listar PRs de sincronização abertos no repositório:
gh pr list --repo BRAN-Org/ebbc-open-database

# Aprovar e mesclar o PR:
gh pr merge <NUMERO_DO_PR> --repo BRAN-Org/ebbc-open-database --merge
```

Com o merge concluído na `main` do repositório filho, execute o deploy de produção no Vercel:

```bash
cd /home/gabrielgama/Documents/BRAN/ebbc-open-database
git pull origin main
npx vercel --prod --yes
```

---

## 3. Regras de Ouro para Agentes e Desenvolvedores

1. **Zero Código Isolado nos Filhos**: Nunca adicione rotas em `src/routes.js` ou scripts em `public/js/` diretamente em um repositório filho sem antes incorporar e validar no `bran-web-database-template`.
2. **Zero DOIs Inventados**: Nunca invente identificadores para preencher lacunas. Se o trabalho científico original não tem DOI, utilize estritamente `doi: "N/A"` e o identificador canônico `id: "<evento>-<ano>-<id_origem>"`.
3. **Fidelidade Criptográfica**: Qualquer alteração em dados deve recalcular o hash SHA-256 e atualizar o `provenance.json` (`raw_data_sha256` e métricas de auditoria).
4. **Respeito aos Schemas**: Os dados devem validar 100% contra `schemas/article.v1.schema.json` e `schemas/provenance.v1.schema.json`.
5. **Commits Convencionais**: Proibido texto prolixo ou artefatos conversacionais de IA nos commits. Use `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.
6. **Autonomia com Testes**: Antes de concluir qualquer tarefa, rode sempre `npm test` e `npm run data:validate`. Se quebrar um único teste, corrija imediatamente antes de subir o código.
