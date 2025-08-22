"use client"

import { useEffect, useState } from "react"
import type { Contact } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MessageSquare, Phone, Filter, Settings } from "lucide-react"
import { SendMessageDialog } from "./send-message-dialog"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ChatView } from "./chat-view"
import { StatusSelect } from "./status-select"
import { useToast } from "@/hooks/use-toast"

export function ContactsTable() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [showChatDialog, setShowChatDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchContacts()

    const interval = setInterval(() => {
      fetchContacts()
    }, 5000)

    return () => clearInterval(interval)
  }, [search, statusFilter])

  const fetchContacts = async () => {
    try {
      if (contacts.length === 0) {
        setLoading(true)
      }

      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/contacts?${params}`)

      const clonedResponse = response.clone()

      if (!response.ok) {
        const errorBody = await clonedResponse.text()
        console.error("API Error Response Body (not OK):", errorBody)
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorBody || "No message provided"}`)
      }

      const responseText = await clonedResponse.text()
      console.log("Raw API Response Text (OK status):", responseText)

      let parsedData
      try {
        parsedData = JSON.parse(responseText)
      } catch (jsonError) {
        console.error("Failed to parse JSON from response text:", jsonError)
        throw new Error(
          `Invalid JSON response from server: ${responseText.substring(0, 200)}... (Error: ${jsonError instanceof Error ? jsonError.message : String(jsonError)})`,
        )
      }

      if (typeof parsedData !== "object" || parsedData === null || !("data" in parsedData)) {
        throw new Error("API response missing 'data' property or is not an object.")
      }

      const { data } = parsedData
      setContacts(data || [])
    } catch (error) {
      console.error("Error fetching contacts:", error)
      if (contacts.length === 0) {
        toast({
          title: "Error al cargar contactos",
          description: error instanceof Error ? error.message : "Ocurrió un error desconocido.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = (contact: Contact) => {
    setSelectedContact(contact)
    setShowSendDialog(true)
  }

  const handleViewChat = (contact: Contact) => {
    setSelectedContact(contact)
    setShowChatDialog(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Gestión de Contactos
          <span className="ml-auto flex items-center gap-1 text-xs text-green-600">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            Actualizando automáticamente
          </span>
        </CardTitle>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="interesado">Interesados</SelectItem>
              <SelectItem value="inscrito">Inscritos</SelectItem>
              <SelectItem value="rechazado">Rechazados</SelectItem>
              <SelectItem value="reagendados">Reagendados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-muted animate-pulse rounded w-32"></div>
                <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
                <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
                <div className="h-4 bg-muted animate-pulse rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Estado
                  </TableHead>
                  <TableHead>Fecha Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No se encontraron contactos
                    </TableCell>
                  </TableRow>
                ) : (
                  contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>
                        <StatusSelect contact={contact} onStatusChange={fetchContacts} />
                      </TableCell>
                      <TableCell>{formatDate(contact.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewChat(contact)}
                            className="gap-2 border-trs-blue-indigo text-trs-blue-indigo hover:bg-trs-blue-indigo hover:text-white"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Chat
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendMessage(contact)}
                            className="gap-2 border-trs-orange text-trs-orange hover:bg-trs-orange hover:text-white"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Enviar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <SendMessageDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        contact={selectedContact}
        onMessageSent={fetchContacts}
      />

      <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
        <DialogContent className="sm:max-w-2xl p-0">
          {selectedContact && <ChatView contact={selectedContact} onMessageSent={fetchContacts} />}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
