import { useEffect } from 'react';

export default function ScrollEffects() {
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
    return () => {
      observer?.disconnect();
    };
  }, []);
  return null;
}
