import { SPEAKERS } from "../data/content";
import "./Speakers.css";

export default function Speakers() {
  return (
    <section id="speakers" className="section speakers">
      <div className="container">
        <div className="section-heading">
          <h2>Speakers Of Event On 23rd Aug-2025</h2>
        </div>

        <div className="speakers__grid">
          {SPEAKERS.map((speaker) => (
            <div className="speaker-card" key={speaker.name}>
              <div className="speaker-card__photo">
                <img src={speaker.photo} alt={speaker.name} loading="lazy" />
              </div>
              <div className="speaker-card__name">{speaker.name}</div>
              <div className="speaker-card__role">{speaker.role}</div>
            </div>
          ))}
        </div>

        <div className="speakers__more">
          <a className="btn btn-outline" href="/#speakers">
            Know More About Speakers
          </a>
        </div>
      </div>
    </section>
  );
}
