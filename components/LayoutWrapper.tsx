'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HeaderAd, FooterAd } from '@/components/AdSense';
import Analytics from '@/components/Analytics';
import CookieConsent from '@/components/CookieConsent';
import ScrollToTop from '@/components/ScrollToTop';
import XPToast from '@/components/XPToast';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // Admin routes: không hiển thị main header/footer
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <HeaderAd />
      <main className="flex-grow">{children}</main>
      <FooterAd />
      <Footer />
      <ScrollToTop />
      <CookieConsent />
      <Analytics />
      <XPToast />
    </>
  );
}

