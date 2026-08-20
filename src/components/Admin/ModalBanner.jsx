import React from 'react';
import { FiX, FiImage } from 'react-icons/fi';
import './Modal1.css';

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
    <div className="modal-overlay escopo-modal-cadastro" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editingId ? '✏️ Editar Banner' : '✨ Novo Banner'}</h3>
          <button type="button" className="btn-close" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={onSave}>
          <div className="modal-body">
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

            <div className="form-group">
              <label>Imagem {editingId && '(Deixe vazio para manter a atual)'}</label>
              <label className="upload-dropzone">
                <FiImage size={24} />
                <span>{files?.banner ? files.banner.name : 'Clique para selecionar a imagem...'}</span>
                <input 
                  type="file" 
                  className="input-file-hidden"
                  accept="image/*" 
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0] || null;
                    setFiles((prev) => ({ ...prev, banner: selectedFile }));
                  }} 
                />
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit-green" disabled={loading}>
              {loading ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Cadastrar Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}