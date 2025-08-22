"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { Contact } from "@/lib/supabase/client"

interface StatusSelectProps {
  contact: Contact
  onStatusChange: () => void
}

export function StatusSelect({ contact, onStatusChange }: StatusSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const statusOptions = [
    { value: "interesado", label: "Interesado", color: "text-trs-orange" },
    { value: "inscrito", label: "Inscrito", color: "text-green-600" },
    { value: "rechazado", label: "Rechazado", color: "text-red-600" },
    { value: "reagendados", label: "Reagendados", color: "text-purple-600" },
  ]

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === contact.status) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el estado")
      }

      toast({
        title: "Estado actualizado",
        description: `El contacto ${contact.name} ahora está marcado como ${statusOptions.find((s) => s.value === newStatus)?.label}`,
      })

      onStatusChange()
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del contacto",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const currentStatus = statusOptions.find((s) => s.value === contact.status)

  return (
    <Select value={contact.status} onValueChange={handleStatusChange} disabled={isUpdating}>
      <SelectTrigger className="w-32 h-7 text-xs">
        <SelectValue>
          <span className={`font-medium ${currentStatus?.color}`}>{currentStatus?.label}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className={`font-medium ${option.color}`}>{option.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
