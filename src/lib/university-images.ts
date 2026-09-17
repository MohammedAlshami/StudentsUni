import data from "./university-images.data.json";

// University marks and campus photos, hosted on R2 under
// studentsuni/images/universities/<slug>/. Logos sourced from
// Wikipedia/Wikimedia and official university websites; photos from Wikimedia
// Commons and EasyUni.
export const UNIVERSITY_LOGOS: Record<string, string> = data.logos;

export const UNIVERSITY_PHOTOS: Record<string, string> = data.photos;

export const UNIVERSITY_GALLERY: Record<string, string[]> = data.gallery;

// Real photos of a specific institution only: its cover photo plus any extra
// campus photos sourced for that university. Returns an empty array when we
// have no real photos, so callers hide the gallery instead of falling back to
// stock imagery.
export function getUniversityGallery(slug: string): string[] {
  const cover = UNIVERSITY_PHOTOS[slug];
  const extra = UNIVERSITY_GALLERY[slug] ?? [];
  return [...(cover ? [cover] : []), ...extra];
}

export const FEATURED_UNIVERSITY_SLUGS = [
  "monash",
  "sunway",
  "ucsi",
  "uthm",
  "swinburne",
  "msu",
];

export function getUniversityImage(slug: string): { url: string; kind: "photo" | "logo" } | null {
  if (UNIVERSITY_PHOTOS[slug]) return { url: UNIVERSITY_PHOTOS[slug], kind: "photo" };
  if (UNIVERSITY_LOGOS[slug]) return { url: UNIVERSITY_LOGOS[slug], kind: "logo" };
  return null;
}
