"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft, ChevronRight, Upload, Download, Check,
  AlertCircle, Users, School, FileText, X, Loader2
} from 'lucide-react'

const STEPS = [
  { id: 1, label: 'District Info', icon: School },
  { id: 2, label: 'Student Count', icon: Users },
  { id: 3, label: 'Entry Method', icon: FileText },
  { id: 4, label: 'Student Data', icon: Users },
  { id: 5, label: 'Review & Submit', icon: Check }
]

const emptyStudent = () => ({
  firstName: '', lastName: '', grade: '',
  highSchoolName: '', parentFirstName: '',
  parentLastName: '', parentEmail: ''
})

export default function DistrictRegistrationForm() {
  const searchParams = useSearchParams()
  const districtFromUrl = searchParams.get('district') || ''

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submissionResult, setSubmissionResult] = useState(null)

  // Step 1: District info
  const [districtInfo, setDistrictInfo] = useState({
    districtName: districtFromUrl,
    schoolName: '',
    representativeName: '',
    representativeRole: '',
    representativeEmail: '',
    representativePhone: '',
    notes: '',
    confirmationChecked: false
  })

  // Step 2: Student count
  const [studentCount, setStudentCount] = useState(10)

  // Step 3: Entry method
  const [entryMethod, setEntryMethod] = useState('manual')

  // Step 4: Student data
  const [students, setStudents] = useState([])
  const [csvFile, setCsvFile] = useState(null)
  const [csvValidation, setCsvValidation] = useState(null)
  const [validatingCsv, setValidatingCsv] = useState(false)
  const [csvDragActive, setCsvDragActive] = useState(false)
  const csvInputRef = useRef(null)

  useEffect(() => {
    if (entryMethod === 'manual') {
      setStudents(prev => {
        const arr = [...prev]
        while (arr.length < studentCount) arr.push(emptyStudent())
        return arr.slice(0, studentCount)
      })
    }
  }, [studentCount, entryMethod])

  const updateDistrictInfo = (field, value) => {
    setDistrictInfo(prev => ({ ...prev, [field]: value }))
  }

  const updateStudent = (index, field, value) => {
    setStudents(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const validateStep1 = () => {
    if (!districtInfo.districtName.trim()) { toast.error('District Name is required'); return false }
    if (!districtInfo.schoolName.trim()) { toast.error('School Name is required'); return false }
    if (!districtInfo.representativeName.trim()) { toast.error('Representative Name is required'); return false }
    if (!districtInfo.representativeEmail.trim()) { toast.error('Representative Email is required'); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(districtInfo.representativeEmail)) { toast.error('Invalid email format'); return false }
    return true
  }

  const validateStep2 = () => {
    if (studentCount < 10) { toast.error('Minimum 10 students required'); return false }
    return true
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    if (step === 3 && entryMethod === 'csv') {
      const n = csvValidation?.validCount ?? 0
      if (n < 10) {
        toast.error('Upload a CSV with at least 10 valid rows before continuing. Use the template if needed.')
        return
      }
    }
    if (step === 4 && entryMethod === 'csv') {
      const n = csvValidation?.validCount ?? 0
      if (n < 10) {
        toast.error('Your CSV must have at least 10 valid student rows.')
        return
      }
    }
    if (step === 4 && entryMethod === 'manual') {
      const filled = students.filter(
        (s) =>
          s.firstName?.trim() &&
          s.lastName?.trim() &&
          s.grade?.trim() &&
          s.parentFirstName?.trim() &&
          s.parentLastName?.trim() &&
          s.parentEmail?.trim()
      )
      if (filled.length < 10) {
        toast.error(`Complete at least 10 student rows (all required fields). Currently ${filled.length} complete.`)
        return
      }
    }
    setStep((prev) => Math.min(prev + 1, 5))
  }

  const handleBack = () => setStep(prev => Math.max(prev - 1, 1))

  const processCsvFile = useCallback(async (file) => {
    if (!file) return
    const name = file.name || ''
    if (!name.toLowerCase().endsWith('.csv')) {
      toast.error('Please choose a file ending in .csv')
      return
    }
    setCsvFile(file)
    setCsvValidation(null)
    setValidatingCsv(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/district/validate-csv', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.success) {
        setCsvValidation(data)
        if (data.validRows) {
          setStudents(data.validRows)
          setStudentCount(Math.max(data.validRows.length, 10))
        }
        if (data.invalidCount > 0) {
          toast.warning(`${data.invalidCount} invalid rows found. Valid rows will be imported.`)
        } else {
          toast.success(`${data.validCount} students loaded successfully`)
        }
      } else {
        toast.error(data.errors?.[0] || 'CSV validation failed')
        setCsvValidation({ error: data.errors })
      }
    } catch {
      toast.error('Failed to validate CSV file')
    } finally {
      setValidatingCsv(false)
    }
  }, [])

  const handleCsvInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) processCsvFile(file)
    e.target.value = ''
  }

  const handleCsvDrop = (e) => {
    e.preventDefault()
    setCsvDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processCsvFile(file)
  }

  const handleCsvDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setCsvDragActive(true)
  }

  const handleCsvDragLeave = () => {
    setCsvDragActive(false)
  }

  const clearCsv = () => {
    setCsvFile(null)
    setCsvValidation(null)
    setStudents([])
  }

  /** Shared UI: template link + drop zone + choose file (used on step 3 and step 4 for CSV path) */
  const renderCsvUploadArea = (opts = {}) => {
    const compact = opts.compact === true
    return (
    <div className={compact ? 'space-y-3' : 'space-y-6'}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <a
          href="/api/district/csv-template"
          download
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <Download className="w-4 h-4" /> Download CSV template
        </a>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto shrink-0"
          onClick={() => csvInputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose CSV file
        </Button>
      </div>

      <input
        ref={csvInputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={handleCsvInputChange}
      />

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            csvInputRef.current?.click()
          }
        }}
        onDragEnter={handleCsvDragOver}
        onDragOver={handleCsvDragOver}
        onDragLeave={handleCsvDragLeave}
        onDrop={handleCsvDrop}
        onClick={() => csvInputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors select-none ${
          csvDragActive
            ? 'border-blue-500 bg-blue-50/80'
            : 'border-gray-300 bg-gray-50/50 hover:border-blue-400 hover:bg-blue-50/30'
        }`}
      >
        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3 pointer-events-none" />
        <p className="font-medium text-gray-800 pointer-events-none">Drop your CSV here or click to browse</p>
        {!compact && (
          <p className="text-sm text-gray-500 mt-1 pointer-events-none">
            Required columns match the template (student names, grade, parent fields, parent email).
          </p>
        )}
      </div>

      {csvFile && (
        <div className="rounded-lg border bg-white p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-5 h-5 text-blue-600 shrink-0" />
              <span className="font-medium text-gray-800 truncate">{csvFile.name}</span>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); clearCsv() }} className="shrink-0 text-red-600 hover:text-red-700">
              <X className="w-4 h-4 mr-1" /> Remove
            </Button>
          </div>

          {validatingCsv && (
            <div className="flex items-center justify-center gap-2 text-blue-600 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Validating CSV…
            </div>
          )}

          {csvValidation && !csvValidation.error && (
            <div className="space-y-2 text-left text-sm">
              <div className="flex items-center gap-2 text-green-700">
                <Check className="w-4 h-4 shrink-0" />
                <span className="font-medium">{csvValidation.validCount} valid rows ready to submit</span>
              </div>
              {csvValidation.invalidCount > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-amber-700 mb-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="font-medium">{csvValidation.invalidCount} invalid rows (will be skipped)</span>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 max-h-40 overflow-y-auto text-xs text-amber-900">
                    {csvValidation.invalidRows?.map((row, i) => (
                      <div key={i} className="mb-1">
                        Row {row.rowNumber}: {row.errors.join(', ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {csvValidation?.error && (
            <div className="flex items-start gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{Array.isArray(csvValidation.error) ? csvValidation.error[0] : csvValidation.error}</span>
            </div>
          )}
        </div>
      )}
    </div>
    )
  }

  const handleSubmit = async () => {
    if (!districtInfo.confirmationChecked) {
      toast.error('Please confirm the information is accurate')
      return
    }

    const finalStudents = entryMethod === 'csv' && csvValidation?.validRows
      ? csvValidation.validRows
      : students

    if (finalStudents.length < 10) {
      toast.error('At least 10 valid students are required')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/district/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...districtInfo,
          districtSource: districtFromUrl || districtInfo.districtName,
          studentCount: finalStudents.length,
          submissionMethod: entryMethod,
          students: finalStudents
        })
      })

      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
        setSubmissionResult(data)
        toast.success('Registration submitted successfully!')
      } else {
        toast.error(data.errors?.[0] || 'Submission failed')
      }
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted && submissionResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#1a2d5a] flex items-center justify-center px-4 py-12">
        <Card className="max-w-lg w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your district scholarship nomination has been received. Our team will review the submission and prepare the student invitation packages.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 mb-6">
            <p className="text-sm"><span className="font-medium">District:</span> {submissionResult.submission?.districtName}</p>
            <p className="text-sm"><span className="font-medium">School:</span> {submissionResult.submission?.schoolName}</p>
            <p className="text-sm"><span className="font-medium">Students Submitted:</span> {submissionResult.validCount}</p>
            <p className="text-sm"><span className="font-medium">Registration Code:</span> <code className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{submissionResult.submission?.registrationCode}</code></p>
            {submissionResult.invalidRows?.length > 0 && (
              <p className="text-sm text-amber-600"><span className="font-medium">Invalid Rows:</span> {submissionResult.invalidRows.length} (skipped)</p>
            )}
          </div>
          <Button type="button" onClick={() => { window.location.href = '/district' }} className="bg-[#113076] hover:bg-[#1a4ba8]">
            Back to District Page
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#1a2d5a] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="1550+" className="h-12 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">District Scholarship Registration</h1>
          <p className="text-white/60">Nominate students for the 1550+ SAT Scholarship Program</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = step === s.id
            const isComplete = step > s.id
            return (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isActive ? 'bg-blue-600 text-white' :
                  isComplete ? 'bg-blue-900/50 text-blue-300' :
                  'bg-white/5 text-white/40'
                }`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`w-6 h-px mx-1 ${step > s.id ? 'bg-blue-400' : 'bg-white/20'}`} />}
              </div>
            )
          })}
        </div>

        <Card className="p-6 sm:p-8">
          {/* Step 1: District Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">District & Representative Information</h2>
                <p className="text-sm text-gray-500">Enter the district and school representative details.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="districtName">District Name *</Label>
                  <Input id="districtName" value={districtInfo.districtName}
                    onChange={e => updateDistrictInfo('districtName', e.target.value)}
                    placeholder="e.g., Los Angeles Unified" />
                </div>
                <div>
                  <Label htmlFor="schoolName">School Name *</Label>
                  <Input id="schoolName" value={districtInfo.schoolName}
                    onChange={e => updateDistrictInfo('schoolName', e.target.value)}
                    placeholder="e.g., Lincoln High School" />
                </div>
                <div>
                  <Label htmlFor="repName">Submitted By (Name) *</Label>
                  <Input id="repName" value={districtInfo.representativeName}
                    onChange={e => updateDistrictInfo('representativeName', e.target.value)}
                    placeholder="Full name" />
                </div>
                <div>
                  <Label htmlFor="repRole">Role / Title</Label>
                  <Input id="repRole" value={districtInfo.representativeRole}
                    onChange={e => updateDistrictInfo('representativeRole', e.target.value)}
                    placeholder="e.g., Counselor" />
                </div>
                <div>
                  <Label htmlFor="repEmail">Representative Email *</Label>
                  <Input id="repEmail" type="email" value={districtInfo.representativeEmail}
                    onChange={e => updateDistrictInfo('representativeEmail', e.target.value)}
                    placeholder="email@school.edu" />
                </div>
                <div>
                  <Label htmlFor="repPhone">Representative Phone</Label>
                  <Input id="repPhone" type="tel" value={districtInfo.representativePhone}
                    onChange={e => updateDistrictInfo('representativePhone', e.target.value)}
                    placeholder="(555) 123-4567" />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Optional Notes</Label>
                <textarea id="notes" value={districtInfo.notes}
                  onChange={e => updateDistrictInfo('notes', e.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px]"
                  placeholder="Any additional information..." />
              </div>
            </div>
          )}

          {/* Step 2: Student Count */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Number of Students</h2>
                <p className="text-sm text-gray-500">How many students will you be nominating? Minimum of 10 students required.</p>
              </div>

              <div className="max-w-xs">
                <Label htmlFor="studentCount">Number of Students *</Label>
                <Input id="studentCount" type="number" min={10} value={studentCount}
                  onChange={e => setStudentCount(Math.max(10, parseInt(e.target.value) || 10))}
                  className="text-2xl font-bold text-center h-14" />
                <p className="text-xs text-gray-400 mt-1">Minimum: 10 students. No maximum limit.</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  Based on your selection, the next step will show <strong>{studentCount}</strong> student information sections
                  that you will need to fill in manually or import via CSV.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Entry Method */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Data Entry Method</h2>
                <p className="text-sm text-gray-500">Choose how you'd like to provide student information.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setEntryMethod('manual')
                    setCsvFile(null)
                    setCsvValidation(null)
                    setCsvDragActive(false)
                  }}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    entryMethod === 'manual'
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <FileText className={`w-8 h-8 mb-3 ${entryMethod === 'manual' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <h3 className="font-semibold text-gray-900">Manual Entry</h3>
                  <p className="text-sm text-gray-500 mt-1">Fill in each student&apos;s information directly in the form.</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEntryMethod('csv')
                    setCsvFile(null)
                    setCsvValidation(null)
                    setCsvDragActive(false)
                    setStudents([])
                  }}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    entryMethod === 'csv'
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <Upload className={`w-8 h-8 mb-3 ${entryMethod === 'csv' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <h3 className="font-semibold text-gray-900">CSV Import</h3>
                  <p className="text-sm text-gray-500 mt-1">Upload a CSV file with all student data at once.</p>
                </button>
              </div>

              {entryMethod === 'csv' && (
                <div className="rounded-xl border border-blue-200 bg-white p-4 sm:p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Upload your student list</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Do this here before clicking Next. You need at least 10 valid rows.
                  </p>
                  {renderCsvUploadArea()}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Student Data */}
          {step === 4 && entryMethod === 'manual' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Student Information</h2>
                  <p className="text-sm text-gray-500">Enter details for each nominated student.</p>
                </div>
                <Badge variant="outline">{students.length} students</Badge>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {students.map((student, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        {index + 1}
                      </span>
                      Student {index + 1}
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <Label className="text-xs">First Name *</Label>
                        <Input value={student.firstName} placeholder="First name"
                          onChange={e => updateStudent(index, 'firstName', e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Last Name *</Label>
                        <Input value={student.lastName} placeholder="Last name"
                          onChange={e => updateStudent(index, 'lastName', e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Grade / Graduation Year *</Label>
                        <Input value={student.grade} placeholder="e.g., 11th or 2026"
                          onChange={e => updateStudent(index, 'grade', e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">High School Name</Label>
                        <Input value={student.highSchoolName} placeholder="High school name"
                          onChange={e => updateStudent(index, 'highSchoolName', e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Parent First Name *</Label>
                        <Input value={student.parentFirstName} placeholder="Parent first name"
                          onChange={e => updateStudent(index, 'parentFirstName', e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Parent Last Name *</Label>
                        <Input value={student.parentLastName} placeholder="Parent last name"
                          onChange={e => updateStudent(index, 'parentLastName', e.target.value)} />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        <Label className="text-xs">Parent / Guardian Email *</Label>
                        <Input type="email" value={student.parentEmail} placeholder="parent@email.com"
                          onChange={e => updateStudent(index, 'parentEmail', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && entryMethod === 'csv' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">CSV student list</h2>
                <p className="text-sm text-gray-500">
                  Change your file here if needed, then continue to review. You already uploaded on the previous step
                  — counts below update live.
                </p>
              </div>
              {renderCsvUploadArea({ compact: true })}
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Review & Submit</h2>
                <p className="text-sm text-gray-500">Please review all information before submitting.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">District Info</h3>
                  <p className="text-sm"><span className="text-gray-500">District:</span> {districtInfo.districtName}</p>
                  <p className="text-sm"><span className="text-gray-500">School:</span> {districtInfo.schoolName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">Representative</h3>
                  <p className="text-sm"><span className="text-gray-500">Name:</span> {districtInfo.representativeName}</p>
                  <p className="text-sm"><span className="text-gray-500">Email:</span> {districtInfo.representativeEmail}</p>
                  {districtInfo.representativeRole && <p className="text-sm"><span className="text-gray-500">Role:</span> {districtInfo.representativeRole}</p>}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">Submission Summary</h3>
                <p className="text-sm"><span className="text-gray-500">Entry Method:</span> {entryMethod === 'csv' ? 'CSV Import' : 'Manual Entry'}</p>
                <p className="text-sm"><span className="text-gray-500">Students:</span> {entryMethod === 'csv' ? csvValidation?.validCount || 0 : students.filter(s => s.firstName && s.lastName).length}</p>
              </div>

              {students.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <h3 className="font-semibold text-gray-700 text-sm">Student List Preview</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Student Name</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Grade</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Parent Email</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {students.filter(s => s.firstName || s.lastName).map((s, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                            <td className="px-3 py-2">{s.firstName} {s.lastName}</td>
                            <td className="px-3 py-2">{s.grade}</td>
                            <td className="px-3 py-2 text-gray-500">{s.parentEmail}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <label className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer">
                <input type="checkbox" checked={districtInfo.confirmationChecked}
                  onChange={e => updateDistrictInfo('confirmationChecked', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-blue-800">
                  I confirm that all information provided is accurate and I am authorized to submit this nomination on behalf of the school.
                </span>
              </label>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            ) : <div />}

            {step < 5 ? (
              <Button type="button" onClick={handleNext} className="bg-[#113076] hover:bg-[#1a4ba8]">
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={submitting}
                className="bg-green-600 hover:bg-green-700">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : <><Check className="w-4 h-4 mr-2" /> Submit Registration</>}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
