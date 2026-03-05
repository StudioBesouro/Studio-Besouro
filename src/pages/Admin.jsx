import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './Admin.css';

const Admin = () => {
  // Estados para Obra
  const [tituloObra, setTituloObra] = useState('');
  const [artista, setArtista] = useState('');
  const [preco, setPreco] = useState('');
  const [imgObra, setImgObra] = useState('');

  // Estados para Banner
  const [tituloBanner, setTituloBanner] = useState('');
  const [imgBanner, setImgBanner] = useState('');

  // Função para cadastrar Obra
  const handleAddObra = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('obras').insert([
      { titulo: tituloObra, artista, preco: parseFloat(preco), imagem_url: imgObra }
    ]);

    if (error) alert("Erro: " + error.message);
    else {
      alert("Obra adicionada!");
      setTituloObra(''); setArtista(''); setPreco(''); setImgObra('');
    }
  };

  // Função para cadastrar Banner
  const handleAddBanner = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('banner').insert([
      { titulo: tituloBanner, imagem_url: imgBanner, ativo: true }
    ]);

    if (error) alert("Erro: " + error.message);
    else {
      alert("Banner adicionado!");
      setTituloBanner(''); setImgBanner('');
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Painel de Curadoria</h1>
      
      <div className="admin-sections">
        {/* Formulário de Obras */}
        <section className="admin-card">
          <h2>Nova Obra / Artista</h2>
          <form onSubmit={handleAddObra} className="admin-form">
            <input type="text" placeholder="Título da obra" value={tituloObra} onChange={e => setTituloObra(e.target.value)} required />
            <input type="text" placeholder="Nome do artista" value={artista} onChange={e => setArtista(e.target.value)} required />
            <input type="number" placeholder="Preço" value={preco} onChange={e => setPreco(e.target.value)} required />
            <input type="text" placeholder="URL da imagem (jpg/png)" value={imgObra} onChange={e => setImgObra(e.target.value)} required />
            <button type="submit" className="btn-save">Publicar Obra</button>
          </form>
        </section>

        {/* Formulário de Banner */}
        <section className="admin-card">
          <h2>Novo Banner Inicial</h2>
          <form onSubmit={handleAddBanner} className="admin-form">
            <input type="text" placeholder="Frase do banner" value={tituloBanner} onChange={e => setTituloBanner(e.target.value)} required />
            <input type="text" placeholder="URL da imagem do banner" value={imgBanner} onChange={e => setImgBanner(e.target.value)} required />
            <button type="submit" className="btn-save">Ativar Banner</button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Admin;