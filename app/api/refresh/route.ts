import { NextRequest, NextResponse } from "next/server";
import { SCAN_SOURCES } from "@/lib/catalog";
import { backendUrl } from "@/lib/backend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) {
    return NextResponse.json({ error: "请求来源不匹配" }, { status: 403 });
  }
  let categoryIndex: number;
  try {
    categoryIndex = Number((await req.json() as { categoryIndex?: number }).categoryIndex);
  } catch {
    return NextResponse.json({ error: "无效的来源" }, { status: 400 });
  }
  if (!Number.isInteger(categoryIndex) || categoryIndex < 0 || categoryIndex >= SCAN_SOURCES.length) {
    return NextResponse.json({ error: "无效的来源" }, { status: 400 });
  }
  try {
    const response = await fetch(backendUrl("/api/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryIndex }),
      cache: "no-store",
      signal: AbortSignal.timeout(25000),
    });
    const data = await response.json();
    return NextResponse.json(data, {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "原站刷新服务暂不可用" }, { status: 502 });
  }
}
