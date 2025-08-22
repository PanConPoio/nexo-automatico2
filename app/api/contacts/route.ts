import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  console.log("GET /api/contacts handler entered."); // Nuevo log para depuración
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") || undefined
    const search = searchParams.get("search") || undefined

    const { data, error } = await db.getContacts({ status, search })

    if (error) {
      console.error("Error fetching contacts from DB:", error); // Log más específico
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching contacts in route handler:", error) // Log más específico
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, name, status = "interesado" } = body

    if (!phone || !name) {
      return NextResponse.json({ error: "Phone and name are required" }, { status: 400 })
    }

    const { data, error } = await db.createContact({ phone, name, status })

    if (error) {
      console.error("Error creating contact in DB:", error); // Log más específico
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("Error creating contact in route handler:", error) // Log más específico
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
