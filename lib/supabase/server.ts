// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { db as clientDb } from './client'; // Importa el objeto db del cliente

export function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Este error es seguro de ignorar si solo estás configurando cookies en un Server Action o Server Component.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Este error es seguro de ignorar si solo estás configurando cookies en un Server Action o Server Component.
          }
        },
      },
    }
  )
}

// Re-exporta las funciones db para uso en el servidor
export const db = {
  ...clientDb, // Extiende todas las funciones db existentes
};
