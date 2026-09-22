import { useEffect, useState } from "react";
import { FiDownload, FiExternalLink, FiFileText } from "react-icons/fi";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { formatBytes, getFiles, type StoredFile } from "../lib/fileStore";
import "./Jobs.css";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function fileTypeLabel(file: StoredFile): string {
  const ext = file.name.split(".").pop();
  if (ext && ext !== file.name) return ext.toUpperCase();
  const subtype = file.type.split("/").pop();
  return subtype ? subtype.toUpperCase() : "FILE";
}

export default function Jobs() {
  const [files, setFiles] = useState<StoredFile[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getFiles("jobs")
      .then((data) => {
        if (!cancelled) setFiles(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load job postings.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loading = files === null && !error;

  return (
    <>
      <Header />
      <main>
        <section className="jobs-hero">
          <div className="container">
            <span className="eyebrow">Opportunities</span>
            <h1>Jobs</h1>
            <p>Browse and download the latest job postings shared by the Zelton team.</p>
          </div>
        </section>

        <section className="section jobs">
          <div className="container">
            <div className="section-heading">
              <h2>Job Postings</h2>
              <p>Documents uploaded by the team from the admin panel appear here automatically.</p>
            </div>

            {loading && <p className="jobs__status">Loading job postings…</p>}

            {!loading && error && <p className="jobs__status jobs__status--error">{error}</p>}

            {!loading && !error && files && files.length === 0 && (
              <p className="jobs__status">No job postings are currently available.</p>
            )}

            {!loading && !error && files && files.length > 0 && (
              <ul className="jobs__list">
                {files.map((file) => (
                  <li key={file.id} className="jobs__item">
                    <span className="jobs__name">
                      <FiFileText />
                      <span className="jobs__name-text">
                        <span className="jobs__title">{file.name}</span>
                        <span className="jobs__meta">
                          {fileTypeLabel(file)} · {formatBytes(file.size)} · {formatDate(file.uploadedAt)}
                        </span>
                      </span>
                    </span>
                    <span className="jobs__actions">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                      >
                        <FiExternalLink /> View
                      </a>
                      <a href={file.url} download={file.name} className="btn btn-sm">
                        <FiDownload /> Download
                      </a>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
