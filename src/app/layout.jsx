import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/QueryProvider";
import LayoutContent from "@/components/LayoutContent";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  // make a lengthy title for 1550+

  title: "1550plus - SAT Prep, College Admissions, and Scholarships",
  description: "Join thousands of students on their journey to academic excellence with personalized college guidance and support.",
};  

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <LayoutContent>{children}</LayoutContent>
          <Toaster position="top-center" />
        </QueryProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
