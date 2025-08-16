import { DatabaseManager, type Agent, type AgentConfig, type AgentMetrics } from "./database"

export class ProductionAgentManager {
  private static instance: ProductionAgentManager
  private agents: Map<string, Agent> = new Map()
  private rateLimiter: Map<string, number[]> = new Map()
  private initTime: number = Date.now()

  static getInstance(): ProductionAgentManager {
    if (!this.instance) {
      this.instance = new ProductionAgentManager()
    }
    return this.instance
  }

  async initialize(): Promise<void> {
    try {
      const agents = await DatabaseManager.getAgents()
      agents.forEach((agent) => {
        this.agents.set(agent.id, agent)
      })
      console.log(`[ProductionAgentManager] Initialized with ${agents.length} agents`)
    } catch (error) {
      console.error("[ProductionAgentManager] Initialization failed:", error)
      throw error
    }
  }

  async processMessage(
    agentId: string,
    message: string,
    userId: string,
    language: "en" | "ar" = "en",
  ): Promise<string> {
    const startTime = Date.now()

    try {
      // Rate limiting check
      if (!this.checkRateLimit(agentId)) {
        throw new Error("Rate limit exceeded. Please try again later.")
      }

      // Get agent configuration
      const agent = await this.getAgent(agentId)
      if (!agent) {
        throw new Error(`Agent ${agentId} not found`)
      }

      if (agent.status !== "active") {
        throw new Error(`Agent ${agentId} is currently ${agent.status}`)
      }

      // Input validation and sanitization
      const sanitizedMessage = this.sanitizeInput(message)
      if (!sanitizedMessage.trim()) {
        throw new Error("Message cannot be empty")
      }

      const aiResponse = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: agent.config.provider,
          model: agent.config.model,
          prompt: sanitizedMessage,
          systemPrompt: agent.config.system_prompt,
          options: {
            temperature: agent.config.temperature,
            maxTokens: agent.config.max_tokens,
            language: language,
          },
        }),
      })

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json()
        if (errorData.fallback) {
          // Use fallback response when API keys aren't configured
          const fallbackContent = errorData.fallback.content

          // Save fallback message to database
          await DatabaseManager.saveChatMessage({
            agent_id: agentId,
            user_id: userId,
            message: sanitizedMessage,
            response: fallbackContent,
            language,
            metadata: {
              model: errorData.fallback.model,
              provider: errorData.fallback.provider,
              usage: errorData.fallback.usage,
              response_time: Date.now() - startTime,
              fallback: true,
            },
          })

          return fallbackContent
        }
        throw new Error(errorData.error || "AI generation failed")
      }

      const result = await aiResponse.json()
      const generatedResponse = result.response

      // Save chat message to database
      await DatabaseManager.saveChatMessage({
        agent_id: agentId,
        user_id: userId,
        message: sanitizedMessage,
        response: generatedResponse.content,
        language,
        metadata: {
          model: generatedResponse.model,
          provider: generatedResponse.provider,
          usage: generatedResponse.usage,
          response_time: Date.now() - startTime,
        },
      })

      // Update agent metrics
      await this.updateAgentMetrics(agentId, {
        successful_requests: agent.metrics.successful_requests + 1,
        total_requests: agent.metrics.total_requests + 1,
        avg_response_time: this.calculateAverageResponseTime(
          agent.metrics.avg_response_time,
          Date.now() - startTime,
          agent.metrics.total_requests,
        ),
        last_active: new Date().toISOString(),
      })

      return generatedResponse.content
    } catch (error) {
      console.error(`[ProductionAgentManager] Error processing message for agent ${agentId}:`, error)

      // Update failed request metrics
      const agent = this.agents.get(agentId)
      if (agent) {
        await this.updateAgentMetrics(agentId, {
          failed_requests: agent.metrics.failed_requests + 1,
          total_requests: agent.metrics.total_requests + 1,
        })
      }

      throw error
    }
  }

  private checkRateLimit(agentId: string): boolean {
    const now = Date.now()
    const windowMs = 60 * 1000 // 1 minute
    const maxRequests = 30 // 30 requests per minute

    if (!this.rateLimiter.has(agentId)) {
      this.rateLimiter.set(agentId, [])
    }

    const requests = this.rateLimiter.get(agentId)!
    const validRequests = requests.filter((time) => now - time < windowMs)

    if (validRequests.length >= maxRequests) {
      return false
    }

    validRequests.push(now)
    this.rateLimiter.set(agentId, validRequests)
    return true
  }

  private sanitizeInput(input: string): string {
    // Remove potentially harmful content
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<[^>]*>/g, "")
      .trim()
      .substring(0, 4000) // Limit input length
  }

  private calculateAverageResponseTime(currentAvg: number, newTime: number, totalRequests: number): number {
    return Math.round((currentAvg * (totalRequests - 1) + newTime) / totalRequests)
  }

  async getAgent(agentId: string): Promise<Agent | null> {
    if (this.agents.has(agentId)) {
      return this.agents.get(agentId)!
    }

    const agent = await DatabaseManager.getAgent(agentId)
    if (agent) {
      this.agents.set(agentId, agent)
    }
    return agent
  }

  async updateAgentConfig(agentId: string, config: Partial<AgentConfig>): Promise<void> {
    await DatabaseManager.updateAgentConfig(agentId, config)

    // Update local cache
    const agent = this.agents.get(agentId)
    if (agent) {
      agent.config = { ...agent.config, ...config }
      this.agents.set(agentId, agent)
    }
  }

  private async updateAgentMetrics(agentId: string, metrics: Partial<AgentMetrics>): Promise<void> {
    await DatabaseManager.updateAgentMetrics(agentId, metrics)

    // Update local cache
    const agent = this.agents.get(agentId)
    if (agent) {
      agent.metrics = { ...agent.metrics, ...metrics }
      this.agents.set(agentId, agent)
    }
  }

  async getAgentMetrics(agentId: string): Promise<AgentMetrics | null> {
    const agent = await this.getAgent(agentId)
    return agent?.metrics || null
  }

  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values())
  }

  async healthCheck(): Promise<{ status: string; agents: number; uptime: number }> {
    const agents = await this.getAllAgents()
    const activeAgents = agents.filter((agent) => agent.status === "active")

    const uptime =
      typeof process !== "undefined" && typeof process.uptime === "function"
        ? process.uptime()
        : Math.floor((Date.now() - this.initTime) / 1000)

    return {
      status: "healthy",
      agents: activeAgents.length,
      uptime: uptime,
    }
  }
}
