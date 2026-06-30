import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { FiSearch, FiMail, FiUser } from 'react-icons/fi';
import { supabase } from '../lib/supabaseClient';
import logo from '../assets/logo.png';
import './Header.css';

const Header = ({ setPesquisa }) => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [input, setInput] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [rolouPagina, setRolouPagina] = useState(false);

  // Define se é Home dinamicamente com base na rota atual
  const isHome = location.pathname === '/';

  // Força o reset do efeito de scroll toda vez que o usuário muda de página
  useEffect(() => {
    if (!isHome) {
      setRolouPagina(false); // Nas páginas internas nunca aplica a classe de scrolled
    }
  }, [location.pathname, isHome]);

  // Monitora a rolagem da página APENAS se estiver na Home
  useEffect(() => {
    if (!isHome) return; // Se NÃO for home, cancela o monitoramento de scroll imediatamente

    const monitorarScroll = () => {
      if (window.scrollY > 80) {
        setRolouPagina(true);
      } else {
        setRolouPagina(false);
      }
    };

    window.addEventListener('scroll', monitorarScroll);
    return () => window.removeEventListener('scroll', monitorarScroll);
  }, [isHome]); // Recarrega o listener apenas se o estado de "isHome" mudar

  const buscarSugestoes = async (valor) => {
    if (!valor.trim()) {
      setSugestoes([]);
      return;
    }

    try {
      // Busca Obras
      const { data: obras } = await supabase
        .from('obras') 
        .select('id_obra, titulo')
        .ilike('titulo', `%${valor}%`)
        .limit(4);

      // Busca Artistas
      const { data: artists } = await supabase
        .from('perfil_artista')
        .select('id_artista, nome')
        .ilike('nome', `%${valor}%`)
        .limit(4);

      const listaObras = obras?.map(item => ({ 
        id: item.id_obra, 
        texto: item.titulo, 
        tipo: 'obra' 
      })) || [];

      const listaArtistas = artists?.map(item => ({ 
        id: item.id_artista, 
        texto: item.nome, 
        tipo: 'artista' 
      })) || [];

      setSugestoes([...listaArtistas, ...listaObras]);
    } catch (error) {
      console.error("Erro na busca:", error);
    }
  };

  const manipularSelecao = (item) => {
    setInput(item.texto);
    setSugestoes([]);
    
    if (setPesquisa) setPesquisa(item.texto);

    if (item.tipo === 'artista') {
      navigate(`/artista/${item.id}`);
    } else {
      navigate(`/?obraId=${item.id}`);
    }
  };

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && input.trim()) {
      setSugestoes([]);
      if (setPesquisa) setPesquisa(input);

      try {
        const { data: obras } = await supabase
          .from('obras')
          .select(`id_obra, perfil_artista!inner(nome)`)
          .or(`titulo.ilike.%${input}%, perfil_artista.nome.ilike.%${input}%`)
          .limit(1);

        if (obras && obras.length > 0) {
          navigate(`/?obraId=${obras[0].id_obra}`);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error("Erro ao processar Enter:", error);
        navigate('/');
      }
    }
  };

  // Função para ir para a Home limpando filtros e buscando o topo do banner
  const irParaOTopoEHome = () => {
    navigate('/');
    if (setPesquisa) setPesquisa(''); 
    setInput('');
    
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
    <header 
      className={`main-header ${isHome ? 'header-home' : 'header-internas'} ${rolouPagina ? 'header-scrolled' : ''}`}
    >
      <div className="logo-container" onClick={irParaOTopoEHome}>
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
          onBlur={() => setTimeout(() => setSugestoes([]), 300)}
          onChange={(e) => {
            const valor = e.target.value;
            setInput(valor);
            if (setPesquisa) setPesquisa(valor); 
            buscarSugestoes(valor);
          }}
        />

        {sugestoes.length > 0 && (
          <div className="suggestions-box">
            {sugestoes.map((item, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => manipularSelecao(item)}
              >
                <span className="suggestion-text">{item.texto}</span>
                <span className="suggestion-type">{item.tipo}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="header-actions">
        <button className="login-button-header" onClick={() => navigate('/login')}>
          <FiUser className="btn-icon" />
          <span>Login</span>
        </button>

        <button className="contact-button" onClick={() => navigate('/contato')}>
          <FiMail className="mail-icon" />
          <span>Contato Curadoria</span>
        </button>
      </div>
    </header>
  );
};

export default Header;