import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Verificar si la ruta actual es pública o estática
  const isPublicRoute = [
    "/login",
    "/register",
    "/api/auth",
  ].some(route => pathname.startsWith(route));
  
  const isStaticRoute = [
    "/_next",
    "/favicon.ico",
  ].some(route => pathname.startsWith(route));
  
  // Obtener la cookie de sesión
  const authCookie = req.cookies.get("next-auth.session-token") || 
                    req.cookies.get("__Secure-next-auth.session-token");
                    
  // Si no hay cookie de sesión y la ruta no es pública ni estática, redirigir al login
  if (!authCookie && !isPublicRoute && !isStaticRoute) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }
  
  return NextResponse.next();
}

export const config = {
  // Definir las rutas que deben pasar por el middleware
  matcher: [
    // Protege todas las rutas excepto las públicas
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}; 