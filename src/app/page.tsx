"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Workspace } from "@/features/projects/components/Workspace";

export default function HomePage() {
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Previne múltiplos redirecionamentos
    if (hasRedirectedRef.current) return;
    
    // Check if user has a last visited project
    const lastProjectId = localStorage.getItem('velura_last_project');
    if (lastProjectId) {
      hasRedirectedRef.current = true;
      
      // Debounce redirect para dar tempo da página carregar
      const timer = setTimeout(() => {
        router.push(`/project/${lastProjectId}`);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [router]);

  return <Workspace />;
}
