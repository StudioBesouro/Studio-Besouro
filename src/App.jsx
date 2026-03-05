import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Contato from './pages/Contato'; 
// --- 1. ADICIONE ESTA IMPORTAÇÃO ---
import Cadastro from './pages/Cadastro'; 
// ----------------------------------
import './App.css';

function App() {
  return (
    <Router> 
      <div id="root">
        <div className="main-content-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contato" element={<Contato />} />
            
            {/* --- 2. ADICIONE ESTA ROTA AQUI --- */}
            <Route path="/cadastro" element={<Cadastro />} />
            {/* ---------------------------------- */}
          </Routes>
        </div>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;