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

export async function completeFullOnboarding(formData: FormData) {
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
    const workExperiences = JSON.parse(formData.get("workExperiences") as string);
    const education = JSON.parse(formData.get("education") as string);
    const skills = JSON.parse(formData.get("skills") as string);
    const careerGoal = formData.get("careerGoal") as string;

    if (!currentTitle || !location) {
      return { success: false, error: "Missing required fields" };
    }

    await prisma.$transaction(async (tx) => {
      // Create or update user profile
      await tx.userProfile.upsert({
        where: { userId },
        update: {
          bio: careerGoal || bio,
          currentTitle,
          location,
        },
        create: {
          userId,
          bio: careerGoal || bio,
          currentTitle,
          location,
        },
      });

      // Create resume
      const resume = await tx.resume.create({
        data: {
          userId,
          isPrimary: true,
        },
      });

      // Create work experiences
      for (const exp of workExperiences) {
        await tx.workExperience.create({
          data: {
            resumeId: resume.id,
            company: exp.company,
            role: exp.role,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            descriptionBullets: exp.description,
          },
        });
      }

      // Create education
      for (const edu of education) {
        await tx.education.create({
          data: {
            resumeId: resume.id,
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            startDate: edu.startDate ? new Date(edu.startDate) : null,
            endDate: edu.endDate ? new Date(edu.endDate) : null,
            graduationYear: edu.graduationYear ? parseInt(edu.graduationYear) : null,
          },
        });
      }

      // Create skills
      for (const skill of skills) {
        let skillRecord = await tx.skill.findUnique({
          where: { name: skill.name },
        });

        if (!skillRecord) {
          skillRecord = await tx.skill.create({
            data: {
              name: skill.name,
              category: skill.category,
            },
          });
        }

        await tx.userSkill.upsert({
          where: {
            userId_skillId: {
              userId,
              skillId: skillRecord.id,
            },
          },
          update: {
            proficiencyLevel: skill.proficiency,
          },
          create: {
            userId,
            skillId: skillRecord.id,
            proficiencyLevel: skill.proficiency,
          },
        });
      }

      // Mark user as onboarded
      await tx.user.update({
        where: { id: userId },
        data: { isOnboarded: true },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
