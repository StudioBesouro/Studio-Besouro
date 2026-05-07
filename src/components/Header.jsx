import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMail, FiUser } from 'react-icons/fi';
import { supabase } from '../lib/supabaseClient';
import logo from '../assets/logo.png';
import './Header.css';

const Header = ({ setPesquisa }) => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [sugestoes, setSugestoes] = useState([]);

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
      const { data: artistas } = await supabase
        .from('perfil_artista')
        .select('id_artista, nome')
        .ilike('nome', `%${valor}%`)
        .limit(4);

      const listaObras = obras?.map(item => ({ 
        id: item.id_obra, 
        texto: item.titulo, 
        tipo: 'obra' 
      })) || [];

      const listaArtistas = artistas?.map(item => ({ 
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
    
    if (item.tipo === 'artista') {
      // Redireciona para a página do artista usando o ID
      navigate(`/artista/${item.id}`);
    } else {
      // Redireciona para a home abrindo o modal da obra
      navigate(`/?obraId=${item.id}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      setSugestoes([]);
      navigate(`/pesquisa?busca=${encodeURIComponent(input)}`);
    }
  };

  return (
    <header className="main-header">
      <div className="logo-container" onClick={() => navigate('/')}>
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
          onBlur={() => setTimeout(() => setSugestoes([]), 200)}
          onChange={(e) => {
            const valor = e.target.value;
            setInput(valor);
            if(setPesquisa) setPesquisa(valor); 
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