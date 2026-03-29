import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Mail, Lock, ArrowLeft } from 'lucide-react';
import '../styles/Auth.css';

const Auth = () => {
  return (
    <div className="auth-wrapper">
      <Link to="/" className="back-button" style={{ position: 'absolute', top: '20px', left: '20px', textDecoration: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <ArrowLeft size={18} /> Voltar
      </Link>
      
      <div className="auth-card">
        <div className="auth-header">
          <Stethoscope size={40} color="#4f46e5" style={{ margin: '0 auto' }} />
          <h2>Dr. Eduardo</h2>
          <p style={{ color: '#64748b' }}>Acesse sua conta ou cadastre-se</p>
        </div>

        <form className="auth-form">
          <div className="input-group">
            <label><Mail size={14} /> E-mail</label>
            <input type="email" placeholder="seu@email.com" />
          </div>
          
          <div className="input-group">
            <label><Lock size={14} /> Senha</label>
            <input type="password" placeholder="••••••••" />
          </div>

          <button type="submit" className="btn-auth">Entrar na Conta</button>
          
          <Link to="#" style={{ fontSize: '14px', color: '#4f46e5', textDecoration: 'none', marginTop: '10px' }}>
            Esqueceu sua senha?
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Auth;