/**
 * Catálogo Oficial das Bases de Dados Abertas da BRAN Org
 * Infraestrutura FAIR Data Packages para a Ciência da Informação no Brasil
 */
export const DATABASES = [
  {
    id: 'enancib',
    slug: 'enancib',
    name: 'ENANCIB',
    fullName: 'Encontro Nacional de Pesquisa em Ciência da Informação',
    organization: 'ANCIB - Associação Nacional de Pesquisa e Pós-Graduação em Ciência da Informação',
    description: 'Principal fórum acadêmico e científico da Ciência da Informação no Brasil. Reúne a produção científica consolidada de todos os Grupos de Trabalho (GTs).',
    period: '2003–2024',
    dataFile: 'enancib_articles.json',
    csvFile: 'enancib_articles.csv',
    sqliteFile: 'enancib_articles.sqlite',
    repoName: 'enancib-open-database',
    githubUrl: 'https://github.com/BRAN-Org/enancib-open-database',
    zenodoDoi: '10.5281/zenodo.17441126',
    zenodoUrl: 'https://zenodo.org/records/17441126',
    badgeColor: '#2563eb',
    healthLevel: 'VERIFIED_AUDITED'
  },
  {
    id: 'cbbd',
    slug: 'cbbd',
    name: 'CBBD',
    fullName: 'Congresso Brasileiro de Biblioteconomia e Documentação',
    organization: 'FEBAB - Federação Brasileira de Associações de Bibliotecários, Cientistas da Informação e Instituições',
    description: 'O mais tradicional congresso da Biblioteconomia brasileira, cobrindo práticas, inovações bibliotecárias, gestão documental e políticas públicas.',
    period: '2013–2019',
    dataFile: 'cbbd_articles.json',
    csvFile: 'cbbd_articles.csv',
    sqliteFile: 'cbbd_articles.sqlite',
    repoName: 'cbbd-open-database',
    githubUrl: 'https://github.com/BRAN-Org/cbbd-open-database',
    zenodoDoi: null,
    zenodoUrl: 'https://github.com/BRAN-Org/cbbd-open-database',
    badgeColor: '#059669',
    healthLevel: 'VERIFIED_AUDITED'
  },
  {
    id: 'ebbc',
    slug: 'ebbc',
    name: 'EBBC',
    fullName: 'Encontro Brasileiro de Bibliometria e Cientometria',
    organization: 'Comitê Científico do EBBC',
    description: 'Ponto de encontro nacional para pesquisadores dedicados à análise quantitativa da produção científica, altmetria, cienciometria e redes de colaboração.',
    period: '2012–2024',
    dataFile: 'ebbc_articles.json',
    csvFile: 'ebbc_articles.csv',
    sqliteFile: 'ebbc_articles.sqlite',
    repoName: 'ebbc-open-database',
    githubUrl: 'https://github.com/BRAN-Org/ebbc-open-database',
    zenodoDoi: '10.5281/zenodo.17441113',
    zenodoUrl: 'https://zenodo.org/records/17441113',
    badgeColor: '#7c3aed',
    healthLevel: 'VERIFIED_AUDITED'
  },
  {
    id: 'datagramazero',
    slug: 'datagramazero',
    name: 'DataGramaZero',
    fullName: 'DataGramaZero — Revista de Ciência da Informação',
    organization: 'Instituto Ciência da Informação (DGZ)',
    description: 'Periódico digital pioneiro no Brasil. Cobriu 16 anos ininterruptos de artigos seminais sobre epistemologia, organização do conhecimento e tecnologia da informação.',
    period: '1999–2015',
    dataFile: 'datagramazero_articles.json',
    csvFile: 'datagramazero_articles.csv',
    sqliteFile: 'datagramazero_articles.sqlite',
    repoName: 'datagramazero-open-database',
    githubUrl: 'https://github.com/BRAN-Org/datagramazero-open-database',
    zenodoDoi: '10.5281/zenodo.17441098',
    zenodoUrl: 'https://zenodo.org/records/17441098',
    badgeColor: '#d97706',
    healthLevel: 'VERIFIED_AUDITED'
  },
  {
    id: 'abec',
    slug: 'abec',
    name: 'ABEC Meeting',
    fullName: 'Encontros da Associação Brasileira de Editores Científicos',
    organization: 'ABEC Brasil',
    description: 'Comunicações e palestras sobre integridade na pesquisa, boas práticas editoriais, indexação internacional e sustentabilidade das publicações científicas.',
    period: '2018–2023',
    dataFile: 'abec_articles.json',
    csvFile: 'abec_articles.csv',
    sqliteFile: 'abec_articles.sqlite',
    repoName: 'abec-open-database',
    githubUrl: 'https://github.com/BRAN-Org/abec-open-database',
    zenodoDoi: '10.5281/zenodo.17441132',
    zenodoUrl: 'https://zenodo.org/records/17441132',
    badgeColor: '#db2777',
    healthLevel: 'VERIFIED_AUDITED'
  }
];

export function getDatabaseMeta(id) {
  if (!id) return null;
  const clean = String(id).toLowerCase().trim();
  return DATABASES.find(db => db.id === clean || db.slug === clean) || null;
}
