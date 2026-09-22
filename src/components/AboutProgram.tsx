import { Link } from "react-router-dom";
import "./AboutProgram.css";

export default function AboutProgram() {
  return (
    <section className="section about-program">
      <div className="container about-program__grid">
        <div className="about-program__media">
          <iframe
            src="https://drive.google.com/file/d/1nUSvnJjCzx7_Z4xkIOTrUsKsWuzh8FE2/preview"
            title="About Dream Big Nation"
            allow="autoplay"
            allowFullScreen
          />
        </div>

        <div className="about-program__copy">
          <h1 className="about-program__title">About Our Mentorship Program</h1>
          <h2 className="about-program__subtitle">
            The Dream Big Nation Mentorship Program connects college students with accomplished
            civil servants, academicians, and professionals to inspire early goal setting and
            career clarity. Through monthly interactive sessions, students gain exposure to
            real-life success stories and practical guidance from experienced mentors.
          </h2>

          <p>
            This initiative focuses on helping students identify their passions early, set
            ambitious goals, and build a roadmap to achieve them. With the support of respected
            IAS and IRS officers, professors, and thought leaders, the program nurtures
            leadership, confidence, and a strong sense of purpose&mdash;empowering youth to
            contribute meaningfully to nation-building.
          </p>

          <div className="about-program__actions">
            <Link className="btn" to="/register">
              Register Now
            </Link>
            <a className="btn btn-outline" href="/#organizer">
              Know More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
