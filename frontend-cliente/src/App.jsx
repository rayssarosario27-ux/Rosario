import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import RecuperarSenha from './pages/RecuperarSenha';
import Agenda from './pages/Agenda';
import CRM from './pages/admin/CRM';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/agendar" element={<Agenda />} />
        <Route path="/admin/crm" element={<CRM />} />
      </Routes>
    </BrowserRouter>
  );
}
