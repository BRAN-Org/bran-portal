# BRAN Open Data Portal & API Gateway

<p align="center">
  <a href="https://github.com/BRAN-Org"><img src="https://img.shields.io/badge/BRAN%20Org-Open%20Data-blue.svg?logo=github" alt="BRAN Org"></a>
  <img src="https://img.shields.io/badge/Acervo-11.937%20Artigos-brightgreen.svg" alt="Total de Artigos">
  <img src="https://img.shields.io/badge/Bases-5%20Integradas-blue.svg" alt="Bases de Dados">
  <a href="https://www.budapestopenaccessinitiative.org/"><img src="https://img.shields.io/badge/BOAI-Signatory-orange.svg" alt="BOAI Signatory"></a>
  <a href="https://www.go-fair.org/fair-principles/"><img src="https://img.shields.io/badge/FAIR-Compliant-green.svg" alt="FAIR Principles"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/Code-GPLv3-blue.svg" alt="GPLv3"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/Data-CC_BY--NC--SA_4.0-lightgrey.svg" alt="CC BY-NC-SA 4.0"></a>
</p>

Portal unificado e API REST pública da **[BRAN Org](https://github.com/BRAN-Org)** para acesso federado aos acervos científicos abertos da Ciência da Informação no Brasil.

O portal integra ~12.000 artigos acadêmicos diretamente em memória, provendo consultas em sub-milissegundos, exportação bibliográfica e visualizações cientométricas vetoriais sem dependência de banco de dados externo ou transpiladores pesados.

---

## 📚 Bases de Dados Integradas

| Base | Evento / Periódico | Cobertura | Registros | Depósito Zenodo |
| :--- | :--- | :---: | :---: | :--- |
| **ENANCIB** | Encontro Nacional de Pesquisa em Ciência da Informação | 2003–2024 | 6.998 | [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.17441126.svg)](https://doi.org/10.5281/zenodo.17441126) |
| **CBBD** | Congresso Brasileiro de Biblioteconomia e Documentação | 2013–2019 | 3.385 | Em preparação |
| **EBBC** | Encontro Brasileiro de Bibliometria e Cientometria | 2012–2024 | 808 | [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.17441113.svg)](https://doi.org/10.5281/zenodo.17441113) |
| **DataGramaZero** | Revista de Ciência da Informação (DGZ) | 1999–2015 | 487 | [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.17441098.svg)](https://doi.org/10.5281/zenodo.17441098) |
| **ABEC Meeting** | Encontros da Associação Brasileira de Editores Científicos | 2018–2023 | 259 | [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.17441132.svg)](https://doi.org/10.5281/zenodo.17441132) |
| **Total** | **Acervo Unificado da Ciência da Informação** | **1994–2026** | **11.937** | **Acesso Livre & Gratuito** |

---

## ⚡ Recursos da Arquitetura

- **Busca Federada em Tempo Real**: Consulta instantânea nos 11.937 registros combinando título, resumo, autores e palavras-chave.
- **Filtros por Base ou Globais**: Chips rápidos na interface para alternar entre todas as bases ou isolar eventos específicos.
- **Catálogo de Datasets e Downloads**: Links diretos para download dos 3 formatos canônicos (`.json`, `.csv` RFC 4180 com UTF-8 BOM, `.sqlite` com FTS5) e pacotes Zenodo.
- **API REST Pública Sem Autenticação**:
  - `GET /api/v1/databases`: Catálogo das 5 bases com contadores, períodos e links.
  - `GET /api/v1/databases/:database`: Metadados e estatísticas de uma base específica.
  - `GET /api/v1/articles`: Busca federada global (`?q=`, `?database=`, `?year=`, `?author=`, `?limit=`, `?offset=`).
  - `GET /api/v1/:database/articles`: Rotas scoped por evento (ex: `/api/v1/ebbc/articles`).
  - `GET /api/v1/articles/:key`: Busca exata por DOI ou ID canônico.
  - `GET /api/v1/articles/export`: Exportação sob demanda em CSV, BibTeX, RIS e JSON.
  - `GET /api/v1/articles/stats`: Métricas cientométricas agregadas ou filtradas por base.
  - `GET /api/v1/openapi.json`: Especificação completa OpenAPI 3.0.
- **Interface Web Simples e Responsiva**: Dashboard com gráficos SVG nativos via [`pure-svg-charts`](https://github.com/GabrielBaiano/pure-svg-charts), sem dependência de bibliotecas pesadas de CDN.

---

## 🛠️ Execução Local

### 1. Clonar e Instalar
```bash
git clone https://github.com/BRAN-Org/bran-web-database-template.git bran-portal
cd bran-portal
npm install
```

### 2. Sincronizar Datasets
```bash
# Copia datasets dos repositórios locais irmãos ou baixa diretamente via GitHub Raw:
npm run data:sync
```

### 3. Rodar Testes Automatizados
```bash
npm test
```

### 4. Iniciar Servidor
```bash
npm start
# Acesse o portal em http://localhost:3000
```

---

## 📡 Exemplos de Uso da API

### Python (Pandas)
```python
import pandas as pd

# Carregar artigos do EBBC direto da API
url = "http://localhost:3000/api/v1/ebbc/export?format=csv"
df = pd.read_csv(url)
print(f"Total carregado: {len(df)} artigos")
print(df[['title', 'year', 'doi']].head())
```

### R
```r
library(jsonlite)

# Busca federada por 'cienciometria' em todo o acervo
url <- "http://localhost:3000/api/v1/articles?q=cienciometria&limit=50"
data <- fromJSON(url)
print(data$filteredCount)
head(data$results$title)
```

### cURL
```bash
# Consultar catálogo oficial de bases
curl -s http://localhost:3000/api/v1/databases | jq .

# Buscar trabalhos por autor no ENANCIB
curl -s "http://localhost:3000/api/v1/enancib/articles?author=Marcondes" | jq .
```

---

## 📄 Licenças

- **Código-Fonte**: [GNU General Public License v3.0](LICENSE) (GPL-3.0-or-later)
- **Dados Acadêmicos e Científicos**: [Creative Commons Attribution-NonCommercial-ShareAlike 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) (CC BY-NC-SA 4.0). Não comercial e sem treino comercial de IA.