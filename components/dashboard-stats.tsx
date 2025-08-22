"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Users, TrendingUp, Clock } from 'lucide-react'

interface DashboardStats {
  totalContacts: number
  totalMessages: number
  todayMessages: number
  contactsByStatus: Record<string, number>
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      const { data } = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
              <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded w-16 mb-1"></div>
              <div className="h-3 bg-muted animate-pulse rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const statusLabels = {
    interesado: "Interesados",
    inscrito: "Inscritos",
    rechazado: "Rechazados",
    reagendados: "Reagendados", // Nuevo estado
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-l-4 border-l-trs-orange bg-gradient-to-r from-trs-orange/5 to-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-trs-blue-indigo">Total Contactos</CardTitle>
          <Users className="h-4 w-4 text-trs-orange" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-trs-blue-indigo">{stats.totalContacts}</div>
          <p className="text-xs text-muted-foreground">{stats.contactsByStatus.interesado || 0} interesados</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-trs-blue-indigo bg-gradient-to-r from-trs-blue-light/50 to-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-trs-blue-indigo">Mensajes Hoy</CardTitle>
          <Clock className="h-4 w-4 text-trs-blue-indigo" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-trs-blue-indigo">{stats.todayMessages}</div>
          <p className="text-xs text-muted-foreground">Enviados en las últimas 24h</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-trs-blue-pantone bg-gradient-to-r from-trs-blue-pantone/5 to-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-trs-blue-indigo">Total Mensajes</CardTitle>
          <MessageSquare className="h-4 w-4 text-trs-blue-pantone" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-trs-blue-indigo">{stats.totalMessages}</div>
          <p className="text-xs text-muted-foreground">Historial completo</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-trs-blue-indigo">Inscritos</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-trs-blue-indigo">{stats.contactsByStatus.inscrito || 0}</div>
          <p className="text-xs text-muted-foreground">Contactos convertidos</p>
        </CardContent>
      </Card>
    </div>
  )
}
