import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { content, language = "en" } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Mock SEO analysis
    const wordCount = content.split(" ").length
    const hasHeadings = content.includes("#") || content.includes("<h")
    const hasKeywords = content.toLowerCase().includes("premium") || content.toLowerCase().includes("quality")

    const seoAnalysis = {
      score: Math.floor(Math.random() * 30) + 70,
      wordCount,
      readability: Math.floor(Math.random() * 20) + 70,
      keywordDensity: Math.floor(Math.random() * 5) + 2,
      hasHeadings,
      hasKeywords,
      suggestions: [
        "Add more descriptive headings",
        "Include target keywords naturally",
        "Improve meta description",
        "Add internal links",
        "Optimize for mobile readability",
      ].slice(0, Math.floor(Math.random() * 3) + 2),
      keywords: ["premium", "quality", "best", "top", "professional"],
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(seoAnalysis)
  } catch (error) {
    console.error("SEO analysis error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
