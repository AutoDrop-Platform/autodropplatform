import { type NextRequest, NextResponse } from "next/server"
import { ProductionAgentManager } from "@/lib/production-agent-manager"

export async function POST(request: NextRequest) {
  try {
    const { query, category, language = "en" } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const agentManager = ProductionAgentManager.getInstance()
    await agentManager.initialize()

    const agent = await agentManager.getAgent("product-research")
    if (!agent) {
      return NextResponse.json({ error: "Product research agent not found" }, { status: 404 })
    }

    if (agent.status !== "active") {
      return NextResponse.json({ error: "Product research agent is not active" }, { status: 503 })
    }

    // Simulate product analysis
    const analysisPrompt = `Analyze the following product query for dropshipping potential: "${query}" in category: "${category}". Provide insights on market demand, competition, and profitability.`

    const response = await agentManager.processMessage("product-research", analysisPrompt, "system", language)

    // Mock analysis results
    const analysisResults = {
      query,
      category,
      demandScore: Math.floor(Math.random() * 40) + 60, // 60-100
      competitionLevel: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
      profitPotential: Math.floor(Math.random() * 30) + 40, // 40-70%
      trendDirection: ["rising", "stable", "falling"][Math.floor(Math.random() * 3)],
      recommendedAction: response,
      confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(analysisResults)
  } catch (error) {
    console.error("Product analysis error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
