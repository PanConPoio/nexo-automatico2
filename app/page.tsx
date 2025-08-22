import { DashboardStats } from "@/components/dashboard-stats"
import { ContactsTable } from "@/components/contacts-table"
import { RecentMessages } from "@/components/recent-messages"

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-6 p-6 animate-fade-in">
      {/* Header con gradiente TRS */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-trs p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight">Nexo Automático</h1>
          <p className="mt-2 text-lg text-white/90">Plataforma de automatización de mensajería WhatsApp Business</p>
          <p className="mt-1 text-sm text-white/70">TRS Logística - Panel de Control</p>
        </div>

        {/* Elementos decorativos */}
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
        <div className="absolute -right-8 top-8 h-16 w-16 rounded-full bg-white/5" />
        <div className="absolute right-4 -bottom-2 h-20 w-20 rounded-full bg-white/10" />
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contacts Table - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ContactsTable />
        </div>

        {/* Recent Messages - Takes 1 column */}
        <div className="lg:col-span-1">
          <RecentMessages />
        </div>
      </div>
    </div>
  )
}
