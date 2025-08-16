import { NextResponse } from "next/server"
import { ProductionAgentManager } from "@/lib/production-agent-manager"

export async function GET() {
  try {
    const agentManager = ProductionAgentManager.getInstance()
    await agentManager.initialize()

    const agents = await agentManager.getAllAgents()
    return NextResponse.json(agents)
  } catch (error) {
    console.error("Get agents error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
