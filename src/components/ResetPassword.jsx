import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function ResetPassword() {
  const [novaSenha, setNovaSenha] = useState('');
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErro('');
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) {
      setErro(error.message);
    } else {
      setMsg('Senha atualizada com sucesso! Redirecionando...');
      setTimeout(() => navigate('/'), 2000);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Criar Nova Senha</h2>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      <form onSubmit={handleUpdate}>
        <input 
          type="password" 
          placeholder="Nova senha" 
          value={novaSenha} 
          onChange={(e) => setNovaSenha(e.target.value)} 
          required 
        />
        <button type="submit">Salvar Senha</button>
      </form>
    </div>
  );
}