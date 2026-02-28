
import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home'; // Importe a página Home
import './App.css'; // Importe seu CSS global aqui

function App() {
  return (
    <div id="root"> {/* Contêiner pai com min-height: 100vh */}
      <Header />
      
      {/* O container que empurra o footer */}
      <div className="main-content-wrapper">
        <Home /> {/* O conteúdo da Home entra aqui */}
      </div>
      
      <Footer />
    </div>
  );
}

export default App;