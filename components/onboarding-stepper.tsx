"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, Plus, X } from "lucide-react";

interface WorkExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  graduationYear: string;
}

interface Skill {
  name: string;
  category: string;
  proficiency: number;
}

interface OnboardingData {
  bio: string;
  currentTitle: string;
  location: string;
  workExperiences: WorkExperience[];
  education: Education[];
  skills: Skill[];
  careerGoal: string;
}

const steps = [
  { id: 1, title: "Profile", description: "Basic information" },
  { id: 2, title: "Work Experience", description: "Your professional journey" },
  { id: 3, title: "Education", description: "Academic background" },
  { id: 4, title: "Skills", description: "Your expertise" },
  { id: 5, title: "Career Goals", description: "Future aspirations" },
];

export default function OnboardingStepper() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    bio: "",
    currentTitle: "",
    location: "",
    workExperiences: [],
    education: [],
    skills: [],
    careerGoal: "",
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

  const nextStep = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const addWorkExperience = () => {
    if (tempWork.company && tempWork.role) {
      setData({
        ...data,
        workExperiences: [...data.workExperiences, tempWork],
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
        education: [...data.education, tempEducation],
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
        skills: [...data.skills, tempSkill],
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

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("bio", data.bio);
    formData.append("currentTitle", data.currentTitle);
    formData.append("location", data.location);
    formData.append("workExperiences", JSON.stringify(data.workExperiences));
    formData.append("education", JSON.stringify(data.education));
    formData.append("skills", JSON.stringify(data.skills));
    formData.append("careerGoal", data.careerGoal);

    try {
      const { completeFullOnboarding } =
        await import("@/app/actions/user-actions");
      const result = await completeFullOnboarding(formData);

      if (result.success) {
        window.location.href = "/dashboard";
      } else {
        console.error("Failed to complete onboarding:", result.error);
      }
    } catch (error) {
      console.error("Error submitting onboarding:", error);
    }
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep >= step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id}
                </div>
                {step.id < steps.length && (
                  <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentTitle">
                  Current Title / Profession *
                </Label>
                <Input
                  id="currentTitle"
                  value={data.currentTitle}
                  onChange={(e) =>
                    setData({ ...data, currentTitle: e.target.value })
                  }
                  placeholder="e.g. Software Engineer, Student"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={data.location}
                  onChange={(e) =>
                    setData({ ...data, location: e.target.value })
                  }
                  placeholder="e.g. Addis Ababa, Ethiopia"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={data.bio}
                  onChange={(e) => setData({ ...data, bio: e.target.value })}
                  placeholder="Tell us about your career goals..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
                <h4 className="font-medium">Add Work Experience</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
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
                    <Label htmlFor="role">Role *</Label>
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
                    className="min-h-[80px]"
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
                  <h4 className="font-medium">Added Experiences</h4>
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
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
                <h4 className="font-medium">Add Education</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution *</Label>
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
                    <Label htmlFor="degree">Degree *</Label>
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
                  <h4 className="font-medium">Added Education</h4>
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
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
                <h4 className="font-medium">Add Skill</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="skillName">Skill Name *</Label>
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
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="careerGoal">Career Goal</Label>
                <Textarea
                  id="careerGoal"
                  value={data.careerGoal}
                  onChange={(e) =>
                    setData({ ...data, careerGoal: e.target.value })
                  }
                  placeholder="Describe your career aspirations and the type of role you're looking for..."
                  className="min-h-30"
                />
              </div>
              <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
                <h4 className="font-medium">Summary</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Title:</strong> {data.currentTitle}
                  </p>
                  <p>
                    <strong>Location:</strong> {data.location}
                  </p>
                  <p>
                    <strong>Work Experiences:</strong>{" "}
                    {data.workExperiences.length}
                  </p>
                  <p>
                    <strong>Education:</strong> {data.education.length}
                  </p>
                  <p>
                    <strong>Skills:</strong> {data.skills.length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          {currentStep === steps.length ? (
            <Button type="button" onClick={handleSubmit}>
              Complete Onboarding
            </Button>
          ) : (
            <Button type="button" onClick={nextStep}>
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
