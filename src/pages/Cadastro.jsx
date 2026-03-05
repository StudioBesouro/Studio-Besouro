import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; 
import './Cadastro.css';

const Cadastro = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleRegistro = async (e) => {
    e.preventDefault();
    
    // AQUI O SEGREDO: Usar os nomes exatamente como estão no seu SQL (minúsculos)
    const { data, error } = await supabase
      .from('usuario') // Tabela em minúsculo
      .insert([
        { 
          nome: nome, 
          email: email, 
          senha: senha, 
          is_admin: false // Usando o nome da coluna booleana que definimos
        }
      ]);

    if (error) {
      alert("Erro ao cadastrar: " + error.message);
    } else {
      alert("Cadastro realizado com sucesso! Bem-vindo ao Studio Besouro.");
      // Limpar os campos após o sucesso
      setNome('');
      setEmail('');
      setSenha('');
    }
  };

  return (
    <div className="cadastro-container">
      <div className="contact-card">
        <h2 className="card-title" style={{ color: '#8b5cf6', marginBottom: '20px' }}>
          Criar conta no Studio Besouro
        </h2>
        <form onSubmit={handleRegistro} className="cadastro-form">
          <input 
            type="text" 
            placeholder="Seu Nome completo" 
            value={nome}
            onChange={(e) => setNome(e.target.value)} 
            required 
          />
          <input 
            type="email" 
            placeholder="Seu melhor e-mail" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Crie uma senha" 
            value={senha}
            onChange={(e) => setSenha(e.target.value)} 
            required 
          />
          <button type="submit" className="help-button" style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none', cursor: 'pointer' }}>
            Finalizar Cadastro
          </button>
        </form>
      </div>
    </div>
  );
};

export default Cadastro;