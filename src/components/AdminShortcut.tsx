'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Ctrl + Alt + . opens the hidden admin page (there are no visible links to it).
export function AdminShortcut() {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && (e.code === 'Period' || e.key === '.')) {
        e.preventDefault();
        router.push('/maccyadmin');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  return null;
}
