// Reviewed display candidates. A shared prefix alone does not establish a platform.
// Keep this list explicit so new scan results are never merged without review.
export type PlatformGroup = {
  id:string;
  label:string;
  category:string;
  models:readonly string[];
  rationale:string;
  evidence?:string;
};

export const PLATFORM_GROUPS:readonly PlatformGroup[]=[
  {id:"lc-fit",label:"EVOPOWER SYSTEM FIT / FIT+",category:"无线吸尘器",models:["LC100J","LC102J","LC103J","LC150J","LC152J"],rationale:"FIT 与 FIT+ 同系列，机身型号相邻，配置以 SKU 区分。"},
  {id:"lc-neo",label:"EVOPOWER SYSTEM NEO / NEO II",category:"无线吸尘器",models:["LC200J","LC400J"],rationale:"用户指定合并 NEO 与 NEO II；关键参数一致，代际差异保留在各型号卡片中。"},
  {id:"lc-boost",label:"EVOPOWER SYSTEM BOOST / BOOST+",category:"无线吸尘器",models:["LC600J","LC602J","LC701J","LC702J","LC751J"],rationale:"用户圈选：BOOST 与 BOOST+ 合并为一组，各配置和差异保留在型号卡片中。",evidence:"https://www.sharkninja.jp/pages/shark-stickcleaner-evopowersystem_boost-spec"},
  {id:"lc-acticlean",label:"Shark ActiClean",category:"无线吸尘器",models:["LC800J","LC900J","LC950J"],rationale:"同一 ActiClean 系列的配置型号。",evidence:"https://www.sharkninja.jp/blogs/news/news260820-01"},
  {id:"cs-std",label:"EVOPOWER SYSTEM STD / STD+ / ADV",category:"无线吸尘器",models:["CS100J","CS102J","CS150JAE","CS601J"],rationale:"用户圈选：STD、STD+ 与 ADV 合为同一 EVOPOWER SYSTEM 合集，具体配置保留在型号卡片中。"},
  {id:"iw-cleansense",label:"CleanSense iQ / iQ+",category:"无线吸尘器",models:["IW2241J","IW3241J"],rationale:"用户蓝框圈选：CleanSense iQ 与 iQ+ 分别展示基础款与带自动集尘底座的配置。"},
  {id:"iw-powerclean",label:"PowerClean 360 / 360 PRO",category:"无线吸尘器",models:["IW4171J","IW4176J","IW5271J"],rationale:"用户红框圈选：PowerClean 360 与 360 PRO 同合集，代际与配置差异保留在型号卡片中。"},
  {id:"ia-speed",label:"PowerDetect Speed / Clean & Empty",category:"无线吸尘器",models:["IA1241","IA1241UK-MASTER","IA1241UKPU","IA3241"],rationale:"用户圈选：PowerDetect Speed 基础款与 Clean & Empty 自动集尘配置合并。"},
  {id:"ip-stick",label:"PowerDetect Cordless / Clean & Empty",category:"无线吸尘器",models:["IP1251","IP1251UK","IP1251UKT","IP3251","IP3251UKT","IP3256"],rationale:"用户圈选：PowerDetect Cordless 基础款、Pet、Clean & Empty 及 Reveal 配置合并。"},
  {id:"bu-empty",label:"PowerLite / Clean & Empty",category:"无线吸尘器",models:["BU1621","BU3521","BU3621UKT","BU3626"],rationale:"用户圈选：PowerLite 基础款与 Clean & Empty 自动集尘配置合并。"},
  {id:"iy-pet",label:"Pet Cordless",category:"无线吸尘器",models:["IY143H","IY143HUK"],rationale:"用户圈选：IY143H 美英市场型号合并，市场和配件差异保留在型号卡片中。"},
  {id:"iz-powerpro",label:"PowerPro 系列",category:"无线吸尘器",models:["IZ373H","IZ380UKFDB","IZ380UKT","IZ381UK","IZ381UKT","IZ382H"],rationale:"用户圈选：PowerPro 美英市场型号合并，Pet、Reveal、Flex 与配置差异保留在型号卡片中。"},
  {id:"iz-stratos",label:"Stratos Anti Hair Wrap Plus",category:"无线吸尘器",models:["IZ400UK","IZ400UKT","IZ420UKT"],rationale:"同系列单／双电池及 Pet 配置。"},
  {id:"hv-rocket",label:"Rocket / Rocket Pro",category:"有线杆式吸尘器",models:["HV251","HV371"],rationale:"用户上框圈选：HV Rocket 与 Rocket Pro 合并展示，各型号保留原商品名称和参数。"},
  {id:"hz-corded",label:"HZ 有线杆式系列",category:"有线杆式吸尘器",models:["HZ4002","HZ702","HZ752"],rationale:"用户下框圈选：HZ 三款有线杆式产品合并展示，Pet Pro、Detect、PowerDetect 子系列差异保留在型号卡片中。"},
  {id:"lx-transformer",label:"PowerDetect Transformer",category:"立式吸尘器",models:["LX5000","LX5000UKT","LX5001UKT"],rationale:"用户圈选：PowerDetect Transformer 美英市场型号及英国配色配置合并，型号差异保留在卡片中。"},
  {id:"wv-dx",label:"EVOPOWER DX",category:"手持吸尘器",models:["WV515J","WV516J","WV517J"],rationale:"同系列 WV51 相邻配置型号。"},
  {id:"ex-150",label:"CarpetXpert Deep",category:"布艺清洗机",models:["EX150UK","EX150UKCP"],rationale:"EX150 基础型号与配色变体。"},
  {id:"ex-force",label:"CarpetForce Upright",category:"布艺清洗机",models:["EX500","EX502","EX500UK"],rationale:"EX500 系列跨市场基础配置。"},
  {id:"ex-force-hairpro",label:"CarpetForce HairPro",category:"布艺清洗机",models:["EX551","EX550UKT","EX550UKCP"],rationale:"EX55 HairPro 系列跨市场／配色配置。"},
  {id:"px-stainstriker",label:"StainStriker",category:"布艺清洗机",models:["PX201","PX200UK","PX200UKT-MASTER","PX200UKCP","PX200UKDB"],rationale:"PX20 StainStriker 跨市场、Pet 与配色配置。"},
  {id:"px-stainstriker-hairpro",label:"StainStriker HairPro",category:"布艺清洗机",models:["PX251","PX250UKT-MASTER"],rationale:"PX25 HairPro 跨市场配置。"},
  {id:"s-steam-scrub",label:"Steam & Scrub",category:"蒸汽清洁",models:["S8201","S8201J","S8201UK","S8201UKDB"],rationale:"S8201 跨市场型号与 Deluxe Black 配色。"},
  {id:"fa-chillpill",label:"ChillPill",category:"风扇",models:["FA022","FA022J","FA022UK"],rationale:"FA022 跨市场个人风扇。"},
  {id:"fa-hydrogo",label:"FlexBreeze HydroGo",category:"风扇",models:["FA052J","FA052-MASTER","FA050UK-MASTER"],rationale:"HydroGo 同系列跨市场型号。"},
  {id:"fa-promist",label:"FlexBreeze Pro Mist",category:"风扇",models:["FA302","FA302J","FA300UK"],rationale:"Pro Mist 同系列跨市场型号。"},
  {id:"ab-blastboss",label:"BlastBoss",category:"吹叶机",models:["AB2000J","AB2111J"],rationale:"官方发布的同系列主机与附件配置。",evidence:"https://www.sharkninja.jp/blogs/news/20260709-01"},
  {id:"fw-cryoglow",label:"CryoGlow LED Face Mask",category:"光疗面罩",models:["FW312","FW312S"],rationale:"FW312 基础款与充电底座套装。"},
  {id:"hd-ioncurl",label:"FlexStyle IonCurl",category:"美发造型",models:["HD840","HD840PU","HD840UKPU","HD850UKPK","HD851UKPK"],rationale:"IonCurl 同系列，颜色、扩散风嘴和配件数量配置。"},
  {id:"hp-breatheclear-compact",label:"BreatheClear Compact",category:"空气净化器",models:["HP062","HP062J","HP062UK-MASTER"],rationale:"HP062 跨市场紧凑型型号。"},
  {id:"hp-breatheclear",label:"BreatheClear",category:"空气净化器",models:["HP162","HP162J","HP162UK-MASTER"],rationale:"HP162 跨市场型号。"},
];

const byModel=new Map<string,PlatformGroup>();
for(const group of PLATFORM_GROUPS)for(const model of group.models){
  if(byModel.has(model))throw new Error(`重复合并型号: ${model}`);
  byModel.set(model,group);
}
export function platformGroupFor(model:string|null):PlatformGroup|undefined {
  return model?byModel.get(model.toUpperCase()):undefined;
}
