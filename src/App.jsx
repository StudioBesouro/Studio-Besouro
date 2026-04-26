import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// 1. Importação dos Componentes de Layout
import Header from './components/Header';
import Footer from './components/Footer';

// 2. Importação das Páginas
import Home from './pages/Home';
import Contato from './pages/Contato'; 
import Cadastro from './pages/Cadastro'; 
import Login from './pages/Login';
import Admin from './pages/Admin';
import Artista from './pages/Artista';      // Esta página agora contém o ArtistaObras
import PaginaArtista from './pages/PaginaArtista'; 
import Pesquisa from './pages/Pesquisa';

// 3. Estilos
import './App.css';

function AppContent() {
  const location = useLocation();
  const rotaAtual = location.pathname.toLowerCase();

  // --- LÓGICA DE INTERFACE (HEADER/FOOTER) ---
  
  // Rotas que escondem o Header padrão (Geralmente telas cheias ou painéis)
  const rotasSemHeaderPadrao = ['/login', '/cadastro', '/admin', '/contato'];

  const isArtistaPublico = rotaAtual.startsWith('/artista');
  const isPaginaArtistaGestao = rotaAtual.startsWith('/paginaartista');
  const isPesquisa = rotaAtual.startsWith('/pesquisa');

  // Condição para esconder o Header
  const esconderHeader = 
    rotasSemHeaderPadrao.includes(rotaAtual) || 
    isArtistaPublico || 
    isPaginaArtistaGestao || 
    isPesquisa;

  // Condição para esconder o Footer
  const esconderFooter = 
    rotaAtual.startsWith('/admin') || 
    isArtistaPublico || 
    isPaginaArtistaGestao;

  return (
    <div id="root">
      {/* O Header só aparece se NÃO for para esconder */}
      {!esconderHeader && <Header />}

      <div className="main-content-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />

          {/* Rota do Perfil do Artista (Público) 
              O componente Artista.jsx agora gerencia o ArtistaObras.jsx internamente */}
          <Route path="/artista/:id" element={<Artista />} />
          
          <Route path="/paginaartista/:id" element={<PaginaArtista />} />
          <Route path="/pesquisa/:tipo" element={<Pesquisa />} />
        </Routes>
      </div>

      {/* O Footer aparece seguindo a lógica de exclusão */}
      {!esconderFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router> 
      <AppContent />
    </Router>
  );
}

export default App;