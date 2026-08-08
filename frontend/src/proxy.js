import { NextResponse } from 'next/server';
import { auth } from './lib/auth';
import { headers } from 'next/headers';

export async function proxy(request) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host');
  const parts = host.split('.');
  const session=await auth.api.getSession({
    headers:await headers()
  })
 
  // Allow requests to the root domain (localhost or www) to continue normally
  if (parts.length < 2 || parts[0] === 'localhost' || parts[0] === 'www') {
    return NextResponse.next();
  }

  const subdomain = parts[0];

  // handling unauthorized user access
   if(!session){
    const currentPath=url.pathname
    if (currentPath === '/login' || currentPath.startsWith(`/tenants/${subdomain}/login`)) {
      url.pathname = `/tenants/${subdomain}/login`;
      return NextResponse.rewrite(url);
    }
    const redirectUrl = new URL(`/login?redirect=${encodeURIComponent(currentPath)}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }
  // If a subdomain exists, internally rewrite the request
  // Example: /dashboard -> /tenants/gym/dashboard
  if (url.pathname === '/' || url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/login')) {
    url.pathname = `/tenants/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/','/login','/dashboard','/dashboard/:path*'],
};