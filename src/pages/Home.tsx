import AboutOrganizer from "../components/AboutOrganizer";
import AboutProgram from "../components/AboutProgram";
import CtaBanner from "../components/CtaBanner";
import Footer from "../components/Footer";
import Gallery from "../components/Gallery";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Schedule from "../components/Schedule";
import Speakers from "../components/Speakers";
import Stats from "../components/Stats";
import Venue from "../components/Venue";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <AboutProgram />
        <Stats />
        <Schedule />
        <AboutOrganizer />
        <Gallery />
        <Speakers />
        <Venue />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}