# Sistema de Clínica — MVP

Sistema de CRM, Agenda Interna, Automações e Integração WhatsApp para clínicas.

## Stack

- **Backend**: Node.js + Express + PostgreSQL (`pg`)
- **Frontend cliente**: React (Create React App)
- **Filas** (fase 2): Redis + BullMQ
- **WhatsApp**: Meta Cloud API (webhook)

## Estrutura

```
backend/
  database/
    001_initial_schema.sql   ← Migration com todas as tabelas
  middleware/
    auth.js                  ← JWT middleware
  routes/
    auth.js                  ← Registro/login paciente e admin
    leads.js                 ← CRM: leads, status, histórico, funil
    conversations.js         ← Conversas e mensagens
    providers.js             ← Profissionais + disponibilidade + folgas
    services.js              ← Serviços/procedimentos
    availability.js          ← Geração de slots disponíveis
    appointments.js          ← Agendamentos (CRUD + conflito)
    automation.js            ← Regras e jobs de automação
    whatsapp.js              ← Webhook Meta Cloud API
  server.js

frontend-cliente/
  src/
    pages/
      Home.jsx
      Auth.jsx
      Dashboard.jsx          ← Botão "Agendar" vinculado à /agendar
      Agenda.jsx             ← Fluxo completo: serviço → profissional → horário → confirmado
      admin/
        CRM.jsx              ← Kanban de leads + métricas
```

## Configuração

1. Copie `.env.example` para `.env` e preencha as variáveis.
2. Execute a migration no seu banco PostgreSQL:
   ```sql
   \i backend/database/001_initial_schema.sql
   ```
3. Inicie o backend:
   ```bash
   cd backend && npm install && npm run dev
   ```
4. Inicie o frontend:
   ```bash
   cd frontend-cliente && npm install && npm start
   ```

## API Endpoints

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/registro-paciente` | Cadastro de paciente |
| POST | `/api/auth/login-paciente` | Login paciente |
| POST | `/api/auth/login-admin` | Login admin |
| POST | `/api/auth/verificar-email` | Verificação de e-mail |

### CRM / Leads
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/leads` | Listar leads (filtros: clinic_id, unit_id, status) |
| POST | `/api/leads` | Criar lead |
| PATCH | `/api/leads/:id` | Atualizar lead |
| PATCH | `/api/leads/:id/status` | Mudar status (com histórico) |
| GET | `/api/leads/:id/historico` | Histórico de status |
| GET | `/api/leads/funil/resumo` | Contagem por etapa do funil |
| GET | `/api/leads/telefone/:telefone` | Buscar lead por telefone |

### Conversas / Mensagens
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/conversations` | Listar conversas |
| POST | `/api/conversations/obter-ou-criar` | Obter ou criar conversa ativa |
| PATCH | `/api/conversations/:id/estado` | Atualizar estado |
| GET | `/api/conversations/:id/messages` | Listar mensagens |
| POST | `/api/conversations/:id/messages` | Enviar/registrar mensagem |

### Profissionais
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/providers` | Listar profissionais |
| POST | `/api/providers` | Criar profissional |
| PATCH | `/api/providers/:id` | Atualizar |
| POST | `/api/providers/:id/units` | Vincular a unidade |
| GET/POST | `/api/providers/:id/availability-rules` | Regras de disponibilidade semanal |
| GET/POST | `/api/providers/:id/time-off` | Folgas e bloqueios |

### Serviços
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/services` | Listar serviços |
| POST | `/api/services` | Criar serviço |
| PATCH | `/api/services/:id` | Atualizar serviço |

### Disponibilidade e Agendamentos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/availability` | Slots disponíveis (unit_id, service_id, date_from, date_to) |
| GET | `/api/appointments` | Listar agendamentos |
| POST | `/api/appointments` | Criar agendamento (com verificação de conflito) |
| PATCH | `/api/appointments/:id/confirm` | Confirmar |
| PATCH | `/api/appointments/:id/cancel` | Cancelar |
| PATCH | `/api/appointments/:id/reschedule` | Reagendar |
| PATCH | `/api/appointments/:id/no-show` | Marcar no-show |

### Automação
| Método | Rota | Descrição |
|--------|------|-----------|
| GET/POST | `/api/automation/rules` | Regras de automação |
| PATCH | `/api/automation/rules/:id` | Atualizar regra |
| GET/POST | `/api/automation/jobs` | Jobs agendados |

### WhatsApp
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/whatsapp/webhook` | Verificação do webhook (Meta) |
| POST | `/api/whatsapp/webhook` | Receber mensagens do WhatsApp |

## Modelo de dados

Veja `backend/database/001_initial_schema.sql` para o schema completo com tabelas:

- `clinics`, `units`, `usuarios`, `usuario_units`
- `leads`, `lead_status_history`, `lead_tags`, `tags`
- `conversations`, `messages`
- `providers`, `services`, `provider_unit`, `provider_availability_rules`, `provider_time_off`
- `appointments`, `appointment_notes`, `calendar_links`
- `automation_rules`, `automation_jobs`
- `ad_accounts`, `ad_spend_daily`, `attribution`
