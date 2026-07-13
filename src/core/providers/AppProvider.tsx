import type { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { NormalizePath } from '../routing/NormalizePath';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryProvider>
      <BrowserRouter>
        <NormalizePath>
          <AuthProvider>{children}</AuthProvider>
        </NormalizePath>
      </BrowserRouter>
    </QueryProvider>
  );
};
