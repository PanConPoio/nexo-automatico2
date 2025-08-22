"use client"

import { useState } from "react"
import type { Contact } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Send, Loader2 } from "lucide-react"

interface SendMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: Contact | null
  onMessageSent?: () => void
}

export function SendMessageDialog({ open, onOpenChange, contact, onMessageSent }: SendMessageDialogProps) {
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  const handleSend = async () => {
    if (!contact || !message.trim()) return

    try {
      setSending(true)

      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactId: contact.id,
          message: message.trim(),
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Mensaje enviado",
          description: `Mensaje enviado exitosamente a ${contact.name}`,
        })
        setMessage("")
        onOpenChange(false)
        onMessageSent?.()
      } else {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Mensaje</DialogTitle>
        </DialogHeader>

        {contact && (
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="font-medium">{contact.name}</p>
              <p className="text-sm text-muted-foreground">{contact.phone}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                placeholder="Escribe tu mensaje aquí..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">{message.length}/1000 caracteres</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
                Cancelar
              </Button>
              <Button
                onClick={handleSend}
                disabled={!message.trim() || sending}
                className="gap-2 bg-trs-orange hover:bg-trs-orange/90"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
