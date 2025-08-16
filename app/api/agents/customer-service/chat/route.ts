import { ProductionAgentManager } from "@/lib/production-agent-manager"
import { MultiAgentSystem } from "@/lib/multi-agent-system"

export async function POST(request: Request) {
  try {
    const { message, language = "en", ticketId, context, useMultiAgent = false } = await request.json()

    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 })
    }

    const agentManager = ProductionAgentManager.getInstance()
    const multiAgentSystem = MultiAgentSystem.getInstance()

    // Prepare context for the agent
    const agentContext = {
      ticketId,
      customerInfo: context
        ? {
            name: context.customerName,
            orderId: context.orderId,
            category: context.category,
            priority: context.priority,
          }
        : null,
      language,
      useMultiAgent,
    }

    let response: string

    if (useMultiAgent) {
      // Use multi-agent system for enhanced responses
      try {
        const routingResult = await multiAgentSystem.routeCustomerInquiry(message, language)

        if (routingResult.routing.targetAgent === "customer-service") {
          // Handle directly
          response = await agentManager.processMessage("customer-service", message, "customer", language, agentContext)
        } else {
          // Provide handoff response
          response =
            language === "ar"
              ? `تم توجيه استفسارك إلى ${routingResult.routing.targetAgent}. ${routingResult.routing.context}`
              : `Your inquiry has been routed to ${routingResult.routing.targetAgent}. ${routingResult.routing.context}`
        }
      } catch (multiAgentError) {
        console.warn("[CustomerService API] Multi-agent routing failed, using direct response:", multiAgentError)
        response = await agentManager.processMessage("customer-service", message, "customer", language, agentContext)
      }
    } else {
      // Direct agent response
      response = await agentManager.processMessage("customer-service", message, "customer", language, agentContext)
    }

    return Response.json({
      response,
      agentId: "customer-service",
      timestamp: new Date().toISOString(),
      language,
      context: agentContext,
    })
  } catch (error) {
    console.error("[CustomerService API] Error:", error)
    return Response.json(
      {
        error: "Failed to process customer service request",
        fallback: "I apologize for the technical difficulty. How can I assist you today?",
      },
      { status: 500 },
    )
  }
}
