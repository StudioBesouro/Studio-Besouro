import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeaderContato.css';
import { FiHome } from 'react-icons/fi';
import logo from '../assets/logo.png';

const HeaderContato = ({ setPesquisa }) => {
  const navigate = useNavigate();

  // Função idêntica para limpar buscas e garantir que vá para o topo na home
  const irParaOTopoEHome = () => {
    navigate('/');
    if (setPesquisa) setPesquisa(''); 
    
    setTimeout(() => {
      const bannerElement = document.querySelector('.banner-wrapper');
      if (bannerElement) {
        bannerElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
        document.body.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <header className="header-contato">
      {/* Agora ao clicar na logo ou no nome, limpa os filtros e joga pro topo da Home */}
      <div className="logo-section" onClick={irParaOTopoEHome} style={{ cursor: 'pointer' }}>
        <img src={logo} alt="Studio Besouro Logo" className="logo-img" />
        <span className="logo-name">
          <span className="text-green">Studio</span> <span className="text-purple">Besouro</span>
        </span>
      </div>

      <button className="back-button" onClick={irParaOTopoEHome}>
        <FiHome className="home-icon" />
        <span>Voltar ao Início</span>
      </button>
    </header>
  );
};

export default HeaderContato;