// Configuración de WhatsApp Business API
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN

export class WhatsAppAPI {
  private baseUrl = "https://graph.facebook.com/v18.0"

  /**
   * Envía un mensaje de texto a través de WhatsApp Business API
   */
  async sendMessage(to: string, message: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/${WHATSAPP_PHONE_ID}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to.replace(/\D/g, ""), // Remover caracteres no numéricos
          type: "text",
          text: {
            body: message,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`WhatsApp API Error: ${error.error?.message || "Unknown error"}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error sending WhatsApp message:", error)
      throw error
    }
  }

  /**
   * Envía un mensaje usando una plantilla aprobada
   */
  async sendTemplate(to: string, templateName: string, parameters?: string[]): Promise<any> {
    try {
      const templateComponents = parameters
        ? [
            {
              type: "body",
              parameters: parameters.map((param) => ({
                type: "text",
                text: param,
              })),
            },
          ]
        : []

      const response = await fetch(`${this.baseUrl}/${WHATSAPP_PHONE_ID}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to.replace(/\D/g, ""),
          type: "template",
          template: {
            name: templateName,
            language: {
              code: "es", // Español
            },
            components: templateComponents,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`WhatsApp API Error: ${error.error?.message || "Unknown error"}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error sending WhatsApp template:", error)
      throw error
    }
  }

  /**
   * Verifica el token del webhook
   */
  static verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
      return challenge
    }
    return null
  }

  /**
   * Procesa mensajes entrantes del webhook
   */
  static processIncomingMessage(body: any) {
    try {
      const entry = body.entry?.[0]
      const changes = entry?.changes?.[0]
      const value = changes?.value

      if (value?.messages) {
        return value.messages.map((message: any) => ({
          id: message.id,
          from: message.from,
          timestamp: message.timestamp,
          type: message.type,
          text: message.text?.body || "",
          contact: value.contacts?.find((c: any) => c.wa_id === message.from),
        }))
      }

      return []
    } catch (error) {
      console.error("Error processing incoming message:", error)
      return []
    }
  }
}

export const whatsappAPI = new WhatsAppAPI()
