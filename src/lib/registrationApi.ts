export interface Registration {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  yearOfStudy: string;
  city: string;
  submittedAt: string;
}

export type RegistrationInput = Omit<Registration, "id" | "submittedAt">;

interface RegistrationResponse {
  success: boolean;
  count: number;
  data: Registration[];
}

const API_BASE = "/api";

async function readError(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => null);
  return (data && typeof data.error === "string" && data.error) || fallback;
}

export async function submitRegistration(input: RegistrationInput): Promise<Registration> {
  const res = await fetch(`${API_BASE}/register.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await readError(res, "Failed to submit registration."));
  }

  const body: { data: Registration } = await res.json();
  return body.data;
}

export async function getRegistrations(): Promise<Registration[]> {
  const res = await fetch(`${API_BASE}/registrations.php`, {
    headers: { "X-Admin-Token": import.meta.env.VITE_ADMIN_PASSWORD },
  });

  if (!res.ok) {
    throw new Error(await readError(res, "Failed to load registrations."));
  }

  const body: RegistrationResponse = await res.json();
  return body.data;
}

export async function updateRegistration(id: number, fields: RegistrationInput): Promise<Registration> {
  const res = await fetch(`${API_BASE}/update_registration.php`, {
    method: "POST",
    headers: {
      "X-Admin-Token": import.meta.env.VITE_ADMIN_PASSWORD,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, ...fields }),
  });

  if (!res.ok) {
    throw new Error(await readError(res, "Failed to update registration."));
  }

  const body: { data: Registration } = await res.json();
  return body.data;
}
