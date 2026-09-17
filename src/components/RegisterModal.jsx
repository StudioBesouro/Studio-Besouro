import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { FiX, FiEye, FiEyeOff, FiCheck, FiAlertCircle } from 'react-icons/fi';
import './AuthModal.css';

const checkStrength = (s) => ({
  hasMinLength: s.length >= 8, 
  hasUppercase: /[A-Z]/.test(s),
  hasLowercase: /[a-z]/.test(s), 
  hasNumber: /[0-9]/.test(s),
  hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(s),
});
const isStrong = (s) => Object.values(s).every(Boolean);
const StrengthItem = ({ ok, label }) => (
  <div className={`strength-item ${ok ? 'ok' : ''}`}>
    {ok ? <FiCheck size={12} /> : <FiAlertCircle size={12} />}<span>{label}</span>
  </div>
);

export default function RegisterModal({ isOpen, onClose }) {
  const [nome, setNome] = useState(''); 
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState(''); 
  const [confirma, setConfirma] = useState('');
  const [mostrar, setMostrar] = useState(false); 
  const [mostrarC, setMostrarC] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); 
  const [successMsg, setSuccessMsg] = useState('');
  const strength = checkStrength(senha);

  const handleClose = () => { setNome(''); setEmail(''); setSenha(''); setConfirma(''); setErrorMsg(''); setSuccessMsg(''); onClose(); };

  const handleRegister = async (e) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
    if (senha !== confirma) { setErrorMsg('As senhas não conferem!'); return; }
    if (!isStrong(strength)) { setErrorMsg('A senha não atende aos requisitos de segurança.'); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password: senha, 
      options: { data: { nome }, emailRedirectTo: window.location.origin + '/login' } 
    });
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
        </form>
      </div>
    </div>
  );
}