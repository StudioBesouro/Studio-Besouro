import { useState } from 'react';
import { FiGrid, FiX } from 'react-icons/fi';
import './ArtistaObras.css';
import './Modal.css';

const getImagens = (url) => {
  if (!url) return [];
  try { if (url.trim().startsWith('[')) { const a = JSON.parse(url); if (Array.isArray(a)) return a; } } catch {}
  return [url];
};

const tipo = (url) => {
  if (!url) return 'imagem';
  const u = url.split('?')[0].toLowerCase();
  if (u.endsWith('.pdf')) return 'pdf';
  if (['mp4','mov','webm','ogg','m4v'].some(e => u.endsWith(`.${e}`))) return 'video';
  return 'imagem';
};

export default function ArtistaObras({ obras, nomeArtista }) {
  const [selecionada, setSelecionada] = useState(null);
  const [carouselIdx, setCarouselIdx] = useState(0);

  const abrirObra = (obra) => { setSelecionada(obra); setCarouselIdx(0); };

  const renderMidia = (url, titulo, t, modal = false) => {
    if (t === 'video') return <video key={url+(modal?'-m':'-c')} src={modal?url:`${url}#t=0.1`} controls={modal} autoPlay={modal} muted={!modal} loop={modal} preload="metadata" playsInline style={{objectFit:'cover',width:'100%',height:'100%',display:'block'}} onContextMenu={e=>e.preventDefault()} />;
    if (t === 'pdf') {
      const limpa = `${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
      if (modal) return <div style={{width:'100%',height:'100%',minHeight:450,position:'relative'}}><div style={{position:'absolute',inset:0,zIndex:10}} onContextMenu={e=>e.preventDefault()} /><iframe src={limpa} title={titulo} style={{width:'100%',height:'100%',minHeight:450,border:'none'}} /></div>;
      return <div style={{width:'100%',height:'100%',overflow:'hidden',pointerEvents:'none'}}><iframe src={`${url}#page=1&toolbar=0&navpanes=0`} title={titulo} style={{width:'100%',height:'120%',border:'none'}} /></div>;
    }
    return <img src={url} alt={titulo} loading="lazy" draggable={false} onContextMenu={e=>e.preventDefault()} style={{objectFit:'cover',width:'100%',height:'100%',display:'block',userSelect:'none'}} />;
  };

  return (
    <section className="galeria-obras">
      <h2 className="titulo-galeria"><FiGrid /> Portfólio</h2>
      {obras.length > 0 ? (
        <div className="grid-obras-publica">
          {obras.map(obra => {
            const imgs = getImagens(obra.imagem_url);
            const t = tipo(imgs[0] || obra.imagem_url);
            return (
              <div key={obra.id_obra} className="card-obra-viva" onClick={() => abrirObra(obra)}>
                <div className="img-container" style={{ position: 'relative' }}>
                  {renderMidia(imgs[0], obra.titulo, t, false)}
                  {imgs.length > 1 && <div style={{position:'absolute',top:8,right:8,background:'rgba(0,0,0,0.55)',color:'white',fontSize:'0.65rem',fontWeight:700,padding:'2px 8px',borderRadius:99}}>{imgs.length} fotos</div>}
                </div>
                <div className="info-obra"><h4>{obra.titulo}</h4><p>{obra.descricao?.substring(0,60)}...</p></div>
              </div>
            );
          })}
        </div>
      ) : <div className="aviso-vazio">Este artista ainda não possui obras.</div>}

      {selecionada && (() => {
        const imgs = getImagens(selecionada.imagem_url);
        const src = imgs[carouselIdx] || imgs[0];
        const t = tipo(src);
        return (
          <div className="modal-overlay" onClick={() => setSelecionada(null)} onContextMenu={e=>e.preventDefault()}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelecionada(null)}><FiX /></button>
              <div className="modal-body">
                <div className="modal-image-container" style={{ background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {renderMidia(src, selecionada.titulo, t, true)}
                  {imgs.length > 1 && <>
                    <button onClick={e=>{e.stopPropagation();setCarouselIdx(i=>(i-1+imgs.length)%imgs.length);}} style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',background:'rgba(0,0,0,0.5)',color:'white',border:'none',borderRadius:'50%',width:32,height:32,cursor:'pointer',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center',zIndex:10}}>‹</button>
                    <button onClick={e=>{e.stopPropagation();setCarouselIdx(i=>(i+1)%imgs.length);}} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'rgba(0,0,0,0.5)',color:'white',border:'none',borderRadius:'50%',width:32,height:32,cursor:'pointer',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center',zIndex:10}}>›</button>
                    <div style={{position:'absolute',bottom:8,left:'50%',transform:'translateX(-50%)',display:'flex',gap:5,zIndex:10}}>
                      {imgs.map((_,i)=><button key={i} onClick={e=>{e.stopPropagation();setCarouselIdx(i);}} style={{width:7,height:7,borderRadius:'50%',background:i===carouselIdx?'white':'rgba(255,255,255,0.4)',border:'none',padding:0,cursor:'pointer'}} />)}
                    </div>
                  </>}
                </div>
                <div className="modal-info" style={{ background: '#fff' }}>
                  <h2>{selecionada.titulo}</h2>
                  <div className="modal-meta"><span>por <strong>{nomeArtista}</strong></span></div>
                  <p className="modal-description">{selecionada.descricao || 'Sem descrição.'}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}