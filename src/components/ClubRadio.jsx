import { useEffect, useRef, useState } from 'react';
import { radioStations } from '../data';
import SoundCloudRadioPlayer from './SoundCloudRadioPlayer';

function StationChannel({ station, index, total }) {
  const [queue, setQueue] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    const timeout = setTimeout(() => { setError(true); controller.abort(); }, 15000);
    fetch(`/api/radio/${station.id}`, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('Station unavailable');
      const data = await response.json();
      if (!data.tracks?.length) throw new Error('Station empty');
      if (!controller.signal.aborted) setQueue(data);
    }).catch(() => { if (!controller.signal.aborted) setError(true); else if (controller.signal.reason?.name === 'TimeoutError') setError(true); }).finally(() => clearTimeout(timeout));
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [station.id, attempt]);
  if (queue) return <SoundCloudRadioPlayer station={station} queue={queue} index={index} total={total} />;
  return <div id="radio-panel" className="radio-loading" role="tabpanel" aria-labelledby={`radio-tab-${station.id}`}>
    <p role="status">{error ? 'This station is temporarily unavailable.' : `Loading ${station.name}’s ${station.kind === 'likes' ? 'liked tracks' : station.kind === 'uploads' ? 'uploaded tracks' : station.kind === 'playlist' ? 'playlist' : 'recommendation station'}…`}</p>
    {error && <button type="button" className="btn btn--ghost" onClick={() => setAttempt(attempt + 1)}>Retry station</button>}
  </div>;
}

export default function ClubRadio() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const tabs = useRef([]);
  const station = radioStations[selectedIndex];

  function handleKey(event, index) {
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % radioStations.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + radioStations.length) % radioStations.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = radioStations.length - 1;
    else return;
    event.preventDefault();
    setSelectedIndex(nextIndex);
    tabs.current[nextIndex]?.focus();
  }

  return <section id="radio" className="club-radio">
    <div className="eyebrow reveal">Tune in</div>
    <h2 className="section-title reveal">Club Radio.</h2>
    <p className="section-sub reveal">Six DJs. Six frequencies. Choose a station and explore the sound.</p>

    <div className="radio-console reveal">
      <div className="radio-stations" role="tablist" aria-label="Choose a Club Radio station">
        {radioStations.map((item, index) => <button
          key={item.id}
          ref={element => { tabs.current[index] = element; }}
          id={`radio-tab-${item.id}`}
          type="button"
          role="tab"
          aria-selected={index === selectedIndex}
          aria-controls="radio-panel"
          tabIndex={index === selectedIndex ? 0 : -1}
          className="radio-station"
          onClick={() => setSelectedIndex(index)}
          onKeyDown={event => handleKey(event, index)}
        ><span className="radio-station__number">{String(index + 1).padStart(2, '0')}</span>{item.name}<span className="radio-station__light" aria-hidden="true" /></button>)}
      </div>

      <StationChannel key={station.id} station={station} index={selectedIndex} total={radioStations.length} />
      <p className="radio-announcement sr-only" role="status" aria-live="polite">{station.name} Radio selected.</p>
    </div>
  </section>;
}
