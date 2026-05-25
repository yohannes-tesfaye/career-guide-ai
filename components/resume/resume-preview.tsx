import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { OptimizedResumeSection, ResumeProfileData } from "./types";

export function ResumePreview({
  profile,
  resume,
}: {
  profile: ResumeProfileData;
  resume: OptimizedResumeSection;
}) {
  return (
    <article className="mx-auto max-w-2xl space-y-5 text-sm leading-relaxed">
      <header className="border-b pb-4 text-center">
        <h1 className="text-2xl font-bold">{profile.name}</h1>
        <p className="font-medium text-primary">{resume.headline}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {[profile.location, profile.email].filter(Boolean).join(" · ")}
        </p>
      </header>
      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider">Summary</h2>
        <p>{resume.summary}</p>
      </section>
      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider">Skills</h2>
        <div className="flex flex-wrap gap-1">
          {resume.skills.map((s) => (
            <Badge key={s} variant="secondary" className="text-xs">
              {s}
            </Badge>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider">Experience</h2>
        {resume.experienceBullets.map((exp, i) => (
          <div key={i} className="mb-3">
            <p className="font-semibold">
              {exp.role} — {exp.company}
            </p>
            <ul className="mt-1 list-disc pl-5 text-muted-foreground">
              {exp.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      {resume.educationBullets.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider">Education</h2>
          {resume.educationBullets.map((edu, i) => (
            <p key={i}>
              <strong>{edu.degree}</strong>, {edu.institution}
            </p>
          ))}
        </section>
      )}
      <Separator />
      <p className="text-xs text-muted-foreground">
        ATS keywords: {resume.atsKeywords.join(" · ")}
      </p>
    </article>
  );
}
