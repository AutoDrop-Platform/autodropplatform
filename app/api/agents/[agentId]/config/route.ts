import { type NextRequest, NextResponse } from "next/server"
import { ProductionAgentManager } from "@/lib/production-agent-manager"

export async function GET(request: NextRequest, { params }: { params: { agentId: string } }) {
  try {
    const agentManager = ProductionAgentManager.getInstance()
    await agentManager.initialize()

    const agent = await agentManager.getAgent(params.agentId)
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json(agent)
  } catch (error) {
    console.error("Get agent config error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { agentId: string } }) {
  try {
    const config = await request.json()

    const agentManager = ProductionAgentManager.getInstance()
    await agentManager.initialize()

    const success = await agentManager.updateAgentConfig(params.agentId, config)
    if (!success) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    const updatedAgent = await agentManager.getAgent(params.agentId)
    return NextResponse.json(updatedAgent)
  } catch (error) {
    console.error("Update agent config error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
