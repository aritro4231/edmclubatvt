import { useState } from 'react';
import { board, club, events, socials } from '../data';
import SocialIcon from './SocialIcon';

function ExternalLink({ children, ...props }) {
  return <a {...props} target="_blank" rel="noopener noreferrer">{children}</a>;
}

function SectionHeading({ eyebrow, title, children }) {
  return <><div className="eyebrow reveal">{eyebrow}</div><h2 className="section-title reveal">{title}</h2><p className="section-sub reveal">{children}</p></>;
}

function AssetImage({ src, fallback, ...props }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? <img {...props} src={src} onError={() => setFailed(true)} loading="lazy" /> : fallback;
}

export function Hero() {
  return <section className="hero" id="top">
    <div className="hero__index"><span>Blacksburg, VA / Virginia Tech</span><span>Underground Renaissance</span></div>
    <div className="hero__bottom">
      <div className="hero__art">
        <div className="club-seal">
          <div className="club-seal__stars" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <span key={index} style={{ '--angle': `${index * 30}deg` }}>★</span>)}</div>
          <img src={club.logo} alt="EDM Club — Vol. 02, Underground Renaissance" />
        </div>
        <span className="hero__art-caption">One community. All frequencies.</span>
      </div>
      <div className="hero__content">
        <h1 className="hero__eyebrow">Bringing PLUR to Blacksburg</h1>
        <p className="hero__tag">Hosting shows, workshops, and elevating the EDM scene in Blacksburg. Will you rave with us?</p>
        <div className="hero__cta-row"><a href="#join" className="btn btn--solid">Join the club <span aria-hidden="true">↗</span></a><a href="#events" className="btn btn--ghost">Explore our events <span aria-hidden="true">↓</span></a></div>
        <a className="hero__radio-link" href="#radio">Tune into Club Radio <span aria-hidden="true">↓</span></a>
      </div>
    </div>
    <a href="#events" className="scroll-cue"><span>Enter the scene</span><span aria-hidden="true">↓</span></a>
  </section>;
}

export function Socials() {
  return <section id="socials">
    <SectionHeading eyebrow="Find us" title="Follow the sound.">Sets, event details, and community updates all on our socials. Follow us to stay up-to-date with EDM Club.</SectionHeading>
    <div className="social-grid reveal-stagger">{socials.map(social => <ExternalLink key={social.name} href={social.url} className="social-card">
      <SocialIcon name={social.icon} /><h3>{social.name}</h3><p>{social.description}</p><span className="arrow">{social.label} <span aria-hidden="true">↗</span></span>
    </ExternalLink>)}</div>
  </section>;
}

function EventCard({ event }) {
  const content = <>
    <AssetImage src={event.poster} className="event-card__poster" alt={`${event.name} poster`} fallback={<div className={`event-poster event-poster--${event.id}`}><span className="event-poster__club">EDM CLUB / VIRGINIA TECH</span><span className="event-poster__type">{event.type}</span><span className="event-poster__name">{event.name}</span><span className="event-poster__date">{event.date}<small>{event.location}</small></span></div>} />
    <div className="event-card__body"><div className="event-card__date">{event.date} · {event.time}</div><h3 className="event-card__name">{event.name}</h3><p className="event-card__loc">{event.location}</p></div>
  </>;
  return event.url ? <ExternalLink className="event-card" href={event.url}>{content}</ExternalLink> : <article className="event-card">{content}</article>;
}

export function Events() {
  return <section id="events">
    <SectionHeading eyebrow="Club highlights" title="Club events.">Shows, workshops, and meetings that bring our community together. Follow our socials for upcoming dates.</SectionHeading>
    <div className="events-grid reveal-stagger">{events.map(event => <EventCard key={event.id} event={event} />)}</div>
  </section>;
}

export function Board() {
  return <section id="board">
    <SectionHeading eyebrow="Executive Board" title="Meet the board.">Keeping the club alive with enthusiasm and collaboration.</SectionHeading>
    <div className="board-grid reveal-stagger">{board.map(member => <article className="board-card" key={member.name}>
      <div className="board-card__photo-wrap"><AssetImage className="board-card__photo" src={member.image} alt={`${member.name}, “${member.alias}”, ${member.role}`} fallback={<div className="portrait-fallback" aria-hidden="true">{member.name.split(' ').map(part => part[0]).join('')}</div>} /></div>
      <h3 className="board-card__name">{member.name}<span className="board-card__alias">“{member.alias}”</span></h3><p className="board-card__role">{member.role}</p>
    </article>)}</div>
  </section>;
}

export function Forms() {
  return <section id="forms">
    <SectionHeading eyebrow="Forms & opportunities" title="Get involved.">Need equipment or want to get behind the decks? Start here.</SectionHeading>
    <div className="forms-grid reveal-stagger">
      <article className="form-card">
        <span className="form-card__label">01 / Equipment</span>
        <h3>Equipment rental</h3>
        <p>Request equipment from EDM Club through our rental form.</p>
        <ExternalLink href={club.equipmentRentalUrl} className="btn btn--solid">Equipment rental form <span aria-hidden="true">↗</span></ExternalLink>
      </article>
      <article className="form-card">
        <span className="form-card__label">02 / Behind the decks</span>
        <h3>Want to play a set with EDM Club?</h3>
        <p>Send your set to @edmclubatvt on Instagram. We want to hear your sound.</p>
        <ExternalLink href={club.instagramUrl} className="btn btn--ghost">Send us your set <span aria-hidden="true">↗</span></ExternalLink>
      </article>
    </div>
  </section>;
}

export function Join() {
  return <section className="join" id="join"><div className="eyebrow reveal" style={{ justifyContent: 'center' }}>Membership</div><h2 className="join__title reveal">Come make <span className="accent">noise</span> with us.</h2><p className="join__sub reveal">No experience needed, just show up. Sign up through GobblerConnect to get on the list for meetings and events.</p><ExternalLink href={club.joinUrl} className="btn btn--solid reveal">Join on GobblerConnect <span aria-hidden="true">↗</span></ExternalLink></section>;
}

export function Footer() {
  return <footer><a href="#top">© {new Date().getFullYear()} {club.name}</a><span>Built by the club, for the club.</span></footer>;
}

