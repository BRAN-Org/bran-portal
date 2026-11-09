import { getAllItems } from './dataManager.js';
import { getDatasetConfig } from './config.js';

function getScopedItems(databaseId) {
  let items = getAllItems();
  if (databaseId && databaseId !== 'all' && databaseId !== 'todas') {
    const cleanId = String(databaseId).toLowerCase().trim();
    items = items.filter(i => String(i.database).toLowerCase() === cleanId);
  }
  return items;
}

function extractFieldValues(item, field) {
  const val = item[field];
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map(v => {
      if (typeof v === 'object' && v !== null) {
        return String(v.name || v.label || '').trim();
      }
      return String(v).trim();
    }).filter(Boolean);
  }
  if (typeof val === 'object' && val !== null) {
    return [String(val.name || val.label || '').trim()].filter(Boolean);
  }
  return [String(val).trim()].filter(Boolean);
}

/**
 * Calcula estatísticas consolidadas e análises cientométricas
 * Suporta visão agregada de todo o acervo ou filtrada por base individual.
 */
export function calculateStats(databaseId = null) {
  const items = getScopedItems(databaseId);
  const config = getDatasetConfig();

  const total = items.length;
  const stats = {
    totalRecords: total,
    databaseId: databaseId || 'all',
    entityName: config.dataset?.pluralName || 'Registros',
    topLists: {},
    breakdowns: {},
    metrics: {},
    pareto: calculateParetoData('keywords', 10, databaseId),
    temporalStacked: calculateTemporalStacked('keywords', 5, databaseId)
  };

  if (total === 0) return stats;

  // 1. Processar listas dos mais frequentes (Top Lists)
  const topListSpecs = config.stats?.topLists || [
    { key: 'topAuthors', label: 'Principais Autores / Pesquisadores', sourceField: 'authors', limit: 10 },
    { key: 'topKeywords', label: 'Palavras-chave & Tópicos', sourceField: 'keywords', limit: 10 },
    { key: 'topSections', label: 'Eixos Temáticos / Seções', sourceField: 'section', limit: 10 }
  ];

  for (const spec of topListSpecs) {
    const counts = {};
    items.forEach(item => {
      const vals = extractFieldValues(item, spec.sourceField);
      vals.forEach(v => {
        counts[v] = (counts[v] || 0) + 1;
      });
    });

    const sortedArray = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, spec.limit || 10);

    stats.topLists[spec.key] = {
      label: spec.label,
      data: sortedArray
    };
  }

  // 2. Processar distribuições (Breakdowns)
  const breakdownSpecs = config.stats?.breakdowns || [
    { key: 'yearDistribution', label: 'Distribuição por Ano / Edição', sourceField: 'year' },
    { key: 'sectionBreakdown', label: 'Distribuição por Eixo Temático', sourceField: 'section' }
  ];

  for (const spec of breakdownSpecs) {
    const counts = {};
    items.forEach(item => {
      const vals = extractFieldValues(item, spec.sourceField);
      if (vals.length === 0 && item[spec.sourceField] !== undefined) {
        const clean = String(item[spec.sourceField]).trim();
        if (clean) counts[clean] = (counts[clean] || 0) + 1;
      } else {
        vals.forEach(v => {
          counts[v] = (counts[v] || 0) + 1;
        });
      }
    });

    stats.breakdowns[spec.key] = {
      label: spec.label,
      data: counts
    };
  }

  // 3. Distribuição por Base de Dados (se visão global)
  if (!databaseId || databaseId === 'all') {
    const dbCounts = {};
    items.forEach(item => {
      const db = item.database || 'default';
      dbCounts[db] = (dbCounts[db] || 0) + 1;
    });
    stats.breakdowns.databaseDistribution = {
      label: 'Distribuição por Base de Dados',
      data: dbCounts
    };
  }

  // 4. Métricas adicionais
  const recordsWithTools = items.filter(i => Array.isArray(i.tools) && i.tools.length > 0).length;
  stats.metrics.recordsWithTools = recordsWithTools;
  stats.metrics.toolAdoptionRate = parseFloat(((recordsWithTools / total) * 100).toFixed(2));

  return stats;
}

/**
 * Matriz de Coocorrência 2D (Heatmap) entre duas facetas internas (ex: keywords x section)
 */
export function calculateCooccurrenceMatrix(fieldA = 'keywords', fieldB = 'section', limit = 6, databaseId = null) {
  const items = getScopedItems(databaseId);

  const getTop = (field) => {
    const counts = {};
    items.forEach(item => {
      const vals = extractFieldValues(item, field);
      vals.forEach(v => {
        counts[v] = (counts[v] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(e => e[0]);
  };

  const topA = getTop(fieldA);
  const topB = getTop(fieldB);

  const matrix = {};
  topA.forEach(a => {
    matrix[a] = {};
    topB.forEach(b => {
      matrix[a][b] = 0;
    });
  });

  items.forEach(item => {
    const valsA = extractFieldValues(item, fieldA);
    const valsB = extractFieldValues(item, fieldB);

    valsA.forEach(a => {
      if (matrix[a]) {
        valsB.forEach(b => {
          if (matrix[a][b] !== undefined) {
            matrix[a][b]++;
          }
        });
      }
    });
  });

  return {
    rows: topA,
    cols: topB,
    matrix
  };
}

/**
 * Distribuição Temporal Empilhada por Ano
 */
export function calculateTemporalStacked(field = 'keywords', topLimit = 5, databaseId = null) {
  const items = getScopedItems(databaseId);

  const years = Array.from(new Set(items.map(i => parseInt(i.year || i.publication_year, 10)).filter(y => !isNaN(y) && y > 1900 && y < 2100))).sort((a, b) => a - b);

  const counts = {};
  items.forEach(item => {
    const vals = extractFieldValues(item, field);
    vals.forEach(v => {
      counts[v] = (counts[v] || 0) + 1;
    });
  });

  const topCategories = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topLimit)
    .map(e => e[0]);

  const series = topCategories.map(cat => {
    const dataByYear = years.map(yr => {
      const yearItems = items.filter(i => parseInt(i.year || i.publication_year, 10) === yr);
      const totalYearItems = yearItems.length || 1;
      const catCount = yearItems.filter(i => {
        const vals = extractFieldValues(i, field);
        return vals.includes(cat);
      }).length;

      const percentage = parseFloat(((catCount / totalYearItems) * 100).toFixed(1));
      return { year: yr, count: catCount, percentage };
    });

    return {
      name: cat,
      data: dataByYear
    };
  });

  return { years, categories: topCategories, series };
}

/**
 * Análise de Dispersão (Scatter Plot): Autores por Artigo vs. Metadados
 */
export function calculateScatterData(databaseId = null) {
  const items = getScopedItems(databaseId);
  const points = items.map(item => {
    const authors = extractFieldValues(item, 'authors');
    const authorCount = authors.length > 0 ? authors.length : 1;
    const kwCount = extractFieldValues(item, 'keywords').length;
    const toolCount = Array.isArray(item.tools) ? item.tools.length : 0;

    return {
      title: item.title,
      doi: item.doi || item.id,
      database: item.database,
      x: authorCount,
      y: kwCount + toolCount
    };
  });

  const n = points.length;
  if (n === 0) return { points: [], slope: 0, intercept: 0 };

  const sumX = points.reduce((acc, p) => acc + p.x, 0);
  const sumY = points.reduce((acc, p) => acc + p.y, 0);
  const sumXY = points.reduce((acc, p) => acc + (p.x * p.y), 0);
  const sumXX = points.reduce((acc, p) => acc + (p.x * p.x), 0);

  const denom = (n * sumXX - sumX * sumX);
  const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
  const intercept = n !== 0 ? (sumY - slope * sumX) / n : 0;

  return {
    points: points.slice(0, 500), // Limitar amostra de pontos para renderização SVG fluida
    trendline: { slope, intercept }
  };
}

/**
 * Análise de Pareto / Bradford (Distribuição acumulada de Frequência)
 */
export function calculateParetoData(field = 'keywords', limit = 10, databaseId = null) {
  const items = getScopedItems(databaseId);
  const counts = {};
  let totalOccurrences = 0;

  items.forEach(item => {
    const vals = extractFieldValues(item, field);
    vals.forEach(v => {
      counts[v] = (counts[v] || 0) + 1;
      totalOccurrences++;
    });
  });

  const sorted = Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  let cumulative = 0;
  const paretoItems = sorted.map(item => {
    cumulative += item.count;
    const cumulativePercent = totalOccurrences > 0
      ? parseFloat(((cumulative / totalOccurrences) * 100).toFixed(1))
      : 0;

    return {
      name: item.name,
      count: item.count,
      cumulativePercent,
      cumulativePercentage: cumulativePercent
    };
  });

  const pareto80Index = paretoItems.findIndex(i => i.cumulativePercent >= 80);

  return {
    totalOccurrences,
    items: paretoItems,
    data: paretoItems,
    pareto80Index: pareto80Index !== -1 ? pareto80Index : Math.max(0, paretoItems.length - 1)
  };
}
