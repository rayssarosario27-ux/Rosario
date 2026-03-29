import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import '../styles/RecuperarSenha.css';

export default function RecuperarSenha({ onVoltar }) {
  const [etapa, setEtapa] = useState(1);
  const [email, setEmail] = useState('');
  const [pacienteId, setPacienteId] = useState(null);
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  // PEGA A URL DO BACKEND AUTOMATICAMENTE
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleEsqueciSenha = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/esqueci-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.sucesso) {
        setPacienteId(data.pacienteId);
        setMensagem('Enviamos um código de 6 dígitos para seu e-mail.');
        setEtapa(2);
      } else {
        setErro(data.erro || 'Não encontramos este e-mail em nossa base.');
      }
    } catch (err) {
      setErro('Falha na conexão. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetarSenha = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas digitadas não coincidem.');
      return;
    }
    setErro('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/resetar-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pacienteId, codigo, novaSenha, confirmarSenha })
      });

      const data = await response.json();

      if (data.sucesso) {
        setMensagem('Senha redefinida com sucesso! Redirecionando...');
        setTimeout(() => onVoltar(), 2500);
      } else {
        setErro(data.erro || 'Código inválido ou expirado.');
      }
    } catch (err) {
      setErro('Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rs-overlay">
      <div className="rs-card">
        <button className="rs-back-button" onClick={onVoltar}>
          <ArrowLeft size={18} />
          <span>Voltar para o login</span>
        </button>

        <div className="rs-progress-bar">
          <div className={`rs-step ${etapa >= 1 ? 'active' : ''}`}></div>
          <div className={`rs-step ${etapa === 2 ? 'active' : ''}`}></div>
        </div>

        <header className="rs-header">
          <div className="rs-icon-box">
            <ShieldCheck size={32} color="#4F46E5" />
          </div>
          <h1>Recuperar Acesso</h1>
          <p>{etapa === 1 
            ? "Informe seu e-mail para receber o código de segurança." 
            : "Crie uma nova senha forte para sua conta."}
          </p>
        </header>

        {erro && <div className="rs-alert error">{erro}</div>}
        {mensagem && <div className="rs-alert success"><CheckCircle2 size={16}/> {mensagem}</div>}

        <form onSubmit={etapa === 1 ? handleEsqueciSenha : handleResetarSenha} className="rs-form">
          {etapa === 1 ? (
            <div className="rs-input-group">
              <label>E-mail cadastrado</label>
              <div className="rs-input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          ) : (
            <>
              <div className="rs-input-group">
                <label>Código de 6 dígitos</label>
                <input
                  className="rs-code-input"
                  type="text"
                  placeholder="000000"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  maxLength="6"
                  required
                />
              </div>

              <div className="rs-input-group">
                <label>Nova Senha</label>
                <div className="rs-input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="rs-input-group">
                <label>Confirmar Nova Senha</label>
                <div className="rs-input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type="password"
                    placeholder="Repita a senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button type="submit" className={`rs-submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? <div className="spinner"></div> : (etapa === 1 ? 'Enviar código de segurança' : 'Redefinir Senha')}
          </button>
        </form>

        <footer className="rs-footer">
          <p>Ambiente seguro • Dr. Eduardo Clinica</p>
        </footer>
      </div>
    </div>
  );
}