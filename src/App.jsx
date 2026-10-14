import AmbientBackground from './components/AmbientBackground';
import ScrollEffects from './components/ScrollEffects';
import Header from './components/Header';
import { Hero, Socials, Events, Board, Releases, Join, Footer } from './components/Sections';

export default function App() {
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <AmbientBackground />
    <Header />
    <main id="main"><Hero /><Socials /><Events /><Board /><Releases /><Join /></main>
    <Footer />
    <ScrollEffects />
  </>;
}
