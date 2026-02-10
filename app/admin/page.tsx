import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    // Đã đăng nhập -> chuyển đến dashboard
    redirect('/admin/dashboard');
  } else {
    // Chưa đăng nhập -> chuyển đến trang login
    redirect('/admin/login');
  }
}

