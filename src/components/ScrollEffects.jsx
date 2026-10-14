import { useEffect, useRef } from 'react';

export default function ScrollEffects() {
  const fill = useRef(null);
  const dot = useRef(null);
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal, .reveal-stagger');
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        }
      }, { threshold: .1, rootMargin: '0px 0px -4% 0px' });
      elements.forEach(element => observer.observe(element));
    } else elements.forEach(element => element.classList.add('in-view'));
    function updateRail() {
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      const percent = distance > 0 ? Math.max(0, Math.min(window.scrollY / distance, 1)) * 100 : 0;
      fill.current.style.height = `${percent}%`;
      dot.current.style.top = `${percent}%`;
    }
    window.addEventListener('scroll', updateRail, { passive: true });
    window.addEventListener('resize', updateRail);
    updateRail();
    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', updateRail);
      window.removeEventListener('resize', updateRail);
    };
  }, []);
  return <div className="pulse-rail" aria-hidden="true"><div ref={fill} className="pulse-rail__fill" /><div ref={dot} className="pulse-rail__dot" /></div>;
}
