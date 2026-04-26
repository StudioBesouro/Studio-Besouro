import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeaderContato.css';
import { FiHome } from 'react-icons/fi';
import logo from '../assets/logo.png';

const HeaderContato = () => {
  const navigate = useNavigate();

  return (
    <header className="header-contato">
      {/* Estrutura igual à Home */}
      <div className="logo-section">
        <img src={logo} alt="Studio Besouro Logo" className="logo-img" />
        <span className="logo-name">
          <span className="text-green">Studio</span> <span className="text-purple">Besouro</span>
        </span>
      </div>

      <button className="back-button" onClick={() => navigate('/')}>
        <FiHome className="home-icon" />
        <span>Voltar ao Início</span>
      </button>
    </header>
  );
};

export default HeaderContato;