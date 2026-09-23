"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, RefreshCw, Globe2, CalendarDays, Layers3, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CATEGORIES, SCAN_SOURCES, STARTER_PRODUCTS, type Product } from "@/lib/catalog";
import { globalSeriesKeys, modelSeries, useGlobalMark } from "@/lib/series";
import { cardSpecs } from "@/lib/specs";

const groupOrder=["地面清洁","个护","家居环境"];
type Run = {source:string;added:number;checked?:number;status:string;detail?:string};
const flag:Record<string,{file:string,name:string}>={
  US:{file:"us",name:"美国"},UK:{file:"gb",name:"英国"},DE:{file:"de",name:"德国"},
  FR:{file:"fr",name:"法国"},IT:{file:"it",name:"意大利"},JP:{file:"jp",name:"日本"},
  CA:{file:"ca",name:"加拿大"},AU:{file:"au",name:"澳大利亚"},KR:{file:"kr",name:"韩国"},
};
function Flag({code}:{code:string}) {
  const country=flag[code];
  return country?<img className="flag-icon" src={`/flags/${country.file}.svg`} alt={`${country.name}国旗`} width="24" height="16"/>:<span>{code}</span>;
}
function dateLabel(value:string|null,precision:string|null) {
  if(!value) return "发布日期待核实";
  if(precision==="year") return value.slice(0,4);
  if(precision==="month") return value.slice(0,7).replace("-",".");
  return value.replaceAll("-",".");
}
function isNew(p:Product) {
  if(!p.releaseDate || p.releasePrecision!=="day") return false;
  const days=(Date.now()-new Date(p.releaseDate+"T00:00:00Z").getTime())/86400000;
  return days>=0 && days<=180;
}
function ProductCard({product:p,globalKeys}:{product:Product;globalKeys:Set<string>}) {
  const shown=p.markets.slice(0,4), extra=p.markets.length-4;
  const global=useGlobalMark(p,globalKeys);
  const isRetailer=new URL(p.officialUrl).hostname.endsWith("target.com");
  const specs=cardSpecs(p);
  const [imageFailed,setImageFailed]=useState(false);
  useEffect(()=>setImageFailed(false),[p.imageUrl]);
  return <article className="product-card">
    <div className="image-panel">
      {!imageFailed ? <img src={p.imageUrl||`/api/image?id=${encodeURIComponent(p.id)}`} alt={p.name} loading="lazy" onError={()=>setImageFailed(true)}/> :
        <div className="image-fallback" aria-label="暂无产品图片"><span>SHARK</span><strong>{p.model||"PRODUCT"}</strong></div>}
      {isNew(p)&&<span className="new-tag">NEW RELEASE</span>}
      <div className="market-row" aria-label="已确认销售国家">
        {global?<span className="global-mark" title="此系列已在美国、英国、日本核实销售；各地区的具体型号和配置可能不同"><img src="/icons/globe.svg" alt="跨市场系列" width="25" height="25"/></span>:
          shown.length===1?<span className="market-chip only" title="目前只确认这个国家的销售记录">ONLY <Flag code={shown[0]}/></span>:
          shown.map(m=><span className="market-chip" title={flag[m]?.name||m} key={m}><Flag code={m}/></span>)}
        {!global&&extra>0&&<Tooltip><TooltipTrigger asChild><button className="market-chip more" aria-label={`另有 ${extra} 个国家，查看全部`}>+{extra}</button></TooltipTrigger>
          <TooltipContent side="top" className="market-tooltip"><strong>已确认的市场</strong><div>{p.markets.map(m=><span key={m}><Flag code={m}/> {flag[m]?.name||m}</span>)}</div></TooltipContent></Tooltip>}
      </div>
    </div>
    <div className="card-content">
      <div className="model-line">{p.model||"型号待核实"}</div>
      <h3>{p.name}</h3>
      <p className="spec-line" aria-label="产品关键参数">{specs.map((spec,index)=><span key={spec.label} className={spec.verified?"":"spec-unverified"}>
        {index>0&&<span className="spec-separator">{" | "}</span>}{spec.label} {spec.value}
      </span>)}</p>
      <p className="release"><CalendarDays size={14}/>{dateLabel(p.releaseDate,p.releasePrecision)}{p.releaseSource&&<a href={p.releaseSource} target="_blank" rel="noopener noreferrer" title="查看发布日期来源" aria-label="查看发布日期来源"><ExternalLink size={13}/></a>}</p>
      <div className="card-links"><a href={p.officialUrl} target="_blank" rel="noopener noreferrer">{isRetailer?"Target 商品页":"Shark 官网"} <ArrowUpRight size={14}/></a>
        {p.amazonUrl&&<a href={p.amazonUrl} target="_blank" rel="noopener noreferrer">Amazon <ArrowUpRight size={14}/></a>}</div>
    </div>
  </article>;
}

export default function Home() {
  const [products,setProducts]=useState<Product[]>(STARTER_PRODUCTS);
  const [last,setLast]=useState<string|null>(null);
  const [running,setRunning]=useState(false);
  const [index,setIndex]=useState(0);
  const [runs,setRuns]=useState<Run[]>([]);
  const [loadError,setLoadError]=useState<string|null>(null);
  const [active,setActive]=useState<string>("全部");
  const globalKeys=useMemo(()=>globalSeriesKeys(products),[products]);
  async function load() {
    try {
      const response=await fetch("/api/products",{cache:"no-store"});
      const data=await response.json() as {products:Product[];lastRefresh:{at:string}|null;warning?:string;error?:string};
      if(!response.ok)throw new Error(data.error||"数据暂不可用");
      setProducts(data.products);setLast(data.lastRefresh?.at||null);setLoadError(data.warning||null);
    }catch(e){setLoadError(e instanceof Error?e.message:"读取失败");}
  }
  useEffect(()=>{void load();},[]);
  async function refresh(){
    if(running)return;
    setRunning(true);setRuns([]);setIndex(0);
    const results:Run[]=[];
    for(let i=0;i<SCAN_SOURCES.length;i++){
      setIndex(i+1);
      try{
        const response=await fetch("/api/refresh",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({categoryIndex:i})});
        const data=await response.json() as Run & {error?:string};
        results.push(response.ok?data:{source:SCAN_SOURCES[i].label,added:0,status:"error",detail:data.error||"请求失败"});
      }catch(e){results.push({source:SCAN_SOURCES[i].label,added:0,status:"error",detail:e instanceof Error?e.message:"网络错误"});}
      setRuns([...results]);
      await load();
    }
    setRunning(false);
  }
  const filtered=useMemo(()=>active==="全部"?products:products.filter(p=>CATEGORIES.find(c=>c.label===p.category)?.group===active),[active,products]);
  const groups=groupOrder.map(group=>({group,categories:CATEGORIES.filter(c=>c.group===group).map(c=>{
    const items=filtered.filter(p=>p.category===c.label);
    const bySeries=new Map<string,Product[]>();
    for(const p of items){const series=modelSeries(p);if(!bySeries.has(series))bySeries.set(series,[]);bySeries.get(series)!.push(p);}
    const series=[...bySeries].map(([name,members])=>({name,items:members.sort((a,b)=>(a.model||"").localeCompare(b.model||"",undefined,{numeric:true}))}))
      .sort((a,b)=>a.name==="型号待核实"?1:b.name==="型号待核实"?-1:a.name.localeCompare(b.name));
    return {label:c.label,items,series};
  }).filter(c=>c.items.length)})).filter(g=>g.categories.length);
  const failures=runs.filter(r=>r.status!=="ok");
  return <TooltipProvider><div className="app-shell">
    <header className="topbar"><div className="brand-mark">S<span>•</span></div><div className="brand-copy"><strong>SHARK</strong><span>PRODUCT PORTFOLIO</span></div><div className="topbar-right">BRAND MONITOR <span className="topbar-sep"/> SHARK ONLY</div></header>
    <main>
      <section className="intro"><div><div className="eyebrow"><span className="pulse-dot"/> PRODUCT INTELLIGENCE / 01</div><h1>Shark 产品线</h1><p>按品类查看已核实的产品、上市时间和销售市场。</p></div>
        <div className="refresh-box"><div className="refresh-meta">{last?`上次检查 ${new Date(last).toLocaleString("zh-CN",{timeZone:"Asia/Shanghai"})}`:"尚未检查公开来源"}</div>
        <Button onClick={refresh} disabled={running} className="refresh-button"><RefreshCw size={17} className={running?"spin":""}/>{running?`正在检查 ${index}/${SCAN_SOURCES.length}`:"刷新 Shark 产品"}</Button></div></section>
      <section className="status-strip" aria-live="polite"><div><Layers3 size={17}/><strong>{products.length}</strong><span>已收录产品</span></div><div><Globe2 size={17}/><span>当前已核实市场</span><strong className="status-flags">{[...new Set(products.flatMap(p=>p.markets))].map(m=><Flag code={m} key={m}/>)}</strong></div><p>收录 Shark 官网及其他零售渠道可核实的型号，覆盖范围持续扩充。</p></section>
      {(running||runs.length>0)&&<div className="scan-report" role="status"><strong>{running?`正在检查：${SCAN_SOURCES[Math.max(0,index-1)].label}`:`本次检查完成 · 新增 ${runs.reduce((n,r)=>n+r.added,0)} 件`}</strong>
        <span>{runs.filter(r=>r.status==="ok").length}/{SCAN_SOURCES.length} 个来源读取成功{failures.length>0?` · ${failures.length} 个来源未读取`:""}</span>
        {!running&&failures.length>0&&<details><summary>查看未读取的来源</summary>{failures.map((r,i)=><p key={i}>{r.source}：{r.detail||"来源不可用"}</p>)}</details>}
      </div>}
      {loadError&&<div className="load-error">{loadError}。当前页面显示已核实的仓库快照。</div>}
      <nav className="group-nav" aria-label="产品分组">{["全部",...groupOrder].map(g=><button key={g} onClick={()=>setActive(g)} className={active===g?"selected":""}>{g}<span>{g==="全部"?products.length:products.filter(p=>CATEGORIES.find(c=>c.label===p.category)?.group===g).length}</span></button>)}</nav>
      <div className="catalog">{groups.map(({group,categories})=><section className="group" key={group}><div className="group-head"><span>{group==="地面清洁"?"01":group==="个护"?"02":"03"}</span><h2>{group}</h2><div/></div>
        {categories.map(({label,items,series})=><section className="category" key={label}><div className="category-head"><h3>{label}</h3><span>{String(items.length).padStart(2,"0")} PRODUCTS</span></div>
          {series.map(({name,items:members})=><div className="series" key={name}><div className="series-head"><h4>{name}</h4><span>{members.length}</span></div>
            <div className="product-grid">{members.map(p=><ProductCard key={p.id} product={p} globalKeys={globalKeys}/>)}</div></div>)}
        </section>)}
      </section>)}</div>
      <footer><span>SHARK PRODUCT PORTFOLIO</span><p>参数来自对应型号的商品页，重量与续航受配置和测试条件影响；待核实表示尚无可靠数值。地球表示同系列在美、英、日均有销售记录，具体型号可能不同；ONLY 表示目前只确认一个国家。在线刷新通过原站的数据服务运行；若原站停用，需迁移数据库后继续使用。</p></footer>
    </main>
  </div></TooltipProvider>;
}
