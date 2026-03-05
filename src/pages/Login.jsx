import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import HeaderContato from '../components/HeaderContato'; // Importação do Header Simples
import './Cadastro.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setCarregando(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha,
    });

    if (error) {
      alert("Erro ao entrar: " + error.message);
      setCarregando(false);
      return;
    }

    const { data: perfil } = await supabase
      .from('usuario')
      .select('is_admin')
      .eq('id_usuario', data.user.id)
      .single();

    if (perfil?.is_admin) {
      alert("Bem-vindo, Administrador!");
      navigate('/admin');
    } else {
      alert("Login realizado com sucesso!");
      navigate('/');
    }
    setCarregando(false);
  };

  return (
    <>
      <HeaderContato />
      <div className="cadastro-container">
        <div className="contact-card">
          <h2 className="card-title" style={{ color: '#8b5cf6', marginBottom: '20px' }}>
            Entrar no Studio Besouro
          </h2>
          <form onSubmit={handleLogin} className="cadastro-form">
            <input type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            <button type="submit" className="help-button" disabled={carregando} style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none', cursor: 'pointer' }}>
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
            <p>Ainda não tem conta? <Link to="/cadastro" style={{ color: '#8b5cf6', fontWeight: 'bold' }}>Cadastre-se</Link></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;