interface StatusIndicatorProps {
  status: "online" | "offline" | "connecting"
  label?: string
}

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const statusConfig = {
    online: { color: "bg-green-500", text: "En línea" },
    offline: { color: "bg-red-500", text: "Desconectado" },
    connecting: { color: "bg-trs-orange animate-pulse", text: "Conectando..." },
  }

  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${config.color}`} />
      <span className="text-xs text-muted-foreground">{label || config.text}</span>
    </div>
  )
}
