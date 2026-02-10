'use client';

import { ReactNode } from 'react';
import { VisitorProvider } from '@/contexts/VisitorContext';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <VisitorProvider>
      {children}
    </VisitorProvider>
  );
}

