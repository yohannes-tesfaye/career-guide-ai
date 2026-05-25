"use client";

import { useCallback, useEffect, useState } from "react";
import { JobFilters, type JobFilterState } from "./job-filters";
import { JobCard } from "./job-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { JobListItem } from "@/lib/jobs/types";
import { toast } from "sonner";

const defaultFilters: JobFilterState = {
  search: "",
  remote: "all",
  location: "all",
  jobType: "all",
};

export function JobExplorer() {
  const [filters, setFilters] = useState<JobFilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<JobFilterState>(defaultFilters);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "12",
        sync: "true",
      });

      if (appliedFilters.search) params.set("search", appliedFilters.search);
      if (appliedFilters.remote !== "all")
        params.set("remote", appliedFilters.remote);
      if (appliedFilters.location !== "all")
        params.set("location", appliedFilters.location);
      if (appliedFilters.jobType !== "all")
        params.set("jobType", appliedFilters.jobType);

      const res = await fetch(`/api/jobs?${params}`);
      if (!res.ok) throw new Error("Failed to load jobs");

      const data = await res.json();
      setJobs(data.jobs);
      setLocations(data.filters?.locations ?? []);
      setJobTypes(data.filters?.jobTypes ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch {
      toast.error("Could not load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = () => {
    setPage(1);
    setAppliedFilters({ ...filters });
  };

  const handleClear = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <JobFilters
        filters={filters}
        locations={locations}
        jobTypes={jobTypes}
        onChange={setFilters}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No jobs match your filters. Try adjusting your search.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
