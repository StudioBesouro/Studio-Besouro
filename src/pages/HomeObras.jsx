import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 
import { supabase } from '../lib/supabaseClient';
import './HomeObras.css';
import '../components/modal.css';

const HomeObras = () => {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');
  const [obraSelecionada, setObraSelecionada] = useState(null);

  const categorias = ['Todas', 'Desenho', 'Pintura', 'Música', 'Literatura', 'Fotografia', 'Escultura'];

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

        const obrasFormatadas = data.map(obra => ({
          id: obra.id_obra,
          titulo: obra.titulo,
          imagem: obra.imagem_url,
          descricao: obra.descricao || 'Sem descrição disponível.',
          artista: obra.perfil_artista?.nome || 'Artista desconhecido',
          idArtista: obra.perfil_artista?.id_artista, 
          categoria: obra.categoria?.nome || 'Sem categoria'
        }));

        setObras(obrasFormatadas);
      } catch (err) {
        console.error('Erro:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchObras();
  }, []);

  const obrasFiltradas = categoriaAtiva === 'Todas'
    ? obras
    : obras.filter(obra => obra.categoria === categoriaAtiva);

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
        {obrasFiltradas.map(obra => (
          <div key={obra.id} className="obra-card">
            <div className="obra-imagem" onClick={() => setObraSelecionada(obra)}>
              <img src={obra.imagem} alt={obra.titulo} />
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
        ))}
      </div>

      {/* MODAL DE DETALHES DA OBRA - ADAPTADO EXATAMENTE PARA O MODAL.CSS */}
      {obraSelecionada && (
        <div className="modal-artwork-overlay" onClick={() => setObraSelecionada(null)}>
          <div className="modal-artwork-container" onClick={e => e.stopPropagation()}>
            
            {/* Lado Esquerdo - Container da Imagem */}
            <div className="modal-artwork-image-section">
              <img 
                src={obraSelecionada.imagem} 
                alt={obraSelecionada.titulo} 
                className="modal-artwork-image"
              />
              <button className="modal-artwork-close-btn" onClick={() => setObraSelecionada(null)}>✕</button>
            </div>
            
            {/* Lado Direito - Caixa de Informações */}
            <div className="modal-artwork-info-section">
              {/* Ajustado de h1 para h2 para herdar a classe .modal-artwork-title corretamente */}
              <h2 className="modal-artwork-title">{obraSelecionada.titulo}</h2>
              
              {/* Renderizado como <button> simulado por um Link para herdar a regra do artista do figma */}
              <Link 
                to={`/artista/${obraSelecionada.idArtista}`} 
                style={{ display: 'block', textDecoration: 'none' }}
              >
                <button type="button">por {obraSelecionada.artista}</button>
              </Link>

              {/* Ajustado para a classe .modal-meta que gera o badge de pílula suave do Figma */}
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