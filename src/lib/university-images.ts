// Official crests / logos sourced from Wikipedia (via the Wikipedia REST summary API).
// Used as a small centered mark on a tinted card for universities without a campus photo.
export const UNIVERSITY_LOGOS: Record<string, string> = {
  um: "https://upload.wikimedia.org/wikipedia/en/8/8f/University_of_Malaya_logo.svg",
  usm: "https://upload.wikimedia.org/wikipedia/en/6/69/USM_Crest.svg",
  ukm: "https://upload.wikimedia.org/wikipedia/en/4/4f/Coat_of_Arms_of_Universiti_Kebangsaan_Malaysia.png",
  upm: "https://upload.wikimedia.org/wikipedia/en/a/a3/Coat_of_Arms_of_Universiti_Putra_Malaysia.png",
  utm: "https://upload.wikimedia.org/wikipedia/commons/8/81/UTM-LOGO.png",
  uum: "https://upload.wikimedia.org/wikipedia/en/a/ac/Universiti_Utara_Malaysia_emblem.png",
  uitm: "https://upload.wikimedia.org/wikipedia/en/8/8c/UiTMlogo.gif",
  iium: "https://upload.wikimedia.org/wikipedia/en/3/31/International_Islamic_University_Malaysia_emblem.svg",
  unimas: "https://upload.wikimedia.org/wikipedia/en/6/67/UNIMAS.svg",
  ums: "https://upload.wikimedia.org/wikipedia/en/e/e5/Seal_of_Universiti_Malaysia_Sabah.png",
  usim: "https://upload.wikimedia.org/wikipedia/en/b/b0/Emblem_of_Universiti_Sains_Islam_Malaysia.png",
  upsi: "https://upload.wikimedia.org/wikipedia/en/f/f8/Seal_of_Sultan_Idris_Education_University.png",
  unimap: "https://upload.wikimedia.org/wikipedia/en/1/10/UniMAP.svg",
  utem: "https://upload.wikimedia.org/wikipedia/en/f/fd/Universiti_Teknikal_Malaysia_Melaka_logo.png",
  taylors: "https://upload.wikimedia.org/wikipedia/en/f/f6/Logo_of_Taylor%27s_University.svg",
  apu: "https://upload.wikimedia.org/wikipedia/en/4/43/AsiaPacificUniversityOfTechnology%26Innovation.svg",
  help: "https://upload.wikimedia.org/wikipedia/en/8/83/HELP_University_Logo.png",
  curtin: "https://upload.wikimedia.org/wikipedia/en/4/41/Curtin_University_Crest.jpg",
  uniten: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Universiti_Tenaga_Nasional_Logo.png",
  utp: "https://upload.wikimedia.org/wikipedia/commons/7/7c/UTP_LOGO.png",
  xmum: "https://upload.wikimedia.org/wikipedia/commons/7/75/Xiamen_University_logo.svg",
  unikl: "https://upload.wikimedia.org/wikipedia/en/8/8e/UniKL_seal.svg",
};

// Real campus photographs (Wikimedia Commons, CC-licensed) used for the homepage
// "Featured Universities" section and as hero banners on university detail pages.
export const UNIVERSITY_PHOTOS: Record<string, string> = {
  monash:
    "https://upload.wikimedia.org/wikipedia/commons/9/93/Cmglee_Sunway_Monash_University.jpg",
  sunway: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Sunway_Square_02.jpg",
  ucsi:
    "https://upload.wikimedia.org/wikipedia/commons/4/46/UCSI_main_gate_Taman_Connaught_%28231105%29.jpg",
  uthm: "https://upload.wikimedia.org/wikipedia/commons/5/5a/UTHM_Entrance.jpg",
  swinburne:
    "https://upload.wikimedia.org/wikipedia/commons/1/12/Building_A_of_Swinburne_University_of_Technology_Sarawak_Campus.jpg",
  msu: "https://upload.wikimedia.org/wikipedia/commons/0/0d/MSU_Main_Campus.jpg",
  oum: "https://upload.wikimedia.org/wikipedia/commons/2/2d/OUM_Main_Campus.jpg",
  tarumt: "https://upload.wikimedia.org/wikipedia/commons/6/63/260630_-_Main_Entrance.jpg",
  wou: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Wawasan_open_university.jpg",
};

// A few extra real campus photos per institution (Wikimedia Commons), for the
// gallery section on university detail pages. Not every institution has these;
// UNIVERSITY_PHOTOS above is still the single "cover" image.
export const UNIVERSITY_GALLERY: Record<string, string[]> = {
  monash: ["https://upload.wikimedia.org/wikipedia/commons/7/77/Monash_University_Malaysia_%28221208%29_01.jpg"],
  sunway: [
    "https://upload.wikimedia.org/wikipedia/commons/c/c5/Avenue_of_Achievements%2C_Sunway_University.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/8/8a/Cmglee_Sunway_University_new_building.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/09/Cmglee_Sunway_University_old_building.jpg",
  ],
  ucsi: ["https://upload.wikimedia.org/wikipedia/commons/b/b2/UCSI_University_Sarawak_campus.jpg"],
  uthm: [
    "https://upload.wikimedia.org/wikipedia/commons/c/c7/Blok_pentadbiran.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/c/ce/Dewan_Terbuka_%28Open_Hall%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/3/31/UTHM_Convocation_Hall.jpg",
  ],
  swinburne: [
    "https://upload.wikimedia.org/wikipedia/commons/a/a1/20240323_SUTS_Borneo_Atrium.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/c/ce/20240323_SUTS.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/9/96/20240510_SUTS.jpg",
  ],
  msu: [
    "https://upload.wikimedia.org/wikipedia/commons/e/e7/938_380_MSU.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/7/79/MSU_Medical_Centre_and_The_Residence.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/d/d7/MSU_U-Square.jpg",
  ],
  tarumt: [
    "https://upload.wikimedia.org/wikipedia/commons/b/bc/TAR_UMT_Penang_Branch_%28230726%29_01.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/6/61/TAR-UMT_%28Kuala_Lumpur_Campus%29.jpg",
  ],
  wou: [
    "https://upload.wikimedia.org/wikipedia/commons/f/fc/Wawasan_Open_University%2C_Penang_%282011%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/2/24/Wawasan_Open_University.jpg",
  ],
};

// Generic "student life in Malaysia" imagery used to fill out the gallery for
// institutions we don't have specific campus photos for yet. Never captioned
// as if it were that institution's actual campus.
export const GENERIC_CAMPUS_PHOTOS = [
  "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=80",
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
