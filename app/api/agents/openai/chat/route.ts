import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentName, model, messages, tools, temperature, structured_output, schema } = body

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    })

    const completionParams: any = {
      model: model || "gpt-4o-mini",
      messages,
      temperature: temperature || 0.7,
    }

    if (tools && tools.length > 0) {
      completionParams.tools = tools
    }

    if (structured_output && schema) {
      completionParams.response_format = {
        type: "json_schema",
        json_schema: {
          name: "structured_response",
          schema: schema,
        },
      }
    }

    console.log(`[OpenAI API] Processing request for agent: ${agentName}`)

    const completion = await openai.chat.completions.create(completionParams)

    const assistantMessage = completion.choices[0]?.message
    if (!assistantMessage) {
      return NextResponse.json({ error: "No response from OpenAI" }, { status: 500 })
    }

    const result: any = {
      content: assistantMessage.content || "No response generated",
    }

    if (structured_output && assistantMessage.content) {
      try {
        const parsed = JSON.parse(assistantMessage.content)
        result.structured_output = parsed
      } catch (error) {
        console.warn(`[OpenAI API] Failed to parse structured output for ${agentName}:`, error)
      }
    }

    if (assistantMessage.tool_calls) {
      result.tool_calls = assistantMessage.tool_calls
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[OpenAI API] Error:", error)
    return NextResponse.json({ error: "Failed to process OpenAI request" }, { status: 500 })
  }
}
