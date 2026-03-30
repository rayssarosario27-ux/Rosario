import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Stethoscope, Calendar, FileText, Search, MapPin, 
  MessageCircle, Accessibility, Eye
} from 'lucide-react';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;
    script.onload = () => {
      if (window.VLibras) {
        new window.VLibras.Widget('https://vlibras.gov.br/app');
      }
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return (
    <div className="home-wrapper">
      <div vw="true" className="enabled">
        <div vw-access-button="true" className="active"></div>
        <div vw-plugin-wrapper="true"><div className="vw-plugin-top-wrapper"></div></div>
      </div>

      <div className="accessibility-bar">
        <div className="acc-container">
          <button className="acc-btn"><Accessibility size={14} /> Alto Contraste</button>
          <button className="acc-btn"><Eye size={14} /> Aumentar Fonte</button>
        </div>
      </div>

      <nav className="home-nav">
        <div className="nav-container">
          <div className="home-logo">
            <div className="logo-icon-bg"><Stethoscope size={20} color="#00ced1" /></div>
            <div className="logo-text-box">
              <strong className="dr-name">CLÍNICA DR. EDUARDO</strong>
              <span className="dr-sub">EXCELÊNCIA EM SAÚDE</span>
            </div>
          </div>
          <div className="nav-actions">
            <Link to="/auth" className="btn-nav">ENTRAR</Link>
            <Link to="/auth?mode=register" className="btn-nav">CADASTRE-SE</Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="home-hero">
          <div className="hero-content">
            <span className="hero-tag">Cuidado que você merece</span>
            <h1 className="hero-title">AGENDAMENTO DE <br/><span>CONSULTAS ONLINE</span></h1>
            <p className="hero-desc">Recupere sua qualidade de vida com atendimento especializado e tecnologia de ponta.</p>
            <button className="btn-main-orange" onClick={() => navigate('/auth?mode=register')}>Agendar Agora</button>
          </div>
          <div className="hero-image">
            {/* Usando require direto para forçar o Webpack a achar a imagem */}
            <img 
              src={require('../assets/dr-eduardo.jpg')} 
              alt="Dr. Eduardo" 
              onError={(e) => e.target.style.display='none'}
            />
          </div>
        </section>

        <section className="services-section">
          <h2 className="section-title">Serviços mais procurados</h2>
          <div className="services-grid">
            <div className="service-card"><Calendar size={35} /><span>Marcar Consulta</span></div>
            <div className="service-card"><FileText size={35} /><span>Exames Online</span></div>
            <div className="service-card"><Search size={35} /><span>Corpo Clínico</span></div>
            <div className="service-card"><MapPin size={35} /><span>Unidades</span></div>
          </div>
        </section>

        <section className="dora-section">
          <div className="dora-container">
            <h3>FALE COM A NOSSA ASSISTENTE 24HRS</h3>
            <p>Dúvidas sobre preparo de exames ou horários? Nossa equipe está pronta para ajudar.</p>
            <button className="btn-dora">Iniciar Conversa</button>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="footer-container">
          <strong>CLÍNICA DR. EDUARDO</strong>
          <div className="footer-contact"><span>Barra da Tijuca, RJ</span><span> • </span><span>(21) 99999-9999</span></div>
        </div>
      </footer>

      <a href="https://wa.me/5521999999999" className="whatsapp-float" target="_blank" rel="noreferrer">
        <MessageCircle size={30} color="#fff" />
      </a>
    </div>
  );
};

export default Home;