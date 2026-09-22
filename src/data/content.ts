import type { GalleryBlock, NavLink, ScheduleItem, Speaker, StatItem } from "./types";

export const LOGO_URL =
  "https://dreambignation.org/wp-content/uploads/2019/05/DREAM-BIG-NATION-14.png";

export const HERO_BG_URL =
  "https://dreambignation.org/wp-content/uploads/2019/05/slide_1-1.jpg";

export const STATS_BG_URL =
  "https://dreambignation.org/wp-content/uploads/2019/05/slide_3-1.jpg";

export const CTA_BG_URL =
  "https://dreambignation.org/wp-content/uploads/2019/05/bg_background.jpg";

export const EVENT_DATE_ISO = "2026-04-25T09:00:00+05:30";

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/#home" },
  { label: "Schedules", href: "/#schedule" },
  { label: "Speakers", href: "/#speakers" },
  { label: "BeReady", href: "/study-materials", to: "/study-materials" },
  { label: "Jobs", href: "/jobs", to: "/jobs" },
  {
    label: "More",
    href: "/#",
    children: [
      { label: "Career Goals", href: "/#" },
      { label: "About Us", href: "/#organizer" },
      { label: "Contact Us", href: "/#venue" },
    ],
  },
];

export const STATS: StatItem[] = [
  { icon: "speakers", value: 15, suffix: "", label: "Our Visionary Speakers" },
  { icon: "students", value: 300, suffix: "", label: "Number of Students Attended" },
  { icon: "hours", value: 78, suffix: "", label: "Mentorship Hours Delivered" },
  { icon: "events", value: 2, suffix: "", label: "Number of Events Conducted" },
];

export const SCHEDULE: ScheduleItem[] = [
  { time: "09:30 AM", title: "Registration" },
  {
    time: "10:00 AM",
    title: "Exercise 1",
    description: [
      "Self Introduction by Students (Name, University/College, Course, Year & Dream Big Career Goals.",
      "Ice Breaking Session: Every student shall acquaint/interact with 10 new students from other Universities/Colleges",
    ],
  },
  { time: "10:30 AM", title: "Recitation by Students" },
  { time: "10:35 AM", title: "Self Introduction by Mentors" },
  {
    time: "10:40 AM",
    title: "Objectives, expected output, outcome, and impact of Early Goal Setting",
    description: [
      "Dream Big Interactive Session - by Ms. N T Abroo, IAS Retd. Member, Karnataka State Minorities Commission & Director, Public Affairs Centre, Bengaluru and Prof. S.A. Kazi, Former Registrar, Karnataka State Akkamahadevi Women's University, Vijayapura.",
    ],
  },
  {
    time: "10:45 AM",
    title: "Exercise 2",
    description: [
      "A story on Early Goal Setting: Dream Big. (EGS:DB).",
      "Familiarization with Brochure - 40+ Dream Big Career Goals, objectives, expected output & follow up help from the event team.",
      "An exercise encouraging students to select any 5 DREAM BIG CAREER GOALS of interest from the list.",
      "Encourage students to ask questions to the mentors on the selected 5 Goals - prospects & challenges during Q & A session.",
      "Students are encouraged to decide 1 out of the 5 selected CAREER GOALS in the next 3 months through personal research and guidance from seniors, professors & successful persons.",
      "Students are encouraged to read 5 factors as part of the exercise on how to accomplish their set CAREER GOALS.",
    ],
  },
  {
    time: "11:15 AM",
    title: "Personal Stories by STAR SPEAKERS (Any two)",
    description: [
      "A Mentor of Academics/Scientific Excellence/Innovation/Policy Making (5-10 Minutes)",
      "Hon'ble Justice (Supreme Court/High Court)/a Senior Defence Officer (5-10 Minutes)",
      "A Mentor/An Institution of Civil Service (IAS/IPS/IFS/IRS/IAAS/IPoS/IIS/IRMS/CSE) (5-10 Minutes) + Latest Civil Services Examination Successful candidates.",
      "An Entrepreneur/Professional/Institution builder (5-10 Minutes)",
    ],
  },
  { time: "11:45 AM", title: "Questions & Answers Session" },
  {
    time: "12:30 PM",
    title: "POST EVENT Dream Big Goal wise - follow up",
    description: ["Career mentors of Civil Services, Academics, Judiciary & Business will share their contact numbers."],
  },
  {
    time: "12:35 PM",
    title: "Online interactive session on EGS",
    description: ["Dream Big by APSWB on every alternate Sunday. Registration link is available on the student registration page."],
  },
  {
    time: "12:40 PM",
    title: "Exercise 3",
    description: [
      "Personality/Leadership development - Newspaper Reading, Joining Student Clubs, Reading Biographies, Doing Internships, Listening to best minds etc.",
    ],
  },
  { time: "12:50 PM", title: "Online feedback by students about the event" },
  {
    time: "12:55 PM",
    title: "Chanting the slogan in unison",
    description: ["“My today's takeaway is - EARLY GOAL SETTING: DREAM BIG”"],
  },
  {
    time: "1:00 PM",
    title: "Vote of Thanks",
    description: [
      "Dr. Mohammed Salahuddin, Principal, Al Ameen College of Pharmacy, Bengaluru & Prof. M.S. Neelofer, H.O.D, Department of Mathematics, Hasnath College, Bengaluru / Dr. Asma Anjum, Assoc. Professor (CSE), HKBK College of Engineering, Bengaluru",
    ],
  },
  {
    time: "1:15 PM",
    title: "Lunch",
    description: [
      "Students are encouraged to have lunch with students of other Universities/Colleges + Mentor of choice.",
    ],
  },
];

export const ORGANIZER_HIGHLIGHTS = [
  "We have 10+ Years",
  "100+ Accomplished Mentors",
  "50+ Colleges Across Karnataka from which students are impacting",
];

export const GALLERY_BLOCKS: GalleryBlock[] = [
  {
    heading: "Inspiring Moments",
    suffix: "of 25th October Event 2025",
    images: [
      "https://dreambignation.org/wp-content/uploads/2019/05/WhatsApp-Image-2025-11-16-at-9.33.41-PM.jpeg",
      "https://dreambignation.org/wp-content/uploads/2019/05/WhatsApp-Image-2025-11-16-at-9.33.42-PM.jpeg",
    ],
  },
  {
    heading: "Janab Niyaz Ahmed Dafedar (Retd), District Session Judge",
    suffix: "STAR SPEAKER shared his career story, on 27th September 2025 event",
    images: ["https://dreambignation.org/wp-content/uploads/2019/05/Speaker.png"],
  },
  {
    heading: "Inspiring Moments",
    suffix: "of 23rd August Event 2025",
    images: [
      "https://dreambignation.org/wp-content/uploads/2019/05/WhatsApp-Image-2025-08-26-at-2.10.50-PM-scaled.jpeg",
      "https://dreambignation.org/wp-content/uploads/2019/05/WhatsApp-Image-2025-08-26-at-2.10.47-PM-1.jpeg",
      "https://dreambignation.org/wp-content/uploads/2019/05/WhatsApp-Image-2025-08-26-at-2.10.47-PM.jpeg",
      "https://dreambignation.org/wp-content/uploads/2019/05/WhatsApp-Image-2025-08-26-at-2.10.51-PM-1-scaled.jpeg",
      "https://dreambignation.org/wp-content/uploads/2019/05/WhatsApp-Image-2025-08-26-at-2.10.51-PM.jpeg",
    ],
  },
];

export const SPEAKERS: Speaker[] = [
  {
    name: "Ms. N.T. Abroo",
    role: "IAS Retd, Member, Karnataka State Minorities Commission & Director",
    photo: "https://dreambignation.org/wp-content/uploads/2025/07/WhatsApp-Image-2025-07-17-at-10.29.51-PM-1.jpeg",
  },
  {
    name: "Janab Umar Ismail Khan",
    role: "Chairman, Al Ameen Group of Institutions, Karnataka",
    photo: "https://dreambignation.org/wp-content/uploads/2025/07/Untitled-design-9.png",
  },
  {
    name: "Janab Md Mohsin",
    role: "IAS, Principal Secretary to Government of Karnataka",
    photo: "https://dreambignation.org/wp-content/uploads/2025/07/Untitled-design-12.png",
  },
  {
    name: "Mr. Nongjai Md Ali Akram Shah",
    role: "IAS 2020 Batch, currently CEO, Vijayanagara District",
    photo: "https://dreambignation.org/wp-content/uploads/2025/07/Untitled-design-15.png",
  },
  {
    name: "Dr. Ariz Ahamad",
    role: "Additional Chief Secretary, Government of Assam",
    photo: "https://dreambignation.org/wp-content/uploads/2025/07/Untitled-design-7.png",
  },
  {
    name: "Prof. AH Rajasab",
    role: "Former Vice-Chancellor, Tumkur University",
    photo: "https://dreambignation.org/wp-content/uploads/2025/07/Untitled-design-10.png",
  },
  {
    name: "Mr. PC Jaffer",
    role: "IAS, Secretary Finance, Government of Karnataka",
    photo: "https://dreambignation.org/wp-content/uploads/2025/07/Untitled-design-13.png",
  },
  {
    name: "Dr. Inayathulla",
    role: "Professor (Retd.), UVCE Bengaluru",
    photo: "https://dreambignation.org/wp-content/uploads/2025/07/Untitled-design-16.png",
  },
  {
    name: "Ms. Shamim Banu",
    role: "IAS Retd, Former Additional Chief Secretary, Government of Karnataka",
    photo: "https://dreambignation.org/wp-content/uploads/2025/07/Untitled-design-8.png",
  },
  {
    name: "Prof. Niyamatullah",
    role: "Nagarjuna Engineering College, Bengaluru",
    photo: "https://dreambignation.org/wp-content/uploads/2025/07/Untitled-design-11.png",
  },
  {
    name: "Mr. Imamuddin",
    role: "IRS, C&IT Commissioner GST, Bengaluru",
    photo: "https://dreambignation.org/wp-content/uploads/2025/07/Untitled-design-14.png",
  },
  {
    name: "Mr. Ameen Mudassir",
    role: "Motivational Speaker, Bengaluru",
    photo: "https://dreambignation.org/wp-content/uploads/2025/07/Untitled-design-17.png",
  },
];

export const VENUE_MAP_URL =
  "https://maps.google.com/maps?q=Al%20Ameen%20Educational%20Campus%2C%20Hosur%20Main%20Road%2C%20Opposite%20to%20Lalbagh%20Main%20Gate%2C%20Bengaluru-560027.&t=m&z=14&output=embed&iwloc=near";

export const NEAR_AMENITIES = [
  "Lalbagh Main Gate",
  "Lalbagh Metro Station (Green Line)",
  "Gandhi Bazaar (Basavanagudi Market)",
  "Vidyarthi Bhavan",
];
