import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadData } from './src/dataManager.js';
import { getDatasetConfig } from './src/config.js';
import { createApiRouter } from './src/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares padrão
app.use(cors());
app.use(express.json());

// Carregar dataset em memória no boot
loadData();

// Determinar diretório estático (prioriza build do Astro em dist/, fallback para public/)
const staticDir = existsSync(join(__dirname, 'dist')) ? join(__dirname, 'dist') : join(__dirname, 'public');


// Servir arquivos estáticos do Portal
app.use(express.static(staticDir, { extensions: ['html'] }));

// Montar rotas da API REST pública
const apiRouter = createApiRouter();
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter); // Alias de compatibilidade rápida

// Fallback para rotas limpas e páginas do Portal
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint da API não encontrado' });
  }
  const cleanPath = join(staticDir, req.path.replace(/\/$/, ''), 'index.html');
  if (existsSync(cleanPath)) {
    return res.sendFile(cleanPath);
  }
  res.sendFile(join(staticDir, 'index.html'));
});


// Inicializar Servidor em modo local
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    const config = getDatasetConfig();
    console.log(`=======================================================`);
    console.log(`🚀 BRAN Open Data Server rodando na porta ${PORT}`);
    console.log(`📌 Dataset: ${config.dataset?.title || 'BRAN Template'}`);
    console.log(`🌐 Dashboard: http://localhost:${PORT}`);
    console.log(`📡 REST API:  http://localhost:${PORT}/api/v1/${config.dataset?.entityName || 'articles'}`);
    console.log(`=======================================================`);
  });
}

export default app;
