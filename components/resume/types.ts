import type { OptimizedResumeSection } from "@/lib/gemini/resume";

/** Profile data passed into the resume builder */
export interface ResumeProfileData {
  name: string;
  email?: string;
  currentTitle?: string | null;
  location?: string | null;
  bio?: string | null;
  skills: { name: string; proficiency: number }[];
  workExperience: {
    role: string;
    company: string;
    startDate?: string;
    endDate?: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    fieldOfStudy?: string | null;
    graduationYear?: number | null;
  }[];
}

export type { OptimizedResumeSection };

/**
 * Add these components under components/resume/ as you build Block 4:
 *
 * - resume-header.tsx       — name, title, contact line
 * - resume-summary.tsx      — professional summary section
 * - resume-skills.tsx       — ATS keyword skills grid
 * - resume-experience.tsx   — work history with bullets
 * - resume-education.tsx    — education block
 * - resume-preview.tsx      — full preview layout (used by resume-builder)
 * - resume-pdf-export.tsx   — react-pdf Document/Page export
 * - resume-toolbar.tsx      — optimize, download, target role input
 */
