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
  {id:"la-detect",label:"Detect 立式系列",category:"立式吸尘器",models:["LA450UKT-MASTER","LA492","LA791UKT","LA802"],rationale:"用户圈选四款 Detect 立式机合并展示，Pet Pro、XL、Pro 与地区配置差异保留在型号卡片中；LA362 Navigator 独立。"},
  {id:"az-powerdetect",label:"PowerDetect 立式系列",category:"立式吸尘器",models:["AZ3900UKT-MASTER","AZ3901"],rationale:"AZ39 PowerDetect 跨市场型号，Pet 套装与配件差异保留在单品卡。"},
  {id:"lu-rotator",label:"Rotator LU25 立式系列",category:"立式吸尘器",models:["LU250UK","LU250UKT","LU251UK","LU251UKT","LU252"],rationale:"LU25 Rotator 同系列，英国普通款、Pet／Pet Pro 套装与美国款分别列为 SKU。"},
  {id:"sv-freestyle",label:"Freestyle Max 无线立式",category:"无线吸尘器",models:["SV2000UK-MASTER","SV2002"],rationale:"Freestyle Max 的 SV2000／SV2002 跨市场型号，原目录分类已统一为无线吸尘器。"},
  {id:"rv-navigator",label:"Navigator 扫地机器人",category:"扫地机器人",models:["RV2110AEUK","RV2120AE"],rationale:"用户红框圈选：Navigator 基础款与自动集尘底座配置合并，型号细节保留在卡片中。"},
  {id:"rv-matrix",label:"Matrix / Matrix Plus 扫地机器人",category:"扫地机器人",models:["RV2310AE","RV2610WA","RV2620WAUK-MASTER","RV2620WDUK-MASTER"],rationale:"用户绿框圈选：Matrix 与 Matrix Plus 跨市场及洗地、自动集尘配置合并，功能差异保留在卡片中。"},
  {id:"rv-powerdetect",label:"PowerDetect 扫地机器人",category:"扫地机器人",models:["RV2800ZEUK-MASTER","RV2820ZE","RV2900XEUK-MASTER","RV2920XE"],rationale:"用户蓝框圈选的三款保持同合集；新增 RV2900XEUK 与已入组 RV2920XE 同属 ThermaCharged PowerDetect，保留地区配置差异。"},
  {id:"av-powerdetect",label:"PowerDetect AV28 扫地机器人",category:"扫地机器人",models:["AV2800ZEUKWH","AV2810ZEUKWH","AV2820AE","AV2820VEUKWH","AV2820ZEUKWH"],rationale:"AV28 PowerDetect 同代系列，吸尘／拖地、自动集尘和 NeverTouch Pro 底座按配置区分。"},
  {id:"av-uvreveal",label:"PowerDetect UV Reveal 扫地机器人",category:"扫地机器人",models:["AV3010XEUKWH","AV3020XEUK"],rationale:"AV30 UV Reveal 两款同名系列型号，保留具体套装差异。"},
  {id:"sd-steampickup",label:"SteamPickUp 地面清洁",category:"洗地机",models:["SD200UK","SD201"],rationale:"SD200UK／SD201 是英美市场 SteamPickUp 3-in-1，统一目录分类后合并。"},
  {id:"vm-vacmop",label:"VacMop / VacMop Reveal",category:"洗地机",models:["VM252","VM401"],rationale:"VM VacMop 吸尘加喷雾拖地系列，Reveal 的照明等升级留在型号卡；作为待确认平台候选。"},
  {id:"wv-dx",label:"EVOPOWER DX",category:"手持吸尘器",models:["WV515J","WV516J","WV517J"],rationale:"同系列 WV51 相邻配置型号。"},
  {id:"bh-powerboost",label:"PowerBoost 手持系列",category:"手持吸尘器",models:["BH102","BH102UK"],rationale:"BH102 美英市场同型号主体，英国 Pet 套装配件分别展示。"},
  {id:"ch-ultracyclone",label:"UltraCyclone 手持系列",category:"手持吸尘器",models:["CH901J","CH901UK","CH950UKT","CH951","CH951J","CH951UKBR"],rationale:"CH9 旋风手持系列；CH90 基础配置与 CH95 Pet 电动刷头配置保留区别。"},
  {id:"wv-evopower",label:"EVOPOWER W25 / W35",category:"手持吸尘器",models:["WV270J","WV270UK-MASTER","WV280J"],rationale:"WV27 跨市场型号与 WV28 的 W35 双电池配置同属 EVOPOWER W 系列，保留续航差异。",evidence:"https://www.sharkninja.jp/pages/shark-handycleaner-evopower-spec"},
  {id:"ex-150",label:"CarpetXpert Deep",category:"布艺清洗机",models:["EX150UK","EX150UKCP"],rationale:"EX150 基础型号与配色变体。"},
  {id:"ex-carpetxpert-stainstriker",label:"CarpetXpert + StainStriker",category:"布艺清洗机",models:["EX200UK","EX201"],rationale:"EX20 CarpetXpert 内置 StainStriker 的英美型号，清洗剂和附件按 SKU 区分。"},
  {id:"ex-carpetxpert-hairpro",label:"CarpetXpert HairPro",category:"布艺清洗机",models:["EX220UK","EX250UK","EX300UK","EX301"],rationale:"HairPro 主机系列；EX30 的内置 StainStriker 与 EX22／25 的配置区别保留在单品卡。",evidence:"https://www.sharkninja.co.uk/shark-carpetxpert-hairpro-pet-deep-carpet-cleaner-ex220uk/EX220UK.html"},
  {id:"ex-force",label:"CarpetForce Upright",category:"布艺清洗机",models:["EX500","EX502","EX500UK"],rationale:"EX500 系列跨市场基础配置。"},
  {id:"ex-force-hairpro",label:"CarpetForce HairPro",category:"布艺清洗机",models:["EX551","EX550UKT","EX550UKCP"],rationale:"EX55 HairPro 系列跨市场／配色配置。"},
  {id:"px-stainstriker",label:"StainStriker",category:"布艺清洗机",models:["PX201","PX200UK","PX200UKT-MASTER","PX200UKCP","PX200UKDB"],rationale:"PX20 StainStriker 跨市场、Pet 与配色配置。"},
  {id:"px-stainstriker-hairpro",label:"StainStriker HairPro",category:"布艺清洗机",models:["PX251","PX250UKT-MASTER"],rationale:"PX25 HairPro 跨市场配置。"},
  {id:"hx-stainforce",label:"StainForce 便携清洗",category:"布艺清洗机",models:["HX100J","HX101"],rationale:"HX10 StainForce 无线便携去渍机，日美市场型号。"},
  {id:"vx-everymess",label:"EveryMess 便携清洗",category:"布艺清洗机",models:["VX101","VX110UK"],rationale:"VX10 EveryMess 吸水、干吸与去渍便携机的美英型号。"},
  {id:"s-steammop",label:"Steam Mop S1000",category:"蒸汽清洁",models:["S1000","S1000J","S1000UK"],rationale:"S1000 蒸汽拖把跨美、日、英市场的同型号系列。"},
  {id:"s-steamspot",label:"SteamSpot S2001",category:"蒸汽清洁",models:["S2001","S2001UK"],rationale:"S2001 SteamSpot 同名英美市场型号。"},
  {id:"s-steam-scrub",label:"Steam & Scrub",category:"蒸汽清洁",models:["S8201","S8201J","S8201UK","S8201UKDB"],rationale:"S8201 跨市场型号与 Deluxe Black 配色。"},
  {id:"fa-chillpill",label:"ChillPill",category:"风扇",models:["FA022","FA022J","FA022UK"],rationale:"FA022 跨市场个人风扇。"},
  {id:"fa-hydrogo",label:"FlexBreeze HydroGo",category:"风扇",models:["FA052J","FA052-MASTER","FA050UK-MASTER"],rationale:"HydroGo 同系列跨市场型号。"},
  {id:"fa-promist",label:"FlexBreeze Pro Mist",category:"风扇",models:["FA302","FA302J","FA300UK"],rationale:"Pro Mist 同系列跨市场型号。"},
  {id:"fa-flexbreeze",label:"FlexBreeze 室内外风扇",category:"风扇",models:["FA202","FA220UK","FA222","FA222J"],rationale:"FA2 FlexBreeze 立式／桌面转换平台，喷雾附件与跨市场套装按 SKU 区分。"},
  {id:"tf-turboblade",label:"TurboBlade 塔扇",category:"风扇",models:["TF200SJ","TF200SUK","TF202S"],rationale:"TF20 TurboBlade 同系列美英日型号，颜色和控制配置保留在型号卡。"},
  {id:"ab-blastboss",label:"BlastBoss",category:"吹叶机",models:["AB2000J","AB2111J"],rationale:"官方发布的同系列主机与附件配置。",evidence:"https://www.sharkninja.jp/blogs/news/20260709-01"},
  {id:"fw-cryoglow",label:"CryoGlow LED Face Mask",category:"光疗面罩",models:["FW312","FW312S"],rationale:"FW312 基础款与充电底座套装。"},
  {id:"hd-flexstyle",label:"FlexStyle 造型器",category:"美发造型",models:["HD400SN","HD426SLUK","HD430","HD432PKUK","HD434","HD434UKPU","HD435","HD440BK","HD446UK-MASTER","HD449PK1","HD449UKPK1"],rationale:"HD4 FlexStyle 同系列主机，套装配件数、扩散风嘴、限定色和自选配件分别保留。"},
  {id:"hd-glam",label:"Glam 造型器",category:"美发造型",models:["HD6000PKSN","HD6041SUK","HD6042SUKPL","HD6051S","HD6051SUK-MASTER","HD6052S","HD6052SUK"],rationale:"HD60 Glam 主机平台；4-in-1／5-in-1、扩散风嘴和收纳盒为配置差异，原直发器分类已统一。"},
  {id:"hd-ioncurl",label:"FlexStyle IonCurl",category:"美发造型",models:["HD840","HD840PU","HD840UKPU","HD850UKPK","HD851UKPK"],rationale:"IonCurl 同系列，颜色、扩散风嘴和配件数量配置。"},
  {id:"hd-proflex",label:"SpeedStyle Pro FLEX",category:"吹风机",models:["HD542","HD542UK-MASTER"],rationale:"HD542 折叠式 SpeedStyle Pro FLEX 美英市场型号，风嘴套装差异保留。"},
  {id:"hd-speedstyle-pro",label:"SpeedStyle Pro",category:"吹风机",models:["HD700-BYOB","HD701UK","HD731","HD731UK","HD752UK"],rationale:"HD7 SpeedStyle Pro 主机系列，自选套装及 3-in-1／5-in-1 风嘴数量按 SKU 区分。"},
  {id:"fh-facialpro",label:"FacialPro Glow",category:"美容仪",models:["FH310","FH320"],rationale:"FH31 为 FacialPro Glow 主机套装，FH32 增加 DePuffi 配件／组合，分别展示。",evidence:"https://www.sharkninja.com/beauty/skincare/facial-devices"},
  {id:"hp-breatheclear-compact",label:"BreatheClear Compact",category:"空气净化器",models:["HP062","HP062J","HP062UK-MASTER"],rationale:"HP062 跨市场紧凑型型号。"},
  {id:"hp-breatheclear",label:"BreatheClear",category:"空气净化器",models:["HP162","HP162J","HP162UK-MASTER"],rationale:"HP162 跨市场型号。"},
  {id:"hp-neverchange-compact",label:"NeverChange Compact Pro",category:"空气净化器",models:["HP072","HP072UK-MASTER"],rationale:"HP072 Compact Pro 英美市场型号。"},
  {id:"hp-neverchange",label:"NeverChange HP15",category:"空气净化器",models:["HP150UK","HP152"],rationale:"HP15 NeverChange 常规机型的英国与美国版本，过滤和覆盖参数仍按单品展示。"},
];

const byModel=new Map<string,PlatformGroup>();
for(const group of PLATFORM_GROUPS)for(const model of group.models){
  if(byModel.has(model))throw new Error(`重复合并型号: ${model}`);
  byModel.set(model,group);
}
export function platformGroupFor(model:string|null):PlatformGroup|undefined {
  return model?byModel.get(model.toUpperCase()):undefined;
}
