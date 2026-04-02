/**
 * Webhook WhatsApp (Meta Cloud API)
 * Recebe mensagens, resolve lead pelo telefone, cria conversa, registra mensagem.
 */
const express = require('express');
const router = express.Router();

// ── Verificação do webhook (GET) ──────────────────────────────────────────────
router.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'token_verificacao';
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WhatsApp webhook verificado');
    // Sanitize: challenge must be a numeric string per Meta's API spec
    const sanitizedChallenge = String(challenge).replace(/[^0-9]/g, '');
    if (!sanitizedChallenge) return res.sendStatus(400);
    return res.status(200).send(sanitizedChallenge);
  }
  res.sendStatus(403);
});

// ── Receber mensagem (POST) ───────────────────────────────────────────────────
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Confirma imediatamente para a Meta
    res.sendStatus(200);

    if (!body?.entry) return;

    for (const entry of body.entry) {
      for (const change of (entry.changes || [])) {
        const value = change.value;
        if (!value?.messages) continue;

        for (const msg of value.messages) {
          await processarMensagem(req.pool, msg, value.metadata);
        }
      }
    }
  } catch (err) {
    console.error('Erro no webhook WhatsApp:', err);
  }
});

async function processarMensagem(pool, msg, metadata) {
  try {
    const telefone = msg.from; // número no formato internacional
    const texto    = msg.text?.body || '';
    const tipoMsg  = msg.type || 'texto';
    const waId     = msg.id;

    if (!pool) return;

    // 1. Resolver lead pelo telefone
    let leadResult = await pool.query(
      'SELECT * FROM leads WHERE telefone = $1 ORDER BY criado_em DESC LIMIT 1',
      [telefone]
    );

    let lead;
    if (leadResult.rows.length === 0) {
      // Criar novo lead (clinic_id = 1 como default; ajustar via número do WABA)
      const novoLead = await pool.query(
        `INSERT INTO leads (clinic_id, telefone, canal, status)
         VALUES (1, $1, 'whatsapp', 'novo') RETURNING *`,
        [telefone]
      );
      lead = novoLead.rows[0];

      await pool.query(
        `INSERT INTO lead_status_history (lead_id, status_de, status_para, ator)
         VALUES ($1, NULL, 'novo', 'sistema')`,
        [lead.id]
      );
    } else {
      lead = leadResult.rows[0];
    }

    // 2. Criar ou buscar conversa ativa
    let convResult = await pool.query(
      `SELECT * FROM conversations WHERE lead_id = $1 AND estado != 'encerrada' ORDER BY criado_em DESC LIMIT 1`,
      [lead.id]
    );

    let conversation;
    if (convResult.rows.length === 0) {
      const novaConv = await pool.query(
        `INSERT INTO conversations (lead_id, canal, estado, ultimo_contato)
         VALUES ($1, 'whatsapp', 'aguardando', NOW()) RETURNING *`,
        [lead.id]
      );
      conversation = novaConv.rows[0];
    } else {
      conversation = convResult.rows[0];
      await pool.query(
        'UPDATE conversations SET ultimo_contato = NOW() WHERE id = $1',
        [conversation.id]
      );
    }

    // 3. Registrar mensagem recebida
    await pool.query(
      `INSERT INTO messages (conversation_id, direcao, tipo, conteudo, whatsapp_msg_id, enviado_por)
       VALUES ($1, 'entrada', $2, $3, $4, 'lead')`,
      [conversation.id, tipoMsg, texto, waId]
    );

    console.log(`📱 WhatsApp | Lead #${lead.id} (${telefone}): "${texto}"`);
  } catch (err) {
    console.error('Erro ao processar mensagem WhatsApp:', err);
  }
}

module.exports = router;
