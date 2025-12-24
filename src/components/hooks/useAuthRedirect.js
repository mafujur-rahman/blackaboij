"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useAuthRedirect(requiredRole) {
  const router = useRouter();

  useEffect(() => {
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");

    const userRole = localStorage.getItem("user_role");

    if (!token || !userRole) {
      // Not logged in
      router.replace("/signin");
    } else if (requiredRole && userRole !== requiredRole) {
      // Wrong role
      router.replace("/"); 
    } else {
      // Correct role: do nothing, allow access
    }
  }, [router, requiredRole]);
}
