import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import Admin from '@/models/Admin';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export async function verifyAdminToken(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;
    
    if (!token) {
      return null;
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Connect to database and find admin
    await connectToDatabase();
    const admin = await Admin.findById(decoded.adminId);
    
    if (!admin || !admin.isActive) {
      return null;
    }
    
    return {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    };
    
  } catch (error) {
    console.error('Admin token verification error:', error);
    return null;
  }
}

export async function verifyStudentToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    return {
      email: decoded.email,
      studentId: decoded.id || decoded.studentId
    };
    
  } catch (error) {
    console.error('Student token verification error:', error);
    return null;
  }
}