import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock trending products data
    const trendingProducts = [
      {
        id: "trend_001",
        keyword: "wireless earbuds",
        keywordAr: "سماعات لاسلكية",
        searchVolume: 45000,
        competition: "medium",
        trend: "rising",
        growth: 23.5,
        categories: ["Electronics", "Audio"],
      },
      {
        id: "trend_002",
        keyword: "smart watch",
        keywordAr: "ساعة ذكية",
        searchVolume: 38000,
        competition: "high",
        trend: "rising",
        growth: 18.2,
        categories: ["Electronics", "Fitness"],
      },
      {
        id: "trend_003",
        keyword: "led lights",
        keywordAr: "أضواء LED",
        searchVolume: 52000,
        competition: "low",
        trend: "stable",
        growth: 2.1,
        categories: ["Home & Garden", "Lighting"],
      },
    ]

    return NextResponse.json(trendingProducts)
  } catch (error) {
    console.error("Get trends error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
