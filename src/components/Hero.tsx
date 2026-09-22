import { useEffect, useState } from "react";
import { FiClock, FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";
import { EVENT_DATE_ISO, HERO_BG_URL } from "../data/content";
import { useCountdown } from "../hooks/useCountdown";
import { getHomeInfo } from "../lib/homeApi";
import "./Hero.css";

function formatEventDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function Hero() {
  const { days, hours, minutes, seconds } = useCountdown(EVENT_DATE_ISO);
  const [state, setState] = useState<string | null>(null);
  const [eventDate, setEventDate] = useState<string | null>(null);

  useEffect(() => {
    getHomeInfo()
      .then((info) => {
        setState(info?.state ?? null);
        setEventDate(info?.eventdate ?? null);
      })
      .catch(() => setState(null));
  }, []);

  return (
    <section id="home" className="hero" style={{ backgroundImage: `url(${HERO_BG_URL})` }}>
      <div className="hero__overlay" />
      <div className="container hero__content">
        <div className="hero__meta">
           {eventDate && (
            <span>
              <FiClock /> {formatEventDate(eventDate)}
            </span>
          )}
         
          {state && (
            <span>
              <FiMapPin /> {state}
            </span>
          )}
        </div>

        <h1 className="hero__title">DREAM BIG MENTORS MEET BENGALURU-2026</h1>
        <p className="hero__subtitle">No Student Should Be Left Unguided</p>

        <Link className="btn btn-lg hero__cta" to="/register">
          Register Now
        </Link>

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
      </div>
    </section>
  );
}
