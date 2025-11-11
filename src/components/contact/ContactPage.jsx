"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, Send } from 'lucide-react'
import { useSubmitContact } from '@/hooks/useContact'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    studentFirstName: '',
    studentLastName: '',
    parentName: '',
    parentEmail: '',
    phoneNumber: '',
    graduationYear: '',
    message: ''
  })

  const submitContactMutation = useSubmitContact()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.studentFirstName || !formData.studentLastName || !formData.parentEmail || !formData.message) {
      return
    }

    // Convert to the format expected by the API
    const contactData = {
      firstName: formData.studentFirstName,
      lastName: formData.studentLastName,
      email: formData.parentEmail,
      message: `Student: ${formData.studentFirstName} ${formData.studentLastName}
Parent: ${formData.parentName}
Phone: ${formData.phoneNumber}
Graduation Year: ${formData.graduationYear}

Message: ${formData.message}`
    }

    submitContactMutation.mutate(contactData, {
      onSuccess: () => {
        // Reset form on success
        setFormData({
          studentFirstName: '',
          studentLastName: '',
          parentName: '',
          parentEmail: '',
          phoneNumber: '',
          graduationYear: '',
          message: ''
        })
      }
    })
  }

  const currentYear = new Date().getFullYear()
  const graduationYears = [
    currentYear + 4,
    currentYear + 3,
    currentYear + 2,
    currentYear + 1,
    currentYear,
    'Before ' + currentYear
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="min-h-[300px] bg-black flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 2px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        />
        
        <div className="text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-blue-500 leading-tight tracking-wider mb-4">
            GET IN TOUCH
            <br />
            WITH US
          </h1>
          <p className="text-xl sm:text-2xl text-white font-medium">
            We are looking forward to speaking with you soon
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email Information</p>
                    <a 
                      href="mailto:contact@1550plus.com" 
                      className="text-lg text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      contact@1550plus.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact Number</p>
                    <a 
                      href="tel:(475) 333-0550" 
                      className="text-lg text-gray-900 hover:text-green-600 transition-colors"
                    >
                      (475) 333-0550
                    </a>
                  </div>
                </div>

              </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Choose 1550+?</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    ✓
                  </Badge>
                  <span className="text-gray-700">Expert SAT preparation strategies</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    ✓
                  </Badge>
                  <span className="text-gray-700">Personalized learning approach</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    ✓
                  </Badge>
                  <span className="text-gray-700">Proven track record of 1550+ scores</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    ✓
                  </Badge>
                  <span className="text-gray-700">Small class sizes for individual attention</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Thank you for your interest in 1550+
                </CardTitle>
                <p className="text-center text-gray-600">
                  Please fill out the form below and we will reach out to you shortly.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentFirstName">Student First Name</Label>
                      <Input
                        id="studentFirstName"
                        name="studentFirstName"
                        type="text"
                        value={formData.studentFirstName}
                        onChange={handleChange}
                        placeholder="Enter student's first name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentLastName">Student Last Name</Label>
                      <Input
                        id="studentLastName"
                        name="studentLastName"
                        type="text"
                        value={formData.studentLastName}
                        onChange={handleChange}
                        placeholder="Enter student's last name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentName">Parent Name</Label>
                    <Input
                      id="parentName"
                      name="parentName"
                      type="text"
                      value={formData.parentName}
                      onChange={handleChange}
                      placeholder="Enter parent's name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentEmail">Parent Email Address</Label>
                    <Input
                      id="parentEmail"
                      name="parentEmail"
                      type="email"
                      value={formData.parentEmail}
                      onChange={handleChange}
                      placeholder="Enter parent's email address"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <select
                      id="graduationYear"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Year</option>
                      {graduationYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32"
                      required
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="consent"
                      className="mt-1"
                      required
                    />
                    <Label htmlFor="consent" className="text-sm text-gray-600">
                      By checking this box you agree to send and receive messages from 1550+. 
                      You also agree to the Terms of Service and Privacy Policy.
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                    disabled={submitContactMutation.isPending}
                  >
                    {submitContactMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}