import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/supabase/server"

/**
 * Endpoint para registrar mensajes salientes automáticos
 * La página web debe llamar este endpoint cuando envíe mensajes automáticos
 */
export async function POST(request: NextRequest) {
  console.log("=== REGISTER OUTBOUND MESSAGE ===")

  try {
    const body = await request.json()
    console.log("Outbound message data:", JSON.stringify(body, null, 2))

    const { phone, message, contactName, contactEmail } = body

    if (!phone || !message) {
      return NextResponse.json({ error: "Phone and message are required" }, { status: 400 })
    }

    const contactResult = await db.getContacts({ search: phone })
    let contact = contactResult.data?.[0]

    if (!contact) {
      console.log("Creating new contact for outbound message:", phone)
      const newContactResult = await db.createContact({
        phone: phone,
        name: contactName || `Usuario ${phone}`,
        email: contactEmail || null,
        status: "interesado",
      })
      contact = newContactResult.data
      console.log("New contact created:", contact?.id)
    } else {
      console.log("Using existing contact:", contact.id)
    }

    if (contact) {
      const messageResult = await db.createMessage({
        contact_id: contact.id,
        content: message,
        direction: "outbound",
        status: "sent",
        whatsapp_message_id: `auto_${Date.now()}_${contact.id}`,
      })

      console.log("Outbound message registered:", messageResult.data?.id)

      return NextResponse.json(
        {
          success: true,
          contact_id: contact.id,
          message_id: messageResult.data?.id,
        },
        { status: 200 },
      )
    } else {
      return NextResponse.json({ error: "Failed to create or find contact" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error registering outbound message:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
