import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Stethoscope, Calendar, FileText, Search, MapPin,
  MessageCircle, Accessibility, Eye, Phone, Navigation,
  Clock, Star, User
} from 'lucide-react';
import '../styles/Home.css';

const WHATSAPP_ZAYA = `https://wa.me/5521973113276?text=${encodeURIComponent('Olá Zaya! Preciso de ajuda com um agendamento.')}`;
const WHATSAPP_EQUIPE = `https://wa.me/5521973113276?text=${encodeURIComponent('Olá! Gostaria de mais informações sobre a Clínica Dr. Eduardo.')}`;

const Home = ({ paciente }) => {
  const navigate = useNavigate();
  const [enderecoSearch, setEnderecoSearch] = useState('');
  const [buscando, setBuscando] = useState(false);

  const isLogado = !!paciente;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;
    script.onload = () => {
      if (window.VLibras) new window.VLibras.Widget('https://vlibras.gov.br/app');
    };
    document.body.appendChild(script);
    return () => { if (script.parentNode) document.body.removeChild(script); };
  }, []);

  const buscarClinica = () => {
    const q = enderecoSearch.trim();
    const query = q
      ? `Clínica médica perto de ${q}, Rio de Janeiro`
      : 'Clínica Dr. Eduardo Barra da Tijuca Rio de Janeiro';
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');
  };

  const usarLocalizacao = () => {
    setBuscando(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setBuscando(false);
          window.open(
            `https://www.google.com/maps/search/Clínica+médica/@${coords.latitude},${coords.longitude},15z`,
            '_blank'
          );
        },
        () => {
          setBuscando(false);
          window.open('https://www.google.com/maps/search/Clínica+Dr.+Eduardo+Barra+da+Tijuca', '_blank');
        }
      );
    } else {
      setBuscando(false);
      window.open('https://www.google.com/maps/search/Clínica+Dr.+Eduardo+Barra+da+Tijuca', '_blank');
    }
  };

  // First 3 cards: navigate to login if not logged in; to page if logged in
  const handleServiceCard = (route) => {
    if (isLogado) navigate(route);
    else navigate('/auth');
  };

  const servicos = [
    { icon: <Calendar size={28} />, label: 'Marcar Consulta', route: '/marcar-consulta' },
    { icon: <FileText size={28} />, label: 'Exames Online',   route: '/exames' },
    { icon: <Search size={28} />,   label: 'Corpo Clínico',   route: '/corpo-clinico' },
    { icon: <MapPin size={28} />,   label: 'Unidades',        route: null }, // scroll para mapa
  ];

  return (
    <div className="home-wrapper">
      {/* VLibras Acessibilidade */}
      <div vw="true" className="enabled">
        <div vw-access-button="true" className="active"></div>
        <div vw-plugin-wrapper="true">
          <div className="vw-plugin-top-wrapper"></div>
        </div>
      </div>

      {/* Barra de Acessibilidade */}
      <div className="accessibility-bar">
        <div className="acc-container">
          <button className="acc-btn"><Accessibility size={13} /> Alto Contraste</button>
          <button className="acc-btn"><Eye size={13} /> Aumentar Fonte</button>
        </div>
      </div>

      {/* Navbar */}
      <nav className="home-nav">
        <div className="nav-container">
          <div className="home-logo">
            <div className="logo-icon-bg">
              <Stethoscope size={22} color="#fff" />
            </div>
            <div className="logo-text-box">
              <strong className="dr-name">CLÍNICA DR. EDUARDO</strong>
              <span className="dr-sub">EXCELÊNCIA EM SAÚDE</span>
            </div>
          </div>
          <div className="nav-actions">
            {isLogado ? (
              <>
                <Link to="/dashboard" className="btn-nav-ghost">
                  <User size={15} style={{ marginRight: 5 }} />
                  {paciente.nome?.split(' ')[0]}
                </Link>
                <Link to="/marcar-consulta" className="btn-nav-solid">Agendar</Link>
              </>
            ) : (
              <>
                <Link to="/auth" className="btn-nav-ghost">Entrar</Link>
                <Link to="/auth?mode=register" className="btn-nav-solid">Agendar</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* Banner Zaya */}
        <section className="zaya-banner-section">
          <div className="zaya-banner-container">
            <img src="/zaya-banner.jpg" alt="Fale com a Zaya" className="zaya-full-img"
              onError={(e) => { e.target.style.display = 'none'; }} />
            <button
              className="btn-zaya-overlay"
              onClick={() => window.open(WHATSAPP_ZAYA, '_blank')}
              aria-label="Fale com a Zaya no WhatsApp"
            />
          </div>
        </section>

        {/* Hero */}
        <section className="home-hero">
          <div className="hero-content">
            <span className="hero-tag">Cuidado que você merece</span>
            <h1 className="hero-title">
              AGENDAMENTO DE<br />
              <span>CONSULTAS ONLINE</span>
            </h1>
            <p className="hero-desc">
              Recupere sua qualidade de vida com atendimento especializado.
              Agende sua consulta com rapidez e segurança.
            </p>
            <div className="hero-cta-group">
              <button
                className="btn-primary-cta"
                onClick={() => isLogado ? navigate('/marcar-consulta') : navigate('/auth?mode=register')}
              >
                Agendar Agora
              </button>
              <a href={WHATSAPP_EQUIPE} className="btn-secondary-cta" target="_blank" rel="noreferrer">
                <Phone size={16} /> Falar com a Equipe
              </a>
            </div>
          </div>
          <div className="hero-image">
            <img
              src="/dr-eduardo.jpg"
              alt="Dr. Eduardo"
              onError={(e) => (e.target.style.display = 'none')}
            />
          </div>
        </section>

        {/* Serviços */}
        <section className="services-section">
          <div className="services-inner">
            <div className="section-header">
              <span className="section-tag">O que oferecemos</span>
              <h2 className="section-title">Serviços mais procurados</h2>
            </div>
            <div className="services-grid">
              {servicos.map(({ icon, label, route }, idx) => (
                <div
                  key={label}
                  className="service-card"
                  onClick={() => {
                    if (idx < 3) handleServiceCard(route);
                    else document.querySelector('.clinica-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && (idx < 3 ? handleServiceCard(route) : null)}
                >
                  <div className="service-icon">{icon}</div>
                  <span>{label}</span>
                  {idx < 3 && !isLogado && (
                    <span className="service-login-hint">Faça login para acessar</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Assistente — Zaya profile */}
        <section className="dora-section">
          <div className="dora-container">
            <div className="zaya-profile-card">
              <div className="zaya-avatar">
                <img
                  src="/zaya-perfil.jpg"
                  alt="Zaya — Assistente Virtual"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.classList.add('zaya-avatar-fallback');
                  }}
                />
                <span className="zaya-avatar-initials">Z</span>
              </div>
              <div className="zaya-profile-info">
                <div className="zaya-name">Zaya</div>
                <div className="zaya-title">Assistente Virtual — Clínica Dr. Eduardo</div>
                <div className="zaya-status"><span className="zaya-dot"></span> Online agora</div>
              </div>
            </div>
            <h3>FALE COM A NOSSA ASSISTENTE 24HRS</h3>
            <p>Dúvidas? A Zaya está pronta para ajudar a qualquer momento pelo WhatsApp.</p>
            <button
              className="btn-dora"
              onClick={() => window.open(WHATSAPP_ZAYA, '_blank')}
            >
              Iniciar Conversa com a Zaya
            </button>
          </div>
        </section>

        {/* Encontre uma clínica */}
        <section className="clinica-section">
          <div className="clinica-inner">
            <div className="section-header centered">
              <span className="section-tag">Localização</span>
              <h2 className="section-title">Encontre uma unidade próxima</h2>
              <p className="clinica-desc">
                Digite seu endereço ou CEP para encontrar a unidade mais perto de você.
              </p>
            </div>

            <div className="clinica-search-box">
              <div className="clinica-input-wrap">
                <MapPin size={18} className="search-pin-icon" />
                <input
                  type="text"
                  className="clinica-input"
                  placeholder="Digite seu CEP ou bairro..."
                  value={enderecoSearch}
                  onChange={(e) => setEnderecoSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && buscarClinica()}
                />
              </div>
              <button className="btn-buscar" onClick={buscarClinica}>
                <Search size={16} /> Buscar
              </button>
              <button className="btn-localizar" onClick={usarLocalizacao} disabled={buscando}>
                <Navigation size={16} /> {buscando ? 'Localizando...' : 'Usar minha localização'}
              </button>
            </div>

            <div className="clinica-layout">
              <div className="clinica-map">
                <iframe
                  title="Localização da Clínica Dr. Eduardo"
                  src="https://maps.google.com/maps?q=Barra+da+Tijuca,+Rio+de+Janeiro&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="clinica-cards">
                <div className="clinica-card active">
                  <div className="clinica-card-header">
                    <div className="clinica-card-icon">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <strong className="clinica-name">Clínica Dr. Eduardo</strong>
                      <span className="clinica-tag-badge">Unidade Principal</span>
                    </div>
                  </div>
                  <div className="clinica-info">
                    <p><MapPin size={14} /> Barra da Tijuca, Rio de Janeiro — RJ</p>
                    <p><Clock size={14} /> Seg–Sex: 8h–20h &nbsp;|&nbsp; Sáb: 8h–14h</p>
                    <p><Star size={14} /> 4.9 · Atendimento Online Disponível</p>
                  </div>
                  <div className="clinica-card-btns">
                    <a
                      href="https://www.google.com/maps/search/Clínica+Dr.+Eduardo+Barra+da+Tijuca"
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ver-mapa"
                    >
                      Ver no mapa
                    </a>
                    <button
                      className="btn-agendar-clinica"
                      onClick={() => isLogado ? navigate('/marcar-consulta') : navigate('/auth?mode=register')}
                    >
                      Agendar consulta
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <strong>CLÍNICA DR. EDUARDO</strong>
            <span className="footer-tagline">Excelência em Saúde</span>
          </div>
          <div className="footer-contact">
            <span><MapPin size={13} /> Barra da Tijuca, RJ</span>
            <span>·</span>
            <span>(21) 99999-9999</span>
          </div>
        </div>
      </footer>

      {/* WhatsApp flutuante */}
      <a
        href="https://wa.me/5521973113276"
        className="whatsapp-float"
        target="_blank"
        rel="noreferrer"
        aria-label="Contato via WhatsApp"
      >
        <MessageCircle size={28} color="#fff" />
      </a>
    </div>
  );
};

export default Home;
