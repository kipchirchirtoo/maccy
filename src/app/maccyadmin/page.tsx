'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import { AdminDashboard } from '@/components/AdminDashboard';

// Hidden admin page. The server decides who is signed in (httpOnly cookie);
// nothing here links to it from the public site.
export default function AdminPage() {
  const router = useRouter();
  const { setIsAdmin } = useShop();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch('/api/admin/session', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => alive && setIsAdmin(!!d.authenticated))
      .catch(() => alive && setIsAdmin(false))
      .finally(() => alive && setChecked(true));
    return () => {
      alive = false;
    };
  }, [setIsAdmin]);

  if (!checked) return <div className="min-h-screen bg-[#1c1719]" />;

  return <AdminDashboard isOpen onClose={() => router.push('/')} />;
}
