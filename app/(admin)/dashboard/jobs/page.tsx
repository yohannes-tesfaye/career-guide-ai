import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function JobExplorerPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Explorer</CardTitle>
          <CardDescription>Discover and track job opportunities that match your skills.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center rounded-md border border-dashed bg-muted/20">
            <span className="text-muted-foreground text-sm">Job board and tracking functionality coming soon...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
