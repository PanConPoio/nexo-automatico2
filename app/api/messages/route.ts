import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const contactId = searchParams.get("contactId") || undefined
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    let { data, error } = await db.getMessages(contactId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Limitar resultados si se especifica
    if (limit && data) {
      data = data.slice(0, limit)
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
