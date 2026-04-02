const { autenticarToken } = require('../middleware/auth');
const express = require('express');
const router = express.Router();

// ── Listar serviços ───────────────────────────────────────────────────────────
router.get('/', autenticarToken, async (req, res) => {
  try {
    const { clinic_id } = req.query;
    const params = ['true'];
    const conds = ['ativo = $1'];
    if (clinic_id) { params.push(clinic_id); conds.push(`clinic_id = $${params.length}`); }

    const result = await req.pool.query(
      `SELECT * FROM services WHERE ${conds.join(' AND ')} ORDER BY nome`,
      params
    );
    res.json({ sucesso: true, services: result.rows });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Criar serviço ─────────────────────────────────────────────────────────────
router.post('/', autenticarToken, async (req, res) => {
  try {
    const { clinic_id, nome, descricao, duracao_minutos, buffer_antes_minutos, buffer_depois_minutos, preco_base } = req.body;
    if (!clinic_id || !nome) return res.status(400).json({ erro: '❌ clinic_id e nome são obrigatórios' });

    const result = await req.pool.query(
      `INSERT INTO services (clinic_id, nome, descricao, duracao_minutos, buffer_antes_minutos, buffer_depois_minutos, preco_base)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [clinic_id, nome, descricao, duracao_minutos || 30, buffer_antes_minutos || 0, buffer_depois_minutos || 0, preco_base]
    );
    res.status(201).json({ sucesso: true, service: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Atualizar serviço ─────────────────────────────────────────────────────────
router.patch('/:id', autenticarToken, async (req, res) => {
  try {
    const { nome, descricao, duracao_minutos, buffer_antes_minutos, buffer_depois_minutos, preco_base, ativo } = req.body;
    const result = await req.pool.query(
      `UPDATE services SET
         nome = COALESCE($1, nome),
         descricao = COALESCE($2, descricao),
         duracao_minutos = COALESCE($3, duracao_minutos),
         buffer_antes_minutos = COALESCE($4, buffer_antes_minutos),
         buffer_depois_minutos = COALESCE($5, buffer_depois_minutos),
         preco_base = COALESCE($6, preco_base),
         ativo = COALESCE($7, ativo)
       WHERE id = $8 RETURNING *`,
      [nome, descricao, duracao_minutos, buffer_antes_minutos, buffer_depois_minutos, preco_base, ativo, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Serviço não encontrado' });
    res.json({ sucesso: true, service: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
