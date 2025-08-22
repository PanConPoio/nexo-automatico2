# Integración de Mensajes Salientes

## Problema
Cuando tu página web envía mensajes automáticos de WhatsApp Business, esos contactos no aparecen en Nexo hasta que la persona responde, porque el webhook solo procesa mensajes entrantes.

## Solución
Hemos creado un endpoint `/api/register-outbound-message` que tu página web debe llamar cada vez que envíe un mensaje automático.

## Implementación en tu Página Web

### 1. Llamar al endpoint después de enviar mensaje automático

\`\`\`javascript
// Después de enviar el mensaje automático de WhatsApp
async function registerOutboundMessage(phone, message, contactName = null, contactEmail = null) {
  try {
    const response = await fetch('https://nexo-automatico.vercel.app/api/register-outbound-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: phone,           // Número de teléfono (ej: "50312345678")
        message: message,       // Contenido del mensaje enviado
        contactName: contactName, // Nombre del contacto (opcional)
        contactEmail: contactEmail // Email del contacto (opcional)
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Mensaje registrado en Nexo:', result.contact_id);
    } else {
      console.error('Error registrando mensaje:', result.error);
    }
  } catch (error) {
    console.error('Error llamando a Nexo:', error);
  }
}

// Ejemplo de uso
registerOutboundMessage(
  "50312345678", 
  "¡Hola! Gracias por inscribirte en nuestra capacitación de TRS Logística. Tu cupo ha sido reservado para el día: 2025-08-16",
  "Jeremy Danlevy Guardado Hidalgo",
  "jeremy@example.com"
);
\`\`\`

### 2. Integración con formularios de inscripción

\`\`\`javascript
// En tu formulario de inscripción
document.getElementById('inscripcionForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const phone = formData.get('phone');
  const name = formData.get('name');
  const email = formData.get('email');
  
  // 1. Procesar la inscripción en tu sistema
  const inscripcion = await procesarInscripcion(formData);
  
  // 2. Enviar mensaje automático de WhatsApp
  const mensaje = `¡Hola ${name}! Gracias por inscribirte en nuestra capacitación de TRS Logística. Tu cupo ha sido reservado para el día: ${inscripcion.fecha}`;
  await enviarMensajeWhatsApp(phone, mensaje);
  
  // 3. Registrar en Nexo
  await registerOutboundMessage(phone, mensaje, name, email);
});
\`\`\`

## Beneficios

1. **Visibilidad inmediata**: Los contactos aparecen en Nexo tan pronto como se envía el mensaje automático
2. **Historial completo**: Se mantiene un registro completo de todos los mensajes enviados
3. **Mejor seguimiento**: Puedes ver quién ha recibido mensajes automáticos sin esperar respuestas
4. **Preparado para n8n**: Esta estructura facilita la integración con automatizaciones

## Notas Técnicas

- El endpoint acepta tanto contactos nuevos como existentes
- Si el contacto ya existe, solo se agrega el mensaje
- Los mensajes se marcan como "outbound" y "sent"
- Se genera un ID único para cada mensaje automático
