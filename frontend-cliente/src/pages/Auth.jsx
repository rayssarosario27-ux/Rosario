import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import '../styles/Auth.css';

export default function Auth({ setToken, setPaciente }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Define se começa em Login ou Cadastro baseado na URL
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsLogin(params.get('mode') !== 'register');
  }, [location]);

  return (
    <div className="auth-page">
      {/* Lado Esquerdo - Imagem e Boas-vindas */}
      <div className="auth-hero">
        <div className="hero-overlay">
          <button onClick={() => navigate('/')} className="back-link">
            <ArrowLeft size={18} /> Voltar
          </button>
          <h1>Acesso à saúde de qualidade.</h1>
          <p>Portal exclusivo para pacientes da Clínica Dr. Eduardo.</p>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="auth-form-container">
        <div className="form-box">
          <h2>{isLogin ? 'Entrar' : 'Criar Conta'}</h2>
          <p className="form-subtitle">
            {isLogin ? 'Bem-vindo de volta! Digite seus dados.' : 'Preencha os dados para começar seu cuidado.'}
          </p>

          <form onSubmit={(e) => e.preventDefault()}>
            {!isLogin && (
              <div className="input-group">
                <label>Nome Completo</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={20} />
                  <input type="text" placeholder="Seu nome" />
                </div>
              </div>
            )}

            <div className="input-group">
              <label>E-mail</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input type="email" placeholder="seu@email.com" />
              </div>
            </div>

            <div className="input-group">
              <label>Senha</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input type="password" placeholder="********" />
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