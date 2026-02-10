'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getLocalStorage } from '@/lib/utils';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function AnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = getLocalStorage<{ analytics: boolean } | null>('cookie-consent', null);
    setHasConsent(consent?.analytics || false);

    // Listen for consent changes
    const handleConsent = () => {
      const newConsent = getLocalStorage<{ analytics: boolean } | null>('cookie-consent', null);
      setHasConsent(newConsent?.analytics || false);
    };

    window.addEventListener('analytics-consent-granted', handleConsent);
    return () => window.removeEventListener('analytics-consent-granted', handleConsent);
  }, []);

  useEffect(() => {
    if (!hasConsent || !GA_MEASUREMENT_ID) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Track page view
    window.gtag?.('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }, [pathname, searchParams, hasConsent]);

  if (!GA_MEASUREMENT_ID || !hasConsent) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}

export default function Analytics() {
  return (
    <Suspense fallback={null}>
      <AnalyticsInner />
    </Suspense>
  );
}

// Custom event tracking
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Track scroll depth
export function useScrollTracking() {
  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    const tracked = new Set<number>();

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

      milestones.forEach((milestone) => {
        if (scrollPercent >= milestone && !tracked.has(milestone)) {
          tracked.add(milestone);
          trackEvent('scroll_depth', 'engagement', `${milestone}%`);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

// Track time on page
export function useTimeOnPage() {
  useEffect(() => {
    const startTime = Date.now();
    const intervals = [30, 60, 120, 300]; // seconds
    const tracked = new Set<number>();

    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      intervals.forEach((seconds) => {
        if (timeSpent >= seconds && !tracked.has(seconds)) {
          tracked.add(seconds);
          trackEvent('time_on_page', 'engagement', `${seconds}s`);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

