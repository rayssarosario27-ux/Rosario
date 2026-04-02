import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import RecuperarSenha from './pages/RecuperarSenha';
import Agenda from './pages/Agenda';
import CRM from './pages/admin/CRM';
import MarcarConsulta from './pages/MarcarConsulta';
import ExamesOnline from './pages/ExamesOnline';
import CorpoClinico from './pages/CorpoClinico';

function RotaProtegida({ paciente, children }) {
  if (!paciente) return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [paciente, setPaciente] = useState(() => {
    try { return JSON.parse(localStorage.getItem('paciente')); } catch { return null; }
  });

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (paciente) localStorage.setItem('paciente', JSON.stringify(paciente));
    else localStorage.removeItem('paciente');
  }, [paciente]);

  const handleLogin = (novoToken, novoPaciente) => {
    setToken(novoToken);
    setPaciente(novoPaciente);
  };

  const handleLogout = () => {
    setToken(null);
    setPaciente(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home paciente={paciente} />} />
        <Route path="/auth" element={<Auth onLogin={handleLogin} paciente={paciente} />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route
          path="/dashboard"
          element={
            <RotaProtegida paciente={paciente}>
              <Dashboard paciente={paciente} token={token} setPaciente={setPaciente} onLogout={handleLogout} />
            </RotaProtegida>
          }
        />
        <Route
          path="/agendar"
          element={
            <RotaProtegida paciente={paciente}>
              <Agenda paciente={paciente} token={token} />
            </RotaProtegida>
          }
        />
        <Route path="/marcar-consulta" element={paciente ? <MarcarConsulta paciente={paciente} token={token} /> : <Navigate to="/auth" replace />} />
        <Route path="/exames" element={paciente ? <ExamesOnline paciente={paciente} /> : <Navigate to="/auth" replace />} />
        <Route path="/corpo-clinico" element={paciente ? <CorpoClinico /> : <Navigate to="/auth" replace />} />
        <Route path="/admin/crm" element={<CRM />} />
      </Routes>
    </BrowserRouter>
  );
}

