import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, User, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import '../styles/Agenda.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function formatarData(d) {
  return new Date(d).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
}

function formatarHora(d) {
  return new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function somarDias(base, dias) {
  const d = new Date(base);
  d.setDate(d.getDate() + dias);
  return d;
}

function isoDate(d) {
  return d.toISOString().split('T')[0];
}

export default function Agenda() {
  const token = localStorage.getItem('token');
  const pacienteData = JSON.parse(localStorage.getItem('paciente') || '{}');
  const clinicId = pacienteData.clinic_id || 1;
  const unitId = pacienteData.unit_id || 1;

  const [etapa, setEtapa] = useState(1); // 1=serviço, 2=profissional, 3=horário, 4=confirmado
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [slots, setSlots] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const [servicoSel, setServicoSel] = useState(null);
  const [providerSel, setProviderSel] = useState(null);
  const [slotSel, setSlotSel] = useState(null);
  const [semanaOffset, setSemanaOffset] = useState(0);
  const [agendamento, setAgendamento] = useState(null);

  // Carregar serviços
  useEffect(() => {
    fetch(`${API_URL}/api/services?clinic_id=${clinicId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.sucesso) setServices(d.services || []); })
      .catch(console.error);
  }, [token, clinicId]);

  // Carregar profissionais após serviço selecionado
  useEffect(() => {
    if (!servicoSel) return;
    fetch(`${API_URL}/api/providers?unit_id=${unitId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.sucesso) setProviders(d.providers || []); })
      .catch(console.error);
  }, [servicoSel, token, unitId]);

  // Carregar slots
  const carregarSlots = useCallback(async () => {
    if (!servicoSel) return;
    setCarregando(true);
    try {
      const from = somarDias(new Date(), semanaOffset * 7);
      const to   = somarDias(from, 6);
      const params = new URLSearchParams({
        unit_id: unitId,
        service_id: servicoSel.id,
        date_from: isoDate(from),
        date_to:   isoDate(to)
      });
      if (providerSel) params.append('provider_id', providerSel.id);

      const res = await fetch(`${API_URL}/api/availability?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.sucesso) setSlots(data.slots || []);
    } catch (err) {
      console.error('Erro ao carregar slots:', err);
    } finally {
      setCarregando(false);
    }
  }, [servicoSel, providerSel, semanaOffset, token, unitId]);

  useEffect(() => {
    if (etapa === 3) carregarSlots();
  }, [etapa, carregarSlots]);

  const confirmarAgendamento = async () => {
    if (!slotSel) return;
    try {
      const paciente = JSON.parse(localStorage.getItem('paciente') || '{}');
      const res = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          clinic_id: clinicId,
          unit_id: unitId,
          provider_id: slotSel.provider_id,
          service_id: slotSel.service_id,
          paciente_id: paciente.id,
          start_at: slotSel.start_at,
          criado_por: 'humano'
        })
      });
      const data = await res.json();
      if (data.sucesso) {
        setAgendamento(data.agendamento);
        setEtapa(4);
      } else {
        alert(data.erro || 'Erro ao agendar');
      }
    } catch (err) {
      console.error('Erro ao confirmar:', err);
    }
  };

  // Agrupar slots por dia
  const slotsPorDia = slots.reduce((acc, s) => {
    const dia = s.start_at.split('T')[0];
    if (!acc[dia]) acc[dia] = [];
    acc[dia].push(s);
    return acc;
  }, {});

  return (
    <div className="agenda-container">
      <div className="agenda-card">
        {/* Progresso */}
        <div className="agenda-steps">
          {['Serviço', 'Profissional', 'Horário', 'Confirmado'].map((s, i) => (
            <div key={i} className={`step ${etapa > i + 1 ? 'done' : ''} ${etapa === i + 1 ? 'active' : ''}`}>
              <div className="step-num">{etapa > i + 1 ? '✓' : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        {/* Etapa 1: Escolher serviço */}
        {etapa === 1 && (
          <div className="agenda-section">
            <h2><Calendar size={22} /> Qual procedimento deseja?</h2>
            {services.length === 0 ? (
              <p className="agenda-empty">Nenhum serviço disponível no momento.</p>
            ) : (
              <div className="servicos-grid">
                {services.map(svc => (
                  <div
                    key={svc.id}
                    className={`servico-card ${servicoSel?.id === svc.id ? 'selected' : ''}`}
                    onClick={() => setServicoSel(svc)}
                  >
                    <p className="svc-nome">{svc.nome}</p>
                    <p className="svc-info">⏱ {svc.duracao_minutos} min</p>
                    {svc.preco_base && (
                      <p className="svc-preco">
                        R$ {parseFloat(svc.preco_base).toFixed(2).replace('.', ',')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="agenda-nav">
              <span />
              <button
                className="btn-avancar"
                disabled={!servicoSel}
                onClick={() => setEtapa(2)}
              >
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* Etapa 2: Escolher profissional */}
        {etapa === 2 && (
          <div className="agenda-section">
            <h2><User size={22} /> Escolha o profissional</h2>
            <div className="providers-list">
              <div
                className={`provider-card ${!providerSel ? 'selected' : ''}`}
                onClick={() => setProviderSel(null)}
              >
                <p className="pv-nome">Qualquer disponível</p>
                <p className="pv-esp">O sistema escolhe automaticamente</p>
              </div>
              {providers.map(pv => (
                <div
                  key={pv.id}
                  className={`provider-card ${providerSel?.id === pv.id ? 'selected' : ''}`}
                  onClick={() => setProviderSel(pv)}
                >
                  <p className="pv-nome">{pv.nome}</p>
                  {pv.especialidade && <p className="pv-esp">{pv.especialidade}</p>}
                </div>
              ))}
            </div>
            <div className="agenda-nav">
              <button className="btn-voltar" onClick={() => setEtapa(1)}>← Voltar</button>
              <button className="btn-avancar" onClick={() => setEtapa(3)}>Próximo →</button>
            </div>
          </div>
        )}

        {/* Etapa 3: Escolher horário */}
        {etapa === 3 && (
          <div className="agenda-section">
            <h2><Clock size={22} /> Escolha o horário</h2>

            <div className="semana-nav">
              <button onClick={() => setSemanaOffset(o => o - 1)} disabled={semanaOffset <= 0}>
                <ChevronLeft size={18} />
              </button>
              <span>
                {formatarData(somarDias(new Date(), semanaOffset * 7))} –{' '}
                {formatarData(somarDias(new Date(), semanaOffset * 7 + 6))}
              </span>
              <button onClick={() => setSemanaOffset(o => o + 1)}>
                <ChevronRight size={18} />
              </button>
            </div>

            {carregando ? (
              <p className="agenda-loading">Carregando horários...</p>
            ) : Object.keys(slotsPorDia).length === 0 ? (
              <p className="agenda-empty">Nenhum horário disponível nessa semana.</p>
            ) : (
              <div className="slots-grid">
                {Object.entries(slotsPorDia).map(([dia, slotsD]) => (
                  <div key={dia} className="slots-dia">
                    <p className="slots-dia-label">{formatarData(dia)}</p>
                    <div className="slots-horarios">
                      {slotsD.map((s, i) => (
                        <button
                          key={i}
                          className={`slot-btn ${slotSel?.start_at === s.start_at && slotSel?.provider_id === s.provider_id ? 'selected' : ''}`}
                          onClick={() => setSlotSel(s)}
                        >
                          {formatarHora(s.start_at)}
                          {!providerSel && (
                            <span className="slot-provider"> · {s.provider_nome}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="agenda-nav">
              <button className="btn-voltar" onClick={() => setEtapa(2)}>← Voltar</button>
              <button
                className="btn-avancar"
                disabled={!slotSel}
                onClick={confirmarAgendamento}
              >
                Confirmar agendamento
              </button>
            </div>
          </div>
        )}

        {/* Etapa 4: Confirmado */}
        {etapa === 4 && agendamento && (
          <div className="agenda-section confirmado">
            <CheckCircle size={64} color="#198754" />
            <h2>Agendamento confirmado!</h2>
            <div className="confirmado-info">
              <p>📅 {formatarData(agendamento.start_at)} às {formatarHora(agendamento.start_at)}</p>
              <p>⏱ Duração: {servicoSel?.duracao_minutos} min</p>
              <p>📋 Procedimento: <strong>{servicoSel?.nome}</strong></p>
            </div>
            <p className="confirmado-sub">Você receberá uma mensagem de confirmação pelo WhatsApp.</p>
            <button className="btn-avancar" onClick={() => window.location.href = '/dashboard'}>
              Ir para o início
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
