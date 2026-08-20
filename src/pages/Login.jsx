import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import HeaderContato from '../components/HeaderContato';
import './Cadastro.css';

export default function Login() {
  const [email, setEmail] = useState(''); const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg(''); setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;
      const { data: perfil } = await supabase.from('usuario').select('id_tipo_usuario').eq('id_usuario', data.user.id).maybeSingle();
      if (!perfil) { setErrorMsg('Perfil não encontrado. Verifique se confirmou o e-mail.'); setLoading(false); return; }
      setSuccessMsg('Acesso autorizado! Redirecionando...');
      setTimeout(() => navigate(Number(perfil.id_tipo_usuario) === 1 ? '/admin' : '/'), 1000);
    } catch (err) {
      setErrorMsg(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message);
    } finally { setLoading(false); }
  };

  return (
    <>
      <HeaderContato />
      <div className="cadastro-container">
        <div className="contact-card">
          <h2 className="card-title" style={{ color: '#8b5cf6' }}>Entrar no Studio Besouro</h2>
          {errorMsg && <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: 10, borderRadius: 8, marginBottom: 15, textAlign: 'center' }}>{errorMsg}</div>}
          {successMsg && <div style={{ color: '#16a34a', backgroundColor: '#dcfce7', padding: 10, borderRadius: 8, marginBottom: 15, textAlign: 'center' }}>{successMsg}</div>}
          <form onSubmit={handleLogin} className="cadastro-form">
            <input type="email" placeholder="Seu e-mail" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
            <div style={{ position: 'relative' }}>
              <input type={mostrarSenha ? 'text' : 'password'} placeholder="Sua senha" value={senha} onChange={e => setSenha(e.target.value)} required disabled={loading} style={{ width: '100%', paddingRight: 45 }} />
              <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8b5cf6', fontSize: '1rem' }}>
                {mostrarSenha ? '🙈' : '👁️'}
              </button>
            </div>
            <button type="submit" className="help-button" disabled={loading} style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none', width: '100%' }}>{loading ? 'Entrando...' : 'Entrar'}</button>
          </form>
          <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.9rem' }}>
            <p>Ainda não tem conta? <Link to="/cadastro" style={{ color: '#8b5cf6', fontWeight: 'bold' }}>Cadastre-se</Link></p>
          </div>
        </div>
      </div>
    </>
  );
}