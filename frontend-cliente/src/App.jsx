import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import RecuperarSenha from './pages/RecuperarSenha';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [paciente, setPaciente] = useState(() => {
    try {
      const saved = localStorage.getItem('paciente');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/auth"
          element={
            token
              ? <Navigate to="/dashboard" replace />
              : <Auth setToken={setToken} setPaciente={setPaciente} />
          }
        />
        <Route
          path="/dashboard"
          element={
            token
              ? <Dashboard paciente={paciente} setToken={setToken} setPaciente={setPaciente} />
              : <Navigate to="/auth" replace />
          }
        />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      </Routes>
    </BrowserRouter>
  );
}
