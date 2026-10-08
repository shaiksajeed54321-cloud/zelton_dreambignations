import { useState } from "react";
import { NEAR_AMENITIES } from "../data/content";
import { useEventInfo } from "../lib/eventInfo";
import "./Venue.css";

const TABS = ["Venue & Time", "Near Amenities"] as const;

export default function Venue() {
  const event = useEventInfo();
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
                  type="button"
                  role="tab"
                  aria-selected={active === tab}
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
                  <b>Date</b>: {event.dateOrdinal}
                  <br />
                  <b>Time</b>: {event.timeRange}
                  <br />
                  <b>Location</b>: {event.venueName}, {event.address}.
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

          <a
            className="btn venue__directions"
            href={event.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get Directions
          </a>
        </div>

        <div className="venue__map">
          <iframe
            src={event.mapUrl}
            title="Event venue map"
            loading="lazy"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
