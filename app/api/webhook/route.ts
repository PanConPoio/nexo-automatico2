import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/supabase/server"

// Este log se ejecutará cuando la función serverless sea cargada/invocada.
console.log("API Webhook route.ts loaded.")

/**
 * Endpoint GET para verificación del webhook de WhatsApp Business API
 * Meta enviará una solicitud GET con parámetros de verificación
 */
export async function GET(request: NextRequest) {
  console.log("GET /api/webhook handler entered.") // Log al principio del handler
  console.log("GET /api/webhook invoked for verification.") // Log para confirmar que la función GET se ejecuta
  try {
    // Extraer parámetros de la URL
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get("hub.mode")
    const token = searchParams.get("hub.verify_token")
    const challenge = searchParams.get("hub.challenge")

    console.log("Webhook verification attempt:", { mode, token: token ? "***" : null, challenge })

    // Verificar que todos los parámetros estén presentes
    if (!mode || !token || !challenge) {
      console.log("Missing required parameters")
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Verificar el token y el modo
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

    if (!verifyToken) {
      console.error("WHATSAPP_VERIFY_TOKEN not configured")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    if (mode === "subscribe" && token === verifyToken) {
      console.log("Webhook verified successfully")
      // Responder con el challenge para completar la verificación
      return new NextResponse(challenge, { status: 200 })
    } else {
      console.log("Webhook verification failed:", {
        modeMatch: mode === "subscribe",
        tokenMatch: token === verifyToken,
      })
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } catch (error) {
    console.error("Error in webhook verification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * Endpoint POST para recibir mensajes y eventos de WhatsApp Business API
 * Meta enviará notificaciones de mensajes entrantes, estados de entrega, etc.
 */
function extractMessageContent(message: any): string {
  // Handle different message types
  if (message.text?.body) {
    return message.text.body
  }

  // Handle interactive messages (buttons, quick replies)
  if (message.interactive) {
    if (message.interactive.type === "button_reply") {
      return message.interactive.button_reply.title || message.interactive.button_reply.id
    }
    if (message.interactive.type === "list_reply") {
      return message.interactive.list_reply.title || message.interactive.list_reply.id
    }
  }

  // Handle button messages (legacy)
  if (message.button) {
    return message.button.text || message.button.payload
  }

  // Handle other message types
  if (message.image) {
    return "📷 Imagen"
  }
  if (message.document) {
    return "📄 Documento"
  }
  if (message.audio) {
    return "🎵 Audio"
  }
  if (message.video) {
    return "🎥 Video"
  }
  if (message.location) {
    return "📍 Ubicación"
  }

  return "Mensaje no compatible"
}

export async function POST(request: NextRequest) {
  console.log("=== WEBHOOK POST RECEIVED ===")
  console.log("Timestamp:", new Date().toISOString())
  console.log("Content-Type:", request.headers.get("content-type")) // Log content type

  let body: any
  try {
    body = await request.json()
    console.log("Body (parsed JSON):", JSON.stringify(body, null, 2))
  } catch (jsonError) {
    console.error("Error parsing JSON body:", jsonError)
    try {
      const rawBody = await request.text()
      console.error(
        "Raw Body (if JSON parsing failed):",
        rawBody.substring(0, 500) + (rawBody.length > 500 ? "..." : ""),
      )
    } catch (textError) {
      console.error("También falló la lectura del cuerpo como texto:", textError)
    }
    return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 })
  }

  try {
    if (body.entry && body.entry.length > 0) {
      body.entry.forEach((entry: any) => {
        if (entry.changes && entry.changes.length > 0) {
          entry.changes.forEach((change: any) => {
            if (change.value && change.value.messages) {
              change.value.messages.forEach(async (message: any) => {
                const contactResult = await db.getContacts({ search: message.from })
                let contact = contactResult.data?.[0]

                if (!contact) {
                  const newContactResult = await db.createContact({
                    phone: message.from,
                    name: `Usuario ${message.from}`,
                    status: "interesado",
                  })
                  contact = newContactResult.data
                }

                if (contact) {
                  const messageContent = extractMessageContent(message)

                  await db.createMessage({
                    contact_id: contact.id,
                    content: messageContent,
                    direction: "inbound",
                    status: "read",
                    whatsapp_message_id: message.id,
                  })
                }

                console.log("Message received:", {
                  id: message.id,
                  from: message.from,
                  timestamp: message.timestamp,
                  type: message.type,
                  content: extractMessageContent(message),
                  interactive: message.interactive ? JSON.stringify(message.interactive) : null,
                })
              })
            }

            if (change.value && change.value.statuses) {
              change.value.statuses.forEach(async (status: any) => {
                console.log("Status update:", {
                  id: status.id,
                  status: status.status,
                  timestamp: status.timestamp,
                  recipient_id: status.recipient_id,
                })

                if (status.status === "delivered" || status.status === "sent") {
                  const contactResult = await db.getContacts({ search: status.recipient_id })
                  let contact = contactResult.data?.[0]

                  if (!contact) {
                    console.log("Creating contact from status update:", status.recipient_id)
                    const newContactResult = await db.createContact({
                      phone: status.recipient_id,
                      name: `Usuario ${status.recipient_id}`,
                      status: "interesado",
                    })
                    contact = newContactResult.data
                    console.log("Contact created from status:", contact?.id)
                  }
                }
              })
            }
          })
        }
      })
    }

    return NextResponse.json({ message: "EVENT_RECEIVED" }, { status: 200 })
  } catch (error) {
    console.error("Error processing webhook POST (after JSON parsing):", error)
    return NextResponse.json(
      { message: "EVENT_RECEIVED", processing_error: error instanceof Error ? error.message : String(error) },
      { status: 200 },
    )
  } finally {
    console.log("================================")
  }
}

/**
 * Manejar otros métodos HTTP no soportados
 */
export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function PATCH() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
