import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import { supabase } from '../lib/supabaseClient';
import './HomeObras.css';
import '../components/Modal.css';

// Recebe diretamente o termo digitado na barra de pesquisa global do Header
const HomeObras = ({ buscaTermoExterno = "" }) => {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');
  const [obraSelecionada, setObraSelecionada] = useState(null);

  const location = useLocation();
  const categorias = ['Todas', 'Desenho', 'Pintura', 'Música', 'Literatura', 'Fotografia', 'Escultura'];

  const identificarTipoMidia = (url) => {
    if (!url) return 'imagem';
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('.pdf') || urlLower.split('?')[0].endsWith('.pdf')) return 'pdf';
    if (
      urlLower.includes('.mp4') || 
      urlLower.includes('.mov') || 
      urlLower.includes('.webm') || 
      urlLower.includes('.ogg') ||
      urlLower.split('?')[0].match(/\.(mp4|mov|webm|ogg)$/)
    ) return 'video';
    
    return 'imagem';
  };

  useEffect(() => {
    const fetchObras = async () => {
      try {
        const { data, error } = await supabase
          .from('obras')
          .select(`
            id_obra,
            titulo,
            imagem_url,
            descricao,
            perfil_artista!inner(id_artista, nome),
            categoria!inner(nome)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const obrasFormatadas = data.map(obra => {
          const tipo = identificarTipoMidia(obra.imagem_url);
          return {
            id: obra.id_obra,
            titulo: obra.titulo,
            imagem: obra.imagem_url,
            tipoMidia: tipo,
            descricao: obra.descricao || 'Sem descrição disponível.',
            artista: obra.perfil_artista?.nome || 'Artista desconhecido',
            idArtista: obra.perfil_artista?.id_artista, 
            categoria: obra.categoria?.nome || 'Sem categoria'
          };
        });

        setObras(obrasFormatadas);

        // Verifica se veio um ID de obra pela URL (visto na busca do Header) e abre o modal dela
        const queryParams = new URLSearchParams(location.search);
        const obraIdDaUrl = queryParams.get('obraId');
        if (obraIdDaUrl) {
          const obraParaAbrir = obrasFormatadas.find(o => String(o.id) === String(obraIdDaUrl));
          if (obraParaAbrir) setObraSelecionada(obraParaAbrir);
        }

      } catch (err) {
        console.error('Erro ao buscar obras:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchObras();
  }, [location.search]);

  // Filtro Inteligente
  const obrasFiltradas = obras.filter(obra => {
    const correspondeCategoria = categoriaAtiva === 'Todas' || obra.categoria === categoriaAtiva;
    
    const textoBusca = buscaTermoExterno.toLowerCase();
    const correspondeBusca = 
      obra.titulo.toLowerCase().includes(textoBusca) || 
      obra.artista.toLowerCase().includes(textoBusca);

    return correspondeCategoria && correspondeBusca;
  });

  // MODIFICADO: Agora o vídeo fica PARADO na listagem e roda apenas no modal
  const renderizarMidia = (obra, emModal = false) => {
    if (obra.tipoMidia === 'video') {
      // Injeta #t=0.1 na URL para capturar um frame inicial estático na listagem
      const urlComCapa = obra.imagem.includes('?') 
        ? obra.imagem.replace('?', '#t=0.1?') 
        : `${obra.imagem}#t=0.1`;

      return (
        <video 
          key={obra.imagem + (emModal ? '-modal' : '-card')}
          src={emModal ? obra.imagem : urlComCapa} 
          controls={emModal}         // Barra de play/pause aparece APENAS no modal
          autoPlay={emModal}         // Roda automático APENAS se estiver aberto no modal
          muted={!emModal}           // Mudo na listagem para economizar memória e banda
          loop={emModal}             // Só repete infinitamente dentro do modal
          preload={emModal ? "auto" : "metadata"} // Busca apenas os dados iniciais do frame na lista
          playsInline={true} 
          className={emModal ? "modal-artwork-media-element" : "card-media-element"}
          style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
        />
      );
    }

    if (obra.tipoMidia === 'pdf') {
      const urlLimpaDoPdf = `${obra.imagem}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;

      if (emModal) {
        return (
          <div 
            onClick={() => window.open(obra.imagem, '_blank')} 
            style={{ width: '100%', height: '100%', minHeight: '450px', cursor: 'zoom-in', position: 'relative' }}
            title="Clique no PDF para ler em tela cheia"
          >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }} />
            <iframe 
              src={urlLimpaDoPdf} 
              className="modal-artwork-media-element pdf-viewer" 
              title={obra.titulo} 
              style={{ width: '100%', height: '100%', minHeight: '450px', border: 'none', background: '#fff', display: 'block' }} 
            />
          </div>
        );
      }

      return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', pointerEvents: 'none' }}>
          <iframe 
            src={`${obra.imagem}#page=1&toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
            title={obra.titulo} 
            style={{ width: '100%', height: '120%', border: 'none', transform: 'scale(1.02)', transformOrigin: 'top left' }} 
          />
        </div>
      );
    }

    return (
      <img 
        src={obra.imagem} 
        alt={obra.titulo} 
        className={emModal ? "modal-artwork-image" : ""} 
        style={!emModal ? { objectFit: 'cover', width: '100%', height: '100%' } : {}}
      />
    );
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <section className="home-obras-section">
      <h2 className="section-title">Obras em Destaque</h2>

      <div className="categorias-filtro">
        {categorias.map(cat => (
          <button
            key={cat}
            className={`categoria-btn ${categoriaAtiva === cat ? 'ativa' : ''}`}
            onClick={() => setCategoriaAtiva(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="obras-grid">
        {obrasFiltradas.length > 0 ? (
          obrasFiltradas.map(obra => (
            <div key={obra.id} className="obra-card">
              <div className={`obra-imagem ${obra.tipoMidia}-container`} onClick={() => setObraSelecionada(obra)} style={{ position: 'relative', overflow: 'hidden' }}>
                {renderizarMidia(obra, false)}
              </div>
              
              <div className="obra-info">
                <h3 className="obra-titulo" style={{fontSize: '1.2rem', fontWeight: '700'}}>{obra.titulo}</h3>
                
                <p className="obra-artista" style={{fontSize: '0.9rem'}}>
                  por {' '}
                  <Link 
                    to={`/artista/${obra.idArtista}`} 
                    className="link-artista-home"
                    onClick={(e) => e.stopPropagation()} 
                  >
                    {obra.artista}
                  </Link>
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="aviso-vazio" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Nenhuma obra ou artista encontrado para a sua busca.
          </div>
        )}
      </div>

      {/* MODAL DE DETALHES DA OBRA */}
      {obraSelecionada && (
        <div className="modal-artwork-overlay" onClick={() => setObraSelecionada(null)}>
          <div className="modal-artwork-container" onClick={e => e.stopPropagation()}>
            <div className="modal-artwork-image-section" style={{ background: '#fff', display: 'flex', alignItems: 'stretch' }}>
              {renderizarMidia(obraSelecionada, true)}
              <button className="modal-artwork-close-btn" onClick={() => setObraSelecionada(null)}>✕</button>
            </div>
            
            <div className="modal-artwork-info-section">
              <h2 className="modal-artwork-title">{obraSelecionada.titulo}</h2>
              
              <Link 
                to={`/artista/${obraSelecionada.idArtista}`} 
                style={{ display: 'block', textDecoration: 'none' }}
              >
                <button type="button" className="btn-artista-modal">por {obraSelecionada.artista}</button>
              </Link>

              <div className="modal-meta">
                {obraSelecionada.categoria}
              </div>
              
              <div className="modal-artwork-description">
                <p>{obraSelecionada.descricao}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HomeObras;