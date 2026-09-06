import React from 'react';
import { FiX, FiUploadCloud } from 'react-icons/fi';
import './Modal1.css'; // Usando o mesmo CSS do banner

export default function ModalArtista({ 
  isOpen, 
  onClose, 
  onSave, 
  formData, 
  setFormData, 
  files,
  setFiles, 
  loading 
}) {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-box purple-theme" onClick={e => e.stopPropagation()}>
        
        {/* Cabeçalho do Modal */}
        <div className="modal-header">
          <h2>Novo Artista</h2>
          <button type="button" className="close-x" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        {/* Formulário */}
        <form className="admin-form" onSubmit={onSave}>
          <div className="form-group">
            <label>Nome do Artista</label>
            <input 
              type="text" 
              placeholder="Ex: João Silva"
              value={formData.nome || ''} 
              onChange={e => setFormData(p => ({ ...p, nome: e.target.value }))} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Biografia</label>
            <textarea 
              rows={3}
              placeholder="Escreva uma breve biografia do artista..."
              value={formData.bio || ''} 
              onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))} 
            />
          </div>

          {/* Grid de Uploads (Foto de Perfil + Banner) */}
          <div className="file-grid-2">
            
            {/* Campo Foto de Perfil */}
            <div className="form-group">
              <label>Foto de Perfil</label>
              <div className="file-input-wrapper">
                <input 
                  type="file" 
                  id="fotoPerfilInput"
                  accept="image/*" 
                  onChange={e => setFiles(p => ({ ...p, fotoPerfil: e.target.files?.[0] || null }))} 
                  required 
                />
                <label htmlFor="fotoPerfilInput" className="file-input-label">
                  <FiUploadCloud size={24} />
                  <span>{files?.fotoPerfil ? files.fotoPerfil.name : 'Foto de Perfil'}</span>
                </label>
              </div>
            </div>

            {/* Campo Banner do Artista */}
            <div className="form-group">
              <label>Capa / Banner</label>
              <div className="file-input-wrapper">
                <input 
                  type="file" 
                  id="bannerArtistaInput"
                  accept="image/*" 
                  onChange={e => setFiles(p => ({ ...p, bannerArtista: e.target.files?.[0] || null }))} 
                  required 
                />
                <label htmlFor="bannerArtistaInput" className="file-input-label">
                  <FiUploadCloud size={24} />
                  <span>{files?.bannerArtista ? files.bannerArtista.name : 'Imagem de Capa'}</span>
                </label>
              </div>
            </div>

          </div>

          {/* Botão de Salvar */}
          <button type="submit" className="btn-salvar purple" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Artista'}
          </button>
        </form>

      </div>
    </div>
  );
}