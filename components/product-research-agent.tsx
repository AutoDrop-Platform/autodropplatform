"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  TrendingUp,
  TrendingDown,
  Star,
  Package,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  id: string
  title: string
  titleAr: string
  category: string
  categoryAr: string
  price: number
  originalPrice: number
  currency: string
  rating: number
  reviewCount: number
  orders: number
  supplier: "aliexpress" | "cj" | "other"
  imageUrl: string
  trend: "rising" | "falling" | "stable"
  trendPercentage: number
  profitMargin: number
  competitorCount: number
  demandScore: number
  riskLevel: "low" | "medium" | "high"
  lastUpdated: Date
  tags: string[]
}

interface MarketTrend {
  category: string
  categoryAr: string
  growth: number
  volume: number
  competition: "low" | "medium" | "high"
  opportunity: number
}

interface ProductResearchAgentProps {
  language: "en" | "ar"
  onLanguageChange: (lang: "en" | "ar") => void
}

export function ProductResearchAgent({ language, onLanguageChange }: ProductResearchAgentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("demand")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  const t = (en: string, ar: string) => (language === "ar" ? ar : en)

  // Production-ready state for products
  const [products, setProducts] = useState<Product[]>([])

  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([
    {
      category: "Electronics",
      categoryAr: "إلكترونيات",
      growth: 15.2,
      volume: 45000,
      competition: "high",
      opportunity: 78,
    },
    {
      category: "Fitness",
      categoryAr: "لياقة بدنية",
      growth: 22.8,
      volume: 28000,
      competition: "medium",
      opportunity: 85,
    },
    {
      category: "Home & Garden",
      categoryAr: "المنزل والحديقة",
      growth: 8.5,
      volume: 67000,
      competition: "high",
      opportunity: 62,
    },
    {
      category: "Fashion",
      categoryAr: "أزياء",
      growth: 12.3,
      volume: 89000,
      competition: "high",
      opportunity: 55,
    },
  ])

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.titleAr.includes(searchQuery) ||
      product.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || product.category.toLowerCase() === selectedCategory

    return matchesSearch && matchesCategory
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "demand":
        return b.demandScore - a.demandScore
      case "profit":
        return b.profitMargin - a.profitMargin
      case "trend":
        return b.trendPercentage - a.trendPercentage
      case "orders":
        return b.orders - a.orders
      default:
        return 0
    }
  })

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    // Simulate analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsAnalyzing(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const getTrendIcon = (trend: string, percentage: number) => {
    if (trend === "rising") return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend === "falling") return <TrendingDown className="h-4 w-4 text-red-500" />
    return <div className="h-4 w-4 rounded-full bg-gray-400" />
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600 bg-green-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "high":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case "low":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "high":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Search className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">{t("Product Research Agent", "وكيل أبحاث المنتجات")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("Analyzing market trends and product opportunities", "تحليل اتجاهات السوق وفرص المنتجات")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-blue-600">
            {t("Analyzing", "يحلل")}
          </Badge>
          <Button onClick={runAnalysis} disabled={isAnalyzing} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`} />
            {t("Run Analysis", "تشغيل التحليل")}
          </Button>
        </div>
      </div>

      {isAnalyzing && (
        <div className="p-4 border-b bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t("Analyzing Products...", "تحليل المنتجات...")}</span>
                <span className="text-sm text-muted-foreground">{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-6">
        <Tabs defaultValue="products" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">{t("Product Analysis", "تحليل المنتجات")}</TabsTrigger>
            <TabsTrigger value="trends">{t("Market Trends", "اتجاهات السوق")}</TabsTrigger>
            <TabsTrigger value="insights">{t("AI Insights", "رؤى الذكاء الاصطناعي")}</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="h-full mt-6">
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("Search products...", "البحث عن المنتجات...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t("Category", "الفئة")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("All Categories", "جميع الفئات")}</SelectItem>
                    <SelectItem value="electronics">{t("Electronics", "إلكترونيات")}</SelectItem>
                    <SelectItem value="fitness">{t("Fitness", "لياقة بدنية")}</SelectItem>
                    <SelectItem value="home & garden">{t("Home & Garden", "المنزل والحديقة")}</SelectItem>
                    <SelectItem value="fashion">{t("Fashion", "أزياء")}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t("Sort by", "ترتيب حسب")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demand">{t("Demand Score", "نقاط الطلب")}</SelectItem>
                    <SelectItem value="profit">{t("Profit Margin", "هامش الربح")}</SelectItem>
                    <SelectItem value="trend">{t("Trend", "الاتجاه")}</SelectItem>
                    <SelectItem value="orders">{t("Orders", "الطلبات")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={product.imageUrl || "/api/images/product-placeholder"}
                        alt={product.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge className={getRiskColor(product.riskLevel)}>
                          {t(
                            product.riskLevel.charAt(0).toUpperCase() + product.riskLevel.slice(1),
                            product.riskLevel === "low" ? "منخفض" : product.riskLevel === "medium" ? "متوسط" : "عالي",
                          )}
                        </Badge>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="outline" className="bg-white/90">
                          {product.supplier.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-sm line-clamp-2">
                            {language === "ar" ? product.titleAr : product.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {language === "ar" ? product.categoryAr : product.category}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">${product.price}</span>
                            <span className="text-xs text-muted-foreground line-through">${product.originalPrice}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(product.trend, product.trendPercentage)}
                            <span
                              className={`text-xs ${product.trend === "rising" ? "text-green-600" : product.trend === "falling" ? "text-red-600" : "text-gray-600"}`}
                            >
                              {product.trendPercentage > 0 ? "+" : ""}
                              {product.trendPercentage}%
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>
                              {product.rating} ({product.reviewCount})
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3 text-blue-500" />
                            <span>{product.orders.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>{t("Demand Score", "نقاط الطلب")}</span>
                            <span className="font-semibold">{product.demandScore}/100</span>
                          </div>
                          <Progress value={product.demandScore} className="h-1" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>{t("Profit Margin", "هامش الربح")}</span>
                            <span className="font-semibold text-green-600">{product.profitMargin}%</span>
                          </div>
                          <Progress value={product.profitMargin} className="h-1" />
                        </div>

                        <div className="flex gap-1 flex-wrap">
                          {product.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <Button className="w-full" size="sm">
                          <Eye className="h-3 w-3 mr-2" />
                          {t("View Details", "عرض التفاصيل")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="h-full mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {marketTrends.map((trend) => (
                  <Card key={trend.category}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {language === "ar" ? trend.categoryAr : trend.category}
                        </CardTitle>
                        <Badge className={getCompetitionColor(trend.competition)}>
                          {t(
                            trend.competition.charAt(0).toUpperCase() + trend.competition.slice(1) + " Competition",
                            trend.competition === "low"
                              ? "منافسة منخفضة"
                              : trend.competition === "medium"
                                ? "منافسة متوسطة"
                                : "منافسة عالية",
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">{t("Growth Rate", "معدل النمو")}</p>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="font-semibold text-green-600">+{trend.growth}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t("Monthly Volume", "الحجم الشهري")}</p>
                          <p className="font-semibold">{trend.volume.toLocaleString()}</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">{t("Opportunity Score", "نقاط الفرصة")}</span>
                          <span className="font-semibold">{trend.opportunity}/100</span>
                        </div>
                        <Progress value={trend.opportunity} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="h-full mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    {t("AI Market Analysis", "تحليل السوق بالذكاء الاصطناعي")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-semibold text-green-600">{t("Recommended", "موصى به")}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "Electronics category shows strong growth potential with 15.2% increase",
                            "فئة الإلكترونيات تظهر إمكانات نمو قوية بزيادة 15.2%",
                          )}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold text-yellow-600">{t("Caution", "تحذير")}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "Photography accessories showing declining trend",
                            "إكسسوارات التصوير تظهر اتجاهاً متراجعاً",
                          )}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold text-blue-600">{t("Trending", "رائج")}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "Fitness products gaining momentum in Q4",
                            "منتجات اللياقة البدنية تكتسب زخماً في الربع الرابع",
                          )}
                        </p>
                      </CardContent>
                    </Card>
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
