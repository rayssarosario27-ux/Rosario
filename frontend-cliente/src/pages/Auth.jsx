import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, CreditCard, Phone, Smartphone, Hash } from 'lucide-react';
import '../styles/Auth.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Auth({ setToken, setPaciente }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [etapa, setEtapa] = useState(1); // 1=form, 2=verificar email (apenas registro)
  const [pacienteId, setPacienteId] = useState(null);
  const [codigoVerificacao, setCodigoVerificacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    convenio: '',
    carteirinha: '',
    celular: '',
    telefone: '',
    email: '',
    senha: ''
  });

  const [semConvenio, setSemConvenio] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsLogin(params.get('mode') !== 'register');
    setErro('');
    setMensagem('');
    setEtapa(1);
  }, [location]);

  const isFormValid = () => {
    if (isLogin) return formData.email && formData.senha;

    const required =
      formData.nome &&
      formData.cpf &&
      formData.celular &&
      formData.email &&
      formData.senha;

    const convenioValid =
      semConvenio || (formData.convenio && formData.carteirinha);

    return required && convenioValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await fetch(`${API_URL}/api/auth/login-paciente`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, senha: formData.senha })
        });
        const data = await response.json();

        if (data.sucesso) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('paciente', JSON.stringify(data.paciente));
          setToken(data.token);
          setPaciente(data.paciente);
          navigate('/dashboard');
        } else {
          setErro(data.erro || '❌ Credenciais inválidas');
        }
      } else {
        const response = await fetch(`${API_URL}/api/auth/registro-paciente`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: formData.nome,
            cpf: formData.cpf,
            email: formData.email,
            telefone: formData.celular,
            convenio: semConvenio ? '' : formData.convenio,
            carteirinha: semConvenio ? '' : formData.carteirinha,
            senha: formData.senha
          })
        });
        const data = await response.json();

        if (data.sucesso) {
          setPacienteId(data.pacienteId);
          setMensagem('✅ Cadastro realizado! Verifique seu email e insira o código abaixo.');
          setEtapa(2);
        } else {
          setErro(data.erro || '❌ Erro ao realizar cadastro');
        }
      }
    } catch (err) {
      console.error('Erro na autenticação:', err);
      setErro('❌ Erro ao conectar com o servidor');
    }
    setLoading(false);
  };

  const handleVerificar = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/verificar-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pacienteId, codigo: codigoVerificacao })
      });
      const data = await response.json();

      if (data.sucesso) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('paciente', JSON.stringify(data.paciente));
        setToken(data.token);
        setPaciente(data.paciente);
        navigate('/dashboard');
      } else {
        setErro(data.erro || '❌ Código inválido');
      }
    } catch (err) {
      console.error('Erro na verificação de email:', err);
      setErro('❌ Erro ao conectar com o servidor');
    }
    setLoading(false);
  };

  if (etapa === 2) {
    return (
      <div className="auth-page">
        <div className="auth-hero">
          <div className="hero-overlay">
            <button onClick={() => setEtapa(1)} className="back-link">
              <ArrowLeft size={18} /> Voltar
            </button>
            <h1>Verifique seu email.</h1>
            <p>Código enviado para {formData.email}</p>
          </div>
        </div>

        <div className="auth-form-container">
          <div className="form-box scrollable">
            <h2>Confirmar Email</h2>
            {mensagem && <div className="alert alert-success">{mensagem}</div>}

            <form onSubmit={handleVerificar}>
              <div className="input-group">
                <label>Código de Verificação</label>
                <div className="input-wrapper">
                  <Hash className="input-icon" size={20} />
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="000000"
                    value={codigoVerificacao}
                    onChange={(e) => setCodigoVerificacao(e.target.value)}
                    required
                  />
                </div>
              </div>

              {erro && <div className="alert alert-error">{erro}</div>}

              <button
                type="submit"
                className={`btn-auth-submit ${!codigoVerificacao || loading ? 'disabled' : ''}`}
                disabled={!codigoVerificacao || loading}
              >
                {loading ? '⏳ Verificando...' : 'Confirmar'}
              </button>
            </form>
          </div>
        </div>
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
                    <input name="cpf" onChange={handleChange} />
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
                      <input name="telefone" onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="input-group">
              <label>Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input name="email" type="email" onChange={handleChange} />
              </div>
            </div>

            <div className="input-group">
              <label>Senha</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input name="senha" type="password" onChange={handleChange} />
              </div>
            </div>

            {erro && <div className="alert alert-error">{erro}</div>}

            <button
              type="submit"
              className={`btn-auth-submit ${!isFormValid() || loading ? 'disabled' : ''}`}
              disabled={!isFormValid() || loading}
            >
              {loading ? '⏳ Aguarde...' : isLogin ? 'Entrar' : 'Cadastrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}