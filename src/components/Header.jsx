import React from 'react';
import './Header.css';
import { FiSearch, FiMail } from 'react-icons/fi';
// Importe a imagem aqui. Ajuste a extensão (png, jpg, etc) conforme o seu arquivo.
import logo from '../assets/logo.png'; 

const Header = () => {
  return (
    <header className="main-header">
      {/* Lado Esquerdo: Logo */}
      <div className="logo-container">
        {/* Usamos a variável 'logo' que importamos acima */}
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

      {/* Lado Direito: Botão de Contato */}
      <button className="contact-button">
        <FiMail className="mail-icon" />
        <span>Contato Curadoria</span>
      </button>
    </header>
  );
};

export default Header;