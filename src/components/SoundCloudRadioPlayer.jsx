import { useLayoutEffect, useRef, useState } from 'react';

let widgetApiPromise;
function loadWidgetApi() {
  if (window.SC?.Widget) return Promise.resolve(window.SC.Widget);
  if (!widgetApiPromise) widgetApiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://w.soundcloud.com/player/api.js';
    script.async = true;
    script.onload = () => window.SC?.Widget ? resolve(window.SC.Widget) : reject(new Error('Player controls unavailable'));
    script.onerror = () => { script.remove(); widgetApiPromise = undefined; reject(new Error('Player controls unavailable')); };
    document.head.appendChild(script);
  });
  return widgetApiPromise;
}
function playerSource(url) {
  return `https://w.soundcloud.com/player/?${new URLSearchParams({ url, auto_play: 'false', color: '#191919', show_artwork: 'true', show_user: 'true', show_comments: 'false', visual: 'false', single_active: 'true' })}`;
}
function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function SoundCloudRadioPlayer({ station, queue, index, total }) {
  const iframe = useRef(null);
  const widget = useRef(null);
  const goTo = useRef(null);
  const playingRef = useRef(false);
  const volumeRef = useRef(75);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(75);
  const [error, setError] = useState('');

  useLayoutEffect(() => {
    let active = true, currentIndex = 0, epoch = 0, acceptingProgress = false, player, events;
    const frameElement = iframe.current;
    const startupTimeout = window.setTimeout(() => { if (active) setError('Use the SoundCloud player below while the controls load.'); }, 20000);
    loadWidgetApi().then(Widget => {
      if (!active) return;
      events = Widget.Events;
      player = Widget(frameElement);
      widget.current = player;
      function updateTrack(markPlayerReady = false) {
        const requestEpoch = epoch;
        const expectedId = queue.tracks[currentIndex].id;
        player.getCurrentSound(sound => {
          if (!active || requestEpoch !== epoch || String(sound?.id) !== expectedId) return;
          setTrack(sound);
          if (markPlayerReady) {
            window.clearTimeout(startupTimeout);
            acceptingProgress = true;
            setReady(true);
            setError('');
          }
          player.getDuration(value => { if (active && requestEpoch === epoch) setDuration(value || 0); });
        });
      }
      function markReady() {
        if (!active) return;
        player.setVolume(volumeRef.current);
        updateTrack(true);
      }
      function loadTrack(nextIndex, autoplay) {
        if (!active || nextIndex < 0 || nextIndex >= queue.tracks.length) return;
        currentIndex = nextIndex;
        epoch++;
        acceptingProgress = false;
        setTrackIndex(nextIndex);
        setReady(false);
        setTrack(null);
        setPosition(0);
        setDuration(0);
        setError('');
        setPlaying(false);
        playingRef.current = false;
        player.load(queue.tracks[nextIndex].embedUrl, { auto_play: autoplay, show_artwork: true, show_user: true, show_comments: false, visual: false, callback: markReady });
      }
      goTo.current = loadTrack;
      player.bind(events.READY, markReady);
      player.bind(events.PLAY, () => {
        if (!active) return;
        setPlaying(true);
        playingRef.current = true;
        setError('');
        updateTrack();
      });
      player.bind(events.PAUSE, () => { if (active) { setPlaying(false); playingRef.current = false; } });
      player.bind(events.FINISH, () => {
        if (!active) return;
        setPlaying(false);
        playingRef.current = false;
        if (currentIndex + 1 < queue.tracks.length) loadTrack(currentIndex + 1, true);
      });
      player.bind(events.PLAY_PROGRESS, progress => { if (active && acceptingProgress) setPosition(progress.currentPosition || 0); });
      player.bind(events.SEEK, progress => { if (active && acceptingProgress) setPosition(progress.currentPosition || 0); });
      player.bind(events.ERROR, () => {
        if (!active) return;
        window.clearTimeout(startupTimeout);
        setReady(true);
        setPlaying(false);
        playingRef.current = false;
        setError('This track couldn’t play. Use Next to try another station track.');
      });
    }).catch(() => {
      if (active) { window.clearTimeout(startupTimeout); setError('You can still press Play in the SoundCloud player below.'); }
    });
    return () => {
      active = false;
      window.clearTimeout(startupTimeout);
      if (player && events && frameElement.contentWindow) {
        for (const name of ['READY', 'PLAY', 'PAUSE', 'FINISH', 'PLAY_PROGRESS', 'SEEK', 'ERROR']) player.unbind(events[name]);
        player.pause();
      }
      widget.current = null;
      goTo.current = null;
    };
  }, [queue]);

  function changeVolume(event) {
    const value = Number(event.target.value);
    volumeRef.current = value;
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
      <div className="radio-details__topline"><span>{queue.kind === 'likes' ? 'Public likes' : queue.kind === 'uploads' ? 'Artist uploads' : 'Recommendation station'}</span><span>CH. {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span></div>
      <h3 className="radio-name">{station.name}<span>Radio</span></h3>
      <p className="radio-description">{queue.kind === 'likes' ? `${queue.tracks.length} recent public tracks liked by ${station.name} on SoundCloud.` : queue.kind === 'uploads' ? `${queue.tracks.length} recent tracks uploaded by ${station.name} on SoundCloud.` : `SoundCloud’s artist station based on ${station.name}. ${queue.tracks.length} tracks, including related artists.`}</p>
      <div className="radio-transport">
        <button type="button" className="btn btn--solid radio-play" disabled={!ready || Boolean(error)} onClick={() => widget.current?.toggle()} aria-label={`${playing ? 'Pause' : 'Play'} ${station.name} Radio`}>
          <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>{!ready ? 'Loading player…' : playing ? 'Pause' : 'Play'}
        </button>
        <div className="radio-track-buttons">
          <button type="button" aria-label="Previous track" disabled={!ready || trackIndex === 0} onClick={() => goTo.current?.(trackIndex - 1, playingRef.current)}>‹</button>
          <button type="button" aria-label="Next track" disabled={!ready || trackIndex >= queue.tracks.length - 1} onClick={() => goTo.current?.(trackIndex + 1, playingRef.current)}>›</button>
        </div>
      </div>
      <p className="radio-now-playing" aria-live="polite">{track?.title || 'Loading station track…'}</p>
      {track?.user?.username && <p className="radio-track-artist">{track.user.username}</p>}
      <p className="radio-track-count">Track {trackIndex + 1} of {queue.tracks.length}{queue.stale ? ' · Saved station queue' : ''}</p>
      <div className="radio-progress"><span>{formatTime(position)}</span><input type="range" aria-label="Playback position" min="0" max={duration || 1} step="1000" value={Math.min(position, duration || 0)} onChange={seek} disabled={!ready || !duration} /><span>{formatTime(duration)}</span></div>
      <label className="radio-volume">Volume<input type="range" aria-label="Radio volume" min="0" max="100" value={volume} onChange={changeVolume} disabled={!ready} /></label>
      {error && <p className="radio-service" role="status">{error}</p>}
    </div>
    <iframe ref={iframe} className="radio-player" title={`${station.name} Radio SoundCloud player`} src={playerSource(queue.tracks[0].embedUrl)} allow="autoplay" />
  </div>;
}
