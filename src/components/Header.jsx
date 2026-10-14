import { useEffect, useRef, useState } from 'react';
import { club } from '../data';

export default function Header() {
  const [open, setOpen] = useState(false);
  const header = useRef(null);
  const toggle = useRef(null);
  useEffect(() => {
    if (!open) return;
    function onKey(event) {
      if (event.key === 'Escape') { setOpen(false); toggle.current.focus(); }
    }
    function onOutside(event) {
      if (!header.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onOutside);
    };
  }, [open]);
  return <header ref={header}>
    <a href="#top" className="brand" aria-label={`${club.name} — home`} onClick={() => setOpen(false)}>
      <img src={club.logo} alt="" className="brand__logo" />
      <span className="brand__text">EDM CLUB<small>AT VIRGINIA TECH</small></span>
    </a>
    <button ref={toggle} type="button" className="menu-toggle" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>{open ? 'Close ×' : 'Menu ☰'}</button>
    <nav id="main-navigation" className={`links ${open ? 'links--open' : ''}`} aria-label="Main navigation">
      {[['radio', 'Radio'], ['events', 'Events'], ['board', 'Exec Board'], ['releases', 'Releases'], ['forms', 'Forms'], ['join', 'Join']].map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>)}
    </nav>
  </header>;
}
