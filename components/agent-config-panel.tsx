"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Save, RefreshCw, AlertTriangle } from "lucide-react"
import type { AgentConfig } from "@/lib/agent-types"

interface AgentConfigPanelProps {
  agent: AgentConfig
  onSave: (config: Partial<AgentConfig>) => void
  onClose: () => void
  language: "en" | "ar"
}

export function AgentConfigPanel({ agent, onSave, onClose, language }: AgentConfigPanelProps) {
  const [config, setConfig] = useState<AgentConfig>({ ...agent })
  const [hasChanges, setHasChanges] = useState(false)

  const t = (en: string, ar: string) => (language === "ar" ? ar : en)

  const handleConfigChange = (field: keyof AgentConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onSave(config)
    setHasChanges(false)
  }

  const handleReset = () => {
    setConfig({ ...agent })
    setHasChanges(false)
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-xl">{t("Agent Configuration", "إعدادات الوكيل")}</CardTitle>
              <CardDescription>{language === "ar" ? agent.nameAr : agent.name}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-orange-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {t("Unsaved Changes", "تغييرات غير محفوظة")}
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              {t("Close", "إغلاق")}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">{t("General", "عام")}</TabsTrigger>
            <TabsTrigger value="ai-settings">{t("AI Settings", "إعدادات الذكاء الاصطناعي")}</TabsTrigger>
            <TabsTrigger value="prompts">{t("Prompts", "التوجيهات")}</TabsTrigger>
            <TabsTrigger value="performance">{t("Performance", "الأداء")}</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("Agent Name (English)", "اسم الوكيل (الإنجليزية)")}</Label>
                <Input id="name" value={config.name} onChange={(e) => handleConfigChange("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">{t("Agent Name (Arabic)", "اسم الوكيل (العربية)")}</Label>
                <Input
                  id="nameAr"
                  value={config.nameAr}
                  onChange={(e) => handleConfigChange("nameAr", e.target.value)}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">{t("Status", "الحالة")}</Label>
                <Select value={config.status} onValueChange={(value) => handleConfigChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("Active", "نشط")}</SelectItem>
                    <SelectItem value="inactive">{t("Inactive", "غير نشط")}</SelectItem>
                    <SelectItem value="processing">{t("Processing", "قيد المعالجة")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoStart"
                  checked={config.autoStart}
                  onCheckedChange={(checked) => handleConfigChange("autoStart", checked)}
                />
                <Label htmlFor="autoStart">{t("Auto Start", "بدء تلقائي")}</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-settings" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apiProvider">{t("AI Provider", "مزود الذكاء الاصطناعي")}</Label>
                <Select value={config.apiProvider} onValueChange={(value) => handleConfigChange("apiProvider", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">{t("Model", "النموذج")}</Label>
                <Input id="model" value={config.model} onChange={(e) => handleConfigChange("model", e.target.value)} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxTokens">
                  {t("Max Tokens", "الحد الأقصى للرموز")}: {config.maxTokens}
                </Label>
                <Slider
                  id="maxTokens"
                  min={100}
                  max={4000}
                  step={100}
                  value={[config.maxTokens]}
                  onValueChange={([value]) => handleConfigChange("maxTokens", value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">
                  {t("Temperature", "درجة الحرارة")}: {config.temperature}
                </Label>
                <Slider
                  id="temperature"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[config.temperature]}
                  onValueChange={([value]) => handleConfigChange("temperature", value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rateLimitPerMinute">
                  {t("Rate Limit (per minute)", "حد المعدل (في الدقيقة)")}: {config.rateLimitPerMinute}
                </Label>
                <Slider
                  id="rateLimitPerMinute"
                  min={1}
                  max={100}
                  step={1}
                  value={[config.rateLimitPerMinute]}
                  onValueChange={([value]) => handleConfigChange("rateLimitPerMinute", value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prompts" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">{t("System Prompt (English)", "توجيه النظام (الإنجليزية)")}</Label>
                <Textarea
                  id="systemPrompt"
                  value={config.systemPrompt}
                  onChange={(e) => handleConfigChange("systemPrompt", e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemPromptAr">{t("System Prompt (Arabic)", "توجيه النظام (العربية)")}</Label>
                <Textarea
                  id="systemPromptAr"
                  value={config.systemPromptAr}
                  onChange={(e) => handleConfigChange("systemPromptAr", e.target.value)}
                  rows={6}
                  className="resize-none"
                  dir="rtl"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{config.totalRequests}</p>
                    <p className="text-sm text-muted-foreground">{t("Total Requests", "إجمالي الطلبات")}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{(config.successRate * 100).toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">{t("Success Rate", "معدل النجاح")}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{config.averageResponseTime.toFixed(0)}ms</p>
                    <p className="text-sm text-muted-foreground">{t("Avg Response Time", "متوسط وقت الاستجابة")}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("Reset", "إعادة تعيين")}
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            {t("Save Changes", "حفظ التغييرات")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
