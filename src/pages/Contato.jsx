import React from 'react';
import { Link } from 'react-router-dom'; // Importante para a navegação
import HeaderContato from '../components/HeaderContato';
import './Contato.css';

const Contato = () => {
  return (
    <>
      <HeaderContato />
      <main className="contato-main">
        <h1 className="contato-title"><br />Contato com a Curadoria</h1>
        
        <p className="contato-subtitle">
          O Studio Besouro é uma plataforma digital que busca promover artistas independentes do IFMA Campus Timon e suas obras.
        </p>

        {/* Card Branco Existente */}
        <div className="contact-card">
          <div className="card-header">
            <span className="card-icon">🎨</span>
            <h2 className="card-title">Sobre a Curadoria</h2>
          </div>
          <p className="card-description">
            Nossa equipe de curadoria é formada por profissionais apaixonados pela arte e cultura brasileira...
          </p>

          <div className="email-section">
            <span className="email-icon">✉️</span>
            <h3 className="email-title">Entre em Contato</h3>
            <p className="email-text">Para dúvidas, sugestões ou parcerias, entre em contato conosco:</p>
            <a href="mailto:curadoria@studiobesouro.art" className="email-link">
              curadoria@studiobesouro.art →
            </a>
          </div>
        </div>

        {/* --- NOVA SEÇÃO DE CADASTRO (ROXA) --- */}
        <div className="help-section">
          <div className="help-icon">👤+</div>
          <h2 className="help-title">Gostaria de nos ajudar?</h2>
          <p className="help-text">
            Faça um cadastro para participar do projeto e fazer parte da nossa comunidade artística!
          </p>
          <Link to="/cadastro" className="help-button">
            Fazer Cadastro →
          </Link>
        </div>
      </main>
    </>
  );
};

export default Contato;