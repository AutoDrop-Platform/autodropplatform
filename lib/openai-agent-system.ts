import { z } from "zod"

const RoutingDecisionSchema = z.object({
  target_agent: z.enum(["customer-service", "product-research", "marketing", "order-management", "analytics"]),
  context: z.string(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  reasoning: z.string(),
})

const HandoffSchema = z.object({
  to_agent: z.string(),
  context: z.string(),
  data: z.record(z.any()),
  instructions: z.string().optional(),
})

export interface AgentHandoff {
  fromAgent: string
  toAgent: string
  context: string
  data: any
  instructions?: string
}

interface AgentConfig {
  name: string
  instructions: string
  model?: string
  tools?: any[]
  temperature?: number
  context?: Record<string, any>
}

interface AgentMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface AgentResponse {
  messages: AgentMessage[]
  handoffs?: AgentHandoff[]
  structured_output?: any
}

class CustomAgent {
  private config: AgentConfig
  private context: Record<string, any> = {}

  constructor(config: AgentConfig) {
    this.config = {
      model: "gpt-4o-mini",
      temperature: 0.7,
      ...config,
    }
    this.context = config.context || {}
  }

  setContext(key: string, value: any): void {
    this.context[key] = value
  }

  getContext(key: string): any {
    return this.context[key]
  }

  async run(params: {
    messages: AgentMessage[]
    structured_output?: z.ZodSchema
    force_handoff?: boolean
  }): Promise<AgentResponse> {
    try {
      const systemMessage = {
        role: "system" as const,
        content: this.buildSystemPrompt(),
      }

      const messages = [systemMessage, ...params.messages]

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "openai",
          model: this.config.model || "gpt-4o-mini",
          prompt: messages.map((m) => `${m.role}: ${m.content}`).join("\n"),
          systemPrompt: systemMessage.content,
          options: {
            temperature: this.config.temperature,
            maxTokens: 1000,
            language: "en",
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.fallback) {
          // Use fallback response when API keys aren't configured
          return {
            messages: [
              ...params.messages,
              {
                role: "assistant",
                content: errorData.fallback.content,
              },
            ],
          }
        }
        throw new Error(errorData.error || "AI generation failed")
      }

      const result = await response.json()
      const generatedContent = result.response.content

      const agentResponse: AgentResponse = {
        messages: [
          ...params.messages,
          {
            role: "assistant",
            content: generatedContent || "No response generated",
          },
        ],
      }

      if (generatedContent) {
        const handoffs = this.detectHandoffs(generatedContent)
        if (handoffs.length > 0) {
          agentResponse.handoffs = handoffs
        }
      }

      if (params.structured_output && result.structured_output) {
        agentResponse.structured_output = result.structured_output
      }

      return agentResponse
    } catch (error) {
      console.error(`[Agent ${this.config.name}] Error:`, error)
      return {
        messages: [
          ...params.messages,
          {
            role: "assistant",
            content: `I apologize, but I'm currently unable to process your request. Please try again later.`,
          },
        ],
      }
    }
  }

  private buildSystemPrompt(): string {
    let prompt = this.config.instructions

    if (Object.keys(this.context).length > 0) {
      prompt += `\n\nContext Information:\n${JSON.stringify(this.context, null, 2)}`
    }

    prompt += `\n\nHandoff Instructions:
    When you need to transfer to another agent, use this format:
    HANDOFF_TO: [agent-name]
    HANDOFF_CONTEXT: [context description]
    HANDOFF_DATA: [relevant data as JSON]
    HANDOFF_INSTRUCTIONS: [specific instructions for receiving agent]`

    return prompt
  }

  private detectHandoffs(content: string): AgentHandoff[] {
    const handoffs: AgentHandoff[] = []
    const handoffPattern =
      /HANDOFF_TO:\s*([^\n]+)\s*HANDOFF_CONTEXT:\s*([^\n]+)\s*HANDOFF_DATA:\s*([^\n]+)(?:\s*HANDOFF_INSTRUCTIONS:\s*([^\n]+))?/gi

    let match
    while ((match = handoffPattern.exec(content)) !== null) {
      try {
        const data = JSON.parse(match[3])
        handoffs.push({
          fromAgent: this.config.name,
          toAgent: match[1].trim(),
          context: match[2].trim(),
          data,
          instructions: match[4]?.trim(),
        })
      } catch (error) {
        console.warn(`[Agent ${this.config.name}] Failed to parse handoff data:`, error)
      }
    }

    return handoffs
  }
}

export class OpenAIAgentSystem {
  private static instance: OpenAIAgentSystem
  private agents: Map<string, CustomAgent> = new Map()
  private handoffHistory: AgentHandoff[] = []

  static getInstance(): OpenAIAgentSystem {
    if (!this.instance) {
      this.instance = new OpenAIAgentSystem()
    }
    return this.instance
  }

  async initializeAgents(): Promise<void> {
    try {
      const triageAgent = new CustomAgent({
        name: "Triage Agent",
        model: "gpt-4o-mini",
        temperature: 0.3,
        instructions: `You are an intelligent routing agent for AutoDrop, a dropshipping platform.

        Your primary responsibility is to analyze customer inquiries and route them to the most appropriate specialist agent.

        Available Agents:
        - customer-service: Order issues, returns, complaints, general support, account problems
        - product-research: Product questions, availability, specifications, market analysis, trending products
        - marketing: Content requests, promotional materials, SEO help, social media content
        - order-management: Order processing, shipping, fulfillment, supplier coordination
        - analytics: Business insights, reports, performance data, sales analysis

        Analysis Framework:
        1. Identify the primary intent and domain of the inquiry
        2. Assess urgency level based on keywords and context
        3. Consider language preferences (Arabic/English)
        4. Route to the most qualified specialist

        Always respond with structured routing decisions and clear reasoning.
        Support both Arabic and English languages seamlessly.`,
        tools: [
          {
            type: "function",
            function: {
              name: "route_inquiry",
              description: "Route customer inquiry to appropriate specialist agent",
              parameters: {
                type: "object",
                properties: {
                  target_agent: {
                    type: "string",
                    enum: ["customer-service", "product-research", "marketing", "order-management", "analytics"],
                    description: "The specialist agent to handle this inquiry",
                  },
                  context: {
                    type: "string",
                    description: "Summary and context for the receiving agent",
                  },
                  priority: {
                    type: "string",
                    enum: ["low", "medium", "high", "urgent"],
                    description: "Priority level based on urgency and impact",
                  },
                  reasoning: {
                    type: "string",
                    description: "Explanation of routing decision",
                  },
                  language: {
                    type: "string",
                    enum: ["en", "ar", "mixed"],
                    description: "Detected language preference",
                  },
                },
                required: ["target_agent", "context", "priority", "reasoning"],
              },
            },
          },
        ],
      })

      const customerServiceAgent = new CustomAgent({
        name: "Customer Service Agent",
        instructions: `You are a customer service specialist for AutoDrop with expertise in:
        - Order support and issue resolution
        - Returns and refunds processing
        - Account management and billing
        - General customer inquiries
        - Complaint handling and escalation

        Handoff Guidelines:
        - Complex order processing issues → order-management
        - Product information requests → product-research  
        - Marketing material requests → marketing
        - Business analytics requests → analytics

        Always provide empathetic, solution-focused support in the customer's preferred language.`,
        context: {
          department: "customer_service",
          capabilities: ["order_support", "returns", "billing", "general_inquiries"],
        },
      })

      const productResearchAgent = new CustomAgent({
        name: "Product Research Agent",
        instructions: `You are a product research specialist for AutoDrop with expertise in:
        - Product analysis and market research
        - Competitor pricing and positioning
        - Trend identification and demand forecasting
        - Supplier evaluation and sourcing
        - Product specification and feature analysis

        Handoff Guidelines:
        - Marketing content creation → marketing
        - Order processing for researched products → order-management
        - Customer inquiries about research → customer-service

        Provide data-driven insights and actionable recommendations.`,
        context: {
          department: "product_research",
          capabilities: ["market_analysis", "competitor_research", "trend_analysis", "sourcing"],
        },
      })

      const marketingAgent = new CustomAgent({
        name: "Marketing Agent",
        instructions: `You are a marketing specialist for AutoDrop with expertise in:
        - Content creation and copywriting
        - SEO optimization and keyword strategy
        - Social media content and campaigns
        - Product descriptions and promotional materials
        - Brand messaging and positioning

        Handoff Guidelines:
        - Product research for content → product-research
        - Customer inquiries about marketing → customer-service
        - Performance analytics → analytics

        Create compelling, conversion-focused content in both Arabic and English.`,
        context: {
          department: "marketing",
          capabilities: ["content_creation", "seo", "social_media", "copywriting"],
        },
      })

      const orderManagementAgent = new CustomAgent({
        name: "Order Management Agent",
        instructions: `You are an order management specialist for AutoDrop with expertise in:
        - Order processing and fulfillment
        - Shipping coordination and tracking
        - Supplier communication and management
        - Inventory management and stock monitoring
        - Payment processing and verification

        Handoff Guidelines:
        - Customer communication needs → customer-service
        - Product information requirements → product-research
        - Performance reporting → analytics

        Ensure efficient, accurate order processing and customer satisfaction.`,
        context: {
          department: "order_management",
          capabilities: ["order_processing", "shipping", "supplier_management", "inventory"],
        },
      })

      const analyticsAgent = new CustomAgent({
        name: "Analytics Agent",
        instructions: `You are a business analytics specialist for AutoDrop with expertise in:
        - Sales performance analysis and reporting
        - Customer behavior and segmentation analysis
        - Product performance and profitability metrics
        - Market trend analysis and forecasting
        - ROI and conversion optimization insights

        Handoff Guidelines:
        - Customer inquiries about reports → customer-service
        - Product performance deep-dives → product-research
        - Marketing campaign analysis → marketing

        Provide actionable insights with clear visualizations and recommendations.`,
        context: {
          department: "analytics",
          capabilities: ["sales_analysis", "customer_analytics", "performance_metrics", "forecasting"],
        },
      })

      this.agents.set("triage", triageAgent)
      this.agents.set("customer-service", customerServiceAgent)
      this.agents.set("product-research", productResearchAgent)
      this.agents.set("marketing", marketingAgent)
      this.agents.set("order-management", orderManagementAgent)
      this.agents.set("analytics", analyticsAgent)

      console.log("[OpenAI Agents] Initialized all agents with enhanced SDK patterns")
    } catch (error) {
      console.error("[OpenAI Agents] Failed to initialize agents:", error)
      throw error
    }
  }

  async routeInquiry(
    inquiry: string,
    language: "en" | "ar" = "en",
  ): Promise<{
    targetAgent: string
    context: string
    priority: string
    reasoning: string
    response: string
  }> {
    const triageAgent = this.agents.get("triage")
    if (!triageAgent) {
      throw new Error("Triage agent not initialized")
    }

    try {
      const response = await triageAgent.run({
        messages: [
          {
            role: "user",
            content: `Language Preference: ${language}\nCustomer Inquiry: ${inquiry}\n\nAnalyze this inquiry and provide routing decision with reasoning.`,
          },
        ],
        structured_output: RoutingDecisionSchema,
      })

      const routing = response.structured_output || this.parseRoutingDecision(response)

      return {
        targetAgent: routing.target_agent,
        context: routing.context,
        priority: routing.priority,
        reasoning: routing.reasoning || "Automated routing based on inquiry analysis",
        response: response.messages[response.messages.length - 1].content,
      }
    } catch (error) {
      console.error("[OpenAI Agents] Routing failed:", error)
      return {
        targetAgent: "customer-service",
        context: "Fallback routing due to triage error",
        priority: "medium",
        reasoning: "System fallback - routing to customer service for manual handling",
        response: "I'll connect you with our customer service team who can assist you.",
      }
    }
  }

  async executeHandoff(handoff: AgentHandoff): Promise<string> {
    const targetAgent = this.agents.get(handoff.toAgent)
    if (!targetAgent) {
      throw new Error(`Target agent ${handoff.toAgent} not found`)
    }

    try {
      // Set handoff context
      targetAgent.setContext("handoff_from", handoff.fromAgent)
      targetAgent.setContext("handoff_context", handoff.context)
      targetAgent.setContext("handoff_data", handoff.data)

      const systemContext = `HANDOFF RECEIVED from ${handoff.fromAgent}
      Context: ${handoff.context}
      ${handoff.instructions ? `Special Instructions: ${handoff.instructions}` : ""}
      
      Please process this handoff and provide appropriate assistance.`

      const response = await targetAgent.run({
        messages: [
          {
            role: "system",
            content: systemContext,
          },
          {
            role: "user",
            content: typeof handoff.data === "string" ? handoff.data : JSON.stringify(handoff.data),
          },
        ],
      })

      // Record successful handoff
      this.handoffHistory.push({
        ...handoff,
        context: `${handoff.context} - Completed at ${new Date().toISOString()}`,
      })

      // Check for additional handoffs in response
      if (response.handoffs && response.handoffs.length > 0) {
        console.log(`[OpenAI Agents] Detected ${response.handoffs.length} additional handoffs`)
        // Could implement chained handoffs here
      }

      return response.messages[response.messages.length - 1].content
    } catch (error) {
      console.error("[OpenAI Agents] Handoff execution failed:", error)
      throw error
    }
  }

  async createProductResearchToMarketingWorkflow(productQuery: string): Promise<string> {
    try {
      const productAgent = this.agents.get("product-research")
      if (!productAgent) throw new Error("Product research agent not available")

      const researchResponse = await productAgent.run({
        messages: [
          {
            role: "user",
            content: `Research products for: ${productQuery}. Prepare data for marketing content creation.`,
          },
        ],
      })

      const handoff: AgentHandoff = {
        fromAgent: "product-research",
        toAgent: "marketing",
        context: "Product research completed, need marketing content creation",
        data: {
          research_results: researchResponse.messages[researchResponse.messages.length - 1].content,
          content_types: ["product_descriptions", "social_media_posts", "seo_content"],
          languages: ["en", "ar"],
        },
      }

      const marketingResponse = await this.executeHandoff(handoff)

      return `Workflow completed:\n\n**Research Phase:**\n${researchResponse.messages[researchResponse.messages.length - 1].content}\n\n**Marketing Phase:**\n${marketingResponse}`
    } catch (error) {
      console.error("[OpenAI Agents] Workflow execution failed:", error)
      throw error
    }
  }

  async createOrderToCustomerServiceWorkflow(orderData: any): Promise<string> {
    try {
      const orderAgent = this.agents.get("order-management")
      if (!orderAgent) throw new Error("Order management agent not available")

      const orderResponse = await orderAgent.run({
        messages: [
          {
            role: "user",
            content: `Process order: ${JSON.stringify(orderData)}. Prepare customer communication.`,
          },
        ],
      })

      const handoff: AgentHandoff = {
        fromAgent: "order-management",
        toAgent: "customer-service",
        context: "Order processed, need customer notification and support setup",
        data: {
          order_status: "processed",
          customer_info: orderData.customer,
          order_details: orderData,
          communication_type: "order_confirmation",
        },
      }

      const customerServiceResponse = await this.executeHandoff(handoff)

      return `Order workflow completed:\n\n**Order Processing:**\n${orderResponse.messages[orderResponse.messages.length - 1].content}\n\n**Customer Communication:**\n${customerServiceResponse}`
    } catch (error) {
      console.error("[OpenAI Agents] Order workflow failed:", error)
      throw error
    }
  }

  private parseRoutingDecision(response: any): {
    target_agent: string
    context: string
    priority: string
    reasoning: string
  } {
    const lastMessage = response.messages[response.messages.length - 1]
    const content = lastMessage.content

    const targetMatch = content.match(/TARGET_AGENT:\s*([^\n]+)/i)
    const contextMatch = content.match(/CONTEXT:\s*([^\n]+)/i)
    const priorityMatch = content.match(/PRIORITY:\s*([^\n]+)/i)
    const reasoningMatch = content.match(/REASONING:\s*([^\n]+)/i)

    return {
      target_agent: targetMatch?.[1]?.trim() || "customer-service",
      context: contextMatch?.[1]?.trim() || "Default routing - content analysis needed",
      priority: priorityMatch?.[1]?.trim() || "medium",
      reasoning: reasoningMatch?.[1]?.trim() || "Automated routing based on content analysis",
    }
  }

  getHandoffHistory(): AgentHandoff[] {
    return this.handoffHistory
  }

  getAvailableAgents(): string[] {
    return Array.from(this.agents.keys())
  }
}
