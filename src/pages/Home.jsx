import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './Home.css';

const Home = () => {
  const [obras, setObras] = useState([]);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    // Busca Obras
    const { data: obrasData } = await supabase.from('obras').select('*');
    if (obrasData) setObras(obrasData);

    // Busca Banners ativos
    const { data: bannersData } = await supabase.from('banner').select('*').eq('ativo', true);
    if (bannersData) setBanners(bannersData);
  };

  return (
    <div className="home-container">
      {/* Seção de Banner */}
      <section className="banner-section">
        {banners.map((b) => (
          <div key={b.id_banner} className="banner-item">
            <img src={b.imagem_url} alt={b.titulo} className="banner-img" />
            <div className="banner-text"><h2>{b.titulo}</h2></div>
          </div>
        ))}
      </section>

      <main className="home-content">
        <h1 className="main-title">Galeria Studio Besouro</h1>
        
        <div className="obras-grid">
          {obras.length > 0 ? (
            obras.map((obra) => (
              <div key={obra.id_obra} className="obra-card">
                <img src={obra.imagem_url} alt={obra.titulo} />
                <div className="obra-info">
                  <h3>{obra.titulo}</h3>
                  <p>Por: <strong>{obra.artista}</strong></p>
                  <span className="price">R$ {obra.preco}</span>
                </div>
              </div>
            ))
          ) : (
            <p>Nenhuma obra cadastrada ainda pela curadoria.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;