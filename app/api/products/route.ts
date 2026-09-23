import { NextResponse } from "next/server";
import { STARTER_PRODUCTS } from "@/lib/catalog";
import { backendUrl } from "@/lib/backend";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(backendUrl("/api/products"), {
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as { products?: unknown[]; lastRefresh?: unknown };
    if (!Array.isArray(data.products)) throw new Error("来源数据格式有误");
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({
      products: STARTER_PRODUCTS,
      lastRefresh: null,
      warning: "原站数据暂不可用，目前显示仓库中的已核实快照",
    }, { headers: { "Cache-Control": "no-store" } });
  }
}
