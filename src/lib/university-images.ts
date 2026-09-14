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

  // Sourced from EasyUni.my institution photo galleries (2026-09-14).
  apu: "https://www.easyuni.my/media/institution/photo/2012/11/14/thumbs/IMG_0301.JPG.600x400_q85_crop-scale.webp",
  cityu: "https://www.easyuni.my/media/institution/photo/2011/12/01/thumbs/49897032.jpg.600x400_q85_crop-scale.webp",
  help: "https://www.easyuni.my/media/institution/photo/2015/05/11/thumbs/HELP_University_ELM_Business_School.jpg.600x400_q85_crop-scale.webp",
  imu: "https://www.easyuni.my/media/institution/photo/2014/03/03/thumbs/4.jpg.600x400_q85_crop-scale.webp",
  inti: "https://www.easyuni.my/media/institution/photo/2011/12/11/thumbs/2010_315_2010-11-12T041542Z_01_BAZ14_RTRIDSP_0_MALAYSIA.jpg.600x400_q85_crop-scale.webp",
  klust: "https://www.easyuni.my/media/institution/photo/2018/09/06/thumbs/IMG_5341-Pano.jpg.600x400_q85_crop-scale.webp",
  luc: "https://www.easyuni.my/media/institution/photo/2024/03/25/thumbs/lincoln-uc.jpeg.600x400_q85_crop-scale.webp",
  mahsa: "https://www.easyuni.my/media/institution/photo/2016/02/12/thumbs/img_3308.jpg.600x400_q85_crop-scale.webp",
  mmu: "https://www.easyuni.my/media/institution/photo/2012/04/30/thumbs/mmu1.jpg.600x400_q85_crop-scale.webp",
  nilai: "https://www.easyuni.my/media/institution/photo/2012/03/07/thumbs/ec97263e5c435bc5f5c63d87e69db1dd.jpg.600x400_q85_crop-scale.webp",
  numed: "https://www.easyuni.my/media/institution/photo/2021/12/08/thumbs/Garden_Terrace.jpg.600x400_q85_crop-scale.webp",
  segi: "https://www.easyuni.my/media/institution/photo/2012/05/02/thumbs/seg1.jpg.600x400_q85_crop-scale.webp",
  taylors: "https://www.easyuni.my/media/institution/photo/2016/11/17/thumbs/Untitled_Panorama2.jpg.600x400_q85_crop-scale.webp",
  unikl: "https://www.easyuni.my/media/institution/photo/2012/05/02/thumbs/kl4.jpg.600x400_q85_crop-scale.webp",
  unirazak: "https://www.easyuni.my/media/institution/photo/2012/04/09/thumbs/Unirazak_0814.jpg.600x400_q85_crop-scale.webp",
  unisel: "https://www.easyuni.my/media/institution/photo/2024/08/27/thumbs/DSC_8731.jpg.600x400_q85_crop-scale.webp",
  unitar: "https://www.easyuni.my/media/institution/photo/2013/06/18/thumbs/Hotel2.jpg.600x400_q85_crop-scale.webp",
  uniten: "https://www.easyuni.my/media/institution/photo/2015/04/29/thumbs/rsz_coit_in_uniten.png.600x400_q85_crop-scale.webp",
  unmc: "https://www.easyuni.my/media/institution/photo/2018/09/07/thumbs/IMG-20160414-WA0003.jpg.600x400_q85_crop-scale.webp",
  uoc: "https://www.easyuni.my/media/institution/photo/2016/01/11/thumbs/CUCMS_Library_2.jpg.600x400_q85_crop-scale.webp",
  uowm: "https://www.easyuni.my/media/institution/photo/2015/02/04/thumbs/7th-Power-Chef-Competition.jpg.600x400_q85_crop-scale.webp",
  usmc: "https://www.easyuni.my/media/institution/photo/2024/03/22/thumbs/UoSM_Pano.jpg.600x400_q85_crop-scale.webp",
  xmum: "https://www.easyuni.my/media/institution/photo/2025/01/17/thumbs/XMU-cover-jpeg-min.jpg.600x400_q85_crop-scale.webp",
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

  // Sourced from EasyUni.my institution photo galleries (2026-09-14).
  apu: ["https://www.easyuni.my/media/institution/photo/2017/12/19/thumbs/9._IMG_0645_preview.jpeg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2017/12/19/thumbs/APU_new_campus_sky3_preview.jpeg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2017/12/20/thumbs/Cafeteria_4.JPG.600x400_q85_crop-scale.webp"],
  cityu: ["https://www.easyuni.my/media/institution/photo/2013/02/20/thumbs/Graduated_Convocation_4_-D.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2013/02/20/thumbs/2__library.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2017/09/11/thumbs/1.jpg.600x400_q85_crop-scale.webp"],
  help: ["https://www.easyuni.my/media/institution/photo/2015/09/29/thumbs/12033569_10153319840017874_1911830728_n.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2015/05/11/thumbs/Bandar_Damansara_Campus.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2019/06/17/thumbs/aa_gallery_photo169-8244979.jpg.600x400_q85_crop-scale.webp"],
  imu: ["https://www.easyuni.my/media/institution/photo/2014/03/03/thumbs/5.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2014/03/03/thumbs/2.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2019/06/20/thumbs/59726280_2144295392291790_8581395673029541888_o.jpg.600x400_q85_crop-scale.webp"],
  inti: ["https://www.easyuni.my/media/institution/photo/2012/04/30/thumbs/nilai1.jpeg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2012/04/30/thumbs/nilai2.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2012/04/30/thumbs/nilai3.jpg.600x400_q85_crop-scale.webp"],
  klust: ["https://www.easyuni.my/media/institution/photo/2018/09/06/thumbs/FABE.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2018/09/06/thumbs/IMG_5300-Pano.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2018/09/06/thumbs/IMG_4948-Pano.jpg.600x400_q85_crop-scale.webp"],
  mahsa: ["https://www.easyuni.my/media/institution/photo/2016/02/12/thumbs/img_3346.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2016/03/02/thumbs/12377953_10153720546329892_701496608813847742_o.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2016/03/02/thumbs/10628559_10152662823739892_4407391104487505576_n.jpg.600x400_q85_crop-scale.webp"],
  mmu: ["https://www.easyuni.my/media/institution/photo/2012/04/30/thumbs/mmu2.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2012/04/30/thumbs/mmu5.JPG.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2012/04/30/thumbs/mmu4.jpg.600x400_q85_crop-scale.webp"],
  nilai: ["https://www.easyuni.my/media/institution/photo/2012/05/01/thumbs/nilai4.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2016/04/26/thumbs/nilai-2.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2018/04/16/thumbs/nilai_zyX7rmv.jpg.600x400_q85_crop-scale.webp"],
  numed: ["https://www.easyuni.my/media/institution/photo/2021/12/08/thumbs/Campus_2.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2021/12/08/thumbs/Campus_3.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2021/12/08/thumbs/Campus_4.jpg.600x400_q85_crop-scale.webp"],
  segi: ["https://www.easyuni.my/media/institution/photo/2017/09/21/thumbs/1.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2016/02/23/thumbs/1.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2016/02/12/thumbs/scsj_b.jpg.600x400_q85_crop-scale.webp"],
  taylors: ["https://www.easyuni.my/media/institution/photo/2016/11/17/thumbs/Taylor_5125.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2016/11/17/thumbs/DSC_4152.JPG.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2016/11/17/thumbs/DSC_2081.JPG.600x400_q85_crop-scale.webp"],
  unikl: ["https://www.easyuni.my/media/institution/photo/2012/05/02/thumbs/kl2.JPG.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2012/05/02/thumbs/kl5.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2012/05/02/thumbs/kl1.jpg.600x400_q85_crop-scale.webp"],
  unirazak: ["https://www.easyuni.my/media/institution/photo/2019/07/11/thumbs/41848475_2287426748146891_8435687391389286400_n.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2019/07/11/thumbs/66100239_2486276711595226_4885437995399774208_o.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2019/09/26/thumbs/WhatsApp_Image_2019-09-25_at_5.41.57_PM.jpeg.600x400_q85_crop-scale.webp"],
  unisel: ["https://www.easyuni.my/media/institution/photo/2024/08/27/thumbs/DSC_8765.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2024/08/27/thumbs/DSC_2343.JPG.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2024/08/27/thumbs/DSC_2333.JPG.600x400_q85_crop-scale.webp"],
  unitar: ["https://www.easyuni.my/media/institution/photo/2013/06/18/thumbs/theatret2.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2013/06/18/thumbs/Student_Affair.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2013/06/18/thumbs/Library2.jpg.600x400_q85_crop-scale.webp"],
  uniten: ["https://www.easyuni.my/media/institution/photo/2015/04/29/thumbs/rsz_uniten_administration_building.png.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2015/04/29/thumbs/rsz_cicu1a.png.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2019/07/10/thumbs/57038287_10155934936192116_6053181449324986368_o.jpg.600x400_q85_crop-scale.webp"],
  unmc: ["https://www.easyuni.my/media/institution/photo/2018/09/07/thumbs/7725reproTrentBuilding712x335.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2018/09/07/thumbs/CachedImage.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2017/08/25/thumbs/3.jpg.600x400_q85_crop-scale.webp"],
  uoc: ["https://www.easyuni.my/media/institution/photo/2016/01/11/thumbs/IMG_8434.JPG.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2016/01/11/thumbs/Students_on_Campus__1.JPG.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2016/01/11/thumbs/IMG_8368.JPG.600x400_q85_crop-scale.webp"],
  uowm: ["https://www.easyuni.my/media/institution/photo/2015/02/04/thumbs/Engineering-GG-Hunt.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2015/02/04/thumbs/Graduation-Ceremony.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2015/02/04/thumbs/Business-Charity-Concert.jpg.600x400_q85_crop-scale.webp"],
  xmum: ["https://www.easyuni.my/media/institution/photo/2025/02/28/thumbs/XMUM_Drone_CMYK.png.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2025/02/28/thumbs/07.jpg.600x400_q85_crop-scale.webp", "https://www.easyuni.my/media/institution/photo/2025/02/28/thumbs/02.jpg.600x400_q85_crop-scale.webp"],
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
