import { NextResponse } from 'next/server';

export function proxy(request) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host');
  const parts = host.split('.');

  // Allow requests to the root domain (localhost or www) to continue normally
  if (parts.length < 2 || parts[0] === 'localhost' || parts[0] === 'www') {
    return NextResponse.next();
  }

  const subdomain = parts[0];

  // If a subdomain exists, internally rewrite the request
  // Example: /dashboard -> /tenants/gym/dashboard
  if (url.pathname === '/' || url.pathname.startsWith('/dashboard')) {
    url.pathname = `/tenants/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};