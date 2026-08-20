import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Banner from '../components/Banner';
import ConviteArtista from '../components/ConviteArtista';
import HomeObras from './HomeObras';
import './Home.css';

export default function Home({ pesquisaTermo = '' }) {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data, error } = await supabase
        .from('banner')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar banners:', error);
        return;
      }

      const agora = Date.now();
      // Filtra os banners que estão marcados como ativos e que não expiraram pela duração em dias
      const bannersValidos = (data || []).filter((b) => {
        if (b.ativo === false) return false;
        if (b.duracao_dias > 0) {
          const expiracao = new Date(b.created_at).getTime() + b.duracao_dias * 86400000;
          return expiracao > agora;
        }
        return true;
      });

      setBanners(bannersValidos);
    };

    fetchBanners();
  }, []);

  return (
    <div className="home-content">
      {/* Convite para o Artista adicionado em cima do banner */}
      <ConviteArtista />

      {/* 1. Seção do Banner */}
      <section className="banner-section">
        {banners.length > 0 ? (
          <Banner noticias={banners} />
        ) : (
          <div className="no-banner">Nenhum banner disponível no momento</div>
        )}
      </section>

      {/* 3. Conteúdo principal: Obras e Artistas */}
      <main className="main-layout">
        <HomeObras buscaTermoExterno={pesquisaTermo} />
      </main>
    </div>
  );
}