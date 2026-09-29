import snapshot from "@/data/catalog-snapshot.json";
import specSnapshot from "@/data/specs-snapshot.json";

export type Product = {
  id: string; name: string; model: string | null; category: string; family: string | null;
  imageUrl: string | null; officialUrl: string; amazonUrl: string | null;
  releaseDate: string | null; releasePrecision: string | null; releaseSource: string | null;
  markets: string[]; firstSeen: string; lastSeen: string;
  specs?: Record<string,string>;
};

const base = "https://www.sharkninja.com";
export const CATEGORIES = [
  {label:"洗地机",group:"洗地机",path:"/vacuums-air-care/floor-carpet-cleaners/wet-dry-cleaners"},
  {label:"布艺清洗机",group:"布艺",path:"/vacuums-air-care/floor-carpet-cleaners/carpet-spot-cleaners"},
  {label:"扫地机器人",group:"机器人",path:"/vacuums-air-care/vacuum-cleaners/robot-vacuums"},
  {label:"无线吸尘器",group:"吸尘器",path:"/vacuums-air-care/vacuum-cleaners/cordless-vacuums"},
  {label:"有线杆式吸尘器",group:"吸尘器",path:"/vacuums-air-care/vacuum-cleaners/corded-stick-vacuums"},
  {label:"手持吸尘器",group:"吸尘器",path:"/vacuums-air-care/vacuum-cleaners/handheld-vacuums"},
  {label:"蒸汽清洁",group:"蒸汽拖把",path:"/vacuums-air-care/floor-carpet-cleaners/steam-mops"},
  {label:"立式吸尘器",group:"立式机",path:"/vacuums-air-care/vacuum-cleaners/upright-vacuums"},
  {label:"地毯清洗机",group:"地毯清洗",path:""},
  {label:"吹叶机",group:"吹叶机",path:""},
  {label:"吹风机",group:"个护",path:"/beauty/haircare/hair-dryers"},
  {label:"美发造型",group:"个护",path:"/beauty/haircare/hair-stylers"},
  {label:"直发器",group:"个护",path:"/beauty/haircare/wet-to-dry-straighteners"},
  {label:"热风梳",group:"个护",path:"/beauty/haircare/blow-dry-brushes"},
  {label:"美容仪",group:"个护",path:"/beauty/skincare/facial-devices"},
  {label:"光疗面罩",group:"个护",path:"/beauty/skincare/led-face-masks"},
  {label:"风扇",group:"风扇",path:"/vacuums-air-care/air-purifiers-fans/fans"},
  {label:"空气净化器",group:"空净",path:"/vacuums-air-care/air-purifiers-fans/air-purifiers"},
] as const;

export const SCAN_SOURCES = [
  ...CATEGORIES.filter(category => category.path).map(category => ({label:`美国 · ${category.label}`,url:`${base}${category.path}`,market:"US",category:category.label,format:"sfcc"})),
  ...[
    ["无线吸尘器","/home-cleaning/vacuum-cleaners/cordless-vacuums"],
    ["立式吸尘器","/home-cleaning/vacuum-cleaners/upright-vacuums"],
    ["手持吸尘器","/home-cleaning/vacuum-cleaners/handheld-vacuums"],
    ["扫地机器人","/home-cleaning/vacuum-cleaners/robot-vacuums"],
    ["布艺清洗机","/home-cleaning/floor-carpet-cleaners/carpet-spot-cleaners"],
    ["蒸汽清洁","/home-cleaning/floor-carpet-cleaners/steam-mops"],
    ["吹风机","/beauty/haircare/hair-dryers"],
    ["美发造型","/beauty/haircare/hair-stylers"],
    ["空气净化器","/home-cleaning/air-treatment/air-purifiers"],
  ].map(([category,path])=>({label:`英国 · ${category}`,url:`https://www.sharkninja.co.uk${path}`,market:"UK",category,format:"sfcc"})),
  {label:"日本 · Shark 产品",url:"https://www.sharkninja.jp/collections/shark/products.json?limit=250",market:"JP",category:"自动分类",format:"shopify"},
] as const;

const seen="2026-09-23";
const specsByModel=specSnapshot as Record<string,Record<string,string>>;
// Normalize a few official-site taxonomy differences so the same hardware can sit together.
const displayCategoryByModel:Record<string,string>={
  "SV2002":"立式吸尘器",
  "SV2000UK-MASTER":"立式吸尘器",
  "SD200UK":"蒸汽清洁",
  "SD201":"蒸汽清洁",
  "VS101":"布艺清洗机",
  "HD6052S":"美发造型",
};
function categoryFor(model:string,original:string):string {
  return displayCategoryByModel[model]||(/^EX\d/.test(model)?"地毯清洗机":original);
}
export const STARTER_PRODUCTS: Product[] = snapshot.map(item => ({
  id:item.model.toUpperCase(),model:item.model.toUpperCase(),name:item.name,category:categoryFor(item.model.toUpperCase(),item.category),family:null,
  imageUrl:item.imageUrl,officialUrl:item.officialUrl,amazonUrl:null,
  releaseDate:null,releasePrecision:null,releaseSource:null,markets:item.markets,
  specs:specsByModel[item.model]||{},
  firstSeen:seen,lastSeen:seen,
}));
const releaseEvidence:Record<string,{date:string;source:string;precision?:string}>={
  AB2000J:{date:"2026-10-15",source:"https://www.sharkninja.jp/blogs/news/news260910-01"},
  AB2111J:{date:"2026-10-15",source:"https://www.sharkninja.jp/blogs/news/news260910-01"},
  SV2002:{date:"2025-10-01",precision:"month",source:"https://www.techradar.com/home/vacuums/shark-freestyle-max-cordless-upright-review"},
  "SV2000UK-MASTER":{date:"2025-10-01",precision:"month",source:"https://www.techradar.com/home/vacuums/shark-freestyle-max-cordless-upright-review"},
  RVD120X1JP:{date:"2026-09-25",source:"https://www.sharkninja.jp/blogs/news/news260915-01"},
  HP062J:{date:"2026-09-25",source:"https://www.sharkninja.jp/blogs/news/news260820-03"},
  HP162J:{date:"2026-09-25",source:"https://www.sharkninja.jp/blogs/news/news260820-03"},
  WD563:{date:"2026-08-18",source:"https://newsroom.sharkninja.com/shark-launches-aquareach-the-first-vacuum-mop-system-with-extendable-wand-designed-to-clean-beyond-the-floor/"},
  HD840PU:{date:"2026-07-06",source:"https://newsroom.sharkninja.com/shark-beauty-launches-flexstyle-ioncurl-the-most-powerful-multi-styler-yet/"},
  HD840:{date:"2026-07-06",source:"https://newsroom.sharkninja.com/shark-beauty-launches-flexstyle-ioncurl-the-most-powerful-multi-styler-yet/"},
  LX5000:{date:"2026-06-30",source:"https://newsroom.sharkninja.com/sharkninja-launches-the-shark-powerdetect-transformer-three-vacuums-one-system-zero-compromises/"},
  EX500:{date:"2026-06-08",source:"https://newsroom.sharkninja.com/sharkninja-introduces-the-shark-carpetforce-collection-reinventing-carpet-cleaning-for-everyday-life/"},
  EX551:{date:"2026-06-08",source:"https://newsroom.sharkninja.com/sharkninja-introduces-the-shark-carpetforce-collection-reinventing-carpet-cleaning-for-everyday-life/"},
  IW5271J:{date:"2026-06-04",source:"https://www.sharkninja.jp/blogs/news/20260521-01"},
  IA3241:{date:"2026-04-14",source:"https://newsroom.sharkninja.com/sharkninja-introduces-shark-powerdetect-speed-clean-empty-system/"},
  HP362:{date:"2026-04-08",source:"https://newsroom.sharkninja.com/sharkninja-introduces-shark-breatheclear-max-with-neverchange-proactive-purification-intelligent-air-analysis-purpose-built-to-act-before-air-quality-drops/"},
  LC800J:{date:"2026-09-07",source:"https://www.sharkninja.jp/blogs/news/news260820-01"},
  LC900J:{date:"2026-09-07",source:"https://www.sharkninja.jp/blogs/news/news260820-01"},
  LC950J:{date:"2026-09-07",source:"https://www.sharkninja.jp/blogs/news/news260820-01"},
};
export function withVerifiedReleaseDates(products:Product[]):Product[] {
  return products.map(product=>{
    const verified=releaseEvidence[(product.model||"").toUpperCase()];
    const category=categoryFor((product.model||"").toUpperCase(),product.category);
    return verified?{...product,category,releaseDate:verified.date,releasePrecision:verified.precision||"day",releaseSource:verified.source}:{...product,category};
  });
}
for(const product of STARTER_PRODUCTS){
  const verified=releaseEvidence[product.model||""];
  if(verified){product.releaseDate=verified.date;product.releasePrecision=verified.precision||"day";product.releaseSource=verified.source;}
}
