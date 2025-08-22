const ADMIN_EMAIL = "trslogistic25@gmail.com" // Email autorizado para acceso (corregido)
const CODE_EXPIRY_MINUTES = 10

import { createClient } from "./supabase"

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function storeCode(email: string, code: string): Promise<void> {
  const supabase = createClient()
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000)

  // First, clean up any existing codes for this email
  await supabase.from("auth_codes").delete().eq("email", email)

  // Store the new code
  const { error } = await supabase.from("auth_codes").insert({
    email,
    code,
    expires_at: expiresAt.toISOString(),
  })

  if (error) {
    console.error("Error storing code:", error)
    throw new Error("Failed to store authentication code")
  }

  console.log(`Code stored for email: ${email}, expires at: ${expiresAt.toISOString()}`)
}

export async function validateCode(email: string, code: string): Promise<boolean> {
  const supabase = createClient()

  console.log(`Verifying code for email: ${email}`)

  // Get the code for this email
  const { data, error } = await supabase.from("auth_codes").select("code, expires_at").eq("email", email).maybeSingle()

  if (error) {
    console.error("Error fetching code:", error)
    return false
  }

  if (!data) {
    console.log("No code found for email:", email)
    return false
  }

  // Check if code has expired
  const now = new Date()
  const expiresAt = new Date(data.expires_at)

  if (now > expiresAt) {
    console.log("Code expired for email:", email)
    // Clean up expired code
    await supabase.from("auth_codes").delete().eq("email", email)
    return false
  }

  const isValid = data.code === code

  if (isValid) {
    // Delete the code after successful validation (use only once)
    await supabase.from("auth_codes").delete().eq("email", email)
  }

  console.log("Code validation result:", isValid)
  return isValid
}

export function isValidAdminEmail(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}

export function createSessionToken(email: string): string {
  const payload = {
    email,
    timestamp: Date.now(),
  }
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

export function validateSessionToken(token: string): { email: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString())

    // Check if token is not older than 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    if (payload.timestamp < sevenDaysAgo) {
      return null
    }

    return { email: payload.email }
  } catch {
    return null
  }
}
