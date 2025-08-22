import emailjs from "@emailjs/browser"

interface EmailResponse {
  success: boolean
  error?: string
}

export async function sendAuthCode(email: string, code: string): Promise<EmailResponse> {
  try {
    // This function now only works on the client side (browser)
    if (typeof window === "undefined") {
      console.error("sendAuthCode can only be called from the client side")
      return { success: false, error: "Client-side only function" }
    }

    const result = await emailjs.send(
      "service_chc5xns",
      "template_mnzyukr",
      {
        to_email: email,
        code: code,
      },
      "uEiL0Wbz_nYtw7rHc",
    )

    if (result.status !== 200) {
      throw new Error("Error enviando el correo")
    }

    return { success: true }
  } catch (error) {
    console.error("Email sending error:", error)
    return { success: false, error: "Failed to send email" }
  }
}
