import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Banner from '../components/Banner';
import HomeObras from './HomeObras';
import './Home.css';

// Import da imagem de divulgação
import divulgacaoImg from '../assets/divulgacao.png';

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
      // Filtra os banners ativos e dentro do prazo
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
      {/* Espaçamento proporcional ao lugar onde ficava o ConviteArtista */}
      <div style={{ height: '80px', width: '100%' }} />

      {/* 1. Imagem de Divulgação + Botão de Curadoria */}
      <section 
        className="divulgacao-section" 
        style={{ 
          width: '100%', 
          maxWidth: '1200px', 
          margin: '0 auto 24px auto', 
          padding: '0 20px', 
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <img 
          src={divulgacaoImg} 
          alt="Divulgação" 
          style={{ 
            width: '100%', 
            height: 'auto', 
            display: 'block',
            borderRadius: '12px' 
          }} 
        />

        {/* Botão de Chamada para a Curadoria */}
        <Link 
          to="/contato" 
          style={{
            marginTop: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '1rem',
            padding: '12px 28px',
            borderRadius: '50px',
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
            transition: 'all 0.25s ease-in-out',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.4)';
          }}
        >
          <span>Falar com a Curadoria</span>
          <span style={{ fontSize: '1.1rem' }}>→</span>
        </Link>
      </section>

      {/* 2. Seção do Banner */}
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