import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; 
import { Link } from 'react-router-dom';
import HeaderContato from '../components/HeaderContato'; // Importação do Header Simples
import './Cadastro.css';

const Cadastro = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleRegistro = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: senha,
      options: { data: { nome: nome } },
    });

    if (error) {
      alert("Erro ao cadastrar: " + error.message);
    } else {
      alert("Cadastro realizado! Verifique seu e-mail.");
      setNome(''); setEmail(''); setSenha('');
    }
  };

  return (
    <>
      <HeaderContato />
      <div className="cadastro-container">
        <div className="contact-card">
          <h2 className="card-title" style={{ color: '#8b5cf6', marginBottom: '20px' }}>
            Criar conta no Studio Besouro
          </h2>
          <form onSubmit={handleRegistro} className="cadastro-form">
            <input type="text" placeholder="Seu Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required />
            <input type="email" placeholder="Seu melhor e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Crie uma senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            <button type="submit" className="help-button" style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none', cursor: 'pointer' }}>
              Finalizar Cadastro
            </button>
          </form>
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
            <p>Já tem uma conta? <Link to="/login" style={{ color: '#8b5cf6', fontWeight: 'bold' }}>Acesse aqui</Link></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cadastro;