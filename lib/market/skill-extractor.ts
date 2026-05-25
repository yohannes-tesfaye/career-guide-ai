const EXPERIENCE_KEYWORDS = [
  "experience",
  "years",
  "proficient",
  "expertise",
  "knowledge of",
  "familiar with",
  "understanding of",
  "ability to",
  "responsible for",
];

export function extractExperienceGaps(
  jobDescription: string,
  userExperienceText: string
): string[] {
  const descLower = jobDescription.toLowerCase();
  const userLower = userExperienceText.toLowerCase();
  const gaps: string[] = [];

  const experiencePatterns = [
    /(\d+)\+?\s*years?\s+(?:of\s+)?(?:experience\s+)?(?:in|with)\s+([^.,\n]+)/gi,
    /experience\s+(?:in|with)\s+([^.,\n]+)/gi,
    /(?:proficient|expert|skilled)\s+(?:in|with)\s+([^.,\n]+)/gi,
  ];

  for (const pattern of experiencePatterns) {
    let match;
    while ((match = pattern.exec(descLower)) !== null) {
      const requirement = (match[2] ?? match[1] ?? "").trim();
      if (requirement.length > 3 && !userLower.includes(requirement.slice(0, 40))) {
        const formatted = requirement
          .split(/\s+/)
          .slice(0, 6)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        if (!gaps.includes(formatted)) {
          gaps.push(`Experience: ${formatted}`);
        }
      }
    }
  }

  for (const keyword of EXPERIENCE_KEYWORDS) {
    if (descLower.includes(keyword) && !userLower.includes(keyword)) {
      const contextMatch = descLower.match(
        new RegExp(`${keyword}[^.]{0,80}`, "i")
      );
      if (contextMatch) {
        const snippet = contextMatch[0].trim().slice(0, 60);
        const gap = `Experience area: ${snippet}`;
        if (!gaps.some((g) => g.includes(snippet.slice(0, 30)))) {
          gaps.push(gap);
        }
      }
    }
  }

  return gaps.slice(0, 10);
}
