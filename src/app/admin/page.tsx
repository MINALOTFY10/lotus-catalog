import { redirect } from 'next/navigation';
import { getStaffSession } from '@/features/admin/auth/actions';

export default async function AdminIndexPage() {
  const session = await getStaffSession();
  if (!session) {
    redirect('/admin/login');
  }
  redirect('/admin/products');
}
