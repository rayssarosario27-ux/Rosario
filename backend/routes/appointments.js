const { autenticarToken } = require('../middleware/auth');
const express = require('express');
const router = express.Router();

// ── Listar agendamentos ───────────────────────────────────────────────────────
router.get('/', autenticarToken, async (req, res) => {
  try {
    const { unit_id, provider_id, lead_id, status, date_from, date_to, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conds = [];

    if (unit_id)    { params.push(unit_id);    conds.push(`a.unit_id = $${params.length}`); }
    if (provider_id){ params.push(provider_id); conds.push(`a.provider_id = $${params.length}`); }
    if (lead_id)    { params.push(lead_id);     conds.push(`a.lead_id = $${params.length}`); }
    if (status)     { params.push(status);      conds.push(`a.status = $${params.length}`); }
    if (date_from)  { params.push(date_from);   conds.push(`a.start_at >= $${params.length}`); }
    if (date_to)    {
      const dateFimFiltro = new Date(date_to);
      dateFimFiltro.setHours(23, 59, 59, 999);
      params.push(dateFimFiltro.toISOString());
      conds.push(`a.start_at <= $${params.length}`);
    }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    params.push(limit, offset);

    const result = await req.pool.query(
      `SELECT a.*,
              p.nome AS provider_nome,
              s.nome AS service_nome,
              s.duracao_minutos,
              u.nome AS unit_nome,
              l.nome AS lead_nome,
              l.telefone AS lead_telefone
       FROM appointments a
       JOIN providers p ON p.id = a.provider_id
       JOIN services  s ON s.id = a.service_id
       JOIN units     u ON u.id = a.unit_id
       LEFT JOIN leads l ON l.id = a.lead_id
       ${where}
       ORDER BY a.start_at ASC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({ sucesso: true, agendamentos: result.rows });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Criar agendamento (com verificação de conflito) ───────────────────────────
router.post('/', autenticarToken, async (req, res) => {
  try {
    const {
      clinic_id, unit_id, provider_id, service_id, lead_id, paciente_id,
      start_at, criado_por = 'humano', observacoes
    } = req.body;

    if (!clinic_id || !unit_id || !provider_id || !service_id || !start_at) {
      return res.status(400).json({
        erro: '❌ clinic_id, unit_id, provider_id, service_id e start_at são obrigatórios'
      });
    }

    // Buscar serviço para calcular fim e buffers
    const svcResult = await req.pool.query('SELECT * FROM services WHERE id = $1', [service_id]);
    if (svcResult.rows.length === 0) return res.status(404).json({ erro: 'Serviço não encontrado' });
    const svc = svcResult.rows[0];

    const startDate = new Date(start_at);
    const endDate = new Date(startDate.getTime() + svc.duracao_minutos * 60000);
    const occupiedStart = new Date(startDate.getTime() - svc.buffer_antes_minutos * 60000);
    const occupiedEnd   = new Date(endDate.getTime() + svc.buffer_depois_minutos * 60000);

    // Verificar conflito usando transação
    const client = await req.pool.connect();
    try {
      await client.query('BEGIN');

      const conflito = await client.query(
        `SELECT id FROM appointments
         WHERE provider_id = $1
           AND status NOT IN ('cancelado')
           AND start_at < $2 AND end_at > $3
         FOR UPDATE`,
        [provider_id, occupiedEnd.toISOString(), occupiedStart.toISOString()]
      );

      if (conflito.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          erro: '❌ Conflito de horário: o profissional já tem agendamento nesse período'
        });
      }

      const result = await client.query(
        `INSERT INTO appointments
           (clinic_id, unit_id, provider_id, service_id, lead_id, paciente_id,
            start_at, end_at, status, criado_por, observacoes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'reservado',$9,$10) RETURNING *`,
        [clinic_id, unit_id, provider_id, service_id, lead_id, paciente_id,
         startDate.toISOString(), endDate.toISOString(), criado_por, observacoes]
      );

      await client.query('COMMIT');

      // Atualizar status do lead para "agendado"
      if (lead_id) {
        const leadRes = await req.pool.query('SELECT status FROM leads WHERE id = $1', [lead_id]);
        if (leadRes.rows.length > 0) {
          const statusAtual = leadRes.rows[0].status;
          await req.pool.query('UPDATE leads SET status = $1, atualizado_em = NOW() WHERE id = $2', ['agendado', lead_id]);
          await req.pool.query(
            `INSERT INTO lead_status_history (lead_id, status_de, status_para, ator)
             VALUES ($1,$2,'agendado',$3)`,
            [lead_id, statusAtual, criado_por === 'ia' ? 'ia' : 'sistema']
          );
        }
      }

      res.status(201).json({ sucesso: true, agendamento: result.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Erro ao criar agendamento:', err);
    res.status(500).json({ erro: err.message });
  }
});

// ── Confirmar agendamento ─────────────────────────────────────────────────────
router.patch('/:id/confirm', autenticarToken, async (req, res) => {
  try {
    const result = await req.pool.query(
      `UPDATE appointments SET status = 'confirmado', atualizado_em = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    res.json({ sucesso: true, agendamento: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Cancelar agendamento ──────────────────────────────────────────────────────
router.patch('/:id/cancel', autenticarToken, async (req, res) => {
  try {
    const result = await req.pool.query(
      `UPDATE appointments SET status = 'cancelado', atualizado_em = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    res.json({ sucesso: true, agendamento: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Reagendar ─────────────────────────────────────────────────────────────────
router.patch('/:id/reschedule', autenticarToken, async (req, res) => {
  try {
    const { start_at } = req.body;
    if (!start_at) return res.status(400).json({ erro: '❌ start_at é obrigatório' });

    const apptResult = await req.pool.query('SELECT * FROM appointments WHERE id = $1', [req.params.id]);
    if (apptResult.rows.length === 0) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    const appt = apptResult.rows[0];

    const svcResult = await req.pool.query('SELECT * FROM services WHERE id = $1', [appt.service_id]);
    const svc = svcResult.rows[0];

    const startDate = new Date(start_at);
    const endDate = new Date(startDate.getTime() + svc.duracao_minutos * 60000);

    // Verificar conflito (excluindo o próprio agendamento)
    const conflito = await req.pool.query(
      `SELECT id FROM appointments
       WHERE provider_id = $1
         AND id != $2
         AND status NOT IN ('cancelado')
         AND start_at < $3 AND end_at > $4`,
      [appt.provider_id, appt.id, endDate.toISOString(), startDate.toISOString()]
    );
    if (conflito.rows.length > 0) {
      return res.status(409).json({ erro: '❌ Conflito de horário nesse período' });
    }

    const result = await req.pool.query(
      `UPDATE appointments SET start_at = $1, end_at = $2, status = 'reservado', atualizado_em = NOW()
       WHERE id = $3 RETURNING *`,
      [startDate.toISOString(), endDate.toISOString(), req.params.id]
    );
    res.json({ sucesso: true, agendamento: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── Marcar no-show ────────────────────────────────────────────────────────────
router.patch('/:id/no-show', autenticarToken, async (req, res) => {
  try {
    const result = await req.pool.query(
      `UPDATE appointments SET status = 'no_show', atualizado_em = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    res.json({ sucesso: true, agendamento: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
