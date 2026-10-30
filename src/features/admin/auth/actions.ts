'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const STAFF_COOKIE_NAME = 'lotus_staff_session';

export async function loginAction(
  prevState: any,
  formData: FormData
): Promise<{ error?: string }> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = (formData.get('password') as string) || '';

  const validAdminEmail = (process.env.ADMIN_EMAIL || 'admin@lotus.eg').trim().toLowerCase();
  const validAdminPassword = process.env.ADMIN_PASSWORD || 'lotus2026';

  // Strict authentication: only allow valid admin credentials
  if (email && password && email === validAdminEmail && password === validAdminPassword) {
    const cookieStore = await cookies();
    cookieStore.set(STAFF_COOKIE_NAME, JSON.stringify({ email, role: 'staff', loggedAt: Date.now() }), {
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

export async function getStaffSession(): Promise<{ email: string; role: string } | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(STAFF_COOKIE_NAME);
  if (!cookie?.value) return null;

  try {
    return JSON.parse(cookie.value);
  } catch {
    return null;
  }
}
