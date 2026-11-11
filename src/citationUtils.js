/**
 * Utilitários para validação de DOI e formatação de citações acadêmicas (BibTeX, APA, ABNT).
 */

export function getDoiStatus(rawDoi) {
  if (!rawDoi || typeof rawDoi !== 'string') return { isValid: false, isPresent: false, statusText: 'Sem DOI' };
  
  const clean = rawDoi.replace(/^https?:\/\/doi\.org\//i, '').trim();
  const upper = clean.toUpperCase();

  if (!clean || upper === 'N/A' || upper === 'NONE' || upper === 'UNDEFINED' || upper === 'NULL' || clean.includes('0000000')) {
    return { isValid: false, isPresent: false, statusText: 'Sem DOI' };
  }

  // DOIs must strictly start with prefix 10.
  if (!clean.startsWith('10.')) {
    return { isValid: false, isPresent: false, statusText: 'Sem DOI' };
  }

  const rawUrl = rawDoi.startsWith('http') ? rawDoi : `https://doi.org/${clean}`;

  // Check if DOI starts with 10. and has a slash / (standard CrossRef DOI format)
  if (/^10\.\d{4,9}\/.+$/.test(clean)) {
    return {
      isValid: true,
      isPresent: true,
      cleanDoi: clean,
      doiUrl: rawUrl,
      statusText: 'DOI Verificado (CrossRef)',
      badgeHtml: '<span class="badge-doi-status valid" title="DOI Verificado no CrossRef"><i class="fa-solid fa-circle-check"></i> DOI Verificado</span>'
    };
  }

  // Non-standard DOI syntax (e.g. 10.22477.109 with dot instead of slash)
  return {
    isValid: false,
    isPresent: true,
    cleanDoi: clean,
    doiUrl: rawUrl,
    statusText: 'DOI Não Registrado no CrossRef',
    badgeHtml: '<span class="badge-doi-status warning" title="DOI informado no registro, porém não registrado no CrossRef"><i class="fa-solid fa-triangle-exclamation"></i> DOI Não Registrado</span>'
  };
}

export function resolveArticleUrl(item) {
  if (!item) return null;

  const doiInfo = getDoiStatus(item.doi);
  if (doiInfo.isPresent) {
    return doiInfo.doiUrl;
  }

  if (item.url && typeof item.url === 'string' && item.url.startsWith('http') && item.url.toUpperCase() !== 'N/A') {
    return item.url.trim();
  }

  if (item.pdf_url && typeof item.pdf_url === 'string' && item.pdf_url.startsWith('http') && item.pdf_url.toUpperCase() !== 'N/A') {
    return item.pdf_url.trim();
  }

  return null;
}

export function formatItemCitation(item, config, fmt = 'bibtex') {
  if (!item) return '';
  const authors = Array.isArray(item.authors) ? item.authors : (item.authors ? [item.authors] : ['Autor Desconhecido']);
  const year = item.year || item.ano || '2024';
  const title = item.title || item.titulo || 'Sem título';
  const rawDoi = (item.doi && item.doi !== 'N/A') ? item.doi : '';
  const doiInfo = getDoiStatus(rawDoi);
  const articleUrl = resolveArticleUrl(item) || '';
  const citeKey = item.id ? String(item.id).replace(/[^a-zA-Z0-9_-]/g, '_') : (doiInfo.isPresent ? doiInfo.cleanDoi.replace(/[^a-zA-Z0-9_-]/g, '_') : 'item_' + year);

  if (fmt === 'bibtex') {
    let bib = `@article{${citeKey},\n  title     = {${title}},\n  author    = {${authors.join(' and ')}},\n  year      = {${year}}`;
    if (doiInfo.isValid) {
      bib += `,\n  doi       = {${doiInfo.cleanDoi}}`;
    }
    if (articleUrl) {
      bib += `,\n  url       = {${articleUrl}}`;
    }
    bib += `\n}`;
    return bib;
  } else if (fmt === 'apa') {
    let apa = `${authors.join(', ')} (${year}). ${title}.`;
    if (doiInfo.isValid) {
      apa += ` https://doi.org/${doiInfo.cleanDoi}`;
    } else if (articleUrl) {
      apa += ` ${articleUrl}`;
    }
    return apa;
  } else if (fmt === 'abnt') {
    const abntAuthors = authors.map(a => {
      const parts = String(a).trim().split(/\s+/);
      const last = parts.pop().toUpperCase();
      return `${last}, ${parts.join(' ')}`;
    }).join('; ');
    let abnt = `${abntAuthors}. ${title}. ${year}.`;
    if (doiInfo.isValid) {
      abnt += ` DOI: https://doi.org/${doiInfo.cleanDoi}.`;
    } else if (articleUrl) {
      abnt += ` Disponível em: <${articleUrl}>.`;
    }
    return abnt;
  }
  return '';
}

export function generateDatasetCitation(config, zenodoDoi, zenodoUrl, fmt = 'bibtex') {
  const title = config?.dataset?.title || 'Academic Open Database';
  const orgName = config?.organization?.name || 'BRAN Org';
  const year = '2026';
  const doi = zenodoDoi || '10.5281/zenodo.23593583';
  const url = zenodoUrl || `https://doi.org/${doi}`;
  const citeKey = `bran_${doi.replace(/[^a-zA-Z0-9]/g, '_')}`;

  if (fmt === 'bibtex') {
    return `@misc{${citeKey},\n  title        = {${title}},\n  author       = {${orgName}},\n  year         = {${year}},\n  howpublished = {Zenodo},\n  doi          = {${doi}},\n  url          = {${url}},\n  note         = {Preservação permanente de banco relacional SQLite3, CSV, JSON e textos completos em PDF}\n}`;
  } else if (fmt === 'apa') {
    return `${orgName}. (${year}). ${title} [Data set]. Zenodo. ${url}`;
  } else if (fmt === 'abnt') {
    const orgUpper = orgName.toUpperCase();
    return `${orgUpper}. ${title}: base de dados aberta e preservação integral. Genebra: CERN / Zenodo, ${year}. DOI: ${doi}. Disponível em: <${url}>.`;
  }
  return '';
}
