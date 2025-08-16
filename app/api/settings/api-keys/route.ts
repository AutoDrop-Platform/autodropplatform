import { type NextRequest, NextResponse } from "next/server"

interface APIKeys {
  gemini?: string
  openai?: string
  anthropic?: string
}

// In a real application, you would store these securely in a database
// For now, we'll use a simple in-memory store (this will reset on server restart)
let storedAPIKeys: APIKeys = {}

export async function GET() {
  try {
    // Return masked versions of the keys for security
    const maskedKeys = {
      gemini: storedAPIKeys.gemini ? `${storedAPIKeys.gemini.slice(0, 8)}...` : "",
      openai: storedAPIKeys.openai ? `${storedAPIKeys.openai.slice(0, 8)}...` : "",
      anthropic: storedAPIKeys.anthropic ? `${storedAPIKeys.anthropic.slice(0, 8)}...` : "",
    }

    return NextResponse.json({
      success: true,
      apiKeys: maskedKeys,
    })
  } catch (error) {
    console.error("[API Keys] Error fetching API keys:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch API keys",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKeys }: { apiKeys: APIKeys } = body

    // Validate API keys format (basic validation)
    if (apiKeys.gemini && !apiKeys.gemini.startsWith("AIza")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Gemini API key format",
        },
        { status: 400 },
      )
    }

    if (apiKeys.openai && !apiKeys.openai.startsWith("sk-")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid OpenAI API key format",
        },
        { status: 400 },
      )
    }

    if (apiKeys.anthropic && !apiKeys.anthropic.startsWith("sk-ant-")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Anthropic API key format",
        },
        { status: 400 },
      )
    }

    // Store the API keys (in production, encrypt these and store in database)
    storedAPIKeys = { ...storedAPIKeys, ...apiKeys }

    console.log("[API Keys] API keys updated successfully")

    return NextResponse.json({
      success: true,
      message: "API keys updated successfully",
    })
  } catch (error) {
    console.error("[API Keys] Error saving API keys:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save API keys",
      },
      { status: 500 },
    )
  }
}

// Export function to get stored API keys for use by AI providers
export function getStoredAPIKeys(): APIKeys {
  return storedAPIKeys
}
