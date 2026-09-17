import React, { useState, useEffect } from 'react';
import './Banner.css';
import './Modal.css';

const Banner = ({ noticias }) => {
  const [indexAtual, setIndexAtual] = useState(0);
  const [aberto, setAberto] = useState(false);

  const noticiaAtual = noticias[indexAtual];

  const proximaNoticia = () => {
    setIndexAtual((prev) => (prev + 1) % noticias.length);
  };

  useEffect(() => {
    if (noticias.length > 1 && !aberto) {
      const intervalo = setInterval(() => {
        proximaNoticia();
      }, 5000);

      return () => clearInterval(intervalo);
    }
  }, [indexAtual, aberto, noticias.length]);

  if (!noticiaAtual || noticias.length === 0) return null;

  const temMaisDeUma = noticias.length > 1;

  return (
    <>
      <section className="banner-wrapper">
        <div className="besouro-pixel"></div>

        {/* CLICK NO BANNER INTEIRO PARA ABRIR O MODAL */}
        <div className="banner" onClick={() => setAberto(true)}>
          <img
            key={noticiaAtual.id}
            src={noticiaAtual.imagem_url}
            alt={noticiaAtual.titulo}
            className="banner-image"
          />

          <div className="banner-overlay">
            <h2 className="banner-pre-titulo">
              Principais notícias do IFMA-Campus Timon
            </h2>

            <p className="banner-titulo">
              {noticiaAtual.titulo}
            </p>

            <button className="btn-ler-mais">
              Clique para ler mais →
            </button>
          </div>
        </div>

        {temMaisDeUma && (
          <>
            <button
              className="banner-nav-btn next"
              onClick={(e) => {
                e.stopPropagation();
                proximaNoticia();
              }}
            >
              &#8250;
            </button>

            <div className="banner-dots">
              {noticias.map((_, idx) => (
                <span
                  key={idx}
                  className={`dot ${idx === indexAtual ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndexAtual(idx);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {aberto && (
        <div
          className="modal-artwork-overlay"
          onClick={() => setAberto(false)}
        >
          <div
            className="modal-artwork-container modal-variacao-banner"
            onClick={(e) => e.stopPropagation()}
          >
            {/* BOTÃO DE FECHAR NO TOPO DO CONTAINER PRINCIPAL DO MODAL */}
            <button
              className="modal-artwork-close-btn"
              onClick={() => setAberto(false)}
            >
              ✕
            </button>

            <div className="modal-artwork-image-section">
              <img
                src={noticiaAtual.imagem_url}
                alt={noticiaAtual.titulo}
                className="modal-artwork-image"
              />
            </div>

            <div className="modal-artwork-info-section">
              <div className="modal-meta">
                {noticiaAtual.categoria || 'IFMA Timon'}
              </div>

              <h2 className="modal-artwork-title">
                {noticiaAtual.titulo}
              </h2>

              <div className="modal-artwork-description">
                <div
                  className="descricao-completa"
                  dangerouslySetInnerHTML={{
                    __html:
                      noticiaAtual.conteudo_completo ||
                      noticiaAtual.descricao
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Banner;