import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "../lib/supabaseClient"; 
import { FiPlus, FiArrowLeft, FiCamera, FiEdit2, FiCheck, FiX, FiImage, FiTrash2 } from 'react-icons/fi'; 

import { useArtista } from '../hooks/useArtista';
import ModalNovaObra from '../components/Admin/ModalNovaObra';

import './PaginaArtista.css';
import '../components/Modal.css';

const PaginaArtista = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const { artista, setArtista, loading, buscarDados } = useArtista(id);

  const [editBio, setEditBio] = useState(false);
  const [tempBio, setTempBio] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showModalNova, setShowModalNova] = useState(false);
  const [novaObra, setNovaObra] = useState({ titulo: "", descricao: "", categoria: "Desenho", arquivo: null });
  
  const [obraSelecionada, setObraSelecionada] = useState(null);
  const [showModalDetalhe, setShowModalDetalhe] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [formEdicao, setFormEdicao] = useState({ titulo: "", descricao: "", categoria: "" });

  const categoriasLista = ['Desenho', 'Pintura', 'Música', 'Literatura', 'Fotografia', 'Escultura'];
  const mapaCategorias = { 'Desenho': 1, 'Pintura': 2, 'Música': 3, 'Literatura': 4, 'Fotografia': 5, 'Escultura': 6 };
  const mapaCategoriasInverso = Object.fromEntries(Object.entries(mapaCategorias).map(([k, v]) => [v, k]));

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
// RENDERIZADOR ATUALIZADO: Remove barras pretas de ferramentas e abre em tela cheia ao clicar no modal
  const renderizarMidia = (url, titulo, emModal = false) => {
    const tipo = identificarTipoMidia(url);

    if (tipo === 'video') {
      return (
        <video 
          src={url} 
          controls={emModal}
          autoPlay={!emModal}
          muted={true}
          loop={true}
          playsInline={true}
          style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
        />
      );
    }

    if (tipo === 'pdf') {
      // Força o navegador a esconder a barra de ferramentas (#toolbar=0) e painéis (#navpanes=0)
      const urlLimpaDoPdf = `${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;

      if (emModal) {
        return (
          <div 
            onClick={() => window.open(url, '_blank')} 
            style={{ width: '100%', height: '100%', minHeight: '450px', cursor: 'zoom-in', position: 'relative' }}
            title="Clique para abrir em tela cheia"
          >
            {/* Camada invisível protetora: captura o clique na tela para abrir o PDF expandido e impede interações com a barra nativa */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }} />
            
            <iframe 
              src={urlLimpaDoPdf} 
              title={titulo} 
              style={{ width: '100%', height: '100%', minHeight: '450px', border: 'none', background: '#fff', display: 'block' }} 
            />
          </div>
        );
      }
      
      // Na listagem (Capa): Mostra a primeira página do PDF estática e limpa
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

    return <img src={url} alt={titulo} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />;
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

  const deletarObra = async () => {
    if (!obraSelecionada || !window.confirm("Excluir esta obra?")) return;
    try {
      const { error } = await supabase.from('obras').delete().eq('id_obra', obraSelecionada.id_obra);
      if (error) throw error;
      setArtista({ ...artista, obras: artista.obras.filter(o => o.id_obra !== obraSelecionada.id_obra) });
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
          {artista?.obras?.map(obra => (
            <div key={obra.id_obra} className="card-obra-minimal clickable" onClick={() => abrirDetalhes(obra)}>
              <div className="img-container">
                {renderizarMidia(obra.imagem_url, obra.titulo, false)}
              </div>
              <div className="info-obra-bottom"><h3>{obra.titulo}</h3></div>
            </div>
          ))}
        </div>
      </section>

      <ModalNovaObra 
        show={showModalNova} onBlur={() => setShowModalNova(false)} 
        onSubmit={async (e) => {
            e.preventDefault();
            setUploading(true);
            try {
              const fileExt = novaObra.arquivo.name.split('.').pop();
              const fileName = `obra_${id}_${Date.now()}.${fileExt}`;
              
              await supabase.storage.from('obras').upload(fileName, novaObra.arquivo, {
                contentType: novaObra.arquivo.type,
                upsert: true
              });

              const { data: { publicUrl } } = supabase.storage.from('obras').getPublicUrl(fileName);
              await supabase.from('obras').insert([{ id_artista: id, id_categoria: mapaCategorias[novaObra.categoria], titulo: novaObra.titulo, descricao: novaObra.descricao, imagem_url: publicUrl }]);
              
              buscarDados();
              setShowModalNova(false);
              setNovaObra({ titulo: "", descricao: "", categoria: "Desenho", arquivo: null });
              alert("Obra publicada com sucesso!");
            } catch (e) { alert(e.message); } finally { setUploading(false); }
        }}
        novaObra={novaObra} setNovaObra={setNovaObra} uploading={uploading} categoriasLista={categoriasLista}
      />
      
      {/* MODAL MULTIMÍDIA OTIMIZADO */}
      {showModalDetalhe && obraSelecionada && (
        <div className="modal-overlay" onClick={() => { setShowModalDetalhe(false); setModoEdicao(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            
            <button className="modal-close" onClick={() => { setShowModalDetalhe(false); setModoEdicao(false); }}>
              <FiX />
            </button>

            <div className="modal-body">
              {/* Coluna da Mídia */}
              <div className="modal-image-container" style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'stretch', justifyContent: 'center', background: '#000' }}>
                {renderizarMidia(obraSelecionada.imagem_url, obraSelecionada.titulo, true)}
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
                  </>
                ) : (
                  <div className="form-edicao-obra" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Editar Informações</h3>
                    <input value={formEdicao.titulo} onChange={e => setFormEdicao({...formEdicao, titulo: e.target.value})} placeholder="Título" className="textarea-fake" style={{ minHeight: 'auto', padding: '12px' }} />
                    <select value={formEdicao.categoria} onChange={e => setFormEdicao({...formEdicao, categoria: e.target.value})} className="textarea-fake" style={{ minHeight: 'auto', padding: '12px', appearance: 'auto' }}>
                      {categoriasLista.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <textarea value={formEdicao.descricao} onChange={e => setFormEdicao({...formEdicao, descricao: e.target.value})} rows={4} placeholder="Descrição" className="textarea-edit" />
                  </div>
                )}

                {/* Rodapé Interno do Painel */}
                <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {modoEdicao ? (
                    <>
                      <button className="btn-cancel-small" style={{ padding: '10px 16px' }} onClick={() => setModoEdicao(false)}>Cancelar</button>
                      <button className="btn-save-small" style={{ padding: '10px 16px' }} onClick={salvarEdicaoObra}>Salvar</button>
                    </>
                  ) : (
                    <>
                      <button className="btn-edit-small" style={{ padding: '10px 16px' }} onClick={() => setModoEdicao(true)}><FiEdit2 /> Editar</button>
                      <button className="btn-cancel-small" style={{ padding: '10px', marginLeft: 'auto' }} onClick={deletarObra} title="Excluir Obra">
                        <FiTrash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaArtista;