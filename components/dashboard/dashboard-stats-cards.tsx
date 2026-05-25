import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUpIcon,
  AwardIcon,
  BookOpenIcon,
  TargetIcon,
} from "lucide-react";

interface DashboardStatsCardsProps {
  avgMatch: number | null;
  skillCount: number;
  analysisCount: number;
  activeLearningPaths: number;
  highFitJobs: number;
}

export function DashboardStatsCards({
  avgMatch,
  skillCount,
  analysisCount,
  activeLearningPaths,
  highFitJobs,
}: DashboardStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Average match rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {avgMatch !== null ? `${avgMatch}%` : "—"}
          </CardTitle>
          <Badge variant="outline" className="w-fit">
            <TrendingUpIcon className="mr-1 size-3" />
            {analysisCount} analyses
          </Badge>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          From your skill-gap reports
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Profile skills</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {skillCount}
          </CardTitle>
          <Badge variant="outline" className="w-fit">
            <AwardIcon className="mr-1 size-3" />
            Saved
          </Badge>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          Skills in your profile
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Learning paths</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {activeLearningPaths}
          </CardTitle>
          <Badge variant="outline" className="w-fit">
            <BookOpenIcon className="mr-1 size-3" />
            Active
          </Badge>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          Gemini-generated curricula
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>High-fit matches</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {highFitJobs}
          </CardTitle>
          <Badge variant="outline" className="w-fit">
            <TargetIcon className="mr-1 size-3" />
            ≥70%
          </Badge>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          Jobs with strong skill alignment
        </CardFooter>
      </Card>
    </div>
  );
}
