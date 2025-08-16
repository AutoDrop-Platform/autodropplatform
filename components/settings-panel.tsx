"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AgentConfigPanel } from "@/components/agent-config-panel"
import { Settings, Save, X, Bot } from "lucide-react"

interface SettingsPanelProps {
  onClose: () => void
  language: "en" | "ar"
  onLanguageChange: (lang: "en" | "ar") => void
}

interface AgentConfig {
  id: string
  name: string
  nameAr: string
  status: "active" | "inactive" | "processing"
  apiProvider: string
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

export function SettingsPanel({ onClose, language, onLanguageChange }: SettingsPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [settings, setSettings] = useState({
    theme: "system",
    notifications: true,
    autoRefresh: true,
    refreshInterval: 30,
    apiKeys: {
      gemini: "",
      openai: "",
      anthropic: "",
    },
    dashboard: {
      compactMode: false,
      showMetrics: true,
      defaultView: "overview",
    },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [apiKeyStatus, setApiKeyStatus] = useState<{
    gemini: boolean
    openai: boolean
    anthropic: boolean
  }>({
    gemini: false,
    openai: false,
    anthropic: false,
  })

  const t = (en: string, ar: string) => (language === "ar" ? ar : en)

  const agents: AgentConfig[] = [
    {
      id: "customer-service",
      name: "Customer Service Agent",
      nameAr: "وكيل خدمة العملاء",
      status: "active",
      apiProvider: "gemini",
      model: "gemini-pro",
      maxTokens: 2000,
      temperature: 0.7,
      rateLimitPerMinute: 60,
      systemPrompt: "You are a helpful customer service agent for AutoDrop platform.",
      systemPromptAr: "أنت وكيل خدمة عملاء مفيد لمنصة AutoDrop.",
      autoStart: true,
      totalRequests: 1247,
      successRate: 0.987,
      averageResponseTime: 2300,
    },
    {
      id: "product-research",
      name: "Product Research Agent",
      nameAr: "وكيل أبحاث المنتجات",
      status: "processing",
      apiProvider: "openai",
      model: "gpt-4",
      maxTokens: 3000,
      temperature: 0.5,
      rateLimitPerMinute: 40,
      systemPrompt: "You are a product research specialist for dropshipping business.",
      systemPromptAr: "أنت متخصص في أبحاث المنتجات لأعمال الدروب شيبينغ.",
      autoStart: true,
      totalRequests: 892,
      successRate: 0.945,
      averageResponseTime: 4200,
    },
    {
      id: "order-management",
      name: "Order Management Agent",
      nameAr: "وكيل إدارة الطلبات",
      status: "active",
      apiProvider: "gemini",
      model: "gemini-pro",
      maxTokens: 1500,
      temperature: 0.3,
      rateLimitPerMinute: 80,
      systemPrompt: "You are an order management specialist for AutoDrop platform.",
      systemPromptAr: "أنت متخصص في إدارة الطلبات لمنصة AutoDrop.",
      autoStart: true,
      totalRequests: 2156,
      successRate: 0.992,
      averageResponseTime: 1800,
    },
    {
      id: "marketing",
      name: "Marketing Agent",
      nameAr: "وكيل التسويق",
      status: "active",
      apiProvider: "anthropic",
      model: "claude-3-sonnet",
      maxTokens: 2500,
      temperature: 0.8,
      rateLimitPerMinute: 50,
      systemPrompt: "You are a marketing content creator for e-commerce products.",
      systemPromptAr: "أنت منشئ محتوى تسويقي لمنتجات التجارة الإلكترونية.",
      autoStart: true,
      totalRequests: 634,
      successRate: 0.967,
      averageResponseTime: 3100,
    },
    {
      id: "analytics",
      name: "Analytics Agent",
      nameAr: "وكيل التحليلات",
      status: "active",
      apiProvider: "openai",
      model: "gpt-4",
      maxTokens: 2000,
      temperature: 0.2,
      rateLimitPerMinute: 30,
      systemPrompt: "You are a business intelligence analyst for AutoDrop platform.",
      systemPromptAr: "أنت محلل ذكاء أعمال لمنصة AutoDrop.",
      autoStart: true,
      totalRequests: 445,
      successRate: 0.978,
      averageResponseTime: 2800,
    },
  ]

  useEffect(() => {
    fetchAPIKeys()
  }, [])

  const fetchAPIKeys = async () => {
    try {
      const response = await fetch("/api/settings/api-keys")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setApiKeyStatus({
            gemini: !!data.apiKeys.gemini,
            openai: !!data.apiKeys.openai,
            anthropic: !!data.apiKeys.anthropic,
          })
        }
      }
    } catch (error) {
      console.error("[Settings] Error fetching API keys:", error)
    }
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      const apiKeysToSave: any = {}
      if (settings.apiKeys.gemini) apiKeysToSave.gemini = settings.apiKeys.gemini
      if (settings.apiKeys.openai) apiKeysToSave.openai = settings.apiKeys.openai
      if (settings.apiKeys.anthropic) apiKeysToSave.anthropic = settings.apiKeys.anthropic

      if (Object.keys(apiKeysToSave).length > 0) {
        const response = await fetch("/api/settings/api-keys", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ apiKeys: apiKeysToSave }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to save API keys")
        }

        console.log("[Settings] API keys saved successfully")
        await fetchAPIKeys()
      }

      const { apiKeys, ...otherSettings } = settings
      localStorage.setItem("autodrop-settings", JSON.stringify(otherSettings))
      console.log("[Settings] Settings saved:", otherSettings)

      alert(t("Settings saved successfully!", "تم حفظ الإعدادات بنجاح!"))
    } catch (error) {
      console.error("[Settings] Error saving settings:", error)
      alert(t("Error saving settings. Please try again.", "خطأ في حفظ الإعدادات. يرجى المحاولة مرة أخرى."))
    } finally {
      setIsLoading(false)
    }
  }

  const handleAgentConfig = (agentId: string) => {
    setSelectedAgent(agentId)
  }

  const handleAgentConfigSave = (config: Partial<AgentConfig>) => {
    console.log("[Settings] Agent config updated:", config)
    setSelectedAgent(null)
  }

  if (selectedAgent) {
    const agent = agents.find((a) => a.id === selectedAgent)
    if (agent) {
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <AgentConfigPanel
            agent={agent}
            onSave={handleAgentConfigSave}
            onClose={() => setSelectedAgent(null)}
            language={language}
          />
        </div>
      )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">{t("Dashboard Settings", "إعدادات لوحة التحكم")}</CardTitle>
                <CardDescription>
                  {t("Configure your AutoDrop AI dashboard", "تكوين لوحة تحكم AutoDrop الذكية")}
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">{t("General", "عام")}</TabsTrigger>
              <TabsTrigger value="agents">{t("AI Agents", "الوكلاء الذكيين")}</TabsTrigger>
              <TabsTrigger value="api-keys">{t("API Keys", "مفاتيح API")}</TabsTrigger>
              <TabsTrigger value="dashboard">{t("Dashboard", "لوحة التحكم")}</TabsTrigger>
              <TabsTrigger value="notifications">{t("Notifications", "الإشعارات")}</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">{t("Language", "اللغة")}</Label>
                  <Select value={language} onValueChange={(value: "en" | "ar") => onLanguageChange(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme">{t("Theme", "المظهر")}</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value) => setSettings((prev) => ({ ...prev, theme: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t("Light", "فاتح")}</SelectItem>
                      <SelectItem value="dark">{t("Dark", "داكن")}</SelectItem>
                      <SelectItem value="system">{t("System", "النظام")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("Auto Refresh", "التحديث التلقائي")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("Automatically refresh dashboard data", "تحديث بيانات لوحة التحكم تلقائياً")}
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoRefresh}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoRefresh: checked }))}
                  />
                </div>

                {settings.autoRefresh && (
                  <div className="space-y-2">
                    <Label htmlFor="refreshInterval">{t("Refresh Interval (seconds)", "فترة التحديث (ثواني)")}</Label>
                    <Select
                      value={settings.refreshInterval.toString()}
                      onValueChange={(value) =>
                        setSettings((prev) => ({ ...prev, refreshInterval: Number.parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 {t("seconds", "ثانية")}</SelectItem>
                        <SelectItem value="30">30 {t("seconds", "ثانية")}</SelectItem>
                        <SelectItem value="60">1 {t("minute", "دقيقة")}</SelectItem>
                        <SelectItem value="300">5 {t("minutes", "دقائق")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="agents" className="space-y-6">
              <div className="space-y-4">
                {agents.map((agent) => (
                  <Card key={agent.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bot className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-medium">{language === "ar" ? agent.nameAr : agent.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {agent.apiProvider} • {agent.model}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                            {t(
                              agent.status === "active"
                                ? "Active"
                                : agent.status === "processing"
                                  ? "Processing"
                                  : "Inactive",
                              agent.status === "active"
                                ? "نشط"
                                : agent.status === "processing"
                                  ? "قيد المعالجة"
                                  : "غير نشط",
                            )}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => handleAgentConfig(agent.id)}>
                            <Settings className="h-4 w-4 mr-2" />
                            {t("Configure", "تكوين")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="api-keys" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="gemini-key">{t("Google Gemini API Key", "مفتاح Google Gemini API")}</Label>
                    {apiKeyStatus.gemini && (
                      <Badge variant="secondary" className="text-xs">
                        {t("Configured", "مُكوّن")}
                      </Badge>
                    )}
                  </div>
                  <Input
                    id="gemini-key"
                    type="password"
                    placeholder={t("Enter your Gemini API key (AIza...)", "أدخل مفتاح Gemini API (AIza...)")}
                    value={settings.apiKeys.gemini}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        apiKeys: { ...prev.apiKeys, gemini: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="openai-key">{t("OpenAI API Key", "مفتاح OpenAI API")}</Label>
                    {apiKeyStatus.openai && (
                      <Badge variant="secondary" className="text-xs">
                        {t("Configured", "مُكوّن")}
                      </Badge>
                    )}
                  </div>
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder={t("Enter your OpenAI API key (sk-...)", "أدخل مفتاح OpenAI API (sk-...)")}
                    value={settings.apiKeys.openai}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        apiKeys: { ...prev.apiKeys, openai: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="anthropic-key">{t("Anthropic API Key", "مفتاح Anthropic API")}</Label>
                    {apiKeyStatus.anthropic && (
                      <Badge variant="secondary" className="text-xs">
                        {t("Configured", "مُكوّن")}
                      </Badge>
                    )}
                  </div>
                  <Input
                    id="anthropic-key"
                    type="password"
                    placeholder={t(
                      "Enter your Anthropic API key (sk-ant-...)",
                      "أدخل مفتاح Anthropic API (sk-ant-...)",
                    )}
                    value={settings.apiKeys.anthropic}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        apiKeys: { ...prev.apiKeys, anthropic: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">{t("API Key Information", "معلومات مفاتيح API")}</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      •{" "}
                      {t(
                        "API keys are stored securely and used by your AI agents",
                        "يتم تخزين مفاتيح API بأمان واستخدامها من قبل الوكلاء الذكيين",
                      )}
                    </li>
                    <li>
                      •{" "}
                      {t(
                        "You can get OpenAI keys from platform.openai.com",
                        "يمكنك الحصول على مفاتيح OpenAI من platform.openai.com",
                      )}
                    </li>
                    <li>
                      •{" "}
                      {t(
                        "Gemini keys are available at aistudio.google.com",
                        "مفاتيح Gemini متاحة في aistudio.google.com",
                      )}
                    </li>
                    <li>
                      •{" "}
                      {t(
                        "Anthropic keys can be obtained from console.anthropic.com",
                        "يمكن الحصول على مفاتيح Anthropic من console.anthropic.com",
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("Compact Mode", "الوضع المضغوط")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("Show more information in less space", "عرض المزيد من المعلومات في مساحة أقل")}
                    </p>
                  </div>
                  <Switch
                    checked={settings.dashboard.compactMode}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        dashboard: { ...prev.dashboard, compactMode: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("Show Metrics", "عرض المقاييس")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("Display performance metrics on agent cards", "عرض مقاييس الأداء على بطاقات الوكلاء")}
                    </p>
                  </div>
                  <Switch
                    checked={settings.dashboard.showMetrics}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        dashboard: { ...prev.dashboard, showMetrics: checked },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultView">{t("Default View", "العرض الافتراضي")}</Label>
                  <Select
                    value={settings.dashboard.defaultView}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        dashboard: { ...prev.dashboard, defaultView: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">{t("Overview", "نظرة عامة")}</SelectItem>
                      <SelectItem value="agents">{t("Agents", "الوكلاء")}</SelectItem>
                      <SelectItem value="analytics">{t("Analytics", "التحليلات")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("Enable Notifications", "تفعيل الإشعارات")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("Receive notifications for important events", "تلقي إشعارات للأحداث المهمة")}
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, notifications: checked }))}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              {t("Cancel", "إلغاء")}
            </Button>
            <Button onClick={handleSaveSettings} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? t("Saving...", "جاري الحفظ...") : t("Save Settings", "حفظ الإعدادات")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
