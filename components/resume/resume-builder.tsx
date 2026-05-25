"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OptimizedResumeSection, ResumeProfileData } from "./types";
import { ResumePreview } from "./resume-preview";
import { downloadResumePdf } from "./resume-pdf";
import { toast } from "sonner";
import {
  DownloadIcon,
  EyeIcon,
  FileTextIcon,
  Loader2Icon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";

interface ResumeBuilderProps {
  profile: ResumeProfileData;
}

export function ResumeBuilder({ profile }: ResumeBuilderProps) {
  const [targetRole, setTargetRole] = useState(
    profile.currentTitle ?? ""
  );
  const [resume, setResume] = useState<OptimizedResumeSection | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setWarning(null);
    try {
      const res = await fetch("/api/resume/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to generate");
        return;
      }
      setResume(data.resume);
      setSource(data.source);
      setWarning(data.warning);
      toast.success(
        data.source === "gemini"
          ? "Resume generated with Gemini"
          : "Resume generated (offline template)"
      );
      if (
        data.warning &&
        !String(data.warning).includes("GoogleGenerativeAI")
      ) {
        toast.info(data.warning);
      }
    } catch {
      toast.error("Could not generate resume");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resume) {
      toast.error("Generate a resume first");
      return;
    }
    downloadResumePdf(
      profile.name,
      profile.email,
      profile.location ?? undefined,
      resume
    );
    toast.success("PDF downloaded");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserIcon className="size-4" />
              Your profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Name:</span> {profile.name}
            </p>
            <p>
              <span className="text-muted-foreground">Title:</span>{" "}
              {profile.currentTitle ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Location:</span>{" "}
              {profile.location ?? "—"}
            </p>
            <div className="flex flex-wrap gap-1 pt-1">
              {profile.skills.slice(0, 8).map((s) => (
                <Badge key={s.name} variant="outline" className="text-xs">
                  {s.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileTextIcon className="size-4" />
              Generate resume
            </CardTitle>
            <CardDescription>
              One target role → AI prompt → preview → PDF
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="targetRole">Target role</Label>
              <Input
                id="targetRole"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Frontend Developer"
              />
            </div>
            <Button className="w-full" onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              ) : (
                <SparklesIcon className="mr-2 size-4" />
              )}
              Generate resume
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownload}
              disabled={!resume}
            >
              <DownloadIcon className="mr-2 size-4" />
              Download PDF
            </Button>
            {source && (
              <p className="text-xs text-muted-foreground">
                Source: {source}
                {warning ? ` · ${warning}` : ""}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="min-h-[480px]">
        <CardHeader>
          <CardTitle className="text-lg">Resume output</CardTitle>
        </CardHeader>
        <CardContent>
          {!resume ? (
            <p className="py-20 text-center text-muted-foreground text-sm">
              Enter a target role and click Generate resume.
            </p>
          ) : (
            <Tabs defaultValue="preview">
              <TabsList>
                <TabsTrigger value="preview">
                  <EyeIcon className="mr-1 size-3.5" />
                  Preview
                </TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="mt-4 rounded-lg border bg-card p-6">
                <ResumePreview profile={profile} resume={resume} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
