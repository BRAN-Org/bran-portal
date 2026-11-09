import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDatasetConfig } from './config.js';
import { DATABASES, getDatabaseMeta } from './databases.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEFAULT_DATA_DIR = join(__dirname, '../data');

let loadedItems = [];
let databaseStats = {};

/**
 * Normaliza string para comparação case-insensitive sem acentos
 */
export function normalizeString(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Carrega todos os datasets em memória a partir do diretório de dados
 */
export function loadData() {
  if (loadedItems.length > 0) return loadedItems;

  const targetDir = process.env.DATASET_DIR
    ? (isAbsolute(process.env.DATASET_DIR) ? process.env.DATASET_DIR : join(process.cwd(), process.env.DATASET_DIR))
    : DEFAULT_DATA_DIR;

  const items = [];
  const dbCounts = {};
  const dbYearRanges = {};

  try {
    if (existsSync(targetDir)) {
      const allFiles = readdirSync(targetDir);
      const articleFiles = allFiles.filter(f => f.endsWith('_articles.json'));
      const candidateFiles = articleFiles.length > 0
        ? articleFiles
        : allFiles.filter(f => f.endsWith('.json') && !f.includes('provenance'));

      for (const file of candidateFiles) {
        const filePath = join(targetDir, file);
        try {
          const raw = readFileSync(filePath, 'utf-8');
          const data = JSON.parse(raw);
          const rawList = Array.isArray(data) ? data : (data && typeof data === 'object' ? [data] : []);

          // Identificar base correspondente
          const baseKey = file.replace(/_articles\.json$|\.json$/, '').toLowerCase();
          const meta = getDatabaseMeta(baseKey) || DATABASES.find(d => baseKey.includes(d.id));

          const dbId = meta ? meta.id : 'default';
          const dbName = meta ? meta.name : (getDatasetConfig().dataset?.title || 'BRAN Dataset');
          const dbColor = meta ? meta.badgeColor : '#3b82f6';

          for (const item of rawList) {
            item.database = item.database || dbId;
            item.database_name = item.database_name || dbName;
            item.database_color = item.database_color || dbColor;

            // Estatísticas por base
            dbCounts[item.database] = (dbCounts[item.database] || 0) + 1;
            const y = parseInt(item.year || item.publication_year, 10);
            if (!isNaN(y) && y > 1900 && y < 2100) {
              if (!dbYearRanges[item.database]) {
                dbYearRanges[item.database] = { min: y, max: y };
              } else {
                if (y < dbYearRanges[item.database].min) dbYearRanges[item.database].min = y;
                if (y > dbYearRanges[item.database].max) dbYearRanges[item.database].max = y;
              }
            }
            items.push(item);
          }
        } catch (err) {
          console.error(`⚠️ Erro ao ler arquivo ${file}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error('⚠️ Erro ao acessar diretório data:', err.message);
  }

  loadedItems = items;

  // Montar estatísticas por base
  databaseStats = {};
  for (const db of DATABASES) {
    const range = dbYearRanges[db.id];
    databaseStats[db.id] = {
      count: dbCounts[db.id] || 0,
      minYear: range?.min || null,
      maxYear: range?.max || null,
      years: range ? (range.min === range.max ? `${range.min}` : `${range.min}–${range.max}`) : db.period
    };
  }

  console.log(`📦 [BRAN Portal] Total de registros carregados em memória: ${loadedItems.length}`);
  const summaryStr = Object.entries(dbCounts).map(([id, count]) => `${id.toUpperCase()}: ${count}`).join(', ');
  if (summaryStr) {
    console.log(`📊 [BRAN Portal] Distribuição: ${summaryStr}`);
  }

  return loadedItems;
}

/**
 * Retorna o catálogo oficial das bases com metadados e estatísticas em tempo real
 */
export function getDatabasesRegistry() {
  if (loadedItems.length === 0) loadData();

  return DATABASES.map(db => {
    const stats = databaseStats[db.id] || { count: 0, minYear: null, maxYear: null, years: db.period };
    return {
      ...db,
      totalRecords: stats.count,
      minYear: stats.minYear,
      maxYear: stats.maxYear,
      years: stats.years,
      downloads: {
        json: `/data/${db.dataFile}`,
        csv: `/data/${db.csvFile}`,
        sqlite: `/data/${db.sqliteFile}`,
        exportCsv: `/api/v1/${db.id}/export?format=csv`,
        exportJson: `/api/v1/${db.id}/export?format=json`,
        exportBibtex: `/api/v1/${db.id}/export?format=bibtex`,
        exportRis: `/api/v1/${db.id}/export?format=ris`
      }
    };
  });
}

/**
 * Força recarregamento do cache em memória
 */
export function reloadData() {
  loadedItems = [];
  databaseStats = {};
  return loadData();
}

/**
 * Retorna todos os itens carregados
 */
export function getAllItems() {
  if (loadedItems.length === 0) loadData();
  return loadedItems;
}

/**
 * Executa consultas com busca textual federada, filtros por faceta/base, ordenação e paginação
 */
export function queryItems(params = {}) {
  let items = [...getAllItems()];
  const config = getDatasetConfig();
  const searchFields = config.schema?.searchFields || ['title', 'abstract', 'authors', 'keywords'];

  // 1. Filtro por Base de Dados (ex: database=ebbc ou database=ebbc,enancib)
  const targetDb = params.database || params.event || params.db;
  if (targetDb && targetDb !== 'all' && targetDb !== 'todas') {
    const dbs = String(targetDb).toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    if (dbs.length > 0) {
      items = items.filter(item => dbs.includes(String(item.database).toLowerCase()));
    }
  }

  // 2. Busca textual global (sem acentos e case-insensitive)
  if (params.search || params.q) {
    const term = normalizeString(params.search || params.q);
    items = items.filter(item => {
      return searchFields.some(field => {
        const val = item[field];
        if (!val) return false;
        if (Array.isArray(val)) {
          return val.some(v => {
            if (typeof v === 'object' && v !== null) {
              return normalizeString(v.name || v.label || '').includes(term);
            }
            return normalizeString(v).includes(term);
          });
        }
        return normalizeString(val).includes(term);
      });
    });
  }

  // 3. Filtros por Facetas
  const facets = config.schema?.facets || [
    { key: 'year', targetField: 'year', type: 'number' },
    { key: 'author', targetField: 'authors', type: 'string' },
    { key: 'section', targetField: 'section', type: 'string' },
    { key: 'keyword', targetField: 'keywords', type: 'string' }
  ];

  for (const facet of facets) {
    const queryVal = params[facet.key];
    if (queryVal !== undefined && queryVal !== null && queryVal !== '') {
      const target = facet.targetField || facet.key;

      if (facet.type === 'number') {
        const nums = String(queryVal).split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
        if (nums.length > 0) {
          items = items.filter(item => nums.includes(parseInt(item[target], 10)));
        }
      } else {
        const strVal = normalizeString(queryVal);
        items = items.filter(item => {
          const val = item[target];
          if (!val) return false;
          if (Array.isArray(val)) {
            return val.some(v => {
              const name = typeof v === 'object' && v !== null ? (v.name || '') : v;
              return normalizeString(name).includes(strVal);
            });
          }
          return normalizeString(val).includes(strVal);
        });
      }
    }
  }

  // Filtro booleano has_tool
  if (params.has_tool !== undefined) {
    const isTrue = params.has_tool === 'true' || params.has_tool === '1';
    items = items.filter(item => {
      const tools = item.tools || [];
      return isTrue ? tools.length > 0 : tools.length === 0;
    });
  }

  const totalFiltered = items.length;

  // Contagem de resultados por base para atualizar os chips na UI
  const databaseCounts = {};
  for (const db of DATABASES) {
    databaseCounts[db.id] = 0;
  }
  for (const item of items) {
    if (item.database && databaseCounts[item.database] !== undefined) {
      databaseCounts[item.database]++;
    }
  }

  // 4. Ordenação
  const sortKey = params.sort || 'year';
  const defaultOrder = (sortKey === 'year') ? 'desc' : 'asc';
  const order = (params.order || defaultOrder).toLowerCase();

  items.sort((a, b) => {
    let valA = a[sortKey] ?? '';
    let valB = b[sortKey] ?? '';

    if (sortKey === 'year') {
      valA = parseInt(valA, 10) || 0;
      valB = parseInt(valB, 10) || 0;
      return order === 'asc' ? valA - valB : valB - valA;
    }

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  });

  // 5. Paginação
  const limit = (params.limit !== undefined && params.limit !== null && params.limit !== '')
    ? parseInt(params.limit, 10)
    : 20;
  const offset = (params.offset !== undefined && params.offset !== null && params.offset !== '')
    ? parseInt(params.offset, 10)
    : 0;

  const paginatedResults = (limit > 0)
    ? items.slice(offset, offset + limit)
    : (offset > 0 ? items.slice(offset) : items);

  return {
    total: getAllItems().length,
    filteredCount: totalFiltered,
    limit: limit > 0 ? limit : totalFiltered,
    offset,
    databaseCounts,
    results: paginatedResults
  };
}

/**
 * Busca um item individual por DOI, ID determinístico ou Título Exato em todo o acervo
 */
export function getItemByKey(rawKey) {
  if (!rawKey) return null;
  const items = getAllItems();

  let cleanKey;
  try {
    cleanKey = decodeURIComponent(rawKey).trim();
  } catch {
    cleanKey = rawKey.trim();
  }

  const normKey = normalizeString(cleanKey);
  const bareKey = cleanKey.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '').trim().toLowerCase();

  // 1. Match Exato Prioritário (ID, DOI ou Título)
  for (const item of items) {
    if (item.id && (item.id === cleanKey || normalizeString(item.id) === normKey)) {
      return item;
    }

    if (item.doi && item.doi.trim().toUpperCase() !== 'N/A' && item.doi.trim().toUpperCase() !== 'NONE') {
      const bareDoi = item.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '').trim().toLowerCase();
      if (bareDoi === bareKey || item.doi.toLowerCase() === cleanKey.toLowerCase()) {
        return item;
      }
    }

    if (item.title && normalizeString(item.title) === normKey) {
      return item;
    }
  }

  // 2. Match Parcial de DOI seguro (apenas se chave tiver tamanho significativo)
  if (bareKey.length >= 7) {
    for (const item of items) {
      if (item.doi && item.doi.trim().toUpperCase() !== 'N/A' && item.doi.trim().toUpperCase() !== 'NONE') {
        const bareDoi = item.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '').trim().toLowerCase();
        if (bareDoi.includes(bareKey) || bareKey.includes(bareDoi)) {
          return item;
        }
      }
    }
  }

  return null;
}
