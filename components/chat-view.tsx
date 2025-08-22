"use client"

import { useEffect, useState, useRef } from "react"
import type { Message, Contact } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Loader2, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatViewProps {
  contact: Contact
  onMessageSent?: () => void
}

export function ChatView({ contact, onMessageSent }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()

    const interval = setInterval(() => {
      fetchMessages()
    }, 3000)

    return () => clearInterval(interval)
  }, [contact.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      if (messages.length === 0) {
        setLoading(true)
      }

      const response = await fetch(`/api/messages/${contact.id}`)
      const { messages: fetchedMessages } = await response.json()

      // Ordenar mensajes por fecha ascendente para visualización de chat
      const sortedMessages = fetchedMessages
        ? fetchedMessages.sort(
            (a: Message, b: Message) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
          )
        : []

      setMessages(sortedMessages)
    } catch (error) {
      console.error("Error fetching messages:", error)
      if (messages.length === 0) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los mensajes.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      setSending(true)

      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        contact_id: contact.id,
        content: newMessage.trim(),
        direction: "outbound",
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, tempMessage])
      setNewMessage("")

      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactId: contact.id,
          message: newMessage.trim(),
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Mensaje enviado",
          description: "Mensaje enviado exitosamente.",
        })
        fetchMessages()
        onMessageSent?.()
      } else {
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id))
        setNewMessage(newMessage.trim()) // Restore message text
        throw new Error(result.error || "Error al enviar mensaje")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al enviar el mensaje",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b p-4">
        <CardTitle className="flex items-center gap-2 text-trs-blue-indigo">
          <MessageSquare className="h-5 w-5" />
          Chat con {contact.name}
          <span className="ml-auto flex items-center gap-1 text-xs text-green-600">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            En vivo
          </span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{contact.phone}</p>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-trs-orange" />
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No hay mensajes en este chat.</div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                        msg.direction === "outbound"
                          ? "bg-trs-orange text-white rounded-br-none"
                          : "bg-trs-blue-light text-trs-blue-indigo rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <div
                        className={`text-xs mt-1 ${
                          msg.direction === "outbound" ? "text-white/80" : "text-muted-foreground"
                        } text-right`}
                      >
                        {formatMessageTime(msg.sent_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}
      </CardContent>
      <div className="border-t p-4 flex items-center gap-2">
        <Input
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !sending) {
              handleSendMessage()
            }
          }}
          disabled={sending}
          className="flex-1"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sending}
          className="bg-trs-orange hover:bg-trs-orange/90"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </Card>
  )
}
