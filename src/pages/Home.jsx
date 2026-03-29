import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Activity, Bone, HeartPulse, ShieldCheck, MapPin, Phone, Instagram } from 'lucide-react';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-wrapper">
      <nav className="home-nav">
        <div className="nav-container">
          <div className="home-logo">
            <strong>DR. EDUARDO</strong>
          </div>
          <div className="nav-links">
            <a href="#clinica">Início</a>
            <a href="#especialidades">Especialidades</a>
            <a href="#contato">Contato</a>
            <Link to="/auth" className="btn-agendar">Portal do Paciente</Link>
          </div>
        </div>
      </nav>

      <section className="home-hero">
        <div className="hero-content">
          <h1 className="hero-headline">Para tudo que <br/> você precisar.</h1>
          <p className="hero-subtext">O cuidado com a saúde é uma preocupação diária e importante. Somos a clínica pensada em ajudar você a atingir o melhor da sua qualidade de vida.</p>
          <button className="btn-main">Agendar consulta</button>
        </div>
        <div className="hero-img">
          <img src="https://img.freepik.com/fotos-gratis/equipe-medica-trabalhando-junta-no-hospital_23-2148850732.jpg" alt="Equipe Médica" />
        </div>
      </section>

      <div className="features-grid">
        <div className="feature-card">
          <Activity color="#00ced1" />
          <h3>Qualidade de vida</h3>
          <p>Tenha saúde e perspectiva com uma vida longa.</p>
        </div>
        <div className="feature-card">
          <HeartPulse color="#00ced1" />
          <h3>Exames</h3>
          <p>Laboratoriais e diagnósticos por imagem no local.</p>
        </div>
        <div className="feature-card">
          <Bone color="#00ced1" />
          <h3>Ortopedia</h3>
          <p>Especialista em ossos, articulações e traumatologia.</p>
        </div>
        <div className="feature-card">
          <ShieldCheck color="#00ced1" />
          <h3>Segurança</h3>
          <p>Atendimento humanizado e protocolos rígidos.</p>
        </div>
      </div>

      <section className="section-especialidades" id="especialidades">
        <h2>Que tipo de atendimento você está procurando?</h2>
        <div className="especialidades-grid">
          <div className="esp-item"><div className="esp-icon"><Bone/></div><span>Ortopedia</span></div>
          <div className="esp-item"><div className="esp-icon"><Activity/></div><span>Coluna</span></div>
          <div className="esp-item"><div className="esp-icon"><HeartPulse/></div><span>Fisioterapia</span></div>
          <div className="esp-item"><div className="esp-icon"><Stethoscope/></div><span>Traumatologia</span></div>
        </div>
      </section>

      <footer className="home-footer" id="contato">
        <div className="footer-grid">
          <div>
            <h3>DR. EDUARDO</h3>
            <p>Sua saúde é nossa prioridade. Atendimento especializado em Rio de Janeiro.</p>
            <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
              <Instagram size={20}/> <Phone size={20}/>
            </div>
          </div>
          <div>
            <h4>Especialidades</h4>
            <ul style={{listStyle:'none', padding:0, fontSize:'14px'}}>
              <li>Ortopedia Geral</li>
              <li>Cirurgia de Joelho</li>
              <li>Traumatologia</li>
            </ul>
          </div>
          <div>
            <h4>Endereço</h4>
            <p style={{fontSize:'14px'}}><MapPin size={14}/> Av. Principal, 123 - RJ</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;