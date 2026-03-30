import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, CreditCard, Phone, Smartphone, Hash, CheckCircle } from 'lucide-react';
import '../styles/Auth.css';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: '', cpf: '', convenio: '', carteirinha: '', celular: '', telefone: '', email: '', senha: ''
  });
  const [semConvenio, setSemConvenio] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsLogin(params.get('mode') !== 'register');
  }, [location]);

  // Validação para liberar o botão
  const isFormValid = () => {
    if (isLogin) return formData.email && formData.senha;
    
    const fieldsRequired = formData.nome && formData.cpf && formData.celular && formData.email && formData.senha;
    const convenioValid = semConvenio || (formData.convenio && formData.carteirinha);
    
    return fieldsRequired && convenioValid;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="hero-overlay">
          <button onClick={() => navigate('/')} className="back-link">
            <ArrowLeft size={18} /> Voltar
          </button>
          <h1>Acesso à saúde de qualidade.</h1>
          <p>Portal exclusivo para pacientes da Clínica Dr. Eduardo.</p>
        </div>
      </div>

      <div className="auth-form-container">
        <div className="form-box scrollable">
          <h2>{isLogin ? 'Entrar' : 'Criar Conta'}</h2>
          
          <form onSubmit={(e) => e.preventDefault()}>
            {!isLogin && (
              <>
                <div className="input-group">
                  <label>Nome Completo</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={20} />
                    <input name="nome" onChange={handleChange} type="text" placeholder="Nome completo" />
                  </div>
                </div>

                <div className="input-group">
                  <label>CPF</label>
                  <div className="input-wrapper">
                    <Hash className="input-icon" size={20} />
                    <input name="cpf" onChange={handleChange} type="text" placeholder="000.000.000-00" />
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
                      type="text" 
                      placeholder={semConvenio ? "Particular" : "Ex: Unimed"} 
                    />
                  </div>
                  <div className="checkbox-group">
                    <input 
                      type="checkbox" 
                      id="no-conv" 
                      checked={semConvenio} 
                      onChange={() => setSemConvenio(!semConvenio)} 
                    />
                    <label htmlFor="no-conv">Não tenho convênio</label>
                  </div>
                </div>

                {formData.convenio && !semConvenio && (
                  <div className="input-group animated">
                    <label>Número da Carteirinha</label>
                    <div className="input-wrapper">
                      <Hash className="input-icon" size={20} />
                      <input name="carteirinha" onChange={handleChange} type="text" placeholder="Número da carteirinha" />
                    </div>
                  </div>
                )}

                <div className="input-row">
                  <div className="input-group">
                    <label>Celular</label>
                    <div className="input-wrapper">
                      <Smartphone className="input-icon" size={20} />
                      <input name="celular" onChange={handleChange} type="text" placeholder="(21) 9..." />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Telefone</label>
                    <div className="input-wrapper">
                      <Phone className="input-icon" size={20} />
                      <input name="telefone" onChange={handleChange} type="text" placeholder="(21) ..." />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="input-group">
              <label>E-mail</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input name="email" onChange={handleChange} type="email" placeholder="seu@email.com" />
              </div>
            </div>

            <div className="input-group">
              <label>Senha</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input name="senha" onChange={handleChange} type="password" placeholder="********" />
              </div>
            </div>

            <button 
              type="submit" 
              className={`btn-auth-submit ${!isFormValid() ? 'disabled' : ''}`}
              disabled={!isFormValid()}
            >
              {isLogin ? 'Entrar' : 'Cadastrar'}
            </button>
          </form>

          <div className="auth-toggle">
            {isLogin ? (
              <p>Não tem conta? <button onClick={() => navigate('/auth?mode=register')}>Cadastre-se</button></p>
            ) : (
              <p>Já tem conta? <button onClick={() => navigate('/auth')}>Faça Login</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}