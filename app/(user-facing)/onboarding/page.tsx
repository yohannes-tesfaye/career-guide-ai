"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeOnboarding } from "@/app/actions/user-actions";
import { toast } from "sonner"; // They have sonner installed!

export default function OnboardingPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await completeOnboarding(formData);

    if (result.success) {
      toast.success("Profile fully onboarded!");
      router.push("/dashboard");
    } else {
      toast.error(result.error || "Failed to complete onboarding.");
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome to Career Guide AI</CardTitle>
          <CardDescription>
            Let's get to know you better. Complete your profile to access your personalized career mentor.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentTitle">Current Title / Profession</Label>
              <Input
                id="currentTitle"
                name="currentTitle"
                placeholder="e.g. Computer Science Student, Junior Developer"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g. Gondar, Ethiopia"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <textarea
                id="bio"
                name="bio"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Tell us a little bit about your career goals..."
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md" type="submit" disabled={isPending}>
              {isPending ? "Saving Profile..." : "Complete Setup & Go to Dashboard"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
