import React from 'react';
import './Footer.css';
import logo from '../assets/logo.png'; 

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-logo-container">
          <img src={logo} alt="Studio Besouro Logo" className="footer-logo" />
          <span className="footer-text">
            Studio Besouro
          </span>
        </div>
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} Studio Besouro - Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;