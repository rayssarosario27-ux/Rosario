import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User } from 'lucide-react';
import '../styles/Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page">
      
      {/* Lado Esquerdo */}
      <div 
        className="auth-side-image" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 206, 209, 0.3), rgba(0, 0, 0, 0.7)), url('https://images.pexels.com/photos/8376295/pexels-photo-8376295.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Link to="/" className="back-link">
          <ArrowLeft size={20} /> Voltar
        </Link>

        <h1>{isLogin ? "Acesso à saúde de qualidade." : "Crie sua conta agora."}</h1>
        <p>Portal exclusivo para pacientes da Clínica Dr. Eduardo.</p>
      </div>

      {/* Lado Direito */}
      <div className="auth-side-form">
        <div className="auth-form-container">

          <h2>{isLogin ? "Entrar" : "Cadastrar"}</h2>

          <form>
            
            {!isLogin && (
              <div className="input-box">
                <label><User size={14}/> Nome</label>
                <input type="text" placeholder="Seu nome" />
              </div>
            )}

            <div className="input-box">
              <label><Mail size={14}/> Email</label>
              <input type="email" placeholder="seu@email.com" />
            </div>

            <div className="input-box">
              <label><Lock size={14}/> Senha</label>
              <input type="password" placeholder="********" />
            </div>

            <button className="auth-btn">
              {isLogin ? "Entrar" : "Cadastrar"}
            </button>
          </form>

          <p onClick={() => setIsLogin(!isLogin)} className="switch-mode">
            {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
          </p>

        </div>
      </div>

    </div>
  );
};

export default Auth;