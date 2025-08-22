import { type NextRequest, NextResponse } from "next/server"
import { whatsappAPI } from "@/lib/whatsapp"
import { db } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { contactId, message, phone } = await request.json()

    if (!message || (!contactId && !phone)) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 })
    }

    let targetPhone = phone
    let targetContactId = contactId

    // Si se proporciona contactId, obtener el teléfono
    if (contactId && !phone) {
      const { data: contact, error: contactError } = await db.getContactById(contactId)
      if (contactError) {
        console.error("Error fetching contact by ID:", contactError)
        return NextResponse.json({ error: "Error al buscar contacto por ID" }, { status: 500 })
      }
      if (!contact) {
        return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 })
      }
      targetPhone = contact.phone
      targetContactId = contact.id // Asegurarse de que targetContactId esté establecido
    }

    // Si se proporciona phone pero no contactId, buscar o crear contacto
    if (phone && !contactId) {
      const { data: contacts, error: searchError } = await db.getContacts({ search: phone })
      if (searchError) {
        console.error("Error searching contacts by phone:", searchError)
        return NextResponse.json({ error: "Error al buscar contacto por teléfono" }, { status: 500 })
      }

      if (!contacts || contacts.length === 0) {
        // Crear nuevo contacto
        const { data: newContact, error: createError } = await db.createContact({
          phone: phone,
          name: `Usuario ${phone.slice(-4)}`,
          status: "interesado",
        })
        if (createError) {
          console.error("Error creating new contact:", createError)
          return NextResponse.json({ error: "Error al crear nuevo contacto" }, { status: 500 })
        }
        targetContactId = newContact?.id
        targetPhone = newContact?.phone // Asegurarse de que targetPhone esté establecido
      } else {
        targetContactId = contacts[0].id
        targetPhone = contacts[0].phone // Asegurarse de que targetPhone esté establecido
      }
    }

    // Enviar mensaje por WhatsApp
    const result = await whatsappAPI.sendMessage(targetPhone, message)

    // Asegúrate de que el mensaje saliente se guarde en la base de datos.
    if (targetContactId) {
      const { error: messageCreateError } = await db.createMessage({
        contact_id: targetContactId,
        content: message,
        direction: "outbound",
        status: "sent",
        whatsapp_message_id: result.messages?.[0]?.id,
      })
      if (messageCreateError) {
        console.error("Error saving outbound message:", messageCreateError)
        // No devolvemos un error 500 aquí para no interrumpir el envío de WhatsApp,
        // pero registramos el problema de persistencia.
      }
    }

    return NextResponse.json({
      success: true,
      messageId: result.messages?.[0]?.id,
      data: result,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 },
    )
  }
}
