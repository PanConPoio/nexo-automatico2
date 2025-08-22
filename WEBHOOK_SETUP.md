# Configuración del Webhook de WhatsApp Business API

## 1. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz de tu proyecto:

\`\`\`env
WHATSAPP_VERIFY_TOKEN=mi_token_super_secreto_2024
WHATSAPP_ACCESS_TOKEN=tu_access_token_aqui
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id_aqui
\`\`\`

## 2. Exponer el Endpoint Localmente con ngrok

### Instalar ngrok:
\`\`\`bash
# Opción 1: Descargar desde https://ngrok.com/
# Opción 2: Con npm
npm install -g ngrok

# Opción 3: Con Homebrew (macOS)
brew install ngrok
\`\`\`

### Configurar ngrok (una sola vez):
\`\`\`bash
# Registrarse en https://ngrok.com/ y obtener el authtoken
ngrok config add-authtoken TU_AUTHTOKEN_AQUI
\`\`\`

### Ejecutar tu aplicación Next.js:
\`\`\`bash
npm run dev
# Tu app estará en http://localhost:3000
\`\`\`

### Exponer con ngrok:
\`\`\`bash
# En otra terminal
ngrok http 3000

# Verás algo como:
# Forwarding: https://abc123.ngrok.io -> http://localhost:3000
\`\`\`

### URL del Webhook:
Tu webhook estará disponible en:
\`\`\`
https://abc123.ngrok.io/api/webhook
\`\`\`

## 3. Configurar en Meta for Developers

1. **Ir a Meta for Developers**: https://developers.facebook.com/
2. **Seleccionar tu App** de WhatsApp Business
3. **Ir a WhatsApp > Configuration**
4. **En la sección Webhook**:
   - **Callback URL**: \`https://abc123.ngrok.io/api/webhook\`
   - **Verify Token**: \`mi_token_super_secreto_2024\` (el mismo de tu .env)
   - **Webhook Fields**: Seleccionar \`messages\`

5. **Hacer clic en "Verify and Save"**

## 4. Probar el Webhook

### Verificación (GET):
Meta enviará automáticamente una solicitud GET para verificar tu webhook.

### Mensajes (POST):
Envía un mensaje a tu número de WhatsApp Business para probar.

## 5. Monitorear Logs

En tu terminal de Next.js verás:
\`\`\`
=== WEBHOOK POST RECEIVED ===
Timestamp: 2024-01-15T10:30:00.000Z
Body: {
  "entry": [...],
  "object": "whatsapp_business_account"
}
================================
\`\`\`

## 6. Alternativas a ngrok

### Cloudflare Tunnel (Gratis):
\`\`\`bash
# Instalar cloudflared
# Ejecutar
cloudflared tunnel --url http://localhost:3000
\`\`\`

### LocalTunnel:
\`\`\`bash
npm install -g localtunnel
lt --port 3000 --subdomain mi-webhook-whatsapp
\`\`\`

### Serveo:
\`\`\`bash
ssh -R 80:localhost:3000 serveo.net
\`\`\`

## 7. Para Producción

Cuando despliegues a producción (Vercel, Netlify, etc.), actualiza la URL del webhook en Meta:
\`\`\`
https://tu-dominio.com/api/webhook
\`\`\`

## 8. Troubleshooting

### Error 403 "Forbidden":
- Verificar que \`WHATSAPP_VERIFY_TOKEN\` coincida exactamente
- Revisar que no haya espacios extra en el token

### No recibe mensajes:
- Verificar que el webhook esté suscrito a \`messages\`
- Comprobar que ngrok esté corriendo
- Revisar logs en la consola

### Error de HTTPS:
- ngrok proporciona HTTPS automáticamente
- Meta requiere HTTPS para webhooks
\`\`\`
