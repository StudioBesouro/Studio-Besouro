import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importando para o botão funcionar
import './Header.css';
import { FiSearch, FiMail } from 'react-icons/fi';
import logo from '../assets/logo.png'; 

const Header = () => {
  const navigate = useNavigate(); // Inicializando a navegação

  return (
    <header className="main-header">
      {/* Lado Esquerdo: Logo (Estática agora) */}
      <div className="logo-container">
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

      {/* Lado Direito: Botão de Contato (Funcional novamente) */}
      <button 
        className="contact-button" 
        onClick={() => navigate('/contato')} // Leva para a página de contato
      >
        <FiMail className="mail-icon" />
        <span>Contato Curadoria</span>
      </button>
    </header>
  );
};

export default Header;