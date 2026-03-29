import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, MessageCircle, ChevronRight, Activity } from 'lucide-react';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-wrapper">
      {/* NAVBAR */}
      <nav className="home-nav">
        <div className="nav-container">
          <div className="home-logo">
            <div className="logo-icon">
              <Stethoscope size={24} color="white" />
            </div>
            <div className="logo-text">
              <span className="logo-dr">DR.</span>
              <span className="logo-name">Eduardo</span>
            </div>
          </div>
          <div className="cta-group">
            <Link to="/auth" className="cta-secondary">Portal do Paciente</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="home-hero">
        <div className="hero-grid">
          <div className="hero-content">
            <span className="badge-premium">✨ Especialista em Ortopedia</span>
            <h1 className="hero-headline">
              Compromisso total com a sua <span>saúde.</span>
            </h1>
            <p className="hero-subtext">
              Clínica de alta performance e responsabilidade com suporte 24h para você e sua família.
            </p>
            <div className="cta-group">
              <Link to="/auth" className="btn-hero-main">
                Agendar Agora <ChevronRight size={20} />
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="blob-bg"></div>
            {/* Se tiver uma imagem do médico, coloque aqui. Se não, o card flutuante já ajuda */}
            <div className="floating-card">
              <div className="logo-icon green-light">
                <Activity size={24} />
              </div>
              <div>
                <p style={{ fontWeight: 700, margin: 0 }}>Atendimento 24h</p>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Suporte via WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BOTÃO FLUTUANTE WHATSAPP */}
      <a 
        href="https://wa.me/SEUNUMERO" 
        className="whatsapp-float" 
        target="_blank" 
        rel="noreferrer"
      >
        <MessageCircle size={24} />
        <span className="float-text">Dúvidas? Fale conosco</span>
      </a>
    </div>
  );
};

export default Home;