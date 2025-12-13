"use client"

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/shared/navbar/Navbar";
import Footer from "@/components/shared/footer/Footer";
import { useMaintenanceStatus } from "@/hooks/useMaintenance";

export default function LayoutContent({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: maintenanceStatus } = useMaintenanceStatus();
  
  // Hide navbar and footer on registration page, admin panel, student dashboard, and maintenance page
  const hideNavbarAndFooter = pathname === "/register" || pathname.startsWith("/admin") || pathname === "/student-dashboard" || pathname === "/maintenance";

  // Check for maintenance mode and redirect
  useEffect(() => {
    if (
      maintenanceStatus?.isEnabled && 
      pathname !== "/maintenance" && 
      !pathname.startsWith("/admin") && 
      !pathname.startsWith("/api")
    ) {
      router.push("/maintenance");
    }
  }, [maintenanceStatus, pathname, router]);

  return (
    <>
      {!hideNavbarAndFooter && <Navbar />}
      <main className="min-h-screen">{children}</main>
      {!hideNavbarAndFooter && <Footer />}
    </>
  );
}