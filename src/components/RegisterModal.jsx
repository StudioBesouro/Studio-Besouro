import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { FiX, FiEye, FiEyeOff, FiCheck, FiAlertCircle } from 'react-icons/fi';
import './AuthModal.css';

const checkStrength = (s) => ({
  hasMinLength: s.length >= 8, hasUppercase: /[A-Z]/.test(s),
  hasLowercase: /[a-z]/.test(s), hasNumber: /[0-9]/.test(s),
  hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(s),
});
const isStrong = (s) => Object.values(s).every(Boolean);
const StrengthItem = ({ ok, label }) => (
  <div className={`strength-item ${ok ? 'ok' : ''}`}>
    {ok ? <FiCheck size={12} /> : <FiAlertCircle size={12} />}<span>{label}</span>
  </div>
);

export default function RegisterModal({ isOpen, onClose }) {
  const [nome, setNome] = useState(''); const [email, setEmail] = useState('');
  const [senha, setSenha] = useState(''); const [confirma, setConfirma] = useState('');
  const [mostrar, setMostrar] = useState(false); const [mostrarC, setMostrarC] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); const [successMsg, setSuccessMsg] = useState('');
  const strength = checkStrength(senha);

  const handleClose = () => { setNome(''); setEmail(''); setSenha(''); setConfirma(''); setErrorMsg(''); setSuccessMsg(''); onClose(); };

  const handleGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });

  const handleRegister = async (e) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
    if (senha !== confirma) { setErrorMsg('As senhas não conferem!'); return; }
    if (!isStrong(strength)) { setErrorMsg('A senha não atende aos requisitos de segurança.'); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password: senha, options: { data: { nome }, emailRedirectTo: window.location.origin + '/login' } });
    setLoading(false);
    if (error) setErrorMsg(error.message.includes('duplicate key') ? 'Esse e-mail já está cadastrado.' : error.message);
    else if (data.user) { setSuccessMsg('Cadastro realizado! Verifique seu e-mail para confirmar.'); setNome(''); setEmail(''); setSenha(''); setConfirma(''); }
  };

  if (!isOpen) return null;
  return (
    <div className="auth-overlay" onClick={handleClose}>
      <div className="auth-box" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={handleClose}><FiX /></button>
        <div className="auth-header">
          <div className="auth-logo-text"><span className="auth-green">Studio</span> <span className="auth-purple">Besouro</span></div>
          <p className="auth-subtitle">Criar conta de administrador</p>
        </div>
        {errorMsg && <div className="auth-alert error">{errorMsg}</div>}
        {successMsg && <div className="auth-alert success">{successMsg}</div>}
        <form className="auth-form" onSubmit={handleRegister}>
          <div className="auth-field"><label>Nome completo</label><input type="text" placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} required disabled={loading} /></div>
          <div className="auth-field"><label>E-mail</label><input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} /></div>
          <div className="auth-field"><label>Senha forte</label>
            <div className="pass-wrapper">
              <input type={mostrar ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={senha} onChange={e => setSenha(e.target.value)} required disabled={loading} />
              <button type="button" className="pass-toggle" onClick={() => setMostrar(!mostrar)}>{mostrar ? <FiEyeOff /> : <FiEye />}</button>
            </div>
            {senha.length > 0 && <div className="strength-grid">
              <StrengthItem ok={strength.hasMinLength} label="8+ caracteres" />
              <StrengthItem ok={strength.hasUppercase} label="Maiúscula" />
              <StrengthItem ok={strength.hasLowercase} label="Minúscula" />
              <StrengthItem ok={strength.hasNumber} label="Número" />
              <StrengthItem ok={strength.hasSpecial} label="Caractere especial" />
            </div>}
          </div>
          <div className="auth-field"><label>Confirmar senha</label>
            <div className="pass-wrapper">
              <input type={mostrarC ? 'text' : 'password'} placeholder="Repita a senha" value={confirma} onChange={e => setConfirma(e.target.value)} required disabled={loading} />
              <button type="button" className="pass-toggle" onClick={() => setMostrarC(!mostrarC)}>{mostrarC ? <FiEyeOff /> : <FiEye />}</button>
            </div>
          </div>
          <button type="submit" className="auth-btn primary" disabled={loading || (senha.length > 0 && !isStrong(strength))}>{loading ? 'Criando...' : 'Criar conta'}</button>
          <div className="auth-divider"><span>ou</span></div>
          <button type="button" className="auth-btn google" onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Cadastrar com Google (IFMA)
          </button>
        </form>
      </div>
    </div>
  );
}
