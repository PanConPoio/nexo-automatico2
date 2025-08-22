"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export default function TestWebhook() {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [verifyToken, setVerifyToken] = useState("")
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testWebhookVerification = async () => {
    if (!webhookUrl || !verifyToken) return

    setLoading(true)
    try {
      const testUrl = `${webhookUrl}?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=test_challenge_123`

      const response = await fetch(testUrl, { method: "GET" })
      const result = await response.text()

      setTestResult({
        status: response.status,
        success: response.status === 200,
        response: result,
        expected: "test_challenge_123",
      })
    } catch (error) {
      setTestResult({
        status: "ERROR",
        success: false,
        response: error instanceof Error ? error.message : "Unknown error",
        expected: "test_challenge_123",
      })
    } finally {
      setLoading(false)
    }
  }

  const testWebhookPost = async () => {
    if (!webhookUrl) return

    setLoading(true)
    try {
      const testPayload = {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "test_entry_id",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    display_phone_number: "1234567890",
                    phone_number_id: "test_phone_id",
                  },
                  messages: [
                    {
                      from: "1234567890",
                      id: "test_message_id",
                      timestamp: Math.floor(Date.now() / 1000).toString(),
                      text: {
                        body: "Test message from webhook tester",
                      },
                      type: "text",
                    },
                  ],
                },
                field: "messages",
              },
            ],
          },
        ],
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPayload),
      })

      const result = await response.json()

      setTestResult({
        status: response.status,
        success: response.status === 200,
        response: JSON.stringify(result, null, 2),
        expected: '{"message": "EVENT_RECEIVED"}',
      })
    } catch (error) {
      setTestResult({
        status: "ERROR",
        success: false,
        response: error instanceof Error ? error.message : "Unknown error",
        expected: '{"message": "EVENT_RECEIVED"}',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Webhook Tester</h1>
          <p className="text-muted-foreground">Prueba tu webhook de WhatsApp Business API</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="webhook-url">URL del Webhook</Label>
              <Input
                id="webhook-url"
                placeholder="https://abc123.ngrok.io/api/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="verify-token">Token de Verificación</Label>
              <Input
                id="verify-token"
                placeholder="mi_token_super_secreto_2024"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={testWebhookVerification} disabled={loading || !webhookUrl || !verifyToken}>
                Probar Verificación (GET)
              </Button>

              <Button onClick={testWebhookPost} disabled={loading || !webhookUrl} variant="outline">
                Probar Mensaje (POST)
              </Button>
            </div>
          </CardContent>
        </Card>

        {testResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Resultado del Test
                <Badge variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? "✅ Éxito" : "❌ Error"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status HTTP</Label>
                <Input value={testResult.status} readOnly />
              </div>

              <div>
                <Label>Respuesta Recibida</Label>
                <Textarea value={testResult.response} readOnly rows={6} className="font-mono text-sm" />
              </div>

              <div>
                <Label>Respuesta Esperada</Label>
                <Textarea value={testResult.expected} readOnly rows={2} className="font-mono text-sm" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
