import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  FaFileExcel,
  FaFileImage,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileWord,
} from "react-icons/fa";
import {
  FiAlertCircle,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiDownload,
  FiEdit2,
  FiEye,
  FiFile,
  FiFileText,
  FiLock,
  FiLogOut,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUploadCloud,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { LOGO_URL } from "../data/content";
import { getUsername, isAuthenticated, login, logout } from "../lib/auth";
import {
  ACCEPT_ATTR,
  addFile,
  formatBytes,
  getFileKind,
  getFiles,
  MAX_FILE_SIZE,
  removeFile,
  validateFile,
  type FileCategory,
  type FileKind,
  type StoredFile,
} from "../lib/fileStore";
import { getHomeInfo, updateHomeInfo, type HomeInfo } from "../lib/homeApi";
import {
  getRegistrations,
  updateRegistration,
  type Registration,
  type RegistrationInput,
} from "../lib/registrationApi";
import "./AdminDashboard.css";

function AdminLoginForm({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (login(username, password)) {
      onLogin();
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <Link to="/" className="admin-login__logo">
          <img src={LOGO_URL} alt="DREAM BIG NATION" />
        </Link>

        <h1>Admin Login</h1>
        <p className="admin-login__subtitle">Sign in to manage the site.</p>

        <form onSubmit={handleSubmit}>
          <label className="admin-login__field">
            <span>Username</span>
            <div className="admin-login__input">
              <FiUser />
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </label>

          <label className="admin-login__field">
            <span>Password</span>
            <div className="admin-login__input">
              <FiLock />
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </label>

          {error && <p className="admin-login__error">{error}</p>}

          <button type="submit" className="btn admin-login__submit">
            Log In
          </button>
        </form>

        <Link to="/" className="admin-login__back">
          &larr; Back to site
        </Link>
      </div>
    </div>
  );
}

type UploadAccent = "docs" | "jobs";
type TypeFilter = "all" | FileKind;

interface QueueItem {
  key: string;
  name: string;
  progress: number;
  error?: string;
}

const FILE_KIND_META: Record<FileKind, { label: string; icon: ReactNode; className: string }> = {
  pdf: { label: "PDF", icon: <FaFilePdf />, className: "pdf" },
  word: { label: "DOC", icon: <FaFileWord />, className: "word" },
  excel: { label: "XLS", icon: <FaFileExcel />, className: "excel" },
  powerpoint: { label: "PPT", icon: <FaFilePowerpoint />, className: "ppt" },
  image: { label: "IMG", icon: <FaFileImage />, className: "image" },
  other: { label: "FILE", icon: <FiFile />, className: "other" },
};

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "pdf", label: "PDF" },
  { value: "word", label: "Word" },
  { value: "excel", label: "Excel" },
  { value: "powerpoint", label: "PowerPoint" },
  { value: "image", label: "Images" },
];

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function FileManager({
  title,
  description,
  category,
  icon,
  accent,
  files,
  onUploaded,
  onDelete,
}: {
  title: string;
  description?: string;
  category: FileCategory;
  icon: ReactNode;
  accent: UploadAccent;
  files: StoredFile[];
  onUploaded: (file: StoredFile) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetRef = useRef<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const [pendingDelete, setPendingDelete] = useState<StoredFile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [replaceProgress, setReplaceProgress] = useState(0);
  const [replaceError, setReplaceError] = useState<{ id: string; message: string } | null>(null);

  const removeQueueItem = (key: string) => setQueue((prev) => prev.filter((item) => item.key !== key));

  const uploadFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const incoming = Array.from(fileList);
    const rejected: string[] = [];
    const valid: File[] = [];

    incoming.forEach((file) => {
      const message = validateFile(file);
      if (message) {
        rejected.push(message);
      } else {
        valid.push(file);
      }
    });

    setAlerts(rejected);

    for (const file of valid) {
      const key = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setQueue((prev) => [...prev, { key, name: file.name, progress: 0 }]);

      try {
        const stored = await addFile(file, category, {
          uploadedBy: getUsername(),
          onProgress: (percent) => {
            setQueue((prev) => prev.map((item) => (item.key === key ? { ...item, progress: percent } : item)));
          },
        });
        onUploaded(stored);
        removeQueueItem(key);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to upload file.";
        setQueue((prev) => prev.map((item) => (item.key === key ? { ...item, error: message } : item)));
      }
    }
  };

  const openDeleteConfirm = (file: StoredFile) => {
    setDeleteError("");
    setPendingDelete(file);
  };

  const closeDeleteConfirm = () => {
    if (deleting) return;
    setPendingDelete(null);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await onDelete(pendingDelete.id);
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete file.");
    } finally {
      setDeleting(false);
    }
  };

  const handleReplaceClick = (file: StoredFile) => {
    replaceTargetRef.current = file.id;
    replaceInputRef.current?.click();
  };

  const handleReplaceFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const targetId = replaceTargetRef.current;
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    replaceTargetRef.current = null;
    if (!targetId || !file) return;

    const message = validateFile(file);
    if (message) {
      setReplaceError({ id: targetId, message });
      return;
    }

    setReplacingId(targetId);
    setReplaceProgress(0);
    setReplaceError(null);

    try {
      const stored = await addFile(file, category, {
        uploadedBy: getUsername(),
        onProgress: setReplaceProgress,
      });
      await onDelete(targetId);
      onUploaded(stored);
    } catch (err) {
      setReplaceError({
        id: targetId,
        message: err instanceof Error ? err.message : "Failed to replace file.",
      });
    } finally {
      setReplacingId(null);
    }
  };

  const filteredFiles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return files.filter((file) => {
      const matchesSearch = term === "" || file.name.toLowerCase().includes(term);
      const matchesType = typeFilter === "all" || getFileKind(file.name) === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [files, searchTerm, typeFilter]);

  return (
    <section className={`admin-card admin-card--${accent} file-manager`}>
      <div className="admin-card__header">
        <span className="admin-card__icon">{icon}</span>
        <div className="admin-card__heading">
          <h2>{title}</h2>
          {description && <p className="admin-card__desc">{description}</p>}
        </div>
        {files.length > 0 && (
          <span className="admin-card__badge">
            {files.length} file{files.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div
        className={`file-manager__dropzone ${isDragging ? "is-dragging" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          void uploadFiles(e.dataTransfer.files);
        }}
      >
        <span className="file-manager__dropzone-icon">
          <FiUploadCloud size={26} />
        </span>
        <p className="file-manager__dropzone-title">Drag &amp; drop files here</p>
        <span className="file-manager__browse-btn">or Browse Files</span>
        <p className="file-manager__dropzone-hint">
          PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG · Max {formatBytes(MAX_FILE_SIZE)}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          accept={ACCEPT_ATTR}
          onChange={(e) => {
            void uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <input
        ref={replaceInputRef}
        type="file"
        hidden
        accept={ACCEPT_ATTR}
        onChange={(e) => {
          void handleReplaceFileChange(e);
        }}
      />

      {alerts.length > 0 && (
        <div className="file-manager__banner file-manager__banner--error">
          <FiAlertCircle />
          <div className="file-manager__banner-messages">
            {alerts.map((message, i) => (
              <p key={i}>{message}</p>
            ))}
          </div>
          <button
            type="button"
            className="file-manager__banner-close"
            aria-label="Dismiss"
            onClick={() => setAlerts([])}
          >
            <FiX />
          </button>
        </div>
      )}

      {queue.length > 0 && (
        <ul className="file-manager__queue">
          {queue.map((item) => (
            <li key={item.key} className={item.error ? "has-error" : ""}>
              <FiFile />
              <div className="file-manager__queue-info">
                <span className="file-manager__queue-name">{item.name}</span>
                {item.error ? (
                  <span className="file-manager__queue-error">{item.error}</span>
                ) : (
                  <div className="file-manager__progress">
                    <span className="file-manager__progress-bar" style={{ width: `${item.progress}%` }} />
                  </div>
                )}
              </div>
              {item.error ? (
                <button
                  type="button"
                  className="file-manager__queue-dismiss"
                  aria-label="Dismiss"
                  onClick={() => removeQueueItem(item.key)}
                >
                  <FiX />
                </button>
              ) : (
                <span className="file-manager__queue-percent">{item.progress}%</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <div className="file-manager__toolbar">
          <div className="file-manager__search">
            <FiSearch />
            <input
              type="search"
              placeholder="Search files…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="file-manager__filter">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}>
              {TYPE_FILTERS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FiChevronDown className="file-manager__filter-caret" />
          </div>
        </div>
      )}

      {files.length === 0 ? (
        <div className="file-manager__empty">
          <span className="file-manager__empty-icon">
            <FiUploadCloud size={28} />
          </span>
          <h3>No files uploaded yet</h3>
          {description && <p>{description}</p>}
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="file-manager__empty file-manager__empty--compact">
          <FiSearch size={20} />
          <p>No files match your search or filter.</p>
        </div>
      ) : (
        <div className="file-manager__table-wrap">
          <table className="file-manager__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th>Uploaded By</th>
                <th>Status</th>
                <th className="is-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => {
                const meta = FILE_KIND_META[getFileKind(file.name)];
                const isReplacing = replacingId === file.id;
                const rowReplaceError = replaceError && replaceError.id === file.id ? replaceError.message : null;

                return (
                  <tr key={file.id} className={isReplacing ? "is-busy" : ""}>
                    <td data-label="Name">
                      <span className="file-manager__name">{file.name}</span>
                      {rowReplaceError && <span className="file-manager__row-error">{rowReplaceError}</span>}
                    </td>
                    <td data-label="Type">
                      <span className={`file-manager__type file-manager__type--${meta.className}`}>
                        {meta.icon}
                        {meta.label}
                      </span>
                    </td>
                    <td data-label="Size">{formatBytes(file.size)}</td>
                    <td data-label="Uploaded">{formatDate(file.uploadedAt)}</td>
                    <td data-label="Uploaded By">{file.uploadedBy || "—"}</td>
                    <td data-label="Status">
                      {isReplacing ? (
                        <span className="file-manager__status file-manager__status--pending">
                          Updating… {replaceProgress}%
                        </span>
                      ) : (
                        <span className="file-manager__status file-manager__status--active">
                          <FiCheckCircle /> Active
                        </span>
                      )}
                    </td>
                    <td data-label="Actions" className="is-actions">
                      <div className="file-manager__actions">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="file-manager__action"
                          aria-label={`Preview ${file.name}`}
                          title="Preview"
                        >
                          <FiEye />
                        </a>
                        <a
                          href={file.url}
                          download={file.name}
                          className="file-manager__action"
                          aria-label={`Download ${file.name}`}
                          title="Download"
                        >
                          <FiDownload />
                        </a>
                        <button
                          type="button"
                          className="file-manager__action"
                          aria-label={`Replace ${file.name}`}
                          title="Replace"
                          onClick={() => handleReplaceClick(file)}
                          disabled={isReplacing}
                        >
                          <FiRefreshCw className={isReplacing ? "is-spinning" : ""} />
                        </button>
                        <button
                          type="button"
                          className="file-manager__action file-manager__action--danger"
                          aria-label={`Delete ${file.name}`}
                          title="Delete"
                          onClick={() => openDeleteConfirm(file)}
                          disabled={isReplacing}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pendingDelete &&
        createPortal(
          <div className="admin-modal" role="presentation" onClick={closeDeleteConfirm}>
            <div
              className="admin-modal__card"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="admin-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="admin-modal-title">Delete document?</h3>
              <p>
                Are you sure you want to delete <strong>{pendingDelete.name}</strong>?
              </p>
              {deleteError && <p className="admin-upload__error">{deleteError}</p>}
              <div className="admin-modal__actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={closeDeleteConfirm}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn admin-modal__confirm"
                  onClick={() => {
                    void confirmDelete();
                  }}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}

function HomeDetailsSection() {
  const [home, setHome] = useState<HomeInfo | null>(null);
  const [state, setState] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getHomeInfo()
      .then((info) => {
        setHome(info);
        setState(info?.state ?? "");
        setEventDate(info?.eventdate ?? "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load details."))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!home) return;

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const updated = await updateHomeInfo(home.id, { state, eventdate: eventDate });
      setHome(updated);
      setState(updated.state);
      setEventDate(updated.eventdate);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update details.");
    } finally {
      setSaving(false);
    }
  };

  const unchanged = home !== null && state === home.state && eventDate === home.eventdate;

  return (
    <section className="admin-card admin-card--details">
      <div className="admin-card__header">
        <span className="admin-card__icon">
          <FiCalendar size={20} />
        </span>
        <div className="admin-card__heading">
          <h2>Homepage Details</h2>
          <p className="admin-card__desc">The event date and state shown at the top of the home page.</p>
        </div>
      </div>

      {loading ? (
        <p className="admin-dashboard__loading">Loading…</p>
      ) : !home ? (
        <p className="admin-upload__error">{error || "No home details found in the database."}</p>
      ) : (
        <form
          className="admin-home__form"
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
        >
          <div className="admin-home__row">
            <label className="admin-login__field">
              <span>Event date</span>
              <div className="admin-login__input">
                <input
                  type="date"
                  name="eventdate"
                  value={eventDate}
                  onChange={(e) => {
                    setEventDate(e.target.value);
                    setSaved(false);
                  }}
                  required
                />
              </div>
            </label>

            <label className="admin-login__field">
              <span>State</span>
              <div className="admin-login__input">
                <input
                  type="text"
                  name="state"
                  value={state}
                  maxLength={100}
                  onChange={(e) => {
                    setState(e.target.value);
                    setSaved(false);
                  }}
                  required
                />
              </div>
            </label>
          </div>

          {error && <p className="admin-upload__error">{error}</p>}
          {saved && (
            <p className="admin-home__success">
              <FiCheckCircle /> Saved. The home page now shows the new details.
            </p>
          )}

          <button type="submit" className="btn" disabled={saving || unchanged}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      )}
    </section>
  );
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadRegistrationsCsv(registrations: Registration[]): void {
  const headers = ["Full Name", "Email", "Phone", "College", "Course", "Year of Study", "City", "Registered On"];
  const rows = registrations.map((r) => [
    r.fullName,
    r.email,
    r.phone,
    r.college,
    r.course,
    r.yearOfStudy,
    r.city,
    r.submittedAt,
  ]);

  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `registrations-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

function RegistrationEditModal({
  registration,
  onClose,
  onSaved,
}: {
  registration: Registration;
  onClose: () => void;
  onSaved: (updated: Registration) => void;
}) {
  const [form, setForm] = useState<RegistrationInput>({
    fullName: registration.fullName,
    email: registration.email,
    phone: registration.phone,
    college: registration.college,
    course: registration.course,
    yearOfStudy: registration.yearOfStudy,
    city: registration.city,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setField = (field: keyof RegistrationInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await updateRegistration(registration.id, form);
      onSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update registration.");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="admin-modal" role="presentation" onClick={() => !saving && onClose()}>
      <div
        className="admin-modal__card admin-modal__card--form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-registration-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="edit-registration-title">Edit Registration</h3>
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
        >
          <label className="admin-login__field">
            <span>Full Name</span>
            <div className="admin-login__input">
              <input type="text" value={form.fullName} onChange={setField("fullName")} required />
            </div>
          </label>

          <label className="admin-login__field">
            <span>Email</span>
            <div className="admin-login__input">
              <input type="email" value={form.email} onChange={setField("email")} required />
            </div>
          </label>

          <label className="admin-login__field">
            <span>Phone</span>
            <div className="admin-phone-field">
              <span className="admin-phone-field__code" aria-hidden="true">
                +91
              </span>
              <input
                className="admin-phone-field__input"
                type="tel"
                inputMode="numeric"
                value={form.phone}
                maxLength={10}
                pattern="[6-9]\d{9}"
                title="Enter a valid 10-digit Indian mobile number."
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))
                }
                required
              />
            </div>
          </label>

          <label className="admin-login__field">
            <span>College / University</span>
            <div className="admin-login__input">
              <input type="text" value={form.college} onChange={setField("college")} required />
            </div>
          </label>

          <div className="admin-home__row">
            <label className="admin-login__field">
              <span>Course</span>
              <div className="admin-login__input">
                <input type="text" value={form.course} onChange={setField("course")} required />
              </div>
            </label>

            <label className="admin-login__field">
              <span>Year of Study</span>
              <div className="admin-login__input">
                <input type="text" value={form.yearOfStudy} onChange={setField("yearOfStudy")} required />
              </div>
            </label>
          </div>

          <label className="admin-login__field">
            <span>City</span>
            <div className="admin-login__input">
              <input type="text" value={form.city} onChange={setField("city")} required />
            </div>
          </label>

          {error && <p className="admin-upload__error">{error}</p>}

          <div className="admin-modal__actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function RegistrationsSection() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Registration | null>(null);

  useEffect(() => {
    getRegistrations()
      .then(setRegistrations)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load registrations."))
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (updated: Registration) => {
    setRegistrations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditing(null);
  };

  return (
    <section className="admin-card admin-card--registrations">
      <div className="admin-card__header">
        <span className="admin-card__icon">
          <FiUsers size={20} />
        </span>
        <div className="admin-card__heading">
          <h2>Registered Users</h2>
          <p className="admin-card__desc">Students who have registered for the event.</p>
        </div>
        {registrations.length > 0 && (
          <span className="admin-card__badge">
            {registrations.length} registration{registrations.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="admin-registrations__toolbar">
        <button
          type="button"
          className="btn btn-outline admin-registrations__download"
          onClick={() => downloadRegistrationsCsv(registrations)}
          disabled={registrations.length === 0}
        >
          <FiDownload /> Download CSV
        </button>
      </div>

      {loading ? (
        <p className="admin-dashboard__loading">Loading…</p>
      ) : error ? (
        <p className="admin-upload__error">{error}</p>
      ) : registrations.length === 0 ? (
        <div className="file-manager__empty">
          <span className="file-manager__empty-icon">
            <FiUsers size={28} />
          </span>
          <h3>No registrations yet</h3>
        </div>
      ) : (
        <div className="file-manager__table-wrap">
          <table className="file-manager__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>College</th>
                <th>Course</th>
                <th>Year</th>
                <th>City</th>
                <th>Registered</th>
                <th className="is-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r.id}>
                  <td data-label="Name">{r.fullName}</td>
                  <td data-label="Email">{r.email}</td>
                  <td data-label="Phone">
                    <span className="admin-registrations__phone">
                      <span className="admin-registrations__phone-code">+91</span>
                      {r.phone}
                    </span>
                  </td>
                  <td data-label="College">{r.college}</td>
                  <td data-label="Course">{r.course}</td>
                  <td data-label="Year">{r.yearOfStudy}</td>
                  <td data-label="City">{r.city}</td>
                  <td data-label="Registered">{formatDate(r.submittedAt)}</td>
                  <td data-label="Actions" className="is-actions">
                    <div className="file-manager__actions">
                      <button
                        type="button"
                        className="file-manager__action"
                        aria-label={`Edit ${r.fullName}`}
                        title="Edit"
                        onClick={() => setEditing(r)}
                      >
                        <FiEdit2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <RegistrationEditModal registration={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />
      )}
    </section>
  );
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(() => isAuthenticated());
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!authed) return;
    getFiles()
      .then(setFiles)
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load files."));
  }, [authed]);

  if (!authed) {
    return <AdminLoginForm onLogin={() => setAuthed(true)} />;
  }

  const handleLogout = () => {
    logout();
    setAuthed(false);
  };

  const handleUploaded = (stored: StoredFile) => {
    setFiles((prev) => [...prev, stored]);
  };

  const handleDelete = (id: string): Promise<void> => {
    return removeFile(id).then(() => {
      setFiles((prev) => prev.filter((f) => f.id !== id));
    });
  };

  const upscFiles = files.filter((f) => f.category === "upsc");
  const jobsFiles = files.filter((f) => f.category === "jobs");

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard__header">
        <div className="container admin-dashboard__header-inner">
          <div>
            <span className="admin-dashboard__eyebrow">Admin Panel</span>
            <h1>Dashboard</h1>
          </div>
          <button className="btn btn-outline admin-dashboard__logout" onClick={handleLogout}>
            <FiLogOut /> Log Out
          </button>
        </div>
      </header>

      <div className="container admin-dashboard__content">
        {loadError && <p className="admin-upload__error">{loadError}</p>}

        <div className="admin-dashboard__uploads">
          <FileManager
            title="Documents Upload"
            description="Files uploaded here appear under Study Materials → UPSC DOC for all visitors."
            category="upsc"
            icon={<FiFileText size={20} />}
            accent="docs"
            files={upscFiles}
            onUploaded={handleUploaded}
            onDelete={handleDelete}
          />

          <FileManager
            title="Jobs Upload"
            description="Files uploaded here appear under the Jobs tab for all visitors."
            category="jobs"
            icon={<FiBriefcase size={20} />}
            accent="jobs"
            files={jobsFiles}
            onUploaded={handleUploaded}
            onDelete={handleDelete}
          />
        </div>

        <HomeDetailsSection />
        <RegistrationsSection />
      </div>
    </div>
  );
}
