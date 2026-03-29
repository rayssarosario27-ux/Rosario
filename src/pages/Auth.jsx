import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Building, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RecuperarSenha from './RecuperarSenha';
import '../styles/Auth.css';

export default function Auth({ setToken, setPaciente }) {
  const navigate = useNavigate();
  const [modo, setModo] = useState('login');
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    convenio: '',
    senha: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [pacienteIdVerif, setPacienteIdVerif] = useState(null);
  const [codigoVerif, setCodigoVerif] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login-paciente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          senha: formData.senha
        })
      });

      const data = await response.json();

      if (data.sucesso) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('paciente', JSON.stringify(data.paciente));
        setToken(data.token);
        setPaciente(data.paciente);
        window.location.href = '/dashboard';
      } else {
        setErro(data.erro || '❌ Erro ao fazer login');
      }
    } catch (err) {
      setErro('❌ Erro ao conectar com servidor');
    }
    setLoading(false);
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');

    if (formData.senha !== formData.confirmarSenha) {
      setErro('❌ As senhas não conferem');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/registro-paciente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          cpf: formData.cpf,
          email: formData.email,
          telefone: formData.telefone,
          convenio: formData.convenio || null,
          senha: formData.senha
        })
      });

      const data = await response.json();

      if (data.sucesso) {
        setMensagem('✅ Cadastro realizado! Verifique seu email');
        setPacienteIdVerif(data.pacienteId);
        setFormData({ ...formData, senha: '', confirmarSenha: '' });
      } else {
        setErro(data.erro || '❌ Erro ao registrar');
      }
    } catch (err) {
      setErro('❌ Erro ao registrar');
    }
    setLoading(false);
  };

  const handleVerificarEmail = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verificar-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pacienteId: pacienteIdVerif,
          codigo: codigoVerif
        })
      });

      const data = await response.json();

      if (data.sucesso) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('paciente', JSON.stringify(data.paciente));
        setToken(data.token);
        setPaciente(data.paciente);
        window.location.href = '/dashboard';
      } else {
        setErro(data.erro || '❌ Código inválido');
      }
    } catch (err) {
      setErro('❌ Erro ao verificar código');
    }
    setLoading(false);
  };

  // Mostrar tela de recuperar senha
  if (mostrarRecuperar) {
    return <RecuperarSenha onVoltar={() => setMostrarRecuperar(false)} />;
  }

  // Mostrar verificação de email
  if (pacienteIdVerif) {
    return (
      <div className="auth-container">
        <button 
          className="btn-voltar-auth"
          onClick={() => {
            setPacienteIdVerif(null);
            setCodigoVerif('');
            setErro('');
            setMensagem('');
          }}
          type="button"
        >
          <ArrowLeft size={20} /> Voltar
        </button>

        <div className="auth-card">
          <div className="auth-header">
            <h1>🏥 Dr. Eduardo</h1>
            <p>Confirme seu Email</p>
          </div>

          <form onSubmit={handleVerificarEmail}>
            <div className="form-group">
              <label>🔐 Código de Verificação</label>
              <input
                type="text"
                placeholder="Digite o código recebido no email"
                value={codigoVerif}
                onChange={(e) => setCodigoVerif(e.target.value)}
                maxLength="6"
                required
              />
            </div>

            {erro && <div className="alert alert-error">{erro}</div>}
            {mensagem && <div className="alert alert-success">{mensagem}</div>}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? '⏳ Verificando...' : '✅ Verificar Código'}
            </button>
          </form>

          <p className="auth-footer">
            ❤️ Sua saúde é nossa prioridade • Dr. Eduardo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <button 
        className="btn-voltar-auth"
        onClick={() => navigate('/')}
        type="button"
      >
        <ArrowLeft size={20} /> Voltar
      </button>

      <div className="auth-card">
        <div className="auth-header">
          <h1>🏥 Dr. Eduardo</h1>
          <p>Centro de Saúde & Bem-estar</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`tab ${modo === 'login' ? 'active' : ''}`}
            onClick={() => setModo('login')}
            type="button"
          >
            Entrar
          </button>
          <button
            className={`tab ${modo === 'registro' ? 'active' : ''}`}
            onClick={() => setModo('registro')}
            type="button"
          >
            Cadastrar
          </button>
        </div>

        {modo === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>📧 Email</label>
              <div className="input-wrapper">
                <Mail size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>🔐 Senha</label>
              <div className="input-wrapper">
                <Lock size={18} />
                <input
                  type="password"
                  name="senha"
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {erro && <div className="alert alert-error">{erro}</div>}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? '⏳ Entrando...' : '✅ Entrar'}
            </button>

            <button 
              type="button" 
              className="btn-esqueci-senha"
              onClick={() => setMostrarRecuperar(true)}
            >
              🔐 Esqueci minha senha
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegistro}>
            <div className="form-group">
              <label>👤 Nome Completo</label>
              <div className="input-wrapper">
                <User size={18} />
                <input
                  type="text"
                  name="nome"
                  placeholder="João Silva"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>🆔 CPF</label>
                <input
                  type="text"
                  name="cpf"
                  placeholder="123.456.789-00"
                  value={formData.cpf}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>📱 Telefone</label>
                <div className="input-wrapper">
                  <Phone size={18} />
                  <input
                    type="tel"
                    name="telefone"
                    placeholder="(11) 99999-9999"
                    value={formData.telefone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>📧 Email</label>
              <div className="input-wrapper">
                <Mail size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>🏥 Convênio (Opcional)</label>
              <div className="input-wrapper">
                <Building size={18} />
                <input
                  type="text"
                  name="convenio"
                  placeholder="Unimed, Bradesco, Particular..."
                  value={formData.convenio}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>🔐 Senha</label>
                <div className="input-wrapper">
                  <Lock size={18} />
                  <input
                    type="password"
                    name="senha"
                    placeholder="••••••••"
                    value={formData.senha}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>🔐 Confirmar</label>
                <div className="input-wrapper">
                  <Lock size={18} />
                  <input
                    type="password"
                    name="confirmarSenha"
                    placeholder="••••••••"
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {erro && <div className="alert alert-error">{erro}</div>}
            {mensagem && <div className="alert alert-success">{mensagem}</div>}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? '⏳ Criando conta...' : '✅ Criar Conta'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          ❤️ Sua saúde é nossa prioridade • Dr. Eduardo
        </p>
      </div>
    </div>
  );
}