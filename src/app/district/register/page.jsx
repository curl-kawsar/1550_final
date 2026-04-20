import { Suspense } from "react";
import DistrictRegistrationForm from "@/components/district/DistrictRegistrationForm";

export const metadata = {
  title: "District Scholarship Registration - 1550+",
  description: "Register your district's scholarship nominees for the 1550+ SAT Preparation Program",
};

function DistrictRegisterFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#1a2d5a] flex items-center justify-center px-4">
      <p className="text-sm text-white/70">Loading registration…</p>
    </div>
  );
}

export default function DistrictRegisterPage() {
  return (
    <Suspense fallback={<DistrictRegisterFallback />}>
      <DistrictRegistrationForm />
    </Suspense>
  );
}
