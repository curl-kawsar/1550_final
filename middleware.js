import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  console.log('Middleware executing for:', pathname)

  // Skip maintenance check for admin routes, API routes, and static files
  if (
    pathname.startsWith('/admin') || 
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('/favicon') ||
    pathname.includes('/logo') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.svg') ||
    pathname.includes('.ico') ||
    pathname === '/maintenance'
  ) {
    console.log('Skipping maintenance check for:', pathname)
    return NextResponse.next()
  }

  try {
    // Check maintenance status
    console.log('Checking maintenance status...')
    const maintenanceResponse = await fetch(new URL('/api/maintenance', request.url), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    console.log('Maintenance API response status:', maintenanceResponse.status)
    
    if (maintenanceResponse.ok) {
      const maintenanceData = await maintenanceResponse.json()
      console.log('Maintenance data:', maintenanceData)
      
      if (maintenanceData.isEnabled) {
        console.log('Maintenance is enabled, redirecting to /maintenance')
        // Redirect to maintenance page
        return NextResponse.redirect(new URL('/maintenance', request.url))
      } else {
        console.log('Maintenance is disabled, allowing normal access')
      }
    } else {
      console.log('Maintenance API failed with status:', maintenanceResponse.status)
    }
  } catch (error) {
    // If maintenance API fails, allow normal access
    console.error('Maintenance check failed:', error)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
