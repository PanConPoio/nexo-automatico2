import { NextResponse } from "next/server"
import { db } from "@/lib/supabase/server"

export async function GET() {
  try {
    const stats = await db.getDashboardStats()
    return NextResponse.json({ data: stats })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
