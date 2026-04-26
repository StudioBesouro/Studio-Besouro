import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Banner from '../components/Banner';
import HomeObras from './HomeObras'; 
// Removi o import do Footer daqui, pois ele já está no App.js
import './Home.css';

const Home = () => {
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
        <HomeObras />
      </main>

      {/* O Footer foi removido daqui porque o App.js já cuida dele. 
         Isso evita erros de "duplicate component" e erro 500.
      */}
    </div>
  );
};

export default Home;