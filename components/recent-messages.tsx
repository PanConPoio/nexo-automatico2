"use client"

import { useEffect, useState } from "react"
import { type Message } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

export function RecentMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentMessages()
  }, [])

  const fetchRecentMessages = async () => {
    try {
      const response = await fetch("/api/messages?limit=10")
      const { data } = await response.json()
      setMessages(data || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Mensajes Recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-muted animate-pulse rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No hay mensajes recientes</p>
        ) : (
          <div className="space-y-4">
            {messages.slice(0, 10).map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-full ${
                    message.direction === "inbound"
                      ? "bg-trs-blue-light text-trs-blue-indigo"
                      : "bg-trs-orange/10 text-trs-orange"
                  }`}
                >
                  {message.direction === "inbound" ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{message.contact?.name || "Usuario desconocido"}</p>
                    <span className="text-xs text-muted-foreground">{formatDate(message.sent_at)}</span>
                  </div>

                  <p className="text-sm text-muted-foreground truncate">{message.content}</p>

                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={message.direction === "inbound" ? "secondary" : "default"}
                      className={`text-xs ${
                        message.direction === "inbound"
                          ? "bg-trs-blue-light text-trs-blue-indigo"
                          : "bg-trs-orange text-white"
                      }`}
                    >
                      {message.direction === "inbound" ? "Recibido" : "Enviado"}
                    </Badge>
                    {message.status && (
                      <Badge variant="outline" className="text-xs">
                        {message.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
