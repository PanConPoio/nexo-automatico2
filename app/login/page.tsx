"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, Shield } from "lucide-react"
import { sendAuthCode } from "@/lib/email"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"email" | "code">("email")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSendCode = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, action: "send-code" }),
      })

      const data = await response.json()

      if (response.ok) {
        const emailResult = await sendAuthCode(email, data.code)

        if (emailResult.success) {
          toast({
            title: "Código enviado",
            description: "Revisa tu email para obtener el código de acceso.",
          })
          setStep("code")
        } else {
          toast({
            title: "Error enviando email",
            description: "No se pudo enviar el código por email.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Error generando código",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Send code error:", error)
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al enviar el código.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code, action: "verify-code" }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Acceso autorizado",
          description: "Redirigiendo al dashboard...",
        })
        router.push("/")
      } else {
        toast({
          title: "Código inválido",
          description: data.error || "El código es incorrecto o ha expirado",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Verify code error:", error)
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al verificar el código.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetToEmail = () => {
    setStep("email")
    setCode("")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-trs-light p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-trs-blue-indigo flex items-center justify-center gap-2">
            {step === "email" ? <Mail className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
            Acceso a Nexo Automático
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <Label htmlFor="email">Email autorizado</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ingresa el email autorizado"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full bg-trs-orange hover:bg-trs-orange/90" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Enviar código de acceso
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <Label htmlFor="code">Código de 6 dígitos</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  disabled={loading}
                  className="text-center text-2xl tracking-widest"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Código enviado a: <strong>{email}</strong>
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-trs-orange hover:bg-trs-orange/90"
                disabled={loading || code.length !== 6}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                Verificar código
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={resetToEmail}
                disabled={loading}
              >
                Cambiar email
              </Button>
            </form>
          )}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {step === "email" ? (
              <>
                Email autorizado: <strong>example5@gmail.com</strong>
              </>
            ) : (
              <>El código expira en 10 minutos</>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
