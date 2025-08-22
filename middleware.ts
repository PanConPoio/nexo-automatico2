import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { validateSessionToken } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  console.log(`[${new Date().toISOString()}] Middleware START for ${request.nextUrl.pathname}`)

  // Log de todas las solicitudes al webhook para debugging
  if (request.nextUrl.pathname.startsWith("/api/webhook")) {
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.nextUrl.pathname} - Webhook path`)
    const response = NextResponse.next()
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type")
    return response
  }

  // --- Autenticación para rutas protegidas ---
  const { pathname } = request.nextUrl
  const protectedRoutes = ["/", "/contacts", "/dashboard", "/messages"]

  let isAuthenticated = false

  // Check for auth token in cookies
  const authToken = request.cookies.get("auth-token")?.value

  if (authToken) {
    try {
      const session = validateSessionToken(authToken)
      isAuthenticated = !!session
      console.log(`[${new Date().toISOString()}] User authenticated: ${isAuthenticated}`)
    } catch (error) {
      console.error("Auth validation error:", error)
    }
  }

  // Si el usuario NO está autenticado y está intentando acceder a una ruta protegida
  if (!isAuthenticated && protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    console.log(`Redirecting unauthenticated user from ${pathname} to /login`)
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Si el usuario SÍ está autenticado y está intentando acceder a la página de login
  if (isAuthenticated && pathname === "/login") {
    console.log(`Redirecting authenticated user from /login to /`)
    const url = request.nextUrl.clone()
    url.pathname = "/" // Redirigir al dashboard
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas de solicitud excepto las que comienzan con:
     * - _next/static (archivos estáticos)
     * - _next/image (archivos de optimización de imagen)
     * - favicon.ico (archivo favicon)
     * - /api/webhook (excluir explícitamente la ruta del webhook de la autenticación)
     * - /api/auth (excluir explícitamente la ruta de autenticación)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/webhook|api/auth).*)",
  ],
}
