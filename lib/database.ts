import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient> | null = null

try {
  if (supabaseUrl && supabaseKey && supabaseUrl.startsWith("http")) {
    supabase = createClient(supabaseUrl, supabaseKey)
  }
} catch (error) {
  console.error("[DatabaseManager] Failed to initialize Supabase client:", error)
  supabase = null
}

// Database schema types
export interface Agent {
  id: string
  name: string
  type: "customer-service" | "product-research" | "order-management" | "marketing" | "analytics"
  status: "active" | "inactive" | "maintenance"
  config: AgentConfig
  metrics: AgentMetrics
  created_at: string
  updated_at: string
}

export interface AgentConfig {
  model: string
  provider: "gemini" | "openai" | "anthropic"
  temperature: number
  max_tokens: number
  system_prompt: string
  language: "en" | "ar" | "both"
}

export interface AgentMetrics {
  total_requests: number
  successful_requests: number
  failed_requests: number
  avg_response_time: number
  uptime_percentage: number
  last_active: string
}

export interface ChatMessage {
  id: string
  agent_id: string
  user_id: string
  message: string
  response: string
  language: "en" | "ar"
  timestamp: string
  metadata?: Record<string, any>
}

export interface AgentTask {
  id: string
  agent_id: string
  type: string
  status: "pending" | "processing" | "completed" | "failed"
  input: Record<string, any>
  output?: Record<string, any>
  created_at: string
  completed_at?: string
}

// Mock data fallback for when Supabase is not configured
const getMockAgents = (): Agent[] => [
  {
    id: "customer-service",
    name: "Customer Service Agent",
    type: "customer-service",
    status: "active",
    config: {
      model: "gpt-4o-mini",
      provider: "openai",
      temperature: 0.7,
      max_tokens: 1000,
      system_prompt: "You are a helpful customer service agent for AutoDrop, a dropshipping platform.",
      language: "both",
    },
    metrics: {
      total_requests: 1247,
      successful_requests: 1198,
      failed_requests: 49,
      avg_response_time: 850,
      uptime_percentage: 99.2,
      last_active: new Date().toISOString(),
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "product-research",
    name: "Product Research Agent",
    type: "product-research",
    status: "active",
    config: {
      model: "gemini-pro",
      provider: "gemini",
      temperature: 0.8,
      max_tokens: 1500,
      system_prompt: "You are a product research specialist for dropshipping businesses.",
      language: "both",
    },
    metrics: {
      total_requests: 892,
      successful_requests: 876,
      failed_requests: 16,
      avg_response_time: 1200,
      uptime_percentage: 98.8,
      last_active: new Date().toISOString(),
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "order-management",
    name: "Order Management Agent",
    type: "order-management",
    status: "active",
    config: {
      model: "gpt-4o",
      provider: "openai",
      temperature: 0.5,
      max_tokens: 800,
      system_prompt: "You are an order management specialist for AutoDrop platform.",
      language: "both",
    },
    metrics: {
      total_requests: 2156,
      successful_requests: 2134,
      failed_requests: 22,
      avg_response_time: 650,
      uptime_percentage: 99.5,
      last_active: new Date().toISOString(),
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "marketing",
    name: "Marketing Content Agent",
    type: "marketing",
    status: "active",
    config: {
      model: "claude-3-sonnet",
      provider: "anthropic",
      temperature: 0.9,
      max_tokens: 2000,
      system_prompt: "You are a marketing content creator for dropshipping businesses.",
      language: "both",
    },
    metrics: {
      total_requests: 634,
      successful_requests: 621,
      failed_requests: 13,
      avg_response_time: 1400,
      uptime_percentage: 98.9,
      last_active: new Date().toISOString(),
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "analytics",
    name: "Analytics Intelligence Agent",
    type: "analytics",
    status: "active",
    config: {
      model: "gpt-4o",
      provider: "openai",
      temperature: 0.3,
      max_tokens: 1200,
      system_prompt: "You are a business analytics specialist for AutoDrop platform.",
      language: "both",
    },
    metrics: {
      total_requests: 445,
      successful_requests: 441,
      failed_requests: 4,
      avg_response_time: 950,
      uptime_percentage: 99.8,
      last_active: new Date().toISOString(),
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: new Date().toISOString(),
  },
]

// Database operations
export class DatabaseManager {
  private static isDatabaseAvailable(): boolean {
    return supabase !== null && !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }

  static async getAgents(): Promise<Agent[]> {
    if (!this.isDatabaseAvailable()) {
      console.warn("[DatabaseManager] Using mock data - Supabase not configured")
      return getMockAgents()
    }

    const { data, error } = await supabase!.from("agents").select("*").order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to fetch agents: ${error.message}`)
    return data || []
  }

  static async getAgent(id: string): Promise<Agent | null> {
    if (!this.isDatabaseAvailable()) {
      console.warn("[DatabaseManager] Using mock data - Supabase not configured")
      const mockAgents = getMockAgents()
      return mockAgents.find((agent) => agent.id === id) || null
    }

    const { data, error } = await supabase!.from("agents").select("*").eq("id", id).single()

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to fetch agent: ${error.message}`)
    }
    return data
  }

  static async updateAgentConfig(id: string, config: Partial<AgentConfig>): Promise<void> {
    if (!this.isDatabaseAvailable()) {
      console.warn("[DatabaseManager] Config update skipped - Supabase not configured")
      return
    }

    const { error } = await supabase
      .from("agents")
      .update({
        config,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw new Error(`Failed to update agent config: ${error.message}`)
  }

  static async updateAgentMetrics(id: string, metrics: Partial<AgentMetrics>): Promise<void> {
    if (!this.isDatabaseAvailable()) {
      console.warn("[DatabaseManager] Metrics update skipped - Supabase not configured")
      return
    }

    const { error } = await supabase
      .from("agents")
      .update({
        metrics,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw new Error(`Failed to update agent metrics: ${error.message}`)
  }

  static async saveChatMessage(message: Omit<ChatMessage, "id" | "timestamp">): Promise<string> {
    if (!this.isDatabaseAvailable()) {
      console.warn("[DatabaseManager] Chat message not saved - Supabase not configured")
      return `mock-${Date.now()}`
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        ...message,
        timestamp: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error) throw new Error(`Failed to save chat message: ${error.message}`)
    return data.id
  }

  static async getChatHistory(agentId: string, limit = 50): Promise<ChatMessage[]> {
    if (!this.isDatabaseAvailable()) {
      console.warn("[DatabaseManager] Using empty chat history - Supabase not configured")
      return []
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("agent_id", agentId)
      .order("timestamp", { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Failed to fetch chat history: ${error.message}`)
    return data || []
  }

  static async createTask(task: Omit<AgentTask, "id" | "created_at">): Promise<string> {
    if (!this.isDatabaseAvailable()) {
      console.warn("[DatabaseManager] Task not created - Supabase not configured")
      return `mock-task-${Date.now()}`
    }

    const { data, error } = await supabase
      .from("agent_tasks")
      .insert({
        ...task,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error) throw new Error(`Failed to create task: ${error.message}`)
    return data.id
  }

  static async updateTaskStatus(id: string, status: AgentTask["status"], output?: Record<string, any>): Promise<void> {
    if (!this.isDatabaseAvailable()) {
      console.warn("[DatabaseManager] Task status update skipped - Supabase not configured")
      return
    }

    const updateData: any = { status }
    if (output) updateData.output = output
    if (status === "completed" || status === "failed") {
      updateData.completed_at = new Date().toISOString()
    }

    const { error } = await supabase.from("agent_tasks").update(updateData).eq("id", id)

    if (error) throw new Error(`Failed to update task status: ${error.message}`)
  }
}
