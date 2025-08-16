import { type NextRequest, NextResponse } from "next/server"
import { ProductionAgentManager } from "@/lib/production-agent-manager"

export async function POST(request: NextRequest) {
  try {
    const { contentType, product, language = "en", platform } = await request.json()

    if (!contentType || !product) {
      return NextResponse.json({ error: "Content type and product are required" }, { status: 400 })
    }

    const agentManager = ProductionAgentManager.getInstance()
    await agentManager.initialize()

    const agent = await agentManager.getAgent("marketing")
    if (!agent) {
      return NextResponse.json({ error: "Marketing agent not found" }, { status: 404 })
    }

    if (agent.status !== "active") {
      return NextResponse.json({ error: "Marketing agent is not active" }, { status: 503 })
    }

    // Generate content based on type
    let prompt = ""
    switch (contentType) {
      case "product-description":
        prompt = `Create a compelling product description for "${product}" that highlights key features, benefits, and includes a call-to-action. Make it SEO-friendly and conversion-focused.`
        break
      case "social-media":
        prompt = `Create an engaging social media post for "${product}" suitable for ${platform || "Instagram"}. Include relevant hashtags and emojis. Keep it concise and attention-grabbing.`
        break
      case "email":
        prompt = `Write an email campaign for "${product}" including subject line and body. Focus on benefits, create urgency, and include a clear call-to-action.`
        break
      case "ad-copy":
        prompt = `Create persuasive ad copy for "${product}" suitable for ${platform || "Facebook"} ads. Include headline, description, and call-to-action. Focus on benefits and create urgency.`
        break
      default:
        prompt = `Create marketing content for "${product}".`
    }

    const response = await agentManager.processMessage("marketing", prompt, "system", language)

    // Mock additional data
    const generatedContent = {
      content: response,
      contentType,
      product,
      language,
      platform,
      seoScore: Math.floor(Math.random() * 30) + 70,
      estimatedEngagement: Math.floor(Math.random() * 100) + 50,
      keywords: ["trending", "premium", "quality", product.toLowerCase()],
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(generatedContent)
  } catch (error) {
    console.error("Marketing content generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
