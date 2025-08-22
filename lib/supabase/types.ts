// lib/supabase/types.ts
export interface Contact {
  id: string
  phone: string
  name: string
  status: "interesado" | "inscrito" | "rechazado" | "reagendados" // 'bloqueado' cambiado a 'reagendados'
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  contact_id: string
  content: string
  direction: "inbound" | "outbound"
  status: "sent" | "delivered" | "read" | "failed"
  whatsapp_message_id?: string
  sent_at: string
  contact?: Contact
}
