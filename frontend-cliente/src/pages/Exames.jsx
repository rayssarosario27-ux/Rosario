import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Search, Stethoscope, Calendar } from 'lucide-react';
import '../styles/Exames.css';

const EXAMES_MOCK = [
  { id: 1, nome: 'Hemograma Completo', data: '15/03/2026', medico: 'Dr. Eduardo Menezes', status: 'Disponível', tipo: 'Laboratorial' },
  { id: 2, nome: 'Eletrocardiograma', data: '10/03/2026', medico: 'Dra. Ana Paula Lima', status: 'Disponível', tipo: 'Cardiológico' },
  { id: 3, nome: 'Raio-X Tórax', data: '02/03/2026', medico: 'Dr. Eduardo Menezes', status: 'Disponível', tipo: 'Imagem' },
  { id: 4, nome: 'Glicemia em Jejum', data: '22/02/2026', medico: 'Dr. Eduardo Menezes', status: 'Disponível', tipo: 'Laboratorial' },
  { id: 5, nome: 'Ultrassom Abdominal', data: '10/02/2026', medico: 'Dra. Juliana Ramos', status: 'Processando', tipo: 'Imagem' },
];

const TIPO_CORES = {
  'Laboratorial': '#00c9b1',
  'Cardiológico': '#f97316',
  'Imagem': '#6366f1',
};

export default function Exames() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');

  const filtrados = EXAMES_MOCK.filter(
    (e) =>
      e.nome.toLowerCase().includes(busca.toLowerCase()) ||
      e.medico.toLowerCase().includes(busca.toLowerCase()) ||
      e.tipo.toLowerCase().includes(busca.toLowerCase())
  );

  const handleDownload = (exame) => {
    alert(`Download do laudo "${exame.nome}" em breve estará disponível no portal.`);
  };

  return (
    <div className="ex-wrapper">
      {/* Nav */}
      <nav className="ex-nav">
        <div className="ex-nav-inner">
          <button className="ex-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Voltar
          </button>
          <div className="ex-nav-title">
            <FileText size={20} />
            <span>Meus Exames</span>
          </div>
        </div>
      </nav>

      <div className="ex-content">
        {/* Header card */}
        <div className="ex-hero-card">
          <div className="ex-hero-icon">
            <FileText size={32} />
          </div>
          <div>
            <h1>Portal de Laudos e Resultados</h1>
            <p>Acesse e baixe seus exames com segurança a qualquer hora.</p>
          </div>
        </div>

        {/* Busca */}
        <div className="ex-search-box">
          <Search size={18} className="ex-search-icon" />
          <input
            type="text"
            placeholder="Buscar por exame, médico ou tipo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="ex-search-input"
          />
        </div>

        {/* Lista */}
        {filtrados.length === 0 ? (
          <div className="ex-empty">
            <FileText size={48} />
            <p>Nenhum exame encontrado.</p>
          </div>
        ) : (
          <div className="ex-list">
            {filtrados.map((exame) => (
              <div key={exame.id} className="ex-card">
                <div
                  className="ex-card-badge"
                  style={{ background: TIPO_CORES[exame.tipo] || '#00c9b1' }}
                >
                  {exame.tipo}
                </div>
                <div className="ex-card-body">
                  <strong className="ex-card-nome">{exame.nome}</strong>
                  <span className="ex-card-meta">
                    <Stethoscope size={13} /> {exame.medico}
                  </span>
                  <span className="ex-card-meta">
                    <Calendar size={13} /> {exame.data}
                  </span>
                </div>
                <div className="ex-card-right">
                  <span className={`ex-status ${exame.status === 'Disponível' ? 'ok' : 'pending'}`}>
                    {exame.status}
                  </span>
                  {exame.status === 'Disponível' && (
                    <button className="ex-btn-download" onClick={() => handleDownload(exame)}>
                      <Download size={16} /> Baixar PDF
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
