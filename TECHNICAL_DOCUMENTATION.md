# Nexo Automático - Documentación Técnica

## 📋 Índice
1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Base de Datos](#base-de-datos)
3. [API Endpoints](#api-endpoints)
4. [Sistema de Autenticación](#sistema-de-autenticación)
5. [Integración WhatsApp](#integración-whatsapp)
6. [Componentes Frontend](#componentes-frontend)
7. [Configuración y Despliegue](#configuración-y-despliegue)
8. [Troubleshooting](#troubleshooting)

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes (Serverless)
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Sistema personalizado con códigos temporales
- **Email Service**: EmailJS
- **External API**: WhatsApp Business API (Meta)

### Flujo de Datos
\`\`\`
WhatsApp Business API ↔ Webhook ↔ Supabase ↔ Next.js API ↔ React Frontend
                                      ↕
                                  EmailJS (Auth)
\`\`\`

### Estructura de Directorios
\`\`\`
nexo-automatico/
├── app/
│   ├── api/                    # Serverless API Routes
│   │   ├── auth/route.ts      # Autenticación por email
│   │   ├── webhook/route.ts   # WhatsApp webhook
│   │   ├── send-message/route.ts # Envío de mensajes
│   │   ├── contacts/route.ts  # CRUD contactos
│   │   ├── contacts/[id]/route.ts # Actualizar contacto
│   │   ├── messages/[contactId]/route.ts # Mensajes por contacto
│   │   └── dashboard/stats/route.ts # Estadísticas
│   ├── login/page.tsx         # Página de autenticación
│   ├── page.tsx              # Dashboard principal
│   ├── layout.tsx            # Layout base
│   └── globals.css           # Estilos globales
├── components/
│   ├── ui/                   # Componentes base (shadcn/ui)
│   ├── contacts-table.tsx    # Tabla de contactos con filtros
│   ├── chat-view.tsx         # Vista de chat con contacto
│   ├── dashboard-stats.tsx   # Métricas del dashboard
│   ├── send-message-form.tsx # Formulario de envío
│   └── status-select.tsx     # Selector de estados
├── lib/
│   ├── auth.ts              # Lógica de autenticación
│   ├── email.ts             # Servicio de email (EmailJS)
│   ├── whatsapp.ts          # Cliente WhatsApp Business API
│   └── supabase/
│       ├── client.ts        # Cliente Supabase (browser)
│       ├── server.ts        # Cliente Supabase (server)
│       └── types.ts         # Tipos TypeScript
├── scripts/                 # Scripts SQL para base de datos
├── middleware.ts           # Middleware de autenticación
└── next.config.mjs        # Configuración Next.js
\`\`\`

## 🗄️ Base de Datos

### Esquema de Tablas

#### `contacts`
\`\`\`sql
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'interesado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### `messages`
\`\`\`sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER REFERENCES contacts(id),
  content TEXT NOT NULL,
  direction VARCHAR(10) NOT NULL, -- 'inbound' | 'outbound'
  whatsapp_message_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### `auth_codes`
\`\`\`sql
CREATE TABLE auth_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### Funciones de Base de Datos

#### Contactos
- `getContacts(filters?)`: Obtener contactos con filtros opcionales
- `createContact(data)`: Crear nuevo contacto
- `updateContact(id, data)`: Actualizar contacto existente
- `getContactByPhone(phone)`: Buscar contacto por teléfono

#### Mensajes
- `getMessages(contactId?)`: Obtener mensajes (todos o por contacto)
- `createMessage(data)`: Crear nuevo mensaje
- `getMessageStats()`: Estadísticas de mensajes

## 🔌 API Endpoints

### Autenticación (`/api/auth`)

#### POST - Generar/Verificar Código
\`\`\`typescript
// Generar código
POST /api/auth
Body: { email: string, action: "generate" }
Response: { success: boolean, message: string }

// Verificar código
POST /api/auth  
Body: { email: string, code: string, action: "verify" }
Response: { success: boolean, message: string }
\`\`\`

#### DELETE - Cerrar Sesión
\`\`\`typescript
DELETE /api/auth
Response: { success: boolean }
\`\`\`

### Webhook WhatsApp (`/api/webhook`)

#### GET - Verificación
\`\`\`typescript
GET /api/webhook?hub.mode=subscribe&hub.challenge=CHALLENGE&hub.verify_token=TOKEN
Response: CHALLENGE (string)
\`\`\`

#### POST - Recibir Mensajes
\`\`\`typescript
POST /api/webhook
Body: WhatsAppWebhookPayload
Response: { success: boolean }
\`\`\`

### Mensajes (`/api/send-message`, `/api/messages`)

#### POST - Enviar Mensaje
\`\`\`typescript
POST /api/send-message
Body: {
  phoneNumber: string,
  message: string,
  contactName?: string
}
Response: { success: boolean, messageId?: string }
\`\`\`

#### GET - Obtener Mensajes por Contacto
\`\`\`typescript
GET /api/messages/[contactId]
Response: { messages: Message[] }
\`\`\`

### Contactos (`/api/contacts`)

#### GET - Listar Contactos
\`\`\`typescript
GET /api/contacts?status=string&search=string&page=number&limit=number
Response: { contacts: Contact[], total: number }
\`\`\`

#### POST - Crear Contacto
\`\`\`typescript
POST /api/contacts
Body: { phone_number: string, name?: string, status?: string }
Response: { success: boolean, contact: Contact }
\`\`\`

#### PUT - Actualizar Contacto
\`\`\`typescript
PUT /api/contacts/[id]
Body: { name?: string, status?: string }
Response: { success: boolean, contact: Contact }
\`\`\`

### Dashboard (`/api/dashboard/stats`)

#### GET - Estadísticas
\`\`\`typescript
GET /api/dashboard/stats
Response: {
  totalContacts: number,
  totalMessages: number,
  todayMessages: number,
  contactsByStatus: { [status: string]: number }
}
\`\`\`

## 🔐 Sistema de Autenticación

### Flujo de Autenticación
1. **Validación de Email**: Solo emails autorizados pueden acceder
2. **Generación de Código**: Código de 6 dígitos válido por 10 minutos
3. **Envío por Email**: EmailJS envía el código al usuario
4. **Verificación**: Usuario ingresa código para autenticarse
5. **Sesión**: Cookie segura con duración de 24 horas

### Configuración
\`\`\`typescript
// lib/auth.ts
const ADMIN_EMAIL = "admin@trslogistica.com"; // Email autorizado
const CODE_EXPIRY_MINUTES = 10; // Duración del código
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas
\`\`\`

### Middleware de Protección
\`\`\`typescript
// middleware.ts
export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|api/webhook|api/auth).*)',
}
\`\`\`

## 📱 Integración WhatsApp

### Configuración Requerida
\`\`\`env
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_VERIFY_TOKEN=mi_token_secreto
\`\`\`

### Webhook Configuration
- **URL**: `https://tu-dominio.com/api/webhook`
- **Verify Token**: Valor de `WHATSAPP_VERIFY_TOKEN`
- **Subscribed Fields**: `messages`

### Tipos de Mensajes Soportados
- **Texto**: Mensajes de texto plano
- **Interactivos**: Botones de plantillas, quick replies
- **Media**: Imágenes, documentos, audio, video
- **Ubicación**: Coordenadas GPS

### Procesamiento de Mensajes
\`\`\`typescript
// Extracción de contenido por tipo
function extractMessageContent(message: any): string {
  if (message.text?.body) return message.text.body;
  if (message.interactive?.button_reply?.title) return message.interactive.button_reply.title;
  if (message.interactive?.list_reply?.title) return message.interactive.list_reply.title;
  if (message.image) return "📷 Imagen";
  if (message.document) return "📄 Documento";
  if (message.audio) return "🎵 Audio";
  if (message.video) return "🎥 Video";
  if (message.location) return "📍 Ubicación";
  return "Mensaje no soportado";
}
\`\`\`

## 🎨 Componentes Frontend

### Componentes Principales

#### `ContactsTable`
- **Funcionalidad**: CRUD completo de contactos
- **Features**: Filtros, búsqueda, paginación, cambio de estado
- **Actualización**: Polling cada 5 segundos

#### `ChatView`
- **Funcionalidad**: Visualización de conversaciones
- **Features**: Mensajes en tiempo real, scroll automático
- **Actualización**: Polling cada 3 segundos

#### `DashboardStats`
- **Funcionalidad**: Métricas y estadísticas
- **Features**: Contadores, gráficos, estados de contactos

#### `SendMessageForm`
- **Funcionalidad**: Envío manual de mensajes
- **Features**: Validación, autocompletado de contactos

#### `StatusSelect`
- **Funcionalidad**: Cambio de estado de contactos
- **Features**: Dropdown interactivo, colores distintivos

### Estados de Contactos
\`\`\`typescript
const CONTACT_STATUSES = {
  interesado: { label: "Interesado", color: "bg-orange-100 text-orange-800" },
  inscrito: { label: "Inscrito", color: "bg-green-100 text-green-800" },
  rechazado: { label: "Rechazado", color: "bg-red-100 text-red-800" },
  reagendados: { label: "Reagendados", color: "bg-purple-100 text-purple-800" }
};
\`\`\`

### Actualizaciones en Tiempo Real
- **Mensajes**: Polling cada 3 segundos
- **Contactos**: Polling cada 5 segundos
- **Indicadores visuales**: "En vivo" badges

## ⚙️ Configuración y Despliegue

### Variables de Entorno
\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_VERIFY_TOKEN=mi_token_secreto
\`\`\`

### Despliegue en Vercel
1. **Conectar repositorio** a Vercel
2. **Configurar variables de entorno** en dashboard de Vercel
3. **Desplegar automáticamente** con cada push
4. **Configurar webhook** de WhatsApp con URL de producción

### Scripts de Base de Datos
Ejecutar en orden:
1. `scripts/01-create-tables.sql` - Crear tablas principales
2. `scripts/02-seed-data.sql` - Datos de prueba
3. `scripts/03-create-auth-codes-table.sql` - Tabla de autenticación

### Configuración EmailJS
\`\`\`typescript
// lib/email.ts
const EMAILJS_CONFIG = {
  serviceId: "service_xxx",
  templateId: "template_xxx", 
  publicKey: "xxx"
};
\`\`\`

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Webhook no recibe mensajes
- **Verificar URL**: Debe ser HTTPS y accesible públicamente
- **Verificar Token**: `WHATSAPP_VERIFY_TOKEN` debe coincidir
- **Revisar logs**: Verificar errores en Vercel Functions

#### 2. Autenticación falla
- **Email autorizado**: Verificar `ADMIN_EMAIL` en `lib/auth.ts`
- **EmailJS**: Verificar configuración de servicio y template
- **Códigos expirados**: Limpiar tabla `auth_codes`

#### 3. Mensajes no se envían
- **Token de acceso**: Verificar `WHATSAPP_ACCESS_TOKEN`
- **Phone Number ID**: Verificar `WHATSAPP_PHONE_NUMBER_ID`
- **Formato de teléfono**: Debe incluir código de país

#### 4. Base de datos no conecta
- **URL de Supabase**: Verificar `NEXT_PUBLIC_SUPABASE_URL`
- **Clave anónima**: Verificar `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Scripts SQL**: Ejecutar en orden correcto

### Logs y Monitoreo
- **Vercel Functions**: Dashboard de Vercel > Functions > Logs
- **Supabase**: Dashboard de Supabase > Logs
- **WhatsApp**: Meta for Developers > Webhooks

### Comandos Útiles
\`\`\`bash
# Desarrollo local
npm run dev

# Build de producción
npm run build

# Linting
npm run lint

# Limpieza de códigos expirados
# Ejecutar en Supabase SQL Editor
DELETE FROM auth_codes WHERE expires_at < NOW();
\`\`\`

---

**Documentación Técnica v1.0**  
*Última actualización: Diciembre 2024*
