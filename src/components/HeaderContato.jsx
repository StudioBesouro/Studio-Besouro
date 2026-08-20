import { useNavigate } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import logo from '../assets/logo.png';
import './HeaderContato.css';

export default function HeaderContato({ setPesquisa }) {
  const navigate = useNavigate();
  const irHome = () => {
    navigate('/');
    if (setPesquisa) setPesquisa('');
    setTimeout(() => { const b = document.querySelector('.banner-wrapper'); if (b) b.scrollIntoView({ behavior: 'smooth', block: 'start' }); else window.scrollTo({ top: 0, behavior: 'smooth' }); }, 100);
  };
  return (
    <header className="header-contato">
      <div className="logo-section" onClick={irHome} style={{ cursor: 'pointer' }}>
        <img src={logo} alt="Studio Besouro Logo" className="logo-img" />
        <span className="logo-name"><span className="text-green">Studio</span> <span className="text-purple">Besouro</span></span>
      </div>
      <button className="back-button" onClick={irHome}><FiHome className="home-icon" /><span>Voltar ao Início</span></button>
    </header>
  );
}