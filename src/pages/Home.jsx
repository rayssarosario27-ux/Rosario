import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, MessageCircle, ChevronRight } from 'lucide-react';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="header-container">
        <div className="logo-section">
          <div className="logo-icon"><Stethoscope size={28} /></div>
          <div className="logo-text"><h1>DR.</h1><span>Eduardo</span></div>
        </div>
        <nav className="nav-menu">
          <Link to="/auth" className="nav-link portal">Portal do Paciente</Link>
          <Link to="/auth" className="nav-link agendar">Agendar Consulta</Link>
        </nav>
      </header>

      <main className="hero-section">
        <div className="badge-group">
          <span className="badge">✨ Ortopedia</span>
          <span className="badge whatsapp-badge">💬 WhatsApp 24h</span>
        </div>
        <h1 className="hero-title">Compromisso com sua <span>saúde</span>.</h1>
        <p className="hero-subtitle">Clínica de alta qualidade e responsabilidade com suporte 24h.</p>
        <Link to="/auth" className="cta-button">Agendar Agora <ChevronRight size={20} /></Link>
      </main>

      <a href="https://wa.me/SEUNUMERO" className="whatsapp-float" target="_blank" rel="noreferrer">
        <MessageCircle size={30} />
      </a>
    </div>
  );
};
export default Home;