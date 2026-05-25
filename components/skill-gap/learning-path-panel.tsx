"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { friendlyAiMessage } from "@/lib/ai/messages";

export function LearningPathPanel({ skillGapId }: { skillGapId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const generatePath = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/learning-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillGapId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(friendlyAiMessage(new Error(data.error ?? "Failed")));
        return;
      }
      toast.success("Learning path saved");
      if (data.learningPathId) {
        router.push(`/learning-path/${data.learningPathId}`);
      }
    } catch {
      toast.error("Could not generate learning path");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpenIcon className="size-4" />
          Learning path
        </CardTitle>
        <CardDescription>
          Get course suggestions saved to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={generatePath} disabled={loading}>
          {loading ? (
            <Loader2Icon className="mr-2 size-4 animate-spin" />
          ) : (
            <BookOpenIcon className="mr-2 size-4" />
          )}
          Generate & open learning path
        </Button>
      </CardContent>
    </Card>
  );
}
