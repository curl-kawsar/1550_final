import connectToDatabase from '@/lib/mongodb'
import Ambassador from '@/models/Ambassador'

// POST - Validate ambassador code
export async function POST(request) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    const { code } = body
    
    if (!code) {
      return Response.json({ error: 'Ambassador code is required' }, { status: 400 })
    }
    
    // Find ambassador by code
    const ambassador = await Ambassador.findOne({ 
      ambassadorCode: code.toUpperCase(),
      isActive: true 
    }).select('firstName lastName ambassadorCode')
    
    if (!ambassador) {
      return Response.json({ 
        valid: false, 
        message: 'Invalid or inactive ambassador code' 
      }, { status: 404 })
    }
    
    return Response.json({ 
      valid: true,
      ambassador: {
        id: ambassador._id,
        name: `${ambassador.firstName} ${ambassador.lastName}`,
        code: ambassador.ambassadorCode
      },
      message: `Valid ambassador code for ${ambassador.firstName} ${ambassador.lastName}`
    })
    
  } catch (error) {
    console.error('Error validating ambassador code:', error)
    return Response.json({ error: 'Failed to validate ambassador code' }, { status: 500 })
  }
}