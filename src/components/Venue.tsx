import { useState } from "react";
import { NEAR_AMENITIES, VENUE_MAP_URL } from "../data/content";
import "./Venue.css";

const TABS = ["Venue & Time", "Near Amenities"] as const;

export default function Venue() {
  const [active, setActive] = useState<(typeof TABS)[number]>(TABS[0]);

  return (
    <section id="venue" className="section venue">
      <div className="container venue__grid">
        <div className="venue__copy">
          <h1>Get Direction to the Event Hall</h1>

          <div className="venue__tabs">
            <div className="venue__tab-list">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  className={`venue__tab ${active === tab ? "is-active" : ""}`}
                  onClick={() => setActive(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="venue__tab-panel">
              {active === "Venue & Time" ? (
                <p>
                  <b>Date</b>: 25th April 2026
                  <br />
                  <b>Time</b>: 09:00 AM &ndash; 1:00 PM
                  <br />
                  <b>Location</b>: MBA Seminar Hall, Al Ameen Educational Campus, Hosur Main
                  Road, Opposite to Lalbagh Main Gate, Bengaluru-560027.
                </p>
              ) : (
                <ul className="venue__amenities">
                  {NEAR_AMENITIES.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="venue__map">
          <iframe
            src={VENUE_MAP_URL}
            title="Event venue map"
            loading="lazy"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
