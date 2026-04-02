import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Phone } from 'lucide-react';
import '../styles/Agenda.css';

export default function ExamesOnline({ paciente }) {
  const navigate = useNavigate();
  return (
    <div className="agenda-page">
      <div className="agenda-header">
        <button className="btn-agenda-back" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} /> Voltar ao Portal
        </button>
        <h1>Exames Online</h1>
        <p>Olá {paciente?.nome?.split(' ')[0]}! Aqui você encontra seus exames e resultados.</p>
      </div>
      <div className="agenda-body">
        <div className="agenda-placeholder-card">
          <FileText size={56} style={{ color: '#00c9b1', opacity: 0.4 }} />
          <h3>Resultados de Exames</h3>
          <p>
            Área em desenvolvimento. Em breve seus resultados de exames estarão disponíveis 
            aqui de forma segura e rápida.
          </p>
          <a href="https://wa.me/5521999999999" target="_blank" rel="noreferrer" className="btn-agenda-wa">
            <Phone size={18} /> Solicitar pelo WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
