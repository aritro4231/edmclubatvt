import AmbientBackground from './components/AmbientBackground';
import ScrollEffects from './components/ScrollEffects';
import Header from './components/Header';
import ClubRadio from './components/ClubRadio';
import { Hero, Socials, Events, Board, Join, Footer } from './components/Sections';
import Releases from './components/Releases';

export default function App() {
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <AmbientBackground />
    <Header />
    <main id="main"><Hero /><ClubRadio /><Socials /><Events /><Board /><Releases /><Join /></main>
    <Footer />
    <ScrollEffects />
  </>;
}
