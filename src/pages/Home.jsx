import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Banner from '../components/Banner';
import HomeObras from './HomeObras'; 
import './Home.css';

// Recebe "pesquisaTermo" enviado pelo Header através do componente pai (App.jsx)
const Home = ({ pesquisaTermo = "" }) => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data, error } = await supabase
        .from('banner')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar banners:', error);
      } else {
        setBanners(data || []);
      }
    };

    fetchBanners();
  }, []);

  return (
    <div className="home-content">
      {/* 1. Seção do Banner */}
      <section className="banner-section">
        {banners.length > 0 ? (
          <Banner noticias={banners} />
        ) : (
          <div className="no-banner">Nenhum banner disponível no momento</div>
        )}
      </section>

      {/* 2. Conteúdo principal: obras e artistas */}
      <main className="main-layout">
        {/* Passamos o termo que veio lá do Header para dentro do HomeObras filtrar */}
        <HomeObras buscaTermoExterno={pesquisaTermo} />
      </main>
    </div>
  );
};

export default Home;