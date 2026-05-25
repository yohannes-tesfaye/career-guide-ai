"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SearchIcon, XIcon } from "lucide-react";

export interface JobFilterState {
  search: string;
  remote: string;
  location: string;
  jobType: string;
}

interface JobFiltersProps {
  filters: JobFilterState;
  locations: string[];
  jobTypes: string[];
  onChange: (filters: JobFilterState) => void;
  onSearch: () => void;
  onClear: () => void;
}

export function JobFilters({
  filters,
  locations,
  jobTypes,
  onChange,
  onSearch,
  onClear,
}: JobFiltersProps) {
  return (
    <div className="grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-2 lg:grid-cols-5">
      <div className="space-y-2 lg:col-span-2">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Title, company, skills..."
            className="pl-8"
            value={filters.search}
            onChange={(e) =>
              onChange({ ...filters, search: e.target.value })
            }
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Remote</Label>
        <Select
          value={filters.remote}
          onValueChange={(v) => onChange({ ...filters, remote: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Remote only</SelectItem>
            <SelectItem value="false">On-site only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <Select
          value={filters.location}
          onValueChange={(v) => onChange({ ...filters, location: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {locations.slice(0, 30).map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Job type</Label>
        <Select
          value={filters.jobType}
          onValueChange={(v) => onChange({ ...filters, jobType: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {jobTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end gap-2 lg:col-span-5">
        <Button onClick={onSearch}>Apply filters</Button>
        <Button variant="outline" onClick={onClear}>
          <XIcon className="mr-1 size-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
