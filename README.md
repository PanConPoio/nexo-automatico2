# Nexo Automático - WhatsApp Business Automation Platform

Una plataforma completa de automatización de mensajería usando la API oficial de WhatsApp Business (WABA) con autenticación segura por código de email.

## 🚀 Características

- **Dashboard Intuitivo**: Métricas en tiempo real de mensajes y contactos
- **Gestión de Contactos**: CRUD completo con filtros y búsqueda avanzada
- **Mensajería Automática**: Envío de mensajes manuales y automáticos
- **Webhook Integration**: Recepción de mensajes entrantes de WhatsApp
- **Autenticación Segura**: Sistema de autenticación por código de email
- **Chat Visualization**: Vista de conversaciones con contactos
- **API Serverless**: Endpoints optimizados para escalabilidad
- **Base de Datos**: Integración con Supabase para persistencia
- **Diseño Modular**: Preparado para integraciones futuras

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes (Serverless)
- **Base de Datos**: Supabase (PostgreSQL)
- **API Externa**: WhatsApp Business API (Meta)
- **Email Service**: EmailJS para autenticación
- **Autenticación**: Sistema personalizado con códigos temporales

## 📋 Requisitos Previos

1. **WhatsApp Business API**: 
   - Cuenta de Meta for Developers
   - App configurada con WhatsApp Business API
   - Token de acceso y Phone Number ID

2. **Supabase**:
   - Proyecto creado en Supabase
   - URL y clave anónima del proyecto

3. **EmailJS** (para autenticación):
   - Cuenta en EmailJS
   - Service ID, Template ID y Public Key configurados

## 🔧 Instalación

1. **Clonar el repositorio**:
\`\`\`bash
git clone <repository-url>
cd nexo-automatico
\`\`\`

2. **Instalar dependencias**:
\`\`\`bash
npm install
\`\`\`

3. **Configurar variables de entorno**:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Completar las variables en `.env.local`:
\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=tu_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
WHATSAPP_VERIFY_TOKEN=tu_verify_token
\`\`\`

4. **Configurar base de datos**:
   - Ejecutar los scripts SQL en Supabase en orden:
     - `scripts/01-create-tables.sql`
     - `scripts/02-seed-data.sql`
     - `scripts/03-create-auth-codes-table.sql`

5. **Configurar EmailJS**:
   - Crear cuenta en [EmailJS](https://www.emailjs.com/)
   - Configurar servicio de email
   - Crear template para códigos de autenticación
   - Actualizar credenciales en `lib/email.ts`

6. **Ejecutar en desarrollo**:
\`\`\`bash
npm run dev
\`\`\`

## 🔐 Sistema de Autenticación

El sistema utiliza autenticación por código de email para mayor seguridad:

1. **Email Autorizado**: Solo el email configurado en `lib/auth.ts` puede acceder
2. **Código Temporal**: Se genera un código de 6 dígitos válido por 10 minutos
3. **Envío por Email**: El código se envía automáticamente via EmailJS
4. **Sesión Segura**: Una vez autenticado, se mantiene la sesión con cookies

### Configurar Email Autorizado
Editar `lib/auth.ts` y cambiar:
\`\`\`typescript
const ADMIN_EMAIL = "tu-email@dominio.com";
\`\`\`

## 🔗 Configuración de WhatsApp Webhook

1. **URL del Webhook**: `https://tu-dominio.com/api/webhook`
2. **Token de Verificación**: El valor de `WHATSAPP_VERIFY_TOKEN`
3. **Eventos a Suscribir**: `messages`

Ver `WEBHOOK_SETUP.md` para instrucciones detalladas.

## 📡 API Endpoints

### Autenticación
- `POST /api/auth` - Generar/verificar código de autenticación
- `DELETE /api/auth` - Cerrar sesión

### Webhook
- `GET /api/webhook` - Verificación del webhook
- `POST /api/webhook` - Recepción de mensajes

### Mensajes
- `POST /api/send-message` - Enviar mensaje
- `GET /api/messages` - Obtener historial de mensajes

### Contactos
- `GET /api/contacts` - Listar contactos (con filtros)
- `POST /api/contacts` - Crear nuevo contacto

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas del dashboard

## 🏗️ Estructura del Proyecto

\`\`\`
nexo-automatico/
├── app/
│   ├── api/                 # API Routes serverless
│   │   ├── auth/           # Autenticación
│   │   ├── webhook/        # WhatsApp webhook
│   │   ├── send-message/   # Envío de mensajes
│   │   └── contacts/       # Gestión de contactos
│   ├── login/              # Página de autenticación
│   ├── page.tsx            # Dashboard principal
│   └── layout.tsx          # Layout base
├── components/             # Componentes React
│   ├── ui/                # Componentes base (shadcn/ui)
│   ├── contacts-table.tsx # Tabla de contactos
│   ├── dashboard-stats.tsx# Estadísticas
│   └── send-message-form.tsx # Formulario de mensajes
├── lib/                   # Utilidades y configuración
│   ├── auth.ts           # Sistema de autenticación
│   ├── email.ts          # Servicio de email
│   ├── supabase.ts       # Cliente de Supabase
│   └── whatsapp.ts       # Cliente de WhatsApp
├── scripts/               # Scripts SQL para base de datos
├── middleware.ts          # Middleware de autenticación
└── README.md
\`\`\`

## 🔄 Flujo de Trabajo

### Autenticación
1. Usuario ingresa email autorizado
2. Sistema genera código de 6 dígitos
3. Código se envía por email via EmailJS
4. Usuario ingresa código para autenticarse
5. Sistema establece sesión segura

### Mensajería
1. **Mensajes Entrantes**: WhatsApp → Webhook → Base de Datos → Dashboard
2. **Mensajes Salientes**: Dashboard → API → WhatsApp Business API → Contacto
3. **Gestión de Contactos**: CRUD completo desde la interfaz
4. **Monitoreo**: Dashboard con métricas en tiempo real

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno en Vercel
3. Desplegar automáticamente
4. Configurar webhook de WhatsApp con la URL de producción

### Variables de Entorno en Producción
Asegúrate de configurar todas las variables de entorno en tu plataforma de despliegue:
- Variables de Supabase
- Variables de WhatsApp Business API
- Configuración de EmailJS (si aplica)

## 🔧 Mantenimiento

### Limpieza de Códigos Expirados
Los códigos de autenticación se limpian automáticamente después de 10 minutos. Para limpieza manual:
\`\`\`sql
DELETE FROM auth_codes WHERE expires_at < NOW();
\`\`\`

### Monitoreo de Logs
- Revisar logs de Vercel para errores de API
- Monitorear webhook de WhatsApp
- Verificar métricas de autenticación

## 🔮 Roadmap

- [x] Sistema de autenticación por email
- [x] Chat visualization con contactos
- [x] Gestión completa de contactos
- [ ] Integración con n8n para flujos avanzados
- [ ] Plantillas de mensajes personalizables
- [ ] Análisis y reportes avanzados
- [ ] Integración con CRM externos
- [ ] Soporte para mensajes multimedia
- [ ] Sistema de etiquetas para contactos
- [ ] Notificaciones push en tiempo real

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte y preguntas:
- Crear un issue en GitHub
- Revisar la documentación de WhatsApp Business API
- Consultar la documentación de Supabase
- Verificar configuración de EmailJS

---

**Desarrollado con ❤️ para TRS Logística**
