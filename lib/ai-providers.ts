import { GoogleGenerativeAI } from "@google/generative-ai"
import OpenAI from "openai"
import Anthropic from "@anthropic-ai/sdk"
import { getStoredAPIKeys } from "@/app/api/settings/api-keys/route"

export interface AIResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model: string
  provider: string
}

export class AIProviderManager {
  private static _gemini: GoogleGenerativeAI | null = null
  private static _openai: OpenAI | null = null
  private static _anthropic: Anthropic | null = null

  private static getGeminiClient(): GoogleGenerativeAI {
    if (!this._gemini) {
      const storedKeys = getStoredAPIKeys()
      const apiKey = storedKeys.gemini || process.env.GEMINI_API_KEY
      if (!apiKey) {
        throw new Error(
          "GEMINI_API_KEY is not configured. Please add it in Settings > API Keys or set the GEMINI_API_KEY environment variable.",
        )
      }
      this._gemini = new GoogleGenerativeAI(apiKey)
    }
    return this._gemini
  }

  private static getOpenAIClient(): OpenAI {
    if (!this._openai) {
      const storedKeys = getStoredAPIKeys()
      const apiKey = storedKeys.openai || process.env.OPENAI_API_KEY
      if (!apiKey) {
        throw new Error(
          "OPENAI_API_KEY is not configured. Please add it in Settings > API Keys or set the OPENAI_API_KEY environment variable.",
        )
      }
      this._openai = new OpenAI({ apiKey })
    }
    return this._openai
  }

  private static getAnthropicClient(): Anthropic {
    if (!this._anthropic) {
      const storedKeys = getStoredAPIKeys()
      const apiKey = storedKeys.anthropic || process.env.ANTHROPIC_API_KEY
      if (!apiKey) {
        throw new Error(
          "ANTHROPIC_API_KEY is not configured. Please add it in Settings > API Keys or set the ANTHROPIC_API_KEY environment variable.",
        )
      }
      this._anthropic = new Anthropic({ apiKey })
    }
    return this._anthropic
  }

  static async generateResponse(
    provider: "gemini" | "openai" | "anthropic",
    model: string,
    prompt: string,
    systemPrompt?: string,
    options: {
      temperature?: number
      maxTokens?: number
      language?: "en" | "ar"
    } = {},
  ): Promise<AIResponse> {
    const { temperature = 0.7, maxTokens = 1000, language = "en" } = options

    try {
      switch (provider) {
        case "gemini":
          return await this.generateGeminiResponse(model, prompt, systemPrompt, {
            temperature,
            maxTokens,
            language,
          })

        case "openai":
          return await this.generateOpenAIResponse(model, prompt, systemPrompt, {
            temperature,
            maxTokens,
            language,
          })

        case "anthropic":
          return await this.generateAnthropicResponse(model, prompt, systemPrompt, {
            temperature,
            maxTokens,
            language,
          })

        default:
          throw new Error(`Unsupported AI provider: ${provider}`)
      }
    } catch (error) {
      console.error(`[AI Provider Error] ${provider}:`, error)
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private static async generateGeminiResponse(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options: any = {},
  ): Promise<AIResponse> {
    const gemini = this.getGeminiClient()
    const genAI = gemini.getGenerativeModel({
      model: model || "gemini-pro",
      generationConfig: {
        temperature: options.temperature,
        maxOutputTokens: options.maxTokens,
      },
    })

    const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}` : prompt

    // Add language instruction for Arabic support
    const languageInstruction =
      options.language === "ar"
        ? "\n\nPlease respond in Arabic (العربية)."
        : options.language === "both"
          ? "\n\nPlease provide response in both English and Arabic."
          : ""

    const result = await genAI.generateContent(fullPrompt + languageInstruction)
    const response = await result.response

    return {
      content: response.text(),
      usage: {
        prompt_tokens: 0, // Gemini doesn't provide token counts
        completion_tokens: 0,
        total_tokens: 0,
      },
      model: model || "gemini-pro",
      provider: "gemini",
    }
  }

  private static async generateOpenAIResponse(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options: any = {},
  ): Promise<AIResponse> {
    const messages: any[] = []

    if (systemPrompt) {
      let finalSystemPrompt = systemPrompt
      if (options.language === "ar") {
        finalSystemPrompt += "\n\nAlways respond in Arabic (العربية)."
      } else if (options.language === "both") {
        finalSystemPrompt += "\n\nProvide responses in both English and Arabic."
      }
      messages.push({ role: "system", content: finalSystemPrompt })
    }

    messages.push({ role: "user", content: prompt })

    const completion = await this.getOpenAIClient().chat.completions.create({
      model: model || "gpt-4",
      messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    })

    const choice = completion.choices[0]
    if (!choice?.message?.content) {
      throw new Error("No response generated from OpenAI")
    }

    return {
      content: choice.message.content,
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens || 0,
        completion_tokens: completion.usage?.completion_tokens || 0,
        total_tokens: completion.usage?.total_tokens || 0,
      },
      model: completion.model,
      provider: "openai",
    }
  }

  private static async generateAnthropicResponse(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options: any = {},
  ): Promise<AIResponse> {
    let finalSystemPrompt = systemPrompt || "You are a helpful AI assistant."

    if (options.language === "ar") {
      finalSystemPrompt += "\n\nAlways respond in Arabic (العربية)."
    } else if (options.language === "both") {
      finalSystemPrompt += "\n\nProvide responses in both English and Arabic."
    }

    const message = await this.getAnthropicClient().messages.create({
      model: model || "claude-3-sonnet-20240229",
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      system: finalSystemPrompt,
      messages: [{ role: "user", content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Anthropic")
    }

    return {
      content: content.text,
      usage: {
        prompt_tokens: message.usage.input_tokens,
        completion_tokens: message.usage.output_tokens,
        total_tokens: message.usage.input_tokens + message.usage.output_tokens,
      },
      model: message.model,
      provider: "anthropic",
    }
  }

  static resetClients(): void {
    this._gemini = null
    this._openai = null
    this._anthropic = null
  }
}
