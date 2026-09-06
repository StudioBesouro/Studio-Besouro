import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "../lib/supabaseClient"; 
import { FiPlus, FiArrowLeft, FiCamera, FiEdit2, FiCheck, FiX, FiImage, FiTrash2 } from 'react-icons/fi'; 

import { useArtista } from '../hooks/useArtista';
import ModalNovaObra from '../components/Admin/ModalNovaObra';

import './PaginaArtista.css';
import '../components/Modal.css';

// Função utilitária para converter JSON string ou URL simples em Array de URLs
const getImagens = (url) => {
  if (!url) return [];
  try {
    if (url.trim().startsWith('[')) {
      const parsed = JSON.parse(url);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [url];
};

const PaginaArtista = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const { artista, setArtista, loading, buscarDados } = useArtista(id);

  const [editBio, setEditBio] = useState(false);
  const [tempBio, setTempBio] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showModalNova, setShowModalNova] = useState(false);
  const [novaObra, setNovaObra] = useState({ titulo: "", descricao: "", categoria: "Desenho", arquivos: [] });
  
  const [obraSelecionada, setObraSelecionada] = useState(null);
  const [showModalDetalhe, setShowModalDetalhe] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [formEdicao, setFormEdicao] = useState({ titulo: "", descricao: "", categoria: "" });
  
  // Estado para controlar a imagem/mídia atual do carrossel no Modal
  const [carouselIdx, setCarouselIdx] = useState(0);

  const categoriasLista = ['Desenho', 'Pintura', 'Música', 'Literatura', 'Fotografia', 'Escultura'];
  const mapaCategorias = { 'Desenho': 1, 'Pintura': 2, 'Música': 3, 'Literatura': 4, 'Fotografia': 5, 'Escultura': 6 };
  const mapaCategoriasInverso = Object.fromEntries(Object.entries(mapaCategorias).map(([k, v]) => [v, k]));

  const identificarTipoMidia = (url) => {
    if (!url) return 'imagem';
    const urlLower = url.split('?')[0].toLowerCase();
    if (urlLower.endsWith('.pdf')) return 'pdf';
    if (['mp4','mov','webm','ogg','m4v'].some(e => urlLower.endsWith(`.${e}`))) return 'video';
    return 'imagem';
  };

  const renderizarMidia = (url, titulo, emModal = false) => {
    const tipo = identificarTipoMidia(url);

    if (tipo === 'video') {
      return (
        <video 
          src={emModal ? url : `${url}#t=0.1`} 
          controls={emModal}
          autoPlay={emModal}
          muted={true}
          loop={emModal}
          playsInline={true}
          preload="metadata"
          style={{ objectFit: emModal ? 'contain' : 'cover', width: '100%', height: '100%', display: 'block' }}
        />
      );
    }

    if (tipo === 'pdf') {
      const urlLimpaDoPdf = `${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;

      if (emModal) {
        return (
          <div 
            onClick={() => window.open(url, '_blank')} 
            style={{ width: '100%', height: '100%', minHeight: '450px', cursor: 'zoom-in', position: 'relative' }}
            title="Clique para abrir em tela cheia"
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

    return <img src={url} alt={titulo} style={{ objectFit: emModal ? 'contain' : 'cover', width: '100%', height: '100%' }} draggable={false} />;
  };

  const handleSelectFile = async (e, tipo) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${tipo}_${id}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('artistas')
        .upload(fileName, file, { 
          contentType: file.type,
          upsert: true 
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('artistas')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('perfil_artista')
        .update({ [tipo]: publicUrl })
        .eq('id_artista', id);

      if (updateError) throw updateError;

      setArtista(prev => ({ ...prev, [tipo]: `${publicUrl}?t=${Date.now()}` }));
      alert("Imagem atualizada com sucesso!");
    } catch (error) {
      alert("Erro ao enviar imagem: " + error.message);
    } finally {
      setUploading(false);
      e.target.value = ""; 
    }
  };

  const abrirDetalhes = (obra) => {
    setObraSelecionada(obra);
    setCarouselIdx(0); // Reinicia o índice do carrossel ao abrir
    setFormEdicao({
      titulo: obra.titulo,
      descricao: obra.descricao || "",
      categoria: mapaCategoriasInverso[obra.id_categoria] || "Desenho"
    });
    setModoEdicao(false);
    setShowModalDetalhe(true);
  };

  const handleSaveBio = async () => {
    try {
      const { error } = await supabase.from('perfil_artista').update({ bio: tempBio }).eq('id_artista', id);
      if (error) throw error;
      setArtista({...artista, bio: tempBio});
      setEditBio(false);
      alert("Bio atualizada!");
    } catch (e) { alert(e.message); }
  };

  const uploadSingleFile = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `obra_${id}_${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { error } = await supabase.storage.from('obras').upload(fileName, file, { contentType: file.type, upsert: true });
    if (error) throw error;
    return supabase.storage.from('obras').getPublicUrl(fileName).data.publicUrl;
  };

  const handleSalvarNovaObra = async (e) => {
    e.preventDefault();
    const arquivosParaEnviar = novaObra.arquivos || (novaObra.arquivo ? [novaObra.arquivo] : []);
    
    if (arquivosParaEnviar.length === 0) {
      alert("Selecione pelo menos um arquivo.");
      return;
    }

    setUploading(true);
    try {
      let imagemUrl;
      if (arquivosParaEnviar.length === 1) {
        imagemUrl = await uploadSingleFile(arquivosParaEnviar[0]);
      } else {
        const urls = await Promise.all(arquivosParaEnviar.map(f => uploadSingleFile(f)));
        imagemUrl = JSON.stringify(urls); // Salva como string de Array JSON no Supabase
      }
      
      const { error: insertError } = await supabase.from('obras').insert([{ 
        id_artista: id, 
        id_categoria: mapaCategorias[novaObra.categoria] || 1, 
        titulo: novaObra.titulo, 
        descricao: novaObra.descricao, 
        imagem_url: imagemUrl 
      }]);

      if (insertError) throw insertError;
      
      buscarDados();
      setShowModalNova(false);
      setNovaObra({ titulo: "", descricao: "", categoria: "Desenho", arquivos: [] });
      alert("Obra publicada com sucesso!");
    } catch (e) { 
      alert("Erro ao salvar obra: " + e.message); 
    } finally { 
      setUploading(false); 
    }
  };

  const deletarObra = async () => {
    if (!obraSelecionada || !window.confirm("Excluir esta obra?")) return;
    try {
      const { error } = await supabase.from('obras').delete().eq('id_obra', obraSelecionada.id_obra);
      if (error) throw error;
      buscarDados();
      setShowModalDetalhe(false);
      alert("Obra excluída!");
    } catch (err) { alert(err.message); }
  };

  const salvarEdicaoObra = async () => {
    try {
      const { error } = await supabase
        .from('obras')
        .update({
          titulo: formEdicao.titulo,
          descricao: formEdicao.descricao,
          id_categoria: mapaCategorias[formEdicao.categoria]
        })
        .eq('id_obra', obraSelecionada.id_obra);

      if (error) throw error;
      buscarDados();
      setModoEdicao(false);
      setShowModalDetalhe(false);
      alert("Obra atualizada!");
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="loading-state">Carregando perfil...</div>;

  return (
    <div className="perfil-container page-no-header">

      <div className="topo-navegacao">
        <button className="btn-voltar-simples" onClick={() => navigate(-1)}><FiArrowLeft /> Voltar</button>
      </div>
      
      <div className="perfil-header-visual">
        <div className="banner-fundo-novo editavel" style={{ backgroundImage: `url(${artista?.banner_url})` }}>
          <label className="overlay-alterar-banner">
            <FiImage size={24} /> <span>{uploading ? "Salvando..." : "Alterar Capa"}</span>
            <input type="file" className="input-file-hidden" accept="image/*" onChange={(e) => handleSelectFile(e, 'banner_url')} disabled={uploading} />
          </label>
          <div className="foto-perfil-central">
            <img src={artista?.foto_perfil_url} alt="Perfil" />
            <label className="icon-camera-overlay clickable">
              <FiCamera />
              <input type="file" className="input-file-hidden" accept="image/*" onChange={(e) => handleSelectFile(e, 'foto_perfil_url')} disabled={uploading} />
            </label>
          </div>
        </div>
      </div>

      <div className="artista-intro">
        <h1 className="titulo-artista-limpo">{artista?.nome}</h1>
      </div>

      <div className="info-artista-form">
        <div className="campo-exibicao">
          <div className="label-with-action">
            <label>Sua Bio / Descrição</label>
            {!editBio ? (
              <button className="btn-edit-small" onClick={() => { setEditBio(true); setTempBio(artista.bio || ""); }}><FiEdit2 /> Editar</button>
            ) : (
              <div className="edit-actions">
                <button className="btn-save-small" onClick={handleSaveBio}><FiCheck /> Salvar</button>
                <button className="btn-cancel-small" onClick={() => setEditBio(false)}><FiX /></button>
              </div>
            )}
          </div>
          <textarea className="textarea-edit" value={tempBio} onChange={(e) => setTempBio(e.target.value)} disabled={!editBio} />
        </div>
      </div>

      <section className="secao-obras-v2">
        <div className="header-obras-v2">
          <h2>Suas Obras</h2>
          <button className="btn-adicionar-verde" onClick={() => setShowModalNova(true)}><FiPlus /> Adicionar Nova Obra</button>
        </div>
        <div className="grid-obras-clean">
          {artista?.obras?.map(obra => {
            const imgs = getImagens(obra.imagem_url);
            return (
              <div key={obra.id_obra} className="card-obra-minimal clickable" onClick={() => abrirDetalhes(obra)} style={{ position: 'relative' }}>
                {imgs.length > 1 && (
                  <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 5, background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
                    {imgs.length} arquivos
                  </div>
                )}
                <div className="img-container">
                  {renderizarMidia(imgs[0], obra.titulo, false)}
                </div>
                <div className="info-obra-bottom"><h3>{obra.titulo}</h3></div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MODAL DE CADASTRO */}
      <ModalNovaObra 
        isOpen={showModalNova} 
        onClose={() => setShowModalNova(false)} 
        onSave={handleSalvarNovaObra}
        novaObra={novaObra} 
        setNovaObra={setNovaObra} 
        loading={uploading} 
        categoriasLista={categoriasLista}
      />
      
      {/* MODAL DETALHE COM CARROSSEL MULTIMÍDIA */}
      {showModalDetalhe && obraSelecionada && (() => {
        const imgs = getImagens(obraSelecionada.imagem_url);
        const urlMidiaAtual = imgs[carouselIdx] || imgs[0];

        return (
          <div className="modal-overlay" onClick={() => { setShowModalDetalhe(false); setModoEdicao(false); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              
              <button className="modal-close" onClick={() => { setShowModalDetalhe(false); setModoEdicao(false); }}>
                <FiX />
              </button>

              <div className="modal-body">
                {/* Coluna da Mídia / Carrossel */}
                <div className="modal-image-container" style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                  {renderizarMidia(urlMidiaAtual, obraSelecionada.titulo, true)}

                  {/* Setas e Controles do Carrossel */}
                  {imgs.length > 1 && (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setCarouselIdx((prev) => (prev - 1 + imgs.length) % imgs.length); }} 
                        style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: '1.2rem', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        ‹
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setCarouselIdx((prev) => (prev + 1) % imgs.length); }} 
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: '1.2rem', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        ›
                      </button>
                      
                      {/* Bolinhas Indicadoras */}
                      <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 20 }}>
                        {imgs.map((_, i) => (
                          <button 
                            key={i} 
                            onClick={(e) => { e.stopPropagation(); setCarouselIdx(i); }} 
                            style={{ width: 8, height: 8, borderRadius: '50%', background: i === carouselIdx ? '#fff' : 'rgba(255,255,255,0.4)', border: 'none', padding: 0, cursor: 'pointer' }} 
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Coluna de Informações / Form de Edição */}
                <div className="modal-info">
                  {!modoEdicao ? (
                    <>
                      <h2>{obraSelecionada.titulo}</h2>
                      <div className="modal-meta">
                        <span>{mapaCategoriasInverso[obraSelecionada.id_categoria]}</span>
                      </div>
                      <div className="modal-description">
                        <p>{obraSelecionada.descricao || <em>Sem descrição cadastrada.</em>}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 15 }}>
                        <button className="btn-edit-small" onClick={() => setModoEdicao(true)} style={{ padding: '8px 14px', borderRadius: 8 }}>
                          <FiEdit2 /> Editar
                        </button>
                        <button className="btn-cancel-small" onClick={deletarObra} style={{ padding: '8px 14px', borderRadius: 8, background: '#fff1f2', color: '#e11d48' }}>
                          <FiTrash2 /> Excluir
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="form-edicao-obra" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                      <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Editar Informações</h3>
                      <input value={formEdicao.titulo} onChange={e => setFormEdicao({...formEdicao, titulo: e.target.value})} placeholder="Título" className="textarea-fake" style={{ minHeight: 'auto', padding: '12px' }} />
                      <select value={formEdicao.categoria} onChange={e => setFormEdicao({...formEdicao, categoria: e.target.value})} className="textarea-fake" style={{ minHeight: 'auto', padding: '12px', appearance: 'auto' }}>
                        {categoriasLista.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <textarea value={formEdicao.descricao} onChange={e => setFormEdicao({...formEdicao, descricao: e.target.value})} rows={4} placeholder="Descrição" className="textarea-edit" />
                      
                      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                        <button onClick={salvarEdicaoObra} className="btn-save-small" style={{ flex: 1, padding: 10, justifyContent: 'center' }}><FiCheck /> Salvar</button>
                        <button onClick={() => setModoEdicao(false)} className="btn-cancel-small" style={{ flex: 1, padding: 10, justifyContent: 'center' }}><FiX /> Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default PaginaArtista;