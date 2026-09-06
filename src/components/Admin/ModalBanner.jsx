import React from 'react';
import { FiX, FiImage } from 'react-icons/fi';
import './Modal1.css'; // 1. Corrigido para importar o arquivo de estilo verde correto

export default function ModalBanner({ 
  isOpen, 
  onClose, 
  onSave, 
  formData, 
  setFormData, 
  files, 
  setFiles, 
  loading, 
  editingId 
}) {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
        
        {/* Cabeçalho */}
        <div className="modal-header">
          <h2>{editingId ? 'Editar Banner' : 'Novo Banner'}</h2>
          <button type="button" className="close-x" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        {/* Formulário */}
        <form className="admin-form" onSubmit={onSave}>
          <div className="form-group">
            <label>Título Principal *</label>
            <input 
              type="text" 
              required 
              value={formData.titulo || ''} 
              onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))} 
            />
          </div>

          <div className="form-group">
            <label>Descrição *</label>
            <textarea 
              required 
              rows={3}
              value={formData.descricao || ''} 
              onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))} 
            />
          </div>

          <div className="form-group">
            <label>Duração de Exibição</label>
            <select 
              value={formData.duracao_dias || 0} 
              onChange={(e) => setFormData((prev) => ({ ...prev, duracao_dias: Number(e.target.value) }))}
            >
              <option value={0}>Sem limite</option>
              <option value={7}>1 semana</option>
              <option value={14}>2 semanas</option>
              <option value={30}>1 mês</option>
              <option value={365}>1 ano</option>
            </select>
          </div>

          {/* Área de Upload */}
          <div className="form-group">
            <label>Imagem {editingId && '(Deixe vazio para manter a atual)'}</label>
            <div className="file-input-wrapper">
              <input 
                type="file" 
                id="bannerFileInput"
                accept="image/*" 
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0] || null;
                  setFiles((prev) => ({ ...prev, banner: selectedFile }));
                }} 
              />
              <label htmlFor="bannerFileInput" className="file-input-label">
                <FiImage size={24} />
                <span>{files?.banner ? files.banner.name : 'Clique para selecionar a imagem...'}</span>
              </label>
            </div>
          </div>

          {/* Botão de Ação */}
          <button type="submit" className="btn-salvar" disabled={loading}>
            {loading ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Cadastrar Banner'}
          </button>
        </form>

      </div>
    </div>
  );
}