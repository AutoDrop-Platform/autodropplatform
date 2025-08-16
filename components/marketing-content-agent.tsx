"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Megaphone,
  Wand2,
  Copy,
  RefreshCw,
  Eye,
  ThumbsUp,
  Share2,
  Target,
  TrendingUp,
  FileText,
  Hash,
  Star,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

interface ContentTemplate {
  id: string
  type: "product-description" | "social-media" | "email" | "ad-copy" | "seo-content"
  title: string
  titleAr: string
  content: string
  contentAr: string
  seoScore: number
  engagement: number
  conversions: number
  createdAt: Date
  tags: string[]
  platform?: string
}

interface SEOAnalysis {
  score: number
  keywords: string[]
  suggestions: string[]
  readability: number
  wordCount: number
  headings: number
}

interface MarketingContentAgentProps {
  language: "en" | "ar"
  onLanguageChange: (lang: "en" | "ar") => void
}

export function MarketingContentAgent({ language, onLanguageChange }: MarketingContentAgentProps) {
  const [selectedContentType, setSelectedContentType] = useState("product-description")
  const [productInput, setProductInput] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const t = (en: string, ar: string) => (language === "ar" ? ar : en)

  // Mock data for demonstration
  const [contentTemplates, setContentTemplates] = useState<ContentTemplate[]>([
    {
      id: "template_001",
      type: "product-description",
      title: "Wireless Earbuds - Premium Description",
      titleAr: "سماعات لاسلكية - وصف مميز",
      content:
        "Experience crystal-clear audio with our premium wireless earbuds. Featuring advanced noise cancellation, 24-hour battery life, and IPX7 water resistance. Perfect for workouts, commutes, and everyday listening. Order now and enjoy free shipping!",
      contentAr:
        "استمتع بصوت نقي كالكريستال مع سماعاتنا اللاسلكية المميزة. تتميز بإلغاء الضوضاء المتقدم وبطارية تدوم 24 ساعة ومقاومة للماء IPX7. مثالية للتمارين والتنقل والاستماع اليومي. اطلب الآن واستمتع بالشحن المجاني!",
      seoScore: 85,
      engagement: 92,
      conversions: 78,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tags: ["electronics", "audio", "wireless", "premium"],
    },
    {
      id: "template_002",
      type: "social-media",
      title: "Instagram Post - Fitness Watch",
      titleAr: "منشور إنستغرام - ساعة اللياقة",
      content:
        "🔥 Transform your fitness journey! Our smart watch tracks everything - steps, heart rate, sleep, and more. Limited time offer: 40% OFF! #FitnessGoals #SmartWatch #HealthTech",
      contentAr:
        "🔥 حوّل رحلة لياقتك البدنية! ساعتنا الذكية تتتبع كل شيء - الخطوات ونبضات القلب والنوم والمزيد. عرض لفترة محدودة: خصم 40%! #أهداف_اللياقة #ساعة_ذكية #تقنية_الصحة",
      seoScore: 72,
      engagement: 156,
      conversions: 45,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tags: ["fitness", "social-media", "instagram", "promotion"],
      platform: "Instagram",
    },
    {
      id: "template_003",
      type: "email",
      title: "Welcome Email Campaign",
      titleAr: "حملة بريد إلكتروني ترحيبية",
      content:
        "Welcome to AutoDrop! 🎉 Thank you for joining our community. As a welcome gift, enjoy 15% off your first order with code WELCOME15. Discover our trending products and start your dropshipping journey today!",
      contentAr:
        "مرحباً بك في AutoDrop! 🎉 شكراً لانضمامك إلى مجتمعنا. كهدية ترحيب، استمتع بخصم 15% على طلبك الأول باستخدام الكود WELCOME15. اكتشف منتجاتنا الرائجة وابدأ رحلة الدروبشيبينغ اليوم!",
      seoScore: 68,
      engagement: 89,
      conversions: 123,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      tags: ["email", "welcome", "promotion", "onboarding"],
    },
    {
      id: "template_004",
      type: "ad-copy",
      title: "Facebook Ad - LED Lights",
      titleAr: "إعلان فيسبوك - أضواء LED",
      content:
        "Transform any space into a magical wonderland! ✨ Our RGB LED strip lights create the perfect ambiance for any occasion. Easy installation, app control, and millions of colors. Get yours now - 50% OFF today only!",
      contentAr:
        "حوّل أي مساحة إلى عالم سحري! ✨ أضواء LED الشريطية RGB تخلق الأجواء المثالية لأي مناسبة. تركيب سهل وتحكم بالتطبيق وملايين الألوان. احصل على أضوائك الآن - خصم 50% لليوم فقط!",
      seoScore: 79,
      engagement: 234,
      conversions: 89,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      tags: ["ad-copy", "facebook", "home-decor", "lighting"],
      platform: "Facebook",
    },
  ])

  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis>({
    score: 85,
    keywords: ["wireless earbuds", "bluetooth", "noise cancellation", "premium audio"],
    suggestions: [
      "Add more long-tail keywords",
      "Improve meta description",
      "Include customer testimonials",
      "Add technical specifications",
    ],
    readability: 78,
    wordCount: 156,
    headings: 3,
  })

  const generateContent = async () => {
    if (!productInput.trim()) return

    setIsGenerating(true)
    setGenerationProgress(0)

    // Simulate content generation progress
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          return 100
        }
        return prev + 20
      })
    }, 500)

    // Simulate API call to generate content
    await new Promise((resolve) => setTimeout(resolve, 2500))

    // Mock generated content based on type
    let content = ""
    let contentAr = ""

    switch (selectedContentType) {
      case "product-description":
        content = `Discover the amazing ${productInput}! This premium product offers exceptional quality and value. With advanced features and sleek design, it's perfect for modern consumers who demand the best. Order now and experience the difference!`
        contentAr = `اكتشف ${productInput} المذهل! يقدم هذا المنتج المميز جودة استثنائية وقيمة رائعة. بميزات متقدمة وتصميم أنيق، إنه مثالي للمستهلكين العصريين الذين يطالبون بالأفضل. اطلب الآن واختبر الفرق!`
        break
      case "social-media":
        content = `🔥 Check out this amazing ${productInput}! Perfect for your lifestyle. Limited time offer - don't miss out! #trending #lifestyle #deals`
        contentAr = `🔥 تحقق من هذا ${productInput} المذهل! مثالي لأسلوب حياتك. عرض لفترة محدودة - لا تفوت الفرصة! #رائج #أسلوب_الحياة #عروض`
        break
      case "email":
        content = `Subject: Exclusive ${productInput} Deal Just for You!\n\nHi there! We have something special for you. Our premium ${productInput} is now available with exclusive discounts. Don't wait - this offer won't last long!`
        contentAr = `الموضوع: عرض حصري على ${productInput} خاص بك فقط!\n\nمرحباً! لدينا شيء مميز لك. ${productInput} المميز متاح الآن بخصومات حصرية. لا تنتظر - هذا العرض لن يدوم طويلاً!`
        break
      case "ad-copy":
        content = `Transform your life with ${productInput}! ✨ Premium quality, unbeatable price. Order now and get FREE shipping! Limited stock available.`
        contentAr = `حوّل حياتك مع ${productInput}! ✨ جودة مميزة وسعر لا يُقاوم. اطلب الآن واحصل على شحن مجاني! مخزون محدود متاح.`
        break
      default:
        content = `High-quality ${productInput} with exceptional features and benefits.`
        contentAr = `${productInput} عالي الجودة بميزات وفوائد استثنائية.`
    }

    setGeneratedContent(language === "ar" ? contentAr : content)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const saveTemplate = () => {
    if (!generatedContent.trim()) return

    const newTemplate: ContentTemplate = {
      id: `template_${Date.now()}`,
      type: selectedContentType as ContentTemplate["type"],
      title: `Generated ${selectedContentType} - ${productInput}`,
      titleAr: `${selectedContentType} مُولد - ${productInput}`,
      content: generatedContent,
      contentAr: generatedContent,
      seoScore: Math.floor(Math.random() * 30) + 70,
      engagement: Math.floor(Math.random() * 100) + 50,
      conversions: Math.floor(Math.random() * 50) + 25,
      createdAt: new Date(),
      tags: [selectedContentType, "generated", "ai"],
    }

    setContentTemplates((prev) => [newTemplate, ...prev])
    setGeneratedContent("")
    setProductInput("")
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "product-description":
        return <FileText className="h-4 w-4" />
      case "social-media":
        return <Share2 className="h-4 w-4" />
      case "email":
        return <Megaphone className="h-4 w-4" />
      case "ad-copy":
        return <Target className="h-4 w-4" />
      case "seo-content":
        return <Hash className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 150) return "text-green-600"
    if (engagement >= 100) return "text-yellow-600"
    return "text-red-600"
  }

  const selectedTemplateData = contentTemplates.find((template) => template.id === selectedTemplate)

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Megaphone className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">{t("Marketing Content Agent", "وكيل المحتوى التسويقي")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("Creating compelling marketing content with AI", "إنشاء محتوى تسويقي مقنع بالذكاء الاصطناعي")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-purple-600">
            {t("Creative", "إبداعي")}
          </Badge>
        </div>
      </div>

      <div className="flex-1 p-6">
        <Tabs defaultValue="generator" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="generator">{t("Content Generator", "مولد المحتوى")}</TabsTrigger>
            <TabsTrigger value="templates">{t("Templates", "القوالب")}</TabsTrigger>
            <TabsTrigger value="seo">{t("SEO Analysis", "تحليل SEO")}</TabsTrigger>
            <TabsTrigger value="performance">{t("Performance", "الأداء")}</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-primary" />
                    {t("Content Generator", "مولد المحتوى")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("Content Type", "نوع المحتوى")}</label>
                    <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product-description">{t("Product Description", "وصف المنتج")}</SelectItem>
                        <SelectItem value="social-media">{t("Social Media Post", "منشور وسائل التواصل")}</SelectItem>
                        <SelectItem value="email">{t("Email Campaign", "حملة بريد إلكتروني")}</SelectItem>
                        <SelectItem value="ad-copy">{t("Ad Copy", "نسخة إعلانية")}</SelectItem>
                        <SelectItem value="seo-content">{t("SEO Content", "محتوى SEO")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("Product/Topic", "المنتج/الموضوع")}</label>
                    <Input
                      placeholder={t("Enter product name or topic...", "أدخل اسم المنتج أو الموضوع...")}
                      value={productInput}
                      onChange={(e) => setProductInput(e.target.value)}
                    />
                  </div>

                  <Button onClick={generateContent} disabled={isGenerating || !productInput.trim()} className="w-full">
                    <Wand2 className="h-4 w-4 mr-2" />
                    {isGenerating ? t("Generating...", "جاري التوليد...") : t("Generate Content", "توليد المحتوى")}
                  </Button>

                  {isGenerating && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{t("Generating content...", "جاري توليد المحتوى...")}</span>
                        <span>{generationProgress}%</span>
                      </div>
                      <Progress value={generationProgress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Output Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {t("Generated Content", "المحتوى المُولد")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder={t("Generated content will appear here...", "سيظهر المحتوى المُولد هنا...")}
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />

                  {generatedContent && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedContent)}>
                        <Copy className="h-4 w-4 mr-2" />
                        {t("Copy", "نسخ")}
                      </Button>
                      <Button variant="outline" size="sm" onClick={saveTemplate}>
                        <Star className="h-4 w-4 mr-2" />
                        {t("Save Template", "حفظ القالب")}
                      </Button>
                      <Button variant="outline" size="sm" onClick={generateContent}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {t("Regenerate", "إعادة التوليد")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Templates List */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contentTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedTemplate === template.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getContentTypeIcon(template.type)}
                              <Badge variant="outline" className="text-xs">
                                {t(
                                  template.type.replace("-", " "),
                                  template.type === "product-description"
                                    ? "وصف المنتج"
                                    : template.type === "social-media"
                                      ? "وسائل التواصل"
                                      : template.type === "email"
                                        ? "بريد إلكتروني"
                                        : template.type === "ad-copy"
                                          ? "نسخة إعلانية"
                                          : "محتوى SEO",
                                )}
                              </Badge>
                            </div>
                            {template.platform && (
                              <Badge variant="secondary" className="text-xs">
                                {template.platform}
                              </Badge>
                            )}
                          </div>

                          <div>
                            <h4 className="font-semibold text-sm line-clamp-2">
                              {language === "ar" ? template.titleAr : template.title}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-3 mt-1">
                              {language === "ar" ? template.contentAr : template.content}
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <p className="font-semibold">{template.seoScore}</p>
                              <p className="text-muted-foreground">{t("SEO", "SEO")}</p>
                            </div>
                            <div className="text-center">
                              <p className={`font-semibold ${getEngagementColor(template.engagement)}`}>
                                {template.engagement}
                              </p>
                              <p className="text-muted-foreground">{t("Engagement", "التفاعل")}</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold text-green-600">{template.conversions}</p>
                              <p className="text-muted-foreground">{t("Conversions", "التحويلات")}</p>
                            </div>
                          </div>

                          <div className="flex gap-1 flex-wrap">
                            {template.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Template Preview */}
              <div>
                {selectedTemplateData ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {language === "ar" ? selectedTemplateData.titleAr : selectedTemplateData.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">
                          {language === "ar" ? selectedTemplateData.contentAr : selectedTemplateData.content}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-2xl font-bold text-primary">{selectedTemplateData.seoScore}</p>
                          <p className="text-xs text-muted-foreground">{t("SEO Score", "نقاط SEO")}</p>
                        </div>
                        <div>
                          <p className={`text-2xl font-bold ${getEngagementColor(selectedTemplateData.engagement)}`}>
                            {selectedTemplateData.engagement}
                          </p>
                          <p className="text-xs text-muted-foreground">{t("Engagement", "التفاعل")}</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">{selectedTemplateData.conversions}</p>
                          <p className="text-xs text-muted-foreground">{t("Conversions", "التحويلات")}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              language === "ar" ? selectedTemplateData.contentAr : selectedTemplateData.content,
                            )
                          }
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          {t("Copy", "نسخ")}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          {t("Preview", "معاينة")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{t("Select a Template", "اختر قالباً")}</h3>
                      <p className="text-muted-foreground">
                        {t("Choose a template to view details and preview", "اختر قالباً لعرض التفاصيل والمعاينة")}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-primary" />
                    {t("SEO Analysis", "تحليل SEO")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t("Overall SEO Score", "نقاط SEO الإجمالية")}</span>
                      <span className="text-2xl font-bold text-primary">{seoAnalysis.score}/100</span>
                    </div>
                    <Progress value={seoAnalysis.score} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("Readability", "سهولة القراءة")}</p>
                      <p className="font-semibold">{seoAnalysis.readability}/100</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("Word Count", "عدد الكلمات")}</p>
                      <p className="font-semibold">{seoAnalysis.wordCount}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">{t("Target Keywords", "الكلمات المفتاحية المستهدفة")}</p>
                    <div className="flex gap-1 flex-wrap">
                      {seoAnalysis.keywords.map((keyword) => (
                        <Badge key={keyword} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {t("Improvement Suggestions", "اقتراحات التحسين")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {seoAnalysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                        <ThumbsUp className="h-4 w-4 text-blue-500 mt-0.5" />
                        <p className="text-sm">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("Content Performance", "أداء المحتوى")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">94</p>
                    <p className="text-sm text-muted-foreground">{t("Avg SEO Score", "متوسط نقاط SEO")}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">156</p>
                    <p className="text-sm text-muted-foreground">{t("Avg Engagement", "متوسط التفاعل")}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">78</p>
                    <p className="text-sm text-muted-foreground">{t("Avg Conversions", "متوسط التحويلات")}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("Top Performing Content", "المحتوى الأفضل أداءً")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">Social Media Posts</span>
                      <Badge className="bg-green-100 text-green-600">+23%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">Product Descriptions</span>
                      <Badge className="bg-blue-100 text-blue-600">+18%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">Email Campaigns</span>
                      <Badge className="bg-yellow-100 text-yellow-600">+12%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("Recent Activity", "النشاط الأخير")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>{t("Generated 5 product descriptions", "تم توليد 5 أوصاف منتجات")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>{t("Created 3 social media posts", "تم إنشاء 3 منشورات وسائل تواصل")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span>{t("Optimized 2 email campaigns", "تم تحسين 2 حملة بريد إلكتروني")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
