import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/supabase/client"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    console.log(`Updating contact ${id} with:`, body)

    const { data, error } = await db.updateContact(id, body)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Error updating contact", details: error.message }, { status: 500 })
    }

    console.log("Contact updated successfully:", data)
    return NextResponse.json({ data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
