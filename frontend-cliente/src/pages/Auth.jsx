import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, ArrowLeft, CreditCard, Phone, Smartphone,
  Hash, Calendar, ChevronRight, Eye, EyeOff, Home as HomeIcon, AlertCircle
} from 'lucide-react';
import '../styles/Auth.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ─── CPF validation ───────────────────────────────────────────────────────────
function validarCPF(cpf) {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(d[i]) * (10 - i);
  if (((s * 10) % 11) % 10 !== parseInt(d[9])) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(d[i]) * (11 - i);
  return ((s * 10) % 11) % 10 === parseInt(d[10]);
}

function formatCPF(v) {
  return v.replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
}

function formatCelular(v) {
  return v.replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
    .slice(0, 15);
}

export default function Auth({ onLogin, paciente }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [etapa, setEtapa] = useState('form'); // 'form' | 'verificar'
  const [pacienteIdPendente, setPacienteIdPendente] = useState(null);
  const [emailPendente, setEmailPendente] = useState('');
  const [codigoVerif, setCodigoVerif] = useState('');

  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [semConvenio, setSemConvenio] = useState(false);
  const [semComplemento, setSemComplemento] = useState(false);

  const [form, setForm] = useState({
    nome: '', cpf: '', data_nascimento: '', genero: '',
    celular: '', telefone: '',
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
    convenio: '', carteirinha: '',
    email: '', senha: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsLogin(params.get('mode') !== 'register');
  }, [location]);

  // Redirect if already logged in
  useEffect(() => {
    if (paciente) navigate('/dashboard', { replace: true });
  }, [paciente, navigate]);

  const handleChange = useCallback((e) => {
    let { name, value } = e.target;
    if (name === 'cpf') value = formatCPF(value);
    if (name === 'celular' || name === 'telefone') value = formatCelular(value);
    setForm(prev => ({ ...prev, [name]: value }));
    setErro('');
  }, []);

  // ─── Buscar CEP ──────────────────────────────────────────────────────────
  const buscarCEP = async (cep) => {
    const nums = cep.replace(/\D/g, '');
    if (nums.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${nums}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(prev => ({
          ...prev,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || ''
        }));
      }
    } catch {}
  };

  // ─── SUBMIT LOGIN ─────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setErro(''); setSucesso('');
    if (!form.email || !form.senha) return setErro('Preencha email e senha.');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login-paciente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, senha: form.senha })
      });
      const data = await res.json();
      if (data.sucesso) {
        onLogin(data.token, data.paciente);
        navigate('/dashboard');
      } else {
        setErro(data.erro || 'Erro ao entrar. Verifique seus dados.');
      }
    } catch {
      setErro('Erro de conexão com o servidor.');
    }
    setLoading(false);
  };

  // ─── SUBMIT REGISTRO ──────────────────────────────────────────────────────
  const handleRegistro = async (e) => {
    e.preventDefault();
    setErro(''); setSucesso('');

    if (!validarCPF(form.cpf)) return setErro('CPF inválido. Verifique os dígitos.');
    if (form.senha.length < 8) return setErro('A senha deve ter pelo menos 8 caracteres.');

    setLoading(true);
    try {
      const payload = {
        ...form,
        cpf: form.cpf.replace(/\D/g, ''),
        celular: form.celular.replace(/\D/g, ''),
        telefone: form.telefone.replace(/\D/g, ''),
        sem_complemento: semComplemento,
        complemento: semComplemento ? null : form.complemento,
        convenio: semConvenio ? null : form.convenio,
        carteirinha: semConvenio ? null : form.carteirinha
      };

      const res = await fetch(`${API_URL}/api/auth/registro-paciente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.sucesso) {
        setPacienteIdPendente(data.pacienteId);
        setEmailPendente(form.email);
        setEtapa('verificar');
      } else {
        setErro(data.erro || 'Erro ao cadastrar.');
      }
    } catch {
      setErro('Erro de conexão com o servidor.');
    }
    setLoading(false);
  };

  // ─── VERIFICAR EMAIL ──────────────────────────────────────────────────────
  const handleVerificarEmail = async (e) => {
    e.preventDefault();
    setErro(''); setSucesso('');
    if (codigoVerif.length !== 6) return setErro('O código deve ter 6 dígitos.');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verificar-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pacienteId: pacienteIdPendente, codigo: codigoVerif })
      });
      const data = await res.json();
      if (data.sucesso) {
        onLogin(data.token, data.paciente);
        navigate('/dashboard');
      } else {
        setErro(data.erro || 'Código inválido.');
      }
    } catch {
      setErro('Erro de conexão com o servidor.');
    }
    setLoading(false);
  };

  const switchMode = (toLogin) => {
    setIsLogin(toLogin);
    setErro('');
    setSucesso('');
    setEtapa('form');
  };

  // ─── EMAIL VERIFICATION SCREEN ────────────────────────────────────────────
  if (etapa === 'verificar') {
    return (
      <div className="auth-page">
        <div className="auth-hero">
          <div className="hero-overlay">
            <button onClick={() => navigate('/')} className="back-link">
              <ArrowLeft size={18} /> Voltar ao início
            </button>
            <div className="auth-hero-text">
              <h1>Quase lá! ✉️</h1>
              <p>Verificação de email para sua segurança.</p>
            </div>
          </div>
        </div>
        <div className="auth-form-container">
          <div className="form-box">
            <div className="verif-badge">✉️</div>
            <h2>Confirme seu Email</h2>
            <p className="verif-desc">
              Enviamos um código de 6 dígitos para <strong>{emailPendente}</strong>.
              Verifique sua caixa de entrada (e spam).
            </p>
            <form onSubmit={handleVerificarEmail}>
              <div className="input-group">
                <label>Código de verificação</label>
                <input
                  className="codigo-input"
                  type="text"
                  maxLength="6"
                  value={codigoVerif}
                  onChange={(e) => setCodigoVerif(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  autoFocus
                />
              </div>
              {erro && <div className="alert-erro"><AlertCircle size={16} /> {erro}</div>}
              <button type="submit" className="btn-auth-submit" disabled={loading || codigoVerif.length !== 6}>
                {loading ? 'Verificando...' : 'Confirmar e Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN FORM ────────────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="hero-overlay">
          <button onClick={() => navigate('/')} className="back-link">
            <ArrowLeft size={18} /> Voltar
          </button>
          <div className="auth-hero-text">
            <h1>{isLogin ? 'Bem-vindo de volta.' : 'Crie sua conta.'}</h1>
            <p>{isLogin ? 'Portal exclusivo para pacientes.' : 'Preencha seus dados para se cadastrar.'}</p>
          </div>
          <div className="auth-switch-tabs">
            <button className={isLogin ? 'tab active' : 'tab'} onClick={() => switchMode(true)}>Entrar</button>
            <button className={!isLogin ? 'tab active' : 'tab'} onClick={() => switchMode(false)}>Cadastrar</button>
          </div>
        </div>
      </div>

      <div className="auth-form-container">
        <div className="form-box scrollable">
          <h2>{isLogin ? 'Acesso ao Portal' : 'Criar Conta'}</h2>

          {/* ─── LOGIN ─── */}
          {isLogin && (
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="seu@email.com" autoComplete="email" />
                </div>
              </div>

              <div className="input-group">
                <label>Senha</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    name="senha"
                    type={showSenha ? 'text' : 'password'}
                    value={form.senha}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button type="button" className="btn-toggle-senha" onClick={() => setShowSenha(v => !v)} tabIndex={-1}>
                    {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {erro && <div className="alert-erro"><AlertCircle size={16} /> {erro}</div>}
              {sucesso && <div className="alert-sucesso">{sucesso}</div>}

              <button type="submit" className="btn-auth-submit" disabled={loading || !form.email || !form.senha}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <button type="button" className="btn-esqueci-senha" onClick={() => navigate('/recuperar-senha')}>
                Esqueci minha senha
              </button>
            </form>
          )}

          {/* ─── REGISTRO ─── */}
          {!isLogin && (
            <form onSubmit={handleRegistro}>
              {/* Dados pessoais */}
              <div className="form-section-title">Dados Pessoais</div>

              <div className="input-group">
                <label>Nome completo *</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input name="nome" value={form.nome} onChange={handleChange} placeholder="Como consta no seu documento" />
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>CPF *</label>
                  <div className="input-wrapper">
                    <Hash className="input-icon" size={18} />
                    <input name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" maxLength={14} />
                  </div>
                  {form.cpf.replace(/\D/g, '').length === 11 && !validarCPF(form.cpf) && (
                    <span className="field-erro">CPF inválido</span>
                  )}
                </div>

                <div className="input-group">
                  <label>Data de nascimento *</label>
                  <div className="input-wrapper">
                    <Calendar className="input-icon" size={18} />
                    <input name="data_nascimento" type="date" value={form.data_nascimento} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label>Gênero</label>
                <div className="input-wrapper select-wrapper">
                  <select name="genero" value={form.genero} onChange={handleChange} className="input-select">
                    <option value="">Selecione</option>
                    <option value="feminino">Feminino</option>
                    <option value="masculino">Masculino</option>
                    <option value="outro">Outro</option>
                    <option value="nao_informar">Prefiro não informar</option>
                  </select>
                </div>
              </div>

              {/* Contato */}
              <div className="form-section-title">Contato</div>

              <div className="input-row">
                <div className="input-group">
                  <label>Celular *</label>
                  <div className="input-wrapper">
                    <Smartphone className="input-icon" size={18} />
                    <input name="celular" value={form.celular} onChange={handleChange} placeholder="(00) 00000-0000" maxLength={15} />
                  </div>
                </div>

                <div className="input-group">
                  <label>Telefone fixo</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon" size={18} />
                    <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="(00) 0000-0000" maxLength={14} />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="form-section-title">Endereço</div>

              <div className="input-row">
                <div className="input-group" style={{ flex: '0 0 140px' }}>
                  <label>CEP</label>
                  <div className="input-wrapper">
                    <HomeIcon className="input-icon" size={18} />
                    <input
                      name="cep"
                      value={form.cep}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
                        setForm(p => ({ ...p, cep: v }));
                        if (v.replace(/\D/g, '').length === 8) buscarCEP(v);
                      }}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Logradouro</label>
                  <div className="input-wrapper">
                    <input name="logradouro" value={form.logradouro} onChange={handleChange} placeholder="Rua, Av..." className="no-icon" />
                  </div>
                </div>
              </div>

              <div className="input-row">
                <div className="input-group" style={{ flex: '0 0 100px' }}>
                  <label>Número</label>
                  <div className="input-wrapper">
                    <input name="numero" value={form.numero} onChange={handleChange} placeholder="Nº" className="no-icon" />
                  </div>
                </div>

                <div className="input-group">
                  <label>Complemento</label>
                  <div className="input-wrapper">
                    <input
                      name="complemento"
                      value={form.complemento}
                      onChange={handleChange}
                      placeholder={semComplemento ? '—' : 'Apto, bloco, sala...'}
                      disabled={semComplemento}
                      className="no-icon"
                    />
                  </div>
                  <label className="checkbox-inline">
                    <input
                      type="checkbox"
                      checked={semComplemento}
                      onChange={() => { setSemComplemento(v => !v); setForm(p => ({ ...p, complemento: '' })); }}
                    />
                    Não tenho complemento
                  </label>
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>Bairro</label>
                  <input name="bairro" value={form.bairro} onChange={handleChange} className="input-flat" />
                </div>
                <div className="input-group">
                  <label>Cidade</label>
                  <input name="cidade" value={form.cidade} onChange={handleChange} className="input-flat" />
                </div>
                <div className="input-group" style={{ flex: '0 0 80px' }}>
                  <label>UF</label>
                  <input name="estado" value={form.estado} onChange={handleChange} className="input-flat" maxLength={2} />
                </div>
              </div>

              {/* Convênio */}
              <div className="form-section-title">Convênio</div>

              <label className="checkbox-inline big">
                <input type="checkbox" checked={semConvenio} onChange={() => { setSemConvenio(v => !v); }} />
                Sem convênio (atendimento particular)
              </label>

              {!semConvenio && (
                <div className="input-row">
                  <div className="input-group">
                    <label>Convênio</label>
                    <div className="input-wrapper">
                      <CreditCard className="input-icon" size={18} />
                      <input name="convenio" value={form.convenio} onChange={handleChange} placeholder="Nome do convênio" />
                    </div>
                  </div>
                  {form.convenio && (
                    <div className="input-group">
                      <label>Carteirinha *</label>
                      <div className="input-wrapper">
                        <Hash className="input-icon" size={18} />
                        <input name="carteirinha" value={form.carteirinha} onChange={handleChange} placeholder="Nº da carteirinha" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Acesso */}
              <div className="form-section-title">Acesso</div>

              <div className="input-group">
                <label>Email *</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="seu@email.com" autoComplete="email" />
                </div>
              </div>

              <div className="input-group">
                <label>Senha * (mín. 8 caracteres)</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    name="senha"
                    type={showSenha ? 'text' : 'password'}
                    value={form.senha}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button type="button" className="btn-toggle-senha" onClick={() => setShowSenha(v => !v)} tabIndex={-1}>
                    {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {erro && <div className="alert-erro"><AlertCircle size={16} /> {erro}</div>}
              {sucesso && <div className="alert-sucesso">{sucesso}</div>}

              <button
                type="submit"
                className="btn-auth-submit"
                disabled={loading || !form.nome || !form.cpf || !form.celular || !form.email || !form.senha || !form.data_nascimento}
              >
                {loading ? 'Cadastrando...' : <>Criar Conta <ChevronRight size={18} /></>}
              </button>
            </form>
          )}

          <div className="auth-footer-switch">
            {isLogin ? (
              <span>Não tem conta? <button onClick={() => switchMode(false)}>Cadastre-se</button></span>
            ) : (
              <span>Já tem conta? <button onClick={() => switchMode(true)}>Entrar</button></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
