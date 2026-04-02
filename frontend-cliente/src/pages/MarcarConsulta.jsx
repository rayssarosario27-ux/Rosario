import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Phone } from 'lucide-react';
import '../styles/Agenda.css';

export default function MarcarConsulta({ paciente, token }) {
  const navigate = useNavigate();
  return (
    <div className="agenda-page">
      <div className="agenda-header">
        <button className="btn-agenda-back" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} /> Voltar ao Portal
        </button>
        <h1>Marcar Consulta</h1>
        <p>Olá {paciente?.nome?.split(' ')[0]}! Agende sua próxima consulta.</p>
      </div>
      <div className="agenda-body">
        <div className="agenda-placeholder-card">
          <Calendar size={56} style={{ color: '#00c9b1', opacity: 0.4 }} />
          <h3>Agendamento Online</h3>
          <p>
            Em breve você poderá marcar suas consultas diretamente por aqui. 
            Por enquanto, entre em contato com nossa equipe.
          </p>
          <a href="https://wa.me/5521999999999" target="_blank" rel="noreferrer" className="btn-agenda-wa">
            <Phone size={18} /> Agendar pelo WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
