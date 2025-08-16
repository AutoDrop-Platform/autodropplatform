export interface AgentConfig {
  id: string
  name: string
  nameAr: string
  status: "active" | "inactive" | "processing"
  apiProvider: "gemini" | "openai" | "anthropic"
  model: string
  maxTokens: number
  temperature: number
  rateLimitPerMinute: number
  systemPrompt: string
  systemPromptAr: string
  autoStart: boolean
  totalRequests: number
  successRate: number
  averageResponseTime: number
}
