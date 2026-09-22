import { FiCheckCircle } from "react-icons/fi";
import { ORGANIZER_HIGHLIGHTS } from "../data/content";
import "./AboutOrganizer.css";

export default function AboutOrganizer() {
  return (
    <section id="organizer" className="organizer">
      <div className="container organizer__content">
        <h2>About Event Organizer</h2>
        <p>
          <strong>Dream Big Nation</strong> is a youth-focused mentorship movement launched in
          Bengaluru with a mission to inspire college students through real-life stories, early
          goal setting, and career guidance from India&rsquo;s top civil servants and
          academicians. Since its inception, Dream Big Nation has been committed to building a
          strong ecosystem of mentorship and nation-building through monthly interactive sessions
          and community outreach.
        </p>

        <ul className="organizer__highlights">
          {ORGANIZER_HIGHLIGHTS.map((item) => (
            <li key={item}>
              <FiCheckCircle /> {item}
            </li>
          ))}
        </ul>

        <a className="btn btn-light" href="/#organizer">
          Know More
        </a>
      </div>
    </section>
  );
}
