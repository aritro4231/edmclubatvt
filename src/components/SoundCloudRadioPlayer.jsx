import { useLayoutEffect, useRef, useState } from 'react';

let widgetApiPromise;
function loadWidgetApi() {
  if (window.SC?.Widget) return Promise.resolve(window.SC.Widget);
  if (!widgetApiPromise) {
    widgetApiPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.async = true;
      script.onload = () => window.SC?.Widget ? resolve(window.SC.Widget) : reject(new Error('Player controls unavailable'));
      script.onerror = () => { script.remove(); widgetApiPromise = undefined; reject(new Error('Player controls unavailable')); };
      document.head.appendChild(script);
    });
  }
  return widgetApiPromise;
}

function playerSource(url) {
  const params = new URLSearchParams({ url, auto_play: 'false', color: '#191919', show_artwork: 'true', show_user: 'true', show_comments: 'false', visual: 'false', single_active: 'true' });
  return `https://w.soundcloud.com/player/?${params}`;
}

function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function SoundCloudRadioPlayer({ station, index, total }) {
  const iframe = useRef(null);
  const widget = useRef(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [trackCount, setTrackCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(75);
  const [error, setError] = useState('');

  useLayoutEffect(() => {
    let active = true;
    const frameElement = iframe.current;
    let player;
    let events;
    const startupTimeout = window.setTimeout(() => {
      if (active) setError('Use the SoundCloud player below while the controls load.');
    }, 20000);
    loadWidgetApi().then(Widget => {
      if (!active) return;
      events = Widget.Events;
      player = Widget(frameElement);
      widget.current = player;

      function updateTrack() {
        player.getCurrentSound(sound => { if (active) setTrack(sound); });
        player.getDuration(value => { if (active) setDuration(value || 0); });
        player.getCurrentSoundIndex(value => { if (active) setTrackIndex(value || 0); });
      }
      player.bind(events.READY, () => {
        if (!active) return;
        window.clearTimeout(startupTimeout);
        setReady(true);
        setError('');
        player.setVolume(75);
        player.getSounds(sounds => { if (active) setTrackCount(sounds?.length || 0); });
        updateTrack();
      });
      player.bind(events.PLAY, () => {
        if (!active) return;
        setPlaying(true);
        setError('');
        updateTrack();
      });
      player.bind(events.PAUSE, () => { if (active) setPlaying(false); });
      player.bind(events.FINISH, () => { if (active) setPlaying(false); });
      player.bind(events.PLAY_PROGRESS, progress => { if (active) setPosition(progress.currentPosition || 0); });
      player.bind(events.SEEK, progress => { if (active) setPosition(progress.currentPosition || 0); });
      player.bind(events.ERROR, () => {
        if (!active) return;
        window.clearTimeout(startupTimeout);
        setPlaying(false);
        setError('This track couldn’t play. Try another track in the player below.');
      });
    }).catch(() => {
      if (active) {
        window.clearTimeout(startupTimeout);
        setError('You can still press Play in the SoundCloud player below.');
      }
    });
    return () => {
      active = false;
      window.clearTimeout(startupTimeout);
      // Widget cleanup posts messages. Run before React removes the iframe.
      if (player && events && frameElement.contentWindow) {
        for (const name of ['READY', 'PLAY', 'PAUSE', 'FINISH', 'PLAY_PROGRESS', 'SEEK', 'ERROR']) player.unbind(events[name]);
        player.pause();
      }
      widget.current = null;
    };
  }, [station.embedUrl]);

  function changeVolume(event) {
    const value = Number(event.target.value);
    setVolume(value);
    widget.current?.setVolume(value);
  }
  function seek(event) {
    const value = Number(event.target.value);
    setPosition(value);
    widget.current?.seekTo(value);
  }

  return <div id="radio-panel" className="radio-panel" role="tabpanel" aria-labelledby={`radio-tab-${station.id}`} tabIndex={0}>
    <img className="radio-artwork" src={station.image} alt={`${station.name} EDM Club member graphic`} loading="lazy" width="1000" height="1000" />
    <div className="radio-details">
      <div className="radio-details__topline"><span>Member tracks & mixes</span><span>CH. {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span></div>
      <h3 className="radio-name">{station.name}<span>Radio</span></h3>
      <p className="radio-description">Tracks and mixes uploaded by {station.name}. Press Play to listen here.</p>
      <div className="radio-transport">
        <button type="button" className="btn btn--solid radio-play" disabled={!ready} onClick={() => widget.current?.toggle()} aria-label={`${playing ? 'Pause' : 'Play'} ${station.name} Radio`}>
          <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>{!ready ? 'Loading player…' : playing ? 'Pause' : 'Play'}
        </button>
        {trackCount > 1 && <div className="radio-track-buttons">
          <button type="button" aria-label="Previous track" disabled={!ready || trackIndex === 0} onClick={() => widget.current?.prev()}>‹</button>
          <button type="button" aria-label="Next track" disabled={!ready || trackIndex >= trackCount - 1} onClick={() => widget.current?.next()}>›</button>
        </div>}
      </div>
      <p className="radio-now-playing" aria-live="polite">{track?.title || `Loading ${station.name}’s tracks…`}</p>
      <div className="radio-progress"><span>{formatTime(position)}</span><input type="range" aria-label="Playback position" min="0" max={duration || 1} step="1000" value={Math.min(position, duration || 0)} onChange={seek} disabled={!ready || !duration} /><span>{formatTime(duration)}</span></div>
      <label className="radio-volume">Volume<input type="range" aria-label="Radio volume" min="0" max="100" value={volume} onChange={changeVolume} disabled={!ready} /></label>
      {error && <p className="radio-service" role="status">{error}</p>}
    </div>
    <iframe ref={iframe} className="radio-player" title={`${station.name} Radio SoundCloud player`} src={playerSource(station.embedUrl)} allow="autoplay" />
  </div>;
}
