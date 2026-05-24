import React from 'react';
import { FiX, FiImage } from 'react-icons/fi';
import './Modal1.css'; // <--- Importa o mesmo arquivo de estilo controlado

const ModalArtista = ({ isOpen, onClose, onSave, formData, setFormData, files, setFiles, loading }) => {
  if (!isOpen) return null;

  return (
    /* Ativada a classe de escopo para aplicar o CSS isolado do Modal1 */
    <div className="modal-overlay escopo-modal-cadastro">
      <div className="modal-content">
        <div className="modal-header">
          <h3>🎨 Novo Artista</h3>
          <button className="btn-close" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={onSave}>
          <div className="modal-body">
            <div className="form-group">
              <label>Nome Completo</label>
              <input 
                type="text" 
                required 
                value={formData.nome} 
                onChange={e => setFormData({...formData, nome: e.target.value})} 
              />
            </div>

            <div className="form-group">
              <label>Biografia Curta</label>
              <textarea 
                required 
                value={formData.bio} 
                onChange={e => setFormData({...formData, bio: e.target.value})} 
              />
            </div>

            {/* Container flexível para manter os dois uploads organizados lado a lado ou empilhados */}
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
                <label>Foto de Perfil</label>
                <label className="upload-dropzone">
                  <FiImage size={24} />
                  <span>{files.fotoPerfil ? files.fotoPerfil.name : "Escolher foto..."}</span>
                  <input 
                    id="perfil-upload" 
                    type="file" 
                    className="input-file-hidden"
                    accept="image/*" 
                    required 
                    onChange={e => setFiles({...files, fotoPerfil: e.target.files[0]})} 
                  />
                </label>
              </div>

              <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
                <label>Banner de Fundo</label>
                <label className="upload-dropzone">
                  <FiImage size={24} />
                  <span>{files.bannerArtista ? files.bannerArtista.name : "Escolher banner..."}</span>
                  <input 
                    id="banner-art-upload" 
                    type="file" 
                    className="input-file-hidden"
                    accept="image/*" 
                    required 
                    onChange={e => setFiles({...files, bannerArtista: e.target.files[0]})} 
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit-green" disabled={loading}>
              {loading ? 'Salvando...' : 'Cadastrar Artista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalArtista;