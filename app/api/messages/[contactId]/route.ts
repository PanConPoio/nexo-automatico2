import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { contactId: string } }) {
  try {
    const contactId = params.contactId

    if (!contactId || contactId.trim() === "") {
      return NextResponse.json({ error: "Invalid contact ID" }, { status: 400 })
    }

    const result = await db.getMessages(contactId)

    if (result.error) {
      console.error("Error fetching messages:", result.error)
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }

    return NextResponse.json({ messages: result.data || [] })
  } catch (error) {
    console.error("Error in messages API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
