import { useEffect, useRef, useState } from 'react';

export default function Releases() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [activeId, setActiveId] = useState(null);
  const retained = useRef([]);
  useEffect(() => {
    const controller = new AbortController();
    let loading = false;
    async function refresh() {
      if (loading || document.hidden) return;
      loading = true;
      try {
        const response = await fetch('/api/releases', { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw new Error('Feed unavailable');
        const data = await response.json();
        if (!controller.signal.aborted) {
          retained.current = data.releases || [];
          setItems(retained.current);
          setStatus(data.status);
        }
      } catch {
        if (!controller.signal.aborted) setStatus(retained.current.length ? 'stale' : 'unavailable');
      } finally { loading = false; }
    }
    refresh();
    const interval = setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', refresh);
    return () => { controller.abort(); clearInterval(interval); document.removeEventListener('visibilitychange', refresh); };
  }, []);

  return <section id="releases">
    <div className="eyebrow reveal">Fresh IDs</div>
    <h2 className="section-title reveal">New releases from our members.</h2>
    <p className="section-sub reveal">Tracks and mixes shared in our club’s music-self-promo channel. Show your support.</p>
    <div className="release-list reveal-stagger">
      {!items.length && <p className="release-empty" role="status">{status === 'loading' ? 'Loading member releases…' : status === 'unavailable' ? 'Releases are temporarily unavailable. Check back soon.' : 'New member releases are coming soon.'}</p>}
      {items.map((release, index) => <article key={release.id} className="release-entry">
        <div className="release-row">
          <span className="release-row__num">{String(index + 1).padStart(2, '0')}</span>
          {release.artwork ? <img className="release-row__art" src={release.artwork} alt="" loading="lazy" /> : <span className="release-art" aria-hidden="true">♫</span>}
          <div className="release-row__meta"><h3 className="release-row__title">{release.title}</h3><p className="release-row__artist">{release.artist} · {release.provider}</p></div>
          {release.embedUrl ? <button type="button" className="release-row__play" aria-label={`${activeId === release.id ? 'Close player for' : 'Play'} ${release.title}`} aria-expanded={activeId === release.id} onClick={() => setActiveId(activeId === release.id ? null : release.id)}>{activeId === release.id ? '×' : '▶'}</button> : <a className="release-row__play" href={release.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${release.title} on ${release.provider}`}>↗</a>}
        </div>
        {activeId === release.id && release.embedUrl && <iframe className={`release-player release-player--${release.provider.toLowerCase()}`} title={`${release.title} player`} src={release.embedUrl} allow="autoplay; encrypted-media" />}
      </article>)}
    </div>
  </section>;
}
