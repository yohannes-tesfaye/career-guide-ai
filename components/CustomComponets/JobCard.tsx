import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

// Shape of a job listing coming from external APIs (Adzuna, Arbeitnow)
export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  description: string;
  posted_date: string;
  source: string;
  url: string;
}

interface JobCardProps {
  job: JobListing;
  // Optional — used later in skill-gap page to trigger analysis
  onAnalyze?: (job: JobListing) => void;
}

export function JobCard({ job, onAnalyze }: JobCardProps) {
  const hasSalary = job.salary_min || job.salary_max;

  const formatSalary = (min?: number, max?: number) => {
    if (min && max) return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return null;
  };

  const postedDate = new Date(job.posted_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="flex flex-col gap-0 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{job.title}</CardTitle>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {job.source}
          </Badge>
        </div>

        {/* Company + location */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Building2 className="size-3.5" />
            {job.company}
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {job.location}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Description — capped at 3 lines */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {job.description}
        </p>

        {/* Salary + date row */}
        <div className="flex items-center justify-between text-sm">
          {hasSalary ? (
            <span className="flex items-center gap-1 font-medium text-primary">
              <DollarSign className="size-3.5" />
              {formatSalary(job.salary_min, job.salary_max)}
            </span>
          ) : (
            <span className="text-muted-foreground">Salary not listed</span>
          )}

          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="size-3.5" />
            {postedDate}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1">
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              View Job
            </a>
          </Button>

          {onAnalyze && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onAnalyze(job)}
            >
              Analyze Fit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}