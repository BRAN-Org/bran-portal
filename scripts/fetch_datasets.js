import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import { DATABASES } from '../src/databases.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const TARGET_DATA_DIR = path.join(ROOT_DIR, 'data');

if (!fs.existsSync(TARGET_DATA_DIR)) {
  fs.mkdirSync(TARGET_DATA_DIR, { recursive: true });
}

function fetchUrlToFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(destPath);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrlToFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        fileStream.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        return reject(new Error(`HTTP ${res.statusCode} para ${url}`));
      }
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(resolve);
      });
    }).on('error', (err) => {
      fileStream.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

async function syncDatasets() {
  console.log('🔄 [BRAN Portal] Sincronizando datasets das 5 bases acadêmicas...');
  let synced = 0;

  for (const db of DATABASES) {
    const targetJson = path.join(TARGET_DATA_DIR, db.dataFile);
    const targetCsv = path.join(TARGET_DATA_DIR, db.csvFile);
    const targetSqlite = path.join(TARGET_DATA_DIR, db.sqliteFile);
    const targetProv = path.join(TARGET_DATA_DIR, `${db.id}_provenance.json`);

    // 1. Tentar cópia local a partir de repositório irmão
    const localRepoDir = path.resolve(ROOT_DIR, '..', db.repoName);
    const localJson = path.join(localRepoDir, 'data', db.dataFile);
    const localCsv = path.join(localRepoDir, 'data', db.csvFile);
    const localSqlite = path.join(localRepoDir, 'data', db.sqliteFile);
    const localProv = path.join(localRepoDir, 'provenance.json');

    if (fs.existsSync(localJson)) {
      console.log(`📁 [Local] Sincronizando ${db.name} de ${localRepoDir}...`);
      fs.copyFileSync(localJson, targetJson);
      if (fs.existsSync(localCsv)) fs.copyFileSync(localCsv, targetCsv);
      if (fs.existsSync(localSqlite)) fs.copyFileSync(localSqlite, targetSqlite);
      if (fs.existsSync(localProv)) fs.copyFileSync(localProv, targetProv);
      synced++;
      continue;
    }

    // 2. Fallback remoto: GitHub Raw
    const rawBaseUrl = `https://raw.githubusercontent.com/BRAN-Org/${db.repoName}/main`;
    console.log(`🌐 [Remoto] Baixando ${db.name} via GitHub Raw...`);
    try {
      await fetchUrlToFile(`${rawBaseUrl}/data/${db.dataFile}`, targetJson);
      try {
        await fetchUrlToFile(`${rawBaseUrl}/provenance.json`, targetProv);
      } catch {
        // Provenance opcional
      }
      synced++;
    } catch (err) {
      console.error(`⚠️ Erro ao sincronizar ${db.name}:`, err.message);
    }
  }

  console.log(`✨ Sincronização concluída: ${synced}/${DATABASES.length} datasets disponíveis em ${TARGET_DATA_DIR}`);
}

syncDatasets().catch((err) => {
  console.error('❌ Falha fatal na sincronização de datasets:', err);
  process.exit(1);
});
