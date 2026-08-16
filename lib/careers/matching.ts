import { careers, type Career } from "@/lib/supabase/careers/career";

export type Profile = Record<string, number>;

export type CareerRecommendation = Career & {
  matchPercentage: number;
};

function cosineSimilarity(profile: Profile, idealProfile: Profile) {
  const tags = new Set([...Object.keys(profile), ...Object.keys(idealProfile)]);
  let dotProduct = 0;
  let profileMagnitude = 0;
  let idealMagnitude = 0;

  for (const tag of tags) {
    const score = profile[tag] ?? 0;
    const idealScore = idealProfile[tag] ?? 0;
    dotProduct += score * idealScore;
    profileMagnitude += score * score;
    idealMagnitude += idealScore * idealScore;
  }

  if (profileMagnitude === 0 || idealMagnitude === 0) return 0;
  return dotProduct / (Math.sqrt(profileMagnitude) * Math.sqrt(idealMagnitude));
}

/**
 * Scores each career with equal weight given to skill fit and interest fit.
 * The profiles are sparse vectors: absent tags are treated as a score of zero.
 */
export function getCareerRecommendations(
  skillProfile: Profile,
  interestProfile: Profile,
  limit = 5,
): CareerRecommendation[] {
  return careers
    .map((career) => {
      const skillMatch = cosineSimilarity(skillProfile, career.idealSkillProfile);
      const interestMatch = cosineSimilarity(interestProfile, career.idealInterestProfile);

      return {
        ...career,
        matchPercentage: Math.round(((skillMatch + interestMatch) / 2) * 100),
      };
    })
    .sort((first, second) => second.matchPercentage - first.matchPercentage || first.name.localeCompare(second.name))
    .slice(0, limit);
}

/** Converts a Supabase jsonb value into a safe tag-to-score profile. */
export function profileFromJson(value: unknown): Profile {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).flatMap(([tag, score]) =>
      typeof score === "number" && Number.isFinite(score) ? [[tag, Math.max(0, Math.min(100, score))]] : [],
    ),
  );
}
