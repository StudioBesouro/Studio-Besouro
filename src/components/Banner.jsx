import { useState, useEffect } from 'react';
import './Banner.css';
import './Modal.css';

export default function Banner({ noticias }) {
  const [indexAtual, setIndexAtual] = useState(0);
  const [aberto, setAberto] = useState(false);
  const noticia = noticias[indexAtual];
  const proxima = () => setIndexAtual(p => (p + 1) % noticias.length);
  const anterior = () => setIndexAtual(p => (p - 1 + noticias.length) % noticias.length);

  useEffect(() => {
    if (noticias.length > 1 && !aberto) {
      const t = setInterval(proxima, 5000);
      return () => clearInterval(t);
    }
  }, [indexAtual, aberto, noticias.length]);

  if (!noticia || !noticias.length) return null;
  return (
    <>
      <section className="banner-wrapper">
        <div className="banner" onClick={() => setAberto(true)}>
          <img src={noticia.imagem_url} alt={noticia.titulo} className="banner-image" />
          <div className="banner-overlay">
            <h2 className="banner-pre-titulo">Principais notícias do IFMA-Campus Timon</h2>
            <p className="banner-titulo">{noticia.titulo}</p>
            <button className="btn-ler-mais">Clique para ler mais →</button>
          </div>
        </div>
        {noticias.length > 1 && <>
          <button className="banner-nav-btn prev" onClick={e => { e.stopPropagation(); anterior(); }}>&#8249;</button>
          <button className="banner-nav-btn next" onClick={e => { e.stopPropagation(); proxima(); }}>&#8250;</button>
          <div className="banner-dots">
            {noticias.map((_, i) => <span key={i} className={`dot ${i === indexAtual ? 'active' : ''}`} onClick={e => { e.stopPropagation(); setIndexAtual(i); }} />)}
          </div>
        </>}
      </section>
      {aberto && (
        <div className="modal-artwork-overlay" onClick={() => setAberto(false)}>
          <div className="modal-artwork-container modal-variacao-banner" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
            <button className="modal-artwork-close-btn" onClick={() => setAberto(false)} style={{ position: 'absolute', top: 16, right: 16, zIndex: 200 }}>✕</button>
            <div className="modal-artwork-image-section">
              <img src={noticia.imagem_url} alt={noticia.titulo} className="modal-artwork-image" />
            </div>
            <div className="modal-artwork-info-section">
              <div className="modal-meta">{noticia.categoria || 'IFMA Timon'}</div>
              <h2 className="modal-artwork-title">{noticia.titulo}</h2>
              <div className="modal-artwork-description">
                <div className="descricao-completa" dangerouslySetInnerHTML={{ __html: noticia.conteudo_completo || noticia.descricao || '' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}