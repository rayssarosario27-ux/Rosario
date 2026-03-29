import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import RecuperarSenha from './pages/RecuperarSenha';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota da Página Inicial */}
        <Route path="/" element={<Home />} />
        
        {/* Rota Única para Login e Cadastro (o componente Auth decide qual exibir) */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Rota de Recuperação de Senha */}
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        
        {/* Rota de segurança: se digitar algo errado, volta para a Home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;