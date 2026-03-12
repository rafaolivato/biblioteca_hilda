import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import AdicionarLivro from './pages/AdicionarLivro';
import Acervo from './pages/Acervo';
import NovoEmprestimo from './pages/NovoEmprestimo'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/adicionar-livro" element={<AdicionarLivro />} />
        <Route path="/acervo" element={<Acervo />} />
        <Route path="/novo-emprestimo" element={<NovoEmprestimo />} />
        {/* Redireciona qualquer rota desconhecida para o login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;