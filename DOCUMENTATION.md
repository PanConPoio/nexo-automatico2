# Documentación Técnica - Nexo Automático

## 📖 Índice

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Sistema de Autenticación](#sistema-de-autenticación)
3. [Base de Datos](#base-de-datos)
4. [API Endpoints](#api-endpoints)
5. [Componentes Frontend](#componentes-frontend)
6. [Integración WhatsApp](#integración-whatsapp)
7. [Configuración de Email](#configuración-de-email)
8. [Despliegue y Producción](#despliegue-y-producción)
9. [Troubleshooting](#troubleshooting)

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Frontend**: Next.js 14 con App Router
- **Backend**: Next.js API Routes (Serverless)
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Sistema personalizado con códigos de email
- **Styling**: Tailwind CSS + shadcn/ui
- **Email Service**: EmailJS

### Flujo de Datos
\`\`\`
Usuario → Autenticación → Dashboard → API Routes → Supabase
                                  ↓
WhatsApp Business API ← Webhook ← Middleware
\`\`\`

## 🔐 Sistema de Autenticación

### Componentes
1. **lib/auth.ts**: Lógica de autenticación y validación
2. **lib/email.ts**: Servicio de envío de códigos
3. **app/api/auth/route.ts**: Endpoints de autenticación
4. **middleware.ts**: Protección de rutas
5. **app/login/page.tsx**: Interfaz de login

### Flujo de Autenticación
\`\`\`
1. Usuario ingresa email → Validación de email autorizado
2. Generación de código de 6 dígitos → Almacenamiento en BD
3. Envío de código por email → EmailJS
4. Usuario ingresa código → Validación y creación de sesión
5. Redirección al dashboard → Cookie de sesión establecida
\`\`\`

### Configuración
\`\`\`typescript
// lib/auth.ts
const ADMIN_EMAIL = "tu-email@dominio.com";
const CODE_EXPIRY_MINUTES = 10;
\`\`\`

## 🗄️ Base de Datos

### Esquema de Tablas

#### contacts
\`\`\`sql
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'activo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### messages
\`\`\`sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER REFERENCES contacts(id),
  phone_number VARCHAR(20) NOT NULL,
  message_text TEXT NOT NULL,
  direction VARCHAR(10) NOT NULL, -- 'inbound' o 'outbound'
  whatsapp_message_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### auth_codes
\`\`\`sql
CREATE TABLE auth_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### Índices y Optimizaciones
\`\`\`sql
-- Índices para mejor rendimiento
CREATE INDEX idx_contacts_phone ON contacts(phone_number);
CREATE INDEX idx_messages_contact_id ON messages(contact_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_auth_codes_email ON auth_codes(email);
CREATE INDEX idx_auth_codes_expires_at ON auth_codes(expires_at);
\`\`\`

## 📡 API Endpoints

### Autenticación

#### POST /api/auth
**Generar código de autenticación**
\`\`\`typescript
// Request
{
  "email": "admin@dominio.com"
}

// Response
{
  "success": true,
  "message": "Código enviado",
  "code": "123456" // Solo en desarrollo
}
\`\`\`

**Verificar código**
\`\`\`typescript
// Request
{
  "email": "admin@dominio.com",
  "code": "123456"
}

// Response
{
  "success": true,
  "message": "Autenticación exitosa"
}
\`\`\`

#### DELETE /api/auth
**Cerrar sesión**
\`\`\`typescript
// Response
{
  "success": true,
  "message": "Sesión cerrada"
}
\`\`\`

### Contactos

#### GET /api/contacts
**Listar contactos con filtros**
\`\`\`typescript
// Query params
?search=nombre&status=activo&page=1&limit=10

// Response
{
  "contacts": [...],
  "total": 50,
  "page": 1,
  "totalPages": 5
}
\`\`\`

#### POST /api/contacts
**Crear nuevo contacto**
\`\`\`typescript
// Request
{
  "phone_number": "+1234567890",
  "name": "Juan Pérez",
  "status": "activo"
}
\`\`\`

### Mensajes

#### POST /api/send-message
**Enviar mensaje**
\`\`\`typescript
// Request
{
  "phone_number": "+1234567890",
  "message": "Hola, este es un mensaje de prueba"
}

// Response
{
  "success": true,
  "message_id": "wamid.xxx"
}
\`\`\`

#### GET /api/messages
**Obtener mensajes**
\`\`\`typescript
// Query params
?contact_id=1&limit=50

// Response
{
  "messages": [
    {
      "id": 1,
      "message_text": "Hola",
      "direction": "outbound",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
\`\`\`

### Webhook

#### GET /api/webhook
**Verificación de webhook**
\`\`\`typescript
// Query params
?hub.mode=subscribe&hub.challenge=xxx&hub.verify_token=xxx

// Response: hub.challenge value
\`\`\`

#### POST /api/webhook
**Recibir mensajes de WhatsApp**
\`\`\`typescript
// WhatsApp webhook payload
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "+1234567890",
          "text": { "body": "Hola" },
          "id": "wamid.xxx"
        }]
      }
    }]
  }]
}
\`\`\`

## 🎨 Componentes Frontend

### Estructura de Componentes
\`\`\`
components/
├── ui/                    # Componentes base (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   ├── table.tsx
│   └── ...
├── contacts-table.tsx     # Tabla de contactos con filtros
├── dashboard-stats.tsx    # Tarjetas de estadísticas
├── send-message-form.tsx  # Formulario de envío
└── chat-view.tsx         # Vista de conversación
\`\`\`

### Componentes Principales

#### ContactsTable
\`\`\`typescript
interface ContactsTableProps {
  contacts: Contact[];
  onStatusChange: (id: number, status: string) => void;
  onViewChat: (contact: Contact) => void;
}
\`\`\`

#### DashboardStats
\`\`\`typescript
interface StatsData {
  totalContacts: number;
  totalMessages: number;
  messagesThisMonth: number;
  activeContacts: number;
}
\`\`\`

#### SendMessageForm
\`\`\`typescript
interface SendMessageFormProps {
  onMessageSent: () => void;
  selectedContact?: Contact;
}
\`\`\`

## 📱 Integración WhatsApp

### Configuración Requerida
1. **Meta for Developers Account**
2. **WhatsApp Business API App**
3. **Phone Number ID**
4. **Access Token**
5. **Verify Token**

### Variables de Entorno
\`\`\`env
WHATSAPP_ACCESS_TOKEN=EAAxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_VERIFY_TOKEN=mi_token_secreto
\`\`\`

### Cliente WhatsApp (lib/whatsapp.ts)
\`\`\`typescript
export async function sendWhatsAppMessage(
  phoneNumber: string, 
  message: string
): Promise<WhatsAppResponse>

export async function getWhatsAppProfile(
  phoneNumber: string
): Promise<ProfileResponse>
\`\`\`

### Webhook Configuration
- **URL**: `https://tu-dominio.com/api/webhook`
- **Verify Token**: Valor de `WHATSAPP_VERIFY_TOKEN`
- **Subscribed Fields**: `messages`

## 📧 Configuración de Email

### EmailJS Setup
1. Crear cuenta en [EmailJS](https://www.emailjs.com/)
2. Configurar servicio de email (Gmail, Outlook, etc.)
3. Crear template para códigos de autenticación
4. Obtener credenciales

### Template de Email
\`\`\`html
<!-- EmailJS Template -->
Hola,

Tu código de acceso a Nexo Automático es: {{code}}

Este código expira en 10 minutos.

Saludos,
Equipo TRS Logística
\`\`\`

### Configuración en Código
\`\`\`typescript
// lib/email.ts
const result = await emailjs.send(
  "service_id",      // Tu Service ID
  "template_id",     // Tu Template ID
  {
    to_email: email,
    code: code,
  },
  "public_key"       // Tu Public Key
);
\`\`\`

## 🚀 Despliegue y Producción

### Vercel Deployment
1. **Conectar Repositorio**
2. **Configurar Variables de Entorno**
3. **Deploy Automático**

### Variables de Entorno en Producción
\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx

# WhatsApp
WHATSAPP_ACCESS_TOKEN=EAAxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_VERIFY_TOKEN=mi_token_secreto
\`\`\`

### Configuración Post-Deploy
1. **Actualizar Webhook URL** en Meta for Developers
2. **Verificar Variables de Entorno**
3. **Probar Autenticación**
4. **Verificar Webhook**

### Monitoreo
- **Vercel Analytics**: Métricas de rendimiento
- **Vercel Logs**: Debugging y errores
- **Supabase Dashboard**: Métricas de base de datos

## 🔧 Troubleshooting

### Problemas Comunes

#### Autenticación
**Error**: "No code found for email"
- **Causa**: Códigos no se almacenan correctamente
- **Solución**: Verificar conexión a Supabase y tabla `auth_codes`

**Error**: "Email sending error: location is not defined"
- **Causa**: EmailJS ejecutándose en servidor
- **Solución**: Mover EmailJS al cliente (ya implementado)

#### Webhook
**Error**: "405 Method Not Allowed"
- **Causa**: Middleware interceptando webhook
- **Solución**: Excluir `/api/webhook` del matcher en middleware

**Error**: "Failed to validate callback URL"
- **Causa**: URL de webhook incorrecta o inaccesible
- **Solución**: Verificar URL y que esté desplegada

#### Base de Datos
**Error**: "relation does not exist"
- **Causa**: Tablas no creadas
- **Solución**: Ejecutar scripts SQL en orden correcto

### Logs Útiles
\`\`\`typescript
// Habilitar logs detallados
console.log('Auth attempt for:', email);
console.log('Code stored:', code);
console.log('Webhook received:', JSON.stringify(body));
\`\`\`

### Comandos de Mantenimiento
\`\`\`sql
-- Limpiar códigos expirados
DELETE FROM auth_codes WHERE expires_at < NOW();

-- Estadísticas de mensajes
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_messages,
  COUNT(CASE WHEN direction = 'inbound' THEN 1 END) as inbound,
  COUNT(CASE WHEN direction = 'outbound' THEN 1 END) as outbound
FROM messages 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
\`\`\`

---

**Documentación actualizada**: Enero 2024  
**Versión del sistema**: 1.0.0  
**Desarrollado para**: TRS Logística
