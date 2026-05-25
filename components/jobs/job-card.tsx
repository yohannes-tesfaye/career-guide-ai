"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, WifiIcon } from "lucide-react";
import type { JobListItem } from "@/lib/jobs/types";

interface JobCardProps {
  job: JobListItem;
}

export function JobCard({ job }: JobCardProps) {
  const skills = (job.requiredSkills ?? []).slice(0, 4);
  const href = `/jobs/${job.id}`;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="line-clamp-2 text-lg">{job.title}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-1">
              <Building2 className="size-3.5 shrink-0" />
              <span className="truncate">{job.company}</span>
            </CardDescription>
          </div>
          {job.remote && (
            <Badge variant="secondary" className="shrink-0">
              <WifiIcon className="mr-1 size-3" />
              Remote
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          {job.location}
        </p>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {job.description.slice(0, 200)}
          {job.description.length > 200 ? "..." : ""}
        </p>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {skills.map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {(job.requiredSkills?.length ?? 0) > 4 && (
              <Badge variant="outline" className="text-xs">
                +{(job.requiredSkills?.length ?? 0) - 4}
              </Badge>
            )}
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <Button asChild size="sm">
            <Link href={href}>View & analyze</Link>
          </Button>
          {job.url && (
            <Button asChild size="sm" variant="outline">
              <a href={job.url} target="_blank" rel="noopener noreferrer">
                Original posting
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
