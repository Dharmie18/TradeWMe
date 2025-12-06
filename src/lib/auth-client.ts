"use client"
import { useEffect, useState } from "react"

// Simple auth client without better-auth dependency
export const authClient = {
  // Mock implementation for compatibility
  useSession: () => ({ data: null, isPending: false, error: null })
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  accountType: 'REAL' | 'DEMO';
  emailVerified: boolean;
}

export function useSession() {
   const [session, setSession] = useState<{ user: User } | null>(null);
   const [isPending, setIsPending] = useState(true);
   const [error, setError] = useState<any>(null);

   const refetch = async () => {
      setIsPending(true);
      setError(null);
      await fetchSession();
   };

   const fetchSession = async () => {
      try {
         const token = typeof window !== 'undefined' ? localStorage.getItem("bearer_token") : null;
         
         if (!token) {
            setSession(null);
            setIsPending(false);
            return;
         }

         const response = await fetch('/api/auth/mock-verify-token', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`,
            },
         });

         if (response.ok) {
            const data = await response.json();
            setSession({ user: data.user });
            setError(null);
         } else {
            // Token is invalid, remove it
            if (typeof window !== 'undefined') {
               localStorage.removeItem("bearer_token");
            }
            setSession(null);
         }
      } catch (err) {
         console.error('Session fetch error:', err);
         setSession(null);
         setError(err);
      } finally {
         setIsPending(false);
      }
   };

   useEffect(() => {
      fetchSession();
   }, []);

   return { data: session, isPending, error, refetch };
}