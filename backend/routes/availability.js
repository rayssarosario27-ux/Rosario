const { autenticarToken } = require('../middleware/auth');
const express = require('express');
const router = express.Router();

/**
 * Gera slots de disponibilidade para um provider/serviço em um intervalo de datas.
 *
 * GET /api/availability?unit_id=1&service_id=2&provider_id=3&date_from=2026-04-01&date_to=2026-04-07
 */
router.get('/', autenticarToken, async (req, res) => {
  try {
    const { unit_id, service_id, provider_id, date_from, date_to } = req.query;

    if (!unit_id || !service_id || !date_from || !date_to) {
      return res.status(400).json({ erro: '❌ unit_id, service_id, date_from e date_to são obrigatórios' });
    }

    // Buscar serviço
    const svcResult = await req.pool.query('SELECT * FROM services WHERE id = $1 AND ativo = true', [service_id]);
    if (svcResult.rows.length === 0) return res.status(404).json({ erro: 'Serviço não encontrado' });
    const svc = svcResult.rows[0];

    // Buscar unidade (timezone)
    const unitResult = await req.pool.query('SELECT * FROM units WHERE id = $1', [unit_id]);
    if (unitResult.rows.length === 0) return res.status(404).json({ erro: 'Unidade não encontrada' });
    const unit = unitResult.rows[0];

    // Buscar providers disponíveis na unidade
    const providerCond = provider_id ? 'AND p.id = $2' : '';
    const providerParams = provider_id ? [unit_id, provider_id] : [unit_id];

    const providersResult = await req.pool.query(
      `SELECT DISTINCT p.id, p.nome
       FROM providers p
       JOIN provider_unit pu ON pu.provider_id = p.id AND pu.unit_id = $1
       WHERE p.ativo = true ${providerCond}`,
      providerParams
    );

    const slots = [];
    const duracaoMs = svc.duracao_minutos * 60000;
    const bufferAntesMs = svc.buffer_antes_minutos * 60000;
    const bufferDepoisMs = svc.buffer_depois_minutos * 60000;
    const intervaloMs = (svc.duracao_minutos + svc.buffer_antes_minutos + svc.buffer_depois_minutos) * 60000;

    const dataInicio = new Date(date_from);
    const dataFim = new Date(date_to);
    dataFim.setHours(23, 59, 59, 999);

    for (const provider of providersResult.rows) {
      // Regras semanais do provider nesta unidade
      const regrasResult = await req.pool.query(
        `SELECT * FROM provider_availability_rules
         WHERE provider_id = $1 AND unit_id = $2 AND ativo = true`,
        [provider.id, unit_id]
      );
      const regras = regrasResult.rows;

      // Folgas do provider
      const folgasResult = await req.pool.query(
        `SELECT inicio, fim FROM provider_time_off
         WHERE provider_id = $1
           AND fim >= $2 AND inicio <= $3`,
        [provider.id, date_from, date_to]
      );
      const folgas = folgasResult.rows;

      // Agendamentos existentes (não cancelados)
      const agendadosResult = await req.pool.query(
        `SELECT start_at, end_at FROM appointments
         WHERE provider_id = $1
           AND status NOT IN ('cancelado')
           AND start_at >= $2 AND end_at <= $3`,
        [provider.id, date_from, dataFim.toISOString()]
      );
      const agendados = agendadosResult.rows;

      // Iterar dias
      const current = new Date(dataInicio);
      while (current <= dataFim) {
        const diaSemana = current.getDay(); // 0=dom...6=sab
        const regrasHoje = regras.filter(r => r.dia_semana === diaSemana);

        for (const regra of regrasHoje) {
          const [hIni, mIni] = regra.hora_inicio.split(':').map(Number);
          const [hFim, mFim] = regra.hora_fim.split(':').map(Number);

          let slotStart = new Date(current);
          slotStart.setHours(hIni, mIni, 0, 0);
          const limiteHora = new Date(current);
          limiteHora.setHours(hFim, mFim, 0, 0);

          while (slotStart.getTime() + duracaoMs <= limiteHora.getTime()) {
            const occupiedStart = new Date(slotStart.getTime() - bufferAntesMs);
            const slotEnd = new Date(slotStart.getTime() + duracaoMs);
            const occupiedEnd = new Date(slotEnd.getTime() + bufferDepoisMs);

            // Verificar folga
            const emFolga = folgas.some(f =>
              occupiedStart < new Date(f.fim) && occupiedEnd > new Date(f.inicio)
            );

            // Verificar agendamento existente
            const ocupado = agendados.some(a =>
              occupiedStart < new Date(a.end_at) && occupiedEnd > new Date(a.start_at)
            );

            // Não mostrar horários no passado
            const agora = new Date();
            if (!emFolga && !ocupado && slotStart > agora) {
              slots.push({
                provider_id: provider.id,
                provider_nome: provider.nome,
                unit_id: parseInt(unit_id),
                service_id: parseInt(service_id),
                start_at: slotStart.toISOString(),
                end_at: slotEnd.toISOString()
              });
            }

            slotStart = new Date(slotStart.getTime() + intervaloMs);
          }
        }

        current.setDate(current.getDate() + 1);
      }
    }

    // Ordenar slots por horário
    slots.sort((a, b) => new Date(a.start_at) - new Date(b.start_at));

    res.json({ sucesso: true, slots, total: slots.length });
  } catch (err) {
    console.error('Erro ao buscar disponibilidade:', err);
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
