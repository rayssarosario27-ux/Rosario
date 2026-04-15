import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Smartphone } from 'lucide-react';
import '../styles/RecuperarSenha.css';

export default function RecuperarSenha({ onVoltar }) {
  const navigate = useNavigate();
  const voltar = onVoltar || (() => navigate('/'));

  const [etapa, setEtapa] = useState(1);
  const [canal, setCanal] = useState('email');
  const [contato, setContato] = useState('');
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
      const response = await fetch('http://localhost:5000/api/auth/esqueci-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canal, contato })
      });

      const data = await response.json();

      if (data.sucesso) {
        setPacienteId(data.pacienteId);
        setMensagem('✅ ' + data.mensagem);
        setEtapa(2);
      } else {
        setErro(data.erro || '❌ Erro ao enviar código');
      }
    } catch (err) {
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
      const response = await fetch('http://localhost:5000/api/auth/resetar-senha', {
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
            <div className="form-group canal-group">
              <label>
                <input
                  type="radio"
                  name="canal"
                  value="email"
                  checked={canal === 'email'}
                  onChange={() => setCanal('email')}
                />
                <Mail size={16} /> E-mail
              </label>
              <label>
                <input
                  type="radio"
                  name="canal"
                  value="whatsapp"
                  checked={canal === 'whatsapp'}
                  onChange={() => setCanal('whatsapp')}
                />
                <Smartphone size={16} /> WhatsApp
              </label>
            </div>
            <div className="form-group">
              <label>{canal === 'email' ? '📧 Digite seu Email' : '📱 Digite seu WhatsApp'}</label>
              <div className="input-wrapper">
                {canal === 'email' ? <Mail size={18} /> : <Smartphone size={18} />}
                <input
                  type={canal === 'email' ? 'email' : 'text'}
                  placeholder={canal === 'email' ? 'seu@email.com' : '21999999999'}
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                  required
                />
              </div>
            </div>

            {erro && <div className="alert alert-error">{erro}</div>}
            {mensagem && <div className="alert alert-success">{mensagem}</div>}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? '⏳ Enviando...' : '✉️ Enviar Código'}
            </button>

            <p className="recuperar-info">
              Enviaremos um código de recuperação para seu {canal === 'email' ? 'email' : 'WhatsApp'}.
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

            {erro && <div className="alert alert-error">{erro}</div>}
            {mensagem && <div className="alert alert-success">{mensagem}</div>}

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