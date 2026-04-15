const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configurar email
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Gerar token
function gerarToken(id, email, role) {
  return jwt.sign(
    { id, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
}

// ===== REGISTRAR PACIENTE =====
async function registroPaciente(req, res) {
  try {
    // Adicionado 'carteirinha' na desestruturação
    const { nome, cpf, email, telefone, data_nascimento, genero, convenio, carteirinha, senha } = req.body;

    // 1. Validações de Campos Obrigatórios (CPF incluído)
    if (!nome || !cpf || !email || !telefone || !senha) {
      return res.status(400).json({ 
        erro: '❌ Campos obrigatórios: nome, cpf, email, telefone, senha' 
      });
    }

    // 2. Lógica da Carteirinha: Se preencher convênio, a carteirinha vira obrigatória
    if (convenio && convenio.trim() !== '' && (!carteirinha || carteirinha.trim() === '')) {
      return res.status(400).json({ 
        erro: '❌ Para atendimentos via convênio, o número da carteirinha é obrigatório.' 
      });
    }

    // Verificar se já existe (CPF ou Email)
    const existe = await req.pool.query(
      'SELECT id FROM pacientes WHERE email = $1 OR cpf = $2',
      [email, cpf]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ 
        erro: '❌ Email ou CPF já cadastrado' 
      });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);
    const codigoVerificacao = crypto.randomInt(0, 1000000).toString().padStart(6, '0');

    // 3. Criar paciente (Incluindo a coluna carteirinha)
    const result = await req.pool.query(
      `INSERT INTO pacientes 
       (nome, cpf, email, telefone, data_nascimento, genero, convenio, carteirinha, senha_hash, codigo_verificacao, verificado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false)
       RETURNING id, email, nome`,
      [nome, cpf, email, telefone, data_nascimento, genero, convenio, convenio ? carteirinha : null, senhaHash, codigoVerificacao]
    );

    const pacienteId = result.rows[0].id;

    // Enviar email de verificação (Mantido seu design elegante Verde-Água)
    try {
      await transporter.sendMail({
        to: email,
        subject: '🔐 Confirme seu Email - Clínica Dr. Eduardo',
        html: `
          <div style="font-family: Arial; background: linear-gradient(135deg, #00ced1 0%, #008b8b 100%); padding: 40px; border-radius: 15px;">
            <h2 style="color: white; text-align: center;">✉️ Confirme seu Email</h2>
            <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
              <p style="color: #333; font-size: 16px;">Olá <strong>${nome}</strong>,</p>
              <p style="color: #666;">Seu código de verificação para a Clínica Dr. Eduardo é:</p>
              <div style="background: linear-gradient(135deg, #00ced1, #008b8b); padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h1 style="color: white; margin: 0; font-size: 36px;">${codigoVerificacao}</h1>
              </div>
              <p style="color: #999; font-size: 12px;">Este código expira em 24 horas</p>
            </div>
          </div>
        `
      });
    } catch (erro) {
      console.error('⚠️ Erro ao enviar email:', erro);
    }

    res.status(201).json({
      sucesso: true,
      mensagem: '✅ Cadastro realizado! Verifique seu email',
      pacienteId,
      email
    });
  } catch (erro) {
    console.error('Erro ao registrar:', erro);
    res.status(500).json({ erro: erro.message });
  }
}

// ====== BIOMETRIA FACIAL ======
// Salvar biometria facial do paciente
async function salvarBiometriaFacial(req, res) {
  const { pacienteId, facial_biometria } = req.body;
  if (!pacienteId || !facial_biometria) {
    return res.status(400).json({ erro: 'Paciente e biometria são obrigatórios.' });
  }
  try {
    await req.pool.query(
      'UPDATE pacientes SET facial_biometria = $1, facial_ultima_atualizacao = NOW() WHERE id = $2',
      [Buffer.from(facial_biometria, 'base64'), pacienteId]
    );
    res.json({ sucesso: true, mensagem: 'Biometria facial salva.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao salvar biometria.' });
  }
}

// Buscar paciente por biometria facial (simples, por igualdade exata)
async function buscarPorBiometria(req, res) {
  const { facial_biometria } = req.body;
  if (!facial_biometria) return res.status(400).json({ erro: 'Biometria obrigatória.' });
  try {
    const result = await req.pool.query(
      'SELECT * FROM pacientes WHERE facial_biometria = $1',
      [Buffer.from(facial_biometria, 'base64')]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Paciente não encontrado.' });
    res.json({ paciente: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar paciente.' });
  }
}

// Registrar log de reconhecimento facial
async function registrarFacialLog(req, res) {
  const { pacienteId, local, motivo_consulta } = req.body;
  if (!pacienteId) return res.status(400).json({ erro: 'Paciente obrigatório.' });
  try {
    await req.pool.query(
      'INSERT INTO facial_logs (paciente_id, local, motivo_consulta) VALUES ($1, $2, $3)',
      [pacienteId, local || null, motivo_consulta || null]
    );
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao registrar log.' });
  }
}

// ====== GERENCIAMENTO DE USUÁRIOS ADMIN ======
// Criar usuário admin (TI)
async function criarUsuarioAdmin(req, res) {
  const { nome, email, senha, tipo } = req.body;
  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, email, senha, tipo' });
  }
  try {
    const existe = await req.pool.query('SELECT id FROM admins WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }
    const senhaHash = await bcrypt.hash(senha, 10);
    await req.pool.query(
      'INSERT INTO admins (nome, email, senha, tipo) VALUES ($1, $2, $3, $4)',
      [nome, email, senhaHash, tipo]
    );
    res.json({ sucesso: true, mensagem: 'Usuário admin criado.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar admin.' });
  }
}

// Exportação Única e Completa
module.exports = {
  registroPaciente,
  loginPaciente,
  loginAdmin,
  verificarEmail,
  salvarBiometriaFacial,
  buscarPorBiometria,
  registrarFacialLog,
  criarUsuarioAdmin
};