import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import '../styles/RecuperarSenha.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function RecuperarSenha({ onVoltar }) {
  const navigate = useNavigate();
  const voltar = onVoltar || (() => navigate('/auth'));

  const [etapa, setEtapa] = useState(1);
  const [email, setEmail] = useState('');
  const [pacienteId, setPacienteId] = useState(null);
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

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
        setMensagem('✅ ' + data.mensagem);
        setEtapa(2);
      } else {
        setErro(data.erro || '❌ Erro ao enviar email');
      }
    } catch (err) {
      console.error('Erro ao solicitar recuperação:', err);
      setErro('❌ Erro ao conectar com servidor');
    }
    setLoading(false);
  };

  const handleResetarSenha = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');

    if (novaSenha !== confirmarSenha) {
      setErro('❌ As senhas não conferem');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/resetar-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pacienteId,
          codigo,
          novaSenha,
          confirmarSenha
        })
      });

      const data = await response.json();

      if (data.sucesso) {
        setMensagem('✅ ' + data.mensagem);
        setTimeout(() => voltar(), 2000);
      } else {
        setErro(data.erro || '❌ Erro ao resetar senha');
      }
    } catch (err) {
      console.error('Erro ao resetar senha:', err);
      setErro('❌ Erro ao conectar com servidor');
    }
    setLoading(false);
  };

  return (
    <div className="recuperar-container">
      <div className="recuperar-card">
        <button className="btn-voltar" onClick={voltar} type="button">
          <ArrowLeft size={20} /> Voltar
        </button>

        <div className="recuperar-header">
          <h1>🔐 Recuperar Senha</h1>
          <p>Redefinir sua senha de acesso</p>
        </div>

        {etapa === 1 ? (
          <form onSubmit={handleEsqueciSenha}>
            <div className="form-group">
              <label>📧 Digite seu Email</label>
              <div className="input-wrapper">
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {erro && <div className="rs-alert error">{erro}</div>}
            {mensagem && <div className="rs-alert success">{mensagem}</div>}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? '⏳ Enviando...' : '✉️ Enviar Código'}
            </button>

            <p className="recuperar-info">
              Enviaremos um código de recuperação para seu email.
            </p>
          </form>
        ) : (
          <form onSubmit={handleResetarSenha}>
            <div className="form-group">
              <label>🔐 Código de Recuperação</label>
              <input
                type="text"
                placeholder="Digite o código recebido"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                maxLength="6"
                required
              />
            </div>

            <div className="form-group">
              <label>🔐 Nova Senha</label>
              <div className="input-wrapper">
                <Lock size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>🔐 Confirmar Senha</label>
              <div className="input-wrapper">
                <Lock size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                />
              </div>
            </div>

            {erro && <div className="rs-alert error">{erro}</div>}
            {mensagem && <div className="rs-alert success">{mensagem}</div>}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? '⏳ Resetando...' : '✅ Redefinir Senha'}
            </button>
          </form>
        )}

        <p className="recuperar-footer">
          ❤️ Sua segurança é importante • Dr. Eduardo
        </p>
      </div>
    </div>
  );
}