"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, AlertCircle, Zap, Star } from "lucide-react"
import { useSubmitRegistration, validateStep, getStepProgress } from "@/hooks/useRegistration"
import { useEnrollmentCounts } from "@/hooks/useEnrollment"
import { useEmailValidation } from "@/hooks/useEmailValidation"
import { toast } from "sonner"


const InteractiveRegistrationForm = () => {
  const router = useRouter()
  
  // Add Bebas Neue font (similar to Norwester)
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Helper function to format time from 24-hour to 12-hour format
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString; // Return original if parsing fails
    }
  };
  const [currentStep, setCurrentStep] = useState(1)
  const [fieldErrors, setFieldErrors] = useState({})
  const [touchedFields, setTouchedFields] = useState({})
  const [emailValidationState, setEmailValidationState] = useState({
    isValidating: false,
    exists: false,
    message: ''
  })
  const [formData, setFormData] = useState({
    // Student Information
    firstName: "", lastName: "", email: "", graduationYear: "",
    highSchoolName: "", phoneNumber: "", gender: "Male", currentGPA: "", 
    topCollegeChoices: "", password: "", confirmPassword: "",
    
    // Parent Information
    parentFirstName: "", parentLastName: "", parentEmail: "",
    parentPhoneNumber: "", state: "",
    
    // Academic Information
    classRigor: "Mostly Honors and AP", universitiesWant: "Ivy League/Top 20",
    satActScores: "",
    
    // Additional Information
    typeOfStudent: "", biggestStressor: "", parentWorry: "", registrationCode: "",
    
    // Class Time & Diagnostic
    classTime: "", diagnosticTestDate: ""
  })

  const submitMutation = useSubmitRegistration()
  const emailValidationMutation = useEmailValidation()
  const totalSteps = 6

  // Get real-time enrollment data
  const { data: enrollmentData, isLoading: isLoadingEnrollment, error: enrollmentError } = useEnrollmentCounts()

  // Get diagnostic tests data
  const [diagnosticTests, setDiagnosticTests] = useState([])
  const [loadingDiagnosticTests, setLoadingDiagnosticTests] = useState(true)

  // Fetch diagnostic tests
  useEffect(() => {
    const fetchDiagnosticTests = async () => {
      try {
        const response = await fetch('/api/diagnostic-tests/active?includeEnrollment=true')
        if (response.ok) {
          const data = await response.json()
          setDiagnosticTests(data.diagnosticTests || [])
        }
      } catch (error) {
        console.error('Error fetching diagnostic tests:', error)
      } finally {
        setLoadingDiagnosticTests(false)
      }
    }

    fetchDiagnosticTests()
  }, [])

  // Email validation effect with debouncing
  useEffect(() => {
    const validateEmailExists = async () => {
      if (formData.email && formData.email.length > 5 && formData.email.includes('@') && touchedFields.email) {
        setEmailValidationState(prev => ({ ...prev, isValidating: true }))
        
        try {
          const result = await emailValidationMutation.mutateAsync(formData.email)
          setEmailValidationState({
            isValidating: false,
            exists: result.exists,
            message: result.message
          })
          
          if (result.exists) {
            setFieldErrors(prev => ({ ...prev, email: 'This email is already registered. Please use a different email or log in.' }))
          } else {
            // Remove email error if it was about duplicate email
            setFieldErrors(prev => {
              const newErrors = { ...prev }
              if (newErrors.email && newErrors.email.includes('already registered')) {
                delete newErrors.email
              }
              return newErrors
            })
          }
        } catch (error) {
          setEmailValidationState({
            isValidating: false,
            exists: false,
            message: 'Unable to validate email'
          })
        }
      } else {
        setEmailValidationState({
          isValidating: false,
          exists: false,
          message: ''
        })
      }
    }

    // Debounce email validation
    const timeoutId = setTimeout(validateEmailExists, 800)
    return () => clearTimeout(timeoutId)
  }, [formData.email, touchedFields.email])

  // Real-time validation
  useEffect(() => {
    const errors = validateStep(currentStep, formData)
    const stepErrors = {}
    
    errors.forEach(error => {
      const field = error.toLowerCase().includes('first name') ? 'firstName' :
                   error.toLowerCase().includes('last name') ? 'lastName' :
                   error.toLowerCase().includes('email') ? (error.includes('parent') ? 'parentEmail' : 'email') :
                   error.toLowerCase().includes('graduation') ? 'graduationYear' :
                   error.toLowerCase().includes('high school') ? 'highSchoolName' :
                   error.toLowerCase().includes('phone') ? (error.includes('parent') ? 'parentPhoneNumber' : 'phoneNumber') :
                   error.toLowerCase().includes('gpa') ? 'currentGPA' :
                   error.toLowerCase().includes('stressor') ? 'biggestStressor' :
                   error.toLowerCase().includes('parent worry') ? 'parentWorry' :
                   error.toLowerCase().includes('registration code') ? 'registrationCode' :
                   error.toLowerCase().includes('address') ? 'address' :
                   error.toLowerCase().includes('zip') ? 'zipCode' :
                   error.toLowerCase().includes('city') ? 'city' :
                   error.toLowerCase().includes('state') ? 'state' :
                   error.toLowerCase().includes('confirm password') ? 'confirmPassword' :
                   error.toLowerCase().includes('password') ? 'password' : null
      
      if (field) stepErrors[field] = error
    })
    
    // Don't override email error if it's about duplicate email
    if (!stepErrors.email && fieldErrors.email && fieldErrors.email.includes('already registered')) {
      stepErrors.email = fieldErrors.email
    }
    
    setFieldErrors(stepErrors)
  }, [formData, currentStep])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setTouchedFields(prev => ({ ...prev, [field]: true }))
  }

  const handleNext = () => {
    const errors = validateStep(currentStep, formData)
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
      return
    }
    
    // Check for email validation in step 1
    if (currentStep === 1 && emailValidationState.exists) {
      toast.error('Please use a different email address. This email is already registered.')
      return
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      toast.success(`Step ${currentStep} completed! 🎉`)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    const errors = validateStep(currentStep, formData)
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
      return
    }

    // Final check for email validation
    if (emailValidationState.exists) {
      toast.error('Cannot submit registration. This email is already registered.')
      setCurrentStep(1) // Go back to step 1 to fix email
      return
    }

    // Additional graduation year validation
    const graduationDate = new Date(formData.graduationYear)
    const currentYear = new Date().getFullYear()
    
    if (graduationDate.getFullYear() < currentYear - 10 || graduationDate.getFullYear() > currentYear + 10) {
      toast.error("Please enter a valid graduation year")
      return
    }

    submitMutation.mutate(formData, {
      onSuccess: () => {
        // Show success message and redirect to login
        toast.success("Registration completed successfully! Please log in to access your dashboard.")
        
        // Reset form
        setFormData({
          firstName: "", lastName: "", email: "", graduationYear: "",
          highSchoolName: "", phoneNumber: "", gender: "Male", currentGPA: "", 
          topCollegeChoices: "", password: "", confirmPassword: "", parentFirstName: "", parentLastName: "", 
          parentEmail: "", parentPhoneNumber: "", state: "",
          classRigor: "Mostly Honors and AP", universitiesWant: "Ivy League/Top 20",
          satActScores: "", typeOfStudent: "", biggestStressor: "", 
          parentWorry: "", registrationCode: "", classTime: "", diagnosticTestDate: ""
        })
        setCurrentStep(1)
        setTouchedFields({})
        setFieldErrors({})
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push('/student-login')
        }, 2000)
      }
    })
  }

  const getFieldStatus = (field) => {
    // Special handling for email field
    if (field === 'email') {
      if (emailValidationState.isValidating) return 'validating'
      if (emailValidationState.exists) return 'error'
      if (fieldErrors[field] && touchedFields[field]) return 'error'
      if (formData[field] && !fieldErrors[field] && !emailValidationState.exists && touchedFields[field]) return 'success'
      return 'default'
    }
    
    if (fieldErrors[field] && touchedFields[field]) return 'error'
    if (formData[field] && !fieldErrors[field]) return 'success'
    return 'default'
  }

  const getFieldIcon = (field) => {
    const status = getFieldStatus(field)
    if (status === 'validating') return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    if (status === 'success') return <CheckCircle2 className="w-4 h-4 text-green-500" />
    if (status === 'error') return <AlertCircle className="w-4 h-4 text-red-500" />
    return null
  }

  const stepProgress = getStepProgress(currentStep, formData)
  const overallProgress = (currentStep - 1) * 25 + (stepProgress * 0.25)

  const renderInputField = (field, placeholder, type = "text", required = true) => (
    <div className="relative">
      <Input
        type={type}
        placeholder={placeholder}
        value={formData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className={`border-[#457BF5] pr-10 transition-all duration-200 ${
          getFieldStatus(field) === 'error' ? 'border-red-500 bg-red-50' :
          getFieldStatus(field) === 'success' ? 'border-green-500 bg-green-50' :
          getFieldStatus(field) === 'validating' ? 'border-blue-500 bg-blue-50' : ''
        }`}
        required={required}
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        {getFieldIcon(field)}
      </div>
      {fieldErrors[field] && touchedFields[field] && (
        <p className="text-xs text-red-500 mt-1">{fieldErrors[field]}</p>
      )}
      {field === 'email' && emailValidationState.isValidating && (
        <p className="text-xs text-blue-500 mt-1">Checking if email is available...</p>
      )}
      {field === 'email' && !emailValidationState.isValidating && !emailValidationState.exists && emailValidationState.message && touchedFields[field] && (
        <p className="text-xs text-green-500 mt-1">✓ Email is available</p>
      )}
      {field === 'email' && emailValidationState.exists && touchedFields[field] && (
        <div className="text-xs text-red-500 mt-1">
          This email is already registered. 
          <button 
            type="button"
            onClick={() => router.push('/student-login')}
            className="ml-1 text-blue-600 hover:text-blue-800 underline"
          >
            Log in instead
          </button>
        </div>
      )}
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Student Information</h2>
              <Badge variant="outline" className="ml-auto">
                Step {currentStep} of {totalSteps}
              </Badge>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Step Progress</span>
                <span>{stepProgress}% Complete</span>
              </div>
              <Progress value={stepProgress} className="h-2" />
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Full Name *</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {renderInputField('firstName', 'First Name')}
                  {renderInputField('lastName', 'Last Name')}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Email *</Label>
                <div className="mt-2">
                  {renderInputField('email', '1550plus@1550plus.com', 'email')}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Gender *</Label>
                <div className="flex space-x-6 mt-2">
                  {['Male', 'Female'].map(option => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        checked={formData.gender === option}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="mr-2 text-blue-600"
                      />
                      <span className={formData.gender === option ? 'text-blue-600 font-medium' : ''}>
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Phone Number *</Label>
                <div className="relative mt-2">
                  <div className="relative">
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phoneNumber}
                      onChange={(e) => {
                        // Format phone number as user types
                        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                        if (value.length <= 3) {
                          value = value;
                        } else if (value.length <= 6) {
                          value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                        } else {
                          value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
                        }
                        handleInputChange('phoneNumber', value);
                      }}
                      className={`border-[#457BF5] pr-10 transition-all duration-200 ${
                        getFieldStatus('phoneNumber') === 'error' ? 'border-red-500 bg-red-50' :
                        getFieldStatus('phoneNumber') === 'success' ? 'border-green-500 bg-green-50' : ''
                      }`}
                      required={true}
                      maxLength={14}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      {/* <span className="text-gray-500">🇺🇸</span> */}
                    </div>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getFieldIcon('phoneNumber')}
                    </div>
                    {fieldErrors['phoneNumber'] && touchedFields['phoneNumber'] && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors['phoneNumber']}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Graduation Year *</Label>
                <div className="mt-2">
                  {renderInputField('graduationYear', '2025', 'number')}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">High School Name *</Label>
                <div className="mt-2">
                  {renderInputField('highSchoolName', 'XYZ High School')}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Current Unweighted GPA *</Label>
                <div className="mt-2">
                  {renderInputField('currentGPA', '4.00', 'number')}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">What Are Your Top 3 Choices For College (Optional)</Label>
                <div className="mt-2">
                  <textarea
                    placeholder="Your answer here"
                    value={formData.topCollegeChoices}
                    onChange={(e) => handleInputChange('topCollegeChoices', e.target.value)}
                    className="w-full p-3 border border-[#457BF5] rounded-md resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#457BF5] focus:border-[#457BF5]"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Create Password *</Label>
                <div className="mt-2">
                  {renderInputField('password', 'Enter a secure password', 'password')}
                </div>
                <p className="text-xs text-gray-500 mt-1">Use this password to log into your student dashboard later</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Confirm Password *</Label>
                <div className="mt-2">
                  {renderInputField('confirmPassword', 'Re-enter your password', 'password')}
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Parent Information</h2>
              <Badge variant="outline" className="ml-auto">
                Step {currentStep} of {totalSteps}
              </Badge>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Step Progress</span>
                <span>{stepProgress}% Complete</span>
              </div>
              <Progress value={stepProgress} className="h-2" />
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Full Name *</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {renderInputField('parentFirstName', 'First Name')}
                  {renderInputField('parentLastName', 'Last Name')}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">State *</Label>
                <div className="mt-2">
                  {renderInputField('state', 'New York')}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Email *</Label>
                <div className="mt-2">
                  {renderInputField('parentEmail', '1550plus@1550plus.com', 'email')}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Phone Number *</Label>
                <div className="relative mt-2">
                  <div className="relative">
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.parentPhoneNumber}
                      onChange={(e) => {
                        // Format phone number as user types
                        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                        if (value.length <= 3) {
                          value = value;
                        } else if (value.length <= 6) {
                          value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                        } else {
                          value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
                        }
                        handleInputChange('parentPhoneNumber', value);
                      }}
                      className={`border-[#457BF5] pr-10 transition-all duration-200 ${
                        getFieldStatus('parentPhoneNumber') === 'error' ? 'border-red-500 bg-red-50' :
                        getFieldStatus('parentPhoneNumber') === 'success' ? 'border-green-500 bg-green-50' : ''
                      }`}
                      required={true}
                      maxLength={14}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      {/* <span className="text-gray-500">🇺🇸</span> */}
                    </div>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getFieldIcon('parentPhoneNumber')}
                    </div>
                    {fieldErrors['parentPhoneNumber'] && touchedFields['parentPhoneNumber'] && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors['parentPhoneNumber']}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Academic Information</h2>
              <Badge variant="outline" className="ml-auto">
                Step {currentStep} of {totalSteps}
              </Badge>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Step Progress</span>
                <span>{stepProgress}% Complete</span>
              </div>
              <Progress value={stepProgress} className="h-2" />
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">Class Rigor *</Label>
                <div className="space-y-3 mt-2">
                  {["Mostly Honors and AP", "Some Honors and AP", "No Honors or AP"].map((option) => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="classRigor"
                        value={option}
                        checked={formData.classRigor === option}
                        onChange={(e) => handleInputChange('classRigor', e.target.value)}
                        className="mr-3 text-blue-600"
                      />
                      <span className={formData.classRigor === option ? 'text-blue-600 font-medium' : ''}>
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Universities You Want *</Label>
                <div className="space-y-3 mt-2">
                  {[
                    "Ivy League/Top 20",
                    "Top 50", 
                    "Top 100",
                    "Selective State University",
                    "Anywhere I can"
                  ].map((option) => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="universitiesWant"
                        value={option}
                        checked={formData.universitiesWant === option}
                        onChange={(e) => handleInputChange('universitiesWant', e.target.value)}
                        className="mr-3 text-blue-600"
                      />
                      <span className={formData.universitiesWant === option ? 'text-blue-600 font-medium' : ''}>
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">SAT/ACT Previous Scores (Optional)</Label>
                <div className="mt-2">
                  <textarea
                    placeholder="Include sub-scores if you know them"
                    value={formData.satActScores}
                    onChange={(e) => handleInputChange('satActScores', e.target.value)}
                    className="w-full p-3 border border-[#457BF5] rounded-md resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#457BF5] focus:border-[#457BF5]"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Final Questions</h2>
              <Badge variant="outline" className="ml-auto">
                Step {currentStep} of {totalSteps}
              </Badge>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Step Progress</span>
                <span>{stepProgress}% Complete</span>
              </div>
              <Progress value={stepProgress} className="h-2" />
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Type Of Student *</Label>
                <p className="text-sm text-gray-500 mb-3">Which Option Describes You The Most? There Is No Wrong Answer.</p>
                <div className="space-y-3">
                  {[
                    "I usually wait until the last minute to get things done. Motivated sometimes, but inconsistent.",
                    "I generally bring my stuff and finish on time, but I don't always get top results.",
                    "I am usually very slow to work and achieve awesome results. I get stressed if I don't succeed!"
                  ].map((option) => (
                    <label key={option} className="flex items-start cursor-pointer">
                      <input
                        type="radio"
                        name="typeOfStudent"
                        value={option}
                        checked={formData.typeOfStudent === option}
                        onChange={(e) => handleInputChange('typeOfStudent', e.target.value)}
                        className="mr-3 mt-1 text-blue-600"
                      />
                      <span className={formData.typeOfStudent === option ? 'text-blue-600 font-medium' : ''}>
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Biggest Stressor About College Admissions*
                </Label>
                <div className="mt-2 relative">
                  <textarea
                    placeholder="Your answer here"
                    value={formData.biggestStressor}
                    onChange={(e) => handleInputChange('biggestStressor', e.target.value)}
                    className={`w-full p-3 border rounded-md resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#457BF5] focus:border-[#457BF5] transition-all duration-200 ${
                      getFieldStatus('biggestStressor') === 'error' ? 'border-red-500 bg-red-50' :
                      getFieldStatus('biggestStressor') === 'success' ? 'border-green-500 bg-green-50' : 'border-[#457BF5]'
                    }`}
                    required
                  />
                  <div className="absolute right-3 top-3">
                    {getFieldIcon('biggestStressor')}
                  </div>
                  {fieldErrors['biggestStressor'] && touchedFields['biggestStressor'] && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors['biggestStressor']}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Parent(s) Biggest Worries Or Concerns*
                </Label>
                <div className="mt-2 relative">
                  <textarea
                    placeholder="Your answer here"
                    value={formData.parentWorry}
                    onChange={(e) => handleInputChange('parentWorry', e.target.value)}
                    className={`w-full p-3 border rounded-md resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#457BF5] focus:border-[#457BF5] transition-all duration-200 ${
                      getFieldStatus('parentWorry') === 'error' ? 'border-red-500 bg-red-50' :
                      getFieldStatus('parentWorry') === 'success' ? 'border-green-500 bg-green-50' : 'border-[#457BF5]'
                    }`}
                    required
                  />
                  <div className="absolute right-3 top-3">
                    {getFieldIcon('parentWorry')}
                  </div>
                  {fieldErrors['parentWorry'] && touchedFields['parentWorry'] && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors['parentWorry']}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Registration Code *</Label>
                <div className="mt-2">
                  {renderInputField('registrationCode', '11550.07')}
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Class Time</h2>
              <Badge variant="outline" className="ml-auto">
                Step {currentStep} of {totalSteps}
              </Badge>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Step Progress</span>
                <span>{stepProgress}% Complete</span>
              </div>
              <Progress value={stepProgress} className="h-2" />
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Class Timings *</Label>
                <p className="text-sm text-gray-500 mb-3">Select Your Preferred Time Slot.</p>
                <div className="space-y-3">
                  {(enrollmentData?.classTimes || []).map((classTime) => {
                    const enrollmentCount = enrollmentData?.enrollments?.[classTime.name] || 0;
                    const hasMinimumEnrollment = enrollmentCount >= (classTime.minimumRequired || 40);
                    const isLoading = isLoadingEnrollment;
                    
                    return (
                      <div key={classTime.name} className="relative">
                        <label className="flex items-center justify-between p-4 border border-[#457BF5] rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="classTime"
                              value={classTime.name}
                              checked={formData.classTime === classTime.name}
                              onChange={(e) => handleInputChange('classTime', e.target.value)}
                              className="mr-3 text-blue-600"
                            />
                            <div className={formData.classTime === classTime.name ? 'text-blue-600 font-medium' : ''}>
                              <div className="font-semibold">
                                {classTime.dayOfWeek ? classTime.dayOfWeek.join(' & ') : classTime.name}
                              </div>
                              <div className={`text-sm mt-1 ${formData.classTime === classTime.name ? 'text-blue-500' : 'text-gray-600'}`}>
                                Class time: {classTime.startTime && classTime.endTime 
                                  ? `${formatTime(classTime.startTime)} - ${formatTime(classTime.endTime)} ${classTime.timezone || 'Pacific'}`
                                  : classTime.name
                                }
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {isLoading ? (
                              <span className="animate-pulse">Loading...</span>
                            ) : (
                              `${enrollmentCount} students enrolled`
                            )}
                          </div>
                        </label>
                        {!isLoading && !hasMinimumEnrollment && (
                          <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center">
                            <AlertCircle className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" />
                            <div className="text-sm text-orange-700">
                              <strong>Minimum Enrollment Not Met</strong>
                              <p className="mt-1">This class will not run unless it reaches the required minimum number of students. If it doesn't reach enrollment, you will be placed in another class time or you can choose other options again.</p>
                            </div>
                          </div>
                        )}
                        {enrollmentError && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                            <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                            <div className="text-sm text-red-700">
                              <strong>Unable to Load Enrollment Data</strong>
                              <p className="mt-1">Please try refreshing the page. You can still select a class time.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Diagnostic Test</h2>
              <Badge variant="outline" className="ml-auto">
                Step {currentStep} of {totalSteps}
              </Badge>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Step Progress</span>
                <span>{stepProgress}% Complete</span>
              </div>
              <Progress value={stepProgress} className="h-2" />
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Diagnostic Test Date *</Label>
                <p className="text-sm text-gray-500 mb-3">Please Choose One</p>
                
                {loadingDiagnosticTests ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading test dates...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {diagnosticTests.map((test) => (
                      <label key={test.name} className="flex items-start p-4 border border-[#457BF5] rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                        <input
                          type="radio"
                          name="diagnosticTestDate"
                          value={test.name}
                          checked={formData.diagnosticTestDate === test.name}
                          onChange={(e) => handleInputChange('diagnosticTestDate', e.target.value)}
                          className="mr-3 mt-1 text-blue-600"
                          disabled={!test.canRegister}
                        />
                        <div className={`flex-1 ${formData.diagnosticTestDate === test.name ? 'text-blue-600 font-medium' : ''}`}>
                          <div className="font-semibold">
                            {test.formattedDate || new Date(test.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className={`text-sm mt-1 ${formData.diagnosticTestDate === test.name ? 'text-blue-500' : 'text-gray-600'}`}>
                            Test time: {formatTime(test.startTime)} - {formatTime(test.endTime)} {test.timezone}
                          </div>
                          {test.location && test.location !== 'Online' && (
                            <div className={`text-sm mt-1 ${formData.diagnosticTestDate === test.name ? 'text-blue-500' : 'text-gray-600'}`}>
                              Location: {test.location}
                            </div>
                          )}
                          {test.currentEnrollment !== undefined && (
                            <div className="text-xs text-gray-500 mt-1">
                              {test.currentEnrollment}/{test.capacity} students registered
                            </div>
                          )}
                          {test.isFull && (
                            <div className="text-xs text-red-600 mt-1 font-medium">
                              ⚠️ This test is full
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                    
                    {/* Always show "can't make it" option */}
                    <label className="flex items-start p-4 border border-[#457BF5] rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                      <input
                        type="radio"
                        name="diagnosticTestDate"
                        value="I can't make any of these dates"
                        checked={formData.diagnosticTestDate === "I can't make any of these dates"}
                        onChange={(e) => handleInputChange('diagnosticTestDate', e.target.value)}
                        className="mr-3 mt-1 text-blue-600"
                      />
                      <span className={formData.diagnosticTestDate === "I can't make any of these dates" ? 'text-blue-600 font-medium' : ''}>
                        I can't make any of these dates (we'll contact you to arrange an alternative)
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="College Mastermind Logo" 
                className="w-22 h-16"
              />
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Overall Progress</span>
              <span>{Math.round(overallProgress)}% Complete</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          {/* Form Content */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              {renderStepContent()}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {currentStep > 1 && (
                  <Button 
                    variant="outline" 
                    onClick={handlePrevious}
                    className="px-6"
                  >
                    Previous
                  </Button>
                )}
                
                {currentStep < totalSteps ? (
                  <Button 
                    onClick={handleNext}
                    className="ml-auto bg-blue-600 hover:bg-blue-700 px-6"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    className="ml-auto bg-blue-600 hover:bg-blue-700 px-6"
                  >
                    {submitMutation.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

             {/* Right Side - Custom Design */}
       <div 
         className="hidden lg:flex w-1/2 h-screen items-center justify-center relative overflow-hidden"
         style={{
           background: 'linear-gradient(to bottom right, #113076 0%, #020610 100%)'
         }}
       >
         {/* Dotted Background Pattern */}
         <div 
           className="absolute inset-0 opacity-30"
           style={{
             backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
             backgroundSize: '20px 20px'
           }}
         />
         
         {/* Main Content */}
         <div className="text-center z-10 px-8">
           <div className="text-white font-black leading-tight tracking-wide" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
             <div className="text-8xl sm:text-9xl lg:text-[8rem] xl:text-[8rem] mb-4 sm:mb-6">6 WEEKS</div>
             <div className="text-7xl sm:text-8xl lg:text-[9rem] xl:text-[8rem] mb-4 sm:mb-6">12 LESSONS</div>
             <div className="text-6xl sm:text-7xl lg:text-[8rem] xl:text-[8rem] mb-4 sm:mb-6">NO COST</div>
             <div className="text-6xl sm:text-7xl lg:text-[8rem] xl:text-[8rem]">NO EXCUSES</div>
           </div>
         </div>
       </div>

    </div>
  )
}

export default InteractiveRegistrationForm