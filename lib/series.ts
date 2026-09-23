import type { Product } from "./catalog";

export function modelSeries(product:Product):string {
  const prefix=product.model?.toUpperCase().match(/^[A-Z]+/)?.[0];
  return prefix?`${prefix} 系列`:"型号待核实";
}

// Match the marketed product-line name, keeping distinct generations/subseries apart.
export function seriesName(product:Product):string {
  const name=product.name.replace(/\u00a0/g," ");
  const evo=name.match(/EVOPOWER\s+SYSTEM\s+(BOOST\+?|FIT\+?|NEO\s*II|NEO|STD\+?|ADV)/i);
  if(evo)return `EVOPOWER SYSTEM ${evo[1].replace(/\s*II|\+/gi,"").toUpperCase()}`;
  const rules:[RegExp,string][]=[
    [/EVOPOWER\s+DX/i,"EVOPOWER DX"],[/EVOPOWER\s+EX/i,"EVOPOWER EX"],
    [/EVOPOWER\s+W(?:25|30P|35)/i,"EVOPOWER 手持系列"],
    [/PowerClean\s*360/i,"PowerClean 360"],[/ActiClean/i,"ActiClean"],
    [/CleanSense\s*iQ/i,"CleanSense iQ"],[/PowerDetect/i,"PowerDetect"],
    [/PowerLite/i,"PowerLite"],[/PowerPro/i,"PowerPro"],
    [/Stratos/i,"Stratos"],[/Navigator/i,"Navigator"],[/Rotator/i,"Rotator"],
    [/Freestyle/i,"Freestyle"],[/Detect\s*(?:Pro|XL)?/i,"Detect"],
    [/WandVac/i,"WandVac"],[/UltraCyclone/i,"UltraCyclone"],
    [/PowerBoost/i,"PowerBoost"],[/Rocket/i,"Rocket"],
    [/Matrix/i,"Matrix"],[/Zen\s*Pro/i,"Zen Pro"],
    [/HydroVac/i,"HydroVac"],[/HydroDuo/i,"HydroDuo"],
    [/AquaReach/i,"AquaReach"],[/VacMop/i,"VacMop"],
    [/Steam\s*(?:&|and)\s*Scrub/i,"Steam & Scrub"],
    [/Steam\s*Pick\s*Up/i,"Steam Pickup"],[/SteamSpot/i,"SteamSpot"],
    [/StainStriker/i,"StainStriker"],[/StainForce/i,"StainForce"],
    [/CarpetXpert/i,"CarpetXpert"],[/CarpetForce/i,"CarpetForce"],
    [/EveryMess/i,"EveryMess"],[/MessMaster/i,"MessMaster"],
    [/FlexStyle\s+IonCurl/i,"FlexStyle IonCurl"],[/FlexStyle/i,"FlexStyle"],
    [/SpeedStyle/i,"SpeedStyle"],[/\bGlam\b/i,"Glam"],
    [/BreatheClear/i,"BreatheClear"],[/NeverChange/i,"NeverChange"],
    [/CleanSense/i,"CleanSense"],[/CryoGlow/i,"CryoGlow"],
    [/FacialPro/i,"FacialPro"],[/Depuffi/i,"Depuffi"],
    [/SilkiPro/i,"SilkiPro"],[/Glossi/i,"Glossi"],
    [/FlexBreeze\s+HydroGo\s+Pro/i,"FlexBreeze HydroGo Pro"],
    [/FlexBreeze\s+HydroGo/i,"FlexBreeze HydroGo"],
    [/FlexBreeze\s+Pro\s*Mist/i,"FlexBreeze Pro Mist"],
    [/FlexBreeze/i,"FlexBreeze"],[/ChillPill/i,"ChillPill"],
    [/TurboBlade/i,"TurboBlade"],[/BlastBoss/i,"BlastBoss"],
    [/\bHEPA\b/i,"HEPA"],[/スチームモップ|Steam\s*Mop/i,"Steam Mop"],
    [/サイクロン.*ハンディ/i,"Cyclone 手持系列"],
  ];
  return rules.find(([pattern])=>pattern.test(name))?.[1]||"其他型号";
}

// Only well-matched product lines confirmed in the US, UK and Japan can use the earth mark.
const comparableGlobalSeries=new Set([
  "BreatheClear","Steam & Scrub","FlexBreeze HydroGo","FlexBreeze Pro Mist",
  "FlexBreeze","ChillPill","TurboBlade",
]);
export function globalSeriesKeys(products:Product[]):Set<string> {
  const markets=new Map<string,Set<string>>();
  for(const p of products){
    const family=seriesName(p);
    if(!comparableGlobalSeries.has(family))continue;
    const key=`${p.category}/${family}`;
    if(!markets.has(key))markets.set(key,new Set());
    for(const market of p.markets)markets.get(key)!.add(market);
  }
  return new Set([...markets].filter(([,countries])=>["US","UK","JP"].every(country=>countries.has(country))).map(([key])=>key));
}
export function useGlobalMark(product:Product,globalKeys:Set<string>):boolean {
  const family=seriesName(product);
  if(family==="BreatheClear"&&!/HP(?:062|162)(?:J|UK|-MASTER|UK-MASTER)?$/i.test(product.model||""))return false;
  if(family==="FlexBreeze"&&product.model==="FA202")return false;
  if(family==="Steam & Scrub"&&/UKDB$/i.test(product.model||""))return false;
  return globalKeys.has(`${product.category}/${family}`);
}
