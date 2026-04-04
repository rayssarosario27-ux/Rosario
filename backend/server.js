require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const rateLimit = require('express-rate-limit');

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
// RATE LIMITING
// ==========================================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: '❌ Muitas tentativas. Tente novamente em 15 minutos.' }
});

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

app.post('/api/auth/registro-paciente', authLimiter, authRoutes.registroPaciente);
app.post('/api/auth/login-paciente', authLimiter, authRoutes.loginPaciente);
app.post('/api/auth/login-admin', authLimiter, authRoutes.loginAdmin);
app.post('/api/auth/verificar-email', authLimiter, authRoutes.verificarEmail);
app.post('/api/auth/esqueci-senha', authLimiter, authRoutes.esqueciSenha);
app.post('/api/auth/resetar-senha', authLimiter, authRoutes.resetarSenha);

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
  const status = err?.status || 500;
  const mensagem = err?.message || 'Erro desconhecido';
  const erro = status >= 500 ? 'Erro interno do servidor' : mensagem;
  res.status(status).json({ erro, mensagem });
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