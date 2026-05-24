import React from 'react';
import { FiX, FiUploadCloud } from 'react-icons/fi';
import './Modal1.css'; 

const ModalNovaObra = ({ show, onBlur, onSubmit, novaObra, setNovaObra, uploading, categoriasLista }) => {
  if (!show) return null;

  return (
    /* CORREÇÃO 1: Adicionada a classe escopo-modal-cadastro para ativar o CSS isolado */
    <div className="modal-overlay escopo-modal-cadastro">
      <div className="modal-content">
        <div className="modal-header">
          <h3>✨ Cadastrar Nova Obra</h3>
          <button className="btn-close" onClick={onBlur}>
            <FiX size={24}/>
          </button>
        </div>
        
        <form onSubmit={onSubmit}>
          {/* CORREÇÃO 2: Removido o style inline para o modal-body usar 100% o CSS do arquivo */}
          <div className="modal-body">
            <div className="form-group">
              <label>Título da Obra *</label>
              <input 
                type="text" 
                required 
                value={novaObra.titulo} 
                onChange={e => setNovaObra({...novaObra, titulo: e.target.value})} 
              />
            </div>

            <div className="form-group">
              <label>Categoria *</label>
              <select 
                required 
                value={novaObra.categoria} 
                onChange={e => setNovaObra({...novaObra, categoria: e.target.value})}
              >
                <option value="" disabled>Selecione uma categoria</option>
                {categoriasLista.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea 
                value={novaObra.descricao} 
                onChange={e => setNovaObra({...novaObra, descricao: e.target.value})} 
              />
            </div>

            <div className="form-group">
              <label>Arquivo *</label>
              <label className="upload-dropzone">
                <FiUploadCloud size={24} />
                <span>{novaObra.arquivo ? novaObra.arquivo.name : "Clique para selecionar"}</span>
                <input 
                  type="file" 
                  className="input-file-hidden" 
                  accept="image/*,video/*" 
                  required 
                  onChange={e => setNovaObra({...novaObra, arquivo: e.target.files[0]})} 
                />
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onBlur}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit-green" disabled={uploading}>
              {uploading ? "Publicando..." : "Publicar Obra"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNovaObra;