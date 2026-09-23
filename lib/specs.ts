import type { Product } from "./catalog";

const LABELS:Record<string,string>={
  power:"功率", runtime:"续航", weight:"重量", dust:"尘杯", cord:"线长",
  charge:"充电", width:"清洁宽度", voltage:"电压", height:"高度", size:"尺寸",
  coverage:"适用面积", filterLife:"滤芯寿命", filter:"过滤", speed:"风速档",
  heat:"温档", autoEmpty:"自动集尘", mode:"清洁方式", treatment:"护理时长",
};
const COMMON=["power","weight","runtime","charge","cord","voltage","size"];
const BY_CATEGORY:Record<string,string[]>={
  "无线吸尘器":["runtime","power","weight","dust","charge","autoEmpty","width","filter","size","voltage"],
  "有线杆式吸尘器":["power","dust","cord","weight","width","filter","height","voltage"],
  "立式吸尘器":["power","dust","cord","weight","filter","width","height","voltage"],
  "手持吸尘器":["runtime","power","weight","dust","charge","filter","size","voltage"],
  "扫地机器人":["mode","runtime","weight","dust","charge","autoEmpty","power","size","voltage"],
  "洗地机":["power","runtime","weight","cord","charge","height","width","voltage"],
  "布艺清洗机":["power","runtime","cord","weight","charge","width","size","voltage"],
  "蒸汽清洁":["power","cord","weight","height","size","voltage"],
  "美发造型":["power","weight","cord","heat","voltage"],
  "吹风机":["power","weight","cord","heat","voltage"],
  "直发器":["power","weight","cord","heat","voltage"],
  "热风梳":["power","weight","cord","heat","voltage"],
  "美容仪":["power","weight","runtime","charge","voltage"],
  "光疗面罩":["treatment","power","weight","charge","runtime","voltage"],
  "空气净化器":["coverage","power","filterLife","weight","speed","filter","cord","voltage","size"],
  "风扇":["runtime","power","speed","weight","charge","cord","voltage","size"],
  "吹叶机":["runtime","weight","charge","size"],
};

export function cardSpecs(product:Product):Array<{label:string;value:string;verified:boolean}> {
  const specs=product.specs||{};
  const order=BY_CATEGORY[product.category]||COMMON;
  const found=order.filter(key=>specs[key]).slice(0,4).map(key=>({label:LABELS[key],value:specs[key],verified:true}));
  if(!found.length)return [{label:"参数",value:"待核实",verified:false}];
  for(const key of order){
    if(found.length>=3)break;
    if(specs[key]||found.some(field=>field.label===LABELS[key]))continue;
    found.push({label:LABELS[key],value:"待核实",verified:false});
  }
  return found;
}
