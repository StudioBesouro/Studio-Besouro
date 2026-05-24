import React, { useState } from 'react';
import { FiGrid, FiX } from 'react-icons/fi';
import './ArtistaObras.css'; 
import './modal.css'; 

const ArtistaObras = ({ obras, nomeArtista }) => {
  const [obraSelecionada, setObraSelecionada] = useState(null);

  return (
    <section className="galeria-obras">
      <h2 className="titulo-galeria"><FiGrid /> Portfólio</h2>
      
      {obras.length > 0 ? (
        <div className="grid-obras-publica">
          {obras.map((obra) => (
            <div 
              key={obra.id_obra} 
              className="card-obra-viva"
              onClick={() => setObraSelecionada(obra)}
            >
              <div className="img-container">
                <img src={obra.imagem_url} alt={obra.titulo} loading="lazy" />
              </div>
              <div className="info-obra">
                <h4>{obra.titulo}</h4>
                <p>{obra.descricao?.substring(0, 60)}...</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="aviso-vazio">Este artista ainda não possui obras.</div>
      )}

      {/* MODAL DE DUAS COLUNAS */}
      {obraSelecionada && (
        <div className="modal-overlay" onClick={() => setObraSelecionada(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setObraSelecionada(null)}>
              <FiX />
            </button>
            
            <div className="modal-body">
              <div className="modal-image-container">
                <img src={obraSelecionada.imagem_url} alt={obraSelecionada.titulo} />
              </div>
              <div className="modal-info">
                <h2>{obraSelecionada.titulo}</h2>
                <div className="modal-meta">
                  <span>por <strong>{nomeArtista}</strong></span>
                </div>
                <p className="modal-description">
                  {obraSelecionada.descricao || "Sem descrição disponível."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ArtistaObras;