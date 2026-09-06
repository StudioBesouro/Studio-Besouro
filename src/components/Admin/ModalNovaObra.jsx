import React, { useRef } from 'react';
import { FiX, FiUploadCloud, FiTrash2 } from 'react-icons/fi';
import './Modal1.css';

const CATS_DEFAULT = ['Desenho', 'Pintura', 'Música', 'Literatura', 'Fotografia', 'Escultura'];

const ModalNovaObra = ({ 
  isOpen, 
  onClose, 
  onSave, 
  novaObra = { titulo: '', descricao: '', categoria: '', arquivos: [] }, 
  setNovaObra, 
  loading = false, 
  categoriasLista = CATS_DEFAULT 
}) => {
  const inputRef = useRef(null);

  // Se o modal não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  const arquivosAtuais = novaObra.arquivos || (novaObra.arquivo ? [novaObra.arquivo] : []);

  // Adiciona novos arquivos sem sobrescrever os já selecionados
  const handleFiles = (e) => {
    const novos = Array.from(e.target.files || []);
    const atualizados = [...arquivosAtuais, ...novos];
    
    setNovaObra((prev) => ({
      ...prev,
      arquivos: atualizados,
      arquivo: atualizados[0] || null // Retrocompatibilidade
    }));
  };

  // Remove um arquivo específico da lista
  const removeFile = (idx) => {
    const filtrados = arquivosAtuais.filter((_, i) => i !== idx);
    setNovaObra((prev) => ({
      ...prev,
      arquivos: filtrados,
      arquivo: filtrados[0] || null
    }));
  };

  return (
    <div className="modal-overlay escopo-modal-cadastro" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Cabeçalho */}
        <div className="modal-header">
          <h3>✨ Cadastrar Nova Obra</h3>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Fechar">
            <FiX size={24} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={onSave}>
          <div className="modal-body">
            
            {/* Título */}
            <div className="form-group">
              <label htmlFor="titulo">Título da Obra *</label>
              <input 
                id="titulo"
                type="text" 
                required 
                placeholder="Ex: Noite Estrelada"
                value={novaObra.titulo || ''} 
                onChange={(e) => setNovaObra((prev) => ({ ...prev, titulo: e.target.value }))} 
              />
            </div>

            {/* Categoria */}
            <div className="form-group">
              <label htmlFor="categoria">Categoria *</label>
              <select 
                id="categoria"
                required 
                value={novaObra.categoria || ''} 
                onChange={(e) => setNovaObra((prev) => ({ ...prev, categoria: e.target.value }))}
              >
                <option value="" disabled>Selecione uma categoria</option>
                {categoriasLista.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Descrição */}
            <div className="form-group">
              <label htmlFor="descricao">Descrição *</label>
              <textarea 
                id="descricao"
                required
                rows={4}
                placeholder="Conte um pouco sobre a história ou inspiração dessa obra..."
                value={novaObra.descricao || ''} 
                onChange={(e) => setNovaObra((prev) => ({ ...prev, descricao: e.target.value }))} 
              />
            </div>

            {/* Upload de Mídias */}
            <div className="form-group">
              <label>Arquivos (Selecione múltiplos para carrossel) *</label>
              <label className="upload-dropzone">
                <FiUploadCloud size={28} />
                <span>Clique aqui para selecionar as mídias...</span>
                <input 
                  ref={inputRef}
                  type="file" 
                  className="input-file-hidden" 
                  accept="image/*,video/*,application/pdf" 
                  multiple
                  onChange={handleFiles} 
                />
              </label>

              {/* Lista de Mídias Selecionadas */}
              {arquivosAtuais.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {arquivosAtuais.map((file, idx) => (
                      <div 
                        key={`${file.name}-${idx}`} 
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                          padding: '6px 12px',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          color: '#334155'
                        }}
                      >
                        <span>{file.name.length > 22 ? `${file.name.substring(0, 22)}…` : file.name}</span>
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
                          title="Remover arquivo"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {arquivosAtuais.length > 1 && (
                    <span style={{ fontSize: '0.78rem', color: '#8b5cf6', fontWeight: 600, marginTop: 4 }}>
                      📸 {arquivosAtuais.length} arquivos selecionados — serão exibidos em formato carrossel.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Rodapé / Ações */}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-submit-green" 
              disabled={loading || arquivosAtuais.length === 0}
            >
              {loading ? "Publicando..." : "Publicar Obra"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNovaObra;