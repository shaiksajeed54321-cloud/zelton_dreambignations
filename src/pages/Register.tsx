import { useState } from "react";
import type { FormEvent } from "react";
import { FiCheckCircle } from "react-icons/fi";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { submitRegistration, type RegistrationInput } from "../lib/registrationApi";
import "./Register.css";

const EMPTY_FORM: RegistrationInput = {
  fullName: "",
  email: "",
  phone: "",
  college: "",
  course: "",
  yearOfStudy: "",
  city: "",
};

const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

export default function Register() {
  const [form, setForm] = useState<RegistrationInput>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (field: keyof RegistrationInput) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({ ...prev, phone: digits }));
    setPhoneError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!INDIAN_MOBILE_REGEX.test(form.phone)) {
      setPhoneError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await submitRegistration(form);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit registration.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main>
        <section className="register-hero">
          <div className="container">
            <span className="eyebrow">Dream Big Mentors Meet Bengaluru-2026</span>
            <h1>Student Registration</h1>
            <p>Reserve your seat at the mentorship event &mdash; it&rsquo;s free.</p>
          </div>
        </section>

        <section className="section register-section">
          <div className="container">
            <div className="register-card">
              {submitted ? (
                <div className="register-success">
                  <FiCheckCircle size={48} />
                  <h2>You&rsquo;re registered!</h2>
                  <p>
                    Thank you, {form.fullName.split(" ")[0]}. We&rsquo;ve received your details and
                    will be in touch with event updates.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    void handleSubmit(e);
                  }}
                >
                  <label className="register-field">
                    <span>Full Name</span>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={handleChange("fullName")}
                      required
                    />
                  </label>

                  <label className="register-field">
                    <span>Email</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      required
                    />
                  </label>

                  <label className="register-field">
                    <span>Phone Number</span>
                    <div className="register-phone-input">
                      <span className="register-phone-code" aria-hidden="true">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={form.phone}
                        onChange={handlePhoneChange}
                        pattern="[6-9]\d{9}"
                        title="Enter a valid 10-digit Indian mobile number."
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        required
                      />
                    </div>
                    {phoneError && <p className="register-field-error">{phoneError}</p>}
                  </label>

                  <label className="register-field">
                    <span>College / University</span>
                    <input
                      type="text"
                      value={form.college}
                      onChange={handleChange("college")}
                      required
                    />
                  </label>

                  <div className="register-field-row">
                    <label className="register-field">
                      <span>Course</span>
                      <input
                        type="text"
                        value={form.course}
                        onChange={handleChange("course")}
                        required
                      />
                    </label>

                    <label className="register-field">
                      <span>Year of Study</span>
                      <input
                        type="text"
                        value={form.yearOfStudy}
                        onChange={handleChange("yearOfStudy")}
                        required
                      />
                    </label>
                  </div>

                  <label className="register-field">
                    <span>City</span>
                    <input
                      type="text"
                      value={form.city}
                      onChange={handleChange("city")}
                      required
                    />
                  </label>

                  {submitError && <p className="register-field-error">{submitError}</p>}

                  <button type="submit" className="btn btn-lg register-submit" disabled={submitting}>
                    {submitting ? "Submitting…" : "Register Now"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
