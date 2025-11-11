import { Suspense } from 'react'
import StudentPasswordSetup from '@/components/auth/StudentPasswordSetup'

function StudentPasswordSetupContent() {
  return <StudentPasswordSetup />
}

export default function StudentSetupPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <StudentPasswordSetupContent />
      </Suspense>
    </div>
  )
}