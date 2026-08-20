import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HeaderContato from '../components/HeaderContato';
import './Contato.css';
import emailjs from '@emailjs/browser';

const Contato = () => {
  const [formData, setFormData] = useState({
    nome: "", 
    email: "", 
    assunto: "", 
    mensagem: ""
  });

  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    // Se o usuário voltar a digitar, removemos a mensagem de sucesso da tela
    if (success) setSuccess(false); 
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);
    setSuccess(false);

    emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        from_name: formData.nome,
        email: formData.email,
        assunto: formData.assunto,
        message: formData.mensagem,
        time: new Date().toLocaleString('pt-BR')
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    )
    .then(() => {
      setSuccess(true);
      setFormData({ nome: "", email: "", assunto: "", mensagem: "" });
    })
    .catch((error) => {
      console.error("Erro:", error);
      alert("❌ Erro ao enviar. Verifique o console (F12)");
    })
    .finally(() => {
      setIsSending(false);
    });
  };

  return (
    <div className="contato-container">
      <HeaderContato />
      
      <section className="contato-hero">
        <div className="hero-inner">
          <h1 className="hero-title">Fale conosco</h1>
          <p className="hero-subtitle">Envie sua mensagem e respondemos rápido</p>
        </div>
        <svg className="hero-curve" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,0 C480,100 960,100 1440,0 L1440,100 L0,100 Z" fill="#ffffff"/>
        </svg>
      </section>

      <main className="contato-content">
        <div className="content-grid">
          <div className="form-column">
            <div className="card">
              <h2 className="card-title">Envie sua mensagem</h2>

              {/* MENSAGEM DE SUCESSO PERSONALIZADA */}
              {success && (
                <div className="success-banner">
                  <span className="success-icon">✅</span>
                  <p>SUA MENSAGEM FOI ENVIADA! <br /> 
                  <strong>ESPERE E VERIFIQUE O SEU EMAIL</strong></p>
                </div>
              )}

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nome</label>
                  <input name="nome" type="text" placeholder="Seu nome completo" value={formData.nome} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="email" placeholder="seu.email@exemplo.com" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Tipo de assunto</label>
                  <select name="assunto" value={formData.assunto} onChange={handleChange} required>
                    <option value="">Selecione uma opção</option>
                    {/* ADICIONADO: Nova opção para os artistas do Studio Besouro */}
                    <option value="Participar do projeto como artista">Participar do projeto como artista</option>
                    <option value="Dúvida">Dúvida</option>
                    <option value="Sugestão">Sugestão</option>
                    <option value="Problema Técnico">Problema Técnico</option>
                    <option value="Colaboração">Colaboração</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Mensagem</label>
                  <textarea name="mensagem" placeholder="Digite sua mensagem aqui..." rows={6} value={formData.mensagem} onChange={handleChange} required />
                </div>

                <button type="submit" className="btn-enviar" disabled={isSending}>
                  {isSending ? "Enviando..." : "Enviar mensagem →"}
                </button>
              </form>
            </div>
          </div>

          <div className="info-column">
            <div className="card admin-card">
              <h3 className="admin-title">Quer fazer parte?</h3>
              <p className="admin-subtitle">Ajude a construir e melhorar a plataforma</p>
              <ul className="benefits-list">
                <li><span className="b-icon yellow">✨</span> Compartilhe conhecimento</li>
                <li><span className="b-icon purple">👥</span> Participe da equipe</li>
                <li><span className="b-icon blue">💙</span> Contribua com a inclusão</li>
              </ul>
              <Link to="/cadastro" className="btn-admin">Quero ser administrador</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contato;