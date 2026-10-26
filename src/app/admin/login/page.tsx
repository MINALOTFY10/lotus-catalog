'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { loginAction, quickDemoLoginAction } from '@/features/admin/auth/actions';

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await loginAction(null, formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    await quickDemoLoginAction();
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200 p-8 sm:p-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="relative w-16 h-16 mx-auto mb-3">
            <Image
              src="/brand/lotus_logo.png"
              alt="شعار لوتس"
              fill
              sizes="64px"
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-black text-[#443000]">لوحة إدارة كتالوج لوتس</h1>
          <p className="text-xs text-stone-500 mt-1">
            تسجيل دخول موظفي الإدارة لتعديل المنتجات وترتيب صفحات المجلة
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              البريد الإلكتروني
            </label>
            <input
              name="email"
              type="email"
              defaultValue="admin@lotus.eg"
              required
              placeholder="name@lotus.eg"
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 focus:outline-hidden focus:border-[#B68763] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              كلمة المرور
            </label>
            <input
              name="password"
              type="password"
              defaultValue="lotus2026"
              required
              placeholder="••••••••"
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 focus:outline-hidden focus:border-[#B68763] focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#443000] hover:bg-[#5c4205] text-white font-extrabold text-sm py-3 rounded-xl shadow-md transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>

        {/* Demo Fast Login */}
        <div className="mt-6 pt-6 border-t border-stone-200 text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-[#B68763]/15 hover:bg-[#B68763]/25 text-[#443000] font-bold text-xs py-2.5 rounded-xl transition-all border border-[#B68763]/30"
          >
            تسجيل دخول فوري للتطوير (Demo Staff)
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
          >
            ← العودة للموقع العام
          </Link>
        </div>
      </div>
    </div>
  );
}
