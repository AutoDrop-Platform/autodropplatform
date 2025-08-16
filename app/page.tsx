"use client"

import type React from "react"
import { CustomerServiceAgent } from "@/components/customer-service-agent"
import { ProductResearchAgent } from "@/components/product-research-agent"
import { OrderManagementAgent } from "@/components/order-management-agent"
import { MarketingContentAgent } from "@/components/marketing-content-agent"
import AnalyticsIntelligenceAgent from "@/components/analytics-intelligence-agent"
import { SettingsPanel } from "@/components/settings-panel"
import { MultiAgentDashboard } from "@/components/multi-agent-dashboard"
import { UserMenu } from "@/components/auth/user-menu"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Bot,
  MessageSquare,
  Activity,
  Users,
  ShoppingCart,
  TrendingUp,
  Globe,
  Settings,
  AlertCircle,
  Workflow,
} from "lucide-react"

interface AgentStatus {
  id: string
  name: string
  nameAr: string
  icon: React.ReactNode
  status: "active" | "inactive" | "processing"
  metrics: {
    label: string
    labelAr: string
    value: string
    trend?: "up" | "down" | "neutral"
  }[]
  description: string
  descriptionAr: string
}

export default function AutoDropDashboard() {
  const [language, setLanguage] = useState<"en" | "ar">("en")
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showMultiAgent, setShowMultiAgent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [businessMetrics, setBusinessMetrics] = useState({
    totalOrders: 0,
    revenueToday: 0,
    activeUsers: 0,
    dataAvailable: false,
  })
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      id: "customer-service",
      name: "Customer Service",
      nameAr: "خدمة العملاء",
      icon: <MessageSquare className="h-5 w-5" />,
      status: "inactive",
      metrics: [
        { label: "Tickets Resolved", labelAr: "التذاكر المحلولة", value: "0" },
        { label: "Response Time", labelAr: "وقت الاستجابة", value: "0min" },
      ],
      description: "Handle customer inquiries and support",
      descriptionAr: "التعامل مع استفسارات العملاء والدعم",
    },
    {
      id: "product-research",
      name: "Product Research",
      nameAr: "بحث المنتجات",
      icon: <TrendingUp className="h-5 w-5" />,
      status: "inactive",
      metrics: [
        { label: "Products Analyzed", labelAr: "المنتجات المحللة", value: "0" },
        { label: "Success Rate", labelAr: "معدل النجاح", value: "0%" },
      ],
      description: "Analyze trending products and market demand",
      descriptionAr: "تحليل المنتجات الرائجة وطلب السوق",
    },
    {
      id: "order-management",
      name: "Order Management",
      nameAr: "إدارة الطلبات",
      icon: <ShoppingCart className="h-5 w-5" />,
      status: "inactive",
      metrics: [
        { label: "Orders Processed", labelAr: "الطلبات المعالجة", value: "0" },
        { label: "Processing Time", labelAr: "وقت المعالجة", value: "0min" },
      ],
      description: "Automate order processing and tracking",
      descriptionAr: "أتمتة معالجة الطلبات وتتبعها",
    },
    {
      id: "marketing",
      name: "Marketing Content",
      nameAr: "المحتوى التسويقي",
      icon: <Bot className="h-5 w-5" />,
      status: "inactive",
      metrics: [
        { label: "Content Created", labelAr: "المحتوى المنشأ", value: "0" },
        { label: "Engagement Rate", labelAr: "معدل التفاعل", value: "0%" },
      ],
      description: "Generate marketing content and SEO",
      descriptionAr: "إنشاء المحتوى التسويقي وتحسين محركات البحث",
    },
    {
      id: "analytics",
      name: "Analytics Intelligence",
      nameAr: "ذكاء التحليلات",
      icon: <Activity className="h-5 w-5" />,
      status: "inactive",
      metrics: [
        { label: "Reports Generated", labelAr: "التقارير المنشأة", value: "0" },
        { label: "Insights Found", labelAr: "الرؤى المكتشفة", value: "0" },
      ],
      description: "Business intelligence and forecasting",
      descriptionAr: "ذكاء الأعمال والتنبؤ",
    },
  ])

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true)
        setError(null)

        const healthResponse = await fetch("/api/agents/health")

        if (!healthResponse.ok) {
          throw new Error("Agent health check failed")
        }

        const healthData = await healthResponse.json()
        console.log("[Dashboard] Agent health status:", healthData)

        if (healthData.agents && Array.isArray(healthData.agents)) {
          setAgents(healthData.agents)
        }

        try {
          const metricsResponse = await fetch("/api/business/metrics")
          if (metricsResponse.ok) {
            const metrics = await metricsResponse.json()
            setBusinessMetrics({
              totalOrders: metrics.totalOrders || 0,
              revenueToday: metrics.revenueToday || 0,
              activeUsers: metrics.activeUsers || 0,
              dataAvailable: true,
            })
          }
        } catch (metricsError) {
          console.log("[Dashboard] Business metrics not available - using defaults")
          setBusinessMetrics({
            totalOrders: 0,
            revenueToday: 0,
            activeUsers: 0,
            dataAvailable: false,
          })
        }

        setLoading(false)
      } catch (err) {
        console.error("[Dashboard] Error fetching agent data:", err)
        setError("Failed to connect to AI agents. Please check your configuration.")
        setLoading(false)
      }
    }

    fetchAgentData()

    const interval = setInterval(fetchAgentData, 30000)
    return () => clearInterval(interval)
  }, [])

  const toggleAgentStatus = async (agentId: string) => {
    try {
      if (!Array.isArray(agents)) {
        console.error("[Dashboard] Agents is not an array:", agents)
        return
      }

      const agent = agents.find((a) => a.id === agentId)
      const newStatus = agent?.status === "active" ? "inactive" : "active"

      const response = await fetch(`/api/agents/${agentId}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update agent status")
      }

      setAgents((prev) =>
        Array.isArray(prev)
          ? prev.map((agent) =>
              agent.id === agentId ? { ...agent, status: newStatus as "active" | "inactive" } : agent,
            )
          : prev,
      )
    } catch (err) {
      console.error("[Dashboard] Error updating agent status:", err)
      setError("Failed to update agent status")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "processing":
        return "bg-yellow-500"
      case "inactive":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const getTrendIcon = (trend?: string) => {
    if (trend === "up") return <TrendingUp className="h-3 w-3 text-green-500" />
    if (trend === "down") return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
    return null
  }

  const t = (en: string, ar: string) => (language === "ar" ? ar : en)

  const handleAgentChat = (agentId: string) => {
    if (agentId === "customer-service") {
      setSelectedAgent("customer-service")
    } else if (agentId === "product-research") {
      setSelectedAgent("product-research")
    } else if (agentId === "order-management") {
      setSelectedAgent("order-management")
    } else if (agentId === "marketing") {
      setSelectedAgent("marketing")
    } else if (agentId === "analytics") {
      setSelectedAgent("analytics")
    } else {
      console.log(`Opening chat for agent: ${agentId}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-medium">{t("Loading AI Agents...", "تحميل الوكلاء الذكيين...")}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium text-destructive mb-2">
            {t("Error Loading Dashboard", "خطأ في تحميل لوحة التحكم")}
          </p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>{t("Retry", "إعادة المحاولة")}</Button>
        </div>
      </div>
    )
  }

  if (selectedAgent === "customer-service") {
    return (
      <div className="h-screen">
        <CustomerServiceAgent language={language} onLanguageChange={setLanguage} />
      </div>
    )
  }

  if (selectedAgent === "product-research") {
    return (
      <div className="h-screen">
        <ProductResearchAgent language={language} onLanguageChange={setLanguage} />
      </div>
    )
  }

  if (selectedAgent === "order-management") {
    return (
      <div className="h-screen">
        <OrderManagementAgent language={language} onLanguageChange={setLanguage} />
      </div>
    )
  }

  if (selectedAgent === "marketing") {
    return (
      <div className="h-screen">
        <MarketingContentAgent language={language} onLanguageChange={setLanguage} />
      </div>
    )
  }

  if (selectedAgent === "analytics") {
    return (
      <div className="h-screen">
        <AnalyticsIntelligenceAgent language={language} onLanguageChange={setLanguage} />
      </div>
    )
  }

  if (showMultiAgent) {
    return (
      <div
        className={`min-h-screen bg-background ${language === "ar" ? "rtl" : "ltr"}`}
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => setShowMultiAgent(false)}>
                  ← {t("Back to Dashboard", "العودة إلى لوحة التحكم")}
                </Button>
                <div className="flex items-center gap-2">
                  <Workflow className="h-8 w-8 text-primary" />
                  <div>
                    <h1 className="text-2xl font-bold font-heading text-primary">
                      {t("Multi-Agent Workflows", "سير العمل متعدد الوكلاء")}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {t("Agent Collaboration & Automation", "تعاون الوكلاء والأتمتة")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <Button variant="outline" size="sm" onClick={() => setLanguage(language === "en" ? "ar" : "en")}>
                    {language === "en" ? "العربية" : "English"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-6 py-8">
          <MultiAgentDashboard />
        </main>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen bg-background ${language === "ar" ? "rtl" : "ltr"}`}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} language={language} onLanguageChange={setLanguage} />
      )}

      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Bot className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold font-heading text-primary">
                    {t("AutoDrop AI Dashboard", "لوحة تحكم AutoDrop الذكية")}
                  </h1>
                  <p className="text-sm text-muted-foreground">{t("Founder Command Center", "مركز قيادة المؤسس")}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setShowMultiAgent(true)}>
                <Workflow className="h-4 w-4 mr-2" />
                {t("Workflows", "سير العمل")}
              </Button>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <Button variant="outline" size="sm" onClick={() => setLanguage(language === "en" ? "ar" : "en")}>
                  {language === "en" ? "العربية" : "English"}
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4 mr-2" />
                {t("Settings", "الإعدادات")}
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("Active Agents", "الوكلاء النشطون")}</p>
                  <p className="text-3xl font-bold text-primary">
                    {Array.isArray(agents) ? agents.filter((a) => a.status === "active").length : 0}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("Total Orders", "إجمالي الطلبات")}</p>
                  <p className="text-3xl font-bold text-primary">
                    {businessMetrics.dataAvailable ? businessMetrics.totalOrders.toLocaleString() : "—"}
                  </p>
                  {!businessMetrics.dataAvailable && (
                    <p className="text-xs text-muted-foreground mt-1">{t("Connect your store", "اربط متجرك")}</p>
                  )}
                </div>
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("Revenue Today", "إيرادات اليوم")}</p>
                  <p className="text-3xl font-bold text-primary">
                    {businessMetrics.dataAvailable ? `$${businessMetrics.revenueToday.toLocaleString()}` : "—"}
                  </p>
                  {!businessMetrics.dataAvailable && (
                    <p className="text-xs text-muted-foreground mt-1">{t("Connect your store", "اربط متجرك")}</p>
                  )}
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("Active Users", "المستخدمون النشطون")}</p>
                  <p className="text-3xl font-bold text-primary">
                    {businessMetrics.dataAvailable ? businessMetrics.activeUsers.toLocaleString() : "—"}
                  </p>
                  {!businessMetrics.dataAvailable && (
                    <p className="text-xs text-muted-foreground mt-1">{t("Connect your store", "اربط متجرك")}</p>
                  )}
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.isArray(agents) &&
            agents.map((agent) => (
              <Card key={agent.id} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">{agent.icon}</div>
                      <div>
                        <CardTitle className="text-lg font-heading">
                          {language === "ar" ? agent.nameAr : agent.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {language === "ar" ? agent.descriptionAr : agent.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                      <Switch checked={agent.status === "active"} onCheckedChange={() => toggleAgentStatus(agent.id)} />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                      {t(
                        agent.status === "active"
                          ? "Active"
                          : agent.status === "processing"
                            ? "Processing"
                            : "Inactive",
                        agent.status === "active" ? "نشط" : agent.status === "processing" ? "قيد المعالجة" : "غير نشط",
                      )}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {agent.metrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {language === "ar" ? metric.labelAr : metric.label}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">{metric.value}</span>
                          {getTrendIcon(metric.trend)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Button
                      className="w-full bg-transparent"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAgentChat(agent.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {t("Chat with Agent", "محادثة مع الوكيل")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </main>
    </div>
  )
}
