import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Phone, Star, Navigation } from 'lucide-react';
import '../styles/Unidades.css';

const UNIDADES = [
  {
    nome: 'Clínica Dr. Eduardo — Barra da Tijuca',
    endereco: 'Av. das Américas, 4200 — Barra da Tijuca, Rio de Janeiro — RJ',
    telefone: '(21) 97311-3276',
    horario: 'Seg–Sex: 8h–20h · Sáb: 8h–14h',
    estrelas: 4.9,
    avaliações: 312,
    principal: true,
    mapUrl:
      'https://maps.google.com/maps?q=Barra+da+Tijuca,+Rio+de+Janeiro&t=&z=14&ie=UTF8&iwloc=&output=embed',
    mapsLink: 'https://www.google.com/maps/search/Clínica+Dr.+Eduardo+Barra+da+Tijuca',
  },
];

export default function Unidades() {
  const navigate = useNavigate();

  return (
    <div className="un-wrapper">
      {/* Nav */}
      <nav className="un-nav">
        <div className="un-nav-inner">
          <button className="un-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Voltar
          </button>
          <div className="un-nav-title">
            <MapPin size={20} />
            <span>Nossas Unidades</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="un-hero">
        <h1>Encontre a unidade mais próxima</h1>
        <p>Atendimento de excelência na Barra da Tijuca, Rio de Janeiro.</p>
      </div>

      <div className="un-content">
        {UNIDADES.map((u) => (
          <div key={u.nome} className="un-card">
            {u.principal && <div className="un-principal-badge">📍 Unidade Principal</div>}

            {/* Mapa */}
            <div className="un-map-frame">
              <iframe
                title={u.nome}
                src={u.mapUrl}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Info */}
            <div className="un-info-body">
              <h2 className="un-nome">{u.nome}</h2>

              <div className="un-rating">
                <Star size={15} className="un-star" />
                <strong>{u.estrelas.toFixed(1)}</strong>
                <span>({u.avaliações} avaliações)</span>
              </div>

              <div className="un-detail-list">
                <div className="un-detail-item">
                  <div className="un-detail-icon"><MapPin size={16} /></div>
                  <span>{u.endereco}</span>
                </div>
                <div className="un-detail-item">
                  <div className="un-detail-icon"><Clock size={16} /></div>
                  <span>{u.horario}</span>
                </div>
                <div className="un-detail-item">
                  <div className="un-detail-icon"><Phone size={16} /></div>
                  <span>{u.telefone}</span>
                </div>
              </div>

              <div className="un-actions">
                <a
                  href={u.mapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="un-btn-ghost"
                >
                  <Navigation size={16} /> Como Chegar
                </a>
                <button
                  className="un-btn-primary"
                  onClick={() => navigate('/agendamento')}
                >
                  Agendar Consulta
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
