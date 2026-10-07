import fs from "fs";
import path from "path";

export type Offer = {
  label?: string | null;
  price?: number | null;
  price_myr?: number | null;
  currency?: string | null;
};

export type Course = {
  name?: string | null;
  name_ar?: string | null;
  type?: string | null;
  duration?: string | null;
  hours?: string | null;
  fee_myr?: number | null;
  fee_usd?: number | null;
  currency?: string | null;
  fees_table?: Offer[] | null;
  discount_pct?: number | null;
  source?: string | null;
};

export type LanguageCentre = {
  slug: string;
  name: string;
  name_ar?: string | null;
  city?: string | null;
  website?: string | null;
  description?: string | null;
  student_count?: number | null;
  course_count?: number | null;
  courses?: Course[] | null;
  offers?: Offer[] | null;
  inclusions?: string[] | null;
  exclusions?: string[] | null;
  sources?: Array<{ url: string; publisher: string; fetched_at: string }> | null;
};

const CENTRES_DIR = path.join(process.cwd(), "public/data/language-centres");

export function loadLanguageCentre(slug: string): LanguageCentre | null {
  const file = path.join(CENTRES_DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8")) as LanguageCentre;
}

export function loadAllLanguageCentres(): LanguageCentre[] {
  const indexFile = path.join(CENTRES_DIR, "index.json");
  if (!fs.existsSync(indexFile)) return [];
  const index = JSON.parse(fs.readFileSync(indexFile, "utf-8")) as {
    centres: Array<{ slug: string }>;
  };
  return index.centres
    .map((c) => loadLanguageCentre(c.slug))
    .filter((c): c is LanguageCentre => Boolean(c));
}

export function formatCentreFee(
  value: number | null | undefined,
  currency: string | null | undefined
): string {
  if (value == null) return "—";
  const formatted = value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const cur = (currency || "MYR").toUpperCase();
  return cur === "USD" ? `$${formatted}` : cur === "MYR" ? `RM ${formatted}` : `${formatted} ${cur}`;
}
