const { autenticarToken } = require('../middleware/auth');
const express = require('express');
const router = express.Router();

// ── Listar conversas ──────────────────────────────────────────────────────────
router.get('/', autenticarToken, async (req, res) => {
  try {
    const { lead_id, estado, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conds = [];

    if (lead_id) { params.push(lead_id); conds.push(`c.lead_id = $${params.length}`); }
    if (estado)  { params.push(estado);  conds.push(`c.estado = $${params.length}`); }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    params.push(limit, offset);

    const result = await req.pool.query(
      `SELECT c.*, l.nome AS lead_nome, l.telefone AS lead_telefone
       FROM conversations c
       JOIN leads l ON l.id = c.lead_id
       ${where}
       ORDER BY c.ultimo_contato DESC NULLS LAST
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({ sucesso: true, conversas: result.rows });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Criar ou buscar conversa ativa do lead ────────────────────────────────────
router.post('/obter-ou-criar', autenticarToken, async (req, res) => {
  try {
    const { lead_id, canal = 'whatsapp' } = req.body;

    if (!lead_id) return res.status(400).json({ erro: '❌ lead_id é obrigatório' });

    let result = await req.pool.query(
      `SELECT * FROM conversations WHERE lead_id = $1 AND estado != 'encerrada' ORDER BY criado_em DESC LIMIT 1`,
      [lead_id]
    );

    if (result.rows.length > 0) {
      return res.json({ sucesso: true, conversa: result.rows[0], nova: false });
    }

    result = await req.pool.query(
      `INSERT INTO conversations (lead_id, canal, estado, ultimo_contato)
       VALUES ($1, $2, 'aguardando', NOW()) RETURNING *`,
      [lead_id, canal]
    );

    res.status(201).json({ sucesso: true, conversa: result.rows[0], nova: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Atualizar estado da conversa ──────────────────────────────────────────────
router.patch('/:id/estado', autenticarToken, async (req, res) => {
  try {
    const { estado, atribuido_a } = req.body;
    const result = await req.pool.query(
      `UPDATE conversations SET estado = COALESCE($1, estado),
         atribuido_a = COALESCE($2, atribuido_a),
         ultimo_contato = NOW()
       WHERE id = $3 RETURNING *`,
      [estado, atribuido_a, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Conversa não encontrada' });
    res.json({ sucesso: true, conversa: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Listar mensagens de uma conversa ─────────────────────────────────────────
router.get('/:id/messages', autenticarToken, async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;
    const result = await req.pool.query(
      `SELECT * FROM messages WHERE conversation_id = $1
       ORDER BY criado_em ASC LIMIT $2 OFFSET $3`,
      [req.params.id, limit, offset]
    );
    res.json({ sucesso: true, mensagens: result.rows });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Enviar/registrar mensagem ─────────────────────────────────────────────────
router.post('/:id/messages', autenticarToken, async (req, res) => {
  try {
    const { direcao, tipo = 'texto', conteudo, url_midia, enviado_por = 'usuario' } = req.body;

    if (!direcao || !conteudo) {
      return res.status(400).json({ erro: '❌ direcao e conteudo são obrigatórios' });
    }

    const result = await req.pool.query(
      `INSERT INTO messages (conversation_id, direcao, tipo, conteudo, url_midia, enviado_por)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.params.id, direcao, tipo, conteudo, url_midia, enviado_por]
    );

    await req.pool.query(
      'UPDATE conversations SET ultimo_contato = NOW() WHERE id = $1',
      [req.params.id]
    );

    res.status(201).json({ sucesso: true, mensagem: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
