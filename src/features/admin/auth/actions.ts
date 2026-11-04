'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  STAFF_COOKIE_NAME,
  signSession,
  getStaffSession,
  requireStaffSession,
  StaffSession,
} from '@/lib/auth/session';

export type { StaffSession };
export { getStaffSession, requireStaffSession };

export async function loginAction(
  prevState: any,
  formData: FormData
): Promise<{ error?: string }> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = (formData.get('password') as string) || '';

  const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const configuredAdminPassword = process.env.ADMIN_PASSWORD;

  // Enforce environment configuration in production (fail closed)
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd && (!configuredAdminEmail || !configuredAdminPassword)) {
    console.error('[loginAction] ADMIN_EMAIL or ADMIN_PASSWORD is missing in production environment');
    return { error: 'تعذر التحقق من بيانات الدخول، يرجى مراجعة إعدادات الخادم' };
  }

  const validAdminEmail = (configuredAdminEmail || 'admin@lotus.eg').trim().toLowerCase();
  const validAdminPassword = configuredAdminPassword || 'lotus2026';

  // Strict authentication check
  if (email && password && email === validAdminEmail && password === validAdminPassword) {
    const token = await signSession({
      email,
      role: 'staff',
      loggedAt: Date.now(),
    });

    const cookieStore = await cookies();
    cookieStore.set(STAFF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    redirect('/admin/products');
  }

  return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(STAFF_COOKIE_NAME);
  redirect('/admin/login');
}
