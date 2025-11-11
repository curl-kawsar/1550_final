import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // Clear the ambassador token cookie
    cookieStore.delete('ambassador-token')
    
    return Response.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Ambassador logout error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}