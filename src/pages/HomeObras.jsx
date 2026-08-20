import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './HomeObras.css';
import '../components/Modal.css';

// Auxiliar para identificar o tipo de mídia pela URL
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

// Auxiliar para embaraçar obras (randomizar a ordem)
const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Converte URLs simples ou arrays JSON de imagens para uma lista de URLs
const extrairImagens = (url) => {
  if (!url) return [];
  try {
    if (url.trim().startsWith('[')) {
      const parsed = JSON.parse(url);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    // Caso não seja um JSON válido, cai no retorno padrão
  }
  return [url];
};

const HomeObras = ({ buscaTermoExterno = "" }) => {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');
  
  // Estados para o Modal e Carrossel Interno
  const [obraSelecionada, setObraSelecionada] = useState(null);
  const [imagemIdx, setImagemIdx] = useState(0);
  const [listaCache, setListaCache] = useState([]);
  const [idxNaLista, setIdxNaLista] = useState(0);

  const location = useLocation();
  const categorias = ['Todas', 'Desenho', 'Pintura', 'Música', 'Literatura', 'Fotografia', 'Escultura'];

  useEffect(() => {
    const fetchObras = async () => {
      try {
        setLoading(true);

        // 1. Consulta principal (Sintaxe segura para Foreign Keys no Supabase)
        let { data, error } = await supabase
          .from('obras')
          .select(`
            id_obra,
            titulo,
            imagem_url,
            descricao,
            fixada,
            perfil_artista ( id_artista, nome ),
            categoria ( nome )
          `)
          .order('created_at', { ascending: false });

        // Fallback caso a coluna 'fixada' não exista na tabela 'obras'
        if (error) {
          console.warn("Aviso ao buscar obras (tentando fallback):", error.message);
          const resFallback = await supabase
            .from('obras')
            .select(`
              id_obra,
              titulo,
              imagem_url,
              descricao,
              perfil_artista ( id_artista, nome ),
              categoria ( nome )
            `)
            .order('created_at', { ascending: false });
          
          data = resFallback.data || [];
        }

        // 2. Busca de artistas inativos (com tratamento para evitar que o erro 400 trave a página)
        const artistasDesativados = new Set();
        try {
          const { data: inativos, error: errInativos } = await supabase
            .from('perfil_artista')
            .select('id_artista')
            .eq('ativo', false);

          if (!errInativos && inativos) {
            inativos.forEach(a => artistasDesativados.add(String(a.id_artista)));
          }
        } catch (err) {
          console.warn("Aviso: Não foi possível filtrar artistas desativados.", err);
        }

        // 3. Formatação dos dados recebidos
        const obrasFormatadas = (data || [])
          .filter(obra => {
            const idArt = obra.perfil_artista?.id_artista;
            return !idArt || !artistasDesativados.has(String(idArt));
          })
          .map(obra => {
            const listaImagens = extrairImagens(obra.imagem_url);
            const tipo = identificarTipoMidia(listaImagens[0] || obra.imagem_url);
            return {
              id: obra.id_obra,
              titulo: obra.titulo,
              imagem: obra.imagem_url,
              imagens: listaImagens,
              tipoMidia: tipo,
              descricao: obra.descricao || 'Sem descrição disponível.',
              artista: obra.perfil_artista?.nome || 'Artista desconhecido',
              idArtista: obra.perfil_artista?.id_artista,
              categoria: obra.categoria?.nome || 'Sem categoria',
              fixada: obra.fixada === true
            };
          });

        // Ordenação: Fixadas no topo e o restante em ordem aleatória (shuffle)
        const fixadas = obrasFormatadas.filter(o => o.fixada);
        const naoFixadas = shuffle(obrasFormatadas.filter(o => !o.fixada));
        const obrasOrdenadas = [...fixadas, ...naoFixadas];

        setObras(obrasOrdenadas);

        // Abertura automática caso venha um parâmetro na URL
        const queryParams = new URLSearchParams(location.search);
        const obraIdDaUrl = queryParams.get('obraId');
        if (obraIdDaUrl) {
          const idx = obrasOrdenadas.findIndex(o => String(o.id) === String(obraIdDaUrl));
          if (idx !== -1) {
            abrirObra(obrasOrdenadas[idx], obrasOrdenadas, idx);
          }
        }

      } catch (err) {
        console.error('Erro ao carregar obras:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchObras();
  }, [location.search]);

  // Controles do Modal e Navegação entre Obras
  const abrirObra = (obra, lista, idx) => {
    setObraSelecionada(obra);
    setImagemIdx(0);
    setListaCache(lista);
    setIdxNaLista(idx);
  };

  const navegarObra = (direcao) => {
    const novoIdx = idxNaLista + direcao;
    if (novoIdx < 0 || novoIdx >= listaCache.length) return;
    setObraSelecionada(listaCache[novoIdx]);
    setImagemIdx(0);
    setIdxNaLista(novoIdx);
  };

  // Filtro por categoria e busca
  const obrasFiltradas = obras.filter(obra => {
    const correspondeCategoria = categoriaAtiva === 'Todas' || obra.categoria === categoriaAtiva;
    const textoBusca = buscaTermoExterno.toLowerCase();
    const correspondeBusca =
      obra.titulo.toLowerCase().includes(textoBusca) ||
      obra.artista.toLowerCase().includes(textoBusca);

    return correspondeCategoria && correspondeBusca;
  });

  // Renderização de mídia nos cards
  const renderCardMedia = (obra) => {
    const src = obra.imagens[0] || obra.imagem;
    const tipo = identificarTipoMidia(src);

    if (tipo === 'video') {
      const urlComCapa = src.includes('?') ? src.replace('?', '#t=0.1?') : `${src}#t=0.1`;
      return (
        <video
          src={urlComCapa}
          muted
          playsInline
          preload="metadata"
          className="card-media-element"
          style={{ objectFit: 'cover', width: '100%', height: '100%', pointerEvents: 'none' }}
        />
      );
    }

    if (tipo === 'pdf') {
      return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
          <iframe
            src={`${src}#page=1&toolbar=0&navpanes=0`}
            title={obra.titulo}
            style={{ width: '100%', height: '120%', border: 'none' }}
          />
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={obra.titulo}
        draggable={false}
        style={{ objectFit: 'cover', width: '100%', height: '100%', userSelect: 'none', pointerEvents: 'none' }}
      />
    );
  };

  // Renderização de mídia no Modal
  const renderModalMedia = (obra) => {
    const src = obra.imagens[imagemIdx] || obra.imagens[0] || obra.imagem;
    const tipo = identificarTipoMidia(src);

    if (tipo === 'video') {
      return (
        <video
          key={src}
          src={src}
          controls
          autoPlay
          muted
          loop
          playsInline
          className="modal-artwork-media-element"
          style={{ objectFit: 'contain', width: '100%', height: '100%' }}
          onContextMenu={e => e.preventDefault()}
        />
      );
    }

    if (tipo === 'pdf') {
      const urlLimpa = `${src}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
      return (
        <div
          onClick={() => window.open(src, '_blank')}
          style={{ width: '100%', height: '100%', minHeight: '450px', cursor: 'zoom-in', position: 'relative' }}
          title="Clique para ler o PDF em nova aba"
        >
          <div style={{ position: 'absolute', inset: 0, zIndex: 10 }} onContextMenu={e => e.preventDefault()} />
          <iframe
            src={urlLimpa}
            className="modal-artwork-media-element pdf-viewer"
            title={obra.titulo}
            style={{ width: '100%', height: '100%', minHeight: '450px', border: 'none', background: '#fff' }}
          />
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={obra.titulo}
        className="modal-artwork-image"
        draggable={false}
        onContextMenu={e => e.preventDefault()}
        style={{ userSelect: 'none', objectFit: 'contain', width: '100%', height: '100%' }}
      />
    );
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <section className="home-obras-section">
      <h2 className="section-title">Obras em Destaque</h2>

      {/* Bar das Categorias */}
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

      {/* Grid de Obras */}
      <div className="obras-grid">
        {obrasFiltradas.length > 0 ? (
          obrasFiltradas.map((obra, idx) => (
            <div key={obra.id} className="obra-card">
              {/* Badge de Obra Fixada */}
              {obra.fixada && (
                <div style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  zIndex: 5,
                  background: 'rgba(139, 92, 246, 0.9)',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: 99
                }}>
                  📌 Fixada
                </div>
              )}

              {/* Conteúdo Visual / Capa */}
              <div
                className={`obra-imagem ${obra.tipoMidia}-container`}
                onClick={() => abrirObra(obra, obrasFiltradas, idx)}
                style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
              >
                {renderCardMedia(obra)}
                
                {/* Indicador se a obra possuir múltiplos arquivos */}
                {obra.imagens.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'rgba(0, 0, 0, 0.55)',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 99
                  }}>
                    1/{obra.imagens.length}
                  </div>
                )}
              </div>

              {/* Informações da Obra */}
              <div className="obra-info">
                <h3 className="obra-titulo" style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                  {obra.titulo}
                </h3>
                <p className="obra-artista" style={{ fontSize: '0.9rem' }}>
                  por{' '}
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
        <div
          className="modal-artwork-overlay"
          onClick={() => setObraSelecionada(null)}
          onContextMenu={e => e.preventDefault()}
        >
          {/* Navegação entre Obras (Anterior) */}
          {idxNaLista > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navegarObra(-1); }}
              style={{
                position: 'fixed',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10001,
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(6px)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 48,
                height: 48,
                cursor: 'pointer',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Obra anterior"
            >
              ‹
            </button>
          )}

          {/* Navegação entre Obras (Próxima) */}
          {idxNaLista < listaCache.length - 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navegarObra(1); }}
              style={{
                position: 'fixed',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10001,
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(6px)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 48,
                height: 48,
                cursor: 'pointer',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Próxima obra"
            >
              ›
            </button>
          )}

          {/* Container do Modal */}
          <div className="modal-artwork-container" onClick={e => e.stopPropagation()} style={{ position: 'relative', userSelect: 'none' }}>
            <button
              type="button"
              className="modal-artwork-close-btn"
              onClick={() => setObraSelecionada(null)}
              style={{ position: 'absolute', top: 16, right: 16, zIndex: 200 }}
            >
              ✕
            </button>

            {/* Mídia */}
            <div className="modal-artwork-image-section" style={{ background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {renderModalMedia(obraSelecionada)}

              {/* Controles do carrossel interno */}
              {obraSelecionada.imagens.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setImagemIdx(i => (i - 1 + obraSelecionada.imagens.length) % obraSelecionada.imagens.length)}
                    style={{
                      position: 'absolute',
                      left: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: 36,
                      height: 36,
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      zIndex: 50,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setImagemIdx(i => (i + 1) % obraSelecionada.imagens.length)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: 36,
                      height: 36,
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      zIndex: 50,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ›
                  </button>
                  <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 50 }}>
                    {obraSelecionada.imagens.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImagemIdx(i)}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: i === imagemIdx ? 'white' : 'rgba(255,255,255,0.4)',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Informações da Obra */}
            <div className="modal-artwork-info-section" style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 className="modal-artwork-title">{obraSelecionada.titulo}</h2>

              <Link to={`/artista/${obraSelecionada.idArtista}`} style={{ display: 'block', textDecoration: 'none' }}>
                <button type="button" className="btn-artista-modal">por {obraSelecionada.artista}</button>
              </Link>

              <div className="modal-meta">{obraSelecionada.categoria}</div>

              <div className="modal-artwork-description">
                <p>{obraSelecionada.descricao}</p>
              </div>

              {listaCache.length > 1 && (
                <div style={{ marginTop: 'auto', paddingTop: 12, fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center' }}>
                  {idxNaLista + 1} de {listaCache.length} obras
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HomeObras;