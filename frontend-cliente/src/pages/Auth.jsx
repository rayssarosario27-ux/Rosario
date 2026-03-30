import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, CreditCard, Phone, Smartphone, Hash } from 'lucide-react';
import '../styles/Auth.css';

export default function Auth({ setToken, setPaciente }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  // Estado para controlar se mostra a carteirinha
  const [convenio, setConvenio] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsLogin(params.get('mode') !== 'register');
  }, [location]);

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
                    <input type="text" placeholder="Nome completo" required />
                  </div>
                </div>

                <div className="input-group">
                  <label>CPF</label>
                  <div className="input-wrapper">
                    <Hash className="input-icon" size={20} />
                    <input type="text" placeholder="000.000.000-00" required />
                  </div>
                </div>

                <div className="input-group">
                  <label>Convênio (Opcional)</label>
                  <div className="input-wrapper">
                    <CreditCard className="input-icon" size={20} />
                    <input 
                      type="text" 
                      placeholder="Ex: Unimed" 
                      value={convenio}
                      onChange={(e) => setConvenio(e.target.value)}
                    />
                  </div>
                </div>

                {convenio && (
                  <div className="input-group animated">
                    <label>Número da Carteirinha</label>
                    <div className="input-wrapper">
                      <Hash className="input-icon" size={20} />
                      <input type="text" placeholder="Número da carteirinha" required />
                    </div>
                  </div>
                )}

                <div className="input-row">
                  <div className="input-group">
                    <label>Celular</label>
                    <div className="input-wrapper">
                      <Smartphone className="input-icon" size={20} />
                      <input type="text" placeholder="(21) 9..." required />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Telefone</label>
                    <div className="input-wrapper">
                      <Phone className="input-icon" size={20} />
                      <input type="text" placeholder="(21) ..." />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="input-group">
              <label>E-mail</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input type="email" placeholder="seu@email.com" required />
              </div>
            </div>

            <div className="input-group">
              <label>{isLogin ? 'Senha' : 'Criar Senha'}</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input type="password" placeholder="********" required />
              </div>
            </div>

            <button type="submit" className="btn-auth-submit">
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