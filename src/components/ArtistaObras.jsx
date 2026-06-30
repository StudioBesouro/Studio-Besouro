import React, { useState } from 'react';
import { FiGrid, FiX } from 'react-icons/fi';
import './ArtistaObras.css'; 
import './Modal.css'; 

const ArtistaObras = ({ obras, nomeArtista }) => {
  const [obraSelecionada, setObraSelecionada] = useState(null);

  // Identifica dinamicamente se o arquivo é um PDF, Vídeo ou Imagem
  const identificarTipoMidia = (url) => {
    if (!url) return 'imagem';
    const urlSemQuery = url.split('?')[0].toLowerCase();
    
    if (urlSemQuery.endsWith('.pdf')) return 'pdf';
    if (
      urlSemQuery.endsWith('.mp4') || 
      urlSemQuery.endsWith('.mov') || 
      urlSemQuery.endsWith('.webm') || 
      urlSemQuery.endsWith('.ogg') ||
      urlSemQuery.endsWith('.m4v')
    ) return 'video';
    
    return 'imagem';
  };

  // Renderizador dinâmico corrigido para manter o vídeo PARADO na listagem
  const renderizarMidia = (url, titulo, tipoMidia, emModal = false) => {
    if (tipoMidia === 'video') {
      // Injeta #t=0.1 na URL para capturar um frame inicial estático (vira uma foto de capa)
      const urlComCapa = url.includes('?') ? url.replace('?', '#t=0.1?') : `${url}#t=0.1`;

      return (
        <video 
          key={url + (emModal ? '-modal' : '-card')} // Keys diferentes evitam conflitos de estado do player
          src={urlComCapa} 
          controls={emModal}       // Barra de play/pause APARECE APENAS dentro do modal
          autoPlay={emModal}       // Roda automático APENAS se estiver aberto no modal
          muted={!emModal}         // Mudo na listagem para economizar memória do navegador
          loop={emModal}           // Só repete infinitamente se estiver aberto no modal
          preload="metadata"       // Busca apenas os dados iniciais do frame (não faz download do vídeo todo na lista)
          playsInline={true} 
          style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
        />
      );
    }

    if (tipoMidia === 'pdf') {
      const urlLimpaDoPdf = `${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;

      if (emModal) {
        return (
          <div 
            onClick={() => window.open(url, '_blank')} 
            style={{ width: '100%', height: '100%', minHeight: '450px', cursor: 'zoom-in', position: 'relative', background: '#fff' }}
            title="Clique no PDF para ler em tela cheia"
          >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }} />
            
            <iframe 
              src={urlLimpaDoPdf} 
              title={titulo} 
              style={{ width: '100%', height: '100%', minHeight: '450px', border: 'none', background: '#fff', display: 'block' }} 
            />
          </div>
        );
      }

      return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', pointerEvents: 'none' }}>
          <iframe 
            src={`${url}#page=1&toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
            title={titulo} 
            style={{ width: '100%', height: '120%', border: 'none', transform: 'scale(1.02)', transformOrigin: 'top left' }} 
          />
        </div>
      );
    }

    return (
      <img src={url} alt={titulo} loading="lazy" style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }} />
    );
  };

  return (
    <section className="galeria-obras">
      <h2 className="titulo-galeria"><FiGrid /> Portfólio</h2>
      
      {obras.length > 0 ? (
        <div className="grid-obras-publica">
          {obras.map((obra) => {
            const tipoMidia = identificarTipoMidia(obra.imagem_url);
            
            return (
              <div 
                key={obra.id_obra} 
                className="card-obra-viva"
                onClick={() => setObraSelecionada({ ...obra, tipoMidia })}
              >
                <div className="img-container">
                  {renderizarMidia(obra.imagem_url, obra.titulo, tipoMidia, false)}
                </div>
                <div className="info-obra">
                  <h4>{obra.titulo}</h4>
                  <p>{obra.descricao?.substring(0, 60)}...</p>
                </div>
              </div>
            );
          })}
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
              <div className="modal-image-container" style={{ background: '#fff', display: 'flex', alignItems: 'stretch' }}>
                {renderizarMidia(obraSelecionada.imagem_url, obraSelecionada.titulo, obraSelecionada.tipoMidia, true)}
              </div>
              
              <div className="modal-info" style={{ background: '#fff' }}>
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
