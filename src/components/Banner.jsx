import React, { useState, useEffect } from 'react'; // Importamos useEffect
import './Banner.css';

const Banner = ({ noticias }) => {
  const [indexAtual, setIndexAtual] = useState(0);
  const [aberto, setAberto] = useState(false);

  const noticiaAtual = noticias[indexAtual];

  // Funções de navegação
  const proximaNoticia = () => {
    setIndexAtual((prev) => (prev + 1) % noticias.length);
  };

  const anteriorNoticia = () => {
    setIndexAtual((prev) => (prev - 1 + noticias.length) % noticias.length);
  };

  // --- LÓGICA DE AUTO-PLAY ---
  useEffect(() => {
    // Só inicia o timer se houver mais de uma notícia e o modal estiver fechado
    if (noticias.length > 1 && !aberto) {
      const intervalo = setInterval(() => {
        proximaNoticia();
      }, 5000); // 5000ms = 5 segundos

      // Limpa o intervalo quando o componente desmonta ou o estado muda
      return () => clearInterval(intervalo);
    }
  }, [indexAtual, aberto, noticias.length]); 
  // ---------------------------

  if (!noticiaAtual || noticias.length === 0) return null;

  const temMaisDeUma = noticias.length > 1;

  return (
    <>
      <section className="banner-wrapper">
        <div className="banner">
          {/* Key ajuda o React a entender a troca e permite animações de fade via CSS */}
          <img 
            key={noticiaAtual.id}
            src={noticiaAtual.imagem_url} 
            alt={noticiaAtual.titulo} 
            className="banner-image" 
          />
          
          <div className="banner-overlay">
            <h2 className="banner-pre-titulo">Principais notícias do IFMA-Campus Timon</h2>
            <p className="banner-titulo">{noticiaAtual.titulo}</p>
            <button 
              className="btn-ler-mais" 
              onClick={() => setAberto(true)}
            >
              Clique para ler mais →
            </button>
          </div>
        </div>

        {temMaisDeUma && (
          <>
            <button 
              className="banner-nav-btn prev" 
              onClick={(e) => {
                e.stopPropagation();
                anteriorNoticia();
              }}
            >
              &#8249;
            </button>

            <button 
              className="banner-nav-btn next" 
              onClick={(e) => {
                e.stopPropagation();
                proximaNoticia();
              }}
            >
              &#8250;
            </button>

            {/* Indicadores Visuais (opcional, mas ajuda o usuário) */}
            <div className="banner-dots">
              {noticias.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`dot ${idx === indexAtual ? 'active' : ''}`}
                  onClick={() => setIndexAtual(idx)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* MODAL */}
      {aberto && (
        <div className="banner-modal" onClick={() => setAberto(false)}>
          <div className="banner-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setAberto(false)}>×</button>
            
            <div className="modal-image">
              <img src={noticiaAtual.imagem_url} alt={noticiaAtual.titulo} />
            </div>

            <div className="modal-text">
              <span className="tag-categoria">{noticiaAtual.categoria || 'IFMA Timon'}</span>
              <h2 className="modal-titulo">{noticiaAtual.titulo}</h2>
              <div 
                className="descricao-completa"
                dangerouslySetInnerHTML={{ 
                  __html: noticiaAtual.conteudo_completo || noticiaAtual.descricao 
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Banner;