-- ============================================================
-- MVP Schema - Sistema de Clínica com CRM + Agenda + Automações
-- ============================================================

-- Clínica (marca)
CREATE TABLE IF NOT EXISTS clinics (
  id          SERIAL PRIMARY KEY,
  nome        VARCHAR(200) NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  ativo       BOOLEAN DEFAULT true,
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);

-- Unidades
CREATE TABLE IF NOT EXISTS units (
  id          SERIAL PRIMARY KEY,
  clinic_id   INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  nome        VARCHAR(200) NOT NULL,
  endereco    TEXT,
  telefone    VARCHAR(30),
  timezone    VARCHAR(60) DEFAULT 'America/Sao_Paulo',
  hora_inicio TIME DEFAULT '08:00',
  hora_fim    TIME DEFAULT '18:00',
  ativo       BOOLEAN DEFAULT true,
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);

-- Usuários internos (atendentes, comerciais, gestores)
CREATE TABLE IF NOT EXISTS usuarios (
  id              SERIAL PRIMARY KEY,
  clinic_id       INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  nome            VARCHAR(200) NOT NULL,
  email           VARCHAR(200) UNIQUE NOT NULL,
  senha_hash      TEXT NOT NULL,
  role            VARCHAR(30) DEFAULT 'atendente', -- atendente | comercial | gestor | admin
  ativo           BOOLEAN DEFAULT true,
  ultimo_acesso   TIMESTAMPTZ,
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);

-- Permissões: usuário <-> unidade
CREATE TABLE IF NOT EXISTS usuario_units (
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  unit_id     INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  PRIMARY KEY (usuario_id, unit_id)
);

-- Tags para segmentação de leads/campanhas
CREATE TABLE IF NOT EXISTS tags (
  id        SERIAL PRIMARY KEY,
  clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  nome      VARCHAR(100) NOT NULL,
  cor       VARCHAR(10) DEFAULT '#00ced1',
  UNIQUE(clinic_id, nome)
);

-- Leads / CRM
CREATE TABLE IF NOT EXISTS leads (
  id              SERIAL PRIMARY KEY,
  clinic_id       INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  unit_id         INTEGER REFERENCES units(id),
  nome            VARCHAR(200),
  telefone        VARCHAR(30) NOT NULL,
  email           VARCHAR(200),
  canal           VARCHAR(30) DEFAULT 'whatsapp', -- whatsapp | instagram | site | indicacao
  fonte           VARCHAR(100),                   -- campanha de origem
  status          VARCHAR(50) DEFAULT 'novo',     -- novo | interessado | quer_agendar | agendado | perdido | sem_resposta
  atribuido_a     INTEGER REFERENCES usuarios(id),
  gclid           VARCHAR(200),
  fbclid          VARCHAR(200),
  observacoes     TEXT,
  criado_em       TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_clinic  ON leads(clinic_id);
CREATE INDEX IF NOT EXISTS idx_leads_unit    ON leads(unit_id);
CREATE INDEX IF NOT EXISTS idx_leads_status  ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_tel     ON leads(telefone);

-- Histórico de status dos leads
CREATE TABLE IF NOT EXISTS lead_status_history (
  id          SERIAL PRIMARY KEY,
  lead_id     INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  status_de   VARCHAR(50),
  status_para VARCHAR(50) NOT NULL,
  ator        VARCHAR(30) DEFAULT 'humano', -- ia | humano
  usuario_id  INTEGER REFERENCES usuarios(id),
  motivo      TEXT,
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lsh_lead ON lead_status_history(lead_id);

-- Tags <-> Leads
CREATE TABLE IF NOT EXISTS lead_tags (
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  tag_id  INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (lead_id, tag_id)
);

-- Conversas
CREATE TABLE IF NOT EXISTS conversations (
  id              SERIAL PRIMARY KEY,
  lead_id         INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  canal           VARCHAR(30) DEFAULT 'whatsapp',
  estado          VARCHAR(30) DEFAULT 'aguardando', -- aguardando | em_atendimento | encerrada
  atribuido_a     INTEGER REFERENCES usuarios(id),
  ultimo_contato  TIMESTAMPTZ,
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conv_lead  ON conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conv_estado ON conversations(estado);

-- Mensagens
CREATE TABLE IF NOT EXISTS messages (
  id                  SERIAL PRIMARY KEY,
  conversation_id     INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direcao             VARCHAR(10) NOT NULL, -- entrada | saida
  tipo                VARCHAR(20) DEFAULT 'texto', -- texto | imagem | audio | documento
  conteudo            TEXT,
  url_midia           TEXT,
  whatsapp_msg_id     VARCHAR(200),
  status_entrega      VARCHAR(20),          -- enviado | entregue | lido | falhou
  enviado_por         VARCHAR(30) DEFAULT 'ia', -- ia | usuario_id | sistema
  criado_em           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversation_id);

-- ==============================
-- MÓDULO DE AGENDA INTERNA
-- ==============================

-- Profissionais (providers)
CREATE TABLE IF NOT EXISTS providers (
  id          SERIAL PRIMARY KEY,
  clinic_id   INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  nome        VARCHAR(200) NOT NULL,
  especialidade VARCHAR(100),
  crm         VARCHAR(50),
  email       VARCHAR(200),
  telefone    VARCHAR(30),
  ativo       BOOLEAN DEFAULT true,
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);

-- Serviços / Procedimentos
CREATE TABLE IF NOT EXISTS services (
  id                    SERIAL PRIMARY KEY,
  clinic_id             INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  nome                  VARCHAR(200) NOT NULL,
  descricao             TEXT,
  duracao_minutos       INTEGER NOT NULL DEFAULT 30,
  buffer_antes_minutos  INTEGER DEFAULT 0,
  buffer_depois_minutos INTEGER DEFAULT 0,
  preco_base            NUMERIC(10,2),
  ativo                 BOOLEAN DEFAULT true,
  criado_em             TIMESTAMPTZ DEFAULT NOW()
);

-- Provider <-> Unit (em quais unidades o profissional atende)
CREATE TABLE IF NOT EXISTS provider_unit (
  provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  unit_id     INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  PRIMARY KEY (provider_id, unit_id)
);

-- Regras de disponibilidade semanal
CREATE TABLE IF NOT EXISTS provider_availability_rules (
  id          SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  unit_id     INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  dia_semana  SMALLINT NOT NULL, -- 0=dom, 1=seg, ..., 6=sab
  hora_inicio TIME NOT NULL,
  hora_fim    TIME NOT NULL,
  ativo       BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_par_provider ON provider_availability_rules(provider_id);

-- Exceções de disponibilidade (folgas, bloqueios, férias)
CREATE TABLE IF NOT EXISTS provider_time_off (
  id          SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  unit_id     INTEGER REFERENCES units(id),
  inicio      TIMESTAMPTZ NOT NULL,
  fim         TIMESTAMPTZ NOT NULL,
  motivo      VARCHAR(200),
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);

-- Agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  id              SERIAL PRIMARY KEY,
  clinic_id       INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  unit_id         INTEGER NOT NULL REFERENCES units(id),
  provider_id     INTEGER NOT NULL REFERENCES providers(id),
  service_id      INTEGER NOT NULL REFERENCES services(id),
  lead_id         INTEGER REFERENCES leads(id),
  paciente_id     INTEGER REFERENCES pacientes(id),
  start_at        TIMESTAMPTZ NOT NULL,
  end_at          TIMESTAMPTZ NOT NULL,
  status          VARCHAR(30) DEFAULT 'reservado', -- reservado | confirmado | cancelado | no_show
  criado_por      VARCHAR(20) DEFAULT 'humano',    -- ia | humano | sistema
  observacoes     TEXT,
  criado_em       TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appt_provider   ON appointments(provider_id, start_at);
CREATE INDEX IF NOT EXISTS idx_appt_unit       ON appointments(unit_id, start_at);
CREATE INDEX IF NOT EXISTS idx_appt_lead       ON appointments(lead_id);
CREATE INDEX IF NOT EXISTS idx_appt_status     ON appointments(status);

-- Notas de agendamento
CREATE TABLE IF NOT EXISTS appointment_notes (
  id              SERIAL PRIMARY KEY,
  appointment_id  INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  usuario_id      INTEGER REFERENCES usuarios(id),
  nota            TEXT NOT NULL,
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);

-- Links Google Calendar (espelho)
CREATE TABLE IF NOT EXISTS calendar_links (
  id              SERIAL PRIMARY KEY,
  appointment_id  INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  google_event_id VARCHAR(200) NOT NULL,
  calendar_id     VARCHAR(200),
  sincronizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- MÓDULO DE AUTOMAÇÕES
-- ==============================

CREATE TABLE IF NOT EXISTS automation_rules (
  id            SERIAL PRIMARY KEY,
  clinic_id     INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  nome          VARCHAR(200) NOT NULL,
  gatilho       VARCHAR(50) NOT NULL, -- status_mudou | sem_resposta | agendamento_amanha | no_show
  condicoes     JSONB DEFAULT '{}',   -- {status: 'interessado', horas_sem_resposta: 2}
  acao          VARCHAR(50) NOT NULL, -- enviar_mensagem | mudar_status | escalar_humano
  template_msg  TEXT,
  ativo         BOOLEAN DEFAULT true,
  criado_em     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS automation_jobs (
  id              SERIAL PRIMARY KEY,
  clinic_id       INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  rule_id         INTEGER REFERENCES automation_rules(id),
  lead_id         INTEGER REFERENCES leads(id),
  appointment_id  INTEGER REFERENCES appointments(id),
  status          VARCHAR(20) DEFAULT 'pendente', -- pendente | executando | concluido | falhou
  agendado_para   TIMESTAMPTZ,
  executado_em    TIMESTAMPTZ,
  resultado       TEXT,
  tentativas      INTEGER DEFAULT 0,
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ajobs_status ON automation_jobs(status, agendado_para);

-- ==============================
-- MÓDULO DE MARKETING / MÉTRICAS
-- ==============================

CREATE TABLE IF NOT EXISTS ad_accounts (
  id          SERIAL PRIMARY KEY,
  clinic_id   INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  plataforma  VARCHAR(30) NOT NULL, -- meta | google
  account_id  VARCHAR(200) NOT NULL,
  nome        VARCHAR(200),
  token       TEXT,
  ativo       BOOLEAN DEFAULT true,
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ad_spend_daily (
  id              SERIAL PRIMARY KEY,
  ad_account_id   INTEGER NOT NULL REFERENCES ad_accounts(id) ON DELETE CASCADE,
  data            DATE NOT NULL,
  campanha_id     VARCHAR(200),
  campanha_nome   VARCHAR(300),
  conjunto_id     VARCHAR(200),
  anuncio_id      VARCHAR(200),
  canal           VARCHAR(30),
  impressoes      INTEGER DEFAULT 0,
  cliques         INTEGER DEFAULT 0,
  custo           NUMERIC(10,2) DEFAULT 0,
  conversoes      INTEGER DEFAULT 0,
  criado_em       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ad_account_id, data, campanha_id, conjunto_id, anuncio_id)
);

CREATE TABLE IF NOT EXISTS attribution (
  id              SERIAL PRIMARY KEY,
  lead_id         INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  gclid           VARCHAR(200),
  fbclid          VARCHAR(200),
  campanha_id     VARCHAR(200),
  conjunto_id     VARCHAR(200),
  anuncio_id      VARCHAR(200),
  canal           VARCHAR(30),
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);
