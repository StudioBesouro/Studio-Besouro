import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { FiPlus, FiUsers, FiImage, FiLayers, FiChevronRight, FiEdit } from 'react-icons/fi';

import HeaderContato from '../components/HeaderContato';
import Footer from '../components/Footer';
import ModalBanner from '../components/Admin/ModalBanner';
import ModalArtista from '../components/Admin/ModalArtista';
import { useAdminData } from '../hooks/useAdminData';

import './Admin.css';

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
    <span style={{
      width: 26,
      height: 15,
      borderRadius: 99,
      position: 'relative',
      display: 'inline-block',
      background: ativo ? '#16a34a' : '#cbd5e1',
      transition: 'background 0.2s',
      flexShrink: 0
    }}>
      <span style={{
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
      }} />
    </span>
    {ativo ? 'Ativo' : 'Inativo'}
  </button>
);

const Admin = () => {
  const { banners, artistas, stats, loading, setLoading, fetchData } = useAdminData();
  const navigate = useNavigate();

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isArtistaModalOpen, setIsArtistaModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);

  const [formData, setFormData] = useState({ titulo: '', descricao: '', nome: '', bio: '', duracao_dias: 0 });
  const [files, setFiles] = useState({ banner: null, fotoPerfil: null, bannerArtista: null });

  useEffect(() => {
    fetchData();
  }, []);

  // Upload local garantindo content-type correto
  const localUploadFile = async (file, bucket) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrl;
  };

  const openEditBannerModal = (banner) => {
    setEditingBannerId(banner.id_banner);
    setFormData(prev => ({
      ...prev,
      titulo: banner.titulo || '',
      descricao: banner.descricao || '',
      duracao_dias: banner.duracao_dias || 0
    }));
    setIsBannerModalOpen(true);
  };

  const closeBannerModal = () => {
    setIsBannerModalOpen(false);
    setEditingBannerId(null);
    setFormData(prev => ({ ...prev, titulo: '', descricao: '', duracao_dias: 0 }));
    setFiles(prev => ({ ...prev, banner: null }));
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let url = banners.find(b => b.id_banner === editingBannerId)?.imagem_url;
      if (files.banner) url = await localUploadFile(files.banner, 'banners');

      const payload = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        imagem_url: url,
        duracao_dias: Number(formData.duracao_dias) || 0,
        ativo: true // Força o estado ativo para aparecer imediatamente
      };

      if (editingBannerId) {
        const { error } = await supabase.from('banner').update(payload).eq('id_banner', editingBannerId);
        if (error) throw error;
      } else {
        if (!files.banner) throw new Error("Selecione uma imagem para o banner.");
        const { error } = await supabase.from('banner').insert([payload]).select();
        if (error) throw error;
      }

      closeBannerModal();
      await fetchData(); // Recarrega a lista do banco
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArtista = async (e) => {
    e.preventDefault();
    if (!files.fotoPerfil || !files.bannerArtista) return alert("Selecione as imagens do perfil e do banner.");
    setLoading(true);
    try {
      const fotoUrl = await localUploadFile(files.fotoPerfil, 'artistas');
      const bannerUrl = await localUploadFile(files.bannerArtista, 'artistas');

      const { error } = await supabase.from('perfil_artista').insert([{
        nome: formData.nome,
        bio: formData.bio,
        foto_perfil_url: fotoUrl,
        banner_url: bannerUrl,
        ativo: true
      }]).select();

      if (error) throw error;

      setFormData(prev => ({ ...prev, nome: '', bio: '' }));
      setFiles(prev => ({ ...prev, fotoPerfil: null, bannerArtista: null }));
      setIsArtistaModalOpen(false);
      await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleBanner = async (banner) => {
    const { error } = await supabase
      .from('banner')
      .update({ ativo: banner.ativo === false })
      .eq('id_banner', banner.id_banner);

    if (!error) fetchData();
    else alert('Erro ao alterar status. Verifique se a coluna "ativo" existe na tabela "banner".');
  };

  const toggleArtista = async (artista) => {
    const { error } = await supabase
      .from('perfil_artista')
      .update({ ativo: artista.ativo === false })
      .eq('id_artista', artista.id_artista);

    if (!error) fetchData();
    else alert('Erro ao alterar status. Verifique se a coluna "ativo" existe na tabela "perfil_artista".');
  };

  return (
    <div className="admin-page-wrapper">
      <HeaderContato />

      <main className="admin-dashboard">
        <div className="stats-grid">
          <div className="stat-card green clickable-stat" onClick={() => navigate('/pesquisa/banner')}>
            <div>
              <p>Banners Ativos</p>
              <strong>{stats.totalBanners ?? stats.banners ?? 0}</strong>
            </div>
            <FiImage size={32} />
          </div>

          <div className="stat-card yellow clickable-stat" onClick={() => navigate('/pesquisa/artista')}>
            <div>
              <p>Total de Artistas</p>
              <strong>{stats.totalArtistas ?? stats.artistas ?? 0}</strong>
            </div>
            <FiUsers size={32} />
          </div>

          <div className="stat-card purple">
            <div>
              <p>Total de Obras</p>
              <strong>{stats.totalObras ?? stats.obras ?? 0}</strong>
            </div>
            <FiLayers size={32} />
          </div>
        </div>

        <section className="admin-section">
          <div className="section-header">
            <div>
              <h2>Banners Informativos</h2>
              <p>Gerenciar banners exibidos na página inicial</p>
            </div>
            <button className="btn-new green" onClick={() => setIsBannerModalOpen(true)}>
              <FiPlus /> Novo Banner
            </button>
          </div>

          <div className="items-grid">
            {banners.slice(0, 4).map(b => (
              <div
                key={b.id_banner}
                className="item-card banner-card"
                style={{ opacity: b.ativo === false ? 0.55 : 1 }}
              >
                <img src={b.imagem_url} alt={b.titulo} />
                <div className="item-info">
                  <h3>{b.titulo}</h3>
                  {b.descricao && <p>{b.descricao.substring(0, 80)}...</p>}

                  <div className="card-actions-admin" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEditBannerModal(b)} className="btn-edit-inline">
                        <FiEdit /> Editar
                      </button>
                    </div>

                    <TogglePill ativo={b.ativo !== false} onChange={() => toggleBanner(b)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {banners.length > 4 && (
            <div className="view-more-container" style={{ marginTop: 16 }}>
              <button className="btn-view-more" onClick={() => navigate('/pesquisa/banner')}>
                Ver todos os banners ({banners.length}) <FiChevronRight />
              </button>
            </div>
          )}
        </section>

        <section className="admin-section">
          <div className="section-header">
            <div>
              <h2>Artistas</h2>
              <p>Gerenciar portfólios e perfis de artistas</p>
            </div>
            <button className="btn-new purple" onClick={() => setIsArtistaModalOpen(true)}>
              <FiPlus /> Novo Artista
            </button>
          </div>

          <div className="items-grid">
            {artistas.slice(0, 4).map(a => (
              <div
                key={a.id_artista}
                className="item-card artista-card"
                style={{ opacity: a.ativo === false ? 0.55 : 1 }}
              >
                {a.obras?.[0]?.count !== undefined && (
                  <div className="badge-count">
                    <i className="fa-solid fa-star"></i> {a.obras[0].count}
                  </div>
                )}
                <img src={a.foto_perfil_url} alt={a.nome} />
                <div className="item-info">
                  <h3>{a.nome}</h3>
                  {a.bio && <p>{a.bio.substring(0, 80)}...</p>}

                  <div className="card-actions-admin" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <Link to={`/paginaartista/${a.id_artista}`} className="btn-manage">
                        Obras <FiChevronRight />
                      </Link>
                    </div>

                    <TogglePill ativo={a.ativo !== false} onChange={() => toggleArtista(a)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <ModalBanner
        isOpen={isBannerModalOpen}
        onClose={closeBannerModal}
        onSave={handleSaveBanner}
        formData={formData}
        setFormData={setFormData}
        files={files}
        setFiles={setFiles}
        loading={loading}
        editingId={editingBannerId}
      />

      <ModalArtista
        isOpen={isArtistaModalOpen}
        onClose={() => setIsArtistaModalOpen(false)}
        onSave={handleCreateArtista}
        formData={formData}
        setFormData={setFormData}
        files={files}
        setFiles={setFiles}
        loading={loading}
      />

      <Footer />
    </div>
  );
};

export default Admin;