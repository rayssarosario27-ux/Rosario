const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const API_URL = process.env.API_URL || 'http://localhost:5000';

// ─── Email transporter ───────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// ─── JWT helper ──────────────────────────────────────────────────────────────
function gerarToken(id, email, role) {
  return jwt.sign(
    { id, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
}

// ─── CPF digit validation ─────────────────────────────────────────────────────
function validarCPF(cpf) {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // all same digit

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  const d1 = ((sum * 10) % 11) % 10;
  if (d1 !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  const d2 = ((sum * 10) % 11) % 10;
  return d2 === parseInt(digits[10]);
}

// ─── HTML escape helper ───────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


function htmlEmail(titulo, corpoHtml) {
  return `
    <div style="font-family:Arial,sans-serif;background:#f0f4f8;padding:30px">
      <div style="max-width:520px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
        <div style="background:linear-gradient(135deg,#00c9b1 0%,#007a8a 100%);padding:32px 36px;text-align:center">
          <h2 style="color:white;margin:0;font-size:22px">🏥 Clínica Dr. Eduardo</h2>
          <p style="color:rgba(255,255,255,.8);margin:8px 0 0;font-size:14px">${titulo}</p>
        </div>
        <div style="padding:36px">${corpoHtml}</div>
        <div style="background:#f8f9fa;padding:16px 36px;text-align:center;font-size:11px;color:#aaa">
          © 2025 Clínica Dr. Eduardo — Excelência em Saúde
        </div>
      </div>
    </div>`;
}

// ─── REGISTRAR PACIENTE ───────────────────────────────────────────────────────
async function registroPaciente(req, res) {
  try {
    const {
      nome, cpf, email, celular, telefone,
      data_nascimento, genero,
      cep, logradouro, numero, complemento, sem_complemento, bairro, cidade, estado,
      convenio, carteirinha, senha
    } = req.body;

    if (!nome || !cpf || !email || !celular || !senha || !data_nascimento) {
      return res.status(400).json({ erro: '❌ Campos obrigatórios: nome, cpf, email, celular, data_nascimento, senha' });
    }

    if (!validarCPF(cpf)) {
      return res.status(400).json({ erro: '❌ CPF inválido' });
    }

    if (convenio && convenio.trim() !== '' && (!carteirinha || carteirinha.trim() === '')) {
      return res.status(400).json({ erro: '❌ Para atendimentos via convênio, a carteirinha é obrigatória.' });
    }

    const existe = await req.pool.query(
      'SELECT id FROM pacientes WHERE email = $1 OR cpf = $2',
      [email, cpf.replace(/\D/g, '')]
    );
    if (existe.rows.length > 0) {
      return res.status(400).json({ erro: '❌ Email ou CPF já cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 12);
    const codigoVerificacao = crypto.randomInt(0, 1000000).toString().padStart(6, '0');

    const result = await req.pool.query(
      `INSERT INTO pacientes
        (nome, cpf, email, celular, telefone, data_nascimento, genero,
         cep, logradouro, numero, complemento, sem_complemento, bairro, cidade, estado,
         convenio, carteirinha, senha_hash, codigo_verificacao, verificado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,false)
       RETURNING id, email, nome`,
      [
        nome, cpf.replace(/\D/g, ''), email, celular, telefone, data_nascimento, genero,
        cep, logradouro, numero,
        sem_complemento ? null : complemento,
        sem_complemento || false,
        bairro, cidade, estado,
        convenio || null,
        convenio ? carteirinha : null,
        senhaHash, codigoVerificacao
      ]
    );

    const { id: pacienteId } = result.rows[0];

    try {
      await transporter.sendMail({
        to: email,
        subject: '🔐 Confirme seu Email — Clínica Dr. Eduardo',
        html: htmlEmail('Confirmação de Cadastro', `
          <p style="color:#333;font-size:15px">Olá <strong>${escapeHtml(nome)}</strong>,</p>
          <div style="background:linear-gradient(135deg,#00c9b1,#007a8a);border-radius:12px;padding:24px;text-align:center;margin:20px 0">
            <span style="color:white;font-size:38px;font-weight:800;letter-spacing:10px">${codigoVerificacao}</span>
          </div>
          <p style="color:#999;font-size:12px;text-align:center">Este código expira em 24 horas.</p>
        `)
      });
    } catch (e) {
      console.error('⚠️ Erro ao enviar email:', e);
    }

    res.status(201).json({ sucesso: true, mensagem: '✅ Cadastro realizado! Verifique seu email', pacienteId, email });
  } catch (err) {
    console.error('Erro ao registrar:', err);
    res.status(500).json({ erro: err.message });
  }
}

// ─── VERIFICAR EMAIL ──────────────────────────────────────────────────────────
async function verificarEmail(req, res) {
  try {
    const { pacienteId, codigo } = req.body;
    const result = await req.pool.query('SELECT * FROM pacientes WHERE id = $1', [pacienteId]);
    if (result.rows.length === 0) return res.status(404).json({ erro: '❌ Paciente não encontrado' });

    const paciente = result.rows[0];
    if (paciente.codigo_verificacao !== codigo) return res.status(400).json({ erro: '❌ Código inválido' });

    await req.pool.query('UPDATE pacientes SET verificado = true, codigo_verificacao = NULL WHERE id = $1', [pacienteId]);
    const token = gerarToken(pacienteId, paciente.email, 'paciente');
    res.json({
      sucesso: true, mensagem: '✅ Email verificado!', token,
      paciente: { id: paciente.id, nome: paciente.nome, email: paciente.email, convenio: paciente.convenio }
    });
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

// ─── LOGIN PACIENTE ───────────────────────────────────────────────────────────
async function loginPaciente(req, res) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: '❌ Email e senha são obrigatórios' });

    const result = await req.pool.query(
      'SELECT * FROM pacientes WHERE email = $1 AND verificado = true',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ erro: '❌ Credenciais inválidas ou conta não verificada' });
    }
    const paciente = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, paciente.senha_hash);
    if (!senhaValida) return res.status(401).json({ erro: '❌ Credenciais inválidas' });

    await req.pool.query('UPDATE pacientes SET ultimo_acesso = NOW() WHERE id = $1', [paciente.id]);
    const token = gerarToken(paciente.id, paciente.email, 'paciente');
    res.json({
      sucesso: true, token,
      paciente: {
        id: paciente.id, nome: paciente.nome, email: paciente.email,
        convenio: paciente.convenio, celular: paciente.celular
      }
    });
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

// ─── LOGIN ADMIN ──────────────────────────────────────────────────────────────
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
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

// ─── ESQUECI MINHA SENHA ──────────────────────────────────────────────────────
async function esqueciSenha(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ erro: '❌ Email é obrigatório' });

    const result = await req.pool.query('SELECT * FROM pacientes WHERE email = $1 AND verificado = true', [email]);
    // Always return 200 (prevent email enumeration)
    if (result.rows.length === 0) {
      return res.json({ sucesso: true, mensagem: 'Se o email estiver cadastrado, você receberá um código em breve.' });
    }

    const paciente = result.rows[0];
    const codigo = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    await req.pool.query(
      'UPDATE pacientes SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [codigo, expiry, paciente.id]
    );

    try {
      await transporter.sendMail({
        to: email,
        subject: '🔐 Código de Recuperação de Senha — Clínica Dr. Eduardo',
        html: htmlEmail('Recuperação de Senha', `
          <p style="color:#333;font-size:15px">Olá <strong>${escapeHtml(paciente.nome)}</strong>,</p>
          <p style="color:#555">Recebemos uma solicitação para redefinir sua senha. Use o código abaixo:</p>
          <div style="background:linear-gradient(135deg,#00c9b1,#007a8a);border-radius:12px;padding:24px;text-align:center;margin:20px 0">
            <span style="color:white;font-size:38px;font-weight:800;letter-spacing:10px">${codigo}</span>
          </div>
          <p style="color:#e55;font-size:13px;text-align:center">⚠️ Este código expira em 30 minutos.</p>
          <p style="color:#999;font-size:12px;text-align:center">Se não foi você, ignore este email. Sua senha não será alterada.</p>
        `)
      });
    } catch (e) {
      console.error('⚠️ Erro ao enviar email de recuperação:', e);
    }

    res.json({ sucesso: true, mensagem: 'Se o email estiver cadastrado, você receberá um código em breve.', pacienteId: paciente.id });
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

// ─── RESETAR SENHA ────────────────────────────────────────────────────────────
async function resetarSenha(req, res) {
  try {
    const { pacienteId, codigo, novaSenha, confirmarSenha } = req.body;
    if (!pacienteId || !codigo || !novaSenha) return res.status(400).json({ erro: '❌ Dados incompletos' });
    if (novaSenha !== confirmarSenha) return res.status(400).json({ erro: '❌ As senhas não conferem' });
    if (novaSenha.length < 8) return res.status(400).json({ erro: '❌ A senha deve ter pelo menos 8 caracteres' });

    const result = await req.pool.query('SELECT * FROM pacientes WHERE id = $1', [pacienteId]);
    if (result.rows.length === 0) return res.status(404).json({ erro: '❌ Paciente não encontrado' });

    const paciente = result.rows[0];
    if (paciente.reset_token !== codigo) return res.status(400).json({ erro: '❌ Código inválido' });
    if (!paciente.reset_token_expiry || new Date() > new Date(paciente.reset_token_expiry)) {
      return res.status(400).json({ erro: '❌ Código expirado. Solicite um novo.' });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 12);
    await req.pool.query(
      'UPDATE pacientes SET senha_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [senhaHash, pacienteId]
    );

    res.json({ sucesso: true, mensagem: '✅ Senha redefinida com sucesso! Faça login com sua nova senha.' });
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

// ─── OBTER PERFIL ─────────────────────────────────────────────────────────────
async function obterPerfil(req, res) {
  try {
    const result = await req.pool.query(
      `SELECT id, nome, cpf, email, celular, telefone, data_nascimento, genero,
              cep, logradouro, numero, complemento, sem_complemento, bairro, cidade, estado,
              convenio, carteirinha, biometria_atualizada_em, verificado, criado_em, ultimo_acesso
       FROM pacientes WHERE id = $1`,
      [req.usuario.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: '❌ Paciente não encontrado' });
    res.json({ sucesso: true, paciente: result.rows[0] });
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

// ─── ATUALIZAR PERFIL ─────────────────────────────────────────────────────────
async function atualizarPerfil(req, res) {
  try {
    const {
      nome, celular, telefone, genero,
      cep, logradouro, numero, complemento, sem_complemento, bairro, cidade, estado,
      convenio, carteirinha
    } = req.body;

    const result = await req.pool.query(
      `UPDATE pacientes SET
         nome = COALESCE($1, nome),
         celular = COALESCE($2, celular),
         telefone = COALESCE($3, telefone),
         genero = COALESCE($4, genero),
         cep = COALESCE($5, cep),
         logradouro = COALESCE($6, logradouro),
         numero = COALESCE($7, numero),
         complemento = $8,
         sem_complemento = COALESCE($9, sem_complemento),
         bairro = COALESCE($10, bairro),
         cidade = COALESCE($11, cidade),
         estado = COALESCE($12, estado),
         convenio = COALESCE($13, convenio),
         carteirinha = COALESCE($14, carteirinha)
       WHERE id = $15 RETURNING id, nome, email, celular, convenio`,
      [nome, celular, telefone, genero, cep, logradouro, numero,
       sem_complemento ? null : complemento,
       sem_complemento,
       bairro, cidade, estado, convenio, carteirinha, req.usuario.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ erro: '❌ Paciente não encontrado' });
    res.json({ sucesso: true, paciente: result.rows[0] });
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

// ─── ATUALIZAR BIOMETRIA ──────────────────────────────────────────────────────
async function atualizarBiometria(req, res) {
  try {
    const { face_data } = req.body;
    if (!face_data) return res.status(400).json({ erro: '❌ Dados de biometria são obrigatórios' });

    // Limit size: base64 of ~200KB max
    if (face_data.length > 300000) {
      return res.status(400).json({ erro: '❌ Imagem muito grande. Use uma captura menor.' });
    }

    await req.pool.query(
      'UPDATE pacientes SET biometria_face_data = $1, biometria_atualizada_em = NOW() WHERE id = $2',
      [face_data, req.usuario.id]
    );

    res.json({ sucesso: true, mensagem: '✅ Biometria facial atualizada com sucesso!', atualizada_em: new Date().toISOString() });
  } catch (err) { res.status(500).json({ erro: err.message }); }
}

module.exports = {
  registroPaciente,
  loginPaciente,
  loginAdmin,
  verificarEmail,
  esqueciSenha,
  resetarSenha,
  obterPerfil,
  atualizarPerfil,
  atualizarBiometria
};
