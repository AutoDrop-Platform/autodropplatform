"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Send, User, Bot, Package, Search, Filter, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MultiAgentSystem } from "@/lib/multi-agent-system"

interface ChatMessage {
  id: string
  type: "user" | "agent"
  content: string
  timestamp: Date
  language: "en" | "ar"
}

interface CustomerTicket {
  id: string
  customerId: string
  customerName: string
  subject: string
  status: "open" | "in-progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  category: "order" | "product" | "shipping" | "refund" | "general"
  createdAt: Date
  lastUpdated: Date
  messages: ChatMessage[]
  orderId?: string
}

interface CustomerServiceAgentProps {
  language: "en" | "ar"
  onLanguageChange: (lang: "en" | "ar") => void
}

export function CustomerServiceAgent({ language, onLanguageChange }: CustomerServiceAgentProps) {
  const [activeTicket, setActiveTicket] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [multiAgentSystem] = useState(() => MultiAgentSystem.getInstance())
  const [activeConversations, setActiveConversations] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const t = (en: string, ar: string) => (language === "ar" ? ar : en)

  // Mock data for demonstration
  const [tickets, setTickets] = useState<CustomerTicket[]>([
    {
      id: "ticket_001",
      customerId: "cust_001",
      customerName: "أحمد محمد",
      subject: "استفسار عن حالة الطلب #12345",
      status: "open",
      priority: "medium",
      category: "order",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 30 * 60 * 1000),
      orderId: "12345",
      messages: [
        {
          id: "msg_001",
          type: "user",
          content: "مرحبا، أريد معرفة حالة طلبي رقم 12345",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          language: "ar",
        },
        {
          id: "msg_002",
          type: "agent",
          content: "مرحبا بك! سأتحقق من حالة طلبك الآن. طلبك رقم 12345 قيد الشحن وسيصل خلال 2-3 أيام عمل.",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000),
          language: "ar",
        },
      ],
    },
    {
      id: "ticket_002",
      customerId: "cust_002",
      customerName: "Sarah Johnson",
      subject: "Product return request",
      status: "in-progress",
      priority: "high",
      category: "refund",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 15 * 60 * 1000),
      orderId: "12346",
      messages: [
        {
          id: "msg_003",
          type: "user",
          content: "Hi, I received a damaged product and would like to return it.",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          language: "en",
        },
        {
          id: "msg_004",
          type: "agent",
          content:
            "I'm sorry to hear about the damaged product. I'll process your return request immediately. Please provide photos of the damage.",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000 + 45000),
          language: "en",
        },
      ],
    },
    {
      id: "ticket_003",
      customerId: "cust_003",
      customerName: "محمد علي",
      subject: "تأخير في الشحن",
      status: "resolved",
      priority: "low",
      category: "shipping",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 60 * 60 * 1000),
      messages: [
        {
          id: "msg_005",
          type: "user",
          content: "طلبي متأخر عن الموعد المحدد",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          language: "ar",
        },
        {
          id: "msg_006",
          type: "agent",
          content: "أعتذر عن التأخير. تم تحديث معلومات الشحن وسيصل طلبك غداً. تم إضافة كوبون خصم 10% لحسابك كاعتذار.",
          timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
          language: "ar",
        },
      ],
    },
  ])

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterStatus === "all" || ticket.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const activeTicketData = tickets.find((ticket) => ticket.id === activeTicket)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [activeTicketData?.messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeTicket) return

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: "user",
      content: newMessage,
      timestamp: new Date(),
      language,
    }

    // Add user message
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === activeTicket
          ? {
              ...ticket,
              messages: [...ticket.messages, userMessage],
              lastUpdated: new Date(),
            }
          : ticket,
      ),
    )

    setNewMessage("")
    setIsTyping(true)

    try {
      const ticket = activeTicketData
      if (ticket) {
        // Check if this inquiry needs routing to other agents
        const routingResult = await multiAgentSystem.routeCustomerInquiry(newMessage, language)

        if (routingResult.routing.targetAgent !== "customer-service") {
          // Create a multi-agent conversation for handoff
          const conversationId = routingResult.conversationId
          setActiveConversations((prev) => [...prev, conversationId])

          // Add system message about handoff
          const handoffMessage: ChatMessage = {
            id: `msg_${Date.now() + 1}`,
            type: "agent",
            content: t(
              `I'm connecting you with our ${routingResult.routing.targetAgent} specialist for better assistance.`,
              `أقوم بتوصيلك مع أخصائي ${routingResult.routing.targetAgent} للحصول على مساعدة أفضل.`,
            ),
            timestamp: new Date(),
            language,
          }

          setTickets((prev) =>
            prev.map((t) =>
              t.id === activeTicket
                ? {
                    ...t,
                    messages: [...t.messages, handoffMessage],
                    lastUpdated: new Date(),
                  }
                : t,
            ),
          )
        }
      }

      // Get AI response using the production agent system
      const response = await fetch(`/api/agents/customer-service/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newMessage,
          language,
          ticketId: activeTicket,
          context: activeTicketData,
          useMultiAgent: true,
        }),
      })

      const data = await response.json()

      const agentMessage: ChatMessage = {
        id: `msg_${Date.now() + 2}`,
        type: "agent",
        content: data.response || t("I'm here to help you with your inquiry.", "أنا هنا لمساعدتك في استفسارك."),
        timestamp: new Date(),
        language,
      }

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === activeTicket
            ? {
                ...ticket,
                messages: [...ticket.messages, agentMessage],
                lastUpdated: new Date(),
              }
            : ticket,
        ),
      )
    } catch (error) {
      console.error("Failed to get agent response:", error)
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now() + 3}`,
        type: "agent",
        content: t(
          "I apologize, but I'm experiencing technical difficulties. Let me try to help you in another way.",
          "أعتذر، ولكنني أواجه صعوبات تقنية. دعني أحاول مساعدتك بطريقة أخرى.",
        ),
        timestamp: new Date(),
        language,
      }

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === activeTicket
            ? {
                ...ticket,
                messages: [...ticket.messages, errorMessage],
                lastUpdated: new Date(),
              }
            : ticket,
        ),
      )
    } finally {
      setIsTyping(false)
    }
  }

  const handleWorkflowTrigger = async (workflowType: string) => {
    try {
      if (workflowType === "order-to-customer-service" && activeTicketData?.orderId) {
        const workflowId = await multiAgentSystem.executeOrderToCustomerService({
          orderId: activeTicketData.orderId,
          customerId: activeTicketData.customerId,
          ticketId: activeTicketData.id,
        })

        console.log(`[CustomerService] Started workflow: ${workflowId}`)

        // Add system message about workflow
        const workflowMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          type: "agent",
          content: t(
            "I've initiated an automated workflow to resolve your order inquiry. Our system is now coordinating with multiple departments.",
            "لقد بدأت سير عمل آلي لحل استفسار طلبك. نظامنا يتنسق الآن مع عدة أقسام.",
          ),
          timestamp: new Date(),
          language,
        }

        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === activeTicket
              ? {
                  ...ticket,
                  messages: [...ticket.messages, workflowMessage],
                  lastUpdated: new Date(),
                }
              : ticket,
          ),
        )
      }
    } catch (error) {
      console.error("Failed to trigger workflow:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500"
      case "in-progress":
        return "bg-yellow-500"
      case "resolved":
        return "bg-green-500"
      case "closed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}${t("d", "ي")} ${t("ago", "مضت")}`
    if (hours > 0) return `${hours}${t("h", "س")} ${t("ago", "مضت")}`
    if (minutes > 0) return `${minutes}${t("m", "د")} ${t("ago", "مضت")}`
    return t("Just now", "الآن")
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">{t("Customer Service Agent", "وكيل خدمة العملاء")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("Managing customer inquiries and support tickets", "إدارة استفسارات العملاء وتذاكر الدعم")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600">
            {t("Online", "متصل")}
          </Badge>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Tickets Sidebar */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Search tickets...", "البحث في التذاكر...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">{t("All Status", "جميع الحالات")}</option>
                <option value="open">{t("Open", "مفتوح")}</option>
                <option value="in-progress">{t("In Progress", "قيد المعالجة")}</option>
                <option value="resolved">{t("Resolved", "محلول")}</option>
                <option value="closed">{t("Closed", "مغلق")}</option>
              </select>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {filteredTickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    activeTicket === ticket.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setActiveTicket(ticket.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(ticket.status)}`} />
                        <span className="text-xs text-muted-foreground">#{ticket.id.slice(-3)}</span>
                      </div>
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(ticket.priority)} text-white`}>
                        {t(
                          ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1),
                          ticket.priority === "urgent"
                            ? "عاجل"
                            : ticket.priority === "high"
                              ? "عالي"
                              : ticket.priority === "medium"
                                ? "متوسط"
                                : "منخفض",
                        )}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm mb-1 line-clamp-2">{ticket.subject}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{ticket.customerName}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatTime(ticket.lastUpdated)}</span>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{ticket.messages.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeTicketData ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{activeTicketData.customerName}</h3>
                      <p className="text-sm text-muted-foreground">{activeTicketData.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeTicketData.orderId && (
                      <Badge variant="outline">
                        <Package className="h-3 w-3 mr-1" />
                        {t("Order", "طلب")} #{activeTicketData.orderId}
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>{t("Mark as Resolved", "وضع علامة كمحلول")}</DropdownMenuItem>
                        <DropdownMenuItem>{t("Escalate", "تصعيد")}</DropdownMenuItem>
                        <DropdownMenuItem>{t("View Order", "عرض الطلب")}</DropdownMenuItem>
                        {activeTicketData.orderId && (
                          <DropdownMenuItem onClick={() => handleWorkflowTrigger("order-to-customer-service")}>
                            {t("Start Order Workflow", "بدء سير عمل الطلب")}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {activeTicketData.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.type === "agent" ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {message.type === "agent" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.type === "agent"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                        dir={message.language === "ar" ? "rtl" : "ltr"}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-3 flex-row-reverse">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-primary text-primary-foreground rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-current rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-current rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder={t("Type your message...", "اكتب رسالتك...")}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    dir={language === "ar" ? "rtl" : "ltr"}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isTyping}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t("Select a Ticket", "اختر تذكرة")}</h3>
                <p className="text-muted-foreground">
                  {t("Choose a customer ticket to start the conversation", "اختر تذكرة عميل لبدء المحادثة")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
