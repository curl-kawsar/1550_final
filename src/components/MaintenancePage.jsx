"use client"
import React from 'react'
import { Settings } from 'lucide-react'

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
            <Settings className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Site Under Maintenance
        </h1>
        
        {/* Description */}
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          We're currently performing scheduled maintenance to improve your experience. 
          We'll be back online shortly.
        </p>

        {/* Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-700 font-medium">Maintenance in Progress</span>
          </div>
          <p className="text-gray-600 text-sm">
            Our team is working to enhance the platform. Thank you for your patience.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Assistance?</h3>
          <p className="text-gray-600 mb-4">
            If you have any urgent questions, please contact our support team.
          </p>
          <a 
            href="mailto:1550plus@1550plus.com" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            Contact Support
          </a>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-gray-500 text-sm">
            <strong className="text-blue-600">1550+</strong> College Mastermind
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaintenancePage
