"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ChevronLeft, Save } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface WorkExperience {
  id?: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  graduationYear: string;
}

interface Skill {
  id?: string;
  name: string;
  category: string;
  proficiency: number;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [data, setData] = useState({
    bio: "",
    currentTitle: "",
    location: "",
    workExperiences: [] as WorkExperience[],
    education: [] as Education[],
    skills: [] as Skill[],
  });

  const [tempWork, setTempWork] = useState<WorkExperience>({
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [tempEducation, setTempEducation] = useState<Education>({
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    graduationYear: "",
  });

  const [tempSkill, setTempSkill] = useState<Skill>({
    name: "",
    category: "Technical",
    proficiency: 50,
  });

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const userData = await response.json();
        setData({
          bio: userData.bio || "",
          currentTitle: userData.currentTitle || "",
          location: userData.location || "",
          workExperiences: userData.workExperiences || [],
          education: userData.education || [],
          skills: userData.skills || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const addWorkExperience = () => {
    if (tempWork.company && tempWork.role) {
      setData({
        ...data,
        workExperiences: [...data.workExperiences, { ...tempWork }],
      });
      setTempWork({
        company: "",
        role: "",
        startDate: "",
        endDate: "",
        description: "",
      });
    }
  };

  const removeWorkExperience = (index: number) => {
    setData({
      ...data,
      workExperiences: data.workExperiences.filter((_, i) => i !== index),
    });
  };

  const addEducation = () => {
    if (tempEducation.institution && tempEducation.degree) {
      setData({
        ...data,
        education: [...data.education, { ...tempEducation }],
      });
      setTempEducation({
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        graduationYear: "",
      });
    }
  };

  const removeEducation = (index: number) => {
    setData({
      ...data,
      education: data.education.filter((_, i) => i !== index),
    });
  };

  const addSkill = () => {
    if (tempSkill.name) {
      setData({
        ...data,
        skills: [...data.skills, { ...tempSkill }],
      });
      setTempSkill({
        name: "",
        category: "Technical",
        proficiency: 50,
      });
    }
  };

  const removeSkill = (index: number) => {
    setData({
      ...data,
      skills: data.skills.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        router.push("/profile");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="container py-10 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update your basic profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentTitle">Current Title / Profession</Label>
              <Input
                id="currentTitle"
                value={data.currentTitle}
                onChange={(e) =>
                  setData({ ...data, currentTitle: e.target.value })
                }
                placeholder="e.g. Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={data.location}
                onChange={(e) => setData({ ...data, location: e.target.value })}
                placeholder="e.g. Addis Ababa, Ethiopia"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                value={data.bio}
                onChange={(e) => setData({ ...data, bio: e.target.value })}
                placeholder="Tell us about your career goals..."
                className="min-h-25"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Work Experience</CardTitle>
            <CardDescription>
              Add your professional work history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
              <h4 className="font-medium">Add Work Experience</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={tempWork.company}
                    onChange={(e) =>
                      setTempWork({ ...tempWork, company: e.target.value })
                    }
                    placeholder="Company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={tempWork.role}
                    onChange={(e) =>
                      setTempWork({ ...tempWork, role: e.target.value })
                    }
                    placeholder="Job title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={tempWork.startDate}
                    onChange={(e) =>
                      setTempWork({ ...tempWork, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={tempWork.endDate}
                    onChange={(e) =>
                      setTempWork({ ...tempWork, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={tempWork.description}
                  onChange={(e) =>
                    setTempWork({ ...tempWork, description: e.target.value })
                  }
                  placeholder="Describe your responsibilities..."
                  className="min-h-20"
                />
              </div>
              <Button
                type="button"
                onClick={addWorkExperience}
                size="sm"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Experience
              </Button>
            </div>

            {data.workExperiences.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Your Work Experiences</h4>
                {data.workExperiences.map((exp, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{exp.role}</p>
                      <p className="text-sm text-muted-foreground">
                        {exp.company}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWorkExperience(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Education</CardTitle>
            <CardDescription>Add your educational background</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
              <h4 className="font-medium">Add Education</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    value={tempEducation.institution}
                    onChange={(e) =>
                      setTempEducation({
                        ...tempEducation,
                        institution: e.target.value,
                      })
                    }
                    placeholder="University/School name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree</Label>
                  <Input
                    id="degree"
                    value={tempEducation.degree}
                    onChange={(e) =>
                      setTempEducation({
                        ...tempEducation,
                        degree: e.target.value,
                      })
                    }
                    placeholder="e.g. BSc, MSc"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fieldOfStudy">Field of Study</Label>
                  <Input
                    id="fieldOfStudy"
                    value={tempEducation.fieldOfStudy}
                    onChange={(e) =>
                      setTempEducation({
                        ...tempEducation,
                        fieldOfStudy: e.target.value,
                      })
                    }
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    value={tempEducation.graduationYear}
                    onChange={(e) =>
                      setTempEducation({
                        ...tempEducation,
                        graduationYear: e.target.value,
                      })
                    }
                    placeholder="2024"
                  />
                </div>
              </div>
              <Button
                type="button"
                onClick={addEducation}
                size="sm"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Education
              </Button>
            </div>

            {data.education.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Your Education</h4>
                {data.education.map((edu, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-sm text-muted-foreground">
                        {edu.institution}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEducation(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>
              Add your skills and proficiency levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
              <h4 className="font-medium">Add Skill</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="skillName">Skill Name</Label>
                  <Input
                    id="skillName"
                    value={tempSkill.name}
                    onChange={(e) =>
                      setTempSkill({ ...tempSkill, name: e.target.value })
                    }
                    placeholder="e.g. JavaScript, Python"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skillCategory">Category</Label>
                  <Input
                    id="skillCategory"
                    value={tempSkill.category}
                    onChange={(e) =>
                      setTempSkill({ ...tempSkill, category: e.target.value })
                    }
                    placeholder="Technical, Soft Skill"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="proficiency">
                  Proficiency Level: {tempSkill.proficiency}%
                </Label>
                <Input
                  id="proficiency"
                  type="range"
                  min="0"
                  max="100"
                  value={tempSkill.proficiency}
                  onChange={(e) =>
                    setTempSkill({
                      ...tempSkill,
                      proficiency: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
              <Button
                type="button"
                onClick={addSkill}
                size="sm"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Skill
              </Button>
            </div>

            {data.skills.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Your Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      {skill.name} ({skill.proficiency}%)
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/profile">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isPending}>
            <Save className="w-4 h-4 mr-2" />
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
