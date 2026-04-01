import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, ArrowLeft, CreditCard, Phone,
  Smartphone, Hash, MapPin, Globe, Calendar
} from 'lucide-react';
import '../styles/Auth.css';

function validarCPF(cpf) {
  const nums = cpf.replace(/\D/g, '');
  if (nums.length !== 11 || /^(\d)\1+$/.test(nums)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(nums[i]) * (10 - i);
  let r = (soma * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(nums[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(nums[i]) * (11 - i);
  r = (soma * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(nums[10]);
}

function formatarCPF(valor) {
  const nums = valor.replace(/\D/g, '').slice(0, 11);
  return nums
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [cpfErro, setCpfErro] = useState('');
  const [cepErro, setCepErro] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '',
    endereco: '',
    cep: '',
    cidade: '',
    bairro: '',
    nacionalidade: '',
    convenio: '',
    carteirinha: '',
    celular: '',
    telefone: '',
    email: '',
    senha: ''
  });

  const [semConvenio, setSemConvenio] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsLogin(params.get('mode') !== 'register');
  }, [location]);

  const isFormValid = () => {
    if (isLogin) return formData.email && formData.senha;

    const required =
      formData.nome &&
      formData.cpf &&
      formData.dataNascimento &&
      formData.endereco &&
      formData.cep &&
      formData.cidade &&
      formData.bairro &&
      formData.nacionalidade &&
      formData.celular &&
      formData.email &&
      formData.senha &&
      !cpfErro;

    const convenioValid =
      semConvenio || (formData.convenio && formData.carteirinha);

    return required && convenioValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCpfChange = (e) => {
    const formatted = formatarCPF(e.target.value);
    setFormData((prev) => ({ ...prev, cpf: formatted }));
    const raw = formatted.replace(/\D/g, '');
    if (raw.length === 11) {
      setCpfErro(validarCPF(raw) ? '' : 'CPF inválido. Verifique os números informados.');
    } else {
      setCpfErro('');
    }
  };

  const handleCepChange = async (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
    const formatted = raw.length > 5 ? raw.replace(/(\d{5})(\d{1,3})/, '$1-$2') : raw;
    setFormData((prev) => ({ ...prev, cep: formatted, cidade: '', bairro: '' }));
    setCepErro('');

    if (raw.length === 8) {
      setBuscandoCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        if (!res.ok) throw new Error('CEP lookup failed');
        const data = await res.json();
        if (data.erro) {
          setCepErro('CEP não encontrado. Verifique o número informado.');
        } else {
          setFormData((prev) => ({
            ...prev,
            cidade: data.localidade || '',
            bairro: data.bairro || '',
          }));
        }
      } catch {
        setCepErro('Não foi possível buscar o CEP. Tente novamente.');
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="hero-overlay">
          <button onClick={() => navigate('/')} className="back-link">
            <ArrowLeft size={18} /> Voltar
          </button>

          <h1>Acesso à saúde de qualidade.</h1>
          <p>Portal exclusivo para pacientes.</p>
        </div>
      </div>

      <div className="auth-form-container">
        <div className="form-box scrollable">
          <h2>{isLogin ? 'Entrar' : 'Criar Conta'}</h2>

          <form onSubmit={(e) => e.preventDefault()}>
            {!isLogin && (
              <>
                <div className="input-group">
                  <label>Nome</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={20} />
                    <input name="nome" onChange={handleChange} />
                  </div>
                </div>

                <div className="input-group">
                  <label>CPF</label>
                  <div className="input-wrapper">
                    <Hash className="input-icon" size={20} />
                    <input
                      name="cpf"
                      inputMode="numeric"
                      value={formData.cpf}
                      onChange={handleCpfChange}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </div>
                  {cpfErro && <span className="field-error">{cpfErro}</span>}
                </div>

                <div className="input-group">
                  <label>Data de Nascimento</label>
                  <div className="input-wrapper">
                    <Calendar className="input-icon" size={20} />
                    <input
                      name="dataNascimento"
                      type="date"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Nacionalidade</label>
                  <div className="input-wrapper">
                    <Globe className="input-icon" size={20} />
                    <input
                      name="nacionalidade"
                      onChange={handleChange}
                      placeholder="Ex: Brasileira"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>CEP</label>
                  <div className="input-wrapper">
                    <MapPin className="input-icon" size={20} />
                    <input
                      name="cep"
                      inputMode="numeric"
                      value={formData.cep}
                      onChange={handleCepChange}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                    {buscandoCep && <span className="cep-loading">Buscando...</span>}
                  </div>
                  {cepErro && <span className="field-error">{cepErro}</span>}
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Cidade</label>
                    <div className="input-wrapper">
                      <MapPin className="input-icon" size={20} />
                      <input
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleChange}
                        placeholder="Preenchido pelo CEP"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Bairro</label>
                    <div className="input-wrapper">
                      <MapPin className="input-icon" size={20} />
                      <input
                        name="bairro"
                        value={formData.bairro}
                        onChange={handleChange}
                        placeholder="Preenchido pelo CEP"
                      />
                    </div>
                  </div>
                </div>

                <div className="input-group">
                  <label>Endereço</label>
                  <div className="input-wrapper">
                    <MapPin className="input-icon" size={20} />
                    <input
                      name="endereco"
                      onChange={handleChange}
                      placeholder="Rua, número, complemento"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Convênio</label>
                  <div className="input-wrapper">
                    <CreditCard className="input-icon" size={20} />
                    <input
                      name="convenio"
                      disabled={semConvenio}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      checked={semConvenio}
                      onChange={() => setSemConvenio(!semConvenio)}
                    />
                    <label>Sem convênio</label>
                  </div>
                </div>

                {!semConvenio && formData.convenio && (
                  <div className="input-group">
                    <label>Carteirinha</label>
                    <div className="input-wrapper">
                      <Hash className="input-icon" size={20} />
                      <input name="carteirinha" onChange={handleChange} />
                    </div>
                  </div>
                )}

                <div className="input-row">
                  <div className="input-group">
                    <label>Celular</label>
                    <div className="input-wrapper">
                      <Smartphone className="input-icon" size={20} />
                      <input name="celular" onChange={handleChange} />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Telefone</label>
                    <div className="input-wrapper">
                      <Phone className="input-icon" size={20} />
                      <input name="telefone" onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="input-group">
              <label>Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input name="email" type="email" onChange={handleChange} />
              </div>
            </div>

            <div className="input-group">
              <label>Senha</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input name="senha" type="password" onChange={handleChange} />
              </div>
            </div>

            <button
              type="submit"
              className={`btn-auth-submit ${!isFormValid() ? 'disabled' : ''}`}
              disabled={!isFormValid()}
            >
              {isLogin ? 'Entrar' : 'Cadastrar'}
            </button>
          </form>

          {isLogin ? (
            <p className="auth-switch-text">
              Não tem cadastro?{' '}
              <button className="auth-switch-link" onClick={() => navigate('/auth?mode=register')}>
                Cadastre-se
              </button>
            </p>
          ) : (
            <p className="auth-switch-text">
              Já tem cadastro?{' '}
              <button className="auth-switch-link" onClick={() => navigate('/auth')}>
                Entrar
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}