import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const submitRegistration = async (formData) => {
  // Clean phone numbers for backend storage
  const cleanFormData = {
    ...formData,
    phoneNumber: formData.phoneNumber?.replace(/\D/g, ''), // Remove formatting, keep only digits
    parentPhoneNumber: formData.parentPhoneNumber?.replace(/\D/g, ''), // Remove formatting, keep only digits
    graduationYear: new Date(formData.graduationYear),
    currentGPA: parseFloat(formData.currentGPA)
  }

  const response = await fetch('/api/students', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cleanFormData)
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'Registration failed')
  }
  
  return data
}

export const useSubmitRegistration = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: submitRegistration,
    onSuccess: (data) => {
      toast.success("Registration submitted successfully! Thank you for joining College Mastermind.")
      // Invalidate and refetch any queries related to students
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed. Please try again.")
    }
  })
}

// Validation helpers
export const validateStep = (step, formData) => {
  const errors = []
  
  switch (step) {
    case 1: // Student Information
      if (!formData.firstName?.trim()) errors.push("First name is required")
      if (!formData.lastName?.trim()) errors.push("Last name is required")
      if (!formData.email?.trim()) errors.push("Email is required")
      if (formData.email && !formData.email.includes('@')) errors.push("Valid email is required")
      if (!formData.graduationYear) errors.push("Graduation year is required")
      if (!formData.highSchoolName?.trim()) errors.push("High school name is required")
      if (!formData.phoneNumber?.trim()) errors.push("Phone number is required")
      if (formData.phoneNumber && !/^\(\d{3}\) \d{3}-\d{4}$/.test(formData.phoneNumber)) {
        errors.push("Phone number must be in format (555) 123-4567")
      }
      if (!formData.currentGPA) errors.push("Current GPA is required")
      if (formData.currentGPA && (parseFloat(formData.currentGPA) < 0 || parseFloat(formData.currentGPA) > 4)) {
        errors.push("GPA must be between 0.0 and 4.0")
      }
      if (!formData.password?.trim()) errors.push("Password is required")
      if (formData.password && formData.password.length < 6) errors.push("Password must be at least 6 characters")
      if (!formData.confirmPassword?.trim()) errors.push("Confirm password is required")
      if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
        errors.push("Passwords do not match")
      }
      break
      
    case 2: // Parent Information
      if (!formData.parentFirstName?.trim()) errors.push("Parent first name is required")
      if (!formData.parentLastName?.trim()) errors.push("Parent last name is required")
      if (!formData.parentEmail?.trim()) errors.push("Parent email is required")
      if (formData.parentEmail && !formData.parentEmail.includes('@')) errors.push("Valid parent email is required")
      if (!formData.parentPhoneNumber?.trim()) errors.push("Parent phone number is required")
      if (formData.parentPhoneNumber && !/^\(\d{3}\) \d{3}-\d{4}$/.test(formData.parentPhoneNumber)) {
        errors.push("Parent phone number must be in format (555) 123-4567")
      }
      if (!formData.state?.trim()) errors.push("State is required")
      break
      
    case 3: // Academic Information
      if (!formData.classRigor?.trim()) errors.push("Class rigor is required")
      if (!formData.universitiesWant?.trim()) errors.push("Universities preference is required")
      break
      
    case 4: // Additional Information
      if (!formData.typeOfStudent?.trim()) errors.push("Type of student is required")
      if (!formData.biggestStressor?.trim()) errors.push("Biggest stressor about college admissions is required")
      if (!formData.parentWorry?.trim()) errors.push("Parent biggest worries or concerns is required")
      if (!formData.registrationCode?.trim()) errors.push("Registration code is required")
      break
      
    case 5: // Class Time
      if (!formData.classTime?.trim()) errors.push("Class time selection is required")
      break
      
    case 6: // Diagnostic Test Date
      if (!formData.diagnosticTestDate?.trim()) errors.push("Diagnostic test date is required")
      break
  }
  
  return errors
}

export const getStepProgress = (step, formData) => {
  const totalFields = {
    1: 10, // firstName, lastName, email, gender, phoneNumber, graduationYear, highSchoolName, currentGPA, password, confirmPassword (topCollegeChoices is optional)
    2: 5, // parentFirstName, parentLastName, state, parentEmail, parentPhoneNumber  
    3: 3, // classRigor, universitiesWant, satActScores (optional)
    4: 4, // typeOfStudent, biggestStressor, parentWorry, registrationCode (all required now)
    5: 1, // classTime
    6: 1  // diagnosticTestDate
  }
  
  const filledFields = {
    1: [
      formData.firstName, formData.lastName, formData.email, formData.gender,
      formData.phoneNumber, formData.graduationYear, formData.highSchoolName, formData.currentGPA,
      formData.password, formData.confirmPassword
    ].filter(Boolean).length,
    2: [
      formData.parentFirstName, formData.parentLastName, formData.state,
      formData.parentEmail, formData.parentPhoneNumber
    ].filter(Boolean).length,
    3: [
      formData.classRigor, formData.universitiesWant
    ].filter(Boolean).length + (formData.satActScores ? 1 : 0),
    4: [
      formData.typeOfStudent, formData.biggestStressor, formData.parentWorry, formData.registrationCode
    ].filter(Boolean).length,
    5: [
      formData.classTime
    ].filter(Boolean).length,
    6: [
      formData.diagnosticTestDate
    ].filter(Boolean).length
  }
  
  return Math.round((filledFields[step] / totalFields[step]) * 100)
}