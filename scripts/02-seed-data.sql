-- Insertar datos de ejemplo
INSERT INTO contacts (phone, name, status) VALUES
  ('+1234567890', 'Juan Pérez', 'interesado'),
  ('+1234567891', 'María García', 'inscrito'),
  ('+1234567892', 'Carlos López', 'interesado'),
  ('+1234567893', 'Ana Martínez', 'rechazado'),
  ('+1234567894', 'Luis Rodríguez', 'inscrito')
ON CONFLICT (phone) DO NOTHING;

-- Insertar mensajes de ejemplo
INSERT INTO messages (contact_id, content, direction, status) 
SELECT 
  c.id,
  CASE 
    WHEN c.name = 'Juan Pérez' THEN 'Hola, me interesa conocer más sobre sus servicios'
    WHEN c.name = 'María García' THEN 'Gracias por la información, me inscribo'
    ELSE 'Mensaje de prueba'
  END,
  'inbound',
  'read'
FROM contacts c
WHERE c.name IN ('Juan Pérez', 'María García');
