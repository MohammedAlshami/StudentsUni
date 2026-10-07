/**
 * Unsplash cover imagery for programme cards.
 *
 * Every field area owns a *pool* of verified photos rather than a single one,
 * so two Computer Science programmes at the same university still get
 * different pictures. The pool member is picked by hashing the programme name,
 * which is stable across renders and identical wherever that programme appears.
 *
 * All IDs below were checked to return HTTP 200 with an image/* content type.
 */

const unsplash = (id: string, w: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

const POOLS: Record<string, string[]> = {
  // Campus fallback used when the field doesn't match any rule.
  default: [
    "photo-1562774053-701939374585",
    "photo-1541339907198-e08756dedf3f",
    "photo-1523240795612-9a054b0db644",
    "photo-1524178232363-1fb2b075b655"
  ],
  agriculture: [
    "photo-1500382017468-9049fed747ef",
    "photo-1416879595882-3373a0480b5b",
    "photo-1444858291040-58f756a3bdd6",
    "photo-1464226184884-fa280b87c399"
  ],
  architecture: [
    "photo-1487958449943-2429e8be8625",
    "photo-1449034446853-66c86144b0ad",
    "photo-1479839672679-a46483c0e7c8",
    "photo-1511818966892-d7d671e672a2"
  ],
  business: [
    "photo-1454165804606-c3d57bc86b40",
    "photo-1554224155-6726b3ff858f",
    "photo-1611974789855-9c2a0a7236a3",
    "photo-1460925895917-afdab827c52f",
    "photo-1507679799987-c73779587ccf",
    "photo-1521737711867-e3b97375f902",
    "photo-1497215728101-856f4ea42174",
    "photo-1497366216548-37526070297c",
    "photo-1486406146926-c627a92ad1ab",
    "photo-1521791136064-7986c2920216",
    "photo-1450101499163-c8848c66ca85",
    "photo-1553877522-43269d4ea984",
    "photo-1497366858526-0766cadbe8fa",
    "photo-1524758631624-e2822e304c36",
    "photo-1600880292203-757bb62b4baf",
    "photo-1573164713988-8665fc963095",
    "photo-1520607162513-77705c0f0d4a"
  ],
  computing: [
    "photo-1518770660439-4636190af475",
    "photo-1461749280684-dccba630e2f6",
    "photo-1498050108023-c5249f4df085",
    "photo-1555949963-ff9fe0c870eb",
    "photo-1517180102446-f3ece451e9d8",
    "photo-1526374965328-7f61d4dc18c5",
    "photo-1451187580459-43490279c0fa",
    "photo-1485827404703-89b55fcc595e",
    "photo-1519389950473-47ba0277781c",
    "photo-1504639725590-34d0984388bd",
    "photo-1550751827-4bd374c3f58b",
    "photo-1620712943543-bcc4688e7485",
    "photo-1677442136019-21780ecad995",
    "photo-1573164713988-8665fc963095",
    "photo-1531297484001-80022131f5a1",
    "photo-1531482615713-2afd69097998",
    "photo-1517430816045-df4b7de11d1d",
    "photo-1544197150-b99a580bb7a8",
    "photo-1563986768609-322da13575f3",
    "photo-1516321497487-e288fb19713f",
    "photo-1552581234-26160f608093",
    "photo-1526378722484-bd91ca387e72",
    "photo-1504384764586-bb4cdc1707b0",
    "photo-1487058792275-0ad4aaf24ca7"
  ],
  design: [
    "photo-1561070791-2526d30994b5",
    "photo-1626785774573-4b799315345d",
    "photo-1558655146-9f40138edfeb",
    "photo-1487014679447-9f8336841d58",
    "photo-1499951360447-b19be8fe80f5",
    "photo-1572044162444-ad60f128bdea",
    "photo-1513364776144-60967b0f800f",
    "photo-1626785774625-ddcddc3445e9",
    "photo-1611532736579-6b16e2b50449",
    "photo-1600607687939-ce8a6c25118c"
  ],
  education: [
    "photo-1524178232363-1fb2b075b655",
    "photo-1503676260728-1c00da094a0b",
    "photo-1427504494785-3a9ca7044f45",
    "photo-1497633762265-9d179a990aa6",
    "photo-1512820790803-83ca734da794",
    "photo-1522202176988-66273c2fd55f",
    "photo-1523240795612-9a054b0db644",
    "photo-1541339907198-e08756dedf3f",
    "photo-1562774053-701939374585",
    "photo-1509062522246-3755977927d7",
    "photo-1546410531-bb4caa6b424d"
  ],
  engineering: [
    "photo-1581092160562-40aa08e78837",
    "photo-1504328345606-18bbc8c9d7d1",
    "photo-1581091226825-a6a2a5aee158",
    "photo-1565043666747-69f6646db940",
    "photo-1518709268805-4e9042af9f23",
    "photo-1541888946425-d81bb19240f5",
    "photo-1581094794329-c8112a89af12",
    "photo-1621905251189-08b45d6a269e",
    "photo-1503387762-592deb58ef4e"
  ],
  health: [
    "photo-1576091160399-112ba8d25d1d",
    "photo-1519494026892-80bbd2d6fd0d",
    "photo-1579684385127-1ef15d508118",
    "photo-1584308666744-24d5c474f2ae",
    "photo-1588776814546-1ffcf47267a5",
    "photo-1631217868264-e5b90bb7e133",
    "photo-1505751172876-fa1923c5c528",
    "photo-1559839734-2b71ea197ec2",
    "photo-1576765608535-5f04d1e3f289",
    "photo-1584515933487-779824d29309",
    "photo-1538108149393-fbbd81895907",
    "photo-1530026186672-2cd00ffc50fe",
    "photo-1579165466741-7f35e4755660",
    "photo-1551076805-e1869033e561",
    "photo-1576091160550-2173dba999ef",
    "photo-1512678080530-7760d81faba6",
    "photo-1580281658626-ee379f3cce93",
    "photo-1576671081837-49000212a370",
    "photo-1579684453423-f84349ef60b0",
    "photo-1516841273335-e39b37888115"
  ],
  hospitality: [
    "photo-1414235077428-338989a2e8c0",
    "photo-1566073771259-6a8506099945",
    "photo-1551882547-ff40c63fe5fa",
    "photo-1517248135467-4c7edcad34c4",
    "photo-1571896349842-33c89424de2d"
  ],
  islamic: [
    "photo-1542816417-0983c9c9ad53",
    "photo-1519817650390-64a93db51149",
    "photo-1585036156171-384164a8c675"
  ],
  lab: [
    "photo-1532187863486-abf9dbad1b69",
    "photo-1582719478250-c89cae4dc85b",
    "photo-1576086213369-97a306d36557",
    "photo-1516321318423-f06f85e504b3"
  ],
  law: [
    "photo-1436450412740-6b988f486c6b",
    "photo-1589829545856-d10d557cf95f",
    "photo-1450101499163-c8848c66ca85",
    "photo-1423592707957-3b212afa6733"
  ],
  math: [
    "photo-1509228468518-180dd4864904",
    "photo-1635070041078-e363dbe005cb",
    "photo-1596495578065-6e0763fa1178"
  ],
  media: [
    "photo-1504711434969-e33886168f5c",
    "photo-1495020689067-958852a7765e",
    "photo-1478737270239-2f02b77fc618",
    "photo-1492691527719-9d1e07e534b4"
  ],
  social: [
    "photo-1522202176988-66273c2fd55f",
    "photo-1456513080510-7bf3a84b82f8",
    "photo-1497633762265-9d179a990aa6",
    "photo-1512820790803-83ca734da794",
    "photo-1524995997946-a1c2e315a42f",
    "photo-1529156069898-49953e39b3ac"
  ],
  sports: [
    "photo-1517649763962-0c623066013b",
    "photo-1461896836934-ffe607ba8211",
    "photo-1546519638-68e109498ffc",
    "photo-1571019613454-1cb2f99b2d8b"
  ],
};

type Rule = { keywords: string[]; category: string };

// Ordered specific-first so "computer science" doesn't fall through to "science".
const RULES: Rule[] = [
  { keywords: ["artificial intelligence", "machine learning", "deep learning", "data science", "data analytic", "big data", "business analytic"], category: "computing" },
  { keywords: ["cyber", "information security", "network security", "security"], category: "computing" },
  { keywords: ["mathemat", "statistic"], category: "math" },
  { keywords: ["accounting", "finance", "financial", "banking", "actuar", "investment", "audit", "economics"], category: "business" },
  { keywords: ["hospitality", "hotel", "tourism", "culinary", "catering", "food service", "food industry"], category: "hospitality" },
  { keywords: ["pharm"], category: "health" },
  { keywords: ["dent"], category: "health" },
  { keywords: ["medicine", "medical", "health", "physio", "optometry", "audiolog", "dietetic", "nutrition", "paramedic", "occupational therapy", "speech", "nurs"], category: "health" },
  { keywords: ["comput", "computer", "information technology", "information system", "software", "database", "data base", "data communication", "multimedia", "game", "iot", "internet of things", "digital media", "cyber"], category: "computing" },
  { keywords: ["engineer", "mechatronic", "telecommunic", "petroleum", "mining", "manufactur", "industrial", "aviation", "aerospace", "robotic", "automotive", "marine", "electronic", "electrical", "mechanical", "chemical", "civil", "environmental engineering"], category: "engineering" },
  { keywords: ["architect", "built environment", "construction", "surveying", "town planning", "quantity survey", "building"], category: "architecture" },
  { keywords: ["design", "art", "arts", "graphic", "animation", "film", "cinematograph", "photograph", "fashion", "interior", "creative", "visual effect"], category: "design" },
  { keywords: ["law", "legal", "syariah law", "shariah law", "criminology"], category: "law" },
  { keywords: ["islamic", "quran", "al-quran", "usuluddin", "hadith", "tarbiyah", "dakwah", "da'wah", "muamalat", "syariah"], category: "islamic" },
  { keywords: ["communicat", "broadcast", "journal", "public relation", "public relations", "advertis", "film making", "media"], category: "media" },
  { keywords: ["teach", "educat", "preschool", "early childhood", "tesl", "guidance", "counsel", "school"], category: "education" },
  { keywords: ["psycholog", "sociology", "humanit", "language", "linguistic", "translation", "arabic", "bahasa", "mandarin", "korean", "japanese", "english"], category: "social" },
  { keywords: ["sport", "recreation", "fitness", "exercise"], category: "sports" },
  { keywords: ["agri", "agriculture", "aquaculture", "forestry", "environment", "ecolog", "biotech", "biology", "bioinformatics", "genetic"], category: "agriculture" },
  { keywords: ["physics", "chemistry", "science", "biolog", "biochem"], category: "lab" },
  { keywords: ["business", "management", "marketing", "entrepreneur", "logistic", "supply chain", "human resource", "commerce", "administration", "office"], category: "business" },
];

// Deterministic string hash (FNV-1a) so the same programme always resolves to
// the same image, at every university.
function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function categoryFor(field: string | null | undefined): string {
  const f = (field || "").toLowerCase();
  if (!f) return "default";
  for (const rule of RULES) {
    if (rule.keywords.some((k) => f.includes(k))) return rule.category;
  }
  return "default";
}

export function getProgramImage(
  field: string | null | undefined,
  name: string | null | undefined,
  width = 600
): string {
  const category = categoryFor(field);
  const pool = POOLS[category]?.length ? POOLS[category] : POOLS.default;
  const index = hashString(name || category) % pool.length;
  return unsplash(pool[index], width);
}
