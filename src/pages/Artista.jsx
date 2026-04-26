import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { FiArrowLeft } from 'react-icons/fi';
import HeaderContato from '../components/HeaderContato';
import Footer from '../components/Footer';
import ArtistaObras from '../components/ArtistaObras'; // Importe o novo componente

import './Artista.css';

const Artista = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artista, setArtista] = useState(null);
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDadosArtista = async () => {
      setLoading(true);
      try {
        const { data: profile } = await supabase.from('perfil_artista').select('*').eq('id_artista', id).single();
        setArtista(profile);
        const { data: works } = await supabase.from('obras').select('*').eq('id_artista', id).order('created_at', { ascending: false });
        setObras(works || []);
      } catch (error) {
        console.error('Erro:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDadosArtista();
  }, [id]);

  if (loading) return <div className="loading-state">Carregando...</div>;
  if (!artista) return <div className="error-state">Artista não encontrado.</div>;

  return (
    <div className="pg-artista-publica">
      <HeaderContato />
      <div className="hero-banner" style={{ backgroundImage: `url(${artista.banner_url})` }}>
        <button className="btn-voltar-artista" onClick={() => navigate(-1)}><FiArrowLeft /> Voltar</button>
      </div>

      <div className="container-perfil">
        <header className="header-perfil">
          <div className="wrapper-foto">
            <img src={artista.foto_perfil_url} alt={artista.nome} className="foto-perfil-viva" />
          </div>
          <h1 className="nome-artista">{artista.nome}</h1>
          <div className="bio-container"><p>{artista.bio}</p></div>
        </header>

        <hr className="divisor-moderno" />

        {/* CHAMADA DO COMPONENTE DE OBRAS */}
        <ArtistaObras obras={obras} nomeArtista={artista.nome} />
      </div>
      <Footer />
    </div>
  );
};

export default Artista;