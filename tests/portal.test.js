import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

test('Ecosystem data aggregation', async (t) => {
  const dataPath = path.join(ROOT_DIR, 'src', 'data', 'ecosystem.json');
  assert.ok(fs.existsSync(dataPath), 'ecosystem.json deve existir');

  const raw = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(raw);

  await t.test('contém métricas agregadas consistentes', () => {
    assert.equal(typeof data.metrics.total_records, 'number');
    assert.equal(data.metrics.total_databases, 5);
    assert.equal(data.metrics.zero_fabricated_dois, true);
    assert.ok(data.metrics.total_records >= 11000, 'Total de registros deve refletir a soma real das 5 bases');
  });

  await t.test('contém as 5 bases canônicas auditadas', () => {
    const expectedIds = [
      'enancib-open-database',
      'cbbd-open-database',
      'ebbc-open-database',
      'datagramazero-open-database',
      'abec-open-database'
    ];

    const actualIds = data.databases.map(d => d.id);
    for (const id of expectedIds) {
      assert.ok(actualIds.includes(id), `Base ${id} deve estar presente no ecossistema`);
    }
  });

  await t.test('cada base possui hash SHA-256 e status de saúde válido', () => {
    for (const db of data.databases) {
      assert.ok(db.stats.raw_data_sha256, `Base ${db.id} deve ter hash SHA-256`);
      assert.equal(db.stats.raw_data_sha256.length, 64, `SHA-256 de ${db.id} deve ter 64 caracteres`);
      assert.ok(db.stats.total_records > 0, `Total de registros de ${db.id} deve ser positivo`);
    }
  });

  await t.test('índice de busca possui bases canônicas e propostas', () => {
    assert.ok(Array.isArray(data.search_index));
    const indexed = data.search_index.filter(item => item.status === 'INDEXED');
    const proposed = data.search_index.filter(item => item.status === 'PROPOSED');
    assert.equal(indexed.length, 5);
    assert.ok(proposed.length >= 5, 'Deve conter fontes sugeridas no backlog');
  });
});

test('Build distribution integrity', async (t) => {
  const distDir = path.join(ROOT_DIR, 'dist');
  assert.ok(fs.existsSync(distDir), 'Diretório dist/ deve existir após o build');

  const requiredRoutes = [
    'index.html',
    path.join('databases', 'index.html'),
    path.join('calendario', 'index.html'),
    path.join('docs', 'index.html'),
    path.join('docs', 'protocolo-crona', 'index.html'),
    path.join('docs', 'esquemas', 'index.html'),
    path.join('docs', 'api', 'index.html'),
    path.join('docs', 'curadoria', 'index.html'),
    path.join('docs', 'zenodo', 'index.html')
  ];

  for (const route of requiredRoutes) {
    const routePath = path.join(distDir, route);
    assert.ok(fs.existsSync(routePath), `Rota estática ${route} deve existir no dist`);
    const content = fs.readFileSync(routePath, 'utf8');
    assert.ok(content.includes('BRAN Org'), `${route} deve conter marca institucional`);
  }
});
