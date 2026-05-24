import React from 'react';
import { FiX, FiImage } from 'react-icons/fi';
import './Modal1.css'; // <--- Importa o mesmo arquivo de estilo controlado

const ModalBanner = ({ isOpen, onClose, onSave, formData, setFormData, files, setFiles, loading, editingId }) => {
  if (!isOpen) return null;

  return (
    /* Adicionada a classe de escopo para aplicar o CSS do Modal1 */
    <div className="modal-overlay escopo-modal-cadastro">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{editingId ? '✏️ Editar Banner' : '✨ Novo Banner'}</h3>
          <button className="btn-close" onClick={onClose}>
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
                value={formData.titulo} 
                onChange={e => setFormData({...formData, titulo: e.target.value})} 
              />
            </div>

            <div className="form-group">
              <label>Descrição *</label>
              <textarea 
                required 
                value={formData.descricao} 
                onChange={e => setFormData({...formData, descricao: e.target.value})} 
              />
            </div>

            <div className="form-group">
              <label>Imagem {editingId && '(Deixe vazio para manter a atual)'}</label>
              {/* Reaproveitando a estrutura visual da dropzone de arquivos do CSS */}
              <label className="upload-dropzone">
                <FiImage size={24} />
                <span>{files.banner ? files.banner.name : "Clique para selecionar a imagem..."}</span>
                <input 
                  type="file" 
                  className="input-file-hidden"
                  accept="image/*" 
                  onChange={e => setFiles({...files, banner: e.target.files[0]})} 
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
};

export default ModalBanner;