import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { FiArrowLeft } from 'react-icons/fi';
import Footer from '../components/Footer';
import ArtistaObras from '../components/ArtistaObras';
import './Artista.css';
import '../components/Modal.css';

const tipo = (url) => {
  if (!url) return 'imagem';
  const u = url.toLowerCase();
  if (u.includes('.pdf')) return 'pdf';
  if (['mp4','mov','webm','ogg'].some(e => u.includes(`.${e}`))) return 'video';
  return 'imagem';
};

export default function Artista() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artista, setArtista] = useState(null);
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: profile } = await supabase.from('perfil_artista').select('*').eq('id_artista', id).single();
      setArtista(profile);
      const { data: works } = await supabase.from('obras').select('*').eq('id_artista', id).order('created_at', { ascending: false });
      setObras((works || []).map(o => ({ ...o, tipoMidia: tipo(o.imagem_url) })));
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="loading-state">Carregando...</div>;
  if (!artista) return <div className="error-state">Artista não encontrado.</div>;

  return (
    <div className="pg-artista-publica">
      <div className="hero-banner" style={{ backgroundImage: `url(${artista.banner_url})` }}>
        <button className="btn-voltar-artista" onClick={() => navigate(-1)}><FiArrowLeft /> Voltar</button>
      </div>
      <div className="container-perfil">
        <header className="header-perfil">
          <div className="wrapper-foto"><img src={artista.foto_perfil_url} alt={artista.nome} className="foto-perfil-viva" /></div>
          <h1 className="nome-artista">{artista.nome}</h1>
          <div className="bio-container"><p>{artista.bio}</p></div>
        </header>
        <hr className="divisor-moderno" />
        <ArtistaObras obras={obras} nomeArtista={artista.nome} />
      </div>
      <Footer />
    </div>
  );
}