import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope } from 'lucide-react';
import '../styles/Agenda.css';

const medicos = [
  { nome: 'Dr. Eduardo', especialidade: 'Clínica Geral', crm: 'CRM-RJ 00001', disponivel: true },
  { nome: 'Dra. Ana Lima', especialidade: 'Cardiologia', crm: 'CRM-RJ 00002', disponivel: true },
  { nome: 'Dr. Carlos Mota', especialidade: 'Ortopedia', crm: 'CRM-RJ 00003', disponivel: false },
  { nome: 'Dra. Fernanda', especialidade: 'Dermatologia', crm: 'CRM-RJ 00004', disponivel: true },
  { nome: 'Dr. Paulo Saúde', especialidade: 'Neurologia', crm: 'CRM-RJ 00005', disponivel: true },
];

export default function CorpoClinico() {
  const navigate = useNavigate();
  return (
    <div className="agenda-page">
      <div className="agenda-header">
        <button className="btn-agenda-back" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} /> Voltar ao Portal
        </button>
        <h1>Corpo Clínico</h1>
        <p>Conheça nossa equipe de especialistas</p>
      </div>
      <div className="agenda-body">
        <div className="corpo-clinico-grid">
          {medicos.map(m => (
            <div key={m.nome} className="medico-card">
              <div className="medico-avatar">
                <Stethoscope size={28} style={{ color: '#00c9b1' }} />
              </div>
              <h4>{m.nome}</h4>
              <p className="medico-esp">{m.especialidade}</p>
              <p className="medico-crm">{m.crm}</p>
              <div className={`medico-disponivel ${m.disponivel ? 'sim' : 'nao'}`}>
                {m.disponivel ? '✅ Disponível' : '⏳ Indisponível'}
              </div>
              {m.disponivel && (
                <button className="btn-agendar-medico" onClick={() => navigate('/marcar-consulta')}>
                  Agendar consulta
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
