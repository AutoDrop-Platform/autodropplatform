import { type NextRequest, NextResponse } from "next/server"
import { ProductionAgentManager } from "@/lib/production-agent-manager"

export async function POST(request: NextRequest) {
  try {
    const { orderId, action, language = "en" } = await request.json()

    if (!orderId || !action) {
      return NextResponse.json({ error: "Order ID and action are required" }, { status: 400 })
    }

    const agentManager = ProductionAgentManager.getInstance()
    await agentManager.initialize()

    const agent = await agentManager.getAgent("order-management")
    if (!agent) {
      return NextResponse.json({ error: "Order management agent not found" }, { status: 404 })
    }

    if (agent.status !== "active") {
      return NextResponse.json({ error: "Order management agent is not active" }, { status: 503 })
    }

    // Process the order action
    const actionPrompt = `Process order ${orderId} with action: ${action}. Provide status update and next steps.`
    const response = await agentManager.processMessage("order-management", actionPrompt, "system", language)

    // Mock processing results
    const processingResult = {
      orderId,
      action,
      status: "success",
      message: response,
      timestamp: new Date().toISOString(),
      nextSteps: [
        "Contact supplier for confirmation",
        "Update tracking information",
        "Notify customer of status change",
      ],
    }

    return NextResponse.json(processingResult)
  } catch (error) {
    console.error("Order processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
