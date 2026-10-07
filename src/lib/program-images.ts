/**
 * Unsplash cover images keyed by programme field area.
 *
 * One image per field area, so "Computer Science" gets the same picture at
 * every university regardless of which campus it is. Matching is keyword based
 * on the programme's `field` string because that field has ~380 distinct
 * spellings across the dataset.
 */

const unsplash = (id: string, w: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

type Rule = { keywords: string[]; id: string };

// First matching rule wins, so more specific areas are listed first
// ("computer science" must not fall through to the generic "science" rule).
const RULES: Rule[] = [
  {
    keywords: ["artificial intelligence", "machine learning", "deep learning", "data science", "data analytic", "big data", "business analytic"],
    id: "photo-1620712943543-bcc4688e7485",
  },
  {
    keywords: ["cyber", "information security", "network security", "security"],
    id: "photo-1550751827-4bd374c3f58b",
  },
  {
    keywords: ["accounting", "finance", "financial", "banking", "actuar", "investment", "audit", "economics"],
    id: "photo-1554224155-6726b3ff858f",
  },
  {
    keywords: ["hospitality", "hotel", "tourism", "culinary", "catering", "food service", "food industry"],
    id: "photo-1414235077428-338989a2e8c0",
  },
  { keywords: ["pharm"], id: "photo-1584308666744-24d5c474f2ae" },
  { keywords: ["dent"], id: "photo-1588776814546-1ffcf47267a5" },
  {
    keywords: ["medicine", "medical", "health", "physio", "optometry", "audiolog", "dietetic", "nutrition", "paramedic", "occupational therapy", "speech"],
    id: "photo-1576091160399-112ba8d25d1d",
  },
  {
    keywords: ["comput", "computer", "information technology", "information system", "software", "database", "data base", "data communication", "multimedia", "game", "iot", "internet of things", "digital media"],
    id: "photo-1518770660439-4636190af475",
  },
  {
    keywords: ["engineer", "mechatronic", "telecommunic", "petroleum", "mining", "manufactur", "industrial", "aviation", "aerospace", "robotic", "automotive", "marine", "electronic", "electrical", "mechanical", "chemical", "civil", "environmental engineering"],
    id: "photo-1581092160562-40aa08e78837",
  },
  {
    keywords: ["architect", "built environment", "construction", "surveying", "town planning", "quantity survey", "building"],
    id: "photo-1487958449943-2429e8be8625",
  },
  {
    keywords: ["design", "art", "arts", "graphic", "animation", "film", "cinematograph", "photograph", "fashion", "interior", "creative", "visual effect", "advertising art"],
    id: "photo-1561070791-2526d30994b5",
  },
  { keywords: ["law", "legal", "syariah law", "shariah law", "criminology"], id: "photo-1436450412740-6b988f486c6b" },
  {
    keywords: ["islamic", "quran", "al-quran", "usuluddin", "hadith", "tarbiyah", "dakwah", "da'wah", "muamalat", "syariah"],
    id: "photo-1542816417-0983c9c9ad53",
  },
  {
    keywords: ["communicat", "broadcast", "journal", "public relation", "public relations", "advertis", "film making", "media"],
    id: "photo-1504711434969-e33886168f5c",
  },
  {
    keywords: ["teach", "educat", "preschool", "early childhood", "tesl", "guidance", "counsel", "school"],
    id: "photo-1524178232363-1fb2b075b655",
  },
  {
    keywords: ["psycholog", "sociology", "humanit", "language", "linguistic", "translation", "arabic", "bahasa", "mandarin", "korean", "japanese", "english"],
    id: "photo-1522202176988-66273c2fd55f",
  },
  {
    keywords: ["sport", "recreation", "fitness", "exercise"],
    id: "photo-1517649763962-0c623066013b",
  },
  {
    keywords: ["agri", "agriculture", "aquaculture", "forestry", "environment", "ecolog", "biotech", "biology", "bioinformatics", "genetic"],
    id: "photo-1500382017468-9049fed747ef",
  },
  {
    keywords: ["business", "management", "marketing", "entrepreneur", "logistic", "supply chain", "human resource", "commerce", "administration", "office"],
    id: "photo-1454165804606-c3d57bc86b40",
  },
  {
    keywords: ["mathemat", "statistic", "physics", "chemistry", "science"],
    id: "photo-1509228468518-180dd4864904",
  },
];

// Verified campus fallback (also used on the landing page hero).
const DEFAULT_ID = "photo-1562774053-701939374585";

export function getProgramImage(
  field: string | null | undefined,
  width = 400
): string {
  const f = (field || "").toLowerCase();
  if (f) {
    for (const rule of RULES) {
      if (rule.keywords.some((k) => f.includes(k))) return unsplash(rule.id, width);
    }
  }
  return unsplash(DEFAULT_ID, width);
}
