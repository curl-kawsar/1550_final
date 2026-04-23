import ClaimRegistrationForm from "@/components/registration/ClaimRegistrationForm"

export const metadata = {
  title: "Complete Your Registration - College Mastermind",
  description: "Complete your district-sponsored registration for College Mastermind",
}

export default async function ClaimPage({ params }) {
  const { token } = await params;
  return <ClaimRegistrationForm claimToken={token} />
}
