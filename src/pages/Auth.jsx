import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Chrome, Mail, Lock } from 'lucide-react';
import '../styles/Auth.css';

const Auth = () => {
  return (
    <div className="auth-page">
      <div className="auth-side-image">
        <Link to="/" className="back-link">
          <ArrowLeft size={20} /> Voltar
        </Link>
        <h1>Acesso à saúde <br/> de qualidade.</h1>
        <p>Portal exclusivo para pacientes do Dr. Eduardo.</p>
      </div>

      <div className="auth-side-form">
        <div className="auth-form-container">
          <h2>Entrar no Portal</h2>
          <p>Insira seus dados para continuar.</p>

          <form>
            <div className="input-box">
              <label><Mail size={14} /> E-mail</label>
              <input type="email" placeholder="nome@exemplo.com" />
            </div>

            <div className="input-box">
              <label><Lock size={14} /> Senha</label>
              <input type="password" placeholder="Sua senha" />
            </div>

            <button type="button" className="btn-signin">Entrar agora</button>

            <div className="social-login">
              <button type="button" className="btn-google">
                <Chrome size={18} /> Entrar com Google
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;