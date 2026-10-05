import { Link } from "react-router-dom";
import "./CareerGoals.css";

const STEPS = [
  "Explore 40+ Dream Big Career Goals in the event brochure.",
  "Select any 5 Career Goals of interest from the list.",
  "Ask the mentors about the prospects and challenges of those 5 goals during the Q & A session.",
  "Decide on 1 of the 5 goals within the next 3 months through personal research and guidance from seniors, professors and successful persons.",
];

export default function CareerGoals() {
  return (
    <section id="career-goals" className="section career-goals">
      <div className="container career-goals__content">
        <p className="eyebrow">Early Goal Setting</p>
        <h2>Dream Big Career Goals</h2>
        <p>
          Career mentors of Civil Services, Academics, Judiciary &amp; Business guide students to
          choose a goal early and build a roadmap to achieve it.
        </p>
        <ol className="career-goals__steps">
          {STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <Link className="btn" to="/register">
          Register Now
        </Link>
      </div>
    </section>
  );
}
