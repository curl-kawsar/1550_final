import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

// Maintenance Mode Schema
const MaintenanceSchema = new mongoose.Schema({
  isEnabled: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: "We're currently performing scheduled maintenance to bring you an even better experience."
  },
  enabledAt: {
    type: Date,
    default: null
  },
  enabledBy: {
    type: String,
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const MaintenanceMode = mongoose.models.MaintenanceMode || mongoose.model('MaintenanceMode', MaintenanceSchema);

// Get maintenance status
export async function GET() {
  try {
    await connectToDatabase();
    
    let maintenance = await MaintenanceMode.findOne();
    
    // Create default maintenance record if none exists
    if (!maintenance) {
      maintenance = new MaintenanceMode({
        isEnabled: false,
        message: "We're currently performing scheduled maintenance to bring you an even better experience."
      });
      await maintenance.save();
    }
    
    return NextResponse.json({
      isEnabled: maintenance.isEnabled,
      message: maintenance.message,
      enabledAt: maintenance.enabledAt,
      updatedAt: maintenance.updatedAt
    });
    
  } catch (error) {
    console.error('Error fetching maintenance status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance status' },
      { status: 500 }
    );
  }
}

// Update maintenance status (Admin only)
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { isEnabled, message, adminEmail } = body;
    
    // Validate required fields
    if (typeof isEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'isEnabled field is required and must be boolean' },
        { status: 400 }
      );
    }
    
    let maintenance = await MaintenanceMode.findOne();
    
    if (!maintenance) {
      maintenance = new MaintenanceMode();
    }
    
    maintenance.isEnabled = isEnabled;
    if (message) {
      maintenance.message = message;
    }
    maintenance.enabledAt = isEnabled ? new Date() : null;
    maintenance.enabledBy = adminEmail || 'admin';
    maintenance.updatedAt = new Date();
    
    await maintenance.save();
    
    return NextResponse.json({
      message: `Maintenance mode ${isEnabled ? 'enabled' : 'disabled'} successfully`,
      isEnabled: maintenance.isEnabled,
      enabledAt: maintenance.enabledAt,
      updatedAt: maintenance.updatedAt
    });
    
  } catch (error) {
    console.error('Error updating maintenance status:', error);
    return NextResponse.json(
      { error: 'Failed to update maintenance status' },
      { status: 500 }
    );
  }
}
