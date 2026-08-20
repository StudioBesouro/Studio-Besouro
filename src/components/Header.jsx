import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiMail, FiUser } from 'react-icons/fi';
import { supabase } from '../lib/supabaseClient';
import AuthModal from './AuthModal';
import logo from '../assets/logo.png';
import './Header.css';

export default function Header({ setPesquisa }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [input, setInput] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [rolouPagina, setRolouPagina] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [indiceSelecionado, setIndiceSelecionado] = useState(-1);

  const isHome = location.pathname === '/';

  useEffect(() => { 
    if (!isHome) setRolouPagina(false); 
  }, [location.pathname, isHome]);

  useEffect(() => {
    if (!isHome) return;
    const fn = () => setRolouPagina(window.scrollY > 80);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, [isHome]);

  const buscarSugestoes = async (valor) => {
    if (!valor.trim()) { 
      setSugestoes([]); 
      setIndiceSelecionado(-1); 
      return; 
    }
    try {
      const [{ data: obras }, { data: artists }] = await Promise.all([
        supabase
          .from('obras')
          .select('id_obra, titulo, perfil_artista(nome)')
          .ilike('titulo', `%${valor}%`)
          .limit(5),
        supabase
          .from('perfil_artista')
          .select('id_artista, nome')
          .ilike('nome', `%${valor}%`)
          .limit(4)
      ]);

      setSugestoes([
        ...(artists || []).map(a => ({ id: a.id_artista, texto: a.nome, tipo: 'artista' })),
        ...(obras || []).map(o => ({ 
          id: o.id_obra, 
          texto: o.titulo, 
          subtexto: o.perfil_artista?.nome ? `por ${o.perfil_artista.nome}` : undefined, 
          tipo: 'obra' 
        })),
      ]);
      setIndiceSelecionado(-1);
    } catch (err) {
      console.error("Erro na busca:", err);
    }
  };

  const navegarParaSugestao = (item) => {
    setInput(item.texto);
    setSugestoes([]);
    setIndiceSelecionado(-1);
    if (setPesquisa) setPesquisa(item.texto);

    if (item.tipo === 'artista') {
      navigate(`/artista/${item.id}`);
    } else {
      navigate(`/?obraId=${item.id}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndiceSelecionado(p => Math.min(p + 1, sugestoes.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndiceSelecionado(p => Math.max(p - 1, -1));
      return;
    }
    if (e.key === 'Escape') {
      setSugestoes([]);
      setIndiceSelecionado(-1);
      return;
    }
    if (e.key === 'Enter') {
      if (indiceSelecionado >= 0 && sugestoes[indiceSelecionado]) {
        navegarParaSugestao(sugestoes[indiceSelecionado]);
        return;
      }
      if (input.trim()) {
        setSugestoes([]);
        if (setPesquisa) setPesquisa(input);
      }
    }
  };

  const irParaHomeETopo = () => {
    navigate('/');
    if (setPesquisa) setPesquisa('');
    setInput('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className={`main-header ${isHome ? 'header-home' : 'header-internas'} ${rolouPagina ? 'header-scrolled' : ''}`}>
        <div className="logo-container" onClick={irParaHomeETopo} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="Studio Besouro Logo" className="logo-icon" />
          <span className="logo-text">
            <span className="text-green">Studio</span> <span className="text-purple">Besouro</span>
          </span>
        </div>

        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Pesquisar artistas ou obras..."
            className="search-input"
            value={input}
            onKeyDown={handleKeyDown}
            onBlur={() => setTimeout(() => { setSugestoes([]); setIndiceSelecionado(-1); }, 200)}
            onChange={(e) => {
              const v = e.target.value;
              setInput(v);
              if (setPesquisa) setPesquisa(v);
              buscarSugestoes(v);
            }}
          />
          {sugestoes.length > 0 && (
            <div className="suggestions-box">
              {sugestoes.map((item, index) => (
                <div
                  key={`${item.tipo}-${item.id}`}
                  className={`suggestion-item ${index === indiceSelecionado ? 'selected' : ''}`}
                  onMouseDown={() => navegarParaSugestao(item)}
                  onMouseEnter={() => setIndiceSelecionado(index)}
                >
                  <div className="suggestion-main">
                    <span className="suggestion-text">{item.texto}</span>
                    {item.subtexto && <span className="suggestion-sub">{item.subtexto}</span>}
                  </div>
                  <span className="suggestion-type">{item.tipo}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="header-actions">
          <button 
            type="button" 
            className="login-button-header" 
            onClick={() => setAuthOpen(true)}
          >
            <FiUser className="btn-icon" />
            <span>Login</span>
          </button>

          <button 
            type="button" 
            className="contact-button" 
            onClick={() => navigate('/contato')}
          >
            <FiMail className="mail-icon" />
            <span>Contato Curadoria</span>
          </button>
        </div>
      </header>

      {/* Passamos múltiplos nomes de props comuns para garantir compatibilidade com o seu AuthModal */}
      <AuthModal 
        isOpen={authOpen} 
        onClose={() => setAuthOpen(false)}
        show={authOpen}
        onBlur={() => setAuthOpen(false)}
        setShow={setAuthOpen}
      />
    </>
  );
}