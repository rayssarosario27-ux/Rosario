import React, { useState, useEffect, useCallback } from 'react';
import { Users, Calendar, TrendingUp, MessageCircle, Plus, Filter, RefreshCw } from 'lucide-react';
import '../../styles/admin/CRM.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const STATUS_COLUNAS = [
  { id: 'novo',          label: '🆕 Novos',           cor: '#6c757d' },
  { id: 'interessado',   label: '🔥 Interessados',     cor: '#fd7e14' },
  { id: 'quer_agendar',  label: '📅 Quer Agendar',    cor: '#0d6efd' },
  { id: 'agendado',      label: '✅ Agendados',        cor: '#198754' },
  { id: 'perdido',       label: '❌ Perdidos',         cor: '#dc3545' },
  { id: 'sem_resposta',  label: '🔇 Sem Resposta',    cor: '#adb5bd' },
];

export default function CRM() {
  const [leads, setLeads] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [filtroUnidade, setFiltroUnidade] = useState('');
  const [modalLead, setModalLead] = useState(null);
  const [novoLead, setNovoLead] = useState({ nome: '', telefone: '', canal: 'whatsapp' });
  const [mostrarFormNovoLead, setMostrarFormNovoLead] = useState(false);

  const token = localStorage.getItem('token');
  const usuarioData = JSON.parse(localStorage.getItem('usuario') || localStorage.getItem('paciente') || '{}');
  const clinicId = usuarioData.clinic_id || 1;

  const carregarLeads = useCallback(async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams({ clinic_id: clinicId, limit: 200 });
      if (filtroUnidade) params.append('unit_id', filtroUnidade);
      const res = await fetch(`${API_URL}/api/leads?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.sucesso) setLeads(data.leads || []);
    } catch (err) {
      console.error('Erro ao carregar leads:', err);
    } finally {
      setCarregando(false);
    }
  }, [filtroUnidade, token, clinicId]);

  useEffect(() => { carregarLeads(); }, [carregarLeads]);

  const leadsPorStatus = (status) => leads.filter(l => l.status === status);

  const mudarStatus = async (leadId, novoStatus) => {
    try {
      await fetch(`${API_URL}/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: novoStatus, ator: 'humano' })
      });
      carregarLeads();
    } catch (err) {
      console.error('Erro ao mudar status:', err);
    }
  };

  const criarLead = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...novoLead, clinic_id: clinicId })
      });
      const data = await res.json();
      if (data.sucesso) {
        setMostrarFormNovoLead(false);
        setNovoLead({ nome: '', telefone: '', canal: 'whatsapp' });
        carregarLeads();
      }
    } catch (err) {
      console.error('Erro ao criar lead:', err);
    }
  };

  const totalLeads = leads.length;
  const totalAgendados = leads.filter(l => l.status === 'agendado').length;
  const totalInteressados = leads.filter(l => ['interessado', 'quer_agendar'].includes(l.status)).length;

  return (
    <div className="crm-container">
      <header className="crm-header">
        <div className="crm-header-left">
          <h1>🎯 CRM — Pipeline de Leads</h1>
          <p className="crm-subtitle">Funil comercial da clínica</p>
        </div>
        <div className="crm-header-actions">
          <button className="btn-icon" onClick={carregarLeads} title="Atualizar">
            <RefreshCw size={18} className={carregando ? 'spin' : ''} />
          </button>
          <button className="btn-primary" onClick={() => setMostrarFormNovoLead(true)}>
            <Plus size={18} /> Novo Lead
          </button>
        </div>
      </header>

      {/* Métricas rápidas */}
      <div className="crm-stats">
        <div className="crm-stat-card">
          <Users size={20} />
          <div>
            <p className="stat-num">{totalLeads}</p>
            <p className="stat-lab">Total de Leads</p>
          </div>
        </div>
        <div className="crm-stat-card">
          <TrendingUp size={20} />
          <div>
            <p className="stat-num">{totalInteressados}</p>
            <p className="stat-lab">Em negociação</p>
          </div>
        </div>
        <div className="crm-stat-card">
          <Calendar size={20} />
          <div>
            <p className="stat-num">{totalAgendados}</p>
            <p className="stat-lab">Agendados</p>
          </div>
        </div>
        <div className="crm-stat-card">
          <MessageCircle size={20} />
          <div>
            <p className="stat-num">
              {totalLeads > 0 ? Math.round((totalAgendados / totalLeads) * 100) : 0}%
            </p>
            <p className="stat-lab">Conversão</p>
          </div>
        </div>
      </div>

      {/* Kanban */}
      <div className="crm-kanban">
        {STATUS_COLUNAS.map(col => (
          <div key={col.id} className="kanban-col">
            <div className="kanban-col-header" style={{ borderTopColor: col.cor }}>
              <span>{col.label}</span>
              <span className="kanban-count">{leadsPorStatus(col.id).length}</span>
            </div>

            <div className="kanban-cards">
              {leadsPorStatus(col.id).map(lead => (
                <div
                  key={lead.id}
                  className="kanban-card"
                  onClick={() => setModalLead(lead)}
                >
                  <p className="card-nome">{lead.nome || '(sem nome)'}</p>
                  <p className="card-tel">📱 {lead.telefone}</p>
                  {lead.canal && (
                    <span className={`card-canal canal-${lead.canal}`}>{lead.canal}</span>
                  )}
                  {lead.tags && lead.tags.length > 0 && lead.tags[0] !== null && (
                    <div className="card-tags">
                      {lead.tags.map((tag, i) => (
                        <span key={i} className="card-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {leadsPorStatus(col.id).length === 0 && (
                <div className="kanban-empty">Nenhum lead</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: detalhe do lead */}
      {modalLead && (
        <div className="modal-overlay" onClick={() => setModalLead(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>👤 {modalLead.nome || '(sem nome)'}</h2>
            <p>📱 {modalLead.telefone}</p>
            <p>📧 {modalLead.email || '-'}</p>
            <p>Canal: <strong>{modalLead.canal}</strong></p>
            <p>Status atual: <strong>{modalLead.status}</strong></p>

            <div className="modal-status-actions">
              <p className="modal-label">Mover para:</p>
              {STATUS_COLUNAS.filter(c => c.id !== modalLead.status).map(col => (
                <button
                  key={col.id}
                  className="btn-status"
                  style={{ borderColor: col.cor, color: col.cor }}
                  onClick={() => { mudarStatus(modalLead.id, col.id); setModalLead(null); }}
                >
                  {col.label}
                </button>
              ))}
            </div>

            <button className="modal-close" onClick={() => setModalLead(null)}>Fechar</button>
          </div>
        </div>
      )}

      {/* Modal: novo lead */}
      {mostrarFormNovoLead && (
        <div className="modal-overlay" onClick={() => setMostrarFormNovoLead(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>➕ Novo Lead</h2>
            <form onSubmit={criarLead} className="form-novo-lead">
              <input
                placeholder="Nome"
                value={novoLead.nome}
                onChange={e => setNovoLead(p => ({ ...p, nome: e.target.value }))}
              />
              <input
                placeholder="Telefone *"
                required
                value={novoLead.telefone}
                onChange={e => setNovoLead(p => ({ ...p, telefone: e.target.value }))}
              />
              <select
                value={novoLead.canal}
                onChange={e => setNovoLead(p => ({ ...p, canal: e.target.value }))}
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="instagram">Instagram</option>
                <option value="site">Site</option>
                <option value="indicacao">Indicação</option>
              </select>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Salvar</button>
                <button type="button" onClick={() => setMostrarFormNovoLead(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
