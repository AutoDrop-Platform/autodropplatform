import { type NextRequest, NextResponse } from "next/server"
import { ProductionAgentManager } from "@/lib/production-agent-manager"

export async function POST(request: NextRequest, { params }: { params: { agentId: string } }) {
  try {
    const { message, language = "en", userId = "anonymous" } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const agentManager = ProductionAgentManager.getInstance()
    await agentManager.initialize()

    const agent = await agentManager.getAgent(params.agentId)
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    if (agent.status !== "active") {
      return NextResponse.json({ error: "Agent is not active" }, { status: 503 })
    }

    const response = await agentManager.processMessage(params.agentId, message, userId, language)

    return NextResponse.json({
      response,
      agentId: params.agentId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[Agent Chat Error]:", error)

    if (error instanceof Error) {
      if (error.message.includes("Rate limit exceeded")) {
        return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
      }
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 })
      }
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
