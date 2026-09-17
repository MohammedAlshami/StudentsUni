import data from "./university-images.data.json";

// University marks and campus photos, stored locally under
// public/images/universities/. Logos sourced from Wikipedia/Wikimedia and
// official university websites; photos from Wikimedia Commons and EasyUni.
export const UNIVERSITY_LOGOS: Record<string, string> = data.logos;

export const UNIVERSITY_PHOTOS: Record<string, string> = data.photos;

export const UNIVERSITY_GALLERY: Record<string, string[]> = data.gallery;

// Generic "student life in Malaysia" imagery used to fill out the gallery for
// institutions we don't have specific campus photos for yet. Never captioned
// as if it were that institution's actual campus.
export const GENERIC_CAMPUS_PHOTOS = [
  "https://pub-9f312be7e4a94c53b384bfcf5701085e.r2.dev/studentsuni/images/universities/generic/campus-1.jpg",
  "https://pub-9f312be7e4a94c53b384bfcf5701085e.r2.dev/studentsuni/images/universities/generic/campus-2.jpg",
  "https://pub-9f312be7e4a94c53b384bfcf5701085e.r2.dev/studentsuni/images/universities/generic/campus-3.jpg",
];

export function getUniversityGallery(slug: string): { url: string; specific: boolean }[] {
  const cover = UNIVERSITY_PHOTOS[slug];
  const extra = UNIVERSITY_GALLERY[slug] ?? [];
  const real = [...(cover ? [cover] : []), ...extra].map((url) => ({ url, specific: true }));
  if (real.length >= 3) return real.slice(0, 3);
  const filler = GENERIC_CAMPUS_PHOTOS.slice(0, 3 - real.length).map((url) => ({ url, specific: false }));
  return [...real, ...filler];
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
