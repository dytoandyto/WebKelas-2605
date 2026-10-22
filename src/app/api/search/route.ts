import { NextRequest, NextResponse } from "next/server";
import { getGlobalSearchData } from "@/lib/data";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Rate limit search requests (max 60 queries per minute per IP)
    const clientIp = getClientIp(req.headers);
    const rateLimit = checkRateLimit(`search:${clientIp}`, 60, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan pencarian. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const rawQuery = searchParams.get("q") || "";
    const query = rawQuery.trim().slice(0, 100);

    // Return empty results quickly for short queries without querying database
    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const results = await getGlobalSearchData(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Gagal memproses pencarian" },
      { status: 500 }
    );
  }
}
