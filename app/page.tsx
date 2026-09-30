"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight, RefreshCw, Globe2, CalendarDays, Layers3, ExternalLink, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CATEGORIES, STARTER_PRODUCTS, type Product } from "@/lib/catalog";
import { globalSeriesKeys, modelSeries, useGlobalMark } from "@/lib/series";
import { platformGroupFor, type PlatformGroup } from "@/lib/platform-groups";
import { cardSpecs } from "@/lib/specs";
import fxSnapshot from "@/data/fx-snapshot.json";
import refreshStatus from "@/data/refresh-status.json";

const groupOrder=["洗地机","布艺","机器人","吸尘器","蒸汽拖把","立式机","地毯清洗","吹叶机","个护","风扇","空净"];
const latestLabel="最近上新";
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
  if(new Date(value+"T00:00:00Z").getTime()>Date.now())return `预计 ${value.replaceAll("-",".")} 上市`;
  return value.replaceAll("-",".");
}
function isNew(p:Product) {
  if(!p.releaseDate || p.releasePrecision!=="day") return false;
  const days=(Date.now()-new Date(p.releaseDate+"T00:00:00Z").getTime())/86400000;
  return days>=0 && days<=180;
}
const fx=fxSnapshot as {asOf:string;rates:Record<string,number>;sourceUrl:string};
const update=refreshStatus as {updatedAt:string|null;catalogCount:number;pricedCount:number;pendingCount:number;fxAsOf:string|null};
function updateLabel(value:string|null) {
  if(!value)return "等待首次自动更新";
  return new Date(value).toLocaleString("zh-CN",{timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false});
}
function currencyAmount(amount:number,currency:string) {
  return new Intl.NumberFormat("en-US",{style:"currency",currency,maximumFractionDigits:currency==="JPY"?0:2}).format(amount);
}
function PriceTag({product:p}:{product:Product}) {
  const price=p.price;
  if(!price)return <div className="price-line price-missing" title="官网未公开挂价，或该商品页暂时无法核实价格">官网价格待核实</div>;
  const rate=fx.rates[price.currency],usdRate=fx.rates.USD;
  const native=currencyAmount(price.amount,price.currency)+(price.amountMax?` – ${currencyAmount(price.amountMax,price.currency)}`:"");
  const usd=rate&&usdRate?currencyAmount(price.amount/rate*usdRate,"USD")+(price.amountMax?` – ${currencyAmount(price.amountMax/rate*usdRate,"USD")}`:""):null;
  return <div className="price-line" title={`官网价格采集：${price.checkedAt.slice(0,10)}；美元换算：欧洲央行 ${fx.asOf} 参考汇率`}>
    <span>官网售价</span><strong>{native}</strong>{price.currency!=="USD"&&usd&&<small>约 {usd}</small>}
    <span className="price-date">采集 {price.checkedAt.slice(0,10)}</span>
  </div>;
}
function ProductCard({product:p,globalKeys,inactive=false}:{product:Product;globalKeys:Set<string>;inactive?:boolean}) {
  const shown=p.markets.slice(0,4), extra=p.markets.length-4;
  const global=useGlobalMark(p,globalKeys);
  const isRetailer=new URL(p.officialUrl).hostname.endsWith("target.com");
  const specs=cardSpecs(p);
  const [imageFailed,setImageFailed]=useState(false);
  useEffect(()=>setImageFailed(false),[p.imageUrl]);
  return <article className="product-card">
    <div className="image-panel">
      {!imageFailed&&p.imageUrl ? <img src={p.imageUrl} alt={p.name} loading="lazy" onError={()=>setImageFailed(true)}/> :
        <div className="image-fallback" aria-label="暂无产品图片"><span>SHARK</span><strong>{p.model||"PRODUCT"}</strong></div>}
      {isNew(p)&&<span className="new-tag">NEW RELEASE</span>}
      <div className="market-row" aria-label="已确认销售国家">
        {global?<span className="global-mark" title="此系列已在美国、英国、日本核实销售；各地区的具体型号和配置可能不同"><img src="/icons/globe.svg" alt="跨市场系列" width="25" height="25"/></span>:
          shown.length===1?<span className="market-chip only" title="目前只确认这个国家的销售记录">ONLY <Flag code={shown[0]}/></span>:
          shown.map(m=><span className="market-chip" title={flag[m]?.name||m} key={m}><Flag code={m}/></span>)}
        {!global&&extra>0&&<Tooltip><TooltipTrigger asChild><button className="market-chip more" tabIndex={inactive?-1:undefined} aria-label={`另有 ${extra} 个国家，查看全部`}>+{extra}</button></TooltipTrigger>
          <TooltipContent side="top" className="market-tooltip"><strong>已确认的市场</strong><div>{p.markets.map(m=><span key={m}><Flag code={m}/> {flag[m]?.name||m}</span>)}</div></TooltipContent></Tooltip>}
      </div>
    </div>
    <div className="card-content">
      <div className="model-line">{p.model||"型号待核实"}</div>
      <h3>{p.name}</h3>
      <PriceTag product={p}/>
      <p className="spec-line" aria-label="产品关键参数">{specs.map((spec,index)=><span key={spec.label} className={spec.verified?"":"spec-unverified"}>
        {index>0&&<span className="spec-separator">{" | "}</span>}{spec.label} {spec.value}
      </span>)}</p>
      <p className="release"><CalendarDays size={14}/>{dateLabel(p.releaseDate,p.releasePrecision)}{p.releaseSource&&<a href={p.releaseSource} tabIndex={inactive?-1:undefined} target="_blank" rel="noopener noreferrer" title="查看发布日期来源" aria-label="查看发布日期来源"><ExternalLink size={13}/></a>}</p>
      <div className="card-links"><a href={p.officialUrl} tabIndex={inactive?-1:undefined} target="_blank" rel="noopener noreferrer">{isRetailer?"Target 商品页":"Shark 官网"} <ArrowUpRight size={14}/></a>
        {p.amazonUrl&&<a href={p.amazonUrl} tabIndex={inactive?-1:undefined} target="_blank" rel="noopener noreferrer">Amazon <ArrowUpRight size={14}/></a>}</div>
    </div>
  </article>;
}

function StackPreview({products,group,onOpen,open=false}:{products:Product[];group:PlatformGroup;onOpen:()=>void;open?:boolean}) {
  const cover=products[0];
  const [imageFailed,setImageFailed]=useState(false);
  return <div className="stack-preview">
    <div className="stack-preview-layers" aria-hidden="true"><span/><span/><span/></div>
    <button type="button" className="stack-preview-face" onClick={onOpen} aria-expanded={open} aria-label={`${open?"当前已展开":"展开"} ${group.label} 合集，共 ${products.length} 个型号`}>
      <div className="stack-preview-image">
        {!imageFailed&&cover.imageUrl?<img src={cover.imageUrl} alt="" loading="lazy" onError={()=>setImageFailed(true)}/>:
          <span className="stack-preview-fallback">SHARK</span>}
        {products.some(isNew)&&<span className="new-tag">NEW RELEASE</span>}
        <span className="stack-preview-count">{products.length} SKU</span>
      </div>
      <div className="stack-preview-content">
        <span className="stack-preview-series">{modelSeries(cover)}</span>
        <span className="model-line">{products[0].model} — {products[products.length-1].model}</span>
        <strong>{group.label}</strong>
        <span className="stack-preview-models">{products.map(p=>p.model).join(" · ")}</span>
        <span className="stack-preview-action">查看合集 <ArrowUpRight size={16}/></span>
      </div>
    </button>
  </div>;
}

function PlatformStackInline({products,group,globalKeys,onClose}:{products:Product[];group:PlatformGroup;globalKeys:Set<string>;onClose:(restoreFocus?:boolean)=>void}) {
  const [selected,setSelected]=useState(0);
  const selectedRef=useRef(selected);
  selectedRef.current=selected;
  const lastWheel=useRef(0);
  const rootRef=useRef<HTMLElement>(null);
  const closeRef=useRef<HTMLButtonElement>(null);
  const shift=(direction:number)=>setSelected(current=>Math.max(0,Math.min(products.length-1,current+direction)));
  useEffect(()=>{
    closeRef.current?.focus();
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){event.preventDefault();onClose();}
      if(event.key==="ArrowRight"||event.key==="ArrowDown"){event.preventDefault();setSelected(current=>Math.min(products.length-1,current+1));}
      if(event.key==="ArrowLeft"||event.key==="ArrowUp"){event.preventDefault();setSelected(current=>Math.max(0,current-1));}
    };
    const onOutside=(event:PointerEvent)=>{
      if(event.button===0&&!rootRef.current?.contains(event.target as Node))onClose(false);
    };
    const onWheel=(event:WheelEvent)=>{
      if(Math.abs(event.deltaY)<5&&Math.abs(event.deltaX)<5)return;
      const delta=Math.abs(event.deltaY)>Math.abs(event.deltaX)?event.deltaY:event.deltaX;
      if((delta>0&&selectedRef.current===products.length-1)||(delta<0&&selectedRef.current===0))return;
      event.preventDefault();
      if(Date.now()-lastWheel.current<480)return;
      lastWheel.current=Date.now();
      setSelected(current=>Math.max(0,Math.min(products.length-1,current+(delta>0?1:-1))));
    };
    window.addEventListener("keydown",onKey);
    document.addEventListener("pointerdown",onOutside);
    const root=rootRef.current;
    root?.addEventListener("wheel",onWheel,{passive:false});
    return ()=>{window.removeEventListener("keydown",onKey);document.removeEventListener("pointerdown",onOutside);root?.removeEventListener("wheel",onWheel);};
  },[onClose,products.length]);
  return <section ref={rootRef} className="stack-inline" role="region" aria-label={`${group.label} 产品合集`}>
      <div className="stack-inline-top">
        <div><span className="stack-inline-kicker">PRODUCT PLATFORM / SKU COLLECTION</span><h2>{group.label}</h2><p>{products.length} 个型号 · 原位展开</p></div>
        <button ref={closeRef} className="stack-close" type="button" onClick={()=>onClose()} aria-label="关闭合集"><X size={20}/></button>
      </div>
      <div className="stack-stage" aria-live="polite">
        {products.map((product,index)=>{
          const offset=index-selected;
          const depth=Math.abs(offset);
          const style={"--offset":offset,"--depth":depth,zIndex:10-depth} as CSSProperties;
          return <div key={product.id} className={`stack-slide ${depth===0?"is-current":""}`} style={style}
            onClick={()=>{if(depth!==0)setSelected(index);}} aria-hidden={depth!==0}>
            <ProductCard product={product} globalKeys={globalKeys} inactive={depth!==0}/>
          </div>;
        })}
      </div>
      <div className="stack-controls">
        <button type="button" onClick={()=>shift(-1)} disabled={selected===0} aria-label="上一个型号"><ChevronLeft size={22}/></button>
        <div className="stack-position"><strong>{products[selected].model}</strong><span>{selected+1} / {products.length}</span></div>
        <button type="button" onClick={()=>shift(1)} disabled={selected===products.length-1} aria-label="下一个型号"><ChevronRight size={22}/></button>
      </div>
      <div className="stack-model-nav" aria-label="选择型号">
        {products.map((product,index)=><button key={product.id} type="button" className={index===selected?"is-selected":""} onClick={()=>setSelected(index)} aria-current={index===selected?"true":undefined}>{product.model}</button>)}
      </div>
      <p className="stack-hint">滚轮 / 方向键切换 · 点击外部或按 Esc 退出</p>
    </section>;
}

export default function Home() {
  const products=STARTER_PRODUCTS;
  const [active,setActive]=useState<string>("全部");
  const [openGroupId,setOpenGroupId]=useState<string|null>(null);
  const [gridColumns,setGridColumns]=useState(4);
  const stackTriggers=useRef(new Map<string,HTMLButtonElement>());
  const globalKeys=useMemo(()=>globalSeriesKeys(products),[products]);
  useEffect(()=>{
    const syncColumns=()=>setGridColumns(window.innerWidth<=760?2:window.innerWidth<=1100?3:4);
    syncColumns();window.addEventListener("resize",syncColumns);
    return ()=>window.removeEventListener("resize",syncColumns);
  },[]);
  const latest=useMemo(()=>products.filter(isNew).sort((a,b)=>(b.releaseDate||"").localeCompare(a.releaseDate||"")),[products]);
  const filtered=useMemo(()=>active==="全部"?products:active===latestLabel?latest:products.filter(p=>CATEGORIES.find(c=>c.label===p.category)?.group===active),[active,products,latest]);
  const closeGroup=useCallback((restoreFocus=true)=>{
    const previous=openGroupId;
    setOpenGroupId(null);
    if(restoreFocus&&previous)requestAnimationFrame(()=>stackTriggers.current.get(previous)?.focus());
  },[openGroupId]);
  const groups=groupOrder.map(group=>({group,categories:CATEGORIES.filter(c=>c.group===group).map(c=>{
    const items=filtered.filter(p=>p.category===c.label);
    const sorted=[...items].sort((a,b)=>(a.model||"").localeCompare(b.model||"",undefined,{numeric:true}));
    const collections:{group:PlatformGroup;products:Product[]}[]=[];
    const singles:Product[]=[];
    const seen=new Set<string>();
    for(const p of sorted){
      const platform=platformGroupFor(p.model);
      const collection=platform?.category===c.label?sorted.filter(item=>platform.models.includes(item.model||"")):[];
      if(platform&&collection.length>=2){
        if(!seen.has(platform.id)){collections.push({group:platform,products:collection});seen.add(platform.id);}
      }else singles.push(p);
    }
    const inlineProducts=collections.length>0?singles.filter(p=>p.model==="RVD120X1JP"):[];
    const remainingSingles=singles.filter(p=>!inlineProducts.includes(p));
    const collectionRows=Array.from({length:Math.ceil(collections.length/gridColumns)},(_,i)=>collections.slice(i*gridColumns,(i+1)*gridColumns));
    if(inlineProducts.length>0&&collections.length%gridColumns===0)collectionRows.push([]);
    return {label:c.label,items,collectionRows,collections,singles:remainingSingles,inlineProducts};
  }).filter(c=>c.items.length)})).filter(g=>g.categories.length);
  return <TooltipProvider><div className="app-shell">
    <header className="topbar"><div className="brand-mark">S<span>•</span></div><div className="brand-copy"><strong>SHARK</strong><span>PRODUCT PORTFOLIO</span></div><div className="topbar-right">BRAND MONITOR <span className="topbar-sep"/> SHARK ONLY</div></header>
    <main>
      <section className="intro"><div><div className="eyebrow"><span className="pulse-dot"/> PRODUCT INTELLIGENCE / 01</div><h1>Shark 产品线</h1><p>按品类查看已核实的产品、上市时间和销售市场。</p></div>
        <div className="refresh-box"><div className="refresh-meta">最近更新 {updateLabel(update.updatedAt)}</div>
        <div className="auto-refresh-badge" title={`已核实价格 ${update.pricedCount} 个；待审核新品 ${update.pendingCount} 个`}><RefreshCw size={17}/>每日自动更新</div></div></section>
      <section className="status-strip" aria-live="polite"><div><Layers3 size={17}/><strong>{products.length}</strong><span>已收录产品</span></div><div><Globe2 size={17}/><span>当前已核实市场</span><strong className="status-flags">{[...new Set(products.flatMap(p=>p.markets))].map(m=><Flag code={m} key={m}/>)}</strong></div><p>收录 Shark 官网及其他零售渠道可核实的型号，覆盖范围持续扩充。</p></section>
      <nav className="group-nav" aria-label="产品分组">{[latestLabel,"全部",...groupOrder].map(g=><button key={g} onClick={()=>{setOpenGroupId(null);setActive(g);}} aria-pressed={active===g} className={`${active===g?"selected":""} ${g===latestLabel?"latest-nav":""}`}>{g}<span>{g==="全部"?products.length:g===latestLabel?latest.length:products.filter(p=>CATEGORIES.find(c=>c.label===p.category)?.group===g).length}</span></button>)}</nav>
      {active===latestLabel&&<p className="latest-explainer">根据各市场 Shark 官方新闻与产品页核实，展示近 180 天内已上市的型号。公告发布日不等于上市日；延期或尚未核实上市日期的型号暂不列入。合集内保留每个 SKU 的日期来源。</p>}
      {active===latestLabel&&latest.length===0&&<div className="latest-empty">目前没有符合日期条件的产品。核实到新的上市日期后会在这里显示。</div>}
      <div className="catalog">{groups.map(({group,categories})=><section className="group" key={group}><div className="group-head"><span>{String(groupOrder.indexOf(group)+1).padStart(2,"0")}</span><h2>{group}</h2><div/></div>
        {categories.map(({label,items,collectionRows,collections,singles,inlineProducts})=><section className="category" key={label}><div className="category-head"><h3>{label}</h3><span>{String(items.length).padStart(2,"0")} PRODUCTS</span></div>
          {collections.length>0&&<div className="catalog-subsection"><div className="catalog-subhead">产品合集 <span>{collections.length}</span></div>
            <div className="collection-rows">{collectionRows.map((row,index)=>{
              const expanded=row.find(({group})=>group.id===openGroupId);
              return <div className="collection-row" key={index}>
                <div className="product-grid">{row.map(({group,products:members})=><div key={group.id} className={`stack-trigger ${openGroupId===group.id?"is-open":""}`} ref={node=>{
                  const button=node?.querySelector<HTMLButtonElement>(".stack-preview-face");
                  if(button)stackTriggers.current.set(group.id,button);else stackTriggers.current.delete(group.id);
                }}><StackPreview products={members} group={group} open={openGroupId===group.id} onOpen={()=>setOpenGroupId(group.id)}/></div>)}{index===collectionRows.length-1&&inlineProducts.map(p=><ProductCard key={p.id} product={p} globalKeys={globalKeys}/>)}</div>
                {expanded&&<PlatformStackInline key={expanded.group.id} products={expanded.products} group={expanded.group} globalKeys={globalKeys} onClose={closeGroup}/>}
              </div>;
            })}</div>
          </div>}
          {singles.length>0&&<div className="catalog-subsection"><div className="catalog-subhead">独立型号 <span>{singles.length}</span></div><div className="product-grid">{singles.map(p=><ProductCard key={p.id} product={p} globalKeys={globalKeys}/>)}</div></div>}
        </section>)}
      </section>)}</div>
      <footer><span>SHARK PRODUCT PORTFOLIO</span><p>参数来自对应型号的商品页，重量与续航受配置和测试条件影响；待核实表示尚无可靠数值。地球表示同系列在美、英、日均有销售记录，具体型号可能不同；ONLY 表示目前只确认一个国家。数据由 GitHub 定时核验，审核通过后自动构建并同步至 OSS。</p></footer>
    </main>
  </div></TooltipProvider>;
}
