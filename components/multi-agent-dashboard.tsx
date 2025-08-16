"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, MessageSquare, Users, Workflow, Clock, CheckCircle, XCircle } from "lucide-react"
import { MultiAgentSystem, type AgentWorkflow, type AgentConversation } from "@/lib/multi-agent-system"

export function MultiAgentDashboard() {
  const [workflows, setWorkflows] = useState<AgentWorkflow[]>([])
  const [conversations, setConversations] = useState<AgentConversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeMultiAgentSystem()
  }, [])

  const initializeMultiAgentSystem = async () => {
    try {
      const multiAgent = MultiAgentSystem.getInstance()

      // Create default workflows if none exist
      const existingWorkflows = multiAgent.getWorkflows()
      if (existingWorkflows.length === 0) {
        await multiAgent.createDropshippingWorkflows()
      }

      setWorkflows(multiAgent.getWorkflows())
      setConversations(multiAgent.getConversations())
    } catch (error) {
      console.error("[MultiAgent Dashboard] Initialization error:", error)
    } finally {
      setLoading(false)
    }
  }

  const executeWorkflow = async (workflowId: string) => {
    try {
      const multiAgent = MultiAgentSystem.getInstance()
      await multiAgent.executeWorkflow(workflowId)
      setWorkflows(multiAgent.getWorkflows())
    } catch (error) {
      console.error("[MultiAgent Dashboard] Workflow execution error:", error)
    }
  }

  const startConversation = async () => {
    try {
      const multiAgent = MultiAgentSystem.getInstance()
      const conversationId = await multiAgent.startConversation(
        ["product-research", "marketing", "analytics"],
        "Weekly Product Strategy Discussion",
        "Let's discuss this week's product performance and upcoming opportunities.",
      )
      setConversations(multiAgent.getConversations())
    } catch (error) {
      console.error("[MultiAgent Dashboard] Conversation start error:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "running":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "running":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "active":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Multi-Agent Collaboration</h2>
          <p className="text-gray-600">Automated workflows and agent conversations</p>
        </div>
        <Button onClick={startConversation} className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Start Conversation
        </Button>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Workflows ({workflows.length})
          </TabsTrigger>
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Conversations ({conversations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid gap-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(workflow.status)}
                      <div>
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                        <CardDescription>{workflow.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(workflow.status)}>{workflow.status}</Badge>
                      {workflow.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => executeWorkflow(workflow.id)}
                          className="flex items-center gap-1"
                        >
                          <Play className="h-3 w-3" />
                          Execute
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{workflow.steps.length} steps</span>
                      <span>Created {new Date(workflow.createdAt).toLocaleDateString()}</span>
                      {workflow.completedAt && (
                        <span>Completed {new Date(workflow.completedAt).toLocaleDateString()}</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Workflow Steps:</h4>
                      <div className="grid gap-2">
                        {workflow.steps.map((step, index) => (
                          <div key={step.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                            <span className="text-xs font-mono bg-white px-2 py-1 rounded">{index + 1}</span>
                            {getStatusIcon(step.status)}
                            <div className="flex-1">
                              <span className="text-sm font-medium">{step.action}</span>
                              <span className="text-xs text-gray-500 ml-2">({step.agentId})</span>
                            </div>
                            {step.dependencies.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                Depends on: {step.dependencies.join(", ")}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <div className="grid gap-4">
            {conversations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Conversations</h3>
                  <p className="text-gray-600 text-center mb-4">
                    Start a conversation between agents to collaborate on complex tasks.
                  </p>
                  <Button onClick={startConversation}>Start First Conversation</Button>
                </CardContent>
              </Card>
            ) : (
              conversations.map((conversation) => (
                <Card key={conversation.id} className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                        <div>
                          <CardTitle className="text-lg">{conversation.topic}</CardTitle>
                          <CardDescription>
                            {conversation.participants.length} participants • {conversation.messages.length} messages
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(conversation.status)}>{conversation.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Participants:</span>
                        <div className="flex gap-1">
                          {conversation.participants.map((agentId) => (
                            <Badge key={agentId} variant="outline" className="text-xs">
                              {agentId}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {conversation.messages.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Recent Messages:</h4>
                          <ScrollArea className="h-32 w-full border rounded-lg p-3">
                            <div className="space-y-2">
                              {conversation.messages.slice(-5).map((message) => (
                                <div key={message.id} className="text-sm">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs">
                                      {message.agentId}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {new Date(message.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 pl-2 border-l-2 border-gray-200">{message.content}</p>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
