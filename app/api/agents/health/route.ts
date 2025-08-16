import { NextResponse } from "next/server"
import { ProductionAgentManager } from "@/lib/production-agent-manager"

export async function GET() {
  try {
    const agentManager = ProductionAgentManager.getInstance()
    await agentManager.initialize()

    const healthStatus = await agentManager.healthCheck()

    return NextResponse.json({
      ...healthStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[Health Check Error]:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
