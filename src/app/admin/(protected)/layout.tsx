import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { logoutAction, getStaffSession } from '@/features/admin/auth/actions';

function StaffSessionBadge({ email }: { email: string }) {
  return (
    <div className="hidden sm:flex items-center gap-2 text-xs text-stone-300 border-r border-amber-900/50 pr-3 mr-1">
      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
      <span>{email}</span>
    </div>
  );
}

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getStaffSession();
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Admin Top Navigation */}
      <header className="bg-[#443000] text-white border-b border-amber-900/40 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 bg-white/10 p-1 rounded-lg">
                <Image
                  src="/brand/lotus_logo.png"
                  alt="لوتس"
                  fill
                  sizes="36px"
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white">لوتس</span>
                <span className="mr-2 text-[10px] bg-[#B68763] text-white px-2 py-0.5 rounded font-bold">
                  الإدارة
                </span>
              </div>
            </div>

            {/* Nav Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/admin/products"
                className="text-xs font-bold px-3 py-2 rounded-lg text-stone-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                المنتجات والأسعار
              </Link>
              <Link
                href="/admin/composer"
                className="text-xs font-bold px-3 py-2 rounded-lg text-stone-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                محرر صفحات المجلة (3×3)
              </Link>
              <Link
                href="/admin/publish"
                className="text-xs font-bold px-3 py-2 rounded-lg text-stone-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                النشر والإصدارات
              </Link>
            </nav>

            {/* Right Tools & User Profile */}
            <div className="flex items-center gap-3">
              <Link
                href="/magazine"
                target="_blank"
                className="text-xs font-bold bg-white/10 hover:bg-white/20 text-[#B68763] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>المجلة الحية</span>
                <svg className="w-3.5 h-3.5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>

              <StaffSessionBadge email={session.email} />

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-xs font-bold text-stone-300 hover:text-red-300 px-2 py-1 transition-colors"
                >
                  خروج
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
