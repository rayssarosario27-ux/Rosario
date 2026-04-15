import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, CreditCard, Phone, Smartphone, Hash } from 'lucide-react';
import '../styles/Auth.css';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

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

          <form onSubmit={(e) => e.preventDefault()}>
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

            <button
              type="submit"
              className={`btn-auth-submit ${!isFormValid() ? 'disabled' : ''}`}
              disabled={!isFormValid()}
            >
              {isLogin ? 'Entrar' : 'Cadastrar'}
            </button>

            {isLogin && (
              <div className="auth-extra-options">
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => navigate('/recuperar-senha')}
                >
                  Esqueci minha senha
                </button>
                <span className="auth-link-sep">·</span>
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => navigate('/auth?mode=register')}
                >
                  Não tem conta? Cadastre-se
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}