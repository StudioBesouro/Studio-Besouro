import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  FiArrowLeft, 
  FiCalendar, 
  FiImage, 
  FiUsers, 
  FiChevronRight, 
  FiSearch, 
  FiEdit,
  FiX
} from 'react-icons/fi';

import Footer from '../components/Footer';

import './Pesquisa.css';
import '../components/Admin/Modal1.css';

// Componente para alternar rapidamente entre Ativo / Inativo
const TogglePill = ({ ativo, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    title={ativo ? 'Desativar' : 'Ativar'}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px 4px 6px',
      borderRadius: 99,
      border: 'none',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: '0.72rem',
      background: ativo ? '#f0fdf4' : '#fff1f2',
      color: ativo ? '#16a34a' : '#e11d48',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap'
    }}
  >
    <span
      style={{
        width: 26,
        height: 15,
        borderRadius: 99,
        position: 'relative',
        display: 'inline-block',
        background: ativo ? '#16a34a' : '#cbd5e1',
        transition: 'background 0.2s',
        flexShrink: 0
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: ativo ? 13 : 2,
          width: 11,
          height: 11,
          borderRadius: '50%',
          background: 'white',
          transition: 'left 0.2s',
          display: 'block',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }}
      />
    </span>
    {ativo ? 'Ativo' : 'Inativo'}
  </button>
);

const filtros = {
  todos: null,
  '1semana': 7 * 86400000,
  '2semanas': 14 * 86400000,
  '1mes': 30 * 86400000,
  '1ano': 365 * 86400000
};

const filtroLabel = {
  todos: 'Todos',
  '1semana': '1 semana',
  '2semanas': '2 semanas',
  '1mes': '1 mês',
  '1ano': '1 ano'
};

export default function Pesquisa() {
  const { tipo } = useParams();
  const navigate = useNavigate();

  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroData, setFiltroData] = useState('todos');

  // Estado para Edição rápida de Banners
  const [editandoBanner, setEditandoBanner] = useState(null);
  const [formEdicao, setFormEdicao] = useState({ titulo: '', descricao: '', duracao_dias: 0 });

  const fetchDados = async () => {
    setLoading(true);
    try {
      const q =
        tipo === 'banner'
          ? supabase.from('banner').select('*').order('created_at', { ascending: false })
          : supabase.from('perfil_artista').select('*').order('nome', { ascending: true });

      const { data, error } = await q;
      if (error) throw error;
      setDados(data || []);
    } catch (err) {
      console.error('Erro ao buscar dados:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
  }, [tipo]);

  // Alterna o status ativo/inativo no Supabase
  const toggleAtivo = async (item) => {
    const table = tipo === 'banner' ? 'banner' : 'perfil_artista';
    const idField = tipo === 'banner' ? 'id_banner' : 'id_artista';

    const { error } = await supabase
      .from(table)
      .update({ ativo: item.ativo === false })
      .eq(idField, item[idField]);

    if (!error) {
      setDados(
        dados.map((d) => (d[idField] === item[idField] ? { ...d, ativo: item.ativo === false } : d))
      );
    } else if (error.message?.includes('does not exist')) {
      alert(`Execute no banco: ALTER TABLE ${table} ADD COLUMN ativo boolean DEFAULT true;`);
    } else {
      alert(`Erro ao alterar status: ${error.message}`);
    }
  };

  // Salvar alterações de Banner no Modal
  const salvarEdicao = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('banner')
        .update({
          titulo: formEdicao.titulo,
          descricao: formEdicao.descricao,
          duracao_dias: formEdicao.duracao_dias
        })
        .eq('id_banner', editandoBanner.id_banner);

      if (error) throw error;

      setDados(
        dados.map((d) =>
          d.id_banner === editandoBanner.id_banner ? { ...d, ...formEdicao } : d
        )
      );
      setEditandoBanner(null);
    } catch (err) {
      alert('Erro ao salvar alterações: ' + err.message);
    }
  };

  // Lógica de Filtros e Busca
  const agora = Date.now();
  const dadosFiltrados = dados.filter((item) => {
    const busca = termoBusca.toLowerCase();
    const textoOk =
      tipo === 'banner'
        ? item.titulo?.toLowerCase().includes(busca) ||
          new Date(item.created_at).toLocaleDateString('pt-BR').includes(busca)
        : item.nome?.toLowerCase().includes(busca);

    if (!textoOk) return false;

    if (tipo === 'banner' && filtroData !== 'todos') {
      const ms = filtros[filtroData];
      if (ms) return new Date(item.created_at).getTime() >= agora - ms;
    }

    return true;
  });

  // Utilitário para tempo relativo (ex: 3d atrás)
  const relativo = (d) => {
    const dias = Math.floor((agora - new Date(d).getTime()) / 86400000);
    if (dias === 0) return 'Hoje';
    if (dias === 1) return 'Ontem';
    if (dias < 7) return `${dias}d atrás`;
    if (dias < 30) return `${Math.floor(dias / 7)}sem atrás`;
    if (dias < 365) return `${Math.floor(dias / 30)}m atrás`;
    return `${Math.floor(dias / 365)}a atrás`;
  };

  return (
    <div className="pesquisa-page">
      {/* MODAL DE EDIÇÃO DE BANNER - PADRONIZADO COM ESTILO VERDE (MODAL1.CSS) */}
      {editandoBanner && (
        <div className="escopo-modal-cadastro modal-overlay" onClick={() => setEditandoBanner(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Editar Banner</h3>
              <button type="button" className="btn-close" onClick={() => setEditandoBanner(null)}>
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={salvarEdicao}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Título *</label>
                  <input
                    type="text"
                    value={formEdicao.titulo}
                    onChange={(e) => setFormEdicao((p) => ({ ...p, titulo: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Descrição *</label>
                  <textarea
                    value={formEdicao.descricao}
                    onChange={(e) => setFormEdicao((p) => ({ ...p, descricao: e.target.value }))}
                    rows={3}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Duração de Exibição</label>
                  <select
                    value={formEdicao.duracao_dias}
                    onChange={(e) => setFormEdicao((p) => ({ ...p, duracao_dias: Number(e.target.value) }))}
                  >
                    <option value={0}>Sem limite</option>
                    <option value={7}>1 semana</option>
                    <option value={14}>2 semanas</option>
                    <option value={30}>1 mês</option>
                    <option value={365}>1 ano</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setEditandoBanner(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-submit-green">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="pesquisa-container">
        <div className="pesquisa-header">
          <div className="header-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button className="btn-voltar" onClick={() => navigate('/admin')} style={{ margin: 0 }}>
                <FiArrowLeft /> Voltar ao Painel
              </button>

              <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                {tipo === 'banner' ? (
                  <><FiImage /> Todos os Banners</>
                ) : (
                  <><FiUsers /> Todos os Artistas</>
                )}
              </h1>
            </div>

            <div className="search-bar-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder={tipo === 'banner' ? 'Procurar por nome ou data...' : 'Procurar artista...'}
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {tipo === 'banner' && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              {Object.keys(filtros).map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltroData(f)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 99,
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    background: filtroData === f ? '#10b981' : '#f1f5f9',
                    color: filtroData === f ? 'white' : '#475569'
                  }}
                >
                  {filtroLabel[f]}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-container">Carregando...</div>
        ) : (
          <div className="listagem-vertical">
            {dadosFiltrados.length > 0 ? (
              dadosFiltrados.map((item) => (
                <div
                  key={tipo === 'banner' ? item.id_banner : item.id_artista}
                  className="card-listagem-full"
                  style={{ opacity: item.ativo === false ? 0.55 : 1 }}
                >
                  <img
                    src={tipo === 'banner' ? item.imagem_url : item.foto_perfil_url}
                    alt="Preview"
                    className={tipo === 'artista' ? 'foto-perfil-list' : ''}
                  />

                  <div className="card-body">
                    {tipo === 'banner' && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        <span className="data-tag">
                          <FiCalendar /> {new Date(item.created_at).toLocaleDateString('pt-BR')} · {relativo(item.created_at)}
                        </span>
                        {item.duracao_dias > 0 && (
                          <span className="data-tag" style={{ background: '#fef3c7', color: '#d97706' }}>
                            ⏱ {item.duracao_dias}d
                          </span>
                        )}
                      </div>
                    )}

                    {item.ativo === false && (
                      <span className="data-tag" style={{ background: '#fee2e2', color: '#e11d48', marginBottom: 8 }}>
                        Desativado
                      </span>
                    )}

                    <h2>{tipo === 'banner' ? item.titulo : item.nome}</h2>
                    <p>{tipo === 'banner' ? item.descricao : item.bio}</p>

                    <div className="card-footer-actions">
                      <div className="actions-group" style={{ alignItems: 'center', gap: 10 }}>
                        {tipo === 'banner' && (
                          <button
                            className="btn-edit-pesquisa"
                            onClick={() => {
                              setEditandoBanner(item);
                              setFormEdicao({
                                titulo: item.titulo || '',
                                descricao: item.descricao || '',
                                duracao_dias: item.duracao_dias || 0
                              });
                            }}
                          >
                            <FiEdit /> Editar
                          </button>
                        )}

                        <TogglePill
                          ativo={item.ativo !== false}
                          onChange={() => toggleAtivo(item)}
                        />
                      </div>

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
                {termoBusca || filtroData !== 'todos'
                  ? 'Nenhum resultado para o filtro.'
                  : 'Nenhum registro encontrado.'}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}