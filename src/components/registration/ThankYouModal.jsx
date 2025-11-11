"use client"

import { CheckCircle2, Calendar, Clock, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

const ThankYouModal = ({ isOpen, onClose, studentData }) => {
  if (!isOpen) return null

  const getClassTimeDisplay = (classTime) => {
    if (!classTime) return "Not selected"
    
    const timeMapping = {
      "Mon & Wed - 4:00 PM Pacific": "Monday & Wednesday, 4:00-6:00 PM Pacific",
      "Mon & Wed - 7:00 PM Pacific": "Monday & Wednesday, 7:00-9:00 PM Pacific", 
      "Tue & Thu - 4:00 PM Pacific": "Tuesday & Thursday, 4:00-6:00 PM Pacific",
      "Tue & Thu - 7:00 PM Pacific": "Tuesday & Thursday, 7:00-9:00 PM Pacific"
    }
    
    return timeMapping[classTime] || classTime
  }

  const getDiagnosticDisplay = (diagnosticDate) => {
    if (!diagnosticDate) return "Not selected"
    
    if (diagnosticDate.includes('Saturday')) return "Saturday, September 27th (8:30am - noon PST)"
    if (diagnosticDate.includes('Sunday')) return "Sunday, September 28th (8:30am - noon PST)"
    return "Cannot attend - follow-up needed"
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-8 text-center border-b border-gray-200">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
          <p className="text-lg text-gray-600">
            Thank you for joining College Mastermind, {studentData?.firstName}!
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Welcome Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🎉 Welcome to the 1550+ SAT Program!
            </h3>
            <p className="text-blue-800">
              Your registration has been successfully submitted. We're excited to help you achieve your target score and get into your dream college!
            </p>
          </div>

          {/* Schedule Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Schedule Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Class Time */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-gray-900">Class Time</h4>
                </div>
                <p className="text-sm text-gray-700">
                  {getClassTimeDisplay(studentData?.classTime)}
                </p>
              </div>

              {/* Diagnostic Test */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium text-gray-900">Diagnostic Test</h4>
                </div>
                <p className="text-sm text-gray-700">
                  {getDiagnosticDisplay(studentData?.diagnosticTestDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">What Happens Next?</h3>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Confirmation Email</h4>
                  <p className="text-sm text-gray-600">
                    You'll receive a confirmation email at <strong>{studentData?.email}</strong> within 24 hours with detailed program information.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Diagnostic Test</h4>
                  <p className="text-sm text-gray-600">
                    Attend your selected diagnostic test session to assess your current skill level and create a personalized study plan.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Program Begins</h4>
                  <p className="text-sm text-gray-600">
                    Join your scheduled class sessions and start your journey toward a 1550+ SAT score!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">Need Help?</h3>
            <div className="space-y-2">
              <div className="flex items-center text-yellow-800">
                <Mail className="w-4 h-4 mr-2" />
                <span className="text-sm">Email: support@1550plus.com</span>
              </div>
              <div className="flex items-center text-yellow-800">
                <Phone className="w-4 h-4 mr-2" />
                <span className="text-sm">Phone: (555) 1550-PLUS</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="text-center pt-4">
            <Button 
              onClick={onClose}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              Got it, thanks!
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThankYouModal
