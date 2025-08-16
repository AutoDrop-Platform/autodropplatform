"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Package,
  Search,
  Filter,
  RefreshCw,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  DollarSign,
  MapPin,
  User,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Order {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  total: number
  currency: string
  items: OrderItem[]
  shippingAddress: Address
  supplier: "aliexpress" | "cj" | "other"
  supplierOrderId?: string
  trackingNumber?: string
  estimatedDelivery?: Date
  createdAt: Date
  updatedAt: Date
  notes: string[]
  priority: "low" | "medium" | "high" | "urgent"
}

interface OrderItem {
  id: string
  productId: string
  title: string
  titleAr: string
  quantity: number
  price: number
  imageUrl: string
  variant?: string
}

interface Address {
  name: string
  street: string
  city: string
  state: string
  country: string
  postalCode: string
}

interface OrderManagementAgentProps {
  language: "en" | "ar"
  onLanguageChange: (lang: "en" | "ar") => void
}

export function OrderManagementAgent({ language, onLanguageChange }: OrderManagementAgentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const t = (en: string, ar: string) => (language === "ar" ? ar : en)

  // Mock data for demonstration
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-2024-001",
      customerId: "cust_001",
      customerName: "أحمد محمد",
      customerEmail: "ahmed@example.com",
      customerPhone: "+966501234567",
      status: "processing",
      paymentStatus: "paid",
      total: 89.99,
      currency: "USD",
      items: [
        {
          id: "item_001",
          productId: "prod_001",
          title: "Wireless Bluetooth Earbuds",
          titleAr: "سماعات بلوتوث لاسلكية",
          quantity: 2,
          price: 29.99,
          imageUrl: "/placeholder.svg?height=80&width=80",
          variant: "Black",
        },
        {
          id: "item_002",
          productId: "prod_002",
          title: "Phone Case",
          titleAr: "غطاء الهاتف",
          quantity: 1,
          price: 19.99,
          imageUrl: "/placeholder.svg?height=80&width=80",
          variant: "Clear",
        },
      ],
      shippingAddress: {
        name: "أحمد محمد",
        street: "شارع الملك فهد، حي النخيل",
        city: "الرياض",
        state: "الرياض",
        country: "السعودية",
        postalCode: "12345",
      },
      supplier: "aliexpress",
      supplierOrderId: "AE-789456123",
      trackingNumber: "1Z999AA1234567890",
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000),
      notes: ["تم تأكيد الطلب مع المورد", "Order confirmed with supplier"],
      priority: "medium",
    },
    {
      id: "ORD-2024-002",
      customerId: "cust_002",
      customerName: "Sarah Johnson",
      customerEmail: "sarah@example.com",
      customerPhone: "+1234567890",
      status: "shipped",
      paymentStatus: "paid",
      total: 45.99,
      currency: "USD",
      items: [
        {
          id: "item_003",
          productId: "prod_003",
          title: "Smart Fitness Watch",
          titleAr: "ساعة ذكية للياقة البدنية",
          quantity: 1,
          price: 45.99,
          imageUrl: "/placeholder.svg?height=80&width=80",
          variant: "Rose Gold",
        },
      ],
      shippingAddress: {
        name: "Sarah Johnson",
        street: "123 Main Street, Apt 4B",
        city: "New York",
        state: "NY",
        country: "USA",
        postalCode: "10001",
      },
      supplier: "cj",
      supplierOrderId: "CJ-456789123",
      trackingNumber: "1Z999BB9876543210",
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      notes: ["Package shipped from warehouse", "تم شحن الطرد من المستودع"],
      priority: "high",
    },
    {
      id: "ORD-2024-003",
      customerId: "cust_003",
      customerName: "محمد علي",
      customerEmail: "mohammed@example.com",
      customerPhone: "+971501234567",
      status: "delivered",
      paymentStatus: "paid",
      total: 24.99,
      currency: "USD",
      items: [
        {
          id: "item_004",
          productId: "prod_004",
          title: "LED Strip Lights",
          titleAr: "أضواء LED شريطية",
          quantity: 1,
          price: 24.99,
          imageUrl: "/placeholder.svg?height=80&width=80",
          variant: "RGB 5m",
        },
      ],
      shippingAddress: {
        name: "محمد علي",
        street: "شارع الشيخ زايد، برج الإمارات",
        city: "دبي",
        state: "دبي",
        country: "الإمارات",
        postalCode: "00000",
      },
      supplier: "aliexpress",
      supplierOrderId: "AE-123456789",
      trackingNumber: "1Z999CC1122334455",
      estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      notes: ["تم التسليم بنجاح", "Successfully delivered"],
      priority: "low",
    },
  ])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const selectedOrderData = orders.find((order) => order.id === selectedOrder)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "processing":
        return "bg-blue-500"
      case "shipped":
        return "bg-purple-500"
      case "delivered":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      case "refunded":
        return "bg-gray-500"
      default:
        return "bg-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <RefreshCw className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      case "refunded":
        return <DollarSign className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-100"
      case "high":
        return "text-orange-600 bg-orange-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "low":
        return "text-green-600 bg-green-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    setIsProcessing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              updatedAt: new Date(),
              notes: [...order.notes, `Status updated to ${newStatus}`],
            }
          : order,
      ),
    )
    setIsProcessing(false)
  }

  const processOrder = async (orderId: string) => {
    setIsProcessing(true)
    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "processing",
              supplierOrderId: `SUP-${Date.now()}`,
              updatedAt: new Date(),
              notes: [...order.notes, "Order sent to supplier for processing"],
            }
          : order,
      ),
    )
    setIsProcessing(false)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">{t("Order Management Agent", "وكيل إدارة الطلبات")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("Automating order processing and fulfillment", "أتمتة معالجة الطلبات والوفاء بها")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600">
            {t("Active", "نشط")}
          </Badge>
          <Button size="sm" disabled={isProcessing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? "animate-spin" : ""}`} />
            {t("Sync Orders", "مزامنة الطلبات")}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Orders Sidebar */}
        <div className="w-96 border-r flex flex-col">
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Search orders...", "البحث في الطلبات...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("All Status", "جميع الحالات")}</SelectItem>
                  <SelectItem value="pending">{t("Pending", "معلق")}</SelectItem>
                  <SelectItem value="processing">{t("Processing", "قيد المعالجة")}</SelectItem>
                  <SelectItem value="shipped">{t("Shipped", "مشحون")}</SelectItem>
                  <SelectItem value="delivered">{t("Delivered", "تم التسليم")}</SelectItem>
                  <SelectItem value="cancelled">{t("Cancelled", "ملغي")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {filteredOrders.map((order) => (
                <Card
                  key={order.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedOrder === order.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedOrder(order.id)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`} />
                          <span className="font-medium text-sm">{order.id}</span>
                        </div>
                        <Badge className={getPriorityColor(order.priority)}>
                          {t(
                            order.priority.charAt(0).toUpperCase() + order.priority.slice(1),
                            order.priority === "urgent"
                              ? "عاجل"
                              : order.priority === "high"
                                ? "عالي"
                                : order.priority === "medium"
                                  ? "متوسط"
                                  : "منخفض",
                          )}
                        </Badge>
                      </div>

                      <div>
                        <p className="font-medium text-sm">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          <span className="text-xs capitalize">
                            {t(
                              order.status,
                              order.status === "pending"
                                ? "معلق"
                                : order.status === "processing"
                                  ? "قيد المعالجة"
                                  : order.status === "shipped"
                                    ? "مشحون"
                                    : order.status === "delivered"
                                      ? "تم التسليم"
                                      : order.status === "cancelled"
                                        ? "ملغي"
                                        : "مسترد",
                            )}
                          </span>
                        </div>
                        <span className="font-semibold text-primary">${order.total.toFixed(2)}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDate(order.createdAt)}</span>
                        <span>
                          {order.items.length} {t("items", "عناصر")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Order Details */}
        <div className="flex-1 flex flex-col">
          {selectedOrderData ? (
            <>
              {/* Order Header */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedOrderData.id}</h3>
                    <p className="text-muted-foreground">
                      {t("Created", "تم الإنشاء")} {formatDate(selectedOrderData.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(selectedOrderData.status)} text-white`}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(selectedOrderData.status)}
                        <span className="capitalize">
                          {t(
                            selectedOrderData.status,
                            selectedOrderData.status === "pending"
                              ? "معلق"
                              : selectedOrderData.status === "processing"
                                ? "قيد المعالجة"
                                : selectedOrderData.status === "shipped"
                                  ? "مشحون"
                                  : selectedOrderData.status === "delivered"
                                    ? "تم التسليم"
                                    : selectedOrderData.status === "cancelled"
                                      ? "ملغي"
                                      : "مسترد",
                          )}
                        </span>
                      </div>
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          {t("Actions", "الإجراءات")}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {selectedOrderData.status === "pending" && (
                          <DropdownMenuItem onClick={() => processOrder(selectedOrderData.id)}>
                            {t("Process Order", "معالجة الطلب")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => updateOrderStatus(selectedOrderData.id, "shipped")}>
                          {t("Mark as Shipped", "وضع علامة كمشحون")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(selectedOrderData.id, "delivered")}>
                          {t("Mark as Delivered", "وضع علامة كمسلم")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(selectedOrderData.id, "cancelled")}>
                          {t("Cancel Order", "إلغاء الطلب")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{t("Customer", "العميل")}</span>
                      </div>
                      <p className="font-semibold">{selectedOrderData.customerName}</p>
                      <p className="text-sm text-muted-foreground">{selectedOrderData.customerEmail}</p>
                      <p className="text-sm text-muted-foreground">{selectedOrderData.customerPhone}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{t("Payment", "الدفع")}</span>
                      </div>
                      <p className="font-semibold text-2xl">${selectedOrderData.total.toFixed(2)}</p>
                      <Badge
                        variant={selectedOrderData.paymentStatus === "paid" ? "default" : "secondary"}
                        className="mt-1"
                      >
                        {t(
                          selectedOrderData.paymentStatus.charAt(0).toUpperCase() +
                            selectedOrderData.paymentStatus.slice(1),
                          selectedOrderData.paymentStatus === "paid"
                            ? "مدفوع"
                            : selectedOrderData.paymentStatus === "pending"
                              ? "معلق"
                              : selectedOrderData.paymentStatus === "failed"
                                ? "فشل"
                                : "مسترد",
                        )}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{t("Shipping", "الشحن")}</span>
                      </div>
                      {selectedOrderData.trackingNumber ? (
                        <div>
                          <p className="font-semibold">{selectedOrderData.trackingNumber}</p>
                          {selectedOrderData.estimatedDelivery && (
                            <p className="text-sm text-muted-foreground">
                              {t("Est. delivery", "التسليم المتوقع")}: {formatDate(selectedOrderData.estimatedDelivery)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">{t("Not shipped yet", "لم يتم الشحن بعد")}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Order Content */}
              <div className="flex-1 p-6">
                <Tabs defaultValue="items" className="h-full">
                  <TabsList>
                    <TabsTrigger value="items">{t("Items", "العناصر")}</TabsTrigger>
                    <TabsTrigger value="shipping">{t("Shipping", "الشحن")}</TabsTrigger>
                    <TabsTrigger value="timeline">{t("Timeline", "الجدول الزمني")}</TabsTrigger>
                    <TabsTrigger value="notes">{t("Notes", "الملاحظات")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="items" className="mt-6">
                    <div className="space-y-4">
                      {selectedOrderData.items.map((item) => (
                        <Card key={item.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={item.imageUrl || "/placeholder.svg"}
                                alt={item.title}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold">{language === "ar" ? item.titleAr : item.title}</h4>
                                {item.variant && (
                                  <p className="text-sm text-muted-foreground">
                                    {t("Variant", "المتغير")}: {item.variant}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-sm">
                                    {t("Quantity", "الكمية")}: {item.quantity}
                                  </span>
                                  <span className="font-semibold">${item.price.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="shipping" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          {t("Shipping Address", "عنوان الشحن")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="font-semibold">{selectedOrderData.shippingAddress.name}</p>
                          <p>{selectedOrderData.shippingAddress.street}</p>
                          <p>
                            {selectedOrderData.shippingAddress.city}, {selectedOrderData.shippingAddress.state}{" "}
                            {selectedOrderData.shippingAddress.postalCode}
                          </p>
                          <p>{selectedOrderData.shippingAddress.country}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">{t("Order Created", "تم إنشاء الطلب")}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(selectedOrderData.createdAt)}</p>
                        </div>
                      </div>
                      {selectedOrderData.status !== "pending" && (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <RefreshCw className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{t("Processing Started", "بدأت المعالجة")}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(selectedOrderData.updatedAt)}</p>
                          </div>
                        </div>
                      )}
                      {selectedOrderData.status === "shipped" || selectedOrderData.status === "delivered" ? (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <Truck className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="font-medium">{t("Order Shipped", "تم شحن الطلب")}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(selectedOrderData.updatedAt)}</p>
                          </div>
                        </div>
                      ) : null}
                      {selectedOrderData.status === "delivered" && (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium">{t("Order Delivered", "تم تسليم الطلب")}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(selectedOrderData.updatedAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="notes" className="mt-6">
                    <div className="space-y-3">
                      {selectedOrderData.notes.map((note, index) => (
                        <Card key={index}>
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <p className="text-sm">{note}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t("Select an Order", "اختر طلباً")}</h3>
                <p className="text-muted-foreground">
                  {t("Choose an order to view details and manage", "اختر طلباً لعرض التفاصيل والإدارة")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
