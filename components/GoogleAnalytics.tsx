'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  gaId?: string;
}

export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const measurementId = gaId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  );
}

// Helper hook to track page views
export function usePageView(url: string, title: string) {
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: unknown }).gtag) {
    const gtag = (window as unknown as { gtag: (command: string, ...args: unknown[]) => void }).gtag;
    gtag('event', 'page_view', {
      page_title: title,
      page_location: url,
    });
  }
}

// Helper function to track custom events
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: unknown }).gtag) {
    const gtag = (window as unknown as { gtag: (command: string, ...args: unknown[]) => void }).gtag;
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Common event tracking helpers
export const analytics = {
  trackArticleRead: (articleTitle: string, articleSlug: string) => {
    trackEvent('article_read', 'engagement', articleTitle);
  },
  
  trackArticleShare: (platform: string, articleTitle: string) => {
    trackEvent('share', 'social', `${platform}: ${articleTitle}`);
  },
  
  trackComment: (articleSlug: string) => {
    trackEvent('comment', 'engagement', articleSlug);
  },
  
  trackReaction: (reactionType: string, articleSlug: string) => {
    trackEvent('reaction', 'engagement', `${reactionType}: ${articleSlug}`);
  },
  
  trackSearch: (searchQuery: string) => {
    trackEvent('search', 'navigation', searchQuery);
  },
  
  trackNewsletterSubscribe: () => {
    trackEvent('subscribe', 'newsletter', 'footer_form');
  },
  
  trackContactFormSubmit: () => {
    trackEvent('form_submit', 'contact', 'contact_page');
  },
  
  trackBookmark: (articleTitle: string) => {
    trackEvent('bookmark', 'engagement', articleTitle);
  },
  
  trackTimeOnPage: (seconds: number, articleSlug: string) => {
    trackEvent('time_on_page', 'engagement', articleSlug, seconds);
  },
};

