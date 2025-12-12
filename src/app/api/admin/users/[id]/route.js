import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Verify admin token
function verifyAdminToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin' && decoded.role !== 'super-admin') {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// PATCH - Update admin user
export async function PATCH(request, { params }) {
  try {
    const decoded = verifyAdminToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only super-admin can update admin users
    if (decoded.role !== 'super-admin') {
      return NextResponse.json(
        { error: 'Only super admins can update admin users' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectDB();

    const { name, email, password, role, isActive } = await request.json();

    // Find the admin to update
    const admin = await Admin.findById(id);
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    // If password is provided, hash it
    if (password && password.length > 0) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }
      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Check if email is being changed and if it already exists
    if (email && email.toLowerCase() !== admin.email) {
      const existingAdmin = await Admin.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      
      if (existingAdmin) {
        return NextResponse.json(
          { error: 'An admin with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Update the admin
    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: false
      }
    ).select('-password -resetPasswordToken -resetPasswordExpires');

    return NextResponse.json({
      success: true,
      message: 'Admin user updated successfully',
      admin: updatedAdmin
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update admin user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete admin user
export async function DELETE(request, { params }) {
  try {
    const decoded = verifyAdminToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only super-admin can delete admin users
    if (decoded.role !== 'super-admin') {
      return NextResponse.json(
        { error: 'Only super admins can delete admin users' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectDB();

    // Prevent deleting self
    if (decoded.userId === id) {
      return NextResponse.json(
        { error: 'You cannot delete your own admin account' },
        { status: 400 }
      );
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Check if this is the last super-admin
    if (admin.role === 'super-admin') {
      const superAdminCount = await Admin.countDocuments({ role: 'super-admin' });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last super admin' },
          { status: 400 }
        );
      }
    }

    await Admin.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Admin user deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete admin user' },
      { status: 500 }
    );
  }
}

