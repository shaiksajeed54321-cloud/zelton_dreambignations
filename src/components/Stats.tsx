import type { ReactNode } from "react";
import { FiAward, FiCalendar, FiClock, FiUsers } from "react-icons/fi";
import { STATS, STATS_BG_URL } from "../data/content";
import { useCountUp } from "../hooks/useCountUp";
import type { StatItem } from "../data/types";
import "./Stats.css";

const ICONS: Record<StatItem["icon"], ReactNode> = {
  speakers: <FiAward />,
  students: <FiUsers />,
  hours: <FiClock />,
  events: <FiCalendar />,
};

function StatCard({ stat }: { stat: StatItem }) {
  const { value, ref } = useCountUp(stat.value);

  return (
    <div className="stat-card" ref={ref}>
      <div className="stat-card__icon">{ICONS[stat.icon]}</div>
      <div className="stat-card__value">
        {value}
        {stat.suffix}
      </div>
      <div className="stat-card__label">{stat.label}</div>
    </div>
  );
}

export default function Stats() {
  return (
    <section className="stats" style={{ backgroundImage: `url(${STATS_BG_URL})` }}>
      <div className="stats__overlay" />
      <div className="container stats__grid">
        {STATS.map((stat) => (
          <StatCard stat={stat} key={stat.label} />
        ))}
      </div>
    </section>
  );
}
