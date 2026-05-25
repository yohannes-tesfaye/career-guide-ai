import { jsPDF } from "jspdf";
import type { OptimizedResumeSection } from "./types";

export function downloadResumePdf(
  name: string,
  email: string | undefined,
  location: string | undefined,
  resume: OptimizedResumeSection
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let y = margin;
  const line = (text: string, size = 11, bold = false) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, 515);
    for (const ln of lines) {
      if (y > 780) {
        doc.addPage();
        y = margin;
      }
      doc.text(ln, margin, y);
      y += size + 4;
    }
  };

  line(name, 18, true);
  line(resume.headline, 12);
  if (location || email) line([location, email].filter(Boolean).join(" · "), 9);
  y += 8;
  line("SUMMARY", 10, true);
  line(resume.summary, 10);
  y += 6;
  line("SKILLS", 10, true);
  line(resume.skills.join(" · "), 10);
  y += 6;
  line("EXPERIENCE", 10, true);
  for (const exp of resume.experienceBullets) {
    line(`${exp.role} — ${exp.company}`, 10, true);
    for (const b of exp.bullets) line(`• ${b}`, 10);
    y += 4;
  }
  if (resume.educationBullets.length) {
    y += 4;
    line("EDUCATION", 10, true);
    for (const edu of resume.educationBullets) {
      line(`${edu.degree}, ${edu.institution}`, 10);
    }
  }

  doc.save(`${name.replace(/\s+/g, "_")}_resume.pdf`);
}
