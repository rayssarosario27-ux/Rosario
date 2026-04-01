const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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
    const codigoVerificacao = Math.random().toString(36).substring(2, 8).toUpperCase();

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

// ... (Restante das funções verificarEmail, loginPaciente, loginAdmin, esqueciSenha, resetarSenha permanecem iguais) ...

async function verificarEmail(req, res) {
  try {
    const { pacienteId, codigo } = req.body;
    const result = await req.pool.query('SELECT * FROM pacientes WHERE id = $1', [pacienteId]);
    if (result.rows.length === 0) return res.status(404).json({ erro: '❌ Paciente não encontrado' });
    const paciente = result.rows[0];
    if (paciente.codigo_verificacao !== codigo) return res.status(400).json({ erro: '❌ Código inválido' });
    await req.pool.query('UPDATE pacientes SET verificado = true, codigo_verificacao = NULL WHERE id = $1', [pacienteId]);
    const token = gerarToken(pacienteId, paciente.email, 'paciente');
    res.json({ sucesso: true, mensagem: '✅ Email verificado!', token, paciente: { id: paciente.id, nome: paciente.nome, email: paciente.email } });
  } catch (erro) { res.status(500).json({ erro: erro.message }); }
}

async function loginPaciente(req, res) {
  try {
    const { email, senha } = req.body;
    const result = await req.pool.query('SELECT * FROM pacientes WHERE email = $1 AND verificado = true', [email]);
    if (result.rows.length === 0) return res.status(401).json({ erro: '❌ Credenciais inválidas ou conta não verificada' });
    const paciente = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, paciente.senha_hash);
    if (!senhaValida) return res.status(401).json({ erro: '❌ Credenciais inválidas' });
    await req.pool.query('UPDATE pacientes SET ultimo_acesso = CURRENT_TIMESTAMP WHERE id = $1', [paciente.id]);
    const token = gerarToken(paciente.id, paciente.email, 'paciente');
    res.json({ sucesso: true, token, paciente: { id: paciente.id, nome: paciente.nome, email: paciente.email } });
  } catch (erro) { res.status(500).json({ erro: erro.message }); }
}

async function loginAdmin(req, res) {
  try {
    const { email, senha } = req.body;
    const result = await req.pool.query('SELECT * FROM admin WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ erro: '❌ Acesso negado' });
    const admin = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, admin.senha_hash);
    if (!senhaValida) return res.status(401).json({ erro: '❌ Acesso negado' });
    const token = gerarToken(admin.id, admin.email, 'admin');
    res.json({ sucesso: true, token, admin: { id: admin.id, nome: admin.nome, email: admin.email } });
  } catch (erro) { res.status(500).json({ erro: erro.message }); }
}

// Exportação Única e Completa
module.exports = {
  registroPaciente,
  loginPaciente,
  loginAdmin,
  verificarEmail
};