# Nexo Automático - Guía de Usuario

## 📋 Índice
1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Dashboard Principal](#dashboard-principal)
4. [Gestión de Contactos](#gestión-de-contactos)
5. [Mensajería](#mensajería)
6. [Chat con Contactos](#chat-con-contactos)
7. [Casos de Uso](#casos-de-uso)
8. [Preguntas Frecuentes](#preguntas-frecuentes)

## 🚀 Introducción

**Nexo Automático** es una plataforma de automatización de mensajería de WhatsApp Business diseñada para TRS Logística. Permite gestionar contactos, enviar mensajes y visualizar conversaciones de manera eficiente y segura.

### ¿Qué puedes hacer con Nexo Automático?
- ✅ Gestionar contactos de WhatsApp Business
- ✅ Enviar mensajes individuales o masivos
- ✅ Visualizar conversaciones en tiempo real
- ✅ Organizar contactos por estados (Interesado, Inscrito, etc.)
- ✅ Monitorear métricas de mensajería
- ✅ Recibir mensajes automáticamente via webhook

## 🔐 Acceso al Sistema

### Proceso de Autenticación

1. **Acceder a la plataforma**: Visita la URL de Nexo Automático
2. **Ingresar email autorizado**: Solo el email configurado puede acceder
3. **Solicitar código**: El sistema enviará un código de 6 dígitos a tu email
4. **Verificar código**: Ingresa el código recibido para autenticarte
5. **Acceso concedido**: Serás redirigido al dashboard principal

### Importante
- ⏰ Los códigos expiran en **10 minutos**
- 📧 Solo el email autorizado puede acceder al sistema
- 🔒 La sesión dura **24 horas** antes de requerir nueva autenticación

## 📊 Dashboard Principal

El dashboard es tu centro de control principal donde puedes ver:

### Métricas en Tiempo Real
- **Total de Contactos**: Número total de contactos registrados
- **Total de Mensajes**: Mensajes enviados y recibidos
- **Mensajes de Hoy**: Actividad del día actual
- **Contactos por Estado**: Distribución de estados de contactos

### Navegación Principal
- **🏠 Dashboard**: Vista general y métricas
- **👥 Contactos**: Gestión completa de contactos
- **💬 Mensajes**: Envío de mensajes y chat
- **⚙️ Configuración**: Ajustes del sistema

## 👥 Gestión de Contactos

### Ver Lista de Contactos

La tabla de contactos muestra:
- **Nombre**: Nombre del contacto
- **Teléfono**: Número de WhatsApp
- **Estado**: Estado actual del contacto
- **Fecha de Creación**: Cuándo se agregó al sistema
- **Acciones**: Opciones disponibles

### Filtrar Contactos

Puedes filtrar contactos por:
- **Estado**: Interesado, Inscrito, Rechazado, Reagendados
- **Búsqueda**: Por nombre o número de teléfono
- **Fecha**: Rango de fechas de creación

### Estados de Contactos

#### 🟠 Interesado
- Contactos que han mostrado interés inicial
- Estado por defecto para nuevos contactos

#### 🟢 Inscrito  
- Contactos que se han inscrito o confirmado
- Clientes activos o confirmados

#### 🔴 Rechazado
- Contactos que han rechazado la oferta
- No están interesados en el servicio

#### 🟣 Reagendados
- Contactos que requieren seguimiento posterior
- Citas o llamadas reagendadas

### Cambiar Estado de Contacto

1. **Localizar contacto** en la tabla
2. **Hacer clic en el estado actual** (aparece como dropdown)
3. **Seleccionar nuevo estado** del menú
4. **Confirmar cambio** - se actualiza automáticamente

### Agregar Nuevo Contacto

Los contactos se agregan automáticamente cuando:
- Envías un mensaje a un número nuevo
- Recibes un mensaje de un número no registrado

## 💬 Mensajería

### Enviar Mensaje Individual

1. **Ir a la sección de mensajes**
2. **Completar el formulario**:
   - **Número de teléfono**: Incluir código de país (ej: +50312345678)
   - **Mensaje**: Texto a enviar
   - **Nombre del contacto** (opcional): Se guardará si es nuevo
3. **Hacer clic en "Enviar Mensaje"**
4. **Confirmación**: Verás un mensaje de éxito o error

### Formato de Números de Teléfono
- ✅ Correcto: `+50312345678`
- ✅ Correcto: `50312345678`
- ❌ Incorrecto: `12345678` (sin código de país)

### Tipos de Mensajes Soportados
- **Texto plano**: Mensajes de texto normales
- **Emojis**: Totalmente soportados 😊
- **Saltos de línea**: Para mensajes largos

## 💬 Chat con Contactos

### Visualizar Conversaciones

1. **Seleccionar contacto** de la tabla
2. **Ver historial completo** de mensajes
3. **Mensajes en tiempo real** - se actualizan automáticamente

### Elementos del Chat
- **Mensajes enviados**: Aparecen a la derecha (azul)
- **Mensajes recibidos**: Aparecen a la izquierda (gris)
- **Timestamp**: Fecha y hora de cada mensaje
- **Estado de entrega**: Indicadores de WhatsApp

### Tipos de Mensajes Recibidos
- **📝 Texto**: Mensajes de texto normales
- **📷 Imagen**: Fotos enviadas por el contacto
- **📄 Documento**: Archivos PDF, Word, etc.
- **🎵 Audio**: Notas de voz
- **🎥 Video**: Videos compartidos
- **📍 Ubicación**: Coordenadas GPS
- **🔘 Botones**: Respuestas de plantillas interactivas

### Actualización Automática
- Los mensajes se actualizan cada **3 segundos**
- No necesitas recargar la página
- Indicador "En vivo" muestra que está activo

## 📋 Casos de Uso

### Caso 1: Campaña de Marketing
1. **Preparar lista de contactos** con números objetivo
2. **Enviar mensaje promocional** a cada contacto
3. **Monitorear respuestas** en tiempo real
4. **Cambiar estados** según respuestas (Interesado/Rechazado)
5. **Hacer seguimiento** a contactos interesados

### Caso 2: Confirmación de Citas
1. **Enviar mensaje de confirmación** a contactos inscritos
2. **Recibir respuestas** automáticamente
3. **Actualizar estados** según confirmación
4. **Reagendar** contactos que no confirman

### Caso 3: Soporte al Cliente
1. **Recibir consultas** via WhatsApp
2. **Ver historial completo** de conversación
3. **Responder consultas** desde la plataforma
4. **Mantener registro** de todas las interacciones

### Caso 4: Seguimiento de Leads
1. **Contactos nuevos** se registran automáticamente
2. **Clasificar por interés** usando estados
3. **Hacer seguimiento personalizado** según estado
4. **Convertir leads** en clientes inscritos

## ❓ Preguntas Frecuentes

### ¿Cómo agrego contactos masivamente?
Actualmente los contactos se agregan automáticamente al enviar mensajes o recibirlos. Para cargas masivas, contacta al administrador técnico.

### ¿Puedo enviar mensajes a múltiples contactos?
Por ahora el envío es individual. La funcionalidad de envío masivo está en desarrollo.

### ¿Los mensajes se guardan permanentemente?
Sí, todos los mensajes se almacenan en la base de datos y están disponibles en el historial.

### ¿Qué pasa si no recibo el código de autenticación?
- Verifica tu bandeja de spam
- Asegúrate de usar el email autorizado
- Espera unos minutos y vuelve a intentar
- Contacta al administrador si persiste el problema

### ¿Puedo cambiar el email autorizado?
Solo el administrador técnico puede cambiar el email autorizado en la configuración del sistema.

### ¿Los contactos pueden ver que uso una plataforma?
No, para los contactos apareces como un usuario normal de WhatsApp Business.

### ¿Qué pasa si WhatsApp cambia su API?
El sistema está diseñado para ser compatible con la API oficial de WhatsApp Business y se actualiza según sea necesario.

### ¿Puedo usar esto en mi teléfono personal?
No, esto funciona con WhatsApp Business API, que es diferente a WhatsApp personal o WhatsApp Business app.

### ¿Los mensajes tienen límites?
Sí, WhatsApp Business API tiene límites de mensajes según tu plan. Consulta con Meta/WhatsApp para detalles específicos.

### ¿Puedo exportar los datos?
Los datos están en Supabase y pueden exportarse. Contacta al administrador técnico para asistencia.

## 🆘 Soporte

### Problemas Técnicos
- **Error de autenticación**: Verificar email y código
- **Mensajes no se envían**: Verificar formato de número
- **Chat no carga**: Refrescar página o contactar soporte

### Contacto de Soporte
Para asistencia técnica o problemas con la plataforma:
- 📧 Contactar al administrador del sistema
- 📋 Proporcionar detalles específicos del problema
- 🕐 Incluir hora y fecha del incidente

---

**Guía de Usuario v1.0**  
*Nexo Automático - TRS Logística*  
*Última actualización: Diciembre 2024*
