const { autenticarToken, autenticarAdmin } = require('../middleware/auth');
const express = require('express');
const router = express.Router();

// ── Listar regras ─────────────────────────────────────────────────────────────
router.get('/rules', autenticarToken, async (req, res) => {
  try {
    const { clinic_id } = req.query;
    const params = [];
    const conds = [];
    if (clinic_id) { params.push(clinic_id); conds.push(`clinic_id = $${params.length}`); }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

    const result = await req.pool.query(
      `SELECT * FROM automation_rules ${where} ORDER BY criado_em DESC`,
      params
    );
    res.json({ sucesso: true, regras: result.rows });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Criar regra ───────────────────────────────────────────────────────────────
router.post('/rules', autenticarToken, async (req, res) => {
  try {
    const { clinic_id, nome, gatilho, condicoes, acao, template_msg } = req.body;
    if (!clinic_id || !nome || !gatilho || !acao) {
      return res.status(400).json({ erro: '❌ clinic_id, nome, gatilho e acao são obrigatórios' });
    }

    const result = await req.pool.query(
      `INSERT INTO automation_rules (clinic_id, nome, gatilho, condicoes, acao, template_msg)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [clinic_id, nome, gatilho, JSON.stringify(condicoes || {}), acao, template_msg]
    );
    res.status(201).json({ sucesso: true, regra: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Atualizar regra ───────────────────────────────────────────────────────────
router.patch('/rules/:id', autenticarToken, async (req, res) => {
  try {
    const { nome, condicoes, acao, template_msg, ativo } = req.body;
    const result = await req.pool.query(
      `UPDATE automation_rules SET
         nome = COALESCE($1, nome),
         condicoes = COALESCE($2, condicoes),
         acao = COALESCE($3, acao),
         template_msg = COALESCE($4, template_msg),
         ativo = COALESCE($5, ativo)
       WHERE id = $6 RETURNING *`,
      [nome, condicoes ? JSON.stringify(condicoes) : null, acao, template_msg, ativo, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Regra não encontrada' });
    res.json({ sucesso: true, regra: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Listar jobs (histórico de execuções) ──────────────────────────────────────
router.get('/jobs', autenticarToken, async (req, res) => {
  try {
    const { clinic_id, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conds = [];

    if (clinic_id) { params.push(clinic_id); conds.push(`j.clinic_id = $${params.length}`); }
    if (status)    { params.push(status);    conds.push(`j.status = $${params.length}`); }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    params.push(limit, offset);

    const result = await req.pool.query(
      `SELECT j.*, r.nome AS regra_nome, l.nome AS lead_nome
       FROM automation_jobs j
       LEFT JOIN automation_rules r ON r.id = j.rule_id
       LEFT JOIN leads l ON l.id = j.lead_id
       ${where}
       ORDER BY j.criado_em DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ sucesso: true, jobs: result.rows });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Agendar job manualmente ───────────────────────────────────────────────────
router.post('/jobs', autenticarToken, async (req, res) => {
  try {
    const { clinic_id, rule_id, lead_id, appointment_id, agendado_para } = req.body;
    if (!clinic_id) return res.status(400).json({ erro: '❌ clinic_id é obrigatório' });

    const result = await req.pool.query(
      `INSERT INTO automation_jobs (clinic_id, rule_id, lead_id, appointment_id, agendado_para)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [clinic_id, rule_id, lead_id, appointment_id, agendado_para]
    );
    res.status(201).json({ sucesso: true, job: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
