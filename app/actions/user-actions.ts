"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function completeOnboarding(formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;
    const bio = formData.get("bio") as string;
    const currentTitle = formData.get("currentTitle") as string;
    const location = formData.get("location") as string;

    if (!currentTitle || !location) {
      return { success: false, error: "Missing required fields" };
    }

    // Wrap in a transaction to ensure both user and profile update
    await prisma.$transaction([
      prisma.userProfile.upsert({
        where: { userId },
        update: {
          bio,
          currentTitle,
          location,
        },
        create: {
          userId,
          bio,
          currentTitle,
          location,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { isOnboarded: true },
      }),
    ]);
    
    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
