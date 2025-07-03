import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Debug logging for Vercel
  console.log('Middleware executing for path:', request.nextUrl.pathname);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Log token status
  console.log('Token present:', !!token);

  const isAuthPage = request.nextUrl.pathname.startsWith("/login");
  
  // Check if the path is any of the protected admin pages
  const isProtectedPage = 
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/users") ||
    request.nextUrl.pathname.startsWith("/courses") ||
    request.nextUrl.pathname.startsWith("/orders") ||
    request.nextUrl.pathname.startsWith("/admins") ||
    request.nextUrl.pathname.startsWith("/roles") ||
    request.nextUrl.pathname.startsWith("/logs") ||
    request.nextUrl.pathname.startsWith("/attendance") ||
    request.nextUrl.pathname.startsWith("/batches") ||
    request.nextUrl.pathname.startsWith("/recordings") ||
    request.nextUrl.pathname.startsWith("/products") ||
    request.nextUrl.pathname.startsWith("/categories") ||
    request.nextUrl.pathname.startsWith("/addons") ||
    request.nextUrl.pathname.startsWith("/addon-groups") ||
    request.nextUrl.pathname.startsWith("/inventory") ||
    request.nextUrl.pathname.startsWith("/variation-attributes") ||
    request.nextUrl.pathname.startsWith("/product-variants") ||
    request.nextUrl.pathname.startsWith("/subcategories") ||
    request.nextUrl.pathname.startsWith("/shipping-labels") ||
    request.nextUrl.pathname.startsWith("/returns") ||
    request.nextUrl.pathname.startsWith("/refunds");

  // Log protection status
  console.log('Is auth page:', isAuthPage);
  console.log('Is protected page:', isProtectedPage);

  if (token && isAuthPage) {
    console.log('Redirecting authenticated user from login page to home');
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!token && isProtectedPage) {
    console.log('Redirecting unauthenticated user to login');
    const loginUrl = new URL("/login", request.url);
    // Add the original URL as a redirect parameter
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Make matcher patterns more explicit for Vercel
export const config = {
  matcher: [
    '/',
    '/login',
    '/users/:path*',
    '/courses/:path*',
    '/orders/:path*',
    '/admins/:path*',
    '/roles/:path*',
    '/logs/:path*',
    '/attendance/:path*',
    '/batches/:path*',
    '/recordings/:path*',
    '/products',
    '/products/:path*',
    '/categories',
    '/categories/:path*',
    '/addons',
    '/addons/:path*',
    '/addon-groups',
    '/addon-groups/:path*',
    '/inventory',
    '/inventory/:path*',
    '/variation-attributes',
    '/variation-attributes/:path*',
    '/product-variants',
    '/product-variants/:path*',
    '/subcategories',
    '/subcategories/:path*',
    '/shipping-labels',
    '/shipping-labels/:path*',
    '/returns',
    '/returns/:path*',
    '/refunds',
    '/refunds/:path*'
  ]
};
