const { autenticarToken } = require('../middleware/auth');
const express = require('express');
const router = express.Router();

// ── Listar leads ──────────────────────────────────────────────────────────────
router.get('/', autenticarToken, async (req, res) => {
  try {
    const { clinic_id, unit_id, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conds = [];

    if (clinic_id) { params.push(clinic_id); conds.push(`l.clinic_id = $${params.length}`); }
    if (unit_id)   { params.push(unit_id);   conds.push(`l.unit_id = $${params.length}`); }
    if (status)    { params.push(status);    conds.push(`l.status = $${params.length}`); }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    params.push(limit, offset);

    const result = await req.pool.query(
      `SELECT l.*, u.nome AS unidade_nome,
              COALESCE(json_agg(t.nome) FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
       FROM leads l
       LEFT JOIN units u ON u.id = l.unit_id
       LEFT JOIN lead_tags lt ON lt.lead_id = l.id
       LEFT JOIN tags t ON t.id = lt.tag_id
       ${where}
       GROUP BY l.id, u.nome
       ORDER BY l.criado_em DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({ sucesso: true, leads: result.rows, total: result.rowCount });
  } catch (err) {
    console.error('Erro ao listar leads:', err);
    res.status(500).json({ erro: err.message });
  }
});

// ── Buscar lead por telefone ──────────────────────────────────────────────────
router.get('/telefone/:telefone', autenticarToken, async (req, res) => {
  try {
    const result = await req.pool.query(
      'SELECT * FROM leads WHERE telefone = $1 ORDER BY criado_em DESC LIMIT 1',
      [req.params.telefone]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Lead não encontrado' });
    res.json({ sucesso: true, lead: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Criar lead ────────────────────────────────────────────────────────────────
router.post('/', autenticarToken, async (req, res) => {
  try {
    const { clinic_id, unit_id, nome, telefone, email, canal, fonte, gclid, fbclid, observacoes } = req.body;

    if (!clinic_id || !telefone) {
      return res.status(400).json({ erro: '❌ clinic_id e telefone são obrigatórios' });
    }

    const result = await req.pool.query(
      `INSERT INTO leads (clinic_id, unit_id, nome, telefone, email, canal, fonte, gclid, fbclid, observacoes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [clinic_id, unit_id, nome, telefone, email, canal, fonte, gclid, fbclid, observacoes]
    );

    const lead = result.rows[0];

    await req.pool.query(
      `INSERT INTO lead_status_history (lead_id, status_de, status_para, ator)
       VALUES ($1, NULL, 'novo', 'sistema')`,
      [lead.id]
    );

    res.status(201).json({ sucesso: true, lead });
  } catch (err) {
    console.error('Erro ao criar lead:', err);
    res.status(500).json({ erro: err.message });
  }
});

// ── Atualizar lead ────────────────────────────────────────────────────────────
router.patch('/:id', autenticarToken, async (req, res) => {
  try {
    const { nome, telefone, email, unit_id, observacoes, atribuido_a } = req.body;
    const result = await req.pool.query(
      `UPDATE leads SET
         nome = COALESCE($1, nome),
         telefone = COALESCE($2, telefone),
         email = COALESCE($3, email),
         unit_id = COALESCE($4, unit_id),
         observacoes = COALESCE($5, observacoes),
         atribuido_a = COALESCE($6, atribuido_a),
         atualizado_em = NOW()
       WHERE id = $7 RETURNING *`,
      [nome, telefone, email, unit_id, observacoes, atribuido_a, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Lead não encontrado' });
    res.json({ sucesso: true, lead: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Mudar status ──────────────────────────────────────────────────────────────
router.patch('/:id/status', autenticarToken, async (req, res) => {
  try {
    const { status, ator = 'humano', motivo } = req.body;
    const leadId = req.params.id;

    const leadResult = await req.pool.query('SELECT * FROM leads WHERE id = $1', [leadId]);
    if (leadResult.rows.length === 0) return res.status(404).json({ erro: 'Lead não encontrado' });

    const lead = leadResult.rows[0];
    const statusAnterior = lead.status;

    await req.pool.query(
      'UPDATE leads SET status = $1, atualizado_em = NOW() WHERE id = $2',
      [status, leadId]
    );

    await req.pool.query(
      `INSERT INTO lead_status_history (lead_id, status_de, status_para, ator, usuario_id, motivo)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [leadId, statusAnterior, status, ator, req.usuario?.id || null, motivo]
    );

    res.json({ sucesso: true, status_anterior: statusAnterior, status_novo: status });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Histórico de status ───────────────────────────────────────────────────────
router.get('/:id/historico', autenticarToken, async (req, res) => {
  try {
    const result = await req.pool.query(
      `SELECT h.*, u.nome AS usuario_nome
       FROM lead_status_history h
       LEFT JOIN usuarios u ON u.id = h.usuario_id
       WHERE h.lead_id = $1 ORDER BY h.criado_em ASC`,
      [req.params.id]
    );
    res.json({ sucesso: true, historico: result.rows });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Kanban / funil por status ─────────────────────────────────────────────────
router.get('/funil/resumo', autenticarToken, async (req, res) => {
  try {
    const { clinic_id, unit_id } = req.query;
    const params = [];
    const conds = [];
    if (clinic_id) { params.push(clinic_id); conds.push(`clinic_id = $${params.length}`); }
    if (unit_id)   { params.push(unit_id);   conds.push(`unit_id = $${params.length}`); }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

    const result = await req.pool.query(
      `SELECT status, COUNT(*) AS total FROM leads ${where} GROUP BY status ORDER BY total DESC`,
      params
    );
    res.json({ sucesso: true, funil: result.rows });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
