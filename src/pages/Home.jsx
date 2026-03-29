// VERSÃO DEFINITIVA - SEM PASTA ROOT.

import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Activity, Bone, HeartPulse, ShieldCheck, MapPin, Phone, Instagram, MessageCircle } from 'lucide-react';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-wrapper">
      <nav className="home-nav">
        <div className="nav-container">
          <div className="home-logo">
            <Stethoscope size={28} color="#00ced1" />
            <strong>DR. EDUARDO</strong>
          </div>
          <div className="nav-links">
            <a href="#clinica">Início</a>
            <a href="#especialidades">Especialidades</a>
            <Link to="/auth" className="btn-agendar">Portal do Paciente</Link>
          </div>
        </div>
      </nav>

      <section className="home-hero">
        <div className="hero-content">
          <h1 className="hero-headline">Para tudo que <br/> <span>você precisar.</span></h1>
          <p className="hero-subtext">Cuidado especializado em Ortopedia e Traumatologia. Unimos tecnologia e humanização para sua total recuperação.</p>
          <button className="btn-main">Agendar consulta agora</button>
        </div>
        <div className="hero-img">
          <img src="https://img.freepik.com/fotos-gratis/equipe-medica-trabalhando-junta-no-hospital_23-2148850732.jpg" alt="Equipe Médica" />
        </div>
      </section>

      <div className="features-grid">
        <div className="feature-card">
          <Activity color="#00ced1" />
          <h3>Qualidade de vida</h3>
          <p>Foco na sua longevidade e bem-estar.</p>
        </div>
        <div className="feature-card">
          <Bone color="#00ced1" />
          <h3>Ortopedia</h3>
          <p>Especialista em ossos e articulações.</p>
        </div>
        <div className="feature-card">
          <HeartPulse color="#00ced1" />
          <h3>Exames</h3>
          <p>Diagnósticos precisos e rápidos.</p>
        </div>
        <div className="feature-card">
          <ShieldCheck color="#00ced1" />
          <h3>Segurança</h3>
          <p>Atendimento humanizado e ético.</p>
        </div>
      </div>

      <footer className="home-footer">
        <div className="footer-grid">
          <div>
            <h3>DR. EDUARDO</h3>
            <p>Sua saúde é nossa prioridade.</p>
          </div>
          <div>
            <p><MapPin size={14} /> Rio de Janeiro, RJ</p>
            <p><Phone size={14} /> (21) 99999-9999</p>
          </div>
        </div>
      </footer>

      <a href="https://wa.me/seunumero" className="whatsapp-float" target="_blank" rel="noreferrer">
        <MessageCircle size={24} />
        <span>Agendar via WhatsApp</span>
      </a>
    </div>
  );
};

export default Home;