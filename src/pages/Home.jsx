import React from 'react';
import Header from '../components/Header'; // 1. Importe o Header
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* 2. Coloque o Header aqui no topo */}
      <Header />
      
      <main style={{ padding: '20px', textAlign: 'center' }}>
        <h1 style={{ color: '#84cc16' }}>Bem-vindo ao Studio Besouro</h1>
        <p>Explore nossas obras de arte e curadorias exclusivas.</p>
      </main>
    </div>
  );
};

export default Home;