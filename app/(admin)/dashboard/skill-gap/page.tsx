import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SkillGapPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Skill-Gap Analysis</CardTitle>
          <CardDescription>Analyze the gap between your current skills and your target role.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center rounded-md border border-dashed bg-muted/20">
            <span className="text-muted-foreground text-sm">Skill gap analysis visualizer coming soon...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
