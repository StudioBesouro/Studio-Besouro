import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importa o hook de navegação
import './Header.css';
import { FiSearch, FiMail } from 'react-icons/fi';
import logo from '../assets/logo.png'; 

const Header = () => {
  const navigate = useNavigate(); // 2. Inicializa a função de navegar

  return (
    <header className="main-header">
      {/* Lado Esquerdo: Logo (Clicar nela volta para a Home) */}
      <div 
        className="logo-container" 
        onClick={() => navigate('/')} 
        style={{ cursor: 'pointer' }}
      >
        <img src={logo} alt="Studio Besouro Logo" className="logo-icon" />
        <span className="logo-text">
          <span className="text-green">Studio</span> <span className="text-purple">Besouro</span>
        </span>
      </div>

      {/* Centro: Barra de Pesquisa */}
      <div className="search-container">
        <FiSearch className="search-icon" />
        <input 
          type="text" 
          placeholder="Pesquisar artistas ou obras..." 
          className="search-input"
        />
      </div>

      {/* Lado Direito: Botão de Contato (Agora funcional!) */}
      <button 
        className="contact-button" 
        onClick={() => navigate('/contato')} // 3. Ao clicar, vai para /contato
      >
        <FiMail className="mail-icon" />
        <span>Contato Curadoria</span>
      </button>
    </header>
  );
};

export default Header;