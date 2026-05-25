export interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: number;
}

export interface ArbeitnowResponse {
  data: ArbeitnowJob[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface JobFilters {
  search?: string;
  remote?: boolean;
  location?: string;
  jobType?: string;
}

export interface NormalizedJob {
  externalId: string;
  title: string;
  company: string;
  location: string;
  locationType: string | null;
  description: string;
  requiredSkills: string[];
  postedDate: Date | null;
  source: string;
  url: string;
  remote: boolean;
  tags: string[];
  jobTypes: string[];
}

export interface JobListItem {
  id: string;
  externalId: string | null;
  title: string;
  company: string;
  location: string;
  locationType: string | null;
  description: string;
  requiredSkills: string[] | null;
  postedDate: string | null;
  source: string | null;
  url?: string;
  remote?: boolean;
  tags?: string[];
  jobTypes?: string[];
}
