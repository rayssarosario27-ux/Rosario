import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, FileText, Video, LogOut, Stethoscope,
  MapPin, Clock, Scan, MessageCircle, ChevronRight,
  ClipboardList
} from 'lucide-react';
import '../styles/Dashboard.css';

const WHATSAPP_ZAYA = `https://wa.me/5521973113276?text=${encodeURIComponent('Olá Zaya! Preciso de ajuda com um agendamento.')}`;

const PROXIMA_CONSULTA = {
  medico: 'Dr. Eduardo Menezes',
  especialidade: 'Clínica Geral',
  data: '03/04/2026',
  hora: '10:30',
  unidade: 'Barra da Tijuca',
  diasRestantes: 2,
  preparo: 'Para sua consulta de amanhã, lembre-se de estar em jejum de 8 horas. Traga seus exames anteriores e documento com foto.',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [biometriaAtiva] = useState(() => !!localStorage.getItem('biometria'));

  useEffect(() => {
    const raw = localStorage.getItem('paciente');
    if (raw) {
      try { setPaciente(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('paciente');
    localStorage.removeItem('biometria');
    navigate('/');
  };

  const nome = paciente?.nome ? paciente.nome.split(' ')[0] : 'Paciente';
  const convenio = paciente?.convenio || 'Particular';

  return (
    <div className="dash-wrapper">

      {/* ── Navbar ───────────────────────────── */}
      <nav className="dash-nav">
        <div className="dash-nav-inner">
          <div className="dash-logo">
            <div className="dash-logo-icon">
              <Stethoscope size={20} color="#fff" />
            </div>
            <div>
              <strong className="dash-logo-name">CLÍNICA DR. EDUARDO</strong>
              <span className="dash-logo-sub">Portal do Paciente</span>
            </div>
          </div>
          <div className="dash-nav-right">
            <span className="dash-user-pill">👤 {nome}</span>
            <button className="dash-logout-btn" onClick={handleLogout}>
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </nav>

      {/* ── Welcome Banner ───────────────────── */}
      <section className="dash-welcome">
        <div className="dash-welcome-inner">
          <div className="dash-welcome-text">
            <h1>Olá, {nome}! 👋</h1>
            <p>
              Sua próxima consulta é em{' '}
              <strong>{PROXIMA_CONSULTA.diasRestantes} dias</strong> — {PROXIMA_CONSULTA.data} às {PROXIMA_CONSULTA.hora}.
            </p>
          </div>
          {biometriaAtiva && (
            <div className="dash-facial-badge">
              <Scan size={16} />
              Reconhecimento facial ativo
            </div>
          )}
        </div>
      </section>

      <div className="dash-content">

        {/* ── Próximo Agendamento ───────────── */}
        <section className="dash-section">
          <h2 className="dash-section-title">
            <Calendar size={18} /> Próximo Agendamento
          </h2>

          <div className="appt-card">
            <div className="appt-top">
              <div className="appt-avatar">
                <Stethoscope size={28} color="#fff" />
              </div>
              <div className="appt-doctor-info">
                <strong className="appt-doctor-name">{PROXIMA_CONSULTA.medico}</strong>
                <span className="appt-specialty">{PROXIMA_CONSULTA.especialidade}</span>
                <span className="appt-convenio-badge">{convenio}</span>
              </div>
              <div className="appt-countdown">
                <span className="appt-days">{PROXIMA_CONSULTA.diasRestantes}</span>
                <span className="appt-days-label">dias</span>
              </div>
            </div>

            <div className="appt-details">
              <span className="appt-detail-item">
                <Calendar size={14} /> {PROXIMA_CONSULTA.data} às {PROXIMA_CONSULTA.hora}
              </span>
              <span className="appt-detail-item">
                <MapPin size={14} /> {PROXIMA_CONSULTA.unidade}
              </span>
              <span className="appt-detail-item">
                <Clock size={14} /> Duração estimada: 30 min
              </span>
            </div>

            {biometriaAtiva && (
              <div className="appt-facial-notice">
                <Scan size={15} />
                <span>Seu reconhecimento facial está ativo. Ao chegar na clínica, basta se aproximar da catraca.</span>
              </div>
            )}

            <div className="appt-actions">
              <button className="btn-appt-orange">
                <ClipboardList size={16} /> Ver Preparo do Exame
              </button>
              <a
                href="https://www.google.com/maps/search/Clínica+Dr.+Eduardo+Barra+da+Tijuca"
                target="_blank"
                rel="noreferrer"
                className="btn-appt-ghost"
              >
                <MapPin size={16} /> Como Chegar
              </a>
            </div>
          </div>
        </section>

        {/* ── Ações Rápidas ─────────────────── */}
        <section className="dash-section">
          <h2 className="dash-section-title">
            <ChevronRight size={18} /> Ações Rápidas
          </h2>

          <div className="quick-grid">
            <button
              className="quick-card quick-card-primary"
              onClick={() => navigate('/auth?mode=register')}
            >
              <div className="quick-icon"><Calendar size={26} /></div>
              <span>Agendar Nova Consulta</span>
            </button>

            <button className="quick-card">
              <div className="quick-icon"><FileText size={26} /></div>
              <span>Meus Exames</span>
            </button>

            <button className="quick-card">
              <div className="quick-icon"><ClipboardList size={26} /></div>
              <span>Histórico Médico</span>
            </button>

            <button className="quick-card">
              <div className="quick-icon"><Video size={26} /></div>
              <span>Telemedicina</span>
            </button>
          </div>
        </section>

        {/* ── Orientações ───────────────────── */}
        <section className="dash-section">
          <div className="prep-card">
            <div className="prep-icon">📋</div>
            <div className="prep-body">
              <h3>Orientações para sua Consulta</h3>
              <p>{PROXIMA_CONSULTA.preparo}</p>
            </div>
          </div>
        </section>

      </div>

      {/* ── Zaya Flutuante ────────────────────── */}
      <a
        href={WHATSAPP_ZAYA}
        className="dash-zaya-float"
        target="_blank"
        rel="noreferrer"
        aria-label="Falar com a Zaya"
      >
        <MessageCircle size={22} color="#fff" />
        <span>Falar com a Zaya</span>
      </a>

    </div>
  );
}