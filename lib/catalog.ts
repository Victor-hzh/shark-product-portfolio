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
  {label:"无线吸尘器",group:"地面清洁",path:"/vacuums-air-care/vacuum-cleaners/cordless-vacuums"},
  {label:"有线杆式吸尘器",group:"地面清洁",path:"/vacuums-air-care/vacuum-cleaners/corded-stick-vacuums"},
  {label:"立式吸尘器",group:"地面清洁",path:"/vacuums-air-care/vacuum-cleaners/upright-vacuums"},
  {label:"手持吸尘器",group:"地面清洁",path:"/vacuums-air-care/vacuum-cleaners/handheld-vacuums"},
  {label:"扫地机器人",group:"地面清洁",path:"/vacuums-air-care/vacuum-cleaners/robot-vacuums"},
  {label:"洗地机",group:"地面清洁",path:"/vacuums-air-care/floor-carpet-cleaners/wet-dry-cleaners"},
  {label:"布艺清洗机",group:"地面清洁",path:"/vacuums-air-care/floor-carpet-cleaners/carpet-spot-cleaners"},
  {label:"蒸汽清洁",group:"地面清洁",path:"/vacuums-air-care/floor-carpet-cleaners/steam-mops"},
  {label:"美发造型",group:"个护",path:"/beauty/haircare/hair-stylers"},
  {label:"吹风机",group:"个护",path:"/beauty/haircare/hair-dryers"},
  {label:"直发器",group:"个护",path:"/beauty/haircare/wet-to-dry-straighteners"},
  {label:"热风梳",group:"个护",path:"/beauty/haircare/blow-dry-brushes"},
  {label:"美容仪",group:"个护",path:"/beauty/skincare/facial-devices"},
  {label:"光疗面罩",group:"个护",path:"/beauty/skincare/led-face-masks"},
  {label:"空气净化器",group:"家居环境",path:"/vacuums-air-care/air-purifiers-fans/air-purifiers"},
  {label:"风扇",group:"家居环境",path:"/vacuums-air-care/air-purifiers-fans/fans"},
  {label:"吹叶机",group:"家居环境",path:""},
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
export const STARTER_PRODUCTS: Product[] = snapshot.map(item => ({
  id:item.model.toUpperCase(),model:item.model.toUpperCase(),name:item.name,category:item.category,family:null,
  imageUrl:item.imageUrl,officialUrl:item.officialUrl,amazonUrl:null,
  releaseDate:null,releasePrecision:null,releaseSource:null,markets:item.markets,
  specs:specsByModel[item.model]||{},
  firstSeen:seen,lastSeen:seen,
}));
// A verified announcement gives this release its date; all other dates stay unknown.
const ionCurl=STARTER_PRODUCTS.find(p=>p.id==="HD840PU");
if(ionCurl){ionCurl.releaseDate="2026-07-06";ionCurl.releasePrecision="day";ionCurl.releaseSource="https://newsroom.sharkninja.com/shark-beauty-launches-flexstyle-ioncurl-the-most-powerful-multi-styler-yet/";}
