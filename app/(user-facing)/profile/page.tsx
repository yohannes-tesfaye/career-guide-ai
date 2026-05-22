"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Mail, User, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  // If not logged in, redirect to login
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/") },
    });
  };

  // Loading state
  if (isPending) {
    return (
      <section className="min-h-[80vh] flex items-center justify-center">
        <p className="text-muted-foreground">Loading your profile...</p>
      </section>
    );
  }

  // Should not render — redirect fires first, but this prevents flash
  if (!session) return null;

  const user = session.user;
  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="min-h-[80vh] py-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">Your Profile</h1>
          <p className="text-muted-foreground text-lg">
            Manage your Career Guide AI account
          </p>
        </div>

        {/* Avatar + name */}
        <Card className="mb-6">
          <CardContent className="flex items-center gap-6 py-6">
            <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="size-20 rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">Career Guide AI Member</p>
            </div>
          </CardContent>
        </Card>

        {/* Account details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <User className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email Address</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="font-medium">{joinedDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sign out */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 size-4" />
          Sign Out
        </Button>

      </div>
    </section>
  );
}