require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors({
  origin: [
    process.env.FRONTEND_CLIENTE_URL,
    process.env.FRONTEND_ADMIN_URL,
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ==========================================
// BANCO DE DADOS
// ==========================================
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: parseInt(process.env.DB_POOL_SIZE) || 10
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool:', err);
});

// Passar pool para as rotas
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// ==========================================
// ROTAS DE AUTENTICAÇÃO
// ==========================================
const authRoutes = require('./routes/auth');

app.post('/api/auth/registro-paciente', authRoutes.registroPaciente);
app.post('/api/auth/login-paciente', authRoutes.loginPaciente);
app.post('/api/auth/login-admin', authRoutes.loginAdmin);
app.post('/api/auth/verificar-email', authRoutes.verificarEmail);

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/health', (req, res) => {
  res.json({
    status: '✅ API Running',
    timestamp: new Date(),
    database: '✅ Connected',
    version: '1.0.0'
  });
});

// ==========================================
// ERROR HANDLING
// ==========================================
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  const mensagem = (err && err.message) ? err.message : 'Erro desconhecido';
  res.status((err && err.status) || 500).json({
    erro: 'Erro interno do servidor',
    mensagem
  });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🏥 CLÍNICA DR. EDUARDO                ║
║  API Server v1.0.0                     ║
║  ✅ Rodando na porta ${PORT}                   ║
║  Ambiente: ${process.env.NODE_ENV}             ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;