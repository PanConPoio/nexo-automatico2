import { type NextRequest, NextResponse } from "next/server"
import { generateCode, storeCode, validateCode, isValidAdminEmail, createSessionToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, code, action } = await request.json()

    if (action === "send-code") {
      console.log("Generating code for email:", email)

      if (!email || !isValidAdminEmail(email)) {
        return NextResponse.json({ error: "Email no autorizado" }, { status: 401 })
      }

      const authCode = generateCode()
      await storeCode(email, authCode)

      // In development, return the code to the client for easy testing
      if (process.env.NODE_ENV === "development") {
        console.log(`🔐 Código generado para ${email}: ${authCode}`)
        return NextResponse.json({
          success: true,
          message: "Código generado",
          code: authCode, // Only in development
        })
      }

      return NextResponse.json({
        success: true,
        message: "Código generado",
        code: authCode, // Client will send the email
      })
    }

    if (action === "verify-code") {
      console.log("Verifying code for email:", email)

      if (!email || !code) {
        return NextResponse.json({ error: "Email y código requeridos" }, { status: 400 })
      }

      if (!isValidAdminEmail(email)) {
        return NextResponse.json({ error: "Email no autorizado" }, { status: 401 })
      }

      const isValid = await validateCode(email, code)

      if (!isValid) {
        return NextResponse.json({ error: "Código inválido o expirado" }, { status: 401 })
      }

      // Create session token
      const sessionToken = createSessionToken(email)

      const response = NextResponse.json({
        success: true,
        user: { email },
      })

      // Set HTTP-only cookie with session token
      response.cookies.set("auth-token", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return response
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({ error: "Error de autenticación" }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete("auth-token")
  return response
}
