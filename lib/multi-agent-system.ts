import { ProductionAgentManager } from "./production-agent-manager"
import { OpenAIAgentSystem } from "./openai-agent-system"

export interface WorkflowStep {
  id: string
  agentId: string
  action: string
  input: any
  dependencies: string[]
  status: "pending" | "running" | "completed" | "failed"
  output?: any
  error?: string
}

export interface AgentWorkflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  status: "draft" | "running" | "completed" | "failed" | "paused"
  createdAt: string
  completedAt?: string
  metadata: Record<string, any>
}

export interface AgentConversation {
  id: string
  participants: string[]
  topic: string
  messages: ConversationMessage[]
  status: "active" | "completed" | "archived"
  createdAt: string
}

export interface ConversationMessage {
  id: string
  agentId: string
  content: string
  timestamp: string
  metadata?: Record<string, any>
}

export class MultiAgentSystem {
  private static instance: MultiAgentSystem
  private workflows: Map<string, AgentWorkflow> = new Map()
  private conversations: Map<string, AgentConversation> = new Map()
  private agentManager: ProductionAgentManager
  private openaiAgentSystem: OpenAIAgentSystem

  static getInstance(): MultiAgentSystem {
    if (!this.instance) {
      this.instance = new MultiAgentSystem()
    }
    return this.instance
  }

  constructor() {
    this.agentManager = ProductionAgentManager.getInstance()
    this.openaiAgentSystem = OpenAIAgentSystem.getInstance()
    this.initializeOpenAIAgents()
  }

  private async initializeOpenAIAgents(): Promise<void> {
    try {
      await this.openaiAgentSystem.initializeAgents()
      console.log("[MultiAgent] OpenAI agents initialized successfully")
    } catch (error) {
      console.error("[MultiAgent] Failed to initialize OpenAI agents:", error)
    }
  }

  async startConversation(participants: string[], topic: string, initialMessage?: string): Promise<string> {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const conversation: AgentConversation = {
      id: conversationId,
      participants,
      topic,
      messages: [],
      status: "active",
      createdAt: new Date().toISOString(),
    }

    if (initialMessage) {
      conversation.messages.push({
        id: `msg_${Date.now()}`,
        agentId: "system",
        content: initialMessage,
        timestamp: new Date().toISOString(),
      })
    }

    this.conversations.set(conversationId, conversation)
    console.log(`[MultiAgent] Started conversation ${conversationId} with agents: ${participants.join(", ")}`)

    return conversationId
  }

  async addMessageToConversation(conversationId: string, agentId: string, message: string): Promise<void> {
    const conversation = this.conversations.get(conversationId)
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`)
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    conversation.messages.push({
      id: messageId,
      agentId,
      content: message,
      timestamp: new Date().toISOString(),
    })

    // Notify other participants
    await this.notifyConversationParticipants(conversationId, agentId, message)
  }

  private async notifyConversationParticipants(
    conversationId: string,
    senderAgentId: string,
    message: string,
  ): Promise<void> {
    const conversation = this.conversations.get(conversationId)
    if (!conversation) return

    const otherParticipants = conversation.participants.filter((id) => id !== senderAgentId)

    for (const agentId of otherParticipants) {
      try {
        const contextMessage = `In conversation "${conversation.topic}", ${senderAgentId} said: "${message}". Please respond if relevant to your expertise.`
        const response = await this.agentManager.processMessage(agentId, contextMessage, "system", "en")

        if (response && response.trim().length > 0) {
          await this.addMessageToConversation(conversationId, agentId, response)
        }
      } catch (error) {
        console.error(`[MultiAgent] Error notifying agent ${agentId}:`, error)
      }
    }
  }

  async createWorkflow(
    name: string,
    description: string,
    steps: Omit<WorkflowStep, "id" | "status">[],
  ): Promise<string> {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const workflow: AgentWorkflow = {
      id: workflowId,
      name,
      description,
      steps: steps.map((step, index) => ({
        ...step,
        id: `step_${index + 1}`,
        status: "pending",
      })),
      status: "draft",
      createdAt: new Date().toISOString(),
      metadata: {},
    }

    this.workflows.set(workflowId, workflow)
    console.log(`[MultiAgent] Created workflow: ${name}`)

    return workflowId
  }

  async executeWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    workflow.status = "running"
    console.log(`[MultiAgent] Starting workflow execution: ${workflow.name}`)

    try {
      await this.executeWorkflowSteps(workflow)
      workflow.status = "completed"
      workflow.completedAt = new Date().toISOString()
      console.log(`[MultiAgent] Workflow completed: ${workflow.name}`)
    } catch (error) {
      workflow.status = "failed"
      console.error(`[MultiAgent] Workflow failed: ${workflow.name}`, error)
      throw error
    }
  }

  private async executeWorkflowSteps(workflow: AgentWorkflow): Promise<void> {
    const completedSteps = new Set<string>()

    while (completedSteps.size < workflow.steps.length) {
      const readySteps = workflow.steps.filter(
        (step) => step.status === "pending" && step.dependencies.every((dep) => completedSteps.has(dep)),
      )

      if (readySteps.length === 0) {
        const pendingSteps = workflow.steps.filter((step) => step.status === "pending")
        if (pendingSteps.length > 0) {
          throw new Error("Workflow has circular dependencies or unresolvable dependencies")
        }
        break
      }

      // Execute ready steps in parallel
      await Promise.all(
        readySteps.map(async (step) => {
          try {
            step.status = "running"
            console.log(`[MultiAgent] Executing step: ${step.action} with agent ${step.agentId}`)

            const result = await this.executeWorkflowStep(step)
            step.output = result
            step.status = "completed"
            completedSteps.add(step.id)

            console.log(`[MultiAgent] Step completed: ${step.action}`)
          } catch (error) {
            step.status = "failed"
            step.error = error instanceof Error ? error.message : "Unknown error"
            console.error(`[MultiAgent] Step failed: ${step.action}`, error)
            throw error
          }
        }),
      )
    }
  }

  private async executeWorkflowStep(step: WorkflowStep): Promise<any> {
    const agent = await this.agentManager.getAgent(step.agentId)
    if (!agent) {
      throw new Error(`Agent ${step.agentId} not found`)
    }

    // Prepare input with context from previous steps
    const contextualInput = this.prepareStepInput(step)

    // Execute the step using the agent
    const response = await this.agentManager.processMessage(
      step.agentId,
      `Execute action: ${step.action}\nInput: ${JSON.stringify(contextualInput)}`,
      "workflow_system",
      "en",
    )

    return {
      action: step.action,
      response,
      timestamp: new Date().toISOString(),
    }
  }

  private prepareStepInput(step: WorkflowStep): any {
    const workflow = Array.from(this.workflows.values()).find((w) => w.steps.some((s) => s.id === step.id))

    if (!workflow) return step.input

    // Gather outputs from dependency steps
    const dependencyOutputs: Record<string, any> = {}
    step.dependencies.forEach((depId) => {
      const depStep = workflow.steps.find((s) => s.id === depId)
      if (depStep && depStep.output) {
        dependencyOutputs[depId] = depStep.output
      }
    })

    return {
      ...step.input,
      dependencies: dependencyOutputs,
    }
  }

  async createDropshippingWorkflows(): Promise<string[]> {
    const workflowIds: string[] = []

    const productResearchWorkflow = await this.createWorkflow(
      "AI Product Research & Marketing Pipeline",
      "Intelligent product research with automatic marketing content generation",
      [
        {
          agentId: "customer-service",
          action: "route_product_research",
          input: { query: "trending electronics", priority: "high" },
          dependencies: [],
        },
        {
          agentId: "product-research",
          action: "analyze_trending_products",
          input: { category: "electronics", limit: 5, handoff_ready: true },
          dependencies: ["step_1"],
        },
        {
          agentId: "marketing",
          action: "create_content_from_handoff",
          input: { style: "compelling", languages: ["en", "ar"] },
          dependencies: ["step_2"],
        },
      ],
    )
    workflowIds.push(productResearchWorkflow)

    const orderProcessingWorkflow = await this.createWorkflow(
      "Smart Order Processing & Customer Communication",
      "Automated order processing with intelligent customer service handoffs",
      [
        {
          agentId: "customer-service",
          action: "route_order_inquiry",
          input: { order_type: "new_order" },
          dependencies: [],
        },
        {
          agentId: "order-management",
          action: "process_order_with_handoff",
          input: { auto_confirm: true, prepare_customer_comm: true },
          dependencies: ["step_1"],
        },
        {
          agentId: "customer-service",
          action: "handle_order_communication",
          input: { include_tracking: true, language: "auto_detect" },
          dependencies: ["step_2"],
        },
      ],
    )
    workflowIds.push(orderProcessingWorkflow)

    return workflowIds
  }

  // Getters for dashboard
  getWorkflows(): AgentWorkflow[] {
    return Array.from(this.workflows.values())
  }

  getConversations(): AgentConversation[] {
    return Array.from(this.conversations.values())
  }

  getWorkflow(id: string): AgentWorkflow | undefined {
    return this.workflows.get(id)
  }

  getConversation(id: string): AgentConversation | undefined {
    return this.conversations.get(id)
  }

  // Intelligent inquiry routing
  async routeCustomerInquiry(
    inquiry: string,
    language: "en" | "ar" = "en",
  ): Promise<{
    conversationId: string
    routing: any
  }> {
    try {
      const routing = await this.openaiAgentSystem.routeInquiry(inquiry, language)

      // Start a conversation with the routed agent
      const conversationId = await this.startConversation(
        ["customer-service", routing.targetAgent],
        `Customer Inquiry - ${routing.priority} priority`,
        `Routed to ${routing.targetAgent}: ${routing.context}`,
      )

      return { conversationId, routing }
    } catch (error) {
      console.error("[MultiAgent] Inquiry routing failed:", error)
      throw error
    }
  }

  // Automated workflow methods
  async executeProductResearchToMarketing(productQuery: string): Promise<string> {
    return await this.openaiAgentSystem.createProductResearchToMarketingWorkflow(productQuery)
  }

  async executeOrderToCustomerService(orderData: any): Promise<string> {
    return await this.openaiAgentSystem.createOrderToCustomerServiceWorkflow(orderData)
  }
}
