export interface HomeInfo {
  id: number;
  state: string;
  eventdate: string;
  punchLine: string;
}

interface HomeResponse {
  success: boolean;
  count: number;
  data: HomeInfo[];
}

const API_BASE = "/api";

export async function getHomeInfo(): Promise<HomeInfo | null> {
  const res = await fetch(`${API_BASE}/home.php`);
  if (!res.ok) {
    throw new Error("Failed to load home details.");
  }
  const body: HomeResponse = await res.json();
  return body.data[0] ?? null;
}

export async function updateHomeInfo(
  id: number,
  fields: Pick<HomeInfo, "state" | "eventdate">,
): Promise<HomeInfo> {
  const res = await fetch(`${API_BASE}/update_home.php`, {
    method: "POST",
    headers: {
      "X-Admin-Token": import.meta.env.VITE_ADMIN_PASSWORD,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, ...fields }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error((data && typeof data.error === "string" && data.error) || "Failed to update details.");
  }

  const body: { data: HomeInfo } = await res.json();
  return body.data;
}
