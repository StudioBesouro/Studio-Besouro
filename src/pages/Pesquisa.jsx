import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { FiArrowLeft, FiCalendar, FiImage, FiUsers, FiChevronRight, FiSearch, FiEdit, FiTrash2 } from 'react-icons/fi';
import HeaderContato from '../components/HeaderContato';
import Footer from '../components/Footer';

import './Pesquisa.css';

const Pesquisa = () => {
  const { tipo } = useParams(); 
  const navigate = useNavigate();
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');

  const fetchDados = async () => {
    setLoading(true);
    try {
      let query;
      if (tipo === 'banner') {
        query = supabase.from('banner').select('*').order('created_at', { ascending: false });
      } else {
        query = supabase.from('perfil_artista').select('*').order('nome', { ascending: true });
      }
      const { data, error } = await query;
      if (error) throw error;
      setDados(data || []);
    } catch (error) {
      console.error('Erro:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
  }, [tipo]);

  const handleDelete = async (id) => {
    const table = tipo === 'banner' ? 'banner' : 'perfil_artista';
    const idField = tipo === 'banner' ? 'id_banner' : 'id_artista';
    
    const confirmMsg = tipo === 'artista' 
      ? "Excluir este artista removerá TODAS as obras vinculadas. Confirmar?"
      : "Tem certeza que deseja excluir permanentemente?";

    if (!window.confirm(confirmMsg)) return;

    try {
      if (tipo === 'artista') {
        await supabase.from('obras').delete().eq('id_artista', id);
      }
      const { error } = await supabase.from(table).delete().eq(idField, id);
      if (error) throw error;
      
      setDados(dados.filter(item => item[idField] !== id));
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  const dadosFiltrados = dados.filter((item) => {
    const busca = termoBusca.toLowerCase();
    return tipo === 'banner' 
      ? item.titulo?.toLowerCase().includes(busca)
      : item.nome?.toLowerCase().includes(busca);
  });

  return (
    <div className="pesquisa-page">
      <HeaderContato />
      <main className="pesquisa-container">
        
        <div className="pesquisa-header">
          <div className="header-top">
            <button className="btn-voltar" onClick={() => navigate('/admin')}>
              <FiArrowLeft /> Voltar ao Painel
            </button>
          </div>
          
          <div className="header-main">
            <h1>
              {tipo === 'banner' ? <><FiImage /> Todos os Banners</> : <><FiUsers /> Todos os Artistas</>}
            </h1>

            <div className="search-bar-wrapper">
              <FiSearch className="search-icon" />
              <input 
                type="text" 
                placeholder={tipo === 'banner' ? "Procurar banner..." : "Procurar artista..."}
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">Carregando...</div>
        ) : (
          <div className="listagem-vertical">
            {dadosFiltrados.length > 0 ? (
              dadosFiltrados.map((item) => (
                <div key={tipo === 'banner' ? item.id_banner : item.id_artista} className="card-listagem-full">
                  <img 
                    src={tipo === 'banner' ? item.imagem_url : item.foto_perfil_url} 
                    alt="Preview" 
                    className={tipo === 'artista' ? 'foto-perfil-list' : ''}
                  />
                  
                  <div className="card-body">
                    {tipo === 'banner' && <span className="data-tag"><FiCalendar /> {new Date(item.created_at).toLocaleDateString()}</span>}
                    <h2>{tipo === 'banner' ? item.titulo : item.nome}</h2>
                    
                    <p>{tipo === 'banner' ? item.descricao : item.bio}</p>
                    
                    <div className="card-footer-actions">
                      <div className="actions-group">
                        
                        {/* Se for BANNER, mantém o botão editar padrão */}
                        {tipo === 'banner' && (
                          <button className="btn-edit-pesquisa" title="Editar Banner">
                            <FiEdit /> Editar
                          </button>
                        )}
                        
                        <button 
                          className="btn-delete-pesquisa" 
                          onClick={() => handleDelete(tipo === 'banner' ? item.id_banner : item.id_artista)}
                          title="Excluir"
                        >
                          <FiTrash2 /> {tipo === 'artista' ? 'Excluir Artista' : ''}
                        </button>
                      </div>

                      {/* Se for ARTISTA, apenas o botão GERENCIAR que leva para PaginaArtista.jsx */}
                      {tipo === 'artista' && (
                        <Link to={`/paginaartista/${item.id_artista}`} className="btn-acessar-perfil">
                          Gerenciar <FiChevronRight />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                {termoBusca ? `Nenhum resultado para "${termoBusca}"` : "Nenhum registro encontrado."}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Pesquisa;