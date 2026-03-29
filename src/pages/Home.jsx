import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, MessageCircle, ChevronRight, Bone, Activity, ShieldCheck, HeartPulse } from 'lucide-react';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-wrapper">
      <nav className="home-nav">
        <div className="nav-container">
          <div className="home-logo">
            <div className="logo-icon"><Stethoscope size={24} color="white" /></div>
            <div className="logo-text">
              <span className="logo-dr">DR.</span>
              <span className="logo-name">Eduardo</span>
            </div>
          </div>
          <div className="nav-links">
            <a href="#clinica">A Clínica</a>
            <a href="#especialidades">Especialidades</a>
            <Link to="/auth" className="btn-portal">Portal do Paciente</Link>
          </div>
        </div>
      </nav>

      <main className="home-hero">
        <div className="hero-grid">
          <div className="hero-content">
            <h1 className="hero-headline">
              Para tudo que <span>você precisar.</span>
            </h1>
            <p className="hero-subtext">
              Cuidado especializado em Ortopedia e Traumatologia. Nossa clínica une tecnologia e humanização para devolver sua mobilidade e qualidade de vida.
            </p>
            <button className="btn-main-green">Agendar consulta</button>
          </div>
          <div className="hero-image-container">
            {/* Aqui você pode colocar uma imagem real depois, por enquanto o estilo cuida disso */}
            <div className="hero-image-placeholder">
               <img src="https://img.freepik.com/fotos-gratis/sorridente-medico-feminino-com-prancheta-no-hospital_23-2148850739.jpg" alt="Médica" />
            </div>
          </div>
        </div>

        {/* CARDS DE SERVIÇOS (IGUAL AO PRINT) */}
        <div className="services-grid">
          <div className="service-card">
            <div className="s-icon blue"><Activity size={24} /></div>
            <h3>Qualidade de vida</h3>
            <p>Foco total na sua recuperação e bem-estar diário.</p>
          </div>
          <div className="service-card">
            <div className="s-icon green"><Bone size={24} /></div>
            <h3>Ortopedia</h3>
            <p>Tratamentos especializados em coluna, joelho e ombro.</p>
          </div>
          <div className="service-card">
            <div className="s-icon purple"><ShieldCheck size={24} /></div>
            <h3>Traumatologia</h3>
            <p>Atendimento ágil para lesões e fraturas de urgência.</p>
          </div>
          <div className="service-card">
            <div className="s-icon cyan"><HeartPulse size={24} /></div>
            <h3>Fisioterapia</h3>
            <p>Reabilitação completa com acompanhamento médico.</p>
          </div>
        </div>
      </main>

      <a href="https://wa.me/seu_numero" className="whatsapp-float" target="_blank" rel="noreferrer">
        <MessageCircle size={24} />
        <span>Agendar via WhatsApp</span>
      </a>
    </div>
  );
};
export default Home;
 {/* teste
 */}
