import { Suspense } from "react"
import InteractiveRegistrationForm from "@/components/registration/InteractiveRegistrationForm"

export const metadata = {
  title: "Student Registration - College Mastermind",
  description: "Register for College Mastermind program",
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-gray-50 flex items-center justify-center text-gray-500">
          Loading…
        </div>
      }
    >
      <InteractiveRegistrationForm />
    </Suspense>
  )
}