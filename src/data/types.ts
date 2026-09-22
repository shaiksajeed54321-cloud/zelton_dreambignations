export interface ScheduleItem {
  time: string;
  title: string;
  description?: string[];
}

export interface Speaker {
  name: string;
  role: string;
  photo: string;
}

export interface GalleryBlock {
  heading: string;
  suffix: string;
  images: string[];
}

export interface StatItem {
  icon: "speakers" | "students" | "hours" | "events";
  value: number;
  suffix: string;
  label: string;
}

export interface NavSubLink {
  label: string;
  to?: string;
  href?: string;
}

export interface NavLink {
  label: string;
  href: string;
  to?: string;
  children?: NavSubLink[];
}

export interface DriveFile {
  id: string;
  name: string;
}
