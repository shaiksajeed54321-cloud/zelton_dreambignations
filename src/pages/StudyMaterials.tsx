import { useEffect, useState } from "react";
import { FiDownload, FiExternalLink, FiFileText } from "react-icons/fi";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { getFiles, type StoredFile } from "../lib/fileStore";
import "./StudyMaterials.css";

const pdfModules = import.meta.glob("../assets/upsc/*.pdf", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

interface UpscDoc {
  id: string;
  name: string;
  url: string;
}

const bundledFiles: UpscDoc[] = Object.entries(pdfModules).map(([path, url]) => ({
  id: path,
  name: decodeURIComponent(path.split("/").pop() ?? path),
  url,
}));

function toUpscDoc(file: StoredFile): UpscDoc {
  return { id: file.id, name: file.name, url: file.url };
}

export default function StudyMaterials() {
  const [uploadedFiles, setUploadedFiles] = useState<StoredFile[]>([]);

  useEffect(() => {
    getFiles("upsc")
      .then(setUploadedFiles)
      .catch(() => setUploadedFiles([]));
  }, []);

  const files: UpscDoc[] = [...bundledFiles, ...uploadedFiles.map(toUpscDoc)].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <>
      <Header />
      <main>
        <section className="study-materials-hero">
          <div className="container">
            <span className="eyebrow">Resources</span>
            <h1>Study Materials</h1>
            <p>Educational resources shared by the Zelton team to support your preparation.</p>
          </div>
        </section>

        <section className="section study-materials">
          <div className="container">
            <div className="section-heading">
              <h2>UPSC DOC</h2>
              <p>Download the latest UPSC study documents and notes.</p>
            </div>

            {files.length === 0 && (
              <p className="study-materials__status">No UPSC documents are currently available.</p>
            )}

            {files.length > 0 && (
              <ul className="study-materials__list">
                {files.map((file) => (
                  <li key={file.id} className="study-materials__item">
                    <span className="study-materials__name">
                      <FiFileText />
                      {file.name}
                    </span>
                    <span className="study-materials__actions">
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
