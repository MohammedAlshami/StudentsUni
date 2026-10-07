import images from "../../public/data/language-centres/images.json";

// Real cover imagery for the English language centres, served from
// public/images/language-centres/. Photos were sourced from each centre's own
// website where one exists, otherwise from the MAIGA centre listing CDN.
export const LANGUAGE_CENTRE_IMAGES: Record<string, string> = images;

export function getLanguageCentreImage(slug: string): string | null {
  return LANGUAGE_CENTRE_IMAGES[slug] ?? null;
}
