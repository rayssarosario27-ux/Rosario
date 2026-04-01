import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, ArrowLeft, CreditCard, Phone,
  Smartphone, Hash, MapPin, Globe, Calendar,
  CheckCircle, XCircle, Camera, Scan
} from 'lucide-react';
import '../styles/Auth.css';

/* ─── CPF ─────────────────────────────────────────── */
function validarCPF(cpf) {
  const nums = cpf.replace(/\D/g, '');
  if (nums.length !== 11 || /^(\d)\1+$/.test(nums)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(nums[i]) * (10 - i);
  let r = (soma * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(nums[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(nums[i]) * (11 - i);
  r = (soma * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(nums[10]);
}

function formatarCPF(valor) {
  const nums = valor.replace(/\D/g, '').slice(0, 11);
  return nums
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/* ─── Email ───────────────────────────────────────── */
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/* ─── Senha ───────────────────────────────────────── */
function checarSenha(senha) {
  return {
    minLen: senha.length >= 8,
    special: /[!@#$%^&*()_=+{}[\];':"\\|,.<>/?`~-]/.test(senha),
    noRepeat: !/(.)\1{2,}/.test(senha),
  };
}

/* ─── Biometric Step ─────────────────────────────── */
function BiometricStep({ nome, onComplete }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [captured, setCaptured] = useState(false);
  const [camError, setCamError] = useState('');
  const [imgData, setImgData] = useState(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      setCamError('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
  };

  const capturar = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const data = canvas.toDataURL('image/jpeg', 0.8);
    setImgData(data);
    setCaptured(true);
    stopCamera();
  };

  const confirmar = () => {
    localStorage.setItem('biometria', 'active');
    onComplete();
  };

  const recapturar = () => {
    setCaptured(false);
    setImgData(null);
    startCamera();
  };

  return (
    <div className="bio-step">
      <div className="bio-header">
        <Scan size={32} className="bio-icon" />
        <h2>Cadastro de Biometria Facial</h2>
        <p>
          Olá, <strong>{nome || 'Paciente'}</strong>! Precisamos registrar seu rosto para que você
          possa acessar a clínica pela catraca de reconhecimento facial.
        </p>
      </div>

      {camError ? (
        <div className="bio-error">
          <XCircle size={24} />
          <span>{camError}</span>
          <button className="btn-auth-submit" onClick={onComplete} style={{ marginTop: 16 }}>
            Pular por enquanto
          </button>
        </div>
      ) : !captured ? (
        <div className="bio-camera-area">
          <div className="bio-video-frame">
            <video ref={videoRef} autoPlay playsInline muted className="bio-video" />
            <div className="bio-face-guide" />
          </div>
          <p className="bio-hint">Posicione seu rosto dentro do círculo e clique em capturar.</p>
          <button className="btn-bio-capture" onClick={capturar}>
            <Camera size={20} /> Capturar Rosto
          </button>
        </div>
      ) : (
        <div className="bio-captured-area">
          <img src={imgData} alt="Foto capturada" className="bio-preview" />
          <div className="bio-success-badge">
            <CheckCircle size={20} /> Foto capturada com sucesso!
          </div>
          <div className="bio-confirm-actions">
            <button className="btn-bio-retry" onClick={recapturar}>Refazer</button>
            <button className="btn-bio-confirm" onClick={confirmar}>
              Confirmar e Entrar
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

/* ─── Main Component ─────────────────────────────── */
export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();

  // 'form' | 'biometric'
  const [step, setStep] = useState('form');
  const [isLogin, setIsLogin] = useState(true);
  const [cpfErro, setCpfErro] = useState('');
  const [emailErro, setEmailErro] = useState('');
  const [cepErro, setCepErro] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '',
    logradouro: '',
    numero: '',
    complemento: '',
    cep: '',
    cidade: '',
    bairro: '',
    nacionalidade: '',
    convenio: '',
    carteirinha: '',
    celular: '',
    telefone: '',
    email: '',
    senha: ''
  });

  const [semConvenio, setSemConvenio] = useState(false);
  const [semTelefoneFixo, setSemTelefoneFixo] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const senhaCheck = checarSenha(formData.senha);
  const senhaValida = senhaCheck.minLen && senhaCheck.special && senhaCheck.noRepeat;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsLogin(params.get('mode') !== 'register');
    setStep('form');
  }, [location]);

  const isFormValid = () => {
    if (isLogin) return formData.email && formData.senha;

    const required =
      formData.nome &&
      formData.cpf &&
      formData.dataNascimento &&
      formData.logradouro &&
      formData.numero &&
      formData.cep &&
      formData.cidade &&
      formData.bairro &&
      formData.nacionalidade &&
      formData.celular &&
      formData.email &&
      formData.senha &&
      !cpfErro &&
      !emailErro &&
      senhaValida;

    const convenioValid =
      semConvenio || (formData.convenio && formData.carteirinha);

    return required && convenioValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, email: value }));
    if (value && !validarEmail(value)) {
      setEmailErro('E-mail inválido. Verifique o formato informado.');
    } else {
      setEmailErro('');
    }
  };

  const handleCpfChange = (e) => {
    const formatted = formatarCPF(e.target.value);
    setFormData((prev) => ({ ...prev, cpf: formatted }));
    const raw = formatted.replace(/\D/g, '');
    if (raw.length === 11) {
      setCpfErro(validarCPF(raw) ? '' : 'CPF inválido. Verifique os números informados.');
    } else {
      setCpfErro('');
    }
  };

  const handleCepChange = async (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
    const formatted = raw.length > 5 ? raw.replace(/(\d{5})(\d{1,3})/, '$1-$2') : raw;
    setFormData((prev) => ({ ...prev, cep: formatted, logradouro: '', cidade: '', bairro: '' }));
    setCepErro('');

    if (raw.length === 8) {
      setBuscandoCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        if (!res.ok) throw new Error('CEP lookup failed');
        const data = await res.json();
        if (data.erro) {
          setCepErro('CEP não encontrado. Verifique o número informado.');
        } else {
          setFormData((prev) => ({
            ...prev,
            logradouro: data.logradouro || '',
            cidade: data.localidade || '',
            bairro: data.bairro || '',
          }));
        }
      } catch {
        setCepErro('Não foi possível buscar o CEP. Tente novamente.');
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    if (!isLogin) {
      localStorage.setItem('paciente', JSON.stringify(formData));
      setStep('biometric');
    } else {
      navigate('/dashboard');
    }
  };

  if (step === 'biometric') {
    return (
      <div className="auth-page auth-page-bio">
        <BiometricStep
          nome={formData.nome}
          onComplete={() => navigate('/dashboard')}
        />
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="hero-overlay">
          <button onClick={() => navigate('/')} className="back-link">
            <ArrowLeft size={18} /> Voltar
          </button>

          <h1>Acesso à saúde de qualidade.</h1>
          <p>Portal exclusivo para pacientes.</p>
        </div>
      </div>

      <div className="auth-form-container">
        <div className="form-box scrollable">
          <h2>{isLogin ? 'Entrar' : 'Criar Conta'}</h2>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="input-group">
                  <label>Nome</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={20} />
                    <input name="nome" onChange={handleChange} />
                  </div>
                </div>

                <div className="input-group">
                  <label>CPF</label>
                  <div className="input-wrapper">
                    <Hash className="input-icon" size={20} />
                    <input
                      name="cpf"
                      inputMode="numeric"
                      value={formData.cpf}
                      onChange={handleCpfChange}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </div>
                  {cpfErro && <span className="field-error">{cpfErro}</span>}
                </div>

                <div className="input-group">
                  <label>Data de Nascimento</label>
                  <div className="input-wrapper">
                    <Calendar className="input-icon" size={20} />
                    <input
                      name="dataNascimento"
                      type="date"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Nacionalidade</label>
                  <div className="input-wrapper">
                    <Globe className="input-icon" size={20} />
                    <input
                      name="nacionalidade"
                      onChange={handleChange}
                      placeholder="Ex: Brasileira"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>CEP</label>
                  <div className="input-wrapper">
                    <MapPin className="input-icon" size={20} />
                    <input
                      name="cep"
                      inputMode="numeric"
                      value={formData.cep}
                      onChange={handleCepChange}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                    {buscandoCep && <span className="cep-loading">Buscando...</span>}
                  </div>
                  {cepErro && <span className="field-error">{cepErro}</span>}
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Cidade</label>
                    <div className="input-wrapper">
                      <MapPin className="input-icon" size={20} />
                      <input
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleChange}
                        placeholder="Preenchido pelo CEP"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Bairro</label>
                    <div className="input-wrapper">
                      <MapPin className="input-icon" size={20} />
                      <input
                        name="bairro"
                        value={formData.bairro}
                        onChange={handleChange}
                        placeholder="Preenchido pelo CEP"
                      />
                    </div>
                  </div>
                </div>

                <div className="input-group">
                  <label>Logradouro</label>
                  <div className="input-wrapper">
                    <MapPin className="input-icon" size={20} />
                    <input
                      name="logradouro"
                      value={formData.logradouro}
                      onChange={handleChange}
                      placeholder="Preenchido pelo CEP"
                    />
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Número <span className="label-required">*</span></label>
                    <div className="input-wrapper">
                      <Hash className="input-icon" size={20} />
                      <input
                        name="numero"
                        value={formData.numero}
                        onChange={handleChange}
                        placeholder="Ex: 123"
                        inputMode="numeric"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Complemento</label>
                    <div className="input-wrapper">
                      <MapPin className="input-icon" size={20} />
                      <input
                        name="complemento"
                        value={formData.complemento}
                        onChange={handleChange}
                        placeholder="Apto, Bloco... (opcional)"
                      />
                    </div>
                  </div>
                </div>

                <div className="input-group">
                  <label>Convênio</label>
                  <div className="input-wrapper">
                    <CreditCard className="input-icon" size={20} />
                    <input
                      name="convenio"
                      disabled={semConvenio}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      checked={semConvenio}
                      onChange={() => setSemConvenio(!semConvenio)}
                    />
                    <label>Sem convênio</label>
                  </div>
                </div>

                {!semConvenio && formData.convenio && (
                  <div className="input-group">
                    <label>Carteirinha</label>
                    <div className="input-wrapper">
                      <Hash className="input-icon" size={20} />
                      <input name="carteirinha" onChange={handleChange} />
                    </div>
                  </div>
                )}

                <div className="input-row">
                  <div className="input-group">
                    <label>Celular</label>
                    <div className="input-wrapper">
                      <Smartphone className="input-icon" size={20} />
                      <input name="celular" onChange={handleChange} />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Telefone</label>
                    <div className="input-wrapper">
                      <Phone className="input-icon" size={20} />
                      <input
                        name="telefone"
                        onChange={handleChange}
                        disabled={semTelefoneFixo}
                        value={semTelefoneFixo ? '' : formData.telefone}
                      />
                    </div>
                    <div className="checkbox-group">
                      <input
                        type="checkbox"
                        id="semTelefoneFixo"
                        checked={semTelefoneFixo}
                        onChange={() => {
                          setSemTelefoneFixo(!semTelefoneFixo);
                          setFormData((prev) => ({ ...prev, telefone: '' }));
                        }}
                      />
                      <label htmlFor="semTelefoneFixo">Não tenho telefone fixo</label>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="input-group">
              <label>Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  placeholder="seu@email.com"
                />
              </div>
              {emailErro && <span className="field-error">{emailErro}</span>}
            </div>

            <div className="input-group">
              <label>Senha</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  name="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  className="toggle-senha"
                  onClick={() => setMostrarSenha((v) => !v)}
                  tabIndex={-1}
                  aria-label="Mostrar/ocultar senha"
                >
                  {mostrarSenha ? '🙈' : '👁️'}
                </button>
              </div>

              {!isLogin && formData.senha && (
                <ul className="senha-rules">
                  <li className={senhaCheck.minLen ? 'ok' : 'fail'}>
                    {senhaCheck.minLen ? <CheckCircle size={13} /> : <XCircle size={13} />}
                    Mínimo 8 caracteres
                  </li>
                  <li className={senhaCheck.special ? 'ok' : 'fail'}>
                    {senhaCheck.special ? <CheckCircle size={13} /> : <XCircle size={13} />}
                    Pelo menos 1 caractere especial (!@#$%...)
                  </li>
                  <li className={senhaCheck.noRepeat ? 'ok' : 'fail'}>
                    {senhaCheck.noRepeat ? <CheckCircle size={13} /> : <XCircle size={13} />}
                    Sem 3 ou mais caracteres idênticos seguidos
                  </li>
                </ul>
              )}
            </div>

            <button
              type="submit"
              className={`btn-auth-submit ${!isFormValid() ? 'disabled' : ''}`}
              disabled={!isFormValid()}
            >
              {isLogin ? 'Entrar' : 'Cadastrar e Registrar Biometria →'}
            </button>
          </form>

          {isLogin ? (
            <p className="auth-switch-text">
              Não tem cadastro?{' '}
              <button className="auth-switch-link" onClick={() => navigate('/auth?mode=register')}>
                Cadastre-se
              </button>
            </p>
          ) : (
            <p className="auth-switch-text">
              Já tem cadastro?{' '}
              <button className="auth-switch-link" onClick={() => navigate('/auth')}>
                Entrar
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}