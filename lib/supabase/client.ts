import { createClient } from "@supabase/supabase-js"
import { type Contact, type Message } from "./types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Funciones de base de datos
export const db = {
  // Contactos
  async getContacts(filters?: { status?: string; search?: string }) {
    let query = supabase.from("contacts").select("*").order("created_at", { ascending: false })

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    return { data, error }
  },

  async getContactById(id: string) {
    const { data, error } = await supabase.from("contacts").select("*").eq("id", id).single()
    return { data, error }
  },

  async createContact(contact: Omit<Contact, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("contacts").insert(contact).select().single()
    return { data, error }
  },

  async updateContact(id: string, updates: Partial<Contact>) {
    const { data, error } = await supabase.from("contacts").update(updates).eq("id", id).select().single()
    return { data, error }
  },

  // Mensajes
  async getMessages(contactId?: string) {
    let query = supabase
      .from("messages")
      .select(`
        *,
        contact:contacts(*)
      `)
      .order("sent_at", { ascending: false })

    if (contactId) {
      query = query.eq("contact_id", contactId)
    }

    const { data, error } = await query
    return { data, error }
  },

  async createMessage(message: Omit<Message, "id" | "sent_at">) {
    const { data, error } = await supabase.from("messages").insert(message).select().single()
    return { data, error }
  },

  // Estadísticas del dashboard
  async getDashboardStats() {
    const today = new Date().toISOString().split("T")[0]

    const [contactsResult, messagesResult, todayMessagesResult] = await Promise.all([
      supabase.from("contacts").select("status", { count: "exact" }),
      supabase.from("messages").select("id", { count: "exact" }),
      supabase
        .from("messages")
        .select("id", { count: "exact" })
        .gte("sent_at", `${today}T00:00:00`)
        .lt("sent_at", `${today}T23:59:59`),
    ])

    const contactsByStatus =
      contactsResult.data?.reduce(
        (acc, contact) => {
          acc[contact.status] = (acc[contact.status] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    return {
      totalContacts: contactsResult.count || 0,
      totalMessages: messagesResult.count || 0,
      todayMessages: todayMessagesResult.count || 0,
      contactsByStatus,
    }
  },
}

export type { Contact, Message }
