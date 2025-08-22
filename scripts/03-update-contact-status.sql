-- Eliminar la restricción CHECK existente para la columna 'status'
ALTER TABLE contacts
DROP CONSTRAINT IF EXISTS contacts_status_check;

-- Añadir una nueva restricción CHECK con los estados actualizados
ALTER TABLE contacts
ADD CONSTRAINT contacts_status_check CHECK (status IN ('interesado', 'inscrito', 'rechazado', 'reagendados'));

-- Opcional: Si tienes contactos con el estado 'bloqueado' y quieres migrarlos a 'reagendados'
-- UPDATE contacts
-- SET status = 'reagendados'
-- WHERE status = 'bloqueado';

-- Nota: Si ya tienes datos en 'bloqueado' y no los migras,
-- la nueva restricción CHECK podría causar problemas al insertar/actualizar si no se maneja.
-- La línea comentada arriba es para migrar esos datos si es necesario.
