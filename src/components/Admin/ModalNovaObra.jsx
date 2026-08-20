import React, { useRef } from 'react';
import { FiX, FiUploadCloud, FiTrash2 } from 'react-icons/fi';
import './Modal1.css';

const catsDefault = ['Desenho', 'Pintura', 'Música', 'Literatura', 'Fotografia', 'Escultura'];

const ModalNovaObra = ({ 
  show, 
  onBlur, 
  onSubmit, 
  novaObra, 
  setNovaObra, 
  uploading, 
  categoriasLista = catsDefault 
}) => {
  const inputRef = useRef(null);

  if (!show) return null;

  // Adiciona novos arquivos sem sobrescrever os já selecionados
  const handleFiles = (e) => {
    const novos = Array.from(e.target.files || []);
    const atuais = novaObra.arquivos || (novaObra.arquivo ? [novaObra.arquivo] : []);
    setNovaObra({
      ...novaObra,
      arquivos: [...atuais, ...novos],
      arquivo: [...atuais, ...novos][0] || null // Mantém retrocompatibilidade
    });
  };

  // Remove um arquivo específico da lista
  const removeFile = (idx) => {
    const filtrados = (novaObra.arquivos || []).filter((_, i) => i !== idx);
    setNovaObra({
      ...novaObra,
      arquivos: filtrados,
      arquivo: filtrados[0] || null
    });
  };

  const listaArquivos = novaObra.arquivos || (novaObra.arquivo ? [novaObra.arquivo] : []);

  return (
    <div className="modal-overlay escopo-modal-cadastro" onClick={onBlur}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>✨ Cadastrar Nova Obra</h3>
          <button type="button" className="btn-close" onClick={onBlur}>
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Título da Obra *</label>
              <input 
                type="text" 
                required 
                value={novaObra.titulo || ''} 
                onChange={(e) => setNovaObra({ ...novaObra, titulo: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>Categoria *</label>
              <select 
                required 
                value={novaObra.categoria || ''} 
                onChange={(e) => setNovaObra({ ...novaObra, categoria: e.target.value })}
              >
                <option value="" disabled>Selecione uma categoria</option>
                {categoriasLista.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Descrição *</label>
              <textarea 
                required
                value={novaObra.descricao || ''} 
                onChange={(e) => setNovaObra({ ...novaObra, descricao: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>Arquivos (Selecione múltiplos para carrossel) *</label>
              <label className="upload-dropzone">
                <FiUploadCloud size={24} />
                <span>Clique para selecionar as mídias...</span>
                <input 
                  ref={inputRef}
                  type="file" 
                  className="input-file-hidden" 
                  accept="image/*,video/*,application/pdf" 
                  multiple
                  onChange={handleFiles} 
                />
              </label>

              {/* Lista de Mídias com opção de Remoção */}
              {listaArquivos.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {listaArquivos.map((file, idx) => (
                      <div 
                        key={idx} 
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                          padding: '5px 10px',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          color: '#334155'
                        }}
                      >
                        <span>{file.name.length > 20 ? `${file.name.substring(0, 20)}…` : file.name}</span>
                        <button 
                          type="button" 
                          onClick={() => removeFile(idx)} 
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#e11d48',
                            display: 'flex',
                            alignItems: 'center',
                            padding: 0
                          }}
                          title="Remover"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {listaArquivos.length > 1 && (
                    <span style={{ fontSize: '0.78rem', color: '#8b5cf6', fontWeight: 600, marginTop: 4 }}>
                      📸 {listaArquivos.length} arquivos selecionados — será exibido como carrossel.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onBlur}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-submit-green" 
              disabled={uploading || listaArquivos.length === 0}
            >
              {uploading ? "Publicando..." : "Publicar Obra"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNovaObra;