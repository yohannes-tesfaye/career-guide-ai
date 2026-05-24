import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!userProfile) {
    // Should be onboarded, but if not:
    redirect("/onboarding");
  }

  return (
    <div className="container py-10 max-w-2xl mx-auto space-y-6">
      <Card className="relative overflow-hidden shadow-lg border-t-4 border-t-primary">
        <CardHeader className="text-center pb-8 pt-10">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-sm ring-1 ring-border">
            <AvatarImage
              src={session.user.image ?? ""}
              alt={session.user.name}
            />
            <AvatarFallback className="text-2xl">
              {session.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold">
            {session.user.name}
          </CardTitle>
          <CardDescription className="text-lg font-medium text-primary mt-2">
            {userProfile.currentTitle}
          </CardDescription>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-1 mt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-map-pin"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {userProfile.location || "Location not specified"}
          </p>
        </CardHeader>
        <CardContent className="bg-muted/50 p-6 m-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">About Me</h3>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {userProfile.bio || "No professional bio provided yet."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
