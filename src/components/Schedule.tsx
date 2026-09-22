import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { SCHEDULE } from "../data/content";
import "./Schedule.css";

export default function Schedule() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="schedule" className="section schedule">
      <div className="container schedule__grid">
        <div className="schedule__intro">
          <h2>
            Check The
            <br />
            Schedule
          </h2>
          <p>
            This is the event schedule section, you can check the details about time, duration,
            speaker, venue &amp; more.
          </p>
          <a className="btn schedule__date-btn" href="/#schedule-list">
            25 April 2026
          </a>
        </div>

        <div className="schedule__list-wrap">
          <h2 className="schedule__date-heading">Saturday, 25 April 2026</h2>

          <div id="schedule-list" className="schedule__list">
            {SCHEDULE.map((item, index) => {
              const hasDetail = Boolean(item.description?.length);
              const isOpen = openIndex === index;

              return (
                <div className={`schedule__item ${isOpen ? "is-open" : ""}`} key={item.time + item.title}>
                  <button
                    className="schedule__item-header"
                    onClick={() => hasDetail && setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    disabled={!hasDetail}
                  >
                    <span className="schedule__time">{item.time}</span>
                    <span className="schedule__title">{item.title}</span>
                    {hasDetail && (
                      <span className="schedule__chevron">
                        <FiChevronDown />
                      </span>
                    )}
                  </button>

                  {hasDetail && isOpen && (
                    <div className="schedule__detail">
                      <ul>
                        {item.description!.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
