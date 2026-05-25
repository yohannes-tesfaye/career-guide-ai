import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    const resume = await prisma.resume.findFirst({
      where: { userId: session.user.id, isPrimary: true },
      include: {
        workExperience: {
          orderBy: { startDate: "desc" },
        },
        education: {
          orderBy: { graduationYear: "desc" },
        },
      },
    });

    const userSkills = await prisma.userSkill.findMany({
      where: { userId: session.user.id },
      include: {
        skill: true,
      },
      orderBy: {
        proficiencyLevel: "desc",
      },
    });

    return NextResponse.json({
      bio: userProfile?.bio || "",
      currentTitle: userProfile?.currentTitle || "",
      location: userProfile?.location || "",
      workExperiences: resume?.workExperience || [],
      education: resume?.education || [],
      skills: userSkills.map((us) => ({
        id: us.id,
        name: us.skill.name,
        category: us.skill.category,
        proficiency: us.proficiencyLevel,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bio, currentTitle, location, workExperiences, education, skills } = body;

    await prisma.$transaction(async (tx) => {
      // Update user profile
      await tx.userProfile.upsert({
        where: { userId: session.user.id },
        update: {
          bio,
          currentTitle,
          location,
        },
        create: {
          userId: session.user.id,
          bio,
          currentTitle,
          location,
        },
      });

      // Get or create resume
      let resume = await tx.resume.findFirst({
        where: { userId: session.user.id, isPrimary: true },
      });

      if (!resume) {
        resume = await tx.resume.create({
          data: {
            userId: session.user.id,
            isPrimary: true,
          },
        });
      }

      // Delete existing work experiences and education
      await tx.workExperience.deleteMany({
        where: { resumeId: resume.id },
      });

      await tx.education.deleteMany({
        where: { resumeId: resume.id },
      });

      // Create new work experiences
      for (const exp of workExperiences) {
        if (exp.company && exp.role) {
          await tx.workExperience.create({
            data: {
              resumeId: resume.id,
              company: exp.company,
              role: exp.role,
              startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              descriptionBullets: exp.description || "",
            },
          });
        }
      }

      // Create new education
      for (const edu of education) {
        if (edu.institution && edu.degree) {
          await tx.education.create({
            data: {
              resumeId: resume.id,
              institution: edu.institution,
              degree: edu.degree,
              fieldOfStudy: edu.fieldOfStudy || null,
              startDate: edu.startDate ? new Date(edu.startDate) : null,
              endDate: edu.endDate ? new Date(edu.endDate) : null,
              graduationYear: edu.graduationYear ? parseInt(edu.graduationYear) : null,
            },
          });
        }
      }

      // Delete existing user skills
      await tx.userSkill.deleteMany({
        where: { userId: session.user.id },
      });

      // Create new skills
      for (const skill of skills) {
        if (skill.name) {
          let skillRecord = await tx.skill.findUnique({
            where: { name: skill.name },
          });

          if (!skillRecord) {
            skillRecord = await tx.skill.create({
              data: {
                name: skill.name,
                category: skill.category || "Technical",
              },
            });
          }

          await tx.userSkill.create({
            data: {
              userId: session.user.id,
              skillId: skillRecord.id,
              proficiencyLevel: skill.proficiency || 50,
            },
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
