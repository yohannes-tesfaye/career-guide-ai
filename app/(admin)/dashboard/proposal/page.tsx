import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectProposalPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Proposal</CardTitle>
          <CardDescription>Draft and manage your project proposals and portfolio deliverables.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center rounded-md border border-dashed bg-muted/20">
            <span className="text-muted-foreground text-sm">Project proposal document tools coming soon...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
