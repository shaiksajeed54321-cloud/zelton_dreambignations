import { useEffect, useState } from "react";
import { EVENT } from "../data/content";
import { getHomeInfo, type HomeInfo } from "./homeApi";

const IST = "+05:30";

// Fetch the admin-saved event date once and share it between all sections.
let savedInfoPromise: Promise<HomeInfo | null> | null = null;
function loadSavedInfo(): Promise<HomeInfo | null> {
  savedInfoPromise ??= getHomeInfo().catch(() => null);
  return savedInfoPromise;
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const validTime = (value: string | undefined, fallback: string) =>
  value && TIME_RE.test(value.trim()) ? value.trim() : fallback;

function to12Hour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${String(h % 12 || 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
}

function ordinal(day: number): string {
  if (day % 100 >= 11 && day % 100 <= 13) return `${day}th`;
  return `${day}${["th", "st", "nd", "rd"][day % 10 > 3 ? 0 : day % 10]}`;
}

/** Formats a YYYY-MM-DD date the same way everywhere (short: 25 April 2026, long: Saturday, 25 April 2026). */
export function formatEventDate(date: string): { dateShort: string; dateLong: string; dateOrdinal: string } {
  // Noon UTC keeps the calendar day the same in every timezone.
  const d = new Date(`${date}T12:00:00Z`);
  const day = d.getUTCDate();
  const month = d.toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" });
  const weekday = d.toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" });
  const year = d.getUTCFullYear();
  return {
    dateShort: `${day} ${month} ${year}`,
    dateLong: `${weekday}, ${day} ${month} ${year}`,
    dateOrdinal: `${ordinal(day)} ${month} ${year}`,
  };
}

export interface EventInfo {
  name: string;
  description: string;
  venueName: string;
  address: string;
  iso: string; // countdown target
  dateShort: string; // 25 April 2026
  dateLong: string; // Saturday, 25 April 2026
  dateOrdinal: string; // 25th April 2026
  venueDateOrdinal: string; // the Venue & Time section's own date (defaults to the event date)
  timeRange: string; // 09:00 AM - 01:00 PM
  mapUrl: string; // embedded map
  directionsUrl: string; // opens Google Maps / Maps app
}

/** Admin-saved values win; anything empty/invalid falls back to EVENT in data/content.ts. */
export function buildEventInfo(saved: HomeInfo | null): EventInfo {
  const startTime = validTime(saved?.starttime, EVENT.startTime);
  const endTime = validTime(saved?.endtime, EVENT.endTime);
  const venueName = saved?.venue?.trim() || EVENT.venueName;
  const address = saved?.address?.trim() || EVENT.address;

  const match = saved?.eventdate?.match(/^(\d{4}-\d{2}-\d{2})/);
  let date = match ? match[1] : EVENT.date;
  let iso = `${date}T${startTime}:00${IST}`;
  if (Number.isNaN(new Date(iso).getTime())) {
    date = EVENT.date;
    iso = `${date}T${startTime}:00${IST}`;
  }
  const venueMatch = saved?.venuedate?.match(/^(\d{4}-\d{2}-\d{2})$/);
  const venueDate = venueMatch && !Number.isNaN(new Date(`${venueMatch[1]}T12:00:00Z`).getTime()) ? venueMatch[1] : date;
  const query = encodeURIComponent(`${venueName}, ${address}`);

  return {
    name: EVENT.name,
    description: EVENT.description,
    venueName,
    address,
    iso,
    ...formatEventDate(date),
    venueDateOrdinal: formatEventDate(venueDate).dateOrdinal,
    timeRange: `${to12Hour(startTime)} – ${to12Hour(endTime)}`,
    mapUrl: `https://maps.google.com/maps?q=${query}&t=m&z=14&output=embed&iwloc=near`,
    directionsUrl: EVENT.mapsLink || `https://www.google.com/maps/dir/?api=1&destination=${query}`,
  };
}

export function useEventInfo(): EventInfo {
  const [info, setInfo] = useState<EventInfo>(() => buildEventInfo(null));

  useEffect(() => {
    let cancelled = false;
    loadSavedInfo().then((saved) => {
      if (!cancelled) setInfo(buildEventInfo(saved));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return info;
}
