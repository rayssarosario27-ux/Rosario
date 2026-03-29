import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Stethoscope } from 'lucide-react';
import '../styles/Auth.css';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsLogin(params.get('mode') !== 'cadastro');
  }, [location]);

  return (
    <div className="auth-page">
      <div className="auth-bg-pulse"></div> {/* Fundo pulsante */}
      
      <div className="auth-card">
        <div className="auth-logo" onClick={() => navigate('/')}>
          <Stethoscope size={30} color="#4f46e5" />
          <span>Dr. Eduardo</span>
        </div>

        <div className="auth-header">
          <h1>{isLogin ? 'Bem-vindo de volta' : 'Criar sua conta'}</h1>
          <p>{isLogin ? 'Acesse seu painel de saúde' : 'Comece sua jornada de cuidado agora'}</p>
        </div>

        <div className="auth-tabs">
          <button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>Login</button>
          <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>Cadastro</button>
        </div>

        <form className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <label>Nome Completo</label>
              <div className="input-field">
                <User size={20} /><input type="text" placeholder="Como quer ser chamado?" />
              </div>
            </div>
          )}
          <div className="input-group">
            <label>E-mail</label>
            <div className="input-field">
              <Mail size={20} /><input type="email" placeholder="seu@email.com" />
            </div>
          </div>
          <div className="input-group">
            <label>Senha</label>
            <div className="input-field">
              <Lock size={20} /><input type="password" placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" className="btn-auth-submit">
            {isLogin ? 'Entrar no Sistema' : 'Finalizar Cadastro'} <ArrowRight size={18} />
          </button>
        </form>

        {isLogin && (
          <button className="btn-forgot" onClick={() => navigate('/recuperar-senha')}>
            Esqueceu a senha?
          </button>
        )}
      </div>
    </div>
  );
}