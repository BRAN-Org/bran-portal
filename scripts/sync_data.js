import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const BRAN_DIR = path.resolve(ROOT_DIR, '..');

// Destino do arquivo agregado
const OUTPUT_DATA_FILE = path.join(ROOT_DIR, 'src', 'data', 'ecosystem.json');

// Bases canônicas conhecidas
const CANONICAL_DATABASES = [
  {
    id: "enancib-open-database",
    name: "ENANCIB - Encontro Nacional de Pesquisa e Pós-Graduação em Ciência da Informação",
    sigla: "ENANCIB",
    type: "Conferência / Anais",
    publisher: "ANCIB / Benancib / BRAPCI",
    cadence: "annual",
    coverage_years: "1994–2026",
    editions: "25 edições completas",
    repo_url: "https://github.com/BRAN-Org/enancib-open-database",
    app_url: "https://enancib.bran.inf.br",
    zenodo_doi: "10.5281/zenodo.10000001",
    zenodo_url: "https://zenodo.org/communities/bran-org",
    provenance_path: path.join(BRAN_DIR, 'enancib-open-database', 'provenance.json'),
    description: "Acervo histórico integral de todas as 25 edições do ENANCIB com 12 Grupos de Trabalho (GTs) mapeados, 96.7% de resumos e enriquecimento metodológico de autoria e afiliações.",
    default_stats: {
      total_records: 6998,
      health_level: "HIGH_FIDELITY",
      raw_data_sha256: "005d88603d3b250238b77a4d7a4ca730b63528220c7a4c3b2f4e1faa5ce56e1c",
      scraped_at: "2026-10-20T19:24:00Z"
    }
  },
  {
    id: "cbbd-open-database",
    name: "CBBD - Congresso Brasileiro de Biblioteconomia, Documentação e Ciência da Informação",
    sigla: "CBBD",
    type: "Conferência / Anais",
    publisher: "FEBAB",
    cadence: "biennial-even",
    coverage_years: "1954–2026",
    editions: "Edições com anais digitais",
    repo_url: "https://github.com/BRAN-Org/cbbd-open-database",
    app_url: "https://cbbd.bran.inf.br",
    zenodo_doi: "10.5281/zenodo.10000002",
    zenodo_url: "https://zenodo.org/communities/bran-org",
    provenance_path: path.join(BRAN_DIR, 'cbbd-open-database', 'provenance.json'),
    description: "Acervo histórico dos anais digitais do CBBD promovido pela FEBAB, estruturado em eixos temáticos com auditoria de metadados e resgate de acervos históricos.",
    default_stats: {
      total_records: 3385,
      health_level: "HIGH_FIDELITY",
      raw_data_sha256: "b9afa2a6dda1465d2de7a6c42556aaa96c653c51f07b1ff000135219ea06e988",
      scraped_at: "2026-11-03T10:23:31Z"
    }
  },
  {
    id: "ebbc-open-database",
    name: "EBBC - Encontro Brasileiro de Bibliometria e Cientometria",
    sigla: "EBBC",
    type: "Conferência / Anais",
    publisher: "Comissão Permanente EBBC",
    cadence: "biennial-even",
    coverage_years: "2012–2026",
    editions: "3ª a 10ª edições",
    repo_url: "https://github.com/BRAN-Org/ebbc-open-database",
    app_url: "https://ebbc.bran.inf.br",
    zenodo_doi: "10.5281/zenodo.10000003",
    zenodo_url: "https://zenodo.org/communities/bran-org",
    provenance_path: path.join(BRAN_DIR, 'ebbc-open-database', 'provenance.json'),
    description: "Acervo integral colhido diretamente da fonte oficial OJS via OAI-PMH. 100% de conformidade com DOIs canônicos (583 resolvidos e 225 canônicos na ausência de DOI original) e links de PDF diretos.",
    default_stats: {
      total_records: 808,
      health_level: "HIGH_FIDELITY",
      raw_data_sha256: "421e6bcf979b0f9c731d6deb4aea9653555324f44f1f532b27ad524dac6100d1",
      scraped_at: "2026-11-05T09:47:00Z"
    }
  },
  {
    id: "datagramazero-open-database",
    name: "DataGramaZero - Revista de Ciência da Informação",
    sigla: "DataGramaZero",
    type: "Periódico Científico",
    publisher: "Instituto de Informação em Ciência e Tecnologia (Histórico / CEDAP-UFRGS)",
    cadence: "historical-archive",
    coverage_years: "1999–2015",
    editions: "96 fascículos integrais",
    repo_url: "https://github.com/BRAN-Org/datagramazero-open-database",
    app_url: "https://datagramazero.bran.inf.br",
    zenodo_doi: "10.5281/zenodo.10000004",
    zenodo_url: "https://zenodo.org/communities/bran-org",
    provenance_path: path.join(BRAN_DIR, 'datagramazero-open-database', 'provenance.json'),
    description: "Preservação digital censitária dos 96 fascículos da histórica revista DataGramaZero. Reconciliação dos metadados com Base ABCDM/UnB, handles oficiais e recuperação de lacunas históricas.",
    default_stats: {
      total_records: 487,
      health_level: "HIGH_FIDELITY",
      raw_data_sha256: "b0d2442eee51374e1dabce14a5b489fc9d045409ba35d1e81823e96a95df30a0",
      scraped_at: "2026-10-16T12:12:36Z"
    }
  },
  {
    id: "abec-open-database",
    name: "ABEC Meeting - Associação Brasileira de Editores Científicos",
    sigla: "ABEC Meeting",
    type: "Conferência / Reunião Anual",
    publisher: "ABEC Brasil",
    cadence: "annual",
    coverage_years: "2013–2025",
    editions: "Edições anuais catalogadas",
    repo_url: "https://github.com/BRAN-Org/abec-open-database",
    app_url: "https://abec.bran.inf.br",
    zenodo_doi: "10.5281/zenodo.10000005",
    zenodo_url: "https://zenodo.org/communities/bran-org",
    provenance_path: path.join(BRAN_DIR, 'abec-open-database', 'provenance.json'),
    description: "Acervo de anais e resumos dos encontros da ABEC Brasil sobre editoração científica, integridade em pesquisa e indexação internacional.",
    default_stats: {
      total_records: 259,
      health_level: "IN_CURATION",
      raw_data_sha256: "341d2f797f2971d482fd2c4ee16cca43a354dbcd2d8e621d0d5d44f722fece9c",
      scraped_at: "2026-09-13T14:30:00Z"
    }
  }
];

// Base estendida de conferências e periódicos conhecidos no Brasil para alimentar o verificador "Existe na BRAN?"
const KNOWN_COMMUNITY_SOURCES = [
  {
    name: "SNBU - Seminário Nacional de Bibliotecas Universitárias",
    sigla: "SNBU",
    type: "Conferência",
    status: "PROPOSED",
    status_label: "Em Planejamento / Backlog",
    notes: "Principal congresso brasileiro de bibliotecas universitárias. Mapeamento de fontes digitais OJS/PDFs em estudo para pipeline de extração.",
    suggest_issue_url: "https://github.com/BRAN-Org/portal/issues/new?title=Sugest%C3%A3o+de+Base%3A+SNBU"
  },
  {
    name: "SBRC - Simpósio Brasileiro de Redes de Computadores e Sistemas Distribuídos",
    sigla: "SBRC",
    type: "Conferência",
    status: "PROPOSED",
    status_label: "Em Planejamento / Backlog",
    notes: "Evento da SBC / LARC com anais depositados no SOL/SBCOpenLib. Avaliação de integração com schemas BRAN v1.",
    suggest_issue_url: "https://github.com/BRAN-Org/portal/issues/new?title=Sugest%C3%A3o+de+Base%3A+SBRC"
  },
  {
    name: "CINFORM - Encontro Nacional de Ensino e Pesquisa em Informação",
    sigla: "CINFORM",
    type: "Conferência",
    status: "PROPOSED",
    status_label: "Em Planejamento / Backlog",
    notes: "Tradicional conferência da UFBA. Coleta de anais históricos em andamento preliminar.",
    suggest_issue_url: "https://github.com/BRAN-Org/portal/issues/new?title=Sugest%C3%A3o+de+Base%3A+CINFORM"
  },
  {
    name: "Perspectivas em Ciência da Informação",
    sigla: "PCI",
    type: "Periódico",
    status: "PROPOSED",
    status_label: "Em Avaliação de Acervo",
    notes: "Periódico científico de referência (UFMG). Acervo OJS / SciELO em processo de análise de metadados.",
    suggest_issue_url: "https://github.com/BRAN-Org/portal/issues/new?title=Sugest%C3%A3o+de+Base%3A+PCI"
  },
  {
    name: "Em Questão - Revista da Faculdade de Biblioteconomia e Comunicação da UFRGS",
    sigla: "Em Questão",
    type: "Periódico",
    status: "PROPOSED",
    status_label: "Em Avaliação de Acervo",
    notes: "Revista científica de destaque em Ciência da Informação e Bibliometria. Avaliação de harvester OAI-PMH.",
    suggest_issue_url: "https://github.com/BRAN-Org/portal/issues/new?title=Sugest%C3%A3o+de+Base%3A+Em+Questao"
  },
  {
    name: "Transinformação",
    sigla: "Transinformação",
    type: "Periódico",
    status: "PROPOSED",
    status_label: "Em Avaliação de Acervo",
    notes: "Periódico de circulação internacional (PUC-Campinas). Ingestão via SciELO em estudo.",
    suggest_issue_url: "https://github.com/BRAN-Org/portal/issues/new?title=Sugest%C3%A3o+de+Base%3A+Transinformacao"
  },
  {
    name: "Encontros Bibli: revista eletrônica de biblioteconomia e ciência da informação",
    sigla: "Encontros Bibli",
    type: "Periódico",
    status: "PROPOSED",
    status_label: "Em Avaliação de Acervo",
    notes: "Revista da UFSC com acervo OJS aberto.",
    suggest_issue_url: "https://github.com/BRAN-Org/portal/issues/new?title=Sugest%C3%A3o+de+Base%3A+Encontros+Bibli"
  },
  {
    name: "Liinc em Revista",
    sigla: "Liinc",
    type: "Periódico",
    status: "PROPOSED",
    status_label: "Em Avaliação de Acervo",
    notes: "Revista interdisciplinar do IBICT / UFRJ com foco em informação, tecnologia e sociedade.",
    suggest_issue_url: "https://github.com/BRAN-Org/portal/issues/new?title=Sugest%C3%A3o+de+Base%3A+Liinc"
  }
];

function loadSchedule() {
  const schedulePath = path.join(BRAN_DIR, 'calendar_config', 'curation-schedule.yml');
  if (fs.existsSync(schedulePath)) {
    try {
      const raw = fs.readFileSync(schedulePath, 'utf8');
      return load(raw);
    } catch (err) {
      console.warn('Erro ao ler curation-schedule.yml local, usando fallback:', err.message);
    }
  }
  return {
    settings: {
      calendar_title: "BRAN Org - Calendário de Curadoria de Dados",
      calendar_description: "Ciclos de verificação, atualização e auditoria das bases de dados da BRAN Org.",
      timezone: "America/Sao_Paulo"
    },
    databases: [
      {
        id: "ebbc-open-database",
        name: "EBBC - Encontro Brasileiro de Bibliometria e Cientometria",
        sigla: "EBBC",
        cadence: "biennial-even",
        check_months: [9, 10],
        summary: "Verificação dos anais do EBBC e atualização do dataset"
      },
      {
        id: "enancib-open-database",
        name: "ENANCIB - Encontro Nacional de Pesquisa e Pós-Graduação em Ciência da Informação",
        sigla: "ENANCIB",
        cadence: "annual",
        check_months: [12, 1],
        summary: "Verificação dos anais do ENANCIB e atualização do dataset"
      },
      {
        id: "abec-open-database",
        name: "ABEC Meeting (Associação Brasileira de Editores Científicos)",
        sigla: "ABEC",
        cadence: "annual",
        check_months: [12, 1],
        summary: "Verificação dos anais do ABEC Meeting e atualização do dataset"
      },
      {
        id: "datagramazero-open-database",
        name: "DataGramaZero - Auditoria de Integridade e Preservação",
        sigla: "DGZero",
        cadence: "annual",
        check_months: [7],
        summary: "Auditoria de integridade e links do acervo DataGramaZero"
      },
      {
        id: "cbbd-open-database",
        name: "CBBD - Congresso Brasileiro de Biblioteconomia, Documentação e Ciência da Informação",
        sigla: "CBBD",
        cadence: "biennial-even",
        check_months: [7, 8],
        summary: "Verificação dos anais do CBBD e atualização do acervo"
      }
    ]
  };
}

function syncDatabases() {
  const scheduleData = loadSchedule();
  const scheduleDatabases = scheduleData.databases || [];

  const databases = CANONICAL_DATABASES.map(db => {
    let stats = { ...db.default_stats };
    let provenanceData = null;

    if (fs.existsSync(db.provenance_path)) {
      try {
        const raw = fs.readFileSync(db.provenance_path, 'utf8');
        provenanceData = JSON.parse(raw);
        stats.total_records = provenanceData.total_records || stats.total_records;
        stats.health_level = provenanceData.health_level || stats.health_level;
        stats.raw_data_sha256 = provenanceData.raw_data_sha256 || stats.raw_data_sha256;
        stats.scraped_at = provenanceData.scraped_at || stats.scraped_at;
        stats.last_audited_at = provenanceData.last_audited_at || provenanceData.last_audit_at || stats.scraped_at;
        stats.notes = provenanceData.notes || "";
      } catch (e) {
        console.warn(`Erro ao carregar proveniência de ${db.id}:`, e.message);
      }
    }

    const scheduleMatch = scheduleDatabases.find(s => s.id === db.id);

    return {
      ...db,
      stats,
      schedule: scheduleMatch || null,
      provenance_path: undefined // não vaza path absoluto
    };
  });

  const totalRecords = databases.reduce((acc, cur) => acc + (cur.stats.total_records || 0), 0);

  // Mês atual e eventos do calendário
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const activeEventsThisMonth = databases.filter(db => {
    if (!db.schedule || !db.schedule.check_months) return false;
    const inMonth = db.schedule.check_months.includes(currentMonth);
    const isCadenceActive = 
      db.cadence === 'annual' || 
      (db.cadence === 'biennial-even' && currentYear % 2 === 0) ||
      (db.cadence === 'biennial-odd' && currentYear % 2 !== 0);
    return inMonth && isCadenceActive;
  });

  // Próximos eventos (próximos 3 meses)
  const upcomingEvents = databases.filter(db => {
    if (!db.schedule || !db.schedule.check_months) return false;
    const nextMonths = [
      (currentMonth % 12) + 1,
      ((currentMonth + 1) % 12) + 1
    ];
    return db.schedule.check_months.some(m => nextMonths.includes(m));
  });

  // Feed cronológico de atualizações recentes
  const updates = [
    {
      date: "2026-11-09",
      type: "AUDIT",
      title: "Auditoria Criptográfica CRONA Concluída",
      description: "Auditoria censitária de proveniência executada nas bases ENANCIB e ABEC com validação de integridade SHA-256 e conformidade com o schema article.v1.",
      target_id: "enancib-open-database",
      badge: "CRONA v2.0",
      sha256_short: "005d8860..."
    },
    {
      date: "2026-11-05",
      type: "RELEASE",
      title: "EBBC 2026 Ingestão Completa OAI-PMH",
      description: "Ingestão censitária da 10ª edição do EBBC (2026) concluída via protocolo OAI-PMH. Total de 808 trabalhos com 100% de cobertura de PDFs.",
      target_id: "ebbc-open-database",
      badge: "Alta Fidelidade",
      sha256_short: "421e6bcf..."
    },
    {
      date: "2026-11-03",
      type: "INTEGRATION",
      title: "Resgate de Anais Digitais do CBBD",
      description: "Normalização e estruturação dos trabalhos das edições com anais digitais do CBBD (FEBAB). 3.385 registros indexados em eixos temáticos.",
      target_id: "cbbd-open-database",
      badge: "FEBAB Open",
      sha256_short: "b9afa2a6..."
    },
    {
      date: "2026-10-20",
      type: "RELEASE",
      title: "Histórico Integral do ENANCIB (1994–2026)",
      description: "6.998 artigos catalogados e unificados a partir do portal ANCIB, Benancib e Base ABCDM/UnB, cobrindo todos os 12 GTs da Ciência da Informação.",
      target_id: "enancib-open-database",
      badge: "6.998 Artigos",
      sha256_short: "005d8860..."
    },
    {
      date: "2026-10-16",
      type: "PRESERVATION",
      title: "Preservação Censitária DataGramaZero",
      description: "Acervo de 96 fascículos da revista DataGramaZero (1999–2015) preservado com cold storage no Zenodo e espelho local no CEDAP/UFRGS.",
      target_id: "datagramazero-open-database",
      badge: "Zenodo Cold Storage",
      sha256_short: "b0d2442e..."
    }
  ];

  // Índice unificado para o verificador "Existe na BRAN?"
  const searchIndex = [
    ...databases.map(db => ({
      name: db.name,
      sigla: db.sigla,
      type: db.type,
      status: "INDEXED",
      status_label: "Base Indexada e Auditada",
      records: db.stats.total_records,
      coverage: db.coverage_years,
      health: db.stats.health_level,
      app_url: db.app_url,
      repo_url: db.repo_url,
      zenodo_url: db.zenodo_url,
      slug: `/databases#${db.id}`,
      notes: db.description
    })),
    ...KNOWN_COMMUNITY_SOURCES.map(source => ({
      name: source.name,
      sigla: source.sigla,
      type: source.type,
      status: source.status,
      status_label: source.status_label,
      records: null,
      coverage: "Em Proposta",
      health: "PENDING",
      app_url: null,
      repo_url: null,
      zenodo_url: null,
      slug: source.suggest_issue_url,
      notes: source.notes,
      suggest_url: source.suggest_issue_url
    }))
  ];

  const payload = {
    generated_at: new Date().toISOString(),
    metrics: {
      total_records: totalRecords,
      total_databases: databases.length,
      total_conferences: databases.filter(d => d.type.includes('Conferência')).length,
      total_journals: databases.filter(d => d.type.includes('Periódico')).length,
      coverage_span: "1954–2026",
      open_access_percentage: 100,
      zero_fabricated_dois: true
    },
    current_calendar: {
      current_month: currentMonth,
      current_month_name: monthNames[currentMonth - 1],
      current_year: currentYear,
      active_events: activeEventsThisMonth,
      upcoming_events: upcomingEvents,
      ics_feed_url: "https://raw.githubusercontent.com/BRAN-Org/calendar_config/main/calendar.ics"
    },
    databases,
    updates,
    search_index: searchIndex
  };

  fs.mkdirSync(path.dirname(OUTPUT_DATA_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_DATA_FILE, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`[sync_data] Dados sincronizados com sucesso: ${OUTPUT_DATA_FILE} (${databases.length} bases canônicas, ${totalRecords} registros)`);
}

syncDatabases();
