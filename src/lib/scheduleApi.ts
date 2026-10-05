import { useEffect, useState } from "react";
import { SCHEDULE } from "../data/content";
import type { ScheduleItem } from "../data/types";
import { formatEventDate, useEventInfo } from "./eventInfo";

const API_BASE = "/api";

export interface SavedSchedule {
  /** null when none is saved (the website then uses SCHEDULE from data/content.ts). */
  items: ScheduleItem[] | null;
  /** The schedule's own date (YYYY-MM-DD), separate from the home page event date. null = follow the event date. */
  date: string | null;
}

export async function getSavedSchedule(): Promise<SavedSchedule> {
  const res = await fetch(`${API_BASE}/schedule.php`);
  if (!res.ok) {
    throw new Error("Failed to load schedule.");
  }
  const body: { data: ScheduleItem[] | null; date: string | null } = await res.json();
  return {
    items: Array.isArray(body.data) && body.data.length > 0 ? body.data : null,
    date: typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : null,
  };
}

async function post(payload: { schedule: ScheduleItem[] | null } | { date: string | null }): Promise<void> {
  const res = await fetch(`${API_BASE}/update_schedule.php`, {
    method: "POST",
    headers: {
      "X-Admin-Token": import.meta.env.VITE_ADMIN_PASSWORD,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error((data && typeof data.error === "string" && data.error) || "Failed to update schedule.");
  }
}

/** Pass null to reset to the website default. */
export const updateSchedule = (schedule: ScheduleItem[] | null) => post({ schedule });

/** Pass null to follow the home page event date again. */
export const updateScheduleDate = (date: string | null) => post({ date });

export function useSchedule(): { items: ScheduleItem[]; dateShort: string; dateLong: string } {
  const event = useEventInfo();
  const [saved, setSaved] = useState<SavedSchedule>({ items: null, date: null });

  useEffect(() => {
    let cancelled = false;
    getSavedSchedule()
      .then((s) => {
        if (!cancelled) setSaved(s);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const dates = saved.date ? formatEventDate(saved.date) : event;
  return { items: saved.items ?? SCHEDULE, dateShort: dates.dateShort, dateLong: dates.dateLong };
}
