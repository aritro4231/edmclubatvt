import { useRef, useState } from 'react';
import { radioStations } from '../data';

function embedSource(url) {
  const params = new URLSearchParams({
    url,
    auto_play: 'false',
    color: '#191919',
    show_artwork: 'true',
    show_user: 'true',
    show_comments: 'false',
    visual: 'false',
    single_active: 'true',
  });
  return `https://w.soundcloud.com/player/?${params}`;
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
    <p className="section-sub reveal">Five DJs. Five frequencies. Choose a station and explore the sound.</p>

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

      <div id="radio-panel" className="radio-panel" role="tabpanel" aria-labelledby={`radio-tab-${station.id}`} tabIndex={0}>
        <img key={station.image} className="radio-artwork" src={station.image} alt={`${station.name} EDM Club member graphic`} loading="lazy" width="1000" height="1000" />
        <div className="radio-details">
          <div className="radio-details__topline"><span>Artist station</span><span>CH. {String(selectedIndex + 1).padStart(2, '0')} / 05</span></div>
          <h3 className="radio-name">{station.name}<span>Radio</span></h3>
          <p className="radio-description">Explore {station.name}’s artist station on SoundCloud.</p>
          <a className="btn btn--solid radio-listen" href={station.embedUrl || station.url} target="_blank" rel="noopener noreferrer" aria-label={`Listen to ${station.name} Radio on SoundCloud (opens a new tab)`}>Listen on SoundCloud <span aria-hidden="true">↗</span></a>
          <span className="radio-service">{station.embedUrl ? 'Play below or listen on SoundCloud.' : 'Opens in SoundCloud.'}</span>
        </div>
        {station.embedUrl && <iframe
          key={station.id}
          className="radio-player"
          title={`${station.name} Radio SoundCloud player`}
          src={embedSource(station.embedUrl)}
          allow="autoplay"
        />}
      </div>
      <p className="radio-announcement sr-only" role="status" aria-live="polite">{station.name} Radio selected.</p>
    </div>
  </section>;
}
