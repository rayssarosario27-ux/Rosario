import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Stethoscope, User, Clock, Scan, CheckCircle } from 'lucide-react';
import '../styles/Agendamento.css';

const ESPECIALIDADES = [
  'Clínica Geral',
  'Cardiologia',
  'Pediatria',
  'Ortopedia',
  'Dermatologia',
  'Ginecologia',
  'Neurologia',
  'Oftalmologia',
];

const MEDICOS = {
  'Clínica Geral':  [{ nome: 'Dr. Eduardo Menezes', crm: 'CRM 12345-RJ', foto: null }],
  'Cardiologia':    [{ nome: 'Dra. Ana Paula Lima', crm: 'CRM 54321-RJ', foto: null }],
  'Pediatria':      [{ nome: 'Dr. Carlos Drummond', crm: 'CRM 67890-RJ', foto: null }],
  'Ortopedia':      [{ nome: 'Dr. Fábio Silveira', crm: 'CRM 11223-RJ', foto: null }],
  'Dermatologia':   [{ nome: 'Dra. Juliana Ramos', crm: 'CRM 33445-RJ', foto: null }],
  'Ginecologia':    [{ nome: 'Dra. Patrícia Costa', crm: 'CRM 55667-RJ', foto: null }],
  'Neurologia':     [{ nome: 'Dr. Roberto Nunes', crm: 'CRM 77889-RJ', foto: null }],
  'Oftalmologia':   [{ nome: 'Dra. Sandra Melo', crm: 'CRM 99001-RJ', foto: null }],
};

const HORARIOS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
                  '11:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

function pad(n) { return String(n).padStart(2, '0'); }

function getProximosDias(qtd = 14) {
  const dias = [];
  const hoje = new Date();
  for (let i = 1; i <= qtd; i++) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    if (d.getDay() !== 0) { // sem domingo
      dias.push({
        label: d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }),
        value: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      });
    }
  }
  return dias;
}

export default function Agendamento() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [especialidade, setEspecialidade] = useState('');
  const [medico, setMedico] = useState(null);
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [confirmado, setConfirmado] = useState(false);

  const dias = getProximosDias();

  const confirmar = () => {
    setConfirmado(true);
    localStorage.setItem('proximaConsulta', JSON.stringify({ medico, especialidade, data, horario }));
  };

  if (confirmado) {
    return (
      <div className="ag-wrapper">
        <div className="ag-success-card">
          <CheckCircle size={56} className="ag-success-icon" />
          <h2>Consulta Agendada!</h2>
          <p>
            <strong>{medico?.nome}</strong> · {especialidade}
          </p>
          <p className="ag-success-detail">
            {new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} às {horario}
          </p>
          <div className="ag-facial-notice">
            <Scan size={18} />
            Seu reconhecimento facial está ativo. Ao chegar na clínica, basta se aproximar da catraca.
          </div>
          <button className="ag-btn-primary" onClick={() => navigate('/dashboard')}>
            Ver meu Painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ag-wrapper">
      {/* Nav */}
      <nav className="ag-nav">
        <div className="ag-nav-inner">
          <button className="ag-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Voltar
          </button>
          <div className="ag-nav-title">
            <Stethoscope size={20} />
            <span>Agendar Consulta</span>
          </div>
        </div>
      </nav>

      {/* Progress */}
      <div className="ag-progress-bar">
        {['Especialidade', 'Médico', 'Data & Hora'].map((label, i) => (
          <div key={label} className={`ag-step-item ${step > i + 1 ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
            <div className="ag-step-circle">{step > i + 1 ? '✓' : i + 1}</div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="ag-content">

        {/* Step 1 — Especialidade */}
        {step === 1 && (
          <div className="ag-card">
            <h2>Qual especialidade você precisa?</h2>
            <div className="ag-esp-grid">
              {ESPECIALIDADES.map((esp) => (
                <button
                  key={esp}
                  className={`ag-esp-btn ${especialidade === esp ? 'selected' : ''}`}
                  onClick={() => { setEspecialidade(esp); setMedico(null); }}
                >
                  <Stethoscope size={20} />
                  {esp}
                </button>
              ))}
            </div>
            <button
              className="ag-btn-primary"
              disabled={!especialidade}
              onClick={() => setStep(2)}
            >
              Próximo →
            </button>
          </div>
        )}

        {/* Step 2 — Médico */}
        {step === 2 && (
          <div className="ag-card">
            <h2>Escolha o médico</h2>
            <div className="ag-medico-list">
              {(MEDICOS[especialidade] || []).map((m) => (
                <button
                  key={m.nome}
                  className={`ag-medico-btn ${medico?.nome === m.nome ? 'selected' : ''}`}
                  onClick={() => setMedico(m)}
                >
                  <div className="ag-medico-avatar">
                    <User size={28} />
                  </div>
                  <div className="ag-medico-info">
                    <strong>{m.nome}</strong>
                    <span>{especialidade} · {m.crm}</span>
                  </div>
                  {medico?.nome === m.nome && <CheckCircle size={20} className="ag-check" />}
                </button>
              ))}
            </div>
            <div className="ag-step-actions">
              <button className="ag-btn-ghost" onClick={() => setStep(1)}>← Voltar</button>
              <button className="ag-btn-primary" disabled={!medico} onClick={() => setStep(3)}>
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Data & Hora */}
        {step === 3 && (
          <div className="ag-card">
            <h2>Escolha data e horário</h2>

            <div className="ag-calendar-scroll">
              {dias.map((d) => (
                <button
                  key={d.value}
                  className={`ag-dia-btn ${data === d.value ? 'selected' : ''}`}
                  onClick={() => { setData(d.value); setHorario(''); }}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {data && (
              <div className="ag-horarios">
                <h3><Clock size={15} /> Horários disponíveis</h3>
                <div className="ag-horario-grid">
                  {HORARIOS.map((h) => (
                    <button
                      key={h}
                      className={`ag-horario-btn ${horario === h ? 'selected' : ''}`}
                      onClick={() => setHorario(h)}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {data && horario && (
              <div className="ag-resumo">
                <Calendar size={16} />
                <span>
                  {new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} às {horario}
                </span>
              </div>
            )}

            <div className="ag-step-actions">
              <button className="ag-btn-ghost" onClick={() => setStep(2)}>← Voltar</button>
              <button
                className="ag-btn-primary ag-btn-orange"
                disabled={!data || !horario}
                onClick={confirmar}
              >
                Confirmar Agendamento
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
