import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, User, Calendar, Heart, Stethoscope, Phone,
  Mail, Edit3, Camera, Check, X, AlertTriangle, ChevronRight,
  MapPin, Clock, RefreshCw, Shield, Home as HomeIcon, FileText
} from 'lucide-react';
import '../styles/Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatData(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('pt-BR');
}

function formatCPF(cpf) {
  if (!cpf) return '—';
  const d = cpf.replace(/\D/g, '');
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function diferencaMeses(data) {
  if (!data) return Infinity;
  const diff = Date.now() - new Date(data).getTime();
  return diff / (1000 * 60 * 60 * 24 * 30);
}

// ─── BIOMETRIA MODAL ──────────────────────────────────────────────────────────
function ModalBiometria({ token, onClose, onSalvo }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [etapa, setEtapa] = useState('permissao'); // permissao | camera | preview | sucesso | erro
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [erroMsg, setErroMsg] = useState('');
  const [countdown, setCountdown] = useState(0);

  const iniciarCamera = async () => {
    setErroMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setEtapa('camera');
    } catch (err) {
      setErroMsg('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
      setEtapa('erro');
    }
  };

  const pararCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => () => pararCamera(), [pararCamera]);

  const capturar = () => {
    let c = 3;
    setCountdown(c);
    const interval = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(interval);
        setCountdown(0);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        setPreview(base64);
        pararCamera();
        setEtapa('preview');
      }
    }, 1000);
  };

  const recapturar = () => {
    setPreview(null);
    setEtapa('camera');
    iniciarCamera();
  };

  const confirmar = async () => {
    setUploading(true);
    setErroMsg('');
    try {
      const res = await fetch(`${API_URL}/api/auth/biometria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ face_data: preview })
      });
      const data = await res.json();
      if (data.sucesso) {
        setEtapa('sucesso');
        onSalvo(data.atualizada_em);
      } else {
        setErroMsg(data.erro || 'Erro ao salvar biometria');
      }
    } catch {
      setErroMsg('Erro de conexão');
    }
    setUploading(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card biometria-modal">
        <div className="modal-header">
          <div className="modal-title-row">
            <Camera size={20} />
            <h3>Atualizar Biometria Facial</h3>
          </div>
          <button className="btn-modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {etapa === 'permissao' && (
            <div className="bio-step">
              <div className="bio-icon-big">📷</div>
              <h4>Antes de começar</h4>
              <ul className="bio-instructions">
                <li>✅ Esteja em um ambiente bem iluminado</li>
                <li>✅ Olhe diretamente para a câmera</li>
                <li>✅ Remova óculos escuros ou chapéus</li>
                <li>✅ Mantenha a expressão neutra</li>
                <li>⏱️ O processo leva apenas alguns segundos</li>
              </ul>
              <button className="btn-bio-primary" onClick={iniciarCamera}>
                <Camera size={18} /> Ativar Câmera
              </button>
            </div>
          )}

          {etapa === 'camera' && (
            <div className="bio-step">
              <div className="bio-camera-wrap">
                <video ref={videoRef} className="bio-video" autoPlay playsInline muted />
                <div className="bio-oval-guide" />
                {countdown > 0 && <div className="bio-countdown">{countdown}</div>}
              </div>
              <p className="bio-hint">Posicione seu rosto dentro da moldura oval e clique em Capturar.</p>
              <button className="btn-bio-primary" onClick={capturar} disabled={countdown > 0}>
                {countdown > 0 ? `Capturando em ${countdown}...` : '📸 Capturar Foto'}
              </button>
            </div>
          )}

          {etapa === 'preview' && (
            <div className="bio-step">
              <div className="bio-preview-wrap">
                <img src={preview} alt="Prévia da biometria" className="bio-preview-img" />
              </div>
              <p className="bio-hint">A foto ficou boa? Se sim, confirme para salvar sua biometria.</p>
              <div className="bio-btn-row">
                <button className="btn-bio-secondary" onClick={recapturar}><RefreshCw size={16} /> Recapturar</button>
                <button className="btn-bio-primary" onClick={confirmar} disabled={uploading}>
                  {uploading ? 'Salvando...' : <><Check size={16} /> Confirmar</>}
                </button>
              </div>
              {erroMsg && <div className="bio-erro-msg">{erroMsg}</div>}
            </div>
          )}

          {etapa === 'sucesso' && (
            <div className="bio-step bio-sucesso">
              <div className="bio-icon-big">✅</div>
              <h4>Biometria Atualizada!</h4>
              <p>Sua biometria facial foi salva com sucesso.</p>
              <button className="btn-bio-primary" onClick={onClose}>Fechar</button>
            </div>
          )}

          {etapa === 'erro' && (
            <div className="bio-step">
              <div className="bio-icon-big">❌</div>
              <h4>Erro de Câmera</h4>
              <p>{erroMsg}</p>
              <button className="btn-bio-secondary" onClick={onClose}>Fechar</button>
            </div>
          )}
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}

// ─── EDIT PROFILE MODAL ───────────────────────────────────────────────────────
function ModalEditarPerfil({ perfil, token, onClose, onAtualizado }) {
  const [form, setForm] = useState({
    nome: perfil.nome || '',
    celular: perfil.celular || '',
    telefone: perfil.telefone || '',
    genero: perfil.genero || '',
    cep: perfil.cep || '',
    logradouro: perfil.logradouro || '',
    numero: perfil.numero || '',
    complemento: perfil.complemento || '',
    sem_complemento: perfil.sem_complemento || false,
    bairro: perfil.bairro || '',
    cidade: perfil.cidade || '',
    estado: perfil.estado || '',
    convenio: perfil.convenio || '',
    carteirinha: perfil.carteirinha || ''
  });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const buscarCEP = async (cep) => {
    const nums = cep.replace(/\D/g, '');
    if (nums.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${nums}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(prev => ({ ...prev, logradouro: data.logradouro || '', bairro: data.bairro || '', cidade: data.localidade || '', estado: data.uf || '' }));
      }
    } catch {}
  };

  const salvar = async () => {
    setSaving(true); setErro('');
    try {
      const res = await fetch(`${API_URL}/api/auth/perfil`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.sucesso) { onAtualizado(); onClose(); }
      else setErro(data.erro || 'Erro ao salvar');
    } catch { setErro('Erro de conexão'); }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card edit-modal">
        <div className="modal-header">
          <div className="modal-title-row"><Edit3 size={20} /><h3>Editar Perfil</h3></div>
          <button className="btn-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body scrollable">
          <div className="edit-row">
            <div className="edit-group full">
              <label>Nome completo</label>
              <input name="nome" value={form.nome} onChange={handleChange} />
            </div>
          </div>
          <div className="edit-row">
            <div className="edit-group">
              <label>Celular</label>
              <input name="celular" value={form.celular} onChange={handleChange} />
            </div>
            <div className="edit-group">
              <label>Telefone</label>
              <input name="telefone" value={form.telefone} onChange={handleChange} />
            </div>
          </div>
          <div className="edit-group full">
            <label>Gênero</label>
            <select name="genero" value={form.genero} onChange={handleChange}>
              <option value="">Selecione</option>
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
              <option value="outro">Outro</option>
              <option value="nao_informar">Prefiro não informar</option>
            </select>
          </div>

          <div className="edit-section-title">Endereço</div>
          <div className="edit-row">
            <div className="edit-group" style={{ flex: '0 0 130px' }}>
              <label>CEP</label>
              <input name="cep" value={form.cep} onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
                setForm(p => ({ ...p, cep: v }));
                if (v.replace(/\D/g, '').length === 8) buscarCEP(v);
              }} placeholder="00000-000" />
            </div>
            <div className="edit-group">
              <label>Logradouro</label>
              <input name="logradouro" value={form.logradouro} onChange={handleChange} />
            </div>
            <div className="edit-group" style={{ flex: '0 0 80px' }}>
              <label>Número</label>
              <input name="numero" value={form.numero} onChange={handleChange} />
            </div>
          </div>
          <div className="edit-row">
            <div className="edit-group">
              <label>Complemento</label>
              <input name="complemento" value={form.complemento} onChange={handleChange} disabled={form.sem_complemento} placeholder={form.sem_complemento ? '—' : 'Apto, sala...'} />
              <label className="edit-checkbox">
                <input type="checkbox" name="sem_complemento" checked={form.sem_complemento} onChange={handleChange} />
                Não tenho complemento
              </label>
            </div>
          </div>
          <div className="edit-row">
            <div className="edit-group">
              <label>Bairro</label>
              <input name="bairro" value={form.bairro} onChange={handleChange} />
            </div>
            <div className="edit-group">
              <label>Cidade</label>
              <input name="cidade" value={form.cidade} onChange={handleChange} />
            </div>
            <div className="edit-group" style={{ flex: '0 0 70px' }}>
              <label>UF</label>
              <input name="estado" value={form.estado} onChange={handleChange} maxLength={2} />
            </div>
          </div>

          <div className="edit-section-title">Convênio</div>
          <div className="edit-row">
            <div className="edit-group">
              <label>Convênio</label>
              <input name="convenio" value={form.convenio} onChange={handleChange} placeholder="Nome do convênio" />
            </div>
            <div className="edit-group">
              <label>Carteirinha</label>
              <input name="carteirinha" value={form.carteirinha} onChange={handleChange} placeholder="Nº da carteirinha" />
            </div>
          </div>

          {erro && <div className="edit-erro-msg">{erro}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-modal-save" onClick={salvar} disabled={saving}>
            {saving ? 'Salvando...' : <><Check size={16} /> Salvar alterações</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD MAIN ───────────────────────────────────────────────────────────
export default function Dashboard({ paciente: pacienteInicial, token, setPaciente, onLogout }) {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [modalBio, setModalBio] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [biometriaAtualizadaEm, setBiometriaAtualizadaEm] = useState(null);

  const carregarPerfil = useCallback(async () => {
    setLoadingPerfil(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/perfil`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.sucesso) {
        setPerfil(data.paciente);
        setBiometriaAtualizadaEm(data.paciente.biometria_atualizada_em);
        setPaciente(prev => ({ ...prev, nome: data.paciente.nome }));
      } else if (res.status === 401) {
        onLogout();
        navigate('/auth');
      }
    } catch {}
    setLoadingPerfil(false);
  }, [token, onLogout, navigate, setPaciente]);

  const carregarConsultas = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/appointments/minhas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.sucesso) setConsultas(data.consultas || []);
    } catch {}
  }, [token]);

  useEffect(() => {
    carregarPerfil();
    carregarConsultas();
  }, [carregarPerfil, carregarConsultas]);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const mesesDesdeUpdate = biometriaAtualizadaEm ? diferencaMeses(biometriaAtualizadaEm) : Infinity;
  const biometriaVencida = mesesDesdeUpdate >= 3;
  const bioMesesRestantes = Math.max(0, Math.ceil(3 - mesesDesdeUpdate));

  const proximaConsulta = consultas.find(
    c => ['confirmado', 'agendado'].includes(c.status) && new Date(c.start_at) >= new Date()
  );

  if (loadingPerfil) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Carregando seu perfil...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="nav-logo">
            <Stethoscope size={22} />
            <span>Dr. Eduardo</span>
          </div>
        </div>
        <div className="navbar-right">
          <span className="user-name">👤 {perfil?.nome?.split(' ')[0] || pacienteInicial?.nome}</span>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        {/* Boas vindas */}
        <div className="welcome-section">
          <div className="welcome-text">
            <h1>Olá, {perfil?.nome?.split(' ')[0] || 'Paciente'}! 👋</h1>
            <p>Portal do Paciente — Clínica Dr. Eduardo</p>
          </div>
          <button className="btn-editar-perfil" onClick={() => setModalEdit(true)}>
            <Edit3 size={16} /> Editar Perfil
          </button>
        </div>

        {/* Alerta biometria */}
        {biometriaVencida && (
          <div className="alerta-biometria">
            <AlertTriangle size={20} />
            <div>
              <strong>Biometria facial desatualizada</strong>
              <span>Sua biometria deve ser atualizada a cada 3 meses. Clique para atualizar.</span>
            </div>
            <button onClick={() => setModalBio(true)}>Atualizar agora</button>
          </div>
        )}

        <div className="dashboard-grid">
          {/* Informações pessoais */}
          <div className="dash-card perfil-card">
            <div className="card-header">
              <div className="card-icon"><User size={20} /></div>
              <h3>Meus Dados</h3>
            </div>
            <div className="perfil-info-list">
              <InfoRow label="Nome" value={perfil?.nome} />
              <InfoRow label="CPF" value={formatCPF(perfil?.cpf)} />
              <InfoRow label="Email" value={perfil?.email} icon={<Mail size={13} />} />
              <InfoRow label="Celular" value={perfil?.celular} icon={<Phone size={13} />} />
              <InfoRow label="Nascimento" value={formatData(perfil?.data_nascimento)} />
              <InfoRow label="Gênero" value={perfil?.genero} />
              {perfil?.logradouro && (
                <InfoRow
                  label="Endereço"
                  icon={<MapPin size={13} />}
                  value={[
                    perfil.logradouro,
                    perfil.numero ? `nº ${perfil.numero}` : '',
                    !perfil.sem_complemento && perfil.complemento ? perfil.complemento : '',
                    perfil.bairro,
                    perfil.cidade && perfil.estado ? `${perfil.cidade}/${perfil.estado}` : ''
                  ].filter(Boolean).join(' — ')}
                />
              )}
            </div>
          </div>

          {/* Convênio + Biometria */}
          <div className="dash-card convenio-card">
            <div className="card-header">
              <div className="card-icon"><Heart size={20} /></div>
              <h3>Convênio</h3>
            </div>
            {perfil?.convenio ? (
              <div className="convenio-info">
                <div className="convenio-badge">{perfil.convenio}</div>
                <InfoRow label="Carteirinha" value={perfil.carteirinha} />
              </div>
            ) : (
              <p className="text-muted">Atendimento particular</p>
            )}

            <div className="bio-section">
              <div className="card-header" style={{ marginTop: 20 }}>
                <div className="card-icon"><Shield size={20} /></div>
                <h3>Biometria Facial</h3>
              </div>
              {biometriaVencida ? (
                <div className="bio-status vencida">
                  <AlertTriangle size={15} />
                  <span>Desatualizada — requer atualização</span>
                </div>
              ) : (
                <div className="bio-status ok">
                  <Check size={15} />
                  <span>
                    Atualizada em {formatData(biometriaAtualizadaEm)}
                    {bioMesesRestantes > 0 && ` · expira em ${bioMesesRestantes} mês${bioMesesRestantes > 1 ? 'es' : ''}`}
                  </span>
                </div>
              )}
              <button className="btn-bio-atualizar" onClick={() => setModalBio(true)}>
                <Camera size={15} /> Atualizar biometria
              </button>
            </div>
          </div>

          {/* Próxima consulta */}
          <div className="dash-card consulta-card">
            <div className="card-header">
              <div className="card-icon"><Calendar size={20} /></div>
              <h3>Próxima Consulta</h3>
            </div>
            {proximaConsulta ? (
              <div className="consulta-info">
                <div className="consulta-data"><Calendar size={16} /> {formatData(proximaConsulta.start_at)}</div>
                <div className="consulta-hora"><Clock size={16} /> {new Date(proximaConsulta.start_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                {proximaConsulta.service_nome && <div className="consulta-tipo"><Stethoscope size={14} /> {proximaConsulta.service_nome}</div>}
                {proximaConsulta.provider_nome && <div className="consulta-medico"><User size={14} /> Dr(a). {proximaConsulta.provider_nome}</div>}
                <div className={`consulta-status ${proximaConsulta.status}`}>{proximaConsulta.status}</div>
              </div>
            ) : (
              <div className="sem-consulta">
                <Calendar size={40} style={{ opacity: 0.2 }} />
                <p>Nenhuma consulta agendada</p>
                <button className="btn-agendar-aqui" onClick={() => navigate('/marcar-consulta')}>
                  Agendar consulta <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Histórico */}
          <div className="dash-card historico-card">
            <div className="card-header">
              <div className="card-icon"><FileText size={20} /></div>
              <h3>Histórico de Consultas</h3>
            </div>
            {consultas.length > 0 ? (
              <div className="historico-list">
                {consultas.slice(0, 6).map(c => (
                  <div key={c.id} className="historico-item">
                    <div className="historico-data">{formatData(c.start_at)}</div>
                    <div className="historico-desc">{c.service_nome || 'Consulta'}{c.provider_nome ? ` — Dr(a). ${c.provider_nome}` : ''}</div>
                    <div className={`historico-status ${c.status}`}>{c.status}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">Nenhuma consulta no histórico ainda.</p>
            )}
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="quick-actions">
          <h3>Ações Rápidas</h3>
          <div className="actions-row">
            <button className="quick-btn primary" onClick={() => navigate('/marcar-consulta')}>
              <Calendar size={18} /> Agendar Consulta
            </button>
            <button className="quick-btn" onClick={() => navigate('/exames')}>
              <FileText size={18} /> Meus Exames
            </button>
            <button className="quick-btn" onClick={() => setModalEdit(true)}>
              <Edit3 size={18} /> Editar Perfil
            </button>
            <button className="quick-btn" onClick={() => navigate('/')}>
              <HomeIcon size={18} /> Página Inicial
            </button>
          </div>
        </div>
      </div>

      {/* Modais */}
      {modalBio && (
        <ModalBiometria
          token={token}
          onClose={() => setModalBio(false)}
          onSalvo={(dt) => { setBiometriaAtualizadaEm(dt); setModalBio(false); }}
        />
      )}
      {modalEdit && perfil && (
        <ModalEditarPerfil
          perfil={perfil}
          token={token}
          onClose={() => setModalEdit(false)}
          onAtualizado={carregarPerfil}
        />
      )}
    </div>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <div className="perfil-row">
      <span className="perfil-label">{icon && <span style={{ marginRight: 4 }}>{icon}</span>}{label}</span>
      <span className="perfil-value">{value || '—'}</span>
    </div>
  );
}
