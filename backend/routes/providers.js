const { autenticarToken } = require('../middleware/auth');
const express = require('express');
const router = express.Router();

// ── Listar providers ──────────────────────────────────────────────────────────
router.get('/', autenticarToken, async (req, res) => {
  try {
    const { clinic_id, unit_id } = req.query;
    const params = [];
    const conds = ['p.ativo = true'];

    if (clinic_id) { params.push(clinic_id); conds.push(`p.clinic_id = $${params.length}`); }
    if (unit_id)   { params.push(unit_id);   conds.push(`pu.unit_id = $${params.length}`); }

    const joinUnit = unit_id ? 'JOIN provider_unit pu ON pu.provider_id = p.id' : '';

    const result = await req.pool.query(
      `SELECT p.* FROM providers p ${joinUnit} WHERE ${conds.join(' AND ')} ORDER BY p.nome`,
      params
    );
    res.json({ sucesso: true, providers: result.rows });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Criar provider ────────────────────────────────────────────────────────────
router.post('/', autenticarToken, async (req, res) => {
  try {
    const { clinic_id, nome, especialidade, crm, email, telefone } = req.body;
    if (!clinic_id || !nome) return res.status(400).json({ erro: '❌ clinic_id e nome são obrigatórios' });

    const result = await req.pool.query(
      `INSERT INTO providers (clinic_id, nome, especialidade, crm, email, telefone)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [clinic_id, nome, especialidade, crm, email, telefone]
    );
    res.status(201).json({ sucesso: true, provider: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Atualizar provider ────────────────────────────────────────────────────────
router.patch('/:id', autenticarToken, async (req, res) => {
  try {
    const { nome, especialidade, crm, email, telefone, ativo } = req.body;
    const result = await req.pool.query(
      `UPDATE providers SET
         nome = COALESCE($1, nome),
         especialidade = COALESCE($2, especialidade),
         crm = COALESCE($3, crm),
         email = COALESCE($4, email),
         telefone = COALESCE($5, telefone),
         ativo = COALESCE($6, ativo)
       WHERE id = $7 RETURNING *`,
      [nome, especialidade, crm, email, telefone, ativo, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Provider não encontrado' });
    res.json({ sucesso: true, provider: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Vincular provider a unidade ───────────────────────────────────────────────
router.post('/:id/units', autenticarToken, async (req, res) => {
  try {
    const { unit_id } = req.body;
    await req.pool.query(
      'INSERT INTO provider_unit (provider_id, unit_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [req.params.id, unit_id]
    );
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Regras de disponibilidade ─────────────────────────────────────────────────
router.get('/:id/availability-rules', autenticarToken, async (req, res) => {
  try {
    const result = await req.pool.query(
      `SELECT * FROM provider_availability_rules WHERE provider_id = $1 AND ativo = true ORDER BY dia_semana, hora_inicio`,
      [req.params.id]
    );
    res.json({ sucesso: true, regras: result.rows });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.post('/:id/availability-rules', autenticarToken, async (req, res) => {
  try {
    const { unit_id, dia_semana, hora_inicio, hora_fim } = req.body;
    if (dia_semana === undefined || !hora_inicio || !hora_fim) {
      return res.status(400).json({ erro: '❌ dia_semana, hora_inicio e hora_fim são obrigatórios' });
    }
    const result = await req.pool.query(
      `INSERT INTO provider_availability_rules (provider_id, unit_id, dia_semana, hora_inicio, hora_fim)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.params.id, unit_id, dia_semana, hora_inicio, hora_fim]
    );
    res.status(201).json({ sucesso: true, regra: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Folgas / bloqueios ────────────────────────────────────────────────────────
router.get('/:id/time-off', autenticarToken, async (req, res) => {
  try {
    const result = await req.pool.query(
      'SELECT * FROM provider_time_off WHERE provider_id = $1 ORDER BY inicio',
      [req.params.id]
    );
    res.json({ sucesso: true, folgas: result.rows });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.post('/:id/time-off', autenticarToken, async (req, res) => {
  try {
    const { unit_id, inicio, fim, motivo } = req.body;
    if (!inicio || !fim) return res.status(400).json({ erro: '❌ inicio e fim são obrigatórios' });
    const result = await req.pool.query(
      'INSERT INTO provider_time_off (provider_id, unit_id, inicio, fim, motivo) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.params.id, unit_id, inicio, fim, motivo]
    );
    res.status(201).json({ sucesso: true, folga: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
