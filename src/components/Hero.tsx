import { useEffect, useState } from "react";
import { FiClock, FiMapPin, FiShare2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import { HERO_BG_URL } from "../data/content";
import { useEventInfo } from "../lib/eventInfo";
import { useCountdown } from "../hooks/useCountdown";
import { shareSite } from "../lib/share";
import { getHomeInfo } from "../lib/homeApi";
import "./Hero.css";

export default function Hero() {
  const [state, setState] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState("");
  const event = useEventInfo();
  const { days, hours, minutes, seconds, finished } = useCountdown(event.iso);

  const handleShare = async () => {
    setShareMessage(await shareSite());
    window.setTimeout(() => setShareMessage(""), 3000);
  };

  useEffect(() => {
    getHomeInfo()
      .then((info) => {
        setState(info?.state ?? null);
      })
      .catch(() => setState(null));
  }, []);

  return (
    <section id="home" className="hero" style={{ backgroundImage: `url(${HERO_BG_URL})` }}>
      <div className="hero__overlay" />
      <div className="container hero__content">
        <div className="hero__meta">
          <span>
            <FiClock /> {event.dateShort}
          </span>
         
          {state && (
            <span>
              <FiMapPin /> {state}
            </span>
          )}
        </div>

        <h1 className="hero__title">{event.name.toUpperCase()}</h1>
        <p className="hero__subtitle">No Student Should Be Left Unguided</p>

        <Link className="btn btn-lg hero__cta" to="/register">
          Register Now
        </Link>

        {finished ? (
          <p className="hero__countdown-done">Event Started</p>
        ) : (
        <div className="hero__countdown">
          {[
            { label: "Days", value: days },
            { label: "Hours", value: hours },
            { label: "Minutes", value: minutes },
            { label: "Seconds", value: seconds },
          ].map((unit) => (
            <div className="hero__countdown-item" key={unit.label}>
              <span className="hero__countdown-value">{String(unit.value).padStart(2, "0")}</span>
              <span className="hero__countdown-label">{unit.label}</span>
            </div>
          ))}
        </div>
        )}

        <button type="button" className="hero__share" onClick={handleShare}>
          <FiShare2 /> Share
        </button>
        <p className="hero__share-msg" role="status" aria-live="polite">
          {shareMessage}
        </p>
      </div>
    </section>
  );
}
