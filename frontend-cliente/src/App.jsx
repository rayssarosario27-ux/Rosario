import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import '../styles/Home.css';

const Home = () => {
  const abrirWhatsZaya = () => {
    const numeroWhats = "5521999999999"; 
    const mensagem = encodeURIComponent("Olá Zaya! Preciso de ajuda com um agendamento.");
    window.open(`https://wa.me/${numeroWhats}?text=${mensagem}`, "_blank");
  };

  return (
    <div className="home-wrapper">
      {/* NAVBAR TURQUESA NO TOPO */}
      <nav className="home-nav">
        <div className="nav-container">
          <div className="home-logo">
            <div className="logo-icon-bg"><Stethoscope size={22} color="#fff" /></div>
            <div className="logo-text-box">
              <strong className="dr-name">CLÍNICA DR. EDUARDO</strong>
              <span className="dr-sub">EXCELÊNCIA EM SAÚDE</span>
            </div>
          </div>
          <div className="nav-actions">
            <Link to="/auth" className="btn-nav-outline">ENTRAR</Link>
            <Link to="/auth?mode=register" className="btn-nav-outline">CADASTRE-SE</Link>
          </div>
        </div>
      </nav>

      <main>
        {/* SEÇÃO ZAYA COM IMAGEM ÚNICA */}
        <section className="zaya-banner-section">
          <div className="zaya-banner-container">
            <img src="/zaya-banner.jpg" alt="Zaya Banner" className="zaya-full-img" />
            
            {/* BOTÃO QUE FICA EM CIMA DA IMAGEM */}
            <button className="btn-zaya-overlay" onClick={abrirWhatsZaya}>
              Fale com a Zaya
            </button>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="footer-container">
          <strong>CLÍNICA DR. EDUARDO</strong>
          <div className="footer-contact"><span>Barra da Tijuca, RJ</span></div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
