import { Link } from "react-router-dom";
import { CTA_BG_URL } from "../data/content";
import "./CtaBanner.css";

export default function CtaBanner() {
  return (
    <section className="cta-banner" style={{ backgroundImage: `url(${CTA_BG_URL})` }}>
      <div className="cta-banner__overlay" />
      <div className="container">
        <div className="cta-banner__card">
          <p className="eyebrow">Hurry Up!</p>
          <h2>Opportunity knocks once</h2>
          <p className="cta-banner__text">
            Connect with Civil Servants &amp; academicians&mdash;<strong>absolutely free</strong>.
          </p>
          <Link className="btn btn-lg" to="/register">
            Register Now
          </Link>
        </div>
      </div>
    </section>
  );
}
