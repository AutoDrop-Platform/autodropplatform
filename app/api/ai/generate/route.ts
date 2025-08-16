import { type NextRequest, NextResponse } from "next/server"
import { AIProviderManager } from "@/lib/ai-providers"

export async function POST(request: NextRequest) {
  let declaredProvider = "gemini"
  let declaredModel = "gemini-pro"

  try {
    const body = await request.json()
    const {
      provider,
      model,
      prompt,
      systemPrompt,
      options = {},
    }: {
      provider: "gemini" | "openai" | "anthropic"
      model: string
      prompt: string
      systemPrompt?: string
      options?: {
        temperature?: number
        maxTokens?: number
        language?: "en" | "ar"
      }
    } = body

    declaredProvider = provider
    declaredModel = model

    if (!declaredProvider || !declaredModel || !prompt) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: provider, model, prompt",
        },
        { status: 400 },
      )
    }

    const response = await AIProviderManager.generateResponse(
      declaredProvider,
      declaredModel,
      prompt,
      systemPrompt,
      options,
    )

    return NextResponse.json({
      success: true,
      response,
    })
  } catch (error) {
    console.error("[AI Generate] Error:", error)

    // Return a helpful fallback response when API keys aren't configured
    if (error instanceof Error && error.message.includes("not configured")) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          fallback: {
            content:
              "I'm currently unable to process your request because the AI service isn't configured. Please configure the API keys in Settings > API Keys to enable AI functionality.",
            usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
            model: declaredModel,
            provider: declaredProvider,
          },
        },
        { status: 503 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate AI response",
      },
      { status: 500 },
    )
  }
}
