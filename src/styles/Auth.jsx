import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Chrome } from 'lucide-react';
import '../styles/Auth.css';

const Auth = () => {
  return (
    <div className="auth-page">
      {/* LADO ESQUERDO COM MENSAGEM */}
      <div className="auth-side-image">
        <Link to="/" style={{ position: 'absolute', top: '40px', left: '40px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontWeight: '600' }}>
          <ArrowLeft size={20} /> Voltar para o Início
        </Link>
        <h1>Acesso à saúde de qualidade <br/> em qualquer lugar.</h1>
        <p>Portal exclusivo para pacientes da Clínica Dr. Eduardo. Agendamentos, laudos e histórico médico em um só lugar.</p>
      </div>

      {/* LADO DIREITO COM FORMULÁRIO */}
      <div className="auth-side-form">
        <div className="auth-form-container">
          <div style={{ marginBottom: '40px' }}>
             <div style={{ width: '40px', height: '40px', background: '#00ced1', borderRadius: '50%', display: 'flex', alignItems: 'center', justify-content: 'center', color: 'white', fontWeight: 'bold' }}>+</div>
          </div>
          
          <h2>Entrar no Portal</h2>
          <p>Por favor, insira seus dados para continuar.</p>

          <form>
            <div className="input-box">
              <label>E-mail</label>
              <input type="email" placeholder="nome@exemplo.com" />
            </div>

            <div className="input-box">
              <label>Senha</label>
              <input type="password" placeholder="Sua senha segura" />
            </div>

            <div className="form-options">
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input type="checkbox" /> Lembrar-me
              </label>
              <Link to="#" style={{ color: '#00ced1', textDecoration: 'none', fontWeight: '600' }}>Esqueceu a senha?</Link>
            </div>

            <button type="button" className="btn-signin">Entrar agora</button>

            <div className="social-login">
              <p style={{ fontSize: '12px', marginBottom: '15px' }}>OU CONTINUAR COM</p>
              <button type="button" className="btn-google">
                <Chrome size={18} color="#4285F4" /> Google
              </button>
            </div>

            <p style={{ marginTop: '30px', textAlign: 'center', fontSize: '14px' }}>
              Não tem conta? <Link to="#" style={{ color: '#00ced1', fontWeight: '700', textDecoration: 'none' }}>Cadastre-se</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;