import React from 'react';
import { Calendar, Heart, LogOut, Users, Stethoscope } from 'lucide-react';
import '../styles/Dashboard.css';

export default function Dashboard({ paciente, setToken, setPaciente }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('paciente');
    setToken(null);
    setPaciente(null);
    window.location.href = '/';
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>🏥 Dr. Eduardo</h1>
        </div>
        <div className="navbar-right">
          <span className="user-name">👤 {paciente?.nome}</span>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} /> Sair
          </button>
        </div>
      </nav>

      <div className="welcome-section">
        <h1>👋 Bem-vindo, {paciente?.nome}!</h1>
        <p>Gerenciador de Consultas e Saúde</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Calendar size={24} />
          <p className="stat-label">Próxima Consulta</p>
          <p className="stat-value">Sem agendamentos</p>
        </div>

        <div className="stat-card">
          <Heart size={24} />
          <p className="stat-label">Convênio</p>
          <p className="stat-value">{paciente?.convenio || 'Particular'}</p>
        </div>

        <div className="stat-card">
          <Stethoscope size={24} />
          <p className="stat-label">Última Consulta</p>
          <p className="stat-value">-</p>
        </div>

        <div className="stat-card">
          <Users size={24} />
          <p className="stat-label">Médicos</p>
          <p className="stat-value">5 Disponíveis</p>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn-agendar" onClick={() => window.location.href = '/agendar'}>
          📅 Agendar Consulta
        </button>
        <button className="btn-historico">📋 Meu Histórico</button>
        <button className="btn-perfil">👤 Editar Perfil</button>
      </div>
    </div>
  );
}