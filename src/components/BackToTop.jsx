import { useEffect, useState } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import './BackToTop.css';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const sec = document.querySelector('.home-obras-section');
      if (!sec) { setVisible(window.scrollY > 600); return; }
      setVisible(sec.getBoundingClientRect().top < -300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const voltar = () => {
    const sec = document.querySelector('.home-obras-section');
    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  if (!visible) return null;
  return (
    <button className="back-to-top" onClick={voltar}>
      <FiArrowUp /><span>Topo</span>
    </button>
  );
}