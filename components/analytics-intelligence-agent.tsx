"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target, Brain, Zap } from "lucide-react"

interface AnalyticsData {
  revenue: { current: number; previous: number; trend: number }
  orders: { current: number; previous: number; trend: number }
  customers: { current: number; previous: number; trend: number }
  conversion: { current: number; previous: number; trend: number }
  salesData: Array<{ month: string; revenue: number; orders: number; profit: number }>
  productPerformance: Array<{ name: string; sales: number; profit: number; trend: number }>
  customerSegments: Array<{ segment: string; value: number; color: string }>
  forecasting: Array<{ month: string; predicted: number; actual: number }>
}

interface AnalyticsIntelligenceAgentProps {
  language: "en" | "ar"
  onLanguageChange: (lang: "en" | "ar") => void
}

export default function AnalyticsIntelligenceAgent({ language, onLanguageChange }: AnalyticsIntelligenceAgentProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [insights, setInsights] = useState<string[]>([])

  const isRTL = language === "ar"

  const translations = {
    en: {
      title: "Analytics Intelligence Agent",
      description: "Advanced business intelligence and predictive analytics",
      revenue: "Revenue",
      orders: "Orders",
      customers: "Customers",
      conversion: "Conversion Rate",
      salesTrends: "Sales Trends",
      productPerformance: "Product Performance",
      customerSegments: "Customer Segments",
      forecasting: "Revenue Forecasting",
      insights: "AI Insights",
      generateReport: "Generate Report",
      period: "Period",
      last30Days: "Last 30 Days",
      last90Days: "Last 90 Days",
      lastYear: "Last Year",
      profit: "Profit",
      sales: "Sales",
      predicted: "Predicted",
      actual: "Actual",
      newCustomers: "New Customers",
      returningCustomers: "Returning Customers",
      vipCustomers: "VIP Customers",
      regularCustomers: "Regular Customers",
    },
    ar: {
      title: "وكيل الذكاء التحليلي",
      description: "ذكاء الأعمال المتقدم والتحليلات التنبؤية",
      revenue: "الإيرادات",
      orders: "الطلبات",
      customers: "العملاء",
      conversion: "معدل التحويل",
      salesTrends: "اتجاهات المبيعات",
      productPerformance: "أداء المنتجات",
      customerSegments: "شرائح العملاء",
      forecasting: "توقعات الإيرادات",
      insights: "رؤى الذكاء الاصطناعي",
      generateReport: "إنشاء تقرير",
      period: "الفترة",
      last30Days: "آخر 30 يوم",
      last90Days: "آخر 90 يوم",
      lastYear: "العام الماضي",
      profit: "الربح",
      sales: "المبيعات",
      predicted: "متوقع",
      actual: "فعلي",
      newCustomers: "عملاء جدد",
      returningCustomers: "عملاء عائدون",
      vipCustomers: "عملاء مميزون",
      regularCustomers: "عملاء عاديون",
    },
  }

  const t = translations[language]

  useEffect(() => {
    // Load real analytics data from API
    const loadAnalyticsData = async () => {
      try {
        const response = await fetch("/api/analytics/dashboard")
        if (response.ok) {
          const data = await response.json()
          setAnalyticsData(data)
        } else {
          throw new Error("Failed to load analytics data")
        }
      } catch (error) {
        console.error("Error loading analytics:", error)
        // Set empty data structure for production
        const emptyData: AnalyticsData = {
          revenue: { current: 0, previous: 0, trend: 0 },
          orders: { current: 0, previous: 0, trend: 0 },
          customers: { current: 0, previous: 0, trend: 0 },
          conversion: { current: 0, previous: 0, trend: 0 },
          salesData: [],
          productPerformance: [],
          customerSegments: [],
          forecasting: [],
        }
        setAnalyticsData(emptyData)
      }
    }

    loadAnalyticsData()
  }, [selectedPeriod, t])

  const generateInsights = async () => {
    setIsGeneratingReport(true)

    try {
      const response = await fetch("/api/analytics/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: selectedPeriod, language }),
      })

      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights || [])
      } else {
        throw new Error("Failed to generate insights")
      }
    } catch (error) {
      console.error("Error generating insights:", error)
      setInsights([
        language === "ar"
          ? "لا توجد بيانات كافية لإنشاء رؤى. يرجى ربط مصادر البيانات الحقيقية."
          : "Insufficient data to generate insights. Please connect real data sources.",
      ])
    }

    setIsGeneratingReport(false)
  }

  const MetricCard = ({
    title,
    current,
    previous,
    trend,
    icon: Icon,
    format = "number",
  }: {
    title: string
    current: number
    previous: number
    trend: number
    icon: any
    format?: "number" | "currency" | "percentage"
  }) => {
    const formatValue = (value: number) => {
      switch (format) {
        case "currency":
          return `$${value.toLocaleString()}`
        case "percentage":
          return `${value}%`
        default:
          return value.toLocaleString()
      }
    }

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatValue(current)}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            {trend > 0 ? (
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
            )}
            <span className={trend > 0 ? "text-green-500" : "text-red-500"}>{Math.abs(trend)}%</span>
            <span className="ml-1">from last period</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t.title}</h2>
          <p className="text-muted-foreground">{t.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">{t.last30Days}</SelectItem>
              <SelectItem value="90d">{t.last90Days}</SelectItem>
              <SelectItem value="1y">{t.lastYear}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateInsights} disabled={isGeneratingReport}>
            {isGeneratingReport ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Brain className="mr-2 h-4 w-4" />
            )}
            {t.generateReport}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t.revenue}
          current={analyticsData.revenue.current}
          previous={analyticsData.revenue.previous}
          trend={analyticsData.revenue.trend}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title={t.orders}
          current={analyticsData.orders.current}
          previous={analyticsData.orders.previous}
          trend={analyticsData.orders.trend}
          icon={ShoppingCart}
        />
        <MetricCard
          title={t.customers}
          current={analyticsData.customers.current}
          previous={analyticsData.customers.previous}
          trend={analyticsData.customers.trend}
          icon={Users}
        />
        <MetricCard
          title={t.conversion}
          current={analyticsData.conversion.current}
          previous={analyticsData.conversion.previous}
          trend={analyticsData.conversion.trend}
          icon={Target}
          format="percentage"
        />
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">{t.salesTrends}</TabsTrigger>
          <TabsTrigger value="products">{t.productPerformance}</TabsTrigger>
          <TabsTrigger value="customers">{t.customerSegments}</TabsTrigger>
          <TabsTrigger value="forecasting">{t.forecasting}</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.salesTrends}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: { label: t.revenue, color: "#0891b2" },
                  profit: { label: t.profit, color: "#06b6d4" },
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#0891b2"
                      fill="#0891b2"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stackId="2"
                      stroke="#06b6d4"
                      fill="#06b6d4"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.productPerformance}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  sales: { label: t.sales, color: "#0891b2" },
                  profit: { label: t.profit, color: "#06b6d4" },
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.productPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sales" fill="#0891b2" />
                    <Bar dataKey="profit" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.customerSegments}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.customerSegments}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ segment, value }) => `${segment}: ${value}%`}
                    >
                      {analyticsData.customerSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.forecasting}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  predicted: { label: t.predicted, color: "#0891b2" },
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.forecasting}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="predicted" stroke="#0891b2" strokeWidth={3} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {t.insights}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
