import { useEffect, useState } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import './BackToTop.css';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Exibe o botão após rolar 300px para baixo
      setVisible(window.scrollY > 300);
    };

    // Executa a checagem no carregamento inicial da página
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const voltar = () => {
    const sec = document.querySelector('.home-obras-section');
    if (sec) {
      // Se a seção existir, rola suavemente até ela
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Caso contrário, rola até o topo total da página
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!visible) return null;

  return (
    <button className="back-to-top" onClick={voltar} title="Voltar ao topo">
      <FiArrowUp />
      <span>Topo</span>
    </button>
  );
}