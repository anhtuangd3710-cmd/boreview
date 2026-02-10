'use client';

import { useEffect } from 'react';

interface AdSenseProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdSense({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
}: AdSenseProps) {
  const adSenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (adSenseId) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [adSenseId]);

  // Don't render anything if no AdSense ID is configured
  if (!adSenseId) {
    return null;
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block' }}
      data-ad-client={adSenseId}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  );
}

// Pre-configured ad components for different placements
export function HeaderAd() {
  return (
    <div className="container mx-auto px-4 py-2">
      <AdSense slot="header-ad-slot" format="horizontal" className="min-h-[90px]" />
    </div>
  );
}

export function InArticleAd() {
  return (
    <div className="my-8">
      <AdSense slot="in-article-ad-slot" format="fluid" className="min-h-[250px]" />
    </div>
  );
}

export function SidebarAd() {
  return (
    <div className="sticky top-24">
      <AdSense slot="sidebar-ad-slot" format="vertical" className="min-h-[600px]" />
    </div>
  );
}

export function FooterAd() {
  return (
    <div className="container mx-auto px-4 py-4">
      <AdSense slot="footer-ad-slot" format="horizontal" className="min-h-[90px]" />
    </div>
  );
}

