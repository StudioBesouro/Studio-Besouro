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

  const handleClose = () => { 
    setEmail(''); 
    setSenha(''); 
    setErrorMsg(''); 
    setSuccessMsg(''); 
    setMostrarSenha(false); 
    onClose(); 
  };

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setErrorMsg(''); 
    setSuccessMsg(''); 
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;
      const { data: perfil } = await supabase.from('usuario').select('id_tipo_usuario').eq('id_usuario', data.user.id).maybeSingle();
      setSuccessMsg('Acesso autorizado! Redirecionando...');
      setTimeout(() => { handleClose(); navigate(perfil && Number(perfil.id_tipo_usuario) === 1 ? '/admin' : '/'); }, 900);
    } catch (err) {
      setErrorMsg(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message);
    } finally { 
      setLoading(false); 
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg('Digite seu e-mail no campo acima para redefinir a senha.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSuccessMsg('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="auth-field">
            <label>E-mail</label>
            <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
          </div>
          <div className="auth-field">
            <label>Senha</label>
            <div className="pass-wrapper">
              <input type={mostrarSenha ? 'text' : 'password'} placeholder="••••••••" value={senha} onChange={e => setSenha(e.target.value)} required disabled={loading} />
              <button type="button" className="pass-toggle" onClick={() => setMostrarSenha(!mostrarSenha)}>{mostrarSenha ? <FiEyeOff /> : <FiEye />}</button>
            </div>
            <div style={{ textAlign: 'right', marginTop: '6px' }}>
              <button type="button" onClick={handleForgotPassword} style={{ background: 'none', border: 'none', color: '#9333ea', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}>
                Esqueceu a senha?
              </button>
            </div>
          </div>
          <button type="submit" className="auth-btn primary" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
      </div>
    </div>
  );
}