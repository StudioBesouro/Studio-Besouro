export default function ModalArtista({ isOpen, onClose, onSave, formData, setFormData, setFiles, loading }) {
  if (!isOpen) return null;
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
        <button className="close-x" onClick={onClose}>✕</button>
        <h2>Novo Artista</h2>
        <form className="admin-form" onSubmit={onSave}>
          <div><label>Nome</label><input value={formData.nome} onChange={e => setFormData(p => ({ ...p, nome: e.target.value }))} required /></div>
          <div><label>Bio</label><textarea value={formData.bio} onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))} /></div>
          <div><label>Foto de Perfil</label><input type="file" accept="image/*" onChange={e => setFiles(p => ({ ...p, fotoPerfil: e.target.files?.[0] || null }))} required /></div>
          <div><label>Imagem de Capa</label><input type="file" accept="image/*" onChange={e => setFiles(p => ({ ...p, bannerArtista: e.target.files?.[0] || null }))} required /></div>
          <button type="submit" className="btn-salvar" disabled={loading}>{loading ? 'Criando...' : 'Criar Artista'}</button>
        </form>
      </div>
    </div>
  );
}