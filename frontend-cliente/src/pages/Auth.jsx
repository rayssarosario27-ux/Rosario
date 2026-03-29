import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, CreditCard, Fingerprint, ShieldCheck } from 'lucide-react';
import '../styles/Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Estados para o Cadastro
  const [cpf, setCpf] = useState('');
  const [convenio, setConvenio] = useState('');
  const [carteirinha, setCarteirinha] = useState('');

  // Função para formatar o CPF automaticamente (999.999.999-99)
  const handleCpfChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      setCpf(value);
    }
  };

  return (
    <div className="auth-page">
      {/* Lado Esquerdo - Imagem Temática */}
      <div 
        className="auth-side-image" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 206, 209, 0.3), rgba(0, 0, 0, 0.7)), url('https://images.pexels.com/photos/8376295/pexels-photo-8376295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Link to="/" className="back-link">
          <ArrowLeft size={20} /> Voltar
        </Link>
        <h1>{isLogin ? "Acesso à saúde de qualidade." : "Comece seu cuidado agora."}</h1>
        <p>Portal exclusivo para pacientes da Clínica Dr. Eduardo.</p>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="auth-side-form">
        <div className="auth-form-container">
          <h2>{isLogin ? "Entrar no Portal" : "Criar sua Conta"}</h2>
          <p>{isLogin ? "Insira seus dados para continuar." : "Preencha os dados abaixo para se cadastrar."}</p>

          <form>
            {/* CAMPOS EXCLUSIVOS DE CADASTRO */}
            {!isLogin && (
              <>
                <div className="input-box">
                  <label><User size={14} /> Nome Completo</label>
                  <input type="text" placeholder="Como quer ser chamado?" required />
                </div>

                <div className="input-box">