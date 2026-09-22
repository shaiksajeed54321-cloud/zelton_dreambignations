export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB, enforced client- and server-side

export type FileCategory = "general" | "upsc" | "jobs";

export type FileKind = "pdf" | "word" | "excel" | "powerpoint" | "image" | "other";

export interface StoredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  url: string;
  category: FileCategory;
  uploadedBy?: string;
  status?: string;
}

const API_BASE = "/api";

export const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "jpg",
  "jpeg",
  "png",
] as const;

export const ACCEPT_ATTR = ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",");

export function getFileExtension(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? (parts.pop() ?? "").toLowerCase() : "";
}

export function isAllowedFileType(name: string): boolean {
  return ALLOWED_EXTENSIONS.includes(getFileExtension(name) as (typeof ALLOWED_EXTENSIONS)[number]);
}

export function getFileKind(name: string): FileKind {
  const ext = getFileExtension(name);
  if (ext === "pdf") return "pdf";
  if (ext === "doc" || ext === "docx") return "word";
  if (ext === "xls" || ext === "xlsx") return "excel";
  if (ext === "ppt" || ext === "pptx") return "powerpoint";
  if (ext === "jpg" || ext === "jpeg" || ext === "png") return "image";
  return "other";
}

function adminHeaders(): HeadersInit {
  return { "X-Admin-Token": import.meta.env.VITE_ADMIN_PASSWORD };
}

async function errorFrom(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => null);
  return (data && typeof data.error === "string" && data.error) || fallback;
}

export async function getFiles(category?: FileCategory): Promise<StoredFile[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  const res = await fetch(`${API_BASE}/list.php${query}`);
  if (!res.ok) {
    throw new Error(await errorFrom(res, "Failed to load files."));
  }
  return res.json();
}

export interface UploadOptions {
  uploadedBy?: string;
  onProgress?: (percent: number) => void;
}

export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `"${file.name}" is too large (max ${formatBytes(MAX_FILE_SIZE)}).`;
  }
  if (!isAllowedFileType(file.name)) {
    return `"${file.name}" is not a supported file type.`;
  }
  return null;
}

export function addFile(
  file: File,
  category: FileCategory = "general",
  options: UploadOptions = {},
): Promise<StoredFile> {
  const validationError = validateFile(file);
  if (validationError) {
    return Promise.reject(new Error(validationError));
  }

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    if (options.uploadedBy) {
      formData.append("uploadedBy", options.uploadedBy);
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/upload.php`);
    xhr.setRequestHeader("X-Admin-Token", import.meta.env.VITE_ADMIN_PASSWORD);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && options.onProgress) {
        options.onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let data: unknown = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = null;
      }

      if (xhr.status >= 200 && xhr.status < 300 && data) {
        resolve(data as StoredFile);
      } else {
        const message =
          data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Failed to upload file.";
        reject(new Error(message));
      }
    };

    xhr.onerror = () => reject(new Error("Failed to upload file."));
    xhr.send(formData);
  });
}

export async function removeFile(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/delete.php`, {
    method: "POST",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    throw new Error(await errorFrom(res, "Failed to delete file."));
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
