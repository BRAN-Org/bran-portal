import { Router } from 'express';
import { getDatasetConfig } from './config.js';
import { queryItems, getItemByKey, getDatabasesRegistry } from './dataManager.js';
import { getDatabaseMeta } from './databases.js';
import {
  calculateStats,
  calculateCooccurrenceMatrix,
  calculateTemporalStacked,
  calculateScatterData,
  calculateParetoData
} from './statsEngine.js';
import { exportDataset } from './exportEngine.js';
import { generateOpenApiSpec } from './openapi.js';

export function createApiRouter() {
  const router = Router();
  const config = getDatasetConfig();
  const entityName = config.dataset?.entityName || 'articles';

  // Especificação OpenAPI 3.0
  router.get('/openapi.json', (req, res) => {
    res.json(generateOpenApiSpec(getDatasetConfig()));
  });

  // 1. Configuração pública
  router.get('/config', (req, res) => {
    const cfg = getDatasetConfig();
    res.json({
      ...cfg,
      databases: getDatabasesRegistry()
    });
  });

  // 2. Catálogo Oficial das 5 Bases de Dados
  router.get('/databases', (req, res) => {
    res.json(getDatabasesRegistry());
  });

  router.get('/databases/:database', (req, res) => {
    const meta = getDatabaseMeta(req.params.database);
    if (!meta) {
      return res.status(404).json({ error: `Base de dados '${req.params.database}' não encontrada.` });
    }
    const registry = getDatabasesRegistry().find(d => d.id === meta.id);
    const stats = calculateStats(meta.id);
    res.json({
      ...registry,
      stats
    });
  });

  // 3. Estatísticas consolidadas (global ou filtrada por ?database=...)
  router.get(`/${entityName}/stats`, (req, res) => {
    res.json(calculateStats(req.query.database));
  });

  // Alias para /api/v1/stats
  router.get('/stats', (req, res) => {
    res.json(calculateStats(req.query.database));
  });

  // 4. Matriz de Coocorrência / Correlações Internas (Heatmap)
  router.get(`/${entityName}/stats/correlations`, (req, res) => {
    const fieldA = req.query.fieldA || 'keywords';
    const fieldB = req.query.fieldB || 'section';
    const limit = parseInt(req.query.limit || '6', 10);
    res.json(calculateCooccurrenceMatrix(fieldA, fieldB, limit, req.query.database));
  });

  // 5. Distribuição Temporal Empilhada por Ano
  router.get(`/${entityName}/stats/temporal`, (req, res) => {
    const field = req.query.field || 'keywords';
    const limit = parseInt(req.query.limit || '5', 10);
    res.json(calculateTemporalStacked(field, limit, req.query.database));
  });

  // 6. Análise de Dispersão (Scatter Plot)
  router.get(`/${entityName}/stats/scatter`, (req, res) => {
    res.json(calculateScatterData(req.query.database));
  });

  // 7. Análise de Pareto / Bradford
  router.get(`/${entityName}/stats/pareto`, (req, res) => {
    const field = req.query.field || 'keywords';
    const limit = parseInt(req.query.limit || '10', 10);
    res.json(calculateParetoData(field, limit, req.query.database));
  });

  // 8. Endpoint de exportação (CSV / JSON / BibTeX / RIS)
  router.get(`/${entityName}/export`, (req, res) => {
    exportDataset(req, res);
  });

  // 9. Busca flexível por DOI / ID via wildcard de rota
  router.use(`/${entityName}/by-key`, (req, res, next) => {
    let rawKey = req.path.replace(/^\//, '');
    if (!rawKey && req.query.value) {
      rawKey = req.query.value;
    }

    if (!rawKey) return next();

    const item = getItemByKey(rawKey);
    if (!item) {
      return res.status(404).json({ error: `Registro com a chave '${rawKey}' não encontrado.` });
    }
    return res.json(item);
  });

  // 10. Busca individual por ID/DOI percent-encoded
  router.get(`/${entityName}/:key`, (req, res, next) => {
    const item = getItemByKey(req.params.key);
    if (!item) {
      return res.status(404).json({ error: `Registro com a chave '${req.params.key}' não encontrado.` });
    }
    return res.json(item);
  });

  // 11. Lista geral de itens federada (com filtros, busca textual, ordenação e paginação)
  router.get(`/${entityName}`, (req, res) => {
    const result = queryItems(req.query);
    res.json(result);
  });

  // 12. Rotas scoped retrocompatíveis por Base de Dados (ex: /ebbc/articles, /enancib/articles)
  router.get('/:database/articles/stats', (req, res, next) => {
    const meta = getDatabaseMeta(req.params.database);
    if (!meta) return next();
    res.json(calculateStats(meta.id));
  });

  router.get('/:database/articles/export', (req, res, next) => {
    const meta = getDatabaseMeta(req.params.database);
    if (!meta) return next();
    req.query.database = meta.id;
    exportDataset(req, res);
  });

  router.get('/:database/articles/:key', (req, res, next) => {
    const meta = getDatabaseMeta(req.params.database);
    if (!meta) return next();
    const item = getItemByKey(req.params.key);
    if (!item || String(item.database).toLowerCase() !== meta.id) {
      return res.status(404).json({ error: `Registro '${req.params.key}' não encontrado na base ${meta.name}.` });
    }
    return res.json(item);
  });

  router.get('/:database/articles', (req, res, next) => {
    const meta = getDatabaseMeta(req.params.database);
    if (!meta) return next();
    const query = { ...req.query, database: meta.id };
    const result = queryItems(query);
    res.json(result);
  });

  return router;
}
