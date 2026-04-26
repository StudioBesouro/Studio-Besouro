import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import { FiSearch, FiMail, FiUser } from 'react-icons/fi';
import logo from '../assets/logo.png'; 

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="main-header">
      {/* Lado Esquerdo: Logo (Apenas visual ou volta para Home) */}
      <div className="logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
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

      {/* Lado Direito: Container de Ações */}
      <div className="header-actions">
        {/* Novo Botão de Login Verde */}
        <button 
          className="login-button-header" 
          onClick={() => navigate('/login')}
        >
          <FiUser className="btn-icon" />
          <span>Login</span>
        </button>

        {/* Botão de Contato Curadoria Roxo */}
        <button 
          className="contact-button" 
          onClick={() => navigate('/contato')}
        >
          <FiMail className="mail-icon" />
          <span>Contato Curadoria</span>
        </button>
      </div>
    </header>
  );
};

export default Header;