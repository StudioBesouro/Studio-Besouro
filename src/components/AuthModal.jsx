import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleClose = () => { setEmail(''); setSenha(''); setErrorMsg(''); setSuccessMsg(''); setMostrarSenha(false); onClose(); };

  const handleLogin = async (e) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg(''); setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;
      const { data: perfil } = await supabase.from('usuario').select('id_tipo_usuario').eq('id_usuario', data.user.id).maybeSingle();
      setSuccessMsg('Acesso autorizado! Redirecionando...');
      setTimeout(() => { handleClose(); navigate(perfil && Number(perfil.id_tipo_usuario) === 1 ? '/admin' : '/'); }, 900);
    } catch (err) {
      setErrorMsg(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message);
    } finally { setLoading(false); }
  };

  const handleGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });

  if (!isOpen) return null;
  return (
    <div className="auth-overlay" onClick={handleClose}>
      <div className="auth-box" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={handleClose}><FiX /></button>
        <div className="auth-header">
          <div className="auth-logo-text"><span className="auth-green">Studio</span> <span className="auth-purple">Besouro</span></div>
          <p className="auth-subtitle">Entre na sua conta</p>
        </div>
        {errorMsg && <div className="auth-alert error">{errorMsg}</div>}
        {successMsg && <div className="auth-alert success">{successMsg}</div>}
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="auth-field"><label>E-mail</label><input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} /></div>
          <div className="auth-field"><label>Senha</label>
            <div className="pass-wrapper">
              <input type={mostrarSenha ? 'text' : 'password'} placeholder="••••••••" value={senha} onChange={e => setSenha(e.target.value)} required disabled={loading} />
              <button type="button" className="pass-toggle" onClick={() => setMostrarSenha(!mostrarSenha)}>{mostrarSenha ? <FiEyeOff /> : <FiEye />}</button>
            </div>
          </div>
          <button type="submit" className="auth-btn primary" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
          <div className="auth-divider"><span>ou</span></div>
          <button type="button" className="auth-btn google" onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Entrar com Google (IFMA)
          </button>
        </form>
      </div>
    </div>
  );
}