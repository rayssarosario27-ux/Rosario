import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Star, Calendar } from 'lucide-react';
import '../styles/CorpoClinico.css';

const MEDICOS = [
  {
    nome: 'Dr. Eduardo Menezes',
    especialidade: 'Clínica Geral',
    crm: 'CRM 12345-RJ',
    formacao: 'Medicina — UFRJ · Residência UERJ',
    bio: 'Especialista em medicina preventiva com mais de 15 anos de experiência. Comprometido com o cuidado integral e humanizado do paciente.',
    estrelas: 5.0,
    consultas: '+2.400',
    destaque: true,
  },
  {
    nome: 'Dra. Ana Paula Lima',
    especialidade: 'Cardiologia',
    crm: 'CRM 54321-RJ',
    formacao: 'Medicina — PUC-Rio · Residência INCOR',
    bio: 'Cardiologista com especialização em cardiologia intervencionista e prevenção de doenças cardiovasculares.',
    estrelas: 4.9,
    consultas: '+1.800',
    destaque: false,
  },
  {
    nome: 'Dr. Carlos Drummond',
    especialidade: 'Pediatria',
    crm: 'CRM 67890-RJ',
    formacao: 'Medicina — UFF · Residência IFF/Fiocruz',
    bio: 'Pediatra dedicado ao desenvolvimento saudável de crianças e adolescentes, com foco em medicina preventiva pediátrica.',
    estrelas: 4.8,
    consultas: '+3.100',
    destaque: false,
  },
  {
    nome: 'Dr. Fábio Silveira',
    especialidade: 'Ortopedia',
    crm: 'CRM 11223-RJ',
    formacao: 'Medicina — UNIRIO · Fellow em Joelho',
    bio: 'Ortopedista especializado em cirurgia do joelho e quadril, procedimentos minimamente invasivos e reabilitação esportiva.',
    estrelas: 4.9,
    consultas: '+900',
    destaque: false,
  },
  {
    nome: 'Dra. Juliana Ramos',
    especialidade: 'Dermatologia',
    crm: 'CRM 33445-RJ',
    formacao: 'Medicina — UERJ · Residência UNB',
    bio: 'Dermatologista clínica e cirúrgica, com expertise em dermatoscopia, tratamento de acne, manchas e procedimentos estéticos médicos.',
    estrelas: 4.7,
    consultas: '+1.200',
    destaque: false,
  },
  {
    nome: 'Dra. Patrícia Costa',
    especialidade: 'Ginecologia',
    crm: 'CRM 55667-RJ',
    formacao: 'Medicina — UFRJ · Residência HUPE',
    bio: 'Ginecologista e obstetra focada na saúde integral da mulher em todas as fases da vida, do preventivo ao pré-natal.',
    estrelas: 4.8,
    consultas: '+2.000',
    destaque: false,
  },
];

export default function CorpoClinico() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('');

  const filtrados = MEDICOS.filter(
    (m) =>
      m.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      m.especialidade.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="cc-wrapper">
      {/* Nav */}
      <nav className="cc-nav">
        <div className="cc-nav-inner">
          <button className="cc-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Voltar
          </button>
          <div className="cc-nav-title">
            <Users size={20} />
            <span>Corpo Clínico</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="cc-hero">
        <h1>Conheça nossos especialistas</h1>
        <p>Profissionais altamente qualificados, comprometidos com sua saúde.</p>
        <input
          type="text"
          className="cc-filtro"
          placeholder="Buscar por nome ou especialidade..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="cc-content">
        <div className="cc-grid">
          {filtrados.map((m) => (
            <div key={m.nome} className={`cc-card ${m.destaque ? 'destaque' : ''}`}>
              {m.destaque && <div className="cc-destaque-badge">⭐ Diretor Clínico</div>}
              <div className="cc-avatar">
                <span>{m.nome.split(' ').map(p => p[0]).slice(0, 2).join('')}</span>
              </div>
              <h3 className="cc-nome">{m.nome}</h3>
              <span className="cc-esp-badge">{m.especialidade}</span>
              <p className="cc-crm">{m.crm}</p>
              <p className="cc-formacao">{m.formacao}</p>
              <p className="cc-bio">{m.bio}</p>
              <div className="cc-stats">
                <div className="cc-stat">
                  <Star size={13} /> <span>{m.estrelas.toFixed(1)}</span>
                </div>
                <div className="cc-stat">
                  <Calendar size={13} /> <span>{m.consultas} consultas</span>
                </div>
              </div>
              <button
                className="cc-btn-agendar"
                onClick={() => navigate('/agendamento')}
              >
                Agendar com {m.nome.split(' ')[0]} {m.nome.split(' ')[1]}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
